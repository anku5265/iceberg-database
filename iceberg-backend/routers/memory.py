"""
Agent Memory API — Better than Pinecone Nexus.

Simple API:
  POST /memory/{agent_id}/remember  → store a memory
  POST /memory/{agent_id}/recall    → search memories
  GET  /memory/{agent_id}           → list all memories
  DELETE /memory/{agent_id}         → clear memory

Supports:
  - short_term: expires after session
  - long_term: permanent
  - episodic: specific event memories
  - semantic: facts about user/world

Future: plug in your own AI model for summarization
"""
import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.auth import verify_api_key
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
    metadata: Optional[dict] = {}

class RecallRequest(BaseModel):
    query: str
    top_k: int = 5
    memory_type: Optional[str] = None  # None = search all types

def _get_collection(agent_id: str) -> str:
    return f"{MEMORY_COLLECTION_PREFIX}{agent_id}"

def _ensure_collection(agent_id: str):
    col = _get_collection(agent_id)
    try:
        qdrant_svc.create_collection(col)
    except Exception:
        pass  # Already exists
    return col

@router.post("/{agent_id}/remember")
async def remember(
    agent_id: str,
    body: RememberRequest,
    user_id: str = Depends(verify_api_key)
):
    """Store a memory for an agent."""
    col = _ensure_collection(agent_id)

    if body.memory_type not in MEMORY_TTL:
        raise HTTPException(400, f"memory_type must be one of: {list(MEMORY_TTL.keys())}")

    vectors = embed([body.content])
    expires_at = None
    ttl = MEMORY_TTL[body.memory_type]
    if ttl:
        expires_at = int(time.time()) + ttl

    metadata = {
        "agent_id": agent_id,
        "memory_type": body.memory_type,
        "created_at": int(time.time()),
        "expires_at": expires_at,
        **body.metadata,
    }

    count = qdrant_svc.upsert_vectors(col, [body.content], vectors, [metadata])
    log_usage(user_id, "memory_write", agent_id, body.memory_type)

    return {
        "stored": True,
        "agent_id": agent_id,
        "memory_type": body.memory_type,
        "expires_at": expires_at,
    }

@router.post("/{agent_id}/recall")
async def recall(
    agent_id: str,
    body: RecallRequest,
    user_id: str = Depends(verify_api_key)
):
    """Search memories — returns most relevant memories for a query."""
    col = _get_collection(agent_id)

    query_vec = embed_query(body.query)
    try:
        results = qdrant_svc.search_vectors(
            collection=col,
            query_vector=query_vec,
            top_k=body.top_k,
            score_threshold=0.2,
        )
    except Exception as e:
        results = []

    if body.memory_type:
        results = [r for r in results if r["metadata"].get("memory_type") == body.memory_type]

    # Filter expired memories
    now = int(time.time())
    active = [
        r for r in results
        if not r["metadata"].get("expires_at") or r["metadata"]["expires_at"] > now
    ]

    log_usage(user_id, "memory_read", agent_id, body.query[:50])

    return {
        "memories": [{"content": r["text"], "score": r["score"], "type": r["metadata"].get("memory_type"), "created_at": r["metadata"].get("created_at")} for r in active],
        "agent_id": agent_id,
        "query": body.query,
    }

@router.get("/{agent_id}")
async def list_memories(
    agent_id: str,
    memory_type: Optional[str] = None,
    user_id: str = Depends(verify_api_key)
):
    """List all memories for an agent."""
    col = _get_collection(agent_id)
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
    user_id: str = Depends(verify_api_key)
):
    """Clear all memories for an agent."""
    col = _get_collection(agent_id)
    try:
        qdrant_svc.delete_collection(col)
        qdrant_svc.create_collection(col)
    except Exception:
        pass
    return {"cleared": True, "agent_id": agent_id}
