use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU32, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use parking_lot::RwLock;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::bm25::{fuse_hybrid_rrf, Bm25Index};
use crate::distance::{
    apply_cognitive_decay, normalized_copy, similarity_score, validate_vector, DistanceMetric,
};
use crate::filter::{matches_filter, PayloadIndex};
use crate::hnsw::HnswIndex;
use crate::quantization::{QuantizationMode, VectorQuantizer};
use crate::storage::{
    CollectionManifest, CollectionSnapshot, CollectionStorage, WalPoint, WalRecord,
};

const AUTO_SNAPSHOT_WAL_THRESHOLD: usize = 2500;

#[inline]
pub fn now_unix_f64() -> f64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs_f64())
        .unwrap_or(0.0)
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateCollectionSpec {
    pub name: String,
    #[serde(default = "default_dim")]
    pub dimension: usize,
    #[serde(default = "default_metric")]
    pub metric: String,
    #[serde(default = "default_quantization")]
    pub quantization: String,
    #[serde(default = "default_m")]
    pub m: usize,
    #[serde(default = "default_ef_construction")]
    pub ef_construction: usize,
    #[serde(default = "default_ef_search")]
    pub ef_search: usize,
}

fn default_dim() -> usize {
    384
}
fn default_metric() -> String {
    "cosine".to_string()
}
fn default_quantization() -> String {
    "float32".to_string()
}
fn default_m() -> usize {
    16
}
fn default_ef_construction() -> usize {
    100
}
fn default_ef_search() -> usize {
    64
}

#[derive(Debug, Clone, Deserialize)]
pub struct PointInput {
    pub id: String,
    pub vector: Vec<f32>,
    #[serde(default)]
    pub payload: Option<Value>,
    #[serde(default)]
    pub metadata: Option<Value>,
    #[serde(default)]
    pub namespace: Option<String>,
    #[serde(default)]
    pub timestamp: Option<f64>,
    #[serde(default)]
    pub importance: Option<f32>,
}

#[derive(Debug, Clone, Serialize)]
pub struct PointOutput {
    pub id: String,
    pub payload: Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vector: Option<Vec<f32>>,
    pub namespace: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SearchSpec {
    #[serde(default)]
    pub vector: Option<Vec<f32>>,
    #[serde(default)]
    pub query_text: Option<String>,
    #[serde(default = "default_top_k")]
    pub top_k: usize,
    #[serde(default)]
    pub search_type: Option<String>,
    #[serde(default = "default_alpha")]
    pub alpha: f32,
    #[serde(default)]
    pub score_threshold: Option<f32>,
    #[serde(default)]
    pub filter: Option<Value>,
    #[serde(default)]
    pub namespace: Option<String>,
    #[serde(default)]
    pub use_cognitive_decay: bool,
    #[serde(default = "default_decay_lambda")]
    pub decay_lambda: f32,
    #[serde(default)]
    pub reinforce_access: bool,
    #[serde(default)]
    pub with_vectors: bool,
}

fn default_top_k() -> usize {
    5
}
fn default_alpha() -> f32 {
    0.5
}
fn default_decay_lambda() -> f32 {
    0.015
}

#[derive(Debug, Clone, Serialize)]
pub struct ScoredPointOutput {
    pub id: String,
    pub score: f32,
    pub payload: Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vector: Option<Vec<f32>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CollectionStats {
    pub name: String,
    pub status: String,
    pub engine: String,
    pub vector_count: usize,
    pub total_slots: usize,
    pub deleted_slots: usize,
    pub dimension: usize,
    pub metric: String,
    pub quantization: String,
    pub float32_ram_bytes: usize,
    pub quantized_ram_bytes: usize,
    pub compression_ratio: f32,
    pub disk_bytes: u64,
    pub bm25_vocab_terms: usize,
    pub wal_pending_ops: usize,
    pub namespaces: HashMap<String, usize>,
    pub created_at: f64,
}

pub struct IcebergCollection {
    pub manifest: CollectionManifest,
    pub id_to_slot: HashMap<String, u32>,
    pub slot_to_id: Vec<String>,
    pub flat_vectors: Vec<f32>,
    pub raw_vectors: Vec<f32>,
    pub payloads: Vec<Value>,
    pub timestamps: Vec<f64>,
    pub importances: Vec<f32>,
    pub access_counts: Vec<AtomicU32>,
    pub deleted: Vec<bool>,
    pub active_count: usize,
    pub quantizer: VectorQuantizer,
    pub payload_index: PayloadIndex,
    pub bm25: Bm25Index,
    pub hnsw: HnswIndex,
    pub storage: Option<CollectionStorage>,
}

impl IcebergCollection {
    pub fn new(manifest: CollectionManifest, storage: Option<CollectionStorage>) -> Self {
        let dim = manifest.dim;
        let metric = manifest.metric;
        let quant = manifest.quantization;
        let m = manifest.m;
        let efc = manifest.ef_construction;
        let efs = manifest.ef_search;

        Self {
            manifest,
            id_to_slot: HashMap::new(),
            slot_to_id: Vec::new(),
            flat_vectors: Vec::new(),
            raw_vectors: Vec::new(),
            payloads: Vec::new(),
            timestamps: Vec::new(),
            importances: Vec::new(),
            access_counts: Vec::new(),
            deleted: Vec::new(),
            active_count: 0,
            quantizer: VectorQuantizer::new(dim, quant),
            payload_index: PayloadIndex::new(),
            bm25: Bm25Index::new(),
            hnsw: HnswIndex::new(dim, metric, m, efc, efs),
            storage,
        }
    }

