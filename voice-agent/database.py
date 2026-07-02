"""
SQLite database — appointments, clients, call logs.
No external DB needed — sab local file mein.
"""
import sqlite3
import time
import uuid
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "agent.db"

def get_conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            business_name TEXT NOT NULL,
            business_type TEXT NOT NULL,
            business_info TEXT NOT NULL,
            owner_whatsapp TEXT,
            owner_phone TEXT,
            vapi_assistant_id TEXT,
            vapi_phone_number TEXT,
            language TEXT DEFAULT 'hi-IN',
            created_at INTEGER NOT NULL,
            is_active INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL,
            call_id TEXT,
            caller_name TEXT,
            caller_phone TEXT,
            appointment_date TEXT,
            appointment_time TEXT,
            reason TEXT,
            status TEXT DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        CREATE TABLE IF NOT EXISTS call_logs (
            id TEXT PRIMARY KEY,
            client_id TEXT,
            call_id TEXT,
            caller_number TEXT,
            duration_seconds INTEGER,
            transcript TEXT,
            summary TEXT,
            appointment_booked INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL
        );
    """)
    conn.commit()
    conn.close()

# ── Clients ───────────────────────────────────────────────────────────────────

def create_client(business_name, business_type, business_info, owner_whatsapp="", owner_phone="", language="hi-IN") -> str:
    client_id = str(uuid.uuid4())[:8]
    conn = get_conn()
    conn.execute(
        "INSERT INTO clients (id, business_name, business_type, business_info, owner_whatsapp, owner_phone, language, created_at) VALUES (?,?,?,?,?,?,?,?)",
        (client_id, business_name, business_type, business_info, owner_whatsapp, owner_phone, language, int(time.time()))
    )
    conn.commit()
    conn.close()
    return client_id

def get_client(client_id: str) -> dict:
    conn = get_conn()
    row = conn.execute("SELECT * FROM clients WHERE id=?", (client_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def list_clients() -> list:
    conn = get_conn()
    rows = conn.execute("SELECT * FROM clients WHERE is_active=1 ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_vapi_id(client_id: str, assistant_id: str, phone_number: str = ""):
    conn = get_conn()
    conn.execute(
        "UPDATE clients SET vapi_assistant_id=?, vapi_phone_number=? WHERE id=?",
        (assistant_id, phone_number, client_id)
    )
    conn.commit()
    conn.close()

# ── Appointments ──────────────────────────────────────────────────────────────

def save_appointment(client_id, call_id, caller_name, caller_phone, date, time_slot, reason) -> str:
    appt_id = str(uuid.uuid4())[:8]
    conn = get_conn()
    conn.execute(
        "INSERT INTO appointments (id, client_id, call_id, caller_name, caller_phone, appointment_date, appointment_time, reason, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        (appt_id, client_id, call_id, caller_name, caller_phone, date, time_slot, reason, int(time.time()))
    )
    conn.commit()
    conn.close()
    return appt_id

def get_appointments(client_id: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM appointments WHERE client_id=? ORDER BY created_at DESC",
        (client_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── Call Logs ─────────────────────────────────────────────────────────────────

def save_call_log(client_id, call_id, caller_number, duration, transcript, summary, appointment_booked=False):
    conn = get_conn()
    conn.execute(
        "INSERT INTO call_logs (id, client_id, call_id, caller_number, duration_seconds, transcript, summary, appointment_booked, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        (str(uuid.uuid4())[:8], client_id, call_id, caller_number, duration, transcript, summary, int(appointment_booked), int(time.time()))
    )
    conn.commit()
    conn.close()

def get_call_logs(client_id: str, limit: int = 20) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM call_logs WHERE client_id=? ORDER BY created_at DESC LIMIT ?",
        (client_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
