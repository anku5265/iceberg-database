from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import init_db
from routers import collections, documents, search, usage, waitlist, auth, projects, nodes, admin, memory, assistant, backup, status

app = FastAPI(
    title="Qora API",
    description="Vector search infrastructure for Indian AI teams",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://dashboard.qora.in",
        "https://qora.in",
        "https://www.qora.in",
        # Vercel preview URLs
        "https://*.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init DB on startup
@app.on_event("startup")
async def startup():
    init_db()
    from services.read_nodes import node_manager
    node_manager.initialize()
    from core.remote_access import heartbeat_scheduler
    heartbeat_scheduler.start()
    print("Qora API ready")

@app.on_event("shutdown")
async def shutdown():
    from core.remote_access import heartbeat_scheduler, telemetry
    heartbeat_scheduler.stop()
    telemetry.close_tunnel()

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(collections.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(usage.router)
app.include_router(waitlist.router)
app.include_router(nodes.router)
app.include_router(admin.router)
app.include_router(memory.router)
app.include_router(assistant.router)
app.include_router(backup.router)
app.include_router(status.router)

@app.get("/")
def root():
    from services import storage
    return {
        "product": "Qora",
        "version": "0.1.0",
        "status": "running",
        "storage": "r2" if storage.is_configured() else "local"
    }

@app.get("/health")
def health():
    from services import storage
    return {"status": "ok", "storage": "r2" if storage.is_configured() else "local"}
