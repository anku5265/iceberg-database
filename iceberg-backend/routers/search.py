import time
from fastapi import APIRouter, Depends, HTTPException
from models.schemas import SearchRequest, SearchResponse, SearchResult
from services import qdrant as qdrant_svc
from services.embeddings import embed_query
from core.auth import verify_api_key
from core.database import log_usage

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
async def search(body: SearchRequest, user_id: str = Depends(verify_api_key)):
    """
    Hybrid search — Dense (semantic) + BM25 (keyword) combined via RRF.
    Supports built-in 384d CPU embeddings AND custom BYO query vectors (768/1024/1536/3072d).
    """
    has_query = bool(body.query and body.query.strip())
    has_vec = bool(body.vector)
    if not has_query and not has_vec:
        return SearchResponse(results=[], query=body.query or "", collection=body.collection, total=0)

    try:
        t0 = time.time()
        if has_vec:
            query_vector = body.vector
        elif body.search_type == "keyword":
            # Check if collection is non-384d; keyword search on Rust engine doesn't even need a vector!
            try:
                info = qdrant_svc.get_collection_info(body.collection, user_id=user_id)
                col_dim = info.get("dimension", 384)
            except Exception:
                col_dim = 384
            query_vector = embed_query(body.query) if col_dim == 384 else None
        else:
            query_vector = embed_query(body.query)

        filters = dict(body.filters or {})
        if body.namespace:
            filters["_namespace"] = body.namespace

        if body.search_type == "semantic":
            if query_vector is None:
                raise ValueError("Semantic search requires either 'query' (384d) or 'vector'")
            raw_results = qdrant_svc.search_vectors(
                collection=body.collection,
                query_vector=query_vector,
                top_k=body.top_k,
                score_threshold=body.score_threshold,
                filters=filters or None,
                user_id=user_id,
                use_cognitive_decay=body.use_cognitive_decay,
                decay_lambda=body.decay_lambda,
            )
        elif body.search_type == "keyword":
            raw_results = qdrant_svc.hybrid_search_vectors(
                collection=body.collection,
                query=body.query,
                query_vector=query_vector,
                top_k=body.top_k,
                score_threshold=0.0,
                filters=filters or None,
                alpha=0.0,
                user_id=user_id,
                use_cognitive_decay=body.use_cognitive_decay,
                decay_lambda=body.decay_lambda,
            )
        else:
            raw_results = qdrant_svc.hybrid_search_vectors(
                collection=body.collection,
                query=body.query,
                query_vector=query_vector,
                top_k=body.top_k,
                score_threshold=body.score_threshold,
                filters=filters or None,
                alpha=body.alpha,
                user_id=user_id,
                use_cognitive_decay=body.use_cognitive_decay,
                decay_lambda=body.decay_lambda,
            )

        duration_ms = int((time.time() - t0) * 1000)
        log_usage(user_id, "search", body.collection, body.query or "vector_query", duration_ms)

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    results = [
        SearchResult(
            id=r.get("id"),
            text=r["text"],
            score=round(r["score"], 4),
            metadata={k: v for k, v in r.get("metadata", {}).items() if not k.startswith("_")},
        )
        for r in raw_results
    ]

    return SearchResponse(
        results=results,
        query=body.query or "",
        collection=body.collection,
        total=len(results),
    )
