from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from models.schemas import CollectionCreate
from services import qdrant as qdrant_svc
from core.auth import verify_api_key, require_write

router = APIRouter(prefix="/collections", tags=["Collections"])


class CollectionRenameRequest(BaseModel):
    new_name: str


@router.post("", status_code=201)
async def create_collection(body: CollectionCreate, user_id: str = Depends(require_write)):
    if not body.name or not body.name.strip():
        raise HTTPException(status_code=400, detail="Collection name cannot be empty")
    created = qdrant_svc.create_collection(body.name.strip(), user_id=user_id)
    if not created:
        raise HTTPException(status_code=409, detail="Collection already exists")
    return {"name": body.name.strip(), "message": "Collection created"}


@router.get("")
async def list_collections(user_id: str = Depends(verify_api_key)):
    names = qdrant_svc.list_collections(user_id=user_id)
    return {"collections": names}


@router.get("/{name}")
async def get_collection(name: str, user_id: str = Depends(verify_api_key)):
    try:
        info = qdrant_svc.get_collection_info(name, user_id=user_id)
        return {"name": name, **info}
    except Exception:
        raise HTTPException(status_code=404, detail="Collection not found")


@router.patch("/{name}")
async def rename_collection(name: str, body: CollectionRenameRequest, user_id: str = Depends(require_write)):
    if not body.new_name or not body.new_name.strip():
        raise HTTPException(status_code=400, detail="New collection name cannot be empty")
    try:
        res = qdrant_svc.rename_collection(name.strip(), body.new_name.strip(), user_id=user_id)
        return {"renamed": True, **res}
    except ValueError as ve:
        msg = str(ve)
        code = 404 if "not found" in msg.lower() else 409
        raise HTTPException(status_code=code, detail=msg)


@router.post("/{name}/clear")
async def clear_collection(name: str, user_id: str = Depends(require_write)):
    cleared = qdrant_svc.clear_collection(name, user_id=user_id)
    if not cleared:
        raise HTTPException(status_code=404, detail=f"Collection '{name}' not found")
    return {"cleared": True, "collection": name, "message": f"All documents in '{name}' cleared"}


@router.delete("/{name}")
async def delete_collection(name: str, user_id: str = Depends(require_write)):
    qdrant_svc.delete_collection(name, user_id=user_id)
    return {"message": f"Collection '{name}' deleted"}
