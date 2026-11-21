use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DistanceMetric {
    Cosine,
    DotProduct,
    Euclidean,
    Manhattan,
}

impl DistanceMetric {
    pub fn from_str_flexible(s: &str) -> Result<Self, String> {
        match s.trim().to_ascii_lowercase().as_str() {
            "cosine" | "cos" => Ok(Self::Cosine),
            "dotproduct" | "dot" | "dot_product" | "ip" | "inner_product" => Ok(Self::DotProduct),
            "euclidean" | "euclid" | "l2" => Ok(Self::Euclidean),
            "manhattan" | "l1" | "taxicab" => Ok(Self::Manhattan),
            other => Err(format!(
                "Unsupported distance metric '{}'. Supported: cosine, dotproduct, euclidean, manhattan",
                other
            )),
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Cosine => "cosine",
            Self::DotProduct => "dotproduct",
            Self::Euclidean => "euclidean",
            Self::Manhattan => "manhattan",
        }
    }
}

#[inline]
pub fn validate_vector(v: &[f32], expected_dim: usize) -> Result<(), String> {
    if v.is_empty() {
        return Err("Vector cannot be empty".to_string());
    }
    if v.len() != expected_dim {
        return Err(format!(
            "Invalid vector dimension: expected {}, got {}",
            expected_dim,
            v.len()
        ));
    }
    for &val in v {
        if val.is_nan() || val.is_infinite() {
            return Err("Vector contains invalid NaN or Infinite values".to_string());
        }
    }
    Ok(())
}

#[inline]
pub fn normalize_in_place(v: &mut [f32]) {
    let norm_sq = dot_product_f32(v, v);
    if norm_sq > 1e-24 {
        let inv = 1.0 / norm_sq.sqrt();
        for x in v.iter_mut() {
            *x *= inv;
        }
    }
}

#[inline]
pub fn normalized_copy(v: &[f32]) -> Vec<f32> {
    let mut out = v.to_vec();
    normalize_in_place(&mut out);
    out
}

/// 8-way loop-unrolled dot product so LLVM auto-vectorizes across AVX2/SSE2 lanes.
#[inline(always)]
pub fn dot_product_f32(a: &[f32], b: &[f32]) -> f32 {
    debug_assert_eq!(a.len(), b.len());
    let n = a.len().min(b.len());
    let chunks = n / 8;
    let mut s0 = 0.0f32;
    let mut s1 = 0.0f32;
    let mut s2 = 0.0f32;
    let mut s3 = 0.0f32;
    let mut s4 = 0.0f32;
    let mut s5 = 0.0f32;
    let mut s6 = 0.0f32;
    let mut s7 = 0.0f32;

    for c in 0..chunks {
        let i = c * 8;
        s0 += a[i] * b[i];
        s1 += a[i + 1] * b[i + 1];
        s2 += a[i + 2] * b[i + 2];
        s3 += a[i + 3] * b[i + 3];
        s4 += a[i + 4] * b[i + 4];
        s5 += a[i + 5] * b[i + 5];
        s6 += a[i + 6] * b[i + 6];
        s7 += a[i + 7] * b[i + 7];
    }

    let mut rem = (s0 + s1) + (s2 + s3) + (s4 + s5) + (s6 + s7);
    for i in (chunks * 8)..n {
        rem += a[i] * b[i];
    }
    rem
}

/// 8-way loop-unrolled squared L2 distance.
#[inline(always)]
pub fn l2_squared_f32(a: &[f32], b: &[f32]) -> f32 {
    debug_assert_eq!(a.len(), b.len());
    let n = a.len().min(b.len());
    let chunks = n / 8;
    let mut s0 = 0.0f32;
    let mut s1 = 0.0f32;
    let mut s2 = 0.0f32;
    let mut s3 = 0.0f32;
    let mut s4 = 0.0f32;
    let mut s5 = 0.0f32;
    let mut s6 = 0.0f32;
    let mut s7 = 0.0f32;

    for c in 0..chunks {
        let i = c * 8;
        let d0 = a[i] - b[i];
        let d1 = a[i + 1] - b[i + 1];
        let d2 = a[i + 2] - b[i + 2];
        let d3 = a[i + 3] - b[i + 3];
        let d4 = a[i + 4] - b[i + 4];
        let d5 = a[i + 5] - b[i + 5];
        let d6 = a[i + 6] - b[i + 6];
        let d7 = a[i + 7] - b[i + 7];
        s0 += d0 * d0;
        s1 += d1 * d1;
        s2 += d2 * d2;
        s3 += d3 * d3;
        s4 += d4 * d4;
        s5 += d5 * d5;
        s6 += d6 * d6;
        s7 += d7 * d7;
    }

    let mut rem = (s0 + s1) + (s2 + s3) + (s4 + s5) + (s6 + s7);
    for i in (chunks * 8)..n {
        let d = a[i] - b[i];
        rem += d * d;
    }
    rem.max(0.0)
}

