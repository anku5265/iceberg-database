"""
Unified Vector & Hybrid Engine Service (IcebergCore Rust v1.0.0 + Qdrant Cloud Safe Mode)
=========================================================================================
Routing Policy (100% Zero Data Loss):
  - Local / BYOC / Test Mode: Uses native multi-threaded Rust Engine (`iceberg-core-rs`) automatically
    when compiled binary is available, supporting multi-dimension (1..8192), 4 metrics, SQ8/Binary
    quantization, native Okapi BM25 + RRF, rich metadata filters, cognitive decay, and CRC32 WAL.
  - Production Cloud Mode (`QDRANT_URL` = remote Qdrant Cloud): Keeps all existing user collections
    (`u_*`, `t_*`, `_memory_*`, `_assistant_*`) 100% untouched on Qdrant Cloud, while also allowing
    explicit `engine="rust"` or quantized collections on the Rust engine when enabled.
"""

import math
import os
import time
import uuid
from typing import Any, Dict, List, Optional
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    PointIdsList,
    Filter,
    FieldCondition,
    MatchValue,
)
from services.read_nodes import node_manager
from services.rust_engine import rust_engine
from services.r2_persistence import r2_shield

VECTOR_SIZE = 384

_QDRANT_DISTANCE_MAP = {
    "cosine": Distance.COSINE,
    "cos": Distance.COSINE,
    "dotproduct": Distance.DOT,
    "dot": Distance.DOT,
    "ip": Distance.DOT,
    "euclidean": Distance.EUCLID,
    "euclid": Distance.EUCLID,
    "l2": Distance.EUCLID,
    "manhattan": Distance.MANHATTAN,
    "l1": Distance.MANHATTAN,
}


def _primary():
    return node_manager.get_write_client()


def _reader(priority: str = "normal"):
    return node_manager.get_read_client(priority)


def _use_rust_default() -> bool:
    forced = os.environ.get("ICEBERG_ENGINE", "").strip().lower()
    if forced == "qdrant":
        return False
    if forced == "rust":
        return rust_engine.is_binary_available()
    # In local / BYOC / validation test mode, default to our Native Rust Engine!
    # In remote Qdrant Cloud server mode, preserve existing Qdrant Cloud data safely!
    if node_manager._is_server_mode():
        return False
    return rust_engine.is_binary_available()


def _is_rust_collection(scoped: str) -> bool:
    if _use_rust_default():
        return True
    if rust_engine.is_binary_available() and os.environ.get("ICEBERG_HYBRID_RUST", "").strip() == "1":
        try:
            rust_engine.get_collection(scoped)
            return True
        except Exception:
            return False
    return False


def to_qdrant_id(raw_id: Optional[str] = None) -> tuple[str, str]:
    if not raw_id:
        u = str(uuid.uuid4())
        return u, u
    raw_str = str(raw_id).strip()
    try:
        parsed = uuid.UUID(raw_str)
        return str(parsed), raw_str
    except Exception:
        det_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"iceberg.point.{raw_str}"))
        return det_uuid, raw_str


def resolve_collection(name: str, user_id: Optional[str] = None) -> str:
    if not name or not isinstance(name, str):
        raise ValueError("Collection name must be a non-empty string")
    clean = name.strip()
    if (
        clean.startswith("u_")
        or clean.startswith("t_")
        or clean.startswith("_memory_")
        or clean.startswith("_assistant_")
        or clean.startswith("_asst_")
    ):
        return clean
    if not user_id or user_id == "dev_user_001":
        return clean
    uid_prefix = f"t_{user_id[:8]}__"
    return f"{uid_prefix}{clean}"


def strip_tenant_prefix(raw_name: str, user_id: Optional[str] = None) -> str:
    if user_id and user_id != "dev_user_001":
        uid_prefix = f"t_{user_id[:8]}__"
        if raw_name.startswith(uid_prefix):
            return raw_name[len(uid_prefix):]
    return raw_name


