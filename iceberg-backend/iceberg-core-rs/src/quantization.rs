use serde::{Deserialize, Serialize};
use crate::distance::DistanceMetric;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum QuantizationMode {
    Float32,
    Sq8,
    Binary,
}

impl QuantizationMode {
    pub fn from_str_flexible(s: &str) -> Result<Self, String> {
        match s.trim().to_ascii_lowercase().as_str() {
            "none" | "float32" | "f32" | "fp32" => Ok(Self::Float32),
            "sq8" | "int8" | "u8" | "scalar" => Ok(Self::Sq8),
            "binary" | "bq" | "1bit" | "bit" => Ok(Self::Binary),
            other => Err(format!(
                "Unsupported quantization mode '{}'. Supported: float32, sq8, binary",
                other
            )),
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Float32 => "float32",
            Self::Sq8 => "sq8",
            Self::Binary => "binary",
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Sq8Params {
    pub min_val: f32,
    pub scale: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorQuantizer {
    pub dim: usize,
    pub mode: QuantizationMode,
    pub words_per_vec: usize,
    pub sq8_codes: Vec<u8>,
    pub sq8_params: Vec<Sq8Params>,
    pub binary_words: Vec<u64>,
}

impl VectorQuantizer {
    pub fn new(dim: usize, mode: QuantizationMode) -> Self {
        let words_per_vec = (dim + 63) / 64;
        Self {
            dim,
            mode,
            words_per_vec,
            sq8_codes: Vec::new(),
            sq8_params: Vec::new(),
            binary_words: Vec::new(),
        }
    }

    pub fn clear(&mut self) {
        self.sq8_codes.clear();
        self.sq8_params.clear();
        self.binary_words.clear();
    }

    /// Encodes a new slot at the end (must be called in contiguous slot order).
    pub fn push_vector(&mut self, vec: &[f32]) {
        match self.mode {
            QuantizationMode::Float32 => {}
            QuantizationMode::Sq8 => {
                let (params, encoded) = Self::encode_sq8(vec);
                self.sq8_params.push(params);
                self.sq8_codes.extend_from_slice(&encoded);
            }
            QuantizationMode::Binary => {
                let mut words = vec![0u64; self.words_per_vec];
                Self::encode_binary_into(vec, &mut words);
                self.binary_words.extend_from_slice(&words);
            }
        }
    }

    /// O(1) in-place update for an existing slot.
    pub fn update_slot(&mut self, slot: usize, vec: &[f32]) {
        match self.mode {
            QuantizationMode::Float32 => {}
            QuantizationMode::Sq8 => {
                if slot < self.sq8_params.len() {
                    let (params, encoded) = Self::encode_sq8(vec);
                    self.sq8_params[slot] = params;
                    let start = slot * self.dim;
                    self.sq8_codes[start..start + self.dim].copy_from_slice(&encoded);
                }
            }
            QuantizationMode::Binary => {
                let start = slot * self.words_per_vec;
                if start + self.words_per_vec <= self.binary_words.len() {
                    Self::encode_binary_into(
                        vec,
                        &mut self.binary_words[start..start + self.words_per_vec],
                    );
                }
            }
        }
    }

    #[inline]
    fn encode_sq8(vec: &[f32]) -> (Sq8Params, Vec<u8>) {
        let mut min_v = f32::INFINITY;
        let mut max_v = f32::NEG_INFINITY;
        for &x in vec {
            if x < min_v {
                min_v = x;
            }
            if x > max_v {
                max_v = x;
            }
        }
        if !min_v.is_finite() {
            min_v = 0.0;
            max_v = 0.0;
        }
        let range = (max_v - min_v).max(1e-12);
        let scale = range / 255.0;
        let inv_scale = 255.0 / range;
        let mut codes = Vec::with_capacity(vec.len());
        for &x in vec {
            let q = ((x - min_v) * inv_scale).round().clamp(0.0, 255.0) as u8;
            codes.push(q);
        }
        (Sq8Params { min_val: min_v, scale }, codes)
    }

    #[inline]
    pub fn encode_binary_into(vec: &[f32], out_words: &mut [u64]) {
        for w in out_words.iter_mut() {
            *w = 0u64;
        }
        for (i, &x) in vec.iter().enumerate() {
            if x >= 0.0 {
                out_words[i >> 6] |= 1u64 << (i & 63);
            }
        }
    }

    #[inline]
    pub fn encode_query_binary(&self, query: &[f32]) -> Vec<u64> {
        let mut words = vec![0u64; self.words_per_vec];
        Self::encode_binary_into(query, &mut words);
        words
    }

    /// Fast approximate SQ8 similarity score (no heap allocations).
    #[inline(always)]
    pub fn score_sq8_slot(
        &self,
        metric: DistanceMetric,
        slot: usize,
        query: &[f32],
        query_sum: f32,
    ) -> f32 {
        let params = self.sq8_params[slot];
        let start = slot * self.dim;
        let codes = &self.sq8_codes[start..start + self.dim];

        match metric {
            DistanceMetric::Cosine | DistanceMetric::DotProduct => {
                let chunks = self.dim / 8;
                let mut acc0 = 0.0f32;
                let mut acc1 = 0.0f32;
                let mut acc2 = 0.0f32;
                let mut acc3 = 0.0f32;
                for c in 0..chunks {
                    let i = c * 8;
                    acc0 += query[i] * (codes[i] as f32) + query[i + 1] * (codes[i + 1] as f32);
                    acc1 += query[i + 2] * (codes[i + 2] as f32) + query[i + 3] * (codes[i + 3] as f32);
                    acc2 += query[i + 4] * (codes[i + 4] as f32) + query[i + 5] * (codes[i + 5] as f32);
                    acc3 += query[i + 6] * (codes[i + 6] as f32) + query[i + 7] * (codes[i + 7] as f32);
                }
                let mut q_dot_c = (acc0 + acc1) + (acc2 + acc3);
                for i in (chunks * 8)..self.dim {
                    q_dot_c += query[i] * (codes[i] as f32);
                }
                let dot = params.min_val * query_sum + params.scale * q_dot_c;
                if metric == DistanceMetric::Cosine {
                    dot.clamp(-1.0, 1.0)
                } else {
                    dot
                }
            }
            DistanceMetric::Euclidean => {
                let mut l2_sq = 0.0f32;
                for i in 0..self.dim {
                    let recon = params.min_val + params.scale * (codes[i] as f32);
                    let d = query[i] - recon;
                    l2_sq += d * d;
                }
                1.0 / (1.0 + l2_sq.max(0.0).sqrt())
            }
            DistanceMetric::Manhattan => {
                let mut l1 = 0.0f32;
                for i in 0..self.dim {
                    let recon = params.min_val + params.scale * (codes[i] as f32);
                    l1 += (query[i] - recon).abs();
                }
                1.0 / (1.0 + l1.max(0.0))
            }
        }
    }

    /// Hardware POPCNT 1-bit Binary similarity score (64 dimensions per instruction).
    #[inline(always)]
    pub fn score_binary_slot(&self, slot: usize, query_words: &[u64]) -> f32 {
        let start = slot * self.words_per_vec;
        let stored = &self.binary_words[start..start + self.words_per_vec];
        let mut hamming: u32 = 0;
        for w in 0..self.words_per_vec {
            hamming += (query_words[w] ^ stored[w]).count_ones();
        }
        1.0 - (2.0 * hamming as f32) / (self.dim.max(1) as f32)
    }

    pub fn quantized_ram_bytes(&self, active_slots: usize) -> usize {
        match self.mode {
            QuantizationMode::Float32 => active_slots * self.dim * 4,
            QuantizationMode::Sq8 => active_slots * (self.dim + 8),
            QuantizationMode::Binary => active_slots * self.words_per_vec * 8,
        }
    }

    pub fn compression_ratio(&self) -> f32 {
        let raw_bytes = (self.dim * 4).max(1) as f32;
        match self.mode {
            QuantizationMode::Float32 => 1.0,
            QuantizationMode::Sq8 => raw_bytes / ((self.dim + 8) as f32),
            QuantizationMode::Binary => raw_bytes / ((self.words_per_vec * 8).max(1) as f32),
        }
    }
}
