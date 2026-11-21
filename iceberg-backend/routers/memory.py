"""
Agent Memory API — 4-Tier Cognitive Memory for AI Agents.

Simple API:
  POST /memory/{agent_id}/remember  → store a memory
  POST /memory/{agent_id}/recall    → search memories
  GET  /memory/{agent_id}           → list all memories
  DELETE /memory/{agent_id}         → clear memory

Supports:
  - short_term: expires after 1 hour
  - long_term: permanent
  - episodic: 30 days TTL
  - semantic: permanent domain/user facts
"""
import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.auth import verify_api_key, require_write
from core.database import log_usage
from services.embeddings import embed, embed_query
from services import qdrant as qdrant_svc

router = APIRouter(prefix="/memory", tags=["Agent Memory"])

MEMORY_COLLECTION_PREFIX = "_memory_"
MEMORY_TTL = {
    "short_term": 3600,       # 1 hour
    "long_term": None,        # Never expires
    "episodic": 86400 * 30,   # 30 days
    "semantic": None,         # Never expires
}


class RememberRequest(BaseModel):
    content: str
    memory_type: str = "long_term"  # short_term, long_term, episodic, semantic
    importance: float = 0.5
    metadata: Optional[dict] = {}


class RecallRequest(BaseModel):
    query: str
    top_k: int = 5
    memory_type: Optional[str] = None  # None = search all types
    use_cognitive_decay: bool = True
    decay_lambda: float = 0.015


def _get_collection(agent_id: str, user_id: Optional[str] = None) -> str:
    clean_agent = (agent_id or "").strip()
    if clean_agent.startswith("u_") or not user_id or user_id == "dev_user_001":
        return f"{MEMORY_COLLECTION_PREFIX}{clean_agent}"
    return f"{MEMORY_COLLECTION_PREFIX}t_{user_id[:8]}__{clean_agent}"


def _ensure_collection(agent_id: str, user_id: Optional[str] = None) -> str:
    col = _get_collection(agent_id, user_id)
    try:
        qdrant_svc.create_collection(col)
    except Exception:
        pass
    return col


@router.post("/{agent_id}/remember")
async def remember(
    agent_id: str,
    body: RememberRequest,
    user_id: str = Depends(require_write),
):
    """Store a memory for an agent."""
    if not body.content or not body.content.strip():
        raise HTTPException(status_code=400, detail="Memory content cannot be empty")
    if body.memory_type not in MEMORY_TTL:
        raise HTTPException(status_code=400, detail=f"memory_type must be one of: {list(MEMORY_TTL.keys())}")

    col = _ensure_collection(agent_id, user_id)
    vectors = embed([body.content])
    expires_at = None
    ttl = MEMORY_TTL[body.memory_type]
    if ttl:
        expires_at = int(time.time()) + ttl

    metadata = {
        "agent_id": agent_id,
        "memory_type": body.memory_type,
        "importance": max(0.0, min(1.0, float(body.importance))),
        "created_at": int(time.time()),
        "expires_at": expires_at,
        **(body.metadata or {}),
    }

    ids = qdrant_svc.upsert_vectors(col, [body.content], vectors, [metadata])
    log_usage(user_id, "memory_write", agent_id, body.memory_type)

    return {
        "stored": True,
        "id": ids[0],
        "agent_id": agent_id,
        "memory_type": body.memory_type,
        "expires_at": expires_at,
    }


@router.post("/{agent_id}/recall")
async def recall(
    agent_id: str,
    body: RecallRequest,
    user_id: str = Depends(verify_api_key),
):
    """Search memories — returns most relevant memories for a query."""
    col = _get_collection(agent_id, user_id)

    query_vec = embed_query(body.query)
    try:
        results = qdrant_svc.search_vectors(
            collection=col,
            query_vector=query_vec,
            top_k=body.top_k,
            score_threshold=0.2,
            use_cognitive_decay=body.use_cognitive_decay,
            decay_lambda=body.decay_lambda,
        )
    except Exception:
        results = []

    if body.memory_type:
        results = [r for r in results if r["metadata"].get("memory_type") == body.memory_type]

    now = int(time.time())
    active = [
        r for r in results
        if not r["metadata"].get("expires_at") or r["metadata"]["expires_at"] > now
    ]

    log_usage(user_id, "memory_read", agent_id, body.query[:50])

    return {
        "memories": [
            {
                "id": r.get("id"),
                "content": r["text"],
                "score": r["score"],
                "type": r["metadata"].get("memory_type"),
                "created_at": r["metadata"].get("created_at"),
            }
            for r in active
        ],
        "agent_id": agent_id,
        "query": body.query,
    }


@router.get("/{agent_id}")
async def list_memories(
    agent_id: str,
    memory_type: Optional[str] = None,
    user_id: str = Depends(verify_api_key),
):
    """List all memories for an agent."""
    col = _get_collection(agent_id, user_id)
    try:
        info = qdrant_svc.get_collection_info(col)
        return {
            "agent_id": agent_id,
            "total_memories": info["vector_count"],
            "collection": col,
        }
    except Exception:
        return {"agent_id": agent_id, "total_memories": 0}


@router.delete("/{agent_id}")
async def clear_memory(
    agent_id: str,
    user_id: str = Depends(require_write),
):
    """Clear all memories for an agent."""
    col = _get_collection(agent_id, user_id)
    try:
        qdrant_svc.delete_collection(col)
        qdrant_svc.create_collection(col)
    except Exception:
        pass
    return {"cleared": True, "agent_id": agent_id}
