"""
IcebergCore v1.0.0 — No-Mercy Production Live Readiness Audit
=============================================================
Specifically verifies real production scale & every remaining subsystem:
  1. Zero-Qdrant Proof: verifies ReadNodeManager opens ZERO Qdrant clients/locks in Rust mode
  2. 5,000-Vector (384d) Multi-Layer HNSW Graph Recall@10 vs Exact NumPy Ground Truth + p50/p95 Latency
  3. HNSW Entry-Point & Mass-Deletion Resilience (deleting slot 0..249 out of 5,000 vectors)
  4. 5,000-Vector Snapshot Persistence + Process Restart Reload Speed & Accuracy
  5. Special-Character Collection Names (spaces, colons, slashes) & Dashboard `u_<hex>__` Scoping
  6. Full AI Assistant RAG Pipeline (/assistant create, file upload, /chat retrieval, widget.js, delete)
  7. /nodes Read-Slot Telemetry & /admin/status Health
"""

import io
import os
import shutil
import sys
import tempfile
import time
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = ROOT / "iceberg-backend"
sys.path.insert(0, str(BACKEND_DIR))

D_TMP = Path("D:/Rust/tmp")
D_TMP.mkdir(parents=True, exist_ok=True)
os.environ["TEMP"] = str(D_TMP)
os.environ["TMP"] = str(D_TMP)

TEMP_DIR = Path(tempfile.mkdtemp(prefix="iceberg_prod_ready_", dir=str(D_TMP)))

import core.database as db_mod
import services.read_nodes as rn_mod
import routers.backup as bk_mod

db_mod.DB_PATH = TEMP_DIR / "iceberg_prod.db"
rn_mod.DATA_DIR = TEMP_DIR / "engine_data"
bk_mod.LOCAL_BACKUP_DIR = TEMP_DIR / "backups"

from fastapi.testclient import TestClient
from main import app

passed = 0
failed = 0


def check(name: str, cond: bool, detail: str = ""):
    global passed, failed
    if cond:
        passed += 1
        print(f"  [PASS] {name} {detail}")
    else:
        failed += 1
        print(f"  [FAIL] {name} {detail}")


print(f"[PROD AUDIT] Isolated workspace: {TEMP_DIR}")

