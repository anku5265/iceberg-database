"""
License & BYOC heartbeat system.

Self-hosted Qora instances send periodic pings to Qora HQ:
- License validation
- Anonymous usage stats (no user data, only counts)
- Version check for updates

Qora HQ has NO inbound access to customer servers.
Data stays 100% on customer infrastructure.
"""
import hashlib
import time
import threading
import httpx
import platform
from core.config import settings

HEARTBEAT_URL = "https://api.qora.in/v1/heartbeat"
HEARTBEAT_INTERVAL = 3600  # Every hour

def get_instance_id() -> str:
    """Deterministic anonymous ID for this installation."""
    raw = f"{platform.node()}{settings.master_api_key}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]

def send_heartbeat(usage_stats: dict = None):
    """
    Send anonymous heartbeat to Qora HQ.
    NO user data, NO vectors, NO content — only counts.
    """
    if not settings.byoc_license_key:
        return  # Not a BYOC instance

    payload = {
        "instance_id": get_instance_id(),
        "license_key": settings.byoc_license_key,
        "version": "0.1.0",
        "platform": platform.system(),
        "timestamp": int(time.time()),
        "stats": {
            "collections_count": usage_stats.get("collections_count", 0) if usage_stats else 0,
            "queries_today": usage_stats.get("queries_today", 0) if usage_stats else 0,
        }
        # NO: user emails, vector content, document text, API keys
    }

    try:
        r = httpx.post(HEARTBEAT_URL, json=payload, timeout=10)
        return r.json()
    except Exception:
        pass  # Never fail the main app due to heartbeat issues
    return None

def validate_license(license_key: str) -> dict:
    """Check if license is valid."""
    try:
        r = httpx.post(
            "https://api.qora.in/v1/license/validate",
            json={"license_key": license_key, "instance_id": get_instance_id()},
            timeout=10
        )
        return r.json()
    except Exception:
        # If can't reach HQ (offline), allow operation — never block customer
        return {"valid": True, "plan": "unknown", "offline_mode": True}

class HeartbeatScheduler:
    """Background thread for periodic heartbeats."""

    def __init__(self):
        self._thread = None
        self._running = False

    def start(self):
        if not settings.byoc_license_key:
            return  # Only run for BYOC instances
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()
        print(f"BYOC mode: heartbeat started (instance: {get_instance_id()})")

    def _loop(self):
        while self._running:
            send_heartbeat()
            time.sleep(HEARTBEAT_INTERVAL)

    def stop(self):
        self._running = False


heartbeat = HeartbeatScheduler()
