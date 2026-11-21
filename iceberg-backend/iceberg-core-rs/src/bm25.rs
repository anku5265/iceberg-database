use std::collections::{HashMap, HashSet};
use serde::{Deserialize, Serialize};
use serde_json::Value;

const BM25_K1: f32 = 1.5;
const BM25_B: f32 = 0.75;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Bm25Index {
    pub postings: HashMap<String, HashMap<u32, u32>>,
    pub doc_lengths: Vec<u32>,
    pub active_docs: usize,
    pub total_tokens: u64,
}

impl Bm25Index {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn clear(&mut self) {
        self.postings.clear();
        self.doc_lengths.clear();
        self.active_docs = 0;
        self.total_tokens = 0;
    }

    pub fn vocab_size(&self) -> usize {
        self.postings.len()
    }

    pub fn index_slot(&mut self, slot: u32, payload: &Value) {
        let idx = slot as usize;
        if idx >= self.doc_lengths.len() {
            self.doc_lengths.resize(idx + 1, 0);
        }

        let text = extract_searchable_text(payload);
        let tokens = tokenize_bm25(&text);
        if tokens.is_empty() {
            self.doc_lengths[idx] = 0;
            return;
        }

        let dl = tokens.len() as u32;
        self.doc_lengths[idx] = dl;
        self.active_docs += 1;
        self.total_tokens += dl as u64;

        let mut freqs: HashMap<String, u32> = HashMap::new();
        for tok in tokens {
            *freqs.entry(tok).or_insert(0) += 1;
        }
        for (term, tf) in freqs {
            self.postings.entry(term).or_default().insert(slot, tf);
        }
    }

    pub fn remove_slot(&mut self, slot: u32, old_payload: &Value) {
        let idx = slot as usize;
        if idx >= self.doc_lengths.len() {
            return;
        }
        let old_dl = self.doc_lengths[idx];
        if old_dl == 0 {
            return;
        }

        let text = extract_searchable_text(old_payload);
        let tokens = tokenize_bm25(&text);
        let mut unique: HashSet<String> = HashSet::new();
        for tok in tokens {
            unique.insert(tok);
        }
        for term in unique {
            let remove_term = if let Some(doc_map) = self.postings.get_mut(&term) {
                doc_map.remove(&slot);
                doc_map.is_empty()
            } else {
                false
            };
            if remove_term {
                self.postings.remove(&term);
            }
        }

        self.doc_lengths[idx] = 0;
        self.active_docs = self.active_docs.saturating_sub(1);
        self.total_tokens = self.total_tokens.saturating_sub(old_dl as u64);
    }

    /// Computes Lucene-style non-negative Okapi BM25 scores across matching non-deleted slots.
    pub fn search<F>(&self, query: &str, deleted: &[bool], mut allow_slot: F) -> Vec<(u32, f32)>
    where
        F: FnMut(u32) -> bool,
    {
        if self.active_docs == 0 {
            return Vec::new();
        }
        let q_tokens = tokenize_bm25(query);
        if q_tokens.is_empty() {
            return Vec::new();
        }

        // Deduplicate query terms while keeping query term weight
        let mut q_freqs: HashMap<String, f32> = HashMap::new();
        for qt in q_tokens {
            *q_freqs.entry(qt).or_insert(0.0) += 1.0;
        }

        let avg_dl = (self.total_tokens as f32 / (self.active_docs.max(1) as f32)).max(1.0);
        let n_docs = self.active_docs as f32;
        let mut scores: HashMap<u32, f32> = HashMap::new();

        for (term, q_weight) in q_freqs {
            let Some(doc_map) = self.postings.get(&term) else {
                continue;
            };
            let df = doc_map.len() as f32;
            if df <= 0.0 {
                continue;
            }
            // Lucene-style non-negative IDF: ln(1 + (N - df + 0.5) / (df + 0.5))
            let idf = (1.0 + (n_docs - df + 0.5) / (df + 0.5)).ln();

            for (&slot, &tf_u32) in doc_map {
                let s_idx = slot as usize;
                if s_idx >= deleted.len() || deleted[s_idx] || !allow_slot(slot) {
                    continue;
                }
                let dl = self.doc_lengths.get(s_idx).copied().unwrap_or(1).max(1) as f32;
                let tf = tf_u32 as f32;
                let denom = tf + BM25_K1 * (1.0 - BM25_B + BM25_B * (dl / avg_dl));
                let term_score = idf * ((tf * (BM25_K1 + 1.0)) / denom) * q_weight.sqrt();
                *scores.entry(slot).or_insert(0.0) += term_score;
            }
        }

        let mut ranked: Vec<(u32, f32)> = scores.into_iter().collect();
        ranked.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        ranked
    }
}

