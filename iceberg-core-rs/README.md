# IcebergCore v1.0.0 (`iceberg-core-rs`)

Native Multi-Threaded Rust Vector, Hybrid Okapi BM25, Quantization, and Cognitive Memory Engine for **Iceberg DB (`v1.0.0`)**.

## Core Architecture
- **Multi-Dimension & 4 Distance Metrics (`src/distance.rs`):** 8-way loop-unrolled SIMD-auto-vectorized kernels supporting any vector dimension (`1..8192`: `384`, `768`, `1024`, `1536`, `3072`) across `cosine`, `dotproduct`, `euclidean`, and `manhattan`.
- **3-Tier Memory Quantization + Exact Float32 Rescoring (`src/quantization.rs`):**
  - `float32`: Full precision.
  - `sq8`: 8-bit affine scalar quantization (~4x RAM compression) with oversampled Float32 rescoring.
  - `binary`: 1-bit hardware `POPCNT` Hamming quantization (32x RAM compression) with oversampled Float32 rescoring.
- **Multi-Layer HNSW Graph (`src/hnsw.rs`):** Hierarchical Navigable Small World ANN index with adaptive beam search and automatic Rayon parallel exact fallback on selective metadata filters.
- **Native Okapi BM25 + Hybrid RRF (`src/bm25.rs`):** Compound-preserving inverted postings index + Reciprocal Rank Fusion in a single query pass.
- **Rich Metadata Filter AST & Namespaces (`src/filter.rs`):** O(1) inverted hash pre-filter + recursive `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`, `$contains`, `$and`, `$or`, `$not`.
- **Engine-Level Cognitive Memory Decay (`src/distance.rs` & `src/engine.rs`):** Ebbinghaus time-decay + importance anchoring + lock-free atomic access reinforcement (`AtomicU32`).
- **Crash-Proof Disk Storage (`src/storage.rs`):** Append-only binary `.ibwal` frames protected by hardware CRC32 checksums (automatic torn-tail self-healing on startup) + atomic `.ibsnap` snapshots.

## Build & Run
```powershell
cargo build --release
.\target\release\iceberg-core-rs.exe --host 127.0.0.1 --port 6334 --data-dir .\data\iceberg_core_rs
```