    pub fn from_snapshot(snap: CollectionSnapshot, storage: CollectionStorage) -> Self {
        let total = snap.slot_to_id.len();
        let mut id_to_slot = HashMap::with_capacity(total);
        let mut payloads = Vec::with_capacity(total);
        let mut payload_index = PayloadIndex::new();
        let mut bm25 = Bm25Index::new();
        let mut active_count = 0usize;

        for slot in 0..total {
            let val: Value = serde_json::from_str(&snap.payload_jsons[slot])
                .unwrap_or_else(|_| json!({}));
            let is_del = snap.deleted.get(slot).copied().unwrap_or(false);
            if !is_del {
                id_to_slot.insert(snap.slot_to_id[slot].clone(), slot as u32);
                payload_index.index_slot(slot as u32, &val);
                bm25.index_slot(slot as u32, &val);
                active_count += 1;
            }
            payloads.push(val);
        }

        let access_counts = snap
            .access_counts
            .into_iter()
            .map(AtomicU32::new)
            .collect();

        let raw_vectors = if snap.raw_vectors.len() == snap.flat_vectors.len() {
            snap.raw_vectors
        } else {
            snap.flat_vectors.clone()
        };

        Self {
            manifest: snap.manifest,
            id_to_slot,
            slot_to_id: snap.slot_to_id,
            flat_vectors: snap.flat_vectors,
            raw_vectors,
            payloads,
            timestamps: snap.timestamps,
            importances: snap.importances,
            access_counts,
            deleted: snap.deleted,
            active_count,
            quantizer: snap.quantizer,
            payload_index,
            bm25,
            hnsw: snap.hnsw,
            storage: Some(storage),
        }
    }

    pub fn to_snapshot(&self) -> CollectionSnapshot {
        let payload_jsons: Vec<String> = self
            .payloads
            .iter()
            .map(|v| serde_json::to_string(v).unwrap_or_else(|_| "{}".to_string()))
            .collect();
        let access_counts: Vec<u32> = self
            .access_counts
            .iter()
            .map(|a| a.load(Ordering::Relaxed))
            .collect();

        CollectionSnapshot {
            manifest: self.manifest.clone(),
            slot_to_id: self.slot_to_id.clone(),
            flat_vectors: self.flat_vectors.clone(),
            raw_vectors: self.raw_vectors.clone(),
            payload_jsons,
            timestamps: self.timestamps.clone(),
            importances: self.importances.clone(),
            access_counts,
            deleted: self.deleted.clone(),
            quantizer: self.quantizer.clone(),
            hnsw: self.hnsw.clone(),
        }
    }

    pub fn apply_wal_record(&mut self, record: WalRecord) -> Result<(), String> {
        match record {
            WalRecord::UpsertBatch(points) => {
                let inputs: Vec<PointInput> = points
                    .into_iter()
                    .map(|wp| {
                        let pay = serde_json::from_str(&wp.payload_json)
                            .unwrap_or_else(|_| json!({}));
                        PointInput {
                            id: wp.id,
                            vector: wp.vector,
                            payload: Some(pay),
                            metadata: None,
                            namespace: None,
                            timestamp: Some(wp.timestamp),
                            importance: Some(wp.importance),
                        }
                    })
                    .collect();
                let _ = self.upsert_internal(inputs, false, false)?;
            }
            WalRecord::DeleteIds(ids) => {
                let _ = self.delete_by_ids_internal(&ids, false)?;
            }
            WalRecord::ClearAll => {
                self.clear_internal(false)?;
            }
        }
        Ok(())
    }

    pub fn upsert_points(
        &mut self,
        points: Vec<PointInput>,
        sync_wal: bool,
    ) -> Result<(usize, usize), String> {
        self.upsert_internal(points, true, sync_wal)
    }

