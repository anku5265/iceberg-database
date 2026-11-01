"""
Qdrant vector DB service with read node distribution, multi-tenant isolation,
hybrid BM25 + RRF search, and point-level CRUD operations.
Writes → Primary node only
Reads  → Distributed across replicas (load balanced)
"""
import math
import time
import uuid
from typing import Optional
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

VECTOR_SIZE = 384


def _primary():
    return node_manager.get_write_client()


def _reader(priority: str = "normal"):
    return node_manager.get_read_client(priority)


def to_qdrant_id(raw_id: Optional[str] = None) -> tuple[str, str]:
    """
    Convert any user-supplied string ID (e.g. 'doc_1' or a UUID) into a valid
    Qdrant UUID string while preserving the user's logical ID.
    Returns (qdrant_uuid_str, user_logical_id_str).
    """
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
    """
    Resolve logical collection name to tenant-scoped Qdrant collection name.
    - Dashboard collections already prefixed with 'u_<hex>__' are preserved as-is.
    - Internal '_memory_*' and '_assistant_*' collections are preserved as-is.
    - Direct SDK / API calls from authenticated tenant users are scoped to 't_<uid8>__<name>'.
    """
    if not name or not isinstance(name, str):
        raise ValueError("Collection name must be a non-empty string")
    clean = name.strip()
    if (
        clean.startswith("u_")
        or clean.startswith("t_")
        or clean.startswith("_memory_")
        or clean.startswith("_assistant_")
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


def _validate_vector(vec: list[float]):
    if not isinstance(vec, (list, tuple)) or len(vec) == 0:
        raise ValueError("Vector cannot be empty")
    if len(vec) != VECTOR_SIZE:
        raise ValueError(f"Invalid vector dimension: expected {VECTOR_SIZE}, got {len(vec)}")
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

def create_collection(name: str, user_id: Optional[str] = None) -> bool:
    scoped = resolve_collection(name, user_id)
    client = _primary()
    existing = [c.name for c in client.get_collections().collections]
    if scoped in existing:
        return False
    client.create_collection(
        collection_name=scoped,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )
    return True


def delete_collection(name: str, user_id: Optional[str] = None) -> bool:
    scoped = resolve_collection(name, user_id)
    _primary().delete_collection(scoped)
    return True


def clear_collection(name: str, user_id: Optional[str] = None) -> bool:
    """Delete all vectors/documents inside a collection while keeping the collection itself."""
    scoped = resolve_collection(name, user_id)
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
    """Rename a collection by migrating all points & vectors to new_name and removing old_name."""
    old_scoped = resolve_collection(old_name, user_id)
    new_scoped = resolve_collection(new_name, user_id)
    client = _primary()
    existing = [c.name for c in client.get_collections().collections]
    if old_scoped not in existing:
        raise ValueError(f"Collection '{old_name}' not found")
    if new_scoped in existing:
        raise ValueError(f"Collection '{new_name}' already exists")

    client.create_collection(
        collection_name=new_scoped,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
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


def scroll_points(collection: str, limit: int = 100, offset: int = 0, user_id: Optional[str] = None) -> list[dict]:
    """Export/scroll points and metadata from a collection."""
    scoped = resolve_collection(collection, user_id)
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
    info = _primary().get_collection(scoped)
    pts = getattr(info, "points_count", None)
    if pts is None:
        pts = getattr(info, "vectors_count", 0)
    return {
        "vector_count": pts or 0,
        "status": str(info.status),
    }


def list_collections(user_id: Optional[str] = None) -> list[str]:
    all_cols = [c.name for c in _primary().get_collections().collections]
    if not user_id or user_id == "dev_user_001":
        return [c for c in all_cols if not c.startswith("t_")]

    uid_prefix = f"t_{user_id[:8]}__"
    visible = []
    for c in all_cols:
        if c.startswith(uid_prefix):
            visible.append(c[len(uid_prefix):])
        elif c.startswith("u_"):
            # Preserve Dashboard u_<hex>__ namespaces for client-side filtering in api.js
            visible.append(c)
    return visible


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
    existing = get_point(scoped, point_id, user_id=None)
    if not existing:
        return False
    q_id, _ = to_qdrant_id(point_id)
    _primary().delete(
        collection_name=scoped,
        points_selector=PointIdsList(points=[q_id]),
    )
    return True


# ── Search ────────────────────────────────────────────────────────────────────

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
) -> list[dict]:
    """Semantic-only search with read node routing."""
    _validate_vector(query_vector)
    scoped = resolve_collection(collection, user_id)
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
    query_vector: list[float],
    top_k: int = 5,
    score_threshold: float = 0.0,
    filters: dict = None,
    alpha: float = 0.5,
    priority: str = "normal",
    user_id: Optional[str] = None,
) -> list[dict]:
    """
    Hybrid search: Dense (semantic) + Sparse (BM25 keyword) combined via RRF.

    alpha=0.0  → pure keyword (BM25)
    alpha=0.5  → balanced RRF (default)
    alpha=1.0  → pure semantic
    """
    from services.hybrid_search import hybrid_search

    _validate_vector(query_vector)
    scoped = resolve_collection(collection, user_id)
    t0 = time.time()
    client, stats = _reader(priority)

    query_filter = _build_filter(filters)
    fetch_k = max(top_k * 6, 100)

    # 1. Fetch top dense candidates WITHOUT a restrictive score_threshold so keyword hits aren't dropped
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

    # 2. Also scroll collection points (up to 500) so exact BM25 keyword matches outside top fetch_k are guaranteed
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
    return node_manager.get_status()
