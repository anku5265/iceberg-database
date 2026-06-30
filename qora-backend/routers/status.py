"""
Uptime & Status endpoint — for SLA documentation.
"""
import time
from fastapi import APIRouter

router = APIRouter(prefix="/status", tags=["Status"])

START_TIME = int(time.time())

@router.get("")
async def status():
    uptime_seconds = int(time.time()) - START_TIME
    return {
        "status": "operational",
        "uptime_seconds": uptime_seconds,
        "uptime_hours": round(uptime_seconds / 3600, 2),
        "sla": {
            "target": "99.9%",
            "description": "Qora targets 99.9% monthly uptime",
            "maintenance_window": "Sundays 2-4 AM IST",
        },
        "regions": ["ap-south-1 (Mumbai)"],
        "version": "0.1.0",
        "ts": int(time.time()),
    }