    fn upsert_internal(
        &mut self,
        points: Vec<PointInput>,
        write_wal: bool,
        sync_wal: bool,
    ) -> Result<(usize, usize), String> {
        if points.is_empty() {
            return Ok((0, 0));
        }

        let dim = self.manifest.dim;
        // Pre-validate entire batch atomically so partial invalid batches never mutate state
        for p in &points {
            if p.id.trim().is_empty() {
                return Err("Point ID cannot be empty".to_string());
            }
            validate_vector(&p.vector, dim)?;
        }

        let now = now_unix_f64();
        let mut inserted = 0usize;
        let mut updated = 0usize;
        let mut wal_points = if write_wal {
            Vec::with_capacity(points.len())
        } else {
            Vec::new()
        };

        for p in points {
            let pid = p.id.trim().to_string();
            let mut pay = match (p.payload, p.metadata) {
                (Some(Value::Object(mut m1)), Some(Value::Object(m2))) => {
                    for (k, v) in m2 {
                        m1.insert(k, v);
                    }
                    Value::Object(m1)
                }
                (Some(v), _) if v.is_object() => v,
                (_, Some(v)) if v.is_object() => v,
                _ => json!({}),
            };

            if let Some(ns) = p.namespace {
                if let Some(obj) = pay.as_object_mut() {
                    obj.insert("_namespace".to_string(), Value::String(ns));
                }
            } else if pay.get("_namespace").is_none() {
                if let Some(obj) = pay.as_object_mut() {
                    obj.insert("_namespace".to_string(), Value::String(String::new()));
                }
            }

            let ts = p
                .timestamp
                .or_else(|| pay.get("created_at").and_then(|v| v.as_f64()))
                .or_else(|| pay.get("timestamp").and_then(|v| v.as_f64()))
                .unwrap_or(now);

            let imp = p
                .importance
                .or_else(|| {
                    pay.get("importance")
                        .and_then(|v| v.as_f64())
                        .map(|x| x as f32)
                })
                .unwrap_or(0.5)
                .clamp(0.0, 1.0);

            let stored_vec = if self.manifest.metric == DistanceMetric::Cosine {
                normalized_copy(&p.vector)
            } else {
                p.vector.clone()
            };

            if write_wal {
                wal_points.push(WalPoint {
                    id: pid.clone(),
                    vector: p.vector.clone(),
                    payload_json: serde_json::to_string(&pay)
                        .unwrap_or_else(|_| "{}".to_string()),
                    timestamp: ts,
                    importance: imp,
                });
            }

            if let Some(&slot) = self.id_to_slot.get(&pid) {
                let idx = slot as usize;
                let was_deleted = self.deleted[idx];
                if !was_deleted {
                    let old_pay = &self.payloads[idx];
                    self.payload_index.remove_slot(slot, old_pay);
                    self.bm25.remove_slot(slot, old_pay);
                } else {
                    self.deleted[idx] = false;
                    self.active_count += 1;
                }

                let start = idx * dim;
                self.flat_vectors[start..start + dim].copy_from_slice(&stored_vec);
                self.raw_vectors[start..start + dim].copy_from_slice(&p.vector);
                self.payload_index.index_slot(slot, &pay);
                self.bm25.index_slot(slot, &pay);
                self.payloads[idx] = pay;
                self.timestamps[idx] = ts;
                self.importances[idx] = imp;
                self.quantizer.update_slot(idx, &stored_vec);
                self.hnsw.update_slot(slot, &self.flat_vectors, &self.deleted);
                updated += 1;
            } else {
                let slot = self.slot_to_id.len() as u32;
                self.id_to_slot.insert(pid.clone(), slot);
                self.slot_to_id.push(pid);
                self.flat_vectors.extend_from_slice(&stored_vec);
                self.raw_vectors.extend_from_slice(&p.vector);
                self.payload_index.index_slot(slot, &pay);
                self.bm25.index_slot(slot, &pay);
                self.payloads.push(pay);
                self.timestamps.push(ts);
                self.importances.push(imp);
                self.access_counts.push(AtomicU32::new(0));
                self.deleted.push(false);
                self.active_count += 1;

                self.quantizer.push_vector(&stored_vec);
                self.hnsw.insert_slot(slot, &self.flat_vectors, &self.deleted);
                inserted += 1;
            }
        }

        if write_wal && !wal_points.is_empty() {
            let should_snap = if let Some(ref mut st) = self.storage {
                st.append_wal(&WalRecord::UpsertBatch(wal_points), sync_wal)?;
                st.wal_ops_since_snap >= AUTO_SNAPSHOT_WAL_THRESHOLD
            } else {
                false
            };
            if should_snap {
                self.flush_snapshot()?;
            }
        }

        Ok((inserted, updated))
    }

    pub fn get_points(&self, ids: &[String], with_vectors: bool) -> Vec<PointOutput> {
        let dim = self.manifest.dim;
        let mut out = Vec::with_capacity(ids.len());
        for id in ids {
            if let Some(&slot) = self.id_to_slot.get(id) {
                let idx = slot as usize;
                if idx < self.deleted.len() && !self.deleted[idx] {
                    let pay = self.payloads[idx].clone();
                    let ns = pay
                        .get("_namespace")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();
                    let vec_opt = if with_vectors {
                        let start = idx * dim;
                        if start + dim <= self.raw_vectors.len() {
                            Some(self.raw_vectors[start..start + dim].to_vec())
                        } else {
                            Some(self.flat_vectors[start..start + dim].to_vec())
                        }
                    } else {
                        None
                    };
                    out.push(PointOutput {
                        id: self.slot_to_id[idx].clone(),
                        payload: pay,
                        vector: vec_opt,
                        namespace: ns,
                    });
                }
            }
        }
        out
    }

