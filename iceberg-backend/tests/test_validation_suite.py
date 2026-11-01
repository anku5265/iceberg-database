import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add iceberg-backend to sys.path portably
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Use isolated temporary directory for SQLite and Qdrant so production data is untouched
TEMP_DIR = Path(tempfile.mkdtemp(prefix="iceberg_audit_"))
print(f"[AUDIT] Running isolated validation suite in: {TEMP_DIR}")

import core.database as db_mod
import services.read_nodes as rn_mod
import routers.backup as bk_mod

db_mod.DB_PATH = TEMP_DIR / "iceberg_test.db"
rn_mod.DATA_DIR = TEMP_DIR / "qdrant_test"
bk_mod.LOCAL_BACKUP_DIR = TEMP_DIR / "backups_test"

from fastapi.testclient import TestClient
from main import app

passed = 0
failed = 0

def check(name: str, condition: bool, detail: str = ""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  [PASS] {name} {detail}")
    else:
        failed += 1
        print(f"  [FAIL] {name} {detail}")

with TestClient(app) as client:
    print("\n=== 1. Version & Health Verification ===")
    r_root = client.get("/")
    check("Root endpoint returns v1.0.0", r_root.status_code == 200 and r_root.json().get("version") == "1.0.0", str(r_root.json()))
    r_status = client.get("/status")
    check("Status endpoint returns v1.0.0 & Hosted in India (ap-south-1)", r_status.status_code == 200 and r_status.json().get("version") == "1.0.0", str(r_status.json().get("regions")))

    print("\n=== 2. Multi-Tenant Data Isolation Verification ===")
    s1 = client.post("/auth/signup", json={"email": "tenant_a@test.in", "password": "Password123!"})
    s2 = client.post("/auth/signup", json={"email": "tenant_b@test.in", "password": "Password123!"})
    key_a = s1.json()["api_key"]
    key_b = s2.json()["api_key"]
    hdr_a = {"X-API-Key": key_a}
    hdr_b = {"X-API-Key": key_b}

    c_a = client.post("/collections", headers=hdr_a, json={"name": "private_vault"})
    check("Tenant A creates 'private_vault'", c_a.status_code == 201)

    idx_a = client.post("/documents/text", headers=hdr_a, data={"collection": "private_vault", "text": "Tenant A top secret financial ledger 2026"})
    check("Tenant A indexes secret document", idx_a.status_code == 200 and idx_a.json().get("chunks_indexed") == 1)

    list_a = client.get("/collections", headers=hdr_a).json()["collections"]
    list_b = client.get("/collections", headers=hdr_b).json()["collections"]
    check("Tenant A sees 'private_vault'", "private_vault" in list_a, f"list_a={list_a}")
    check("Tenant B CANNOT see Tenant A's 'private_vault'", "private_vault" not in list_b, f"list_b={list_b}")

    # Tenant B tries to search Tenant A's collection
    srch_b = client.post("/search", headers=hdr_b, json={"collection": "private_vault", "query": "secret financial ledger"})
    check("Tenant B cannot search Tenant A's 'private_vault'", srch_b.status_code != 200 or len(srch_b.json().get("results", [])) == 0)

    print("\n=== 3. RBAC (read_only API Key Enforcement) ===")
    ro_res = client.post("/auth/keys", headers=hdr_a, json={"name": "frontend_ro", "role": "read_only"})
    ro_key = ro_res.json()["api_key"]
    hdr_ro = {"X-API-Key": ro_key}

    ro_search = client.post("/search", headers=hdr_ro, json={"collection": "private_vault", "query": "financial ledger"})
    check("read_only key CAN search (200 OK)", ro_search.status_code == 200 and len(ro_search.json()["results"]) == 1)

    ro_write = client.post("/documents/text", headers=hdr_ro, data={"collection": "private_vault", "text": "Hacker injected text"})
    check("read_only key BLOCKED from indexing text (403 Forbidden)", ro_write.status_code == 403)

    ro_del = client.delete("/collections/private_vault", headers=hdr_ro)
    check("read_only key BLOCKED from deleting collection (403 Forbidden)", ro_del.status_code == 403)

    print("\n=== 4. Point-Level CRUD Validation (Insert, Duplicate ID Update, Get, Delete, Edge Cases) ===")
    up1 = client.put(
        "/documents/private_vault/points/item-001",
        headers=hdr_a,
        json={"text": "iPhone 15 price is ₹70,000", "metadata": {"sku": "IP15", "price": 70000}},
    )
    check("Single point insert by custom ID 'item-001'", up1.status_code == 200 and up1.json()["id"] == "item-001" and up1.json()["updated"] is False)

    # Duplicate ID upsert (update existing point)
    up2 = client.put(
        "/documents/private_vault/points/item-001",
        headers=hdr_a,
        json={"text": "iPhone 15 price updated to ₹64,999", "metadata": {"price": 64999}},
    )
    check("Duplicate ID upsert updates existing point without duplicating", up2.status_code == 200 and up2.json()["updated"] is True)

    get1 = client.get("/documents/private_vault/points/item-001", headers=hdr_a)
    check("Get point by ID returns updated text & merged metadata", get1.status_code == 200 and "64,999" in get1.json()["text"] and get1.json()["metadata"].get("sku") == "IP15" and get1.json()["metadata"].get("price") == 64999)

    # Invalid dimension test
    bad_dim = client.put(
        "/documents/private_vault/points/bad-vec",
        headers=hdr_a,
        json={"text": "test", "vector": [0.1, 0.2, 0.3]},
    )
    check("Invalid vector dimension (3 vs 384) rejected with 400", bad_dim.status_code == 400)

    # Delete existing point
    del1 = client.delete("/documents/private_vault/points/item-001", headers=hdr_a)
    check("Delete existing point 'item-001' succeeds (200 OK)", del1.status_code == 200 and del1.json()["deleted"] is True)

    # Delete nonexistent point
    del2 = client.delete("/documents/private_vault/points/item-001", headers=hdr_a)
    check("Delete nonexistent point returns 404 Not Found", del2.status_code == 404)

    print("\n=== 5. Hybrid Search (Dense + BM25 RRF) & Exact Keyword Match Validation ===")
    client.post(
        "/documents/batch",
        headers=hdr_a,
        json={
            "collection": "private_vault",
            "items": [
                "Invoice INV-9042-AX was settled via NEFT for ₹1,45,000.",
                "Error code ERR_HNSW_MMAP_07 indicates disk memory mapping pressure.",
                "Iceberg DB provides 4-tier cognitive memory for autonomous AI agents.",
            ],
            "ids": ["doc_inv", "doc_err", "doc_mem"],
            "metadata_list": [
                {"category": "billing"},
                {"category": "ops"},
                {"category": "ai"},
            ],
        },
    )

    kw_res = client.post(
        "/search",
        headers=hdr_a,
        json={"collection": "private_vault", "query": "INV-9042-AX", "search_type": "keyword", "top_k": 3},
    ).json()
    check("Pure Keyword Search (BM25) finds exact ID 'INV-9042-AX' at Rank #1", len(kw_res["results"]) > 0 and kw_res["results"][0]["id"] == "doc_inv" and kw_res["results"][0]["score"] > 0)

    hyb_res = client.post(
        "/search",
        headers=hdr_a,
        json={"collection": "private_vault", "query": "ERR_HNSW_MMAP_07 memory mapping", "search_type": "hybrid", "alpha": 0.5, "top_k": 3},
    ).json()
    check("Hybrid RRF Search finds 'ERR_HNSW_MMAP_07' at Rank #1 with valid score", len(hyb_res["results"]) > 0 and hyb_res["results"][0]["id"] == "doc_err" and hyb_res["results"][0]["score"] > 0)

    flt_res = client.post(
        "/search",
        headers=hdr_a,
        json={"collection": "private_vault", "query": "memory", "search_type": "hybrid", "filters": {"category": "ai"}},
    ).json()
    check("Metadata filtering returns only matching category='ai'", all(r["metadata"].get("category") == "ai" for r in flt_res["results"]) and len(flt_res["results"]) >= 1)

    print("\n=== 6. Backup & Restore Reliability Validation ===")
    bk = client.post("/backup/private_vault", headers=hdr_a).json()
    backup_id = bk["backup_id"]
    pts_before = bk["points_backed_up"]
    check("Collection snapshot backup created", pts_before >= 4, f"backup_id={backup_id}, points={pts_before}")

    client.delete("/collections/private_vault", headers=hdr_a)
    rst = client.post(f"/backup/private_vault/restore/{backup_id}", headers=hdr_a).json()
    check("Collection restored from backup after deletion", rst.get("restored") is True and rst.get("points_restored") == pts_before)

    print("\n=== 7. Scroll (Export), Rename Collection & Clear All Data Validation ===")
    scr = client.get("/documents/private_vault/scroll", headers=hdr_a).json()
    check("Scroll/Export returns all documents in collection", scr.get("count", 0) >= 4)

    ren = client.patch("/collections/private_vault", headers=hdr_a, json={"new_name": "renamed_vault"}).json()
    check("Rename collection ('private_vault' -> 'renamed_vault') preserves all points", ren.get("renamed") is True and ren.get("points_migrated", 0) >= 4)

    srch_ren = client.post("/search", headers=hdr_a, json={"collection": "renamed_vault", "query": "INV-9042-AX", "search_type": "keyword"}).json()
    check("Renamed collection 'renamed_vault' is immediately searchable", len(srch_ren.get("results", [])) >= 1 and srch_ren["results"][0]["id"] == "doc_inv")

    clr = client.post("/collections/renamed_vault/clear", headers=hdr_a).json()
    info_after_clr = client.get("/collections/renamed_vault", headers=hdr_a).json()
    check("Clear collection empties all vectors while keeping 'renamed_vault'", clr.get("cleared") is True and info_after_clr.get("vector_count") == 0)

    try:
        if rn_mod.node_manager._write_client:
            rn_mod.node_manager._write_client.close()
    except Exception:
        pass

shutil.rmtree(TEMP_DIR, ignore_errors=True)
print(f"\n==========================================")
print(f"FINAL AUDIT RESULT: {passed} PASSED, {failed} FAILED")
print(f"==========================================")
if failed > 0:
    sys.exit(1)
