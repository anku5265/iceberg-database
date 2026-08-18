from fastapi import Security, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from core.database import verify_key

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if not api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API key")
    user_id = verify_key(api_key)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    return user_id

async def require_admin(api_key: str = Security(api_key_header)):
    """Only admin keys can perform this action."""
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    from core.database import get_conn, verify_key
    import hashlib
    user_id = verify_key(api_key)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid API key")
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    conn = get_conn()
    key = conn.execute("SELECT role FROM api_keys WHERE key_hash=? AND is_active=1", (key_hash,)).fetchone()
    conn.close()
    if not key or key["role"] not in ("admin",):
        raise HTTPException(status_code=403, detail="Admin key required")
    return user_id

async def require_write(api_key: str = Security(api_key_header)):
    """read_only keys cannot write."""
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    from core.database import get_conn, verify_key
    import hashlib
    user_id = verify_key(api_key)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid API key")
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    conn = get_conn()
    key = conn.execute("SELECT role FROM api_keys WHERE key_hash=? AND is_active=1", (key_hash,)).fetchone()
    conn.close()
    if key and key["role"] == "read_only":
        raise HTTPException(status_code=403, detail="Read-only key cannot perform write operations")
    return user_id