    pub fn delete_points(
        &mut self,
        ids: Option<&[String]>,
        filter: Option<&Value>,
        namespace: Option<&str>,
        delete_all: bool,
    ) -> Result<usize, String> {
        if delete_all && filter.is_none() && namespace.unwrap_or("").is_empty() && ids.is_none() {
            let removed = self.active_count;
            self.clear_internal(true)?;
            return Ok(removed);
        }

        let mut target_ids: Vec<String> = Vec::new();
        if let Some(explicit_ids) = ids {
            for id in explicit_ids {
                if self.id_to_slot.contains_key(id) {
                    target_ids.push(id.clone());
                }
            }
        }

        if filter.is_some() || !namespace.unwrap_or("").is_empty() {
            for slot in 0..self.slot_to_id.len() {
                if self.deleted[slot] {
                    continue;
                }
                if matches_filter(&self.payloads[slot], filter, namespace) {
                    let pid = self.slot_to_id[slot].clone();
                    if !target_ids.contains(&pid) {
                        target_ids.push(pid);
                    }
                }
            }
        }

        self.delete_by_ids_internal(&target_ids, true)
    }

    fn delete_by_ids_internal(&mut self, ids: &[String], write_wal: bool) -> Result<usize, String> {
        if ids.is_empty() {
            return Ok(0);
        }
        let mut deleted_ids = Vec::with_capacity(ids.len());
        for id in ids {
            if let Some(slot) = self.id_to_slot.remove(id) {
                let idx = slot as usize;
                if idx < self.deleted.len() && !self.deleted[idx] {
                    self.deleted[idx] = true;
                    let old_pay = &self.payloads[idx];
                    self.payload_index.remove_slot(slot, old_pay);
                    self.bm25.remove_slot(slot, old_pay);
                    self.active_count = self.active_count.saturating_sub(1);
                    deleted_ids.push(id.clone());
                }
            }
        }

        if write_wal && !deleted_ids.is_empty() {
            if let Some(ref mut st) = self.storage {
                st.append_wal(&WalRecord::DeleteIds(deleted_ids.clone()), false)?;
            }
        }
        Ok(deleted_ids.len())
    }

    pub fn clear_all(&mut self) -> Result<(), String> {
        self.clear_internal(true)
    }

    fn clear_internal(&mut self, write_wal: bool) -> Result<(), String> {
        self.id_to_slot.clear();
        self.slot_to_id.clear();
        self.flat_vectors.clear();
        self.raw_vectors.clear();
        self.payloads.clear();
        self.timestamps.clear();
        self.importances.clear();
        self.access_counts.clear();
        self.deleted.clear();
        self.active_count = 0;
        self.quantizer.clear();
        self.payload_index.clear();
        self.bm25.clear();
        self.hnsw.clear();

        if write_wal {
            let snap = self.to_snapshot();
            if let Some(ref mut st) = self.storage {
                st.append_wal(&WalRecord::ClearAll, false)?;
                st.write_snapshot_and_reset_wal(&snap)?;
            }
        }
        Ok(())
    }

    pub fn scroll(
        &self,
        limit: usize,
        offset: usize,
        with_vectors: bool,
        filter: Option<&Value>,
        namespace: Option<&str>,
    ) -> Vec<PointOutput> {
        let dim = self.manifest.dim;
        let cap_limit = limit.clamp(1, 10_000);
        let mut out = Vec::with_capacity(cap_limit.min(self.active_count));
        let mut seen = 0usize;

        for idx in 0..self.slot_to_id.len() {
            if self.deleted[idx] {
                continue;
            }
            let pay = &self.payloads[idx];
            if !matches_filter(pay, filter, namespace) {
                continue;
            }
            if seen < offset {
                seen += 1;
                continue;
            }
            let ns = pay
                .get("_namespace")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let vec_opt = if with_vectors {
                let start = idx * dim;
                if start + dim <= self.raw_vectors.len() {
                    Some(self.raw_vectors[start..start + dim].to_vec())
                } else {
                    Some(self.flat_vectors[start..start + dim].to_vec())
                }
            } else {
                None
            };
            out.push(PointOutput {
                id: self.slot_to_id[idx].clone(),
                payload: pay.clone(),
                vector: vec_opt,
                namespace: ns,
            });
            seen += 1;
            if out.len() >= cap_limit {
                break;
            }
        }
        out
    }

