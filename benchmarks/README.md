# Iceberg DB (v1.0.0) — Reproducible Benchmarks & Validation Suite

This directory contains the reproducible benchmark script and methodology for **Iceberg DB (`v1.0.0`)**, matching the published report at [https://icebergdb.in/benchmarks](https://icebergdb.in/benchmarks).

## 1. What We Measure (Transparent Stage Separation)

Unlike synthetic benchmarks that mix or hide embedding generation time, we report each pipeline stage separately on a 120-document evaluation corpus (`384-dim` `all-MiniLM-L6-v2` embeddings, `40` evaluation queries combining semantic paraphrases and exact alphanumeric identifiers):

| Pipeline Stage | Min | Median (`p50`) | `p95` | Description |
| :--- | :--- | :--- | :--- | :--- |
| **1. Pure Dense Vector Lookup (`384d` Cosine HNSW)** | `1.42 ms` | **`1.95 ms`** | `3.80 ms` | Pre-computed 384d vector lookup against Qdrant HNSW (`m=16, ef_construct=100`) |
| **2. Sparse Okapi BM25 Scoring (`k1=1.5, b=0.75`)** | `4.85 ms` | **`6.93 ms`** | `11.20 ms` | Full-collection lexical term-frequency scoring |
| **3. Hybrid RRF Search (`Dense + BM25`, `alpha=0.5`)** | `6.40 ms` | **`8.73 ms`** | `13.39 ms` | Reciprocal Rank Fusion (`k=60`) + normalized score blending |
| **4. Server-Side CPU Query Embedding (`ONNX`)** | `48.25 ms` | **`112.34 ms`** | `145.10 ms` | Quantized `all-MiniLM-L6-v2` on CPU (`$0` external OpenAI key cost) |

### Retrieval Quality (`Recall@5` & `Recall@10` on the 120-Doc Evaluation Set)
- **Pure Dense Vector (`384d` Cosine):** `90.0%` Recall@5 | `95.0%` Recall@10
- **Pure Keyword (`Okapi BM25`):** `85.0%` Recall@5 | `90.0%` Recall@10
- **Iceberg Hybrid RRF (`Dense + BM25`, `alpha=0.5`):** **`97.5%` Recall@5** | **`100.0%` Recall@10**

---

## 2. How to Reproduce Locally

### Run the Stage-by-Stage Engine Benchmark
```bash
python benchmarks/run_benchmarks.py
```

### Run the 21-Test Backend Validation Suite (Isolation, RBAC, Point CRUD, Hybrid RRF, Snapshots)
```bash
python iceberg-backend/tests/test_validation_suite.py
```

### Run End-to-End Network RTT Benchmark Against `https://api.icebergdb.in`
```bash
pip install icebergdb
ICEBERG_API_KEY=ib_your_key python benchmarks/run_benchmarks.py --live
```
