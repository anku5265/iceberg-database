"""
Qdrant vector DB service with read node distribution.
Writes → Primary node only
Reads  → Distributed across replicas (load balanced)
"""
import time
import uuid
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from services.read_nodes import node_manager

VECTOR_SIZE = 384

def _primary():
    return node_manager.get_write_client()

def _reader(priority: str = "normal"):
    return node_manager.get_read_client(priority)

# ── Collections ──────────────────────────────────────────────────────────────

def create_collection(name: str) -> bool:
    client = _primary()
    existing = [c.name for c in client.get_collections().collections]
    if name in existing:
        return False
    client.create_collection(
        collection_name=name,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )
    return True

def delete_collection(name: str) -> bool:
    _primary().delete_collection(name)
    return True

def get_collection_info(name: str) -> dict:
    info = _primary().get_collection(name)
    return {
        "vector_count": info.vectors_count or 0,
        "status": str(info.status),
    }

def list_collections() -> list[str]:
    return [c.name for c in _primary().get_collections().collections]

# ── Vectors ───────────────────────────────────────────────────────────────────

def upsert_vectors(collection: str, texts: list[str], vectors: list[list[float]], metadata: list[dict], namespace: str = "") -> int:
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vec,
            payload={"text": text, "_namespace": namespace, **meta}
        )
        for text, vec, meta in zip(texts, vectors, metadata)
    ]
    _primary().upsert(collection_name=collection, points=points)
    return len(points)

# ── Search ────────────────────────────────────────────────────────────────────

def search_vectors(
    collection: str,
    query_vector: list[float],
    top_k: int = 5,
    score_threshold: float = 0.3,
    filters: dict = None,
    priority: str = "normal",
) -> list[dict]:
    """Semantic-only search with read node routing."""
    t0 = time.time()
    client, stats = _reader(priority)

    query_filter = None
    if filters:
        conditions = [
            FieldCondition(key=k, match=MatchValue(value=v))
            for k, v in filters.items()
        ]
        query_filter = Filter(must=conditions)

    results = client.search(
        collection_name=collection,
        query_vector=query_vector,
        limit=top_k,
        score_threshold=score_threshold,
        with_payload=True,
        query_filter=query_filter,
    )

    latency_ms = (time.time() - t0) * 1000
    node_manager.record_query(stats, latency_ms)

    return [
        {
            "text": r.payload.get("text", ""),
            "score": r.score,
            "metadata": {k: v for k, v in r.payload.items() if k != "text"},
            "_latency_ms": round(latency_ms, 2),
        }
        for r in results
    ]

def hybrid_search_vectors(
    collection: str,
    query: str,
    query_vector: list[float],
    top_k: int = 5,
    score_threshold: float = 0.2,
    filters: dict = None,
    alpha: float = 0.5,
    priority: str = "normal",
) -> list[dict]:
    """
    Hybrid search: Dense (semantic) + Sparse (BM25 keyword) combined via RRF.

    alpha=0.0  → pure keyword (BM25)
    alpha=0.5  → balanced (default — best for most use cases)
    alpha=1.0  → pure semantic

    Better than Pinecone: configurable per-query, no extra charge.
    """
    from services.hybrid_search import hybrid_search

    t0 = time.time()
    client, stats = _reader(priority)

    query_filter = None
    if filters:
        conditions = [
            FieldCondition(key=k, match=MatchValue(value=v))
            for k, v in filters.items()
        ]
        query_filter = Filter(must=conditions)

    # Get more candidates for hybrid reranking
    fetch_k = min(top_k * 4, 50)

    semantic_results = client.search(
        collection_name=collection,
        query_vector=query_vector,
        limit=fetch_k,
        score_threshold=score_threshold,
        with_payload=True,
        query_filter=query_filter,
    )

    if not semantic_results:
        return []

    # Extract texts and scores
    texts = [r.payload.get("text", "") for r in semantic_results]
    semantic_scores = [r.score for r in semantic_results]
    payloads = [r.payload for r in semantic_results]

    # Hybrid rerank
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
    return [
        {
            "text": texts[idx],
            "score": round(float(semantic_scores[idx]), 4),
            "metadata": {k: v for k, v in payloads[idx].items() if k != "text"},
            "_latency_ms": round(latency_ms, 2),
            "_search_type": "hybrid",
        }
        for idx, _ in ranked
        if idx < len(texts)
    ]

# ── Node status ───────────────────────────────────────────────────────────────

def get_node_status() -> dict:
    return node_manager.get_status()
