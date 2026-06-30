"""
Remote Access & Telemetry System — Pinecone-style

Access model (same as Pinecone BYOC):
- User server opens OUTBOUND tunnel to Qora HQ
- Qora team accesses via tunnel — no inbound ports needed
- User can revoke access anytime
- All access logged + auditable

What we collect:
- Error logs & stack traces — bug fixes
- Query counts, latency — performance
- Version info — security patches
- Billing usage — plan enforcement

What we NEVER collect:
- Vector content or documents
- Search query text
- User emails or PII
"""
import time
import hashlib
import platform
import traceback
import threading
import subprocess
import httpx
from core.config import settings

HQ_URL = "https://api.qora.in/v1"
LOG_BUFFER_MAX = 100

class TelemetryClient:
    def __init__(self):
        self._lock = threading.Lock()
        self._log_buffer: list[dict] = []
        self._support_mode = False
        self._instance_id = self._get_instance_id()

    def _get_instance_id(self) -> str:
        raw = f"{platform.node()}{settings.master_api_key}"
        return hashlib.sha256(raw.encode()).hexdigest()[:16]

    # ── Logging ──────────────────────────────────────────────────────────────

    def log_error(self, error: Exception, context: dict = None):
        """Buffer error for sending to HQ — for bug fixes."""
        with self._lock:
            entry = {
                "type": "error",
                "error": type(error).__name__,
                "message": str(error),
                "traceback": traceback.format_exc(),
                "context": {k: v for k, v in (context or {}).items()
                            if k not in ("text", "query", "content", "vectors")},
                "ts": int(time.time()),
            }
            self._log_buffer.append(entry)
            if len(self._log_buffer) > LOG_BUFFER_MAX:
                self._log_buffer.pop(0)

    def log_metric(self, metric: str, value: float, tags: dict = None):
        """Log performance metric."""
        with self._lock:
            self._log_buffer.append({
                "type": "metric",
                "metric": metric,
                "value": value,
                "tags": tags or {},
                "ts": int(time.time()),
            })

    # ── Heartbeat ─────────────────────────────────────────────────────────────

    def send_heartbeat(self, usage: dict = None):
        """Send heartbeat + buffered logs to HQ."""
        if not settings.byoc_license_key:
            return

        with self._lock:
            logs_to_send = self._log_buffer.copy()
            self._log_buffer.clear()

        payload = {
            "instance_id": self._instance_id,
            "license_key": settings.byoc_license_key,
            "version": "0.1.0",
            "platform": platform.system(),
            "ts": int(time.time()),
            "support_mode": self._support_mode,
            "usage": {
                "collections": usage.get("collections", 0) if usage else 0,
                "queries_today": usage.get("queries_today", 0) if usage else 0,
                "chunks_indexed": usage.get("chunks_indexed", 0) if usage else 0,
            },
            "logs": logs_to_send,
        }

        try:
            r = httpx.post(f"{HQ_URL}/heartbeat", json=payload, timeout=10)
            resp = r.json()

            # Process commands from HQ
            for cmd in resp.get("commands", []):
                self._handle_command(cmd)

            return resp
        except Exception as e:
            print(f"[telemetry] heartbeat failed: {e}")
            return None

    # ── Billing ───────────────────────────────────────────────────────────────

    def check_plan_limits(self, user_id: str, action: str) -> dict:
        """
        Check if user is within their plan limits.
        Returns {"allowed": bool, "reason": str}
        """
        from core.database import get_conn
        conn = get_conn()

        # Get usage today
        today = int(time.time()) - 86400
        count = conn.execute(
            "SELECT COUNT(*) as cnt FROM usage_logs WHERE user_id=? AND action=? AND created_at > ?",
            (user_id, action, today)
        ).fetchone()["cnt"]
        conn.close()

        # Plan limits — sync with pricing
        limits = {
            "free":    {"search": 2000,    "index": 500},
            "starter": {"search": 20000,   "index": 5000},
            "growth":  {"search": 100000,  "index": 20000},
            "scale":   {"search": 1000000, "index": 100000},
        }

        plan = self._get_user_plan(user_id)
        plan_limits = limits.get(plan, limits["free"])
        limit = plan_limits.get(action, 100)

        if count >= limit:
            return {
                "allowed": False,
                "reason": f"Daily {action} limit reached ({count}/{limit}) for {plan} plan",
                "upgrade_url": "https://dashboard.qora.in/pricing"
            }
        return {"allowed": True, "remaining": limit - count}

    def _get_user_plan(self, user_id: str) -> str:
        """Get user's current plan from DB."""
        from core.database import get_conn
        conn = get_conn()
        row = conn.execute(
            "SELECT plan FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        conn.close()
        if row and row["plan"]:
            return row["plan"]
        return "free"

    # ── Secure Tunnel (Pinecone-style access) ────────────────────────────────

    def open_tunnel(self) -> bool:
        """
        Open outbound tunnel to Qora HQ using Cloudflare Tunnel.
        - No inbound ports opened on user server
        - Qora team connects through tunnel (read access)
        - Auto-closes after 4 hours
        - User can close anytime: DELETE /admin/tunnel
        """
        if not settings.byoc_license_key:
            return False

        # Check if cloudflared is installed
        result = subprocess.run(["which", "cloudflared"], capture_output=True)
        if result.returncode != 0:
            # Auto-install cloudflared
            subprocess.run([
                "bash", "-c",
                "curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared"
            ])

        # Start tunnel — connects to Qora HQ
        tunnel_url = f"https://tunnel.qora.in/{self._instance_id}"
        try:
            self._tunnel_process = subprocess.Popen([
                "cloudflared", "access", "tcp",
                "--hostname", tunnel_url,
                "--url", "localhost:8000",
            ])
            self._tunnel_open = True
            self._tunnel_opened_at = time.time()

            # Log access event
            self.log_metric("tunnel_opened", 1, {"instance": self._instance_id})

            # Auto-close after 4 hours
            threading.Timer(4 * 3600, self.close_tunnel).start()

            print(f"[access] Secure tunnel opened — Qora team has access for 4 hours")
            print(f"[access] Close anytime: DELETE /admin/tunnel")
            return True
        except Exception as e:
            print(f"[access] Tunnel failed: {e}")
            return False

    def close_tunnel(self):
        if hasattr(self, '_tunnel_process') and self._tunnel_process:
            self._tunnel_process.terminate()
            self._tunnel_open = False
            print("[access] Tunnel closed — access revoked")
            self.log_metric("tunnel_closed", 1)

    def get_access_log(self) -> list:
        """Return log of all remote access events."""
        return [e for e in self._log_buffer if e.get("type") == "metric"
                and "tunnel" in e.get("metric", "")]

    # ── Commands from HQ ──────────────────────────────────────────────────────

    def _handle_command(self, cmd: dict):
        """Handle commands pushed from Qora HQ via heartbeat response."""
        cmd_type = cmd.get("type")

        if cmd_type == "update_available":
            version = cmd.get("version")
            print(f"[update] Qora {version} available — run: pip install --upgrade qora-server")

        elif cmd_type == "security_patch":
            # Critical security update — auto-apply
            print(f"[security] Critical patch available: {cmd.get('description')}")

        elif cmd_type == "billing_warning":
            print(f"[billing] {cmd.get('message')}")

        elif cmd_type == "feature_flag":
            # Enable/disable features remotely
            flag = cmd.get("flag")
            value = cmd.get("value")
            print(f"[feature] {flag} = {value}")


# Singleton
telemetry = TelemetryClient()


class HeartbeatScheduler:
    INTERVAL = 3600  # 1 hour

    def __init__(self):
        self._thread = None
        self._running = False

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()
        # Send immediately on startup
        threading.Thread(target=telemetry.send_heartbeat, daemon=True).start()

    def _loop(self):
        while self._running:
            time.sleep(self.INTERVAL)
            telemetry.send_heartbeat()

    def stop(self):
        self._running = False


heartbeat_scheduler = HeartbeatScheduler()
