from fastapi import APIRouter, Depends, HTTPException
from models.schemas import CollectionCreate, CollectionResponse
from services import qdrant as qdrant_svc
from core.auth import verify_api_key

router = APIRouter(prefix="/collections", tags=["Collections"])

@router.post("", status_code=201)
async def create_collection(body: CollectionCreate, _=Depends(verify_api_key)):
    created = qdrant_svc.create_collection(body.name)
    if not created:
        raise HTTPException(status_code=409, detail="Collection already exists")
    return {"name": body.name, "message": "Collection created"}

@router.get("")
async def list_collections(_=Depends(verify_api_key)):
    names = qdrant_svc.list_collections()
    return {"collections": names}

@router.get("/{name}")
async def get_collection(name: str, _=Depends(verify_api_key)):
    try:
        info = qdrant_svc.get_collection_info(name)
        return {"name": name, **info}
    except Exception:
        raise HTTPException(status_code=404, detail="Collection not found")

@router.delete("/{name}")
async def delete_collection(name: str, _=Depends(verify_api_key)):
    qdrant_svc.delete_collection(name)
    return {"message": f"Collection '{name}' deleted"}
