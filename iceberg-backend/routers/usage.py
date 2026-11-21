from fastapi import APIRouter, Depends
from core.auth import verify_api_key
from core.database import get_recent_logs, get_usage_stats

router = APIRouter(prefix="/usage", tags=["Usage"])

@router.get("/stats")
async def stats(user_id: str = Depends(verify_api_key)):
    return get_usage_stats(user_id)

@router.get("/logs")
async def logs(limit: int = 1000, user_id: str = Depends(verify_api_key)):
    safe_limit = max(1, min(int(limit or 1000), 5000))
    items = get_recent_logs(user_id, safe_limit)
    return {"logs": items, "total": len(items)}
