import json
import re
import time
import uuid
from typing import List, Optional
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.auth import require_admin, verify_api_key
from core.database import get_conn

router = APIRouter(prefix="/partner-integrations", tags=["Partner Integrations"])

SLUG_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]{1,63}$")


class CreatePartnerIntegrationRequest(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = ""
    return_mechanism: str = "web_message"  # 'web_message' | 'copy_paste'
    allowed_origins: Optional[List[str]] = None


class PartnerApplicationRequest(BaseModel):
    name: str
    email: str
    repo_or_url: str
    source_tag: Optional[str] = ""
    description: str


def record_integration_hit(raw_tag: str) -> None:
    tag = (raw_tag or "").strip().lower()[:64]
    if not tag:
        return
    now = int(time.time())
    conn = get_conn()
    try:
        conn.execute(
            """
            INSERT INTO integration_usage_stats (source_tag, request_count, last_seen_at)
            VALUES (?, 1, ?)
            ON CONFLICT(source_tag) DO UPDATE SET
                request_count = request_count + 1,
                last_seen_at = excluded.last_seen_at
            """,
            (tag, now),
        )
        conn.commit()
    except Exception:
        pass
    finally:
        conn.close()


def _normalize_origin(raw: str) -> str:
    val = (raw or "").strip().rstrip("/")
    if not val:
        return ""
    parsed = urlparse(val)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid origin '{raw}'. Origins must include protocol and host (e.g. https://app.example.com).",
        )
    return f"{parsed.scheme}://{parsed.netloc}"


def _row_to_dict(row, stats_map: Optional[dict] = None) -> dict:
    try:
        origins = json.loads(row["allowed_origins"] or "[]")
    except Exception:
        origins = []
    slug_key = (row["slug"] or "").lower()
    stat = (stats_map or {}).get(slug_key, {})
    return {
        "id": row["id"],
        "name": row["name"],
        "slug": row["slug"],
        "integrationId": row["slug"],
        "logo_url": row["logo_url"] or "",
        "return_mechanism": row["return_mechanism"] or "web_message",
        "allowed_origins": origins,
        "attributed_requests": stat.get("request_count", 0),
        "last_seen_at": stat.get("last_seen_at"),
        "created_at": row["created_at"],
    }


@router.post("")
async def create_partner_integration(
    body: CreatePartnerIntegrationRequest,
    user_id: str = Depends(require_admin),
):
    name = (body.name or "").strip()
    slug = (body.slug or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Integration name is required.")
    if not SLUG_RE.match(slug):
        raise HTTPException(
            status_code=400,
            detail="URL Slug (integrationId) must be 2-64 characters using letters, numbers, hyphens, or underscores.",
        )

    mechanism = (body.return_mechanism or "web_message").strip().lower()
    if mechanism not in ("web_message", "copy_paste"):
        raise HTTPException(status_code=400, detail="return_mechanism must be 'web_message' or 'copy_paste'.")

    origins: List[str] = []
    if mechanism == "web_message" and body.allowed_origins:
        for o in body.allowed_origins:
            norm = _normalize_origin(o)
            if norm and norm not in origins:
                origins.append(norm)

    conn = get_conn()
    try:
        existing = conn.execute("SELECT id FROM partner_integrations WHERE lower(slug)=lower(?)", (slug,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail=f"Integration slug '{slug}' is already taken.")

        rec_id = str(uuid.uuid4())
        now = int(time.time())
        conn.execute(
            """
            INSERT INTO partner_integrations (id, user_id, name, slug, logo_url, return_mechanism, allowed_origins, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (rec_id, user_id, name, slug, (body.logo_url or "").strip(), mechanism, json.dumps(origins), now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM partner_integrations WHERE id=?", (rec_id,)).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


@router.get("")
async def list_partner_integrations(user_id: str = Depends(verify_api_key)):
    conn = get_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM partner_integrations WHERE user_id=? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
        stat_rows = conn.execute("SELECT source_tag, request_count, last_seen_at FROM integration_usage_stats").fetchall()
        stats_map = {
            r["source_tag"].lower(): {"request_count": r["request_count"], "last_seen_at": r["last_seen_at"]}
            for r in stat_rows
        }
        return {"integrations": [_row_to_dict(r, stats_map) for r in rows]}
    finally:
        conn.close()


@router.post("/apply")
async def apply_partner_listing(body: PartnerApplicationRequest):
    name = (body.name or "").strip()
    email = (body.email or "").strip()
    repo_or_url = (body.repo_or_url or "").strip()
    description = (body.description or "").strip()
    source_tag = (body.source_tag or "").strip()[:64]

    if not name or not email or "@" not in email or not repo_or_url or not description:
        raise HTTPException(status_code=400, detail="Please complete all required application fields.")

    app_id = str(uuid.uuid4())
    now = int(time.time())
    conn = get_conn()
    try:
        conn.execute(
            """
            INSERT INTO partner_applications (id, name, email, repo_or_url, source_tag, description, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
            """,
            (app_id, name, email, repo_or_url, source_tag, description, now),
        )
        conn.commit()
        return {"submitted": True, "id": app_id, "status": "pending"}
    finally:
        conn.close()


@router.get("/applications")
async def list_partner_applications(user_id: str = Depends(require_admin)):
    conn = get_conn()
    try:
        rows = conn.execute("SELECT * FROM partner_applications ORDER BY created_at DESC LIMIT 100").fetchall()
        return {
            "applications": [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "email": r["email"],
                    "repo_or_url": r["repo_or_url"],
                    "source_tag": r["source_tag"],
                    "description": r["description"],
                    "status": r["status"],
                    "created_at": r["created_at"],
                }
                for r in rows
            ]
        }
    finally:
        conn.close()


@router.get("/public/{slug}")
async def get_public_partner_integration(slug: str):
    clean = (slug or "").strip()
    conn = get_conn()
    try:
        row = conn.execute("SELECT * FROM partner_integrations WHERE lower(slug)=lower(?)", (clean,)).fetchone()
        if not row:
            return {
                "registered": False,
                "name": clean,
                "slug": clean,
                "integrationId": clean,
                "logo_url": "",
                "return_mechanism": "web_message",
                "allowed_origins": [],
            }
        data = _row_to_dict(row)
        data["registered"] = True
        return data
    finally:
        conn.close()


@router.delete("/{slug}")
async def delete_partner_integration(slug: str, user_id: str = Depends(require_admin)):
    conn = get_conn()
    try:
        cur = conn.execute(
            "DELETE FROM partner_integrations WHERE lower(slug)=lower(?) AND user_id=?",
            ((slug or "").strip(), user_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Integration '{slug}' not found.")
        return {"deleted": True, "slug": slug}
    finally:
        conn.close()
