import time
import json
from fastapi import APIRouter, Depends, HTTPException
from core.auth import verify_api_key
from services import qdrant as qdrant_svc
from services.storage import upload_bytes, download_bytes, list_files, is_configured
from pathlib import Path

router = APIRouter(prefix="/backup", tags=["Backup"])
LOCAL_BACKUP_DIR = Path(__file__).parent.parent / "data" / "backups"

@router.post("/{collection}")
async def create_backup(collection: str, user_id: str = Depends(verify_api_key)):
    """Backup a collection. Saves to R2 if configured, else local disk."""
    try:
        client = qdrant_svc._primary()
        points, _ = client.scroll(collection_name=collection, limit=10000, with_payload=True, with_vectors=True)
        backup_data = {
            "collection": collection,
            "user_id": user_id,
            "created_at": int(time.time()),
            "points": [{"id": str(p.id), "vector": p.vector, "payload": p.payload} for p in points]
        }
        data_bytes = json.dumps(backup_data).encode()
        ts = int(time.time())
        key = f"backups/{user_id}/{collection}/{ts}.json"

        if is_configured():
            url = upload_bytes(data_bytes, key, "application/json")
            storage = "r2"
        else:
            LOCAL_BACKUP_DIR.mkdir(parents=True, exist_ok=True)
            path = LOCAL_BACKUP_DIR / f"{collection}_{ts}.json"
            path.write_bytes(data_bytes)
            url = str(path)
            storage = "local"

        return {
            "backup_id": f"{collection}_{ts}",
            "collection": collection,
            "points_backed_up": len(points),
            "storage": storage,
            "location": url,
            "created_at": ts
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("")
async def list_backups(user_id: str = Depends(verify_api_key)):
    """List all backups."""
    if is_configured():
        keys = list_files(f"backups/{user_id}/")
        return {"backups": [{"key": k} for k in keys], "storage": "r2"}
    LOCAL_BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    files = list(LOCAL_BACKUP_DIR.glob("*.json"))
    return {"backups": [{"key": f.name, "size_kb": f.stat().st_size // 1024} for f in files], "storage": "local"}

@router.post("/{collection}/restore/{backup_id}")
async def restore_backup(collection: str, backup_id: str, user_id: str = Depends(verify_api_key)):
    """Restore a collection from backup."""
    try:
        ts = backup_id.replace(f"{collection}_", "")
        if is_configured():
            key = f"backups/{user_id}/{collection}/{ts}.json"
            data_bytes = download_bytes(key)
        else:
            path = LOCAL_BACKUP_DIR / f"{backup_id}.json"
            if not path.exists():
                raise HTTPException(404, "Backup not found")
            data_bytes = path.read_bytes()

        if not data_bytes:
            raise HTTPException(404, "Backup not found")

        backup_data = json.loads(data_bytes)
        from qdrant_client.models import PointStruct
        client = qdrant_svc._primary()

        # Recreate collection
        qdrant_svc.delete_collection(collection)
        qdrant_svc.create_collection(collection)

        # Restore points
        points = [
            PointStruct(id=p["id"], vector=p["vector"], payload=p["payload"])
            for p in backup_data["points"]
        ]
        if points:
            client.upsert(collection_name=collection, points=points)

        return {
            "restored": True,
            "collection": collection,
            "points_restored": len(points),
            "from_backup": backup_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
