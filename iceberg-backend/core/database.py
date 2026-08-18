"""
SQLite database for users, API keys, and usage tracking.
Uses stdlib sqlite3 — no extra dependencies.
"""
import sqlite3
import uuid
import hashlib
import time
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "iceberg.db"

def get_conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            plan TEXT DEFAULT 'free',
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            project_id TEXT,
            key_hash TEXT UNIQUE NOT NULL,
            key_prefix TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'read_write',
            created_at INTEGER NOT NULL,
            last_used INTEGER,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS usage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            action TEXT NOT NULL,
            collection TEXT,
            detail TEXT,
            duration_ms INTEGER,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS waitlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS assistants (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            greeting TEXT DEFAULT 'Hi! How can I help you?',
            llm_provider TEXT DEFAULT 'openai',
            llm_model TEXT DEFAULT 'gpt-3.5-turbo',
            llm_api_key TEXT DEFAULT '',
            color TEXT DEFAULT '#2563eb',
            whatsapp_token TEXT DEFAULT '',
            whatsapp_phone_id TEXT DEFAULT '',
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    conn.commit()

    # Ensure dev key exists
    _ensure_dev_key(conn)
    conn.close()

def _ensure_dev_key(conn):
    DEV_KEY = "ib_dev_test123"
    DEV_USER_ID = "dev_user_001"

    exists = conn.execute("SELECT id FROM users WHERE id = ?", (DEV_USER_ID,)).fetchone()
    if not exists:
        conn.execute("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                     (DEV_USER_ID, "dev@iceberg.in", "", int(time.time())))

    key_hash = hashlib.sha256(DEV_KEY.encode()).hexdigest()
    exists_key = conn.execute("SELECT id FROM api_keys WHERE key_hash = ?", (key_hash,)).fetchone()
    if not exists_key:
        conn.execute(
            "INSERT INTO api_keys (id, user_id, project_id, key_hash, key_prefix, name, created_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), DEV_USER_ID, None, key_hash, "ib_dev", "Dev Key", int(time.time()), 1)
        )
    conn.commit()

def verify_key(raw_key: str):
    """Returns user_id if valid, else None."""
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    conn = get_conn()
    row = conn.execute(
        "SELECT user_id FROM api_keys WHERE key_hash = ? AND is_active = 1",
        (key_hash,)
    ).fetchone()
    if row:
        conn.execute("UPDATE api_keys SET last_used = ? WHERE key_hash = ?",
                     (int(time.time()), key_hash))
        conn.commit()
    conn.close()
    return row["user_id"] if row else None

def log_usage(user_id: str, action: str, collection: str = None, detail: str = None, duration_ms: int = None):
    conn = get_conn()
    conn.execute(
        "INSERT INTO usage_logs (user_id, action, collection, detail, duration_ms, created_at) VALUES (?,?,?,?,?,?)",
        (user_id, action, collection, detail, duration_ms, int(time.time()))
    )
    conn.commit()
    conn.close()

def get_usage_stats(user_id: str) -> dict:
    conn = get_conn()
    today = int(time.time()) - 86400
    searches_today = conn.execute(
        "SELECT COUNT(*) as cnt FROM usage_logs WHERE user_id=? AND action='search' AND created_at > ?",
        (user_id, today)
    ).fetchone()["cnt"]
    total_indexed = conn.execute(
        "SELECT SUM(CAST(detail AS INTEGER)) as total FROM usage_logs WHERE user_id=? AND action='index'",
        (user_id,)
    ).fetchone()["total"] or 0
    conn.close()
    return {"searches_today": searches_today, "total_chunks_indexed": total_indexed}

def add_waitlist(email: str) -> bool:
    try:
        conn = get_conn()
        conn.execute("INSERT INTO waitlist (email, created_at) VALUES (?, ?)",
                     (email, int(time.time())))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        return False

def get_recent_logs(user_id: str, limit: int = 50) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM usage_logs WHERE user_id=? ORDER BY created_at DESC LIMIT ?",
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