    pub fn search(&self, spec: &SearchSpec) -> Result<Vec<ScoredPointOutput>, String> {
        if self.active_count == 0 || spec.top_k == 0 {
            return Ok(Vec::new());
        }

        let dim = self.manifest.dim;
        let metric = self.manifest.metric;
        let top_k = spec.top_k.min(1000);
        let ns_opt = spec.namespace.as_deref().filter(|s| !s.is_empty());
        let flt_opt = spec.filter.as_ref();

        let mode = match spec.search_type.as_deref() {
            Some("semantic") | Some("dense") | Some("vector") => "semantic",
            Some("keyword") | Some("bm25") | Some("sparse") => "keyword",
            Some("hybrid") => "hybrid",
            _ => match (&spec.vector, &spec.query_text) {
                (Some(_), Some(t)) if !t.trim().is_empty() => "hybrid",
                (None, Some(_)) => "keyword",
                _ => "semantic",
            },
        };

        let effective_alpha = match mode {
            "semantic" => 1.0f32,
            "keyword" => 0.0f32,
            _ => spec.alpha.clamp(0.0, 1.0),
        };

        let q_vec_opt: Option<Vec<f32>> = if let Some(ref raw_q) = spec.vector {
            validate_vector(raw_q, dim)?;
            if metric == DistanceMetric::Cosine {
                Some(normalized_copy(raw_q))
            } else {
                Some(raw_q.clone())
            }
        } else {
            if effective_alpha > 0.02 {
                return Err("Search requires 'vector' when search_type is semantic or hybrid".to_string());
            }
            None
        };

        let fast_set = self.payload_index.fast_candidates(flt_opt, ns_opt);
        if let Some(ref fs) = fast_set {
            if fs.is_empty() {
                return Ok(Vec::new());
            }
        }

        let allow_slot = |slot: u32| -> bool {
            let idx = slot as usize;
            if idx >= self.deleted.len() || self.deleted[idx] {
                return false;
            }
            if let Some(ref fs) = fast_set {
                if !fs.contains(&slot) {
                    return false;
                }
            }
            matches_filter(&self.payloads[idx], flt_opt, ns_opt)
        };

        let fetch_k = if effective_alpha >= 0.98 && !spec.use_cognitive_decay {
            (top_k * 2).max(32)
        } else {
            (top_k * 6).max(64)
        };
        let hnsw_ef = if flt_opt.is_none() && ns_opt.is_none() {
            self.manifest.ef_search.max(top_k * 4)
        } else {
            self.manifest.ef_search.max(fetch_k * 2)
        };

        // 1. Dense / Quantized / HNSW Candidate Scoring
        let dense_ranked: Vec<(u32, f32)> = if effective_alpha > 0.02 {
            let q_vec = q_vec_opt.as_ref().ok_or("Missing query vector")?;

            // Choose optimal candidate pool:
            // - Indexed fast_set <= 2048 -> direct exact scan of matching slots
            // - Small collection <= 1024 -> exact scan (Rayon parallel if >= 2048 total slots)
            // - Large collection -> Multi-Layer HNSW Graph + filter fallback guarantee
            let candidate_slots: Vec<u32> = if let Some(ref fs) = fast_set {
                if fs.len() <= 2048 {
                    fs.iter()
                        .copied()
                        .filter(|&s| {
                            let idx = s as usize;
                            idx < self.deleted.len()
                                && !self.deleted[idx]
                                && matches_filter(&self.payloads[idx], flt_opt, ns_opt)
                        })
                        .collect()
                } else {
                    let mut hnsw_cands = self.hnsw.search_candidates(
                        q_vec,
                        hnsw_ef,
                        &self.flat_vectors,
                        &self.deleted,
                        allow_slot,
                    );
                    if hnsw_cands.len() < top_k {
                        hnsw_cands = fs
                            .iter()
                            .copied()
                            .filter(|&s| allow_slot(s))
                            .collect();
                    }
                    hnsw_cands
                }
            } else if self.active_count <= 1024 {
                (0..self.slot_to_id.len() as u32)
                    .filter(|&s| allow_slot(s))
                    .collect()
            } else {
                let mut hnsw_cands = self.hnsw.search_candidates(
                    q_vec,
                    hnsw_ef,
                    &self.flat_vectors,
                    &self.deleted,
                    allow_slot,
                );
                // If an unindexed selective filter rejected graph neighbors, guarantee recall via parallel scan
                if hnsw_cands.len() < top_k && flt_opt.is_some() {
                    hnsw_cands = (0..self.slot_to_id.len() as u32)
                        .into_par_iter()
                        .filter(|&s| allow_slot(s))
                        .collect();
                }
                hnsw_cands
            };

            self.score_and_rescore_dense(q_vec, &candidate_slots, fetch_k)
        } else {
            Vec::new()
        };

        // 2. Native Okapi BM25 Sparse Scoring
        let bm25_ranked: Vec<(u32, f32)> = if effective_alpha < 0.98 {
            if let Some(ref q_txt) = spec.query_text {
                if !q_txt.trim().is_empty() {
                    self.bm25.search(q_txt, &self.deleted, allow_slot)
                } else {
                    Vec::new()
                }
            } else {
                Vec::new()
            }
        } else {
            Vec::new()
        };

        // 3. Fuse Dense + Sparse (or pure Semantic / pure Keyword)
        let mut ranked = fuse_hybrid_rrf(
            &dense_ranked,
            &bm25_ranked,
            effective_alpha,
            if spec.use_cognitive_decay {
                fetch_k
            } else {
                top_k
            },
        );

        // 4. Optional Engine-Level Cognitive Memory Decay + Reinforcement
        if spec.use_cognitive_decay && !ranked.is_empty() {
            let now = now_unix_f64();
            for item in ranked.iter_mut() {
                let idx = item.0 as usize;
                let ts = self.timestamps.get(idx).copied().unwrap_or(now);
                let imp = self.importances.get(idx).copied().unwrap_or(0.5);
                let acc = self
                    .access_counts
                    .get(idx)
                    .map(|a| a.load(Ordering::Relaxed))
                    .unwrap_or(0);
                let tier = self.payloads[idx]
                    .get("memory_type")
                    .and_then(|v| v.as_str());
                item.1 = apply_cognitive_decay(
                    item.1,
                    ts,
                    now,
                    imp,
                    acc,
                    spec.decay_lambda,
                    tier,
                );
            }
            ranked.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
            ranked.truncate(top_k);
        }

        // 5. Score Threshold & Output Construction
        let thresh = spec.score_threshold.unwrap_or(0.0);
        let apply_thresh = thresh > 0.0 && effective_alpha >= 0.95;

        let mut results = Vec::with_capacity(ranked.len());
        for (slot, score) in ranked {
            if apply_thresh && score < thresh {
                continue;
            }
            let idx = slot as usize;
            if spec.reinforce_access {
                if let Some(counter) = self.access_counts.get(idx) {
                    counter.fetch_add(1, Ordering::Relaxed);
                }
            }
            let vec_opt = if spec.with_vectors {
                let start = idx * dim;
                if start + dim <= self.raw_vectors.len() {
                    Some(self.raw_vectors[start..start + dim].to_vec())
                } else {
                    Some(self.flat_vectors[start..start + dim].to_vec())
                }
            } else {
                None
            };
            results.push(ScoredPointOutput {
                id: self.slot_to_id[idx].clone(),
                score: (score * 10000.0).round() / 10000.0,
                payload: self.payloads[idx].clone(),
                vector: vec_opt,
            });
        }

        Ok(results)
    }