/// 8-way loop-unrolled L1 (Manhattan) distance.
#[inline(always)]
pub fn l1_manhattan_f32(a: &[f32], b: &[f32]) -> f32 {
    debug_assert_eq!(a.len(), b.len());
    let n = a.len().min(b.len());
    let chunks = n / 8;
    let mut s0 = 0.0f32;
    let mut s1 = 0.0f32;
    let mut s2 = 0.0f32;
    let mut s3 = 0.0f32;
    let mut s4 = 0.0f32;
    let mut s5 = 0.0f32;
    let mut s6 = 0.0f32;
    let mut s7 = 0.0f32;

    for c in 0..chunks {
        let i = c * 8;
        s0 += (a[i] - b[i]).abs();
        s1 += (a[i + 1] - b[i + 1]).abs();
        s2 += (a[i + 2] - b[i + 2]).abs();
        s3 += (a[i + 3] - b[i + 3]).abs();
        s4 += (a[i + 4] - b[i + 4]).abs();
        s5 += (a[i + 5] - b[i + 5]).abs();
        s6 += (a[i + 6] - b[i + 6]).abs();
        s7 += (a[i + 7] - b[i + 7]).abs();
    }

    let mut rem = (s0 + s1) + (s2 + s3) + (s4 + s5) + (s6 + s7);
    for i in (chunks * 8)..n {
        rem += (a[i] - b[i]).abs();
    }
    rem.max(0.0)
}

/// Higher score = better match (unified across all metrics).
/// Assumes `a` and `b` are already unit-normalized when `metric == Cosine`.
#[inline(always)]
pub fn similarity_score(metric: DistanceMetric, a: &[f32], b: &[f32]) -> f32 {
    match metric {
        DistanceMetric::Cosine => dot_product_f32(a, b).clamp(-1.0, 1.0),
        DistanceMetric::DotProduct => dot_product_f32(a, b),
        DistanceMetric::Euclidean => 1.0 / (1.0 + l2_squared_f32(a, b).sqrt()),
        DistanceMetric::Manhattan => 1.0 / (1.0 + l1_manhattan_f32(a, b)),
    }
}

/// Lower distance = closer neighbor (used inside HNSW graph routing without sqrt overhead).
#[inline(always)]
pub fn hnsw_distance(metric: DistanceMetric, a: &[f32], b: &[f32]) -> f32 {
    match metric {
        DistanceMetric::Cosine => (1.0 - dot_product_f32(a, b)).max(0.0),
        DistanceMetric::DotProduct => -dot_product_f32(a, b),
        DistanceMetric::Euclidean => l2_squared_f32(a, b),
        DistanceMetric::Manhattan => l1_manhattan_f32(a, b),
    }
}

/// Engine-level Ebbinghaus Cognitive Memory Decay + Access Reinforcement.
#[inline]
pub fn apply_cognitive_decay(
    base_score: f32,
    timestamp_sec: f64,
    now_sec: f64,
    importance: f32,
    access_count: u32,
    decay_lambda: f32,
    tier: Option<&str>,
) -> f32 {
    let imp = importance.clamp(0.0, 1.0);
    let is_permanent = matches!(
        tier,
        Some("core") | Some("semantic") | Some("long_term")
    );
    let retention = if is_permanent {
        0.96 + 0.04 * imp
    } else {
        let age_hours = ((now_sec - timestamp_sec).max(0.0) / 3600.0) as f32;
        let stability = 0.5 + imp + 0.15 * ((1 + access_count) as f32).ln();
        (-decay_lambda.max(0.0) * age_hours / stability).exp()
    };
    base_score * (0.65 + 0.35 * retention) * (0.85 + 0.30 * imp)
}