def _validate_vector(vec: list[float], expected_dim: Optional[int] = None):
    if not isinstance(vec, (list, tuple)) or len(vec) == 0:
        raise ValueError("Vector cannot be empty")
    if expected_dim is not None and len(vec) != expected_dim:
        raise ValueError(f"Invalid vector dimension: expected {expected_dim}, got {len(vec)}")
    for val in vec:
        if not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
            raise ValueError("Vector contains invalid NaN or Inf values")


def _cosine_sim(v1: list[float], v2: list[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    if n1 == 0.0 or n2 == 0.0:
        return 0.0
    return dot / (n1 * n2)


# ── Collections ──────────────────────────────────────────────────────────────

def create_collection(
    name: str,
    user_id: Optional[str] = None,
    dimension: int = VECTOR_SIZE,
    metric: str = "cosine",
    quantization: str = "float32",
    engine: Optional[str] = None,
) -> bool:
    scoped = resolve_collection(name, user_id)
    if dimension <= 0 or dimension > 8192:
        raise ValueError(f"Invalid vector dimension {dimension}: must be between 1 and 8192")

    metric_clean = (metric or "cosine").strip().lower()
    if metric_clean not in _QDRANT_DISTANCE_MAP:
        raise ValueError(f"Unsupported metric '{metric}'. Supported: cosine, dotproduct, euclidean, manhattan")

    use_rust = (engine == "rust" and rust_engine.is_binary_available()) or (
        engine != "qdrant" and _use_rust_default()
    )
    if use_rust:
        created = rust_engine.create_collection(
            name=scoped,
            dimension=dimension,
            metric=metric_clean,
            quantization=(quantization or "float32").strip().lower(),
        )
        if created:
            r2_shield.mark_collection_dirty(scoped)
        return created

    client = _primary()
    existing = [c.name for c in client.get_collections().collections]
    if scoped in existing:
        return False
    client.create_collection(
        collection_name=scoped,
        vectors_config=VectorParams(
            size=int(dimension),
            distance=_QDRANT_DISTANCE_MAP[metric_clean],
        ),
    )
    return True


def delete_collection(name: str, user_id: Optional[str] = None) -> bool:
    scoped = resolve_collection(name, user_id)
    if _is_rust_collection(scoped):
        res = rust_engine.delete_collection(scoped)
        r2_shield.mark_collection_deleted(scoped)
        return res
    _primary().delete_collection(scoped)
    return True


def clear_collection(name: str, user_id: Optional[str] = None) -> bool:
    scoped = resolve_collection(name, user_id)
    if _is_rust_collection(scoped):
        res = rust_engine.clear_collection(scoped)
        if res:
            r2_shield.mark_collection_dirty(scoped)
        return res

    client = _primary()
    existing = [c.name for c in client.get_collections().collections]
    if scoped not in existing:
        return False
    while True:
        records, _ = client.scroll(
            collection_name=scoped,
            limit=500,
            with_payload=False,
            with_vectors=False,
        )
        if not records:
            break
        ids_to_del = [r.id for r in records]
        client.delete(
            collection_name=scoped,
            points_selector=PointIdsList(points=ids_to_del),
        )
    return True


def rename_collection(old_name: str, new_name: str, user_id: Optional[str] = None) -> dict:
    old_scoped = resolve_collection(old_name, user_id)
    new_scoped = resolve_collection(new_name, user_id)
    if _is_rust_collection(old_scoped):
        res = rust_engine.rename_collection(old_scoped, new_scoped)
        r2_shield.mark_collection_deleted(old_scoped)
        r2_shield.mark_collection_dirty(new_scoped)
        return {
            "old_name": old_name,
            "new_name": new_name,
            "points_migrated": res.get("points_migrated", 0),
        }

    client = _primary()
    existing = [c.name for c in client.get_collections().collections]
    if old_scoped not in existing:
        raise ValueError(f"Collection '{old_name}' not found")
    if new_scoped in existing:
        raise ValueError(f"Collection '{new_name}' already exists")

    old_info = client.get_collection(old_scoped)
    vec_cfg = getattr(old_info.config.params, "vectors", None)
    dim = getattr(vec_cfg, "size", VECTOR_SIZE)
    dist = getattr(vec_cfg, "distance", Distance.COSINE)

    client.create_collection(
        collection_name=new_scoped,
        vectors_config=VectorParams(size=dim, distance=dist),
    )
    points_migrated = 0
    offset = None
    while True:
        records, next_offset = client.scroll(
            collection_name=old_scoped,
            limit=250,
            offset=offset,
            with_payload=True,
            with_vectors=True,
        )
        if records:
            pts = [
                PointStruct(id=r.id, vector=r.vector, payload=dict(r.payload or {}))
                for r in records
            ]
            client.upsert(collection_name=new_scoped, points=pts)
            points_migrated += len(pts)
        if next_offset is None or not records:
            break
        offset = next_offset

    client.delete_collection(old_scoped)
    return {"old_name": old_name, "new_name": new_name, "points_migrated": points_migrated}


def scroll_points(
    collection: str,
    limit: int = 100,
    offset: int = 0,
    user_id: Optional[str] = None,
) -> list[dict]:
    scoped = resolve_collection(collection, user_id)
    if _is_rust_collection(scoped):
        pts = rust_engine.scroll_points(scoped, limit=limit, offset=offset, with_vectors=False)
        out = []
        for p in pts:
            payload = dict(p.get("payload") or {})
            out.append({
                "id": payload.get("_doc_id") or str(p.get("id")),
                "text": payload.get("text", ""),
                "metadata": {k: v for k, v in payload.items() if k != "text" and not k.startswith("_")},
                "namespace": payload.get("_namespace", ""),
            })
        return out

    client = _primary()
    existing = [c.name for c in client.get_collections().collections]
    if scoped not in existing:
        return []
    records, _ = client.scroll(
        collection_name=scoped,
        limit=max(1, min(limit + offset, 1000)),
        with_payload=True,
        with_vectors=False,
    )
    sliced = records[offset:offset + limit]
    out = []
    for r in sliced:
        payload = dict(r.payload or {})
        out.append({
            "id": payload.get("_doc_id") or str(r.id),
            "text": payload.get("text", ""),
            "metadata": {k: v for k, v in payload.items() if k != "text" and not k.startswith("_")},
            "namespace": payload.get("_namespace", ""),
        })
    return out


def get_collection_info(name: str, user_id: Optional[str] = None) -> dict:
    scoped = resolve_collection(name, user_id)
    if _is_rust_collection(scoped):
        st = rust_engine.get_collection(scoped)
        return {
            "vector_count": st.get("vector_count", 0),
            "dimension": st.get("dimension", VECTOR_SIZE),
            "metric": st.get("metric", "cosine"),
            "quantization": st.get("quantization", "float32"),
            "engine": st.get("engine", "iceberg-core-rs/1.0.0"),
            "status": st.get("status", "green"),
        }

    info = _primary().get_collection(scoped)
    pts = getattr(info, "points_count", None)
    if pts is None:
        pts = getattr(info, "vectors_count", 0)
    vec_cfg = getattr(info.config.params, "vectors", None)
    dim = getattr(vec_cfg, "size", VECTOR_SIZE)
    return {
        "vector_count": pts or 0,
        "dimension": dim,
        "metric": "cosine",
        "quantization": "float32",
        "engine": "qdrant-cloud",
        "status": str(info.status),
    }


def get_collection_stats(name: str, user_id: Optional[str] = None) -> dict:
    scoped = resolve_collection(name, user_id)
    if _is_rust_collection(scoped):
        st = rust_engine.get_collection(scoped)
        st["name"] = name
        return st

    info = _primary().get_collection(scoped)
    pts = getattr(info, "points_count", None)
    if pts is None:
        pts = getattr(info, "vectors_count", 0)
    vec_cfg = getattr(info.config.params, "vectors", None)
    dim = getattr(vec_cfg, "size", VECTOR_SIZE)
    count = int(pts or 0)
    ram_est = count * int(dim) * 4
    return {
        "name": name,
        "status": str(info.status),
        "engine": "qdrant-cloud",
        "vector_count": count,
        "dimension": int(dim),
        "metric": "cosine",
        "quantization": "float32",
        "float32_ram_bytes": ram_est,
        "quantized_ram_bytes": ram_est,
        "compression_ratio": 1.0,
        "namespaces": {},
    }


def list_collections(user_id: Optional[str] = None) -> list[str]:
    if _use_rust_default():
        all_cols = [c["name"] for c in rust_engine.list_collections() if not c["name"].startswith("_sys_")]
    else:
        all_cols = [c.name for c in _primary().get_collections().collections if not c.name.startswith("_sys_")]

    if not user_id or user_id == "dev_user_001":
        return [c for c in all_cols if not c.startswith("t_")]

    uid_prefix = f"t_{user_id[:8]}__"
    visible = []
    for c in all_cols:
        if c.startswith(uid_prefix):
            visible.append(c[len(uid_prefix):])
        elif c.startswith("u_"):
            visible.append(c)
    return visible


# ── Backup & Restore Helpers (Engine-Agnostic) ───────────────────────────────

def export_backup_points(collection: str, user_id: Optional[str] = None) -> tuple[str, dict, list[dict]]:
    scoped = resolve_collection(collection, user_id)
    meta_info = get_collection_info(collection, user_id=user_id)
    if _is_rust_collection(scoped):
        pts = rust_engine.scroll_points(scoped, limit=10000, offset=0, with_vectors=True)
        formatted = [
            {"id": str(p["id"]), "vector": p.get("vector", []), "payload": p.get("payload", {})}
            for p in pts
        ]
        return scoped, meta_info, formatted

    client = _primary()
    points, _ = client.scroll(collection_name=scoped, limit=10000, with_payload=True, with_vectors=True)
    formatted = [{"id": str(p.id), "vector": p.vector, "payload": p.payload} for p in points]
    return scoped, meta_info, formatted


def restore_backup_points(collection: str, backup_data: dict, user_id: Optional[str] = None) -> int:
    scoped = resolve_collection(collection, user_id)
    dim = int(backup_data.get("dimension") or VECTOR_SIZE)
    metric = str(backup_data.get("metric") or "cosine")
    quantization = str(backup_data.get("quantization") or "float32")
    raw_points = backup_data.get("points") or []

    try:
        delete_collection(collection, user_id=user_id)
    except Exception:
        pass
    create_collection(
        collection,
        user_id=user_id,
        dimension=dim,
        metric=metric,
        quantization=quantization,
    )

    if not raw_points:
        return 0

    if _is_rust_collection(scoped):
        rust_pts = [
            {
                "id": str(p.get("payload", {}).get("_doc_id") or p["id"]),
                "vector": p["vector"],
                "payload": p.get("payload") or {},
            }
            for p in raw_points
        ]
        rust_engine.upsert_points(scoped, rust_pts)
        r2_shield.mark_collection_dirty(scoped)
        return len(rust_pts)

    client = _primary()
    pts = [
        PointStruct(id=to_qdrant_id(str(p["id"]))[0], vector=p["vector"], payload=p.get("payload") or {})
        for p in raw_points
    ]
    client.upsert(collection_name=scoped, points=pts)
    return len(pts)


# ── Vectors & Point CRUD ──────────────────────────────────────────────────────

def upsert_vectors(
    collection: str,
    texts: list[str],
    vectors: list[list[float]],
    metadata: list[dict],
    namespace: str = "",
    ids: Optional[list[str]] = None,
    user_id: Optional[str] = None,
) -> list[str]:
    scoped = resolve_collection(collection, user_id)
    if not texts or not vectors:
        raise ValueError("Texts and vectors cannot be empty")
    if len(texts) != len(vectors):
        raise ValueError("Texts and vectors length mismatch")

    if _is_rust_collection(scoped):
        rust_pts = []
        logical_ids = []
        for idx, (text, vec, meta) in enumerate(zip(texts, vectors, metadata)):
            _validate_vector(vec)
            raw_id = ids[idx] if (ids and idx < len(ids) and ids[idx]) else str(uuid.uuid4())
            l_id = str(raw_id).strip()
            logical_ids.append(l_id)
            clean_meta = dict(meta or {})
            rust_pts.append({
                "id": l_id,
                "vector": list(vec),
                "namespace": namespace or "",
                "payload": {
                    "text": text,
                    "_namespace": namespace or "",
                    "_doc_id": l_id,
                    **clean_meta,
                },
            })
        rust_engine.upsert_points(scoped, rust_pts)
        r2_shield.mark_collection_dirty(scoped)
        return logical_ids

    points = []
    logical_ids = []
    for idx, (text, vec, meta) in enumerate(zip(texts, vectors, metadata)):
        _validate_vector(vec)
        raw_id = ids[idx] if (ids and idx < len(ids)) else None
        q_id, l_id = to_qdrant_id(raw_id)
        logical_ids.append(l_id)
        clean_meta = dict(meta or {})
        points.append(
            PointStruct(
                id=q_id,
                vector=list(vec),
                payload={
                    "text": text,
                    "_namespace": namespace or "",
                    "_doc_id": l_id,
                    **clean_meta,
                },
            )
        )

    _primary().upsert(collection_name=scoped, points=points)
    return logical_ids


def get_point(collection: str, point_id: str, user_id: Optional[str] = None) -> Optional[dict]:
    scoped = resolve_collection(collection, user_id)
    if _is_rust_collection(scoped):
        pts = rust_engine.get_points(scoped, [str(point_id).strip()], with_vectors=True)
        if not pts:
            return None
        rec = pts[0]
        payload = dict(rec.get("payload") or {})
        logical_id = payload.get("_doc_id") or str(rec["id"])
        text = payload.get("text", "")
        meta = {k: v for k, v in payload.items() if k != "text" and not k.startswith("_")}
        return {
            "id": logical_id,
            "text": text,
            "vector": rec.get("vector"),
            "metadata": meta,
            "namespace": payload.get("_namespace", ""),
        }

    q_id, _ = to_qdrant_id(point_id)
    records = _primary().retrieve(
        collection_name=scoped,
        ids=[q_id],
        with_payload=True,
        with_vectors=True,
    )
    if not records:
        return None
    rec = records[0]
    payload = dict(rec.payload or {})
    logical_id = payload.get("_doc_id") or str(rec.id)
    text = payload.get("text", "")
    meta = {k: v for k, v in payload.items() if k != "text" and not k.startswith("_")}
    return {
        "id": logical_id,
        "text": text,
        "vector": rec.vector,
        "metadata": meta,
        "namespace": payload.get("_namespace", ""),
    }


def delete_point(collection: str, point_id: str, user_id: Optional[str] = None) -> bool:
    scoped = resolve_collection(collection, user_id)
    if _is_rust_collection(scoped):
        deleted = rust_engine.delete_points(scoped, ids=[str(point_id).strip()])
        if deleted > 0:
            r2_shield.mark_collection_dirty(scoped)
        return deleted > 0

    existing = get_point(scoped, point_id, user_id=None)
    if not existing:
        return False
    q_id, _ = to_qdrant_id(point_id)
    _primary().delete(
        collection_name=scoped,
        points_selector=PointIdsList(points=[q_id]),
    )
    return True


# ── Native Raw Vector Batch APIs (Multi-Dimension LangChain/LlamaIndex/Pinecone-Parity) ──

def upsert_raw_vectors(
    collection: str,
    vectors_batch: List[Dict[str, Any]],
    namespace: str = "",
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    if not vectors_batch:
        raise ValueError("vectors list cannot be empty")
    scoped = resolve_collection(collection, user_id)
    first_vec = vectors_batch[0].get("values") or vectors_batch[0].get("vector")
    _validate_vector(first_vec)
    dim = len(first_vec)

    if _is_rust_collection(scoped):
        rust_pts = []
        for item in vectors_batch:
            vec = item.get("values") if "values" in item and item["values"] is not None else item.get("vector")
            _validate_vector(vec)
            pid = str(item.get("id") or uuid.uuid4()).strip()
            meta = dict(item.get("metadata") or item.get("payload") or {})
            text_val = item.get("text") or meta.get("text", "")
            pt_ns = item.get("namespace") if item.get("namespace") is not None else namespace
            payload = {
                "text": text_val,
                "_namespace": pt_ns or "",
                "_doc_id": pid,
                **meta,
            }
            rust_pts.append({
                "id": pid,
                "vector": list(vec),
                "namespace": pt_ns or "",
                "payload": payload,
                "timestamp": item.get("timestamp"),
                "importance": item.get("importance"),
            })
        res = rust_engine.upsert_points(scoped, rust_pts, auto_create_dim=dim)
        r2_shield.mark_collection_dirty(scoped)
        return {
            "upserted_count": res.get("upserted", len(rust_pts)),
            "inserted": res.get("inserted", 0),
            "updated": res.get("updated", 0),
            "collection": collection,
            "dimension": dim,
            "namespace": namespace or "",
        }

    # Qdrant Cloud path
    create_collection(collection, user_id=user_id, dimension=dim)
    pts = []
    for item in vectors_batch:
        vec = item.get("values") if "values" in item and item["values"] is not None else item.get("vector")
        _validate_vector(vec, expected_dim=dim)
        raw_id = str(item.get("id") or uuid.uuid4()).strip()
        q_id, l_id = to_qdrant_id(raw_id)
        meta = dict(item.get("metadata") or item.get("payload") or {})
        text_val = item.get("text") or meta.get("text", "")
        pt_ns = item.get("namespace") if item.get("namespace") is not None else namespace
        pts.append(
            PointStruct(
                id=q_id,
                vector=list(vec),
                payload={"text": text_val, "_namespace": pt_ns or "", "_doc_id": l_id, **meta},
            )
        )
    _primary().upsert(collection_name=scoped, points=pts)
    return {
        "upserted_count": len(pts),
        "collection": collection,
        "dimension": dim,
        "namespace": namespace or "",
    }


def query_raw_vectors(
    collection: str,
    vector: Optional[List[float]] = None,
    query_text: Optional[str] = None,
    top_k: int = 5,
    filter_obj: Optional[Dict[str, Any]] = None,
    namespace: str = "",
    search_type: str = "semantic",
    alpha: float = 0.5,
    score_threshold: float = 0.0,
    include_values: bool = False,
    include_metadata: bool = True,
    use_cognitive_decay: bool = False,
    decay_lambda: float = 0.015,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    scoped = resolve_collection(collection, user_id)
    if vector is not None:
        _validate_vector(vector)

    if _is_rust_collection(scoped):
        res = rust_engine.search(
            collection=scoped,
            vector=vector,
            query_text=query_text,
            top_k=top_k,
            search_type=search_type,
            alpha=alpha,
            score_threshold=score_threshold,
            filter_obj=filter_obj,
            namespace=namespace or None,
            use_cognitive_decay=use_cognitive_decay,
            decay_lambda=decay_lambda,
            with_vectors=include_values,
        )
        matches = []
        for r in res.get("results", []):
            payload = dict(r.get("payload") or {})
            clean_meta = {k: v for k, v in payload.items() if not k.startswith("_")}
            match_item: Dict[str, Any] = {
                "id": payload.get("_doc_id") or r["id"],
                "score": r["score"],
            }
            if include_metadata:
                match_item["metadata"] = clean_meta
                match_item["text"] = payload.get("text", "")
            if include_values and r.get("vector") is not None:
                match_item["values"] = r["vector"]
            matches.append(match_item)
        return {
            "matches": matches,
            "namespace": namespace or "",
            "collection": collection,
            "latency_ms": res.get("latency_ms", 0.0),
        }

    # Qdrant fallback
    if vector is None:
        raise ValueError("vector is required when querying Qdrant backend directly")
    flt = dict(filter_obj or {})
    if namespace:
        flt["_namespace"] = namespace
    raw = search_vectors(
        collection=collection,
        query_vector=vector,
        top_k=top_k,
        score_threshold=score_threshold,
        filters=flt or None,
        user_id=user_id,
    )
    matches = [
        {
            "id": r["id"],
            "score": r["score"],
            **({"metadata": r["metadata"], "text": r["text"]} if include_metadata else {}),
        }
        for r in raw
    ]
    return {"matches": matches, "namespace": namespace or "", "collection": collection}


def delete_raw_vectors(
    collection: str,
    ids: Optional[List[str]] = None,
    filter_obj: Optional[Dict[str, Any]] = None,
    namespace: str = "",
    delete_all: bool = False,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    scoped = resolve_collection(collection, user_id)
    if _is_rust_collection(scoped):
        cnt = rust_engine.delete_points(
            collection=scoped,
            ids=ids,
            filter_obj=filter_obj,
            namespace=namespace or None,
            delete_all=delete_all,
        )
        if cnt > 0 or delete_all:
            r2_shield.mark_collection_dirty(scoped)
        return {"deleted_count": cnt, "collection": collection}

    if delete_all and not namespace and not filter_obj and not ids:
        clear_collection(collection, user_id=user_id)
        return {"deleted_count": -1, "collection": collection}

    cnt = 0
    for pid in (ids or []):
        if delete_point(collection, pid, user_id=user_id):
            cnt += 1
    return {"deleted_count": cnt, "collection": collection}


# ── Search (Used by /search, /memory, /assistant) ─────────────────────────────

def _build_filter(filters: Optional[dict]) -> Optional[Filter]:
    if not filters:
        return None
    conditions = [
        FieldCondition(key=k, match=MatchValue(value=v))
        for k, v in filters.items()
    ]
    return Filter(must=conditions)


def _execute_qdrant_search(client, collection_name: str, query_vector: list[float], limit: int, score_threshold: Optional[float], query_filter: Optional[Filter]):
    if hasattr(client, "search"):
        return client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=limit,
            score_threshold=score_threshold,
            with_payload=True,
            query_filter=query_filter,
        )
    res = client.query_points(
        collection_name=collection_name,
        query=query_vector,
        limit=limit,
        score_threshold=score_threshold,
        with_payload=True,
        query_filter=query_filter,
    )
    return res.points


def search_vectors(
    collection: str,
    query_vector: list[float],
    top_k: int = 5,
    score_threshold: float = 0.0,
    filters: dict = None,
    priority: str = "normal",
    user_id: Optional[str] = None,
    use_cognitive_decay: bool = False,
    decay_lambda: float = 0.015,
) -> list[dict]:
    _validate_vector(query_vector)
    scoped = resolve_collection(collection, user_id)

    if _is_rust_collection(scoped):
        t0 = time.time()
        res = rust_engine.search(
            collection=scoped,
            vector=query_vector,
            top_k=max(1, top_k),
            search_type="semantic",
            alpha=1.0,
            score_threshold=score_threshold,
            filter_obj=filters,
            use_cognitive_decay=use_cognitive_decay,
            decay_lambda=decay_lambda,
        )
        latency_ms = (time.time() - t0) * 1000
        _, stats = _reader(priority)
        node_manager.record_query(stats, latency_ms)

        out = []
        for r in res.get("results", []):
            payload = dict(r.get("payload") or {})
            out.append({
                "id": payload.get("_doc_id") or str(r["id"]),
                "text": payload.get("text", ""),
                "score": round(float(r["score"]), 4),
                "metadata": {k: v for k, v in payload.items() if k != "text" and not k.startswith("_")},
                "_latency_ms": round(latency_ms, 2),
            })
        return out

    t0 = time.time()
    client, stats = _reader(priority)
    query_filter = _build_filter(filters)
    results = _execute_qdrant_search(
        client=client,
        collection_name=scoped,
        query_vector=query_vector,
        limit=max(1, top_k),
        score_threshold=score_threshold if score_threshold > 0 else None,
        query_filter=query_filter,
    )
    latency_ms = (time.time() - t0) * 1000
    node_manager.record_query(stats, latency_ms)

    out = []
    for r in results:
        payload = dict(r.payload or {})
        out.append({
            "id": payload.get("_doc_id") or str(r.id),
            "text": payload.get("text", ""),
            "score": round(float(r.score), 4),
            "metadata": {k: v for k, v in payload.items() if k != "text" and not k.startswith("_")},
            "_latency_ms": round(latency_ms, 2),
        })
    return out


def hybrid_search_vectors(
    collection: str,
    query: str,
    query_vector: Optional[list[float]],
    top_k: int = 5,
    score_threshold: float = 0.0,
    filters: dict = None,
    alpha: float = 0.5,
    priority: str = "normal",
    user_id: Optional[str] = None,
    use_cognitive_decay: bool = False,
    decay_lambda: float = 0.015,
) -> list[dict]:
    if query_vector is not None:
        _validate_vector(query_vector)
    scoped = resolve_collection(collection, user_id)

    if _is_rust_collection(scoped):
        t0 = time.time()
        stype = "keyword" if alpha <= 0.05 else ("semantic" if alpha >= 0.95 else "hybrid")
        res = rust_engine.search(
            collection=scoped,
            vector=query_vector,
            query_text=query,
            top_k=max(1, top_k),
            search_type=stype,
            alpha=alpha,
            score_threshold=score_threshold,
            filter_obj=filters,
            use_cognitive_decay=use_cognitive_decay,
            decay_lambda=decay_lambda,
        )
        latency_ms = (time.time() - t0) * 1000
        _, stats = _reader(priority)
        node_manager.record_query(stats, latency_ms)

        out = []
        for r in res.get("results", []):
            payload = dict(r.get("payload") or {})
            out.append({
                "id": payload.get("_doc_id") or str(r["id"]),
                "text": payload.get("text", ""),
                "score": round(float(r["score"]), 4),
                "metadata": {k: v for k, v in payload.items() if k != "text" and not k.startswith("_")},
                "_latency_ms": round(latency_ms, 2),
                "_search_type": stype,
            })
        return out

    from services.hybrid_search import hybrid_search

    if query_vector is None:
        raise ValueError("query_vector required for Qdrant hybrid search")

    t0 = time.time()
    client, stats = _reader(priority)
    query_filter = _build_filter(filters)
    fetch_k = max(top_k * 6, 100)

    semantic_results = _execute_qdrant_search(
        client=client,
        collection_name=scoped,
        query_vector=query_vector,
        limit=fetch_k,
        score_threshold=None,
        query_filter=query_filter,
    )

    candidates_by_id = {}
    for r in semantic_results:
        qid = str(r.id)
        candidates_by_id[qid] = {
            "id": (r.payload or {}).get("_doc_id") or qid,
            "payload": dict(r.payload or {}),
            "semantic_score": float(r.score),
        }

    if alpha < 0.95:
        try:
            scrolled, _ = client.scroll(
                collection_name=scoped,
                scroll_filter=query_filter,
                limit=500,
                with_payload=True,
                with_vectors=True,
            )
            for p in scrolled:
                qid = str(p.id)
                if qid not in candidates_by_id:
                    sim = _cosine_sim(query_vector, p.vector) if isinstance(p.vector, list) else 0.0
                    candidates_by_id[qid] = {
                        "id": (p.payload or {}).get("_doc_id") or qid,
                        "payload": dict(p.payload or {}),
                        "semantic_score": float(sim),
                    }
        except Exception:
            pass

    if not candidates_by_id:
        return []

    candidate_list = list(candidates_by_id.values())
    texts = [c["payload"].get("text", "") for c in candidate_list]
    semantic_scores = [c["semantic_score"] for c in candidate_list]

    ranked = hybrid_search(
        texts=texts,
        query=query,
        query_vector=query_vector,
        semantic_scores=semantic_scores,
        top_k=top_k,
        alpha=alpha,
    )

    latency_ms = (time.time() - t0) * 1000
    node_manager.record_query(stats, latency_ms)

    out = []
    for idx, combined_score in ranked:
        if idx >= len(candidate_list):
            continue
        if alpha >= 0.95 and score_threshold > 0 and combined_score < score_threshold:
            continue
        cand = candidate_list[idx]
        payload = cand["payload"]
        out.append({
            "id": cand["id"],
            "text": payload.get("text", ""),
            "score": round(float(combined_score), 4),
            "metadata": {k: v for k, v in payload.items() if k != "text" and not k.startswith("_")},
            "_latency_ms": round(latency_ms, 2),
            "_search_type": "keyword" if alpha <= 0.05 else ("semantic" if alpha >= 0.95 else "hybrid"),
        })
    return out


# ── Node status ───────────────────────────────────────────────────────────────

def get_node_status() -> dict:
    st = node_manager.get_status()
    st["rust_engine_available"] = rust_engine.is_binary_available()
    st["active_engine"] = "iceberg-core-rs" if _use_rust_default() else "qdrant-cloud"
    return st