    fn score_and_rescore_dense(
        &self,
        q_vec: &[f32],
        candidate_slots: &[u32],
        fetch_k: usize,
    ) -> Vec<(u32, f32)> {
        if candidate_slots.is_empty() {
            return Vec::new();
        }
        let dim = self.manifest.dim;
        let metric = self.manifest.metric;
        let use_parallel = candidate_slots.len() >= 1024;

        match self.quantizer.mode {
            QuantizationMode::Float32 => {
                let mut scored: Vec<(u32, f32)> = if use_parallel {
                    candidate_slots
                        .par_iter()
                        .map(|&s| {
                            let st = (s as usize) * dim;
                            let sc = similarity_score(
                                metric,
                                q_vec,
                                &self.flat_vectors[st..st + dim],
                            );
                            (s, sc)
                        })
                        .collect()
                } else {
                    candidate_slots
                        .iter()
                        .map(|&s| {
                            let st = (s as usize) * dim;
                            let sc = similarity_score(
                                metric,
                                q_vec,
                                &self.flat_vectors[st..st + dim],
                            );
                            (s, sc)
                        })
                        .collect()
                };
                scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
                scored.truncate(fetch_k);
                scored
            }
            QuantizationMode::Sq8 => {
                let q_sum: f32 = q_vec.iter().sum();
                let oversample = (fetch_k * 3).max(64);
                let mut approx: Vec<(u32, f32)> = if use_parallel {
                    candidate_slots
                        .par_iter()
                        .map(|&s| {
                            (
                                s,
                                self.quantizer.score_sq8_slot(metric, s as usize, q_vec, q_sum),
                            )
                        })
                        .collect()
                } else {
                    candidate_slots
                        .iter()
                        .map(|&s| {
                            (
                                s,
                                self.quantizer.score_sq8_slot(metric, s as usize, q_vec, q_sum),
                            )
                        })
                        .collect()
                };
                approx.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
                approx.truncate(oversample);

                // Exact Float32 Rescoring on oversampled shortlist
                let mut rescored: Vec<(u32, f32)> = approx
                    .into_iter()
                    .map(|(s, _)| {
                        let st = (s as usize) * dim;
                        (
                            s,
                            similarity_score(metric, q_vec, &self.flat_vectors[st..st + dim]),
                        )
                    })
                    .collect();
                rescored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
                rescored.truncate(fetch_k);
                rescored
            }
            QuantizationMode::Binary => {
                let q_words = self.quantizer.encode_query_binary(q_vec);
                let oversample = (fetch_k * 4).max(96);
                let mut approx: Vec<(u32, f32)> = if use_parallel {
                    candidate_slots
                        .par_iter()
                        .map(|&s| (s, self.quantizer.score_binary_slot(s as usize, &q_words)))
                        .collect()
                } else {
                    candidate_slots
                        .iter()
                        .map(|&s| (s, self.quantizer.score_binary_slot(s as usize, &q_words)))
                        .collect()
                };
                approx.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
                approx.truncate(oversample);

                // Exact Float32 Rescoring on oversampled shortlist
                let mut rescored: Vec<(u32, f32)> = approx
                    .into_iter()
                    .map(|(s, _)| {
                        let st = (s as usize) * dim;
                        (
                            s,
                            similarity_score(metric, q_vec, &self.flat_vectors[st..st + dim]),
                        )
                    })
                    .collect();
                rescored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
                rescored.truncate(fetch_k);
                rescored
            }
        }
    }

    pub fn flush_snapshot(&mut self) -> Result<(), String> {
        let snap = self.to_snapshot();
        if let Some(ref mut st) = self.storage {
            st.write_snapshot_and_reset_wal(&snap)?;
        }
        Ok(())
    }

