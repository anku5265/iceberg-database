import time
import json
from fastapi import APIRouter, Depends, HTTPException
from core.auth import verify_api_key, require_write
from services import qdrant as qdrant_svc
from services.storage import upload_bytes, download_bytes, list_files, is_configured
from pathlib import Path

router = APIRouter(prefix="/backup", tags=["Backup"])
LOCAL_BACKUP_DIR = Path(__file__).parent.parent / "data" / "backups"


@router.post("/{collection}")
async def create_backup(collection: str, user_id: str = Depends(require_write)):
    """Backup a collection (supports both IcebergCore Rust Engine and Qdrant Cloud)."""
    try:
        scoped, meta_info, points = qdrant_svc.export_backup_points(collection, user_id=user_id)
        backup_data = {
            "collection": collection,
            "scoped_collection": scoped,
            "user_id": user_id,
            "dimension": meta_info.get("dimension", 384),
            "metric": meta_info.get("metric", "cosine"),
            "quantization": meta_info.get("quantization", "float32"),
            "created_at": int(time.time()),
            "points": points,
        }
        data_bytes = json.dumps(backup_data).encode()
        ts = int(time.time())
        key = f"backups/{user_id}/{collection}/{ts}.json"

        if is_configured():
            url = upload_bytes(data_bytes, key, "application/json")
            storage = "r2"
        else:
            LOCAL_BACKUP_DIR.mkdir(parents=True, exist_ok=True)
            path = LOCAL_BACKUP_DIR / f"{scoped}_{ts}.json"
            path.write_bytes(data_bytes)
            url = str(path)
            storage = "local"

        return {
            "backup_id": f"{collection}_{ts}",
            "collection": collection,
            "points_backed_up": len(points),
            "storage": storage,
            "location": url,
            "created_at": ts,
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
async def restore_backup(collection: str, backup_id: str, user_id: str = Depends(require_write)):
    """Restore a collection from backup."""
    try:
        scoped = qdrant_svc.resolve_collection(collection, user_id=user_id)
        ts = backup_id.replace(f"{collection}_", "")
        if is_configured():
            key = f"backups/{user_id}/{collection}/{ts}.json"
            data_bytes = download_bytes(key)
        else:
            path = LOCAL_BACKUP_DIR / f"{scoped}_{ts}.json"
            if not path.exists():
                path = LOCAL_BACKUP_DIR / f"{backup_id}.json"
            if not path.exists():
                raise HTTPException(404, "Backup not found")
            data_bytes = path.read_bytes()

        if not data_bytes:
            raise HTTPException(404, "Backup not found")

        backup_data = json.loads(data_bytes)
        restored_count = qdrant_svc.restore_backup_points(collection, backup_data, user_id=user_id)

        return {
            "restored": True,
            "collection": collection,
            "points_restored": restored_count,
            "from_backup": backup_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
