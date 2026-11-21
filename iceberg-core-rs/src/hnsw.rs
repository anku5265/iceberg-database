use std::cmp::Ordering;
use std::collections::BinaryHeap;
use rand::Rng;
use serde::{Deserialize, Serialize};
use crate::distance::{hnsw_distance, DistanceMetric};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HnswNode {
    pub neighbors: Vec<Vec<u32>>,
}

#[derive(Debug, Clone, Copy)]
struct DistSlot {
    dist: f32,
    slot: u32,
}

impl PartialEq for DistSlot {
    fn eq(&self, other: &Self) -> bool {
        self.slot == other.slot && self.dist == other.dist
    }
}
impl Eq for DistSlot {}

// Max-heap by distance (largest distance at top -> worst candidate in beam)
impl Ord for DistSlot {
    fn cmp(&self, other: &Self) -> Ordering {
        self.dist
            .partial_cmp(&other.dist)
            .unwrap_or(Ordering::Equal)
    }
}
impl PartialOrd for DistSlot {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

// Min-heap wrapper (smallest distance at top -> closest candidate to expand next)
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct MinDistSlot(DistSlot);

impl Ord for MinDistSlot {
    fn cmp(&self, other: &Self) -> Ordering {
        other.0.cmp(&self.0)
    }
}
impl PartialOrd for MinDistSlot {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HnswIndex {
    pub dim: usize,
    pub metric: DistanceMetric,
    pub m: usize,
    pub m0: usize,
    pub ef_construction: usize,
    pub ef_search: usize,
    pub level_mult: f32,
    pub entry_point: Option<u32>,
    pub max_level: usize,
    pub nodes: Vec<HnswNode>,
}

impl HnswIndex {
    pub fn new(
        dim: usize,
        metric: DistanceMetric,
        m: usize,
        ef_construction: usize,
        ef_search: usize,
    ) -> Self {
        let m_clean = m.clamp(4, 64);
        let level_mult = 1.0 / (m_clean as f32).ln();
        Self {
            dim,
            metric,
            m: m_clean,
            m0: m_clean * 2,
            ef_construction: ef_construction.clamp(16, 512),
            ef_search: ef_search.clamp(16, 512),
            level_mult,
            entry_point: None,
            max_level: 0,
            nodes: Vec::new(),
        }
    }

    pub fn clear(&mut self) {
        self.entry_point = None;
        self.max_level = 0;
        self.nodes.clear();
    }

    fn random_level(&self) -> usize {
        let mut rng = rand::thread_rng();
        let u: f32 = rng.gen::<f32>().clamp(1e-6, 0.999_999);
        ((-u.ln() * self.level_mult) as usize).min(12)
    }

    #[inline]
    fn vec_slice<'a>(&self, flat_vectors: &'a [f32], slot: u32) -> &'a [f32] {
        let start = (slot as usize) * self.dim;
        &flat_vectors[start..start + self.dim]
    }

