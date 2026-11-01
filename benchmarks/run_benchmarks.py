"""
Iceberg DB (v1.0.0) — Reproducible Benchmark Suite
==================================================
Measures stage-by-stage engine latency and retrieval Recall@5 / Recall@10:
  1. Pure Dense Vector Lookup (384d Cosine HNSW)
  2. Sparse Okapi BM25 Keyword Scoring (k1=1.5, b=0.75)
  3. Hybrid Reciprocal Rank Fusion (Dense + BM25, RRF k=60, alpha=0.5)
  4. Server-Side ONNX CPU Query Embedding (all-MiniLM-L6-v2, 384-dim)

Usage:
  # Run isolated local engine benchmark (no external server required):
  python benchmarks/run_benchmarks.py

  # Or run against live API gateway (https://api.icebergdb.in):
  ICEBERG_API_KEY=ib_your_key python benchmarks/run_benchmarks.py --live
"""

import os
import sys
import time
import math
import argparse
import statistics
import tempfile
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "iceberg-backend"


EVAL_CORPUS = [
    ("doc_001", "DPDP Act 2023 Section 16 governs cross-border transfer of personal data outside India.", "compliance"),
    ("doc_002", "RBI circular RBI/2017-18/153 mandates all payment system data be stored exclusively in India.", "compliance"),
    ("doc_003", "Invoice INV-2026-9981 was settled via NEFT for INR 1,45,000 by Acme Fintech Pvt Ltd.", "billing"),
    ("doc_004", "Error code ERR_HNSW_MMAP_07 indicates virtual memory mapping pressure during segment compaction.", "ops"),
    ("doc_005", "Iceberg DB 4-tier cognitive memory includes short_term (1h TTL), episodic (30d TTL), long_term, and semantic tiers.", "ai"),
    ("doc_006", "Reciprocal Rank Fusion (RRF k=60) combines dense 384d cosine similarity with Okapi BM25 keyword scores.", "search"),
    ("doc_007", "Server-side quantized ONNX all-MiniLM-L6-v2 generates 384-dimensional normalized float32 embeddings on CPU.", "embeddings"),
    ("doc_008", "SKU-AUDIO-XM5 wireless noise-cancelling headphones retail at INR 24,990 with 30-hour battery life.", "catalog"),
    ("doc_009", "Role-Based Access Control (RBAC) enforces admin, read_write, and read_only API key permissions via SHA-256 hashes.", "security"),
    ("doc_010", "Collection snapshots created via POST /backup/{collection} allow instant point-in-time disaster recovery.", "ops"),
]

EVAL_QUERIES = [
    ("where must payment system data be stored according to RBI circular?", "doc_002"),
    ("INV-2026-9981", "doc_003"),
    ("ERR_HNSW_MMAP_07 memory mapping", "doc_004"),
    ("how does hybrid RRF combine dense and BM25 rankings?", "doc_006"),
    ("SKU-AUDIO-XM5 headphones battery", "doc_008"),
    ("DPDP Act Section 16 cross-border data rules", "doc_001"),
    ("what are the 4 cognitive memory tiers and TTLs?", "doc_005"),
    ("SHA-256 API key RBAC roles read_only", "doc_009"),
]


def percentile(sorted_vals, pct):
    if not sorted_vals:
        return 0.0
    idx = min(len(sorted_vals) - 1, int(math.floor(len(sorted_vals) * pct)))
    return sorted_vals[idx]


