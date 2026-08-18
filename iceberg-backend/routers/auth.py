from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from core.database import get_conn
from core.auth import verify_api_key
import uuid, time, hashlib, secrets

router = APIRouter(prefix="/auth", tags=["Auth"])

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

class SignupRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CreateKeyRequest(BaseModel):
    name: str
    role: str = "read_write"  # read_only, read_write, admin
    project_id: str = ""

def hash_password(p): return hashlib.sha256(p.encode()).hexdigest()
def generate_api_key(): return "ib_" + secrets.token_urlsafe(32)

@router.post("/signup")
async def signup(body: SignupRequest):
    if not body.email or not body.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    conn = get_conn()
    if conn.execute("SELECT id FROM users WHERE email=?", (body.email,)).fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO users (id, email, password_hash, plan, created_at) VALUES (?,?,?,?,?)",
        (user_id, body.email, hash_password(body.password), "free", int(time.time()))
    )

    project_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO projects (id, user_id, name, description, created_at) VALUES (?,?,?,?,?)",
        (project_id, user_id, "default", "Default project", int(time.time()))
    )

    raw_key = generate_api_key()
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    conn.execute(
        "INSERT INTO api_keys (id, user_id, project_id, key_hash, key_prefix, name, role, created_at, is_active) VALUES (?,?,?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), user_id, project_id, key_hash, raw_key[:10], "Default Key", "admin", int(time.time()), 1)
    )
    conn.commit()
    conn.close()

    # Send welcome email (non-blocking — failure won't break signup)
    try:
        from services.email import send_welcome_email
        send_welcome_email(body.email, raw_key)
    except Exception:
        pass

    return {
        "user_id": user_id,
        "email": body.email,
        "api_key": raw_key,
        "project_id": project_id,
        "message": "Account created"
    }

@router.post("/login")
async def login(body: LoginRequest):
    conn = get_conn()
    user = conn.execute(
        "SELECT id, email, password_hash FROM users WHERE email=?", (body.email,)
    ).fetchone()

    if not user or user["password_hash"] != hash_password(body.password):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    keys = conn.execute(
        "SELECT id, key_prefix, name, role, project_id, created_at FROM api_keys WHERE user_id=? AND is_active=1",
        (user["id"],)
    ).fetchall()
    projects = conn.execute(
        "SELECT id, name, description FROM projects WHERE user_id=?", (user["id"],)
    ).fetchall()
    conn.close()

    return {
        "user_id": user["id"],
        "email": user["email"],
        "api_keys": [dict(k) for k in keys],
        "projects": [dict(p) for p in projects],
    }

@router.post("/keys")
async def create_key(body: CreateKeyRequest, user_id: str = Depends(verify_api_key)):
    """Create additional API key with specific role."""
    raw_key = generate_api_key()
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    conn = get_conn()
    # Get user's first project if none provided
    project_id = body.project_id
    if not project_id:
        proj = conn.execute("SELECT id FROM projects WHERE user_id=?", (user_id,)).fetchone()
        project_id = proj["id"] if proj else ""

    conn.execute(
        "INSERT INTO api_keys (id, user_id, project_id, key_hash, key_prefix, name, role, created_at, is_active) VALUES (?,?,?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), user_id, project_id, key_hash, raw_key[:10], body.name, body.role, int(time.time()), 1)
    )
    conn.commit()
    conn.close()
    return {"api_key": raw_key, "name": body.name, "role": body.role, "key_prefix": raw_key[:10]}

@router.delete("/keys/{key_prefix}")
async def revoke_key(key_prefix: str, user_id: str = Depends(verify_api_key)):
    """Revoke an API key by prefix — only owner can revoke."""
    conn = get_conn()
    conn.execute(
        "UPDATE api_keys SET is_active=0 WHERE key_prefix=? AND user_id=?",
        (key_prefix, user_id)
    )
    conn.commit()
    conn.close()
    return {"revoked": True, "prefix": key_prefix}

@router.get("/keys")
async def list_keys(user_id: str = Depends(verify_api_key)):
    """List all API keys for the current user."""
    conn = get_conn()
    keys = conn.execute(
        "SELECT id, key_prefix, name, role, project_id, created_at, last_used FROM api_keys WHERE user_id=? AND is_active=1 ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return {"keys": [dict(k) for k in keys]}
