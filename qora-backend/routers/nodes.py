from fastapi import APIRouter, Depends
from core.auth import verify_api_key
from services.qdrant import get_node_status

router = APIRouter(prefix="/nodes", tags=["Nodes"])

@router.get("")
async def nodes_status(_=Depends(verify_api_key)):
    """
    Get status of all read nodes.
    Shows load distribution, query count, avg latency per node.
    """
    return get_node_status()
