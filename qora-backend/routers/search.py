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
    Hybrid search — Dense (semantic) + BM25 (keyword) combined.

    search_type: "hybrid" | "semantic" | "keyword"
    alpha:       0.0=keyword, 0.5=balanced, 1.0=semantic
    namespace:   optional — filter within a namespace
    """
    try:
        t0 = time.time()
        query_vector = embed_query(body.query)

        # Namespace filter — merge with user filters
        filters = dict(body.filters or {})
        if body.namespace:
            filters["_namespace"] = body.namespace

        if body.search_type == "semantic":
            raw_results = qdrant_svc.search_vectors(
                collection=body.collection,
                query_vector=query_vector,
                top_k=body.top_k,
                score_threshold=body.score_threshold,
                filters=filters or None,
            )
        elif body.search_type == "keyword":
            raw_results = qdrant_svc.hybrid_search_vectors(
                collection=body.collection,
                query=body.query,
                query_vector=query_vector,
                top_k=body.top_k,
                score_threshold=body.score_threshold,
                filters=filters or None,
                alpha=0.0,
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
            )

        duration_ms = int((time.time() - t0) * 1000)
        log_usage(user_id, "search", body.collection, body.query, duration_ms)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    results = [
        SearchResult(
            text=r["text"],
            score=round(r["score"], 4),
            metadata={k: v for k, v in r.get("metadata", {}).items() if not k.startswith("_")}
        )
        for r in raw_results
    ]

    return SearchResponse(
        results=results,
        query=body.query,
        collection=body.collection,
        total=len(results),
    )
