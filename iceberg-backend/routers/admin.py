"""
Admin endpoints — for Iceberg BYOC management and private Founder CLI inspection.
Only accessible with master API key.
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from core.auth import verify_api_key, require_admin
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
        "version": "1.0.0",
        "platform": platform.system(),
        "tunnel_open": getattr(telemetry, '_tunnel_open', False),
        "tunnel_opened_at": getattr(telemetry, '_tunnel_opened_at', None),
        "storage": "r2" if is_configured() else "local",
        "nodes": get_node_status(),
        "uptime_since": int(time.time()),
    }

@router.get("/users")
async def admin_list_users(user_id: str = Depends(require_admin)):
    """Private Founder CLI endpoint — returns all registered users, waitlist, and payments."""
    conn = get_conn()
    users = conn.execute(
        "SELECT id, email, plan, created_at FROM users ORDER BY created_at DESC"
    ).fetchall()
    waitlist = conn.execute(
        "SELECT id, email, created_at FROM waitlist ORDER BY created_at DESC"
    ).fetchall()
    payments = conn.execute(
        "SELECT id, user_id, plan, amount, currency, payment_id, order_id, status, billing_type, created_at FROM payments ORDER BY created_at DESC"
    ).fetchall()
    recent_logs = conn.execute(
        "SELECT * FROM usage_logs ORDER BY created_at DESC LIMIT 50"
    ).fetchall()
    conn.close()

    return {
        "total_users": len(users),
        "users": [dict(u) for u in users],
        "total_waitlist": len(waitlist),
        "waitlist": [dict(w) for w in waitlist],
        "total_payments": len(payments),
        "payments": [dict(p) for p in payments],
        "recent_logs": [dict(l) for l in recent_logs],
    }

@router.post("/tunnel/open")
async def open_tunnel(user_id: str = Depends(verify_api_key)):
    """
    Open secure tunnel — allows iceberg support team to access this instance.
    Auto-closes after 4 hours. User can close anytime.
    """
    success = telemetry.open_tunnel()
    if success:
        return {"message": "Tunnel opened — Iceberg team has access for 4 hours", "close_at": int(time.time()) + 4*3600}
    raise HTTPException(status_code=500, detail="Failed to open tunnel. Is cloudflared installed?")

@router.delete("/tunnel")
async def close_tunnel(user_id: str = Depends(verify_api_key)):
    """Close secure tunnel — immediately revoke Iceberg team access."""
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
        "upgrade_url": "https://dashboard.icebergdb.in/settings"
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
