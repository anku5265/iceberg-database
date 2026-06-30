"""
Admin endpoints — for Qora BYOC management.
Only accessible with master API key.
"""
from fastapi import APIRouter, Depends, HTTPException
from core.auth import verify_api_key
from core.remote_access import telemetry
from core.database import get_conn, get_recent_logs
import time

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/status")
async def admin_status(user_id: str = Depends(verify_api_key)):
    """Full system status — instance info, tunnel, billing."""
    from services.qdrant import get_node_status
    from services.storage import is_configured
    import platform

    return {
        "instance_id": telemetry._instance_id,
        "version": "0.1.0",
        "platform": platform.system(),
        "tunnel_open": getattr(telemetry, '_tunnel_open', False),
        "tunnel_opened_at": getattr(telemetry, '_tunnel_opened_at', None),
        "storage": "r2" if is_configured() else "local",
        "nodes": get_node_status(),
        "uptime_since": int(time.time()),
    }

@router.post("/tunnel/open")
async def open_tunnel(user_id: str = Depends(verify_api_key)):
    """
    Open secure tunnel — allows Qora support team to access this instance.
    Auto-closes after 4 hours. User can close anytime.
    """
    success = telemetry.open_tunnel()
    if success:
        return {"message": "Tunnel opened — Qora team has access for 4 hours", "close_at": int(time.time()) + 4*3600}
    raise HTTPException(status_code=500, detail="Failed to open tunnel. Is cloudflared installed?")

@router.delete("/tunnel")
async def close_tunnel(user_id: str = Depends(verify_api_key)):
    """Close secure tunnel — immediately revoke Qora team access."""
    telemetry.close_tunnel()
    return {"message": "Tunnel closed — access revoked"}

@router.get("/tunnel/log")
async def tunnel_log(user_id: str = Depends(verify_api_key)):
    """See history of all remote access events."""
    return {"access_log": telemetry.get_access_log()}

@router.get("/billing")
async def billing_status(user_id: str = Depends(verify_api_key)):
    """Current billing status — usage vs plan limits."""
    status = telemetry.check_plan_limits(user_id, "search")
    index_status = telemetry.check_plan_limits(user_id, "index")
    plan = telemetry._get_user_plan(user_id)

    return {
        "plan": plan,
        "search": status,
        "index": index_status,
        "upgrade_url": "https://dashboard.qora.in/pricing"
    }

@router.get("/analytics")
async def analytics(user_id: str = Depends(verify_api_key)):
    """Usage analytics — queries, indexing, collections."""
    conn = get_conn()

    # Queries per day last 7 days
    days = []
    for i in range(7):
        day_start = int(time.time()) - (i + 1) * 86400
        day_end = int(time.time()) - i * 86400
        count = conn.execute(
            "SELECT COUNT(*) as cnt FROM usage_logs WHERE user_id=? AND action='search' AND created_at BETWEEN ? AND ?",
            (user_id, day_start, day_end)
        ).fetchone()["cnt"]
        days.append({"day": i, "searches": count})

    total_indexed = conn.execute(
        "SELECT SUM(CAST(detail AS INTEGER)) as total FROM usage_logs WHERE user_id=? AND action='index'",
        (user_id,)
    ).fetchone()["total"] or 0

    recent = get_recent_logs(user_id, limit=20)
    conn.close()

    return {
        "searches_last_7_days": list(reversed(days)),
        "total_chunks_indexed": total_indexed,
        "recent_activity": recent,
    }
