"""
Raw Multi-Dimension Vector Operations Router (`/vectors`)
=========================================================
Powers BYO-Embedding workflows (OpenAI 1536d/3072d, Cohere 1024d, Voyage 1024d,
Gemini 768d, BGE/Nomic 768d) as well as LangChain, LlamaIndex, and Haystack VectorStores.
"""

import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.auth import verify_api_key, require_write
from core.database import log_usage
from services import qdrant as qdrant_svc

router = APIRouter(prefix="/vectors", tags=["Raw Vectors"])


class VectorRecord(BaseModel):
    id: Optional[str] = None
    values: Optional[List[float]] = None
    vector: Optional[List[float]] = None
    text: Optional[str] = ""
    metadata: Optional[Dict[str, Any]] = None
    namespace: Optional[str] = None
    timestamp: Optional[float] = None
    importance: Optional[float] = None


class VectorUpsertRequest(BaseModel):
    collection: str
    vectors: List[VectorRecord]
    namespace: str = ""


class VectorQueryRequest(BaseModel):
    collection: str
    vector: Optional[List[float]] = None
    query_text: Optional[str] = None
    top_k: int = 5
    filter: Optional[Dict[str, Any]] = None
    namespace: str = ""
    search_type: str = "semantic"
    alpha: float = 0.5
    score_threshold: float = 0.0
    include_values: bool = False
    include_metadata: bool = True
    use_cognitive_decay: bool = False
    decay_lambda: float = 0.015


class VectorFetchRequest(BaseModel):
    collection: str
    ids: List[str]


class VectorDeleteRequest(BaseModel):
    collection: str
    ids: Optional[List[str]] = None
    filter: Optional[Dict[str, Any]] = None
    namespace: str = ""
    delete_all: bool = False


@router.post("/upsert")
async def upsert_vectors_batch(body: VectorUpsertRequest, user_id: str = Depends(require_write)):
    if not body.vectors:
        raise HTTPException(status_code=400, detail="vectors list cannot be empty")
    try:
        raw_items = [v.model_dump(exclude_none=True) for v in body.vectors]
        res = qdrant_svc.upsert_raw_vectors(
            collection=body.collection,
            vectors_batch=raw_items,
            namespace=body.namespace,
            user_id=user_id,
        )
        log_usage(user_id, "vector_upsert", body.collection, str(res.get("upserted_count", 0)))
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
async def query_vectors(body: VectorQueryRequest, user_id: str = Depends(verify_api_key)):
    if body.vector is None and not (body.query_text and body.query_text.strip()):
        raise HTTPException(status_code=400, detail="Provide either 'vector' or 'query_text'")
    try:
        t0 = time.time()
        res = qdrant_svc.query_raw_vectors(
            collection=body.collection,
            vector=body.vector,
            query_text=body.query_text,
            top_k=body.top_k,
            filter_obj=body.filter,
            namespace=body.namespace,
            search_type=body.search_type,
            alpha=body.alpha,
            score_threshold=body.score_threshold,
            include_values=body.include_values,
            include_metadata=body.include_metadata,
            use_cognitive_decay=body.use_cognitive_decay,
            decay_lambda=body.decay_lambda,
            user_id=user_id,
        )
        duration_ms = int((time.time() - t0) * 1000)
        log_usage(user_id, "vector_query", body.collection, body.query_text or "raw_vector", duration_ms)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch")
async def fetch_vectors(body: VectorFetchRequest, user_id: str = Depends(verify_api_key)):
    records = {}
    for pid in body.ids:
        rec = qdrant_svc.get_point(body.collection, pid, user_id=user_id)
        if rec:
            records[pid] = rec
    return {"collection": body.collection, "vectors": records}


@router.post("/delete")
async def delete_vectors(body: VectorDeleteRequest, user_id: str = Depends(require_write)):
    try:
        return qdrant_svc.delete_raw_vectors(
            collection=body.collection,
            ids=body.ids,
            filter_obj=body.filter,
            namespace=body.namespace,
            delete_all=body.delete_all,
            user_id=user_id,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