pub fn extract_searchable_text(payload: &Value) -> String {
    let Some(map) = payload.as_object() else {
        return String::new();
    };
    for key in ["text", "content", "page_content", "title"] {
        if let Some(s) = map.get(key).and_then(|v| v.as_str()) {
            if !s.is_empty() {
                return s.to_string();
            }
        }
    }
    String::new()
}

/// Compound-preserving tokenizer:
/// Emits both exact technical codes (`inv-9042-ax`, `err_hnsw_mmap_07`) AND their sub-parts (`inv`, `9042`, `ax`).
pub fn tokenize_bm25(text: &str) -> Vec<String> {
    let mut out = Vec::new();
    let lower = text.to_lowercase();

    for raw_chunk in lower.split(|c: char| {
        !(c.is_alphanumeric() || c == '-' || c == '_')
    }) {
        let trimmed = raw_chunk.trim_matches(|c: char| c == '-' || c == '_');
        if trimmed.is_empty() {
            continue;
        }
        if trimmed.contains('-') || trimmed.contains('_') {
            out.push(trimmed.to_string());
            for sub in trimmed.split(|c: char| c == '-' || c == '_') {
                if !sub.is_empty() && (sub.len() >= 2 || sub.chars().all(|ch| ch.is_ascii_digit())) {
                    out.push(sub.to_string());
                }
            }
        } else if trimmed.len() >= 2 || trimmed.chars().all(|ch| ch.is_ascii_digit()) {
            out.push(trimmed.to_string());
        }
    }

    out
}

/// Fuses Dense Vector candidates and BM25 Sparse candidates via Weighted RRF + Normalized Score Blend.
pub fn fuse_hybrid_rrf(
    dense_ranked: &[(u32, f32)],
    bm25_ranked: &[(u32, f32)],
    alpha: f32,
    top_k: usize,
) -> Vec<(u32, f32)> {
    let alpha = alpha.clamp(0.0, 1.0);

    // Pure Keyword Mode
    if alpha <= 0.02 {
        let max_bm = bm25_ranked.first().map(|x| x.1).unwrap_or(1.0).max(1e-6);
        return bm25_ranked
            .iter()
            .take(top_k)
            .map(|&(slot, bm)| {
                let norm = 0.5 * (bm / max_bm) + 0.5 * (bm / (bm + 1.5));
                (slot, norm.clamp(0.0001, 1.0))
            })
            .collect();
    }

    // Pure Semantic Mode
    if alpha >= 0.98 {
        return dense_ranked.iter().take(top_k).copied().collect();
    }

    let rrf_k = 60.0f32;
    let max_bm = bm25_ranked.first().map(|x| x.1).unwrap_or(1.0).max(1e-6);
    let max_dn = dense_ranked
        .first()
        .map(|x| x.1.max(0.0))
        .unwrap_or(1.0)
        .max(1e-6);

    let mut combined: HashMap<u32, f32> = HashMap::new();

    for (rank, &(slot, d_score)) in dense_ranked.iter().enumerate() {
        let rrf_part = 1.0 / (rrf_k + (rank as f32) + 1.0);
        let norm_d = (d_score.max(0.0) / max_dn).clamp(0.0, 1.0);
        // Scale RRF (max ~ 1/61) to [0, 1] range so final scores are intuitive [0, 1]
        let dense_contrib = alpha * (0.55 * (rrf_part * 61.0) + 0.45 * norm_d);
        *combined.entry(slot).or_insert(0.0) += dense_contrib;
    }

    for (rank, &(slot, b_score)) in bm25_ranked.iter().enumerate() {
        let rrf_part = 1.0 / (rrf_k + (rank as f32) + 1.0);
        let norm_b = (b_score / max_bm).clamp(0.0, 1.0);
        let kw_contrib = (1.0 - alpha) * (0.55 * (rrf_part * 61.0) + 0.45 * norm_b);
        *combined.entry(slot).or_insert(0.0) += kw_contrib;
    }

    let mut fused: Vec<(u32, f32)> = combined.into_iter().collect();
    fused.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    fused.truncate(top_k);
    fused
}
