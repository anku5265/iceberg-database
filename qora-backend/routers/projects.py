import uuid
import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.auth import verify_api_key
from core.database import get_conn

router = APIRouter(prefix="/projects", tags=["Projects"])

class ProjectCreate(BaseModel):
    name: str
    description: str = ""

@router.get("")
async def list_projects(user_id: str = Depends(verify_api_key)):
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name, description, created_at FROM projects WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    conn.close()
    return {"projects": [dict(r) for r in rows]}

@router.post("", status_code=201)
async def create_project(body: ProjectCreate, user_id: str = Depends(verify_api_key)):
    project_id = str(uuid.uuid4())
    conn = get_conn()
    conn.execute(
        "INSERT INTO projects (id, user_id, name, description, created_at) VALUES (?, ?, ?, ?, ?)",
        (project_id, user_id, body.name, body.description, int(time.time()))
    )
    conn.commit()
    conn.close()
    return {"id": project_id, "name": body.name, "message": "Project created"}

@router.delete("/{project_id}")
async def delete_project(project_id: str, user_id: str = Depends(verify_api_key)):
    conn = get_conn()
    proj = conn.execute(
        "SELECT id FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id)
    ).fetchone()
    if not proj:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return {"message": "Project deleted"}