def run_local_engine_benchmark():
    sys.path.insert(0, str(BACKEND_DIR))
    temp_dir = Path(tempfile.mkdtemp(prefix="iceberg_bench_"))

    import core.database as db_mod
    import services.read_nodes as rn_mod

    db_mod.DB_PATH = temp_dir / "bench.db"
    rn_mod.DATA_DIR = temp_dir / "qdrant_bench"

    from services.embeddings import embed_text, embed_batch
    from services.qdrant import create_collection, upsert_chunks, search_vectors, get_all_chunks
    from services.hybrid_search import bm25_search, hybrid_search

    print("==================================================================")
    print("Iceberg DB (v1.0.0) — Reproducible Local Engine Benchmark")
    print("==================================================================")

    col_name = "t_bench001__eval_corpus"
    create_collection(col_name)

    # Populate 120 documents (10 base documents + 110 synthetic technical documents)
    texts = [item[1] for item in EVAL_CORPUS]
    ids = [item[0] for item in EVAL_CORPUS]
    metas = [{"category": item[2], "doc_id": item[0]} for item in EVAL_CORPUS]
    for i in range(11, 121):
        did = f"doc_{i:03d}"
        texts.append(
            f"Technical reference {did}: Distributed microservice node #{i} operating in India ap-south-1 "
            f"with HNSW index parameter ef_construct=100 and cosine vector similarity."
        )
        ids.append(did)
        metas.append({"category": "synthetic", "doc_id": did})

    t0 = time.perf_counter()
    vecs = embed_batch(texts)
    upsert_chunks(col_name, texts, vecs, source="benchmark", metadata_list=metas, ids=ids)
    ingest_ms = (time.perf_counter() - t0) * 1000
    print(f"[1/5] Indexed {len(texts)} documents (384d ONNX CPU embed + HNSW upsert) in {ingest_ms:.1f} ms")

    # Warm-up query vector
    q_vec = embed_text("DPDP Act 2023 data localization in India")

    # 1. Pure Dense Vector Lookup
    dense_times = []
    for _ in range(40):
        s0 = time.perf_counter()
        _ = search_vectors(col_name, q_vec, top_k=10)
        dense_times.append((time.perf_counter() - s0) * 1000)
    dense_times.sort()

    # 2. Sparse BM25 Keyword Scoring
    bm25_times = []
    for q_text, _ in EVAL_QUERIES * 5:
        s0 = time.perf_counter()
        cands = get_all_chunks(col_name, limit=500)
        _ = bm25_search(q_text, cands, top_k=10)
        bm25_times.append((time.perf_counter() - s0) * 1000)
    bm25_times.sort()

    # 3. Hybrid RRF Search (Dense + BM25)
    hybrid_times = []
    hits_at_5 = 0
    hits_at_10 = 0
    total_q = 0
    for q_text, expected_id in EVAL_QUERIES * 5:
        qv = embed_text(q_text)
        s0 = time.perf_counter()
        sem_res = search_vectors(col_name, qv, top_k=20)
        all_cands = get_all_chunks(col_name, limit=500)
        fused = hybrid_search(q_text, sem_res, top_k=10, alpha=0.5, bm25_candidates=all_cands)
        hybrid_times.append((time.perf_counter() - s0) * 1000)
        found_ids = [r.get("id") for r in fused]
        if expected_id in found_ids[:5]:
            hits_at_5 += 1
        if expected_id in found_ids[:10]:
            hits_at_10 += 1
        total_q += 1
    hybrid_times.sort()

    # 4. Server-Side CPU Query Embedding
    embed_times = []
    for q_text, _ in EVAL_QUERIES * 3:
        s0 = time.perf_counter()
        _ = embed_text(q_text)
        embed_times.append((time.perf_counter() - s0) * 1000)
    embed_times.sort()

    print("\n--- Measured Stage-by-Stage Latency (120-Doc 384d Corpus) ---")
    print(f"1. Pure Dense HNSW Lookup : min={dense_times[0]:.2f} ms | p50={statistics.median(dense_times):.2f} ms | p95={percentile(dense_times, 0.95):.2f} ms")
    print(f"2. Sparse Okapi BM25      : min={bm25_times[0]:.2f} ms | p50={statistics.median(bm25_times):.2f} ms | p95={percentile(bm25_times, 0.95):.2f} ms")
    print(f"3. Hybrid RRF (Dense+BM25): min={hybrid_times[0]:.2f} ms | p50={statistics.median(hybrid_times):.2f} ms | p95={percentile(hybrid_times, 0.95):.2f} ms")
    print(f"4. ONNX 384d CPU Embed    : min={embed_times[0]:.2f} ms | p50={statistics.median(embed_times):.2f} ms | p95={percentile(embed_times, 0.95):.2f} ms")
    print(f"5. Hybrid RRF Recall      : Recall@5={(hits_at_5 / total_q) * 100:.1f}% | Recall@10={(hits_at_10 / total_q) * 100:.1f}%")

    try:
        if rn_mod.node_manager._write_client:
            rn_mod.node_manager._write_client.close()
    except Exception:
        pass
    shutil.rmtree(temp_dir, ignore_errors=True)


def run_live_api_benchmark():
    from iceberg import Client

    api_key = os.environ.get("ICEBERG_API_KEY", "ib_dev_test123")
    client = Client(api_key=api_key)
    print("==================================================================")
    print("Iceberg DB (v1.0.0) — Live Cloud Endpoint Benchmark")
    print("==================================================================")
    client.create_collection("bench_test")
    t0 = time.perf_counter()
    client.index_text(
        "bench_test",
        "Iceberg HNSW engine delivers fast hybrid RRF vector search hosted in India (ap-south-1).",
        source="bench",
    )
    print(f"[PASS] Ingest + 384d CPU Embed: {(time.perf_counter() - t0) * 1000:.1f} ms")

    latencies = []
    for _ in range(20):
        s0 = time.perf_counter()
        results = client.search("bench_test", "India vector search latency", top_k=5, search_type="hybrid")
        latencies.append((time.perf_counter() - s0) * 1000)
    latencies.sort()
    print(f"[PASS] Hybrid Search Top Match: score={results[0].score:.4f} | '{results[0].text}'")
    print(f"       End-to-End RTT (20 runs) -> min={latencies[0]:.1f} ms | p50={statistics.median(latencies):.1f} ms | p95={percentile(latencies, 0.95):.1f} ms")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Iceberg DB v1.0.0 Reproducible Benchmark Suite")
    parser.add_argument("--live", action="store_true", help="Run against live https://api.icebergdb.in endpoint")
    args = parser.parse_args()
    if args.live:
        run_live_api_benchmark()
    else:
        run_local_engine_benchmark()
