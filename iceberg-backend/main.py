import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import re
from collections import Counter
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from contextlib import asynccontextmanager
from core.database import init_db
from routers import (
    collections,
    documents,
    search,
    vectors,
    usage,
    waitlist,
    auth,
    projects,
    nodes,
    admin,
    memory,
    assistant,
    backup,
    status,
    billing,
    partner_integrations,
)

_SOURCE_TAG_UA_RE = re.compile(r"source_tag=([a-z0-9_:/.-]{1,64})")

_INTEGRATION_COUNTER: Counter = Counter()
_HTTP_REQUEST_COUNTER: Counter = Counter()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Restore account DB + Rust Engine snapshots from R2 before initializing services
    from pathlib import Path
    import core.database as db_mod
    import services.read_nodes as rn_mod
    from services.r2_persistence import r2_shield

    rust_dir = Path(rn_mod.DATA_DIR).parent / "rust_core"
    r2_shield.restore_on_startup(Path(db_mod.DB_PATH), rust_dir)

    init_db()
    rn_mod.node_manager.initialize()
    r2_shield.start_background_worker()
    from core.remote_access import heartbeat_scheduler
    heartbeat_scheduler.start()
    print("Iceberg API ready")
    yield
    # Shutdown
    from core.remote_access import heartbeat_scheduler, telemetry
    heartbeat_scheduler.stop()
    telemetry.close_tunnel()
    r2_shield.stop_and_flush()
    from services.rust_engine import rust_engine
    rust_engine.shutdown()


app = FastAPI(
    title="Iceberg API",
    description="Vector search infrastructure — Hosted in India (ap-south-1)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def track_integration_and_metrics(request: Request, call_next):
    integration = request.headers.get("X-Iceberg-Integration", "").strip()
    if not integration:
        ua = request.headers.get("User-Agent", "")
        m = _SOURCE_TAG_UA_RE.search(ua)
        if m:
            integration = m.group(1)
    if integration:
        _INTEGRATION_COUNTER[integration[:64]] += 1
        partner_integrations.record_integration_hit(integration[:64])
    _HTTP_REQUEST_COUNTER[request.method] += 1
    response = await call_next(request)
    if (
        request.method in ("POST", "PUT", "PATCH", "DELETE")
        and response.status_code < 400
        and request.url.path.startswith(("/auth", "/projects", "/assistant", "/billing", "/waitlist", "/partner-integrations"))
    ):
        from services.r2_persistence import r2_shield
        r2_shield.mark_sqlite_dirty()
    return response


app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(collections.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(vectors.router)
app.include_router(usage.router)
app.include_router(waitlist.router)
app.include_router(nodes.router)
app.include_router(admin.router)
app.include_router(memory.router)
app.include_router(assistant.router)
app.include_router(backup.router)
app.include_router(status.router)
app.include_router(billing.router)
app.include_router(partner_integrations.router)


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    from services import storage
    return {
        "product": "Iceberg",
        "version": "1.0.0",
        "status": "running",
        "region": "Hosted in India (ap-south-1)",
        "storage": "r2" if storage.is_configured() else "local",
    }


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    from services import storage
    return {
        "status": "ok",
        "version": "1.0.0",
        "storage": "r2" if storage.is_configured() else "local",
    }


@app.get("/metrics", response_class=PlainTextResponse, tags=["Observability"])
def prometheus_metrics():
    from services.rust_engine import rust_engine
    from services import qdrant as qdrant_svc

    lines = [
        "# HELP iceberg_api_requests_total Total HTTP requests handled by Iceberg API",
        "# TYPE iceberg_api_requests_total counter",
    ]
    for method, cnt in sorted(_HTTP_REQUEST_COUNTER.items()):
        lines.append(f'iceberg_api_requests_total{{method="{method}"}} {cnt}')

    lines.append("# HELP iceberg_integration_requests_total Requests attributed via X-Iceberg-Integration")
    lines.append("# TYPE iceberg_integration_requests_total counter")
    for integ, cnt in sorted(_INTEGRATION_COUNTER.items()):
        safe = integ.replace('"', "")
        lines.append(f'iceberg_integration_requests_total{{integration="{safe}"}} {cnt}')

    if qdrant_svc._use_rust_default() and rust_engine.is_binary_available():
        try:
            lines.append(rust_engine.metrics_text().strip())
        except Exception:
            pass

    return "\n".join(lines) + "\n"