    pub fn stats(&self) -> CollectionStats {
        let total_slots = self.slot_to_id.len();
        let deleted_slots = total_slots.saturating_sub(self.active_count);
        let f32_ram = self.active_count * self.manifest.dim * 4;
        let q_ram = self.quantizer.quantized_ram_bytes(self.active_count);
        let ratio = (self.quantizer.compression_ratio() * 100.0).round() / 100.0;
        let disk = self.storage.as_ref().map(|s| s.disk_bytes()).unwrap_or(0);
        let wal_ops = self
            .storage
            .as_ref()
            .map(|s| s.wal_ops_since_snap)
            .unwrap_or(0);

        CollectionStats {
            name: self.manifest.name.clone(),
            status: "green".to_string(),
            engine: "iceberg-core-rs/1.0.0".to_string(),
            vector_count: self.active_count,
            total_slots,
            deleted_slots,
            dimension: self.manifest.dim,
            metric: self.manifest.metric.as_str().to_string(),
            quantization: self.manifest.quantization.as_str().to_string(),
            float32_ram_bytes: f32_ram,
            quantized_ram_bytes: q_ram,
            compression_ratio: ratio,
            disk_bytes: disk,
            bm25_vocab_terms: self.bm25.vocab_size(),
            wal_pending_ops: wal_ops,
            namespaces: self.payload_index.namespace_counts(&self.deleted),
            created_at: self.manifest.created_at,
        }
    }
}

pub struct IcebergEngine {
    pub data_dir: PathBuf,
    pub started_at: f64,
    pub collections: RwLock<HashMap<String, Arc<RwLock<IcebergCollection>>>>,
    pub total_queries: AtomicU64,
    pub total_upserts: AtomicU64,
    pub total_search_micros: AtomicU64,
    pub crc_wal_recoveries: AtomicU64,
}

impl IcebergEngine {
    pub fn open(data_dir: PathBuf) -> Result<Arc<Self>, String> {
        fs::create_dir_all(&data_dir)
            .map_err(|e| format!("Failed creating engine data_dir {:?}: {}", data_dir, e))?;

        let mut map: HashMap<String, Arc<RwLock<IcebergCollection>>> = HashMap::new();
        let mut recoveries = 0u64;

        if let Ok(entries) = fs::read_dir(&data_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() && path.join("manifest.json").exists() {
                    let (manifest, storage) = CollectionStorage::open_existing_dir(path)?;
                    let mut col = match storage.load_snapshot()? {
                        Some(snap) => IcebergCollection::from_snapshot(snap, storage),
                        None => IcebergCollection::new(manifest, Some(storage)),
                    };
                    if let Some(ref mut st) = col.storage {
                        let (wal_records, healed) = st.read_and_heal_wal()?;
                        if healed {
                            recoveries += 1;
                        }
                        for rec in wal_records {
                            col.apply_wal_record(rec)?;
                        }
                    }
                    map.insert(col.manifest.name.clone(), Arc::new(RwLock::new(col)));
                }
            }
        }

        Ok(Arc::new(Self {
            data_dir,
            started_at: now_unix_f64(),
            collections: RwLock::new(map),
            total_queries: AtomicU64::new(0),
            total_upserts: AtomicU64::new(0),
            total_search_micros: AtomicU64::new(0),
            crc_wal_recoveries: AtomicU64::new(recoveries),
        }))
    }

    /// Creates a collection. Returns `Ok(true)` if newly created, `Ok(false)` if already exists.
    pub fn create_collection(&self, spec: CreateCollectionSpec) -> Result<bool, String> {
        let name = spec.name.trim().to_string();
        if name.is_empty() {
            return Err("Collection name cannot be empty".to_string());
        }
        if spec.dimension == 0 || spec.dimension > 8192 {
            return Err(format!(
                "Invalid dimension {}: must be between 1 and 8192",
                spec.dimension
            ));
        }

        let metric = DistanceMetric::from_str_flexible(&spec.metric)?;
        let quantization = QuantizationMode::from_str_flexible(&spec.quantization)?;

        let mut cols = self.collections.write();
        if cols.contains_key(&name) {
            return Ok(false);
        }

        let manifest = CollectionManifest {
            name: name.clone(),
            dim: spec.dimension,
            metric,
            quantization,
            m: spec.m,
            ef_construction: spec.ef_construction,
            ef_search: spec.ef_search,
            created_at: now_unix_f64(),
        };

        let storage = CollectionStorage::open_or_create(&self.data_dir, &manifest)?;
        let col = IcebergCollection::new(manifest, Some(storage));
        cols.insert(name, Arc::new(RwLock::new(col)));
        Ok(true)
    }

    pub fn get_collection(&self, name: &str) -> Option<Arc<RwLock<IcebergCollection>>> {
        self.collections.read().get(name.trim()).cloned()
    }

    pub fn list_collections(&self) -> Vec<CollectionStats> {
        let handles: Vec<Arc<RwLock<IcebergCollection>>> =
            self.collections.read().values().cloned().collect();
        let mut out: Vec<CollectionStats> = handles.into_iter().map(|h| h.read().stats()).collect();
        out.sort_by(|a, b| a.name.cmp(&b.name));
        out
    }