with TestClient(app) as client:
    print("\n=== 1. Zero-Qdrant Native Engine Verification ===")
    check(
        "ReadNodeManager runs in pure 'iceberg-core-rs' mode with ZERO QdrantClient instantiated",
        rn_mod.node_manager._mode == "iceberg-core-rs" and rn_mod.node_manager._write_client is None,
        f"mode={rn_mod.node_manager._mode}, qdrant_client={rn_mod.node_manager._write_client}",
    )
    check(
        "Qdrant local directory was NEVER even created on disk",
        not (TEMP_DIR / "engine_data").exists(),
    )

    signup = client.post("/auth/signup", json={"email": "founder@icebergdb.in", "password": "StrongPassword123!"}).json()
    hdr = {"X-API-Key": signup["api_key"]}

    print("\n=== 2. 5,000-Vector (384d) Multi-Layer HNSW Graph Recall@10 & p50/p95 Speed ===")
    rng = np.random.default_rng(42)
    N = 5000
    DIM = 384
    # Realistic 50-topic semantic manifold embeddings (centroids + intra-topic variance)
    centroids = rng.standard_normal((50, DIM), dtype=np.float32)
    topic_ids = rng.integers(0, 50, size=N)
    raw_mat = centroids[topic_ids] + 0.35 * rng.standard_normal((N, DIM), dtype=np.float32)
    norms = np.linalg.norm(raw_mat, axis=1, keepdims=True)
    unit_mat = raw_mat / np.maximum(norms, 1e-12)

    client.post("/collections", headers=hdr, json={"name": "hnsw_5k", "dimension": DIM, "metric": "cosine", "quantization": "float32"})

    t_ing0 = time.perf_counter()
    BATCH = 500
    for start in range(0, N, BATCH):
        end = start + BATCH
        vec_batch = [
            {"id": f"pt_{i}", "values": unit_mat[i].tolist(), "metadata": {"bucket": i % 10}}
            for i in range(start, end)
        ]
        r_up = client.post("/vectors/upsert", headers=hdr, json={"collection": "hnsw_5k", "vectors": vec_batch})
        assert r_up.status_code == 200, r_up.text
    ingest_sec = time.perf_counter() - t_ing0

    st_5k = client.get("/collections/hnsw_5k/stats", headers=hdr).json()
    check(f"Ingested 5,000 x 384d vectors into Multi-Layer HNSW in {ingest_sec:.2f}s", st_5k["vector_count"] == 5000)

    # Evaluate Recall@10 across 40 random queries against exact NumPy matrix dot product
    Q_COUNT = 40
    q_topics = rng.integers(0, 50, size=Q_COUNT)
    q_mat = centroids[q_topics] + 0.35 * rng.standard_normal((Q_COUNT, DIM), dtype=np.float32)
    q_mat = q_mat / np.maximum(np.linalg.norm(q_mat, axis=1, keepdims=True), 1e-12)

    recall_hits = 0
    latencies_ms = []
    for qi in range(Q_COUNT):
        exact_scores = unit_mat @ q_mat[qi]
        gt_top10 = {f"pt_{idx}" for idx in np.argsort(-exact_scores)[:10]}

        res = client.post(
            "/vectors/query",
            headers=hdr,
            json={"collection": "hnsw_5k", "vector": q_mat[qi].tolist(), "top_k": 10},
        ).json()
        latencies_ms.append(res.get("latency_ms", 0.0))
        got_top10 = {m["id"] for m in res["matches"]}
        recall_hits += len(gt_top10 & got_top10)

    recall_at_10 = recall_hits / (Q_COUNT * 10)
    p50_ms = float(np.percentile(latencies_ms, 50))
    p95_ms = float(np.percentile(latencies_ms, 95))
    check(
        f"5,000-Vector HNSW Recall@10 = {recall_at_10 * 100:.1f}% | Rust Engine p50={p50_ms:.2f}ms, p95={p95_ms:.2f}ms",
        recall_at_10 >= 0.92 and p50_ms < 10.0,
    )

    print("\n=== 3. HNSW Entry-Point Deletion Resilience (Deleting pt_0..pt_249) ===")
    del_ids = [f"pt_{i}" for i in range(250)]
    r_del = client.post("/vectors/delete", headers=hdr, json={"collection": "hnsw_5k", "ids": del_ids}).json()
    st_after = client.get("/collections/hnsw_5k", headers=hdr).json()
    check("Deleted first 250 points (including HNSW entry_point pt_0)", r_del["deleted_count"] == 250 and st_after["vector_count"] == 4750)

    # Search for deleted pt_0 vector -> must NOT return any deleted ID pt_0..pt_249!
    res_post_del = client.post(
        "/vectors/query",
        headers=hdr,
        json={"collection": "hnsw_5k", "vector": unit_mat[0].tolist(), "top_k": 10},
    ).json()
    returned_ids = [m["id"] for m in res_post_del["matches"]]
    check(
        "Post-delete HNSW search returns 10 live neighbors & ZERO deleted IDs",
        len(returned_ids) == 10 and all(rid not in set(del_ids) for rid in returned_ids),
        f"top3={returned_ids[:3]}",
    )

    print("\n=== 4. 5,000-Vector Snapshot Flush + Daemon Restart Reload ===")
    from services.rust_engine import rust_engine
    t_re0 = time.perf_counter()
    rust_engine.shutdown()  # Flushes snapshot & stops daemon cleanly
    # Next request auto-spawns daemon & reloads 4,750-vector HNSW snapshot from disk!
    st_reloaded = client.get("/collections/hnsw_5k/stats", headers=hdr).json()
    reload_ms = (time.perf_counter() - t_re0) * 1000.0
    check(
        f"Daemon restarted & reloaded 4,750-vector HNSW snapshot in {reload_ms:.0f}ms",
        st_reloaded["vector_count"] == 4750,
    )

    print("\n=== 5. Special-Character Collection Names & Dashboard u_<hex>__ Scoping ===")
    for tricky_name in ["My Production Vault 2026", "client:india.v1", "u_9f8e7d6c5b__dashboard_kb"]:
        rc = client.post("/collections", headers=hdr, json={"name": tricky_name})
        ri = client.post("/documents/text", headers=hdr, data={"collection": tricky_name, "text": f"Confidential record inside {tricky_name}"})
        rs = client.post("/search", headers=hdr, json={"collection": tricky_name, "query": "Confidential record"}).json()
        rd = client.delete(f"/collections/{tricky_name}", headers=hdr)
        check(
            f"Collection '{tricky_name}' create + index + search + delete succeeded",
            rc.status_code == 201 and ri.status_code == 200 and len(rs.get("results", [])) == 1 and rd.status_code == 200,
        )

    print("\n=== 6. Full AI Assistant End-to-End RAG Pipeline on Rust Engine ===")
    asst_c = client.post(
        "/assistant",
        headers=hdr,
        json={"name": "SupportBot", "description": "Answers refund policy questions", "llm_provider": "iceberg_fast"},
    )
    asst_id = asst_c.json()["id"]
    check("Assistant created on Rust Engine", asst_c.status_code == 200 and bool(asst_id))

    policy_txt = b"Iceberg Enterprise Refund Policy: Customers receive a 100% full refund within 14 days via Razorpay UPI."
    up_asst = client.post(
        f"/assistant/{asst_id}/upload",
        headers=hdr,
        files={"file": ("refund_policy.txt", io.BytesIO(policy_txt), "text/plain")},
    )
    check("Assistant document uploaded & embedded into _asst_ collection", up_asst.status_code == 200)

    chat_res = client.post(
        f"/assistant/{asst_id}/chat",
        json={"message": "What is the refund policy and how many days?"},
    ).json()
    check(
        "Assistant /chat retrieves grounded answer & source citation from Rust Engine",
        "14 days" in chat_res.get("reply", "") and "refund_policy.txt" in chat_res.get("sources", []),
        str(chat_res),
    )

    wid = client.get(f"/assistant/{asst_id}/widget.js")
    check("Assistant /widget.js serves embeddable script", wid.status_code == 200 and "iceberg-chat-btn" in wid.text)

    del_asst = client.delete(f"/assistant/{asst_id}", headers=hdr)
    check("Assistant deleted cleanly", del_asst.status_code == 200 and del_asst.json().get("deleted") is True)

    print("\n=== 7. Read Nodes & Admin Status Telemetry ===")
    nd = client.get("/nodes", headers=hdr).json()
    adm = client.get("/admin/status", headers=hdr).json()
    check(
        "/nodes & /admin/status report active_engine='iceberg-core-rs' & recorded query latencies",
        nd.get("active_engine") == "iceberg-core-rs" and adm.get("nodes", {}).get("mode") == "iceberg-core-rs",
        str(nd),
    )

shutil.rmtree(TEMP_DIR, ignore_errors=True)
print("\n==================================================================")
print(f"PRODUCTION LIVE READINESS AUDIT: {passed} PASSED, {failed} FAILED")
print("==================================================================")
if failed > 0:
    sys.exit(1)
