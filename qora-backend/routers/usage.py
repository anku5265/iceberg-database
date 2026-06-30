from fastapi import APIRouter, Depends
from core.auth import verify_api_key
from core.database import get_recent_logs, get_usage_stats

router = APIRouter(prefix="/usage", tags=["Usage"])

@router.get("/stats")
async def stats(user_id: str = Depends(verify_api_key)):
    return get_usage_stats(user_id)

@router.get("/logs")
async def logs(limit: int = 50, user_id: str = Depends(verify_api_key)):
    return {"logs": get_recent_logs(user_id, limit)}