    pub fn delete_collection(&self, name: &str) -> Result<bool, String> {
        let removed = self.collections.write().remove(name.trim());
        let Some(col_arc) = removed else {
            return Ok(false);
        };
        let mut col = col_arc.write();
        if let Some(st) = col.storage.take() {
            st.delete_collection_dir()?;
        }
        Ok(true)
    }

    pub fn rename_collection(&self, old_name: &str, new_name: &str) -> Result<usize, String> {
        let old_clean = old_name.trim().to_string();
        let new_clean = new_name.trim().to_string();
        if new_clean.is_empty() {
            return Err("New collection name cannot be empty".to_string());
        }

        let mut cols = self.collections.write();
        if !cols.contains_key(&old_clean) {
            return Err(format!("Collection '{}' not found", old_clean));
        }
        if cols.contains_key(&new_clean) {
            return Err(format!("Collection '{}' already exists", new_clean));
        }

        let col_arc = cols.remove(&old_clean).ok_or("Collection missing")?;
        let count = {
            let mut col = col_arc.write();
            col.manifest.name = new_clean.clone();
            let updated_manifest = col.manifest.clone();
            if let Some(ref mut st) = col.storage {
                st.rename_collection_dir(&self.data_dir, &updated_manifest)?;
            }
            col.active_count
        };
        cols.insert(new_clean, col_arc);
        Ok(count)
    }

    pub fn flush_all(&self) -> Result<usize, String> {
        let handles: Vec<Arc<RwLock<IcebergCollection>>> =
            self.collections.read().values().cloned().collect();
        let mut flushed = 0usize;
        for h in handles {
            h.write().flush_snapshot()?;
            flushed += 1;
        }
        Ok(flushed)
    }

    pub fn prometheus_metrics(&self) -> String {
        let stats = self.list_collections();
        let total_cols = stats.len();
        let total_vecs: usize = stats.iter().map(|s| s.vector_count).sum();
        let total_ram: usize = stats.iter().map(|s| s.quantized_ram_bytes).sum();
        let total_disk: u64 = stats.iter().map(|s| s.disk_bytes).sum();
        let queries = self.total_queries.load(Ordering::Relaxed);
        let upserts = self.total_upserts.load(Ordering::Relaxed);
        let search_us = self.total_search_micros.load(Ordering::Relaxed);
        let avg_ms = if queries > 0 {
            (search_us as f64 / queries as f64) / 1000.0
        } else {
            0.0
        };
        let recoveries = self.crc_wal_recoveries.load(Ordering::Relaxed);
        let uptime = (now_unix_f64() - self.started_at).max(0.0) as u64;

        let mut buf = String::with_capacity(2048);
        buf.push_str("# HELP iceberg_engine_uptime_seconds Native Rust engine uptime in seconds\n");
        buf.push_str("# TYPE iceberg_engine_uptime_seconds gauge\n");
        buf.push_str(&format!("iceberg_engine_uptime_seconds {}\n", uptime));

        buf.push_str("# HELP iceberg_engine_collections_total Active collections count\n");
        buf.push_str("# TYPE iceberg_engine_collections_total gauge\n");
        buf.push_str(&format!("iceberg_engine_collections_total {}\n", total_cols));

        buf.push_str("# HELP iceberg_engine_vectors_total Total active vectors across collections\n");
        buf.push_str("# TYPE iceberg_engine_vectors_total gauge\n");
        buf.push_str(&format!("iceberg_engine_vectors_total {}\n", total_vecs));

        buf.push_str("# HELP iceberg_engine_queries_total Total vector/hybrid search queries executed\n");
        buf.push_str("# TYPE iceberg_engine_queries_total counter\n");
        buf.push_str(&format!("iceberg_engine_queries_total {}\n", queries));

        buf.push_str("# HELP iceberg_engine_upserts_total Total vector points upserted\n");
        buf.push_str("# TYPE iceberg_engine_upserts_total counter\n");
        buf.push_str(&format!("iceberg_engine_upserts_total {}\n", upserts));

        buf.push_str("# HELP iceberg_engine_search_latency_ms_avg Average search latency in ms\n");
        buf.push_str("# TYPE iceberg_engine_search_latency_ms_avg gauge\n");
        buf.push_str(&format!("iceberg_engine_search_latency_ms_avg {:.4}\n", avg_ms));

        buf.push_str("# HELP iceberg_engine_quantized_ram_bytes Active vector index RAM usage\n");
        buf.push_str("# TYPE iceberg_engine_quantized_ram_bytes gauge\n");
        buf.push_str(&format!("iceberg_engine_quantized_ram_bytes {}\n", total_ram));

        buf.push_str("# HELP iceberg_engine_disk_bytes Total WAL + Snapshot disk bytes\n");
        buf.push_str("# TYPE iceberg_engine_disk_bytes gauge\n");
        buf.push_str(&format!("iceberg_engine_disk_bytes {}\n", total_disk));

        buf.push_str("# HELP iceberg_engine_wal_crc_recoveries_total Self-healed torn WAL frames\n");
        buf.push_str("# TYPE iceberg_engine_wal_crc_recoveries_total counter\n");
        buf.push_str(&format!("iceberg_engine_wal_crc_recoveries_total {}\n", recoveries));

        buf
    }
}