    pub fn insert_slot(&mut self, slot: u32, flat_vectors: &[f32], deleted: &[bool]) {
        let idx = slot as usize;
        let level = self.random_level();
        let new_node = HnswNode {
            neighbors: vec![Vec::new(); level + 1],
        };

        if idx == self.nodes.len() {
            self.nodes.push(new_node);
        } else if idx < self.nodes.len() {
            self.nodes[idx] = new_node;
        } else {
            self.nodes.resize(
                idx + 1,
                HnswNode {
                    neighbors: vec![Vec::new(); 1],
                },
            );
            self.nodes[idx] = HnswNode {
                neighbors: vec![Vec::new(); level + 1],
            };
        }

        let Some(mut curr_ep) = self.entry_point else {
            self.entry_point = Some(slot);
            self.max_level = level;
            return;
        };

        if curr_ep == slot {
            return;
        }

        let q_vec = self.vec_slice(flat_vectors, slot);
        let mut curr_dist = hnsw_distance(
            self.metric,
            q_vec,
            self.vec_slice(flat_vectors, curr_ep),
        );

        // Phase 1: Greedy zoom down upper layers above `level`
        if self.max_level > level {
            for lc in ((level + 1)..=self.max_level).rev() {
                let mut changed = true;
                while changed {
                    changed = false;
                    if let Some(node) = self.nodes.get(curr_ep as usize) {
                        if let Some(nbrs) = node.neighbors.get(lc) {
                            for &nb in nbrs {
                                if nb == slot || (nb as usize) >= self.nodes.len() {
                                    continue;
                                }
                                let d = hnsw_distance(
                                    self.metric,
                                    q_vec,
                                    self.vec_slice(flat_vectors, nb),
                                );
                                if d < curr_dist {
                                    curr_dist = d;
                                    curr_ep = nb;
                                    changed = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Phase 2: Connect bidirectionally from min(level, max_level) down to 0
        let top_connect = level.min(self.max_level);
        for lc in (0..=top_connect).rev() {
            let max_m = if lc == 0 { self.m0 } else { self.m };
            let candidates = self.search_layer(
                q_vec,
                curr_ep,
                self.ef_construction,
                lc,
                flat_vectors,
            );
            if let Some(closest) = candidates.first() {
                curr_ep = closest.slot;
            }

            let selected: Vec<u32> = candidates
                .into_iter()
                .filter(|c| c.slot != slot && !deleted.get(c.slot as usize).copied().unwrap_or(false))
                .take(max_m)
                .map(|c| c.slot)
                .collect();

            self.nodes[idx].neighbors[lc] = selected.clone();

            // Add reverse edges with amortized closest-M pruning (avoids O(M^2) recompute on every single edge)
            let prune_trigger = max_m + 8;
            for nb in selected {
                let nb_idx = nb as usize;
                if nb_idx < self.nodes.len() && lc < self.nodes[nb_idx].neighbors.len() {
                    let list_len = {
                        let nb_list = &mut self.nodes[nb_idx].neighbors[lc];
                        if !nb_list.contains(&slot) {
                            nb_list.push(slot);
                        }
                        nb_list.len()
                    };
                    if list_len > prune_trigger {
                        let nb_vec = self.vec_slice(flat_vectors, nb);
                        let mut scored: Vec<DistSlot> = self.nodes[nb_idx].neighbors[lc]
                            .iter()
                            .copied()
                            .map(|cand| DistSlot {
                                dist: hnsw_distance(
                                    self.metric,
                                    nb_vec,
                                    self.vec_slice(flat_vectors, cand),
                                ),
                                slot: cand,
                            })
                            .collect();
                        scored.sort_by(|a, b| a.cmp(b));
                        scored.truncate(max_m);
                        self.nodes[nb_idx].neighbors[lc] =
                            scored.into_iter().map(|x| x.slot).collect();
                    }
                }
            }
        }

        if level > self.max_level {
            self.max_level = level;
            self.entry_point = Some(slot);
        }
    }

    pub fn update_slot(&mut self, slot: u32, flat_vectors: &[f32], deleted: &[bool]) {
        let idx = slot as usize;
        if idx >= self.nodes.len() {
            self.insert_slot(slot, flat_vectors, deleted);
            return;
        }
        // Keep existing graph links intact while refreshing Layer-0 neighborhood for updated vector
        if let Some(ep) = self.entry_point {
            if ep != slot {
                let q_vec = self.vec_slice(flat_vectors, slot);
                let candidates =
                    self.search_layer(q_vec, ep, self.ef_construction, 0, flat_vectors);
                let selected: Vec<u32> = candidates
                    .into_iter()
                    .filter(|c| c.slot != slot && !deleted.get(c.slot as usize).copied().unwrap_or(false))
                    .take(self.m0)
                    .map(|c| c.slot)
                    .collect();
                if !self.nodes[idx].neighbors.is_empty() {
                    self.nodes[idx].neighbors[0] = selected;
                }
            }
        }
    }

    fn search_layer(
        &self,
        query: &[f32],
        entry: u32,
        ef: usize,
        level: usize,
        flat_vectors: &[f32],
    ) -> Vec<DistSlot> {
        let n_nodes = self.nodes.len();
        let mut visited: Vec<u8> = vec![0u8; n_nodes];
        let mut candidates: BinaryHeap<MinDistSlot> = BinaryHeap::with_capacity(ef * 2);
        let mut results: BinaryHeap<DistSlot> = BinaryHeap::with_capacity(ef + 1);

        let d0 = hnsw_distance(self.metric, query, self.vec_slice(flat_vectors, entry));
        let init = DistSlot {
            dist: d0,
            slot: entry,
        };
        if (entry as usize) < n_nodes {
            visited[entry as usize] = 1;
        }
        candidates.push(MinDistSlot(init));
        results.push(init);

        while let Some(MinDistSlot(curr)) = candidates.pop() {
            let worst_dist = results.peek().map(|x| x.dist).unwrap_or(f32::INFINITY);
            if curr.dist > worst_dist && results.len() >= ef {
                break;
            }

            if let Some(node) = self.nodes.get(curr.slot as usize) {
                if let Some(nbrs) = node.neighbors.get(level) {
                    for &nb in nbrs {
                        let nb_idx = nb as usize;
                        if nb_idx >= n_nodes || visited[nb_idx] != 0 {
                            continue;
                        }
                        visited[nb_idx] = 1;
                        let d = hnsw_distance(
                            self.metric,
                            query,
                            self.vec_slice(flat_vectors, nb),
                        );
                        let worst = results.peek().map(|x| x.dist).unwrap_or(f32::INFINITY);
                        if results.len() < ef || d < worst {
                            let ds = DistSlot { dist: d, slot: nb };
                            candidates.push(MinDistSlot(ds));
                            results.push(ds);
                            if results.len() > ef {
                                results.pop();
                            }
                        }
                    }
                }
            }
        }

        let mut out: Vec<DistSlot> = results.into_vec();
        out.sort_by(|a, b| a.cmp(b));
        out
    }

    /// Searches multi-layer HNSW graph and returns candidate non-deleted slots ordered closest-first.
    pub fn search_candidates<F>(
        &self,
        query: &[f32],
        ef: usize,
        flat_vectors: &[f32],
        deleted: &[bool],
        mut allow_slot: F,
    ) -> Vec<u32>
    where
        F: FnMut(u32) -> bool,
    {
        let Some(mut curr_ep) = self.entry_point else {
            return Vec::new();
        };
        if self.nodes.is_empty() {
            return Vec::new();
        }

        let mut curr_dist = hnsw_distance(
            self.metric,
            query,
            self.vec_slice(flat_vectors, curr_ep),
        );

        // Zoom down layers max_level..=1
        if self.max_level >= 1 {
            for lc in (1..=self.max_level).rev() {
                let mut changed = true;
                while changed {
                    changed = false;
                    if let Some(node) = self.nodes.get(curr_ep as usize) {
                        if let Some(nbrs) = node.neighbors.get(lc) {
                            for &nb in nbrs {
                                if (nb as usize) >= self.nodes.len() {
                                    continue;
                                }
                                let d = hnsw_distance(
                                    self.metric,
                                    query,
                                    self.vec_slice(flat_vectors, nb),
                                );
                                if d < curr_dist {
                                    curr_dist = d;
                                    curr_ep = nb;
                                    changed = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        let raw = self.search_layer(query, curr_ep, ef.max(self.ef_search), 0, flat_vectors);
        raw.into_iter()
            .map(|ds| ds.slot)
            .filter(|&s| {
                let idx = s as usize;
                idx < deleted.len() && !deleted[idx] && allow_slot(s)
            })
            .collect()
    }
}
