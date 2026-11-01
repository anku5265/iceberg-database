import io
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from services import qdrant as qdrant_svc
from services.embeddings import embed, chunk_text
from services import storage
from core.auth import verify_api_key, require_write
from core.database import log_usage

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
async def upload_document(
    collection: str = Form(...),
    file: UploadFile = File(...),
    namespace: str = Form(default=""),
    user_id: str = Depends(require_write),
):
    content = await file.read()
    text = ""
    if file.filename and file.filename.endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF parse error: {e}")
    else:
        text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No text extracted from file")

    r2_key = None
    if storage.is_configured():
        r2_key = storage.upload_bytes(
            content,
            f"uploads/{user_id}/{collection}/{file.filename}",
            file.content_type or "application/octet-stream",
        )

    chunks = chunk_text(text)
    vectors = embed(chunks)
    metadata = [{"source": file.filename, "chunk_index": i, "r2_key": r2_key} for i in range(len(chunks))]
    qdrant_svc.create_collection(collection, user_id=user_id)
    ids = qdrant_svc.upsert_vectors(
        collection, chunks, vectors, metadata, namespace=namespace, user_id=user_id
    )
    log_usage(user_id, "index", collection, str(len(ids)))

    return {
        "message": "Indexed successfully",
        "collection": collection,
        "chunks_indexed": len(ids),
        "ids": ids,
        "filename": file.filename,
        "stored_in_r2": r2_key is not None,
    }


@router.post("/text")
async def index_text(
    collection: str = Form(...),
    text: str = Form(...),
    source: str = Form(default="manual"),
    namespace: str = Form(default=""),
    doc_id: Optional[str] = Form(default=None),
    user_id: str = Depends(require_write),
):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is empty")

    chunks = chunk_text(text)
    vectors = embed(chunks)
    metadata = [{"source": source, "chunk_index": i} for i in range(len(chunks))]
    custom_ids = None
    if doc_id:
        custom_ids = [doc_id if len(chunks) == 1 else f"{doc_id}_{i}" for i in range(len(chunks))]

    qdrant_svc.create_collection(collection, user_id=user_id)
    ids = qdrant_svc.upsert_vectors(
        collection,
        chunks,
        vectors,
        metadata,
        namespace=namespace,
        ids=custom_ids,
        user_id=user_id,
    )
    log_usage(user_id, "index", collection, str(len(ids)))

    return {
        "message": "Indexed successfully",
        "collection": collection,
        "chunks_indexed": len(ids),
        "ids": ids,
        "namespace": namespace,
    }


class BatchIndexRequest(BaseModel):
    collection: str
    items: list[str]
    source: str = "sample_knowledge_base"
    namespace: str = ""
    ids: Optional[list[str]] = None
    metadata_list: Optional[list[dict]] = None


@router.post("/batch")
async def index_batch(body: BatchIndexRequest, user_id: str = Depends(require_write)):
    if not body.items:
        raise HTTPException(status_code=400, detail="Items cannot be empty")
    all_chunks = []
    all_metadata = []
    all_ids = []
    for idx, item in enumerate(body.items):
        if not item or not item.strip():
            continue
        item_meta = (
            body.metadata_list[idx]
            if (body.metadata_list and idx < len(body.metadata_list) and isinstance(body.metadata_list[idx], dict))
            else {}
        )
        base_id = body.ids[idx] if (body.ids and idx < len(body.ids)) else None
        chunks = chunk_text(item)
        for i, c in enumerate(chunks):
            all_chunks.append(c)
            all_metadata.append({"source": body.source, "item_index": idx, "chunk_index": i, **item_meta})
            if base_id:
                all_ids.append(base_id if len(chunks) == 1 else f"{base_id}_{i}")
            else:
                all_ids.append(None)
    if not all_chunks:
        raise HTTPException(status_code=400, detail="No valid text found")

    vectors = embed(all_chunks)
    qdrant_svc.create_collection(body.collection, user_id=user_id)
    ids = qdrant_svc.upsert_vectors(
        body.collection,
        all_chunks,
        vectors,
        all_metadata,
        namespace=body.namespace,
        ids=all_ids if any(all_ids) else None,
        user_id=user_id,
    )
    log_usage(user_id, "index", body.collection, str(len(ids)))
    return {
        "message": "Batch indexed successfully",
        "collection": body.collection,
        "chunks_indexed": len(ids),
        "ids": ids,
    }


class PointUpsertRequest(BaseModel):
    text: Optional[str] = None
    vector: Optional[list[float]] = None
    metadata: Optional[dict] = None
    namespace: Optional[str] = None


@router.put("/{collection}/points/{point_id}")
async def upsert_single_point(
    collection: str,
    point_id: str,
    body: PointUpsertRequest,
    user_id: str = Depends(require_write),
):
    """Insert or update a single vector/document chunk and its metadata by ID."""
    try:
        existing = qdrant_svc.get_point(collection, point_id, user_id=user_id)
    except Exception:
        existing = None

    new_text = body.text if body.text is not None else (existing["text"] if existing else "")
    if body.text is not None and not body.text.strip() and body.vector is None:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if body.vector is not None:
        vec = body.vector
    elif body.text is not None:
        vec = embed([new_text])[0]
    elif existing and existing.get("vector"):
        vec = existing["vector"]
    else:
        raise HTTPException(status_code=400, detail="Either text or vector must be provided")

    merged_meta = dict(existing["metadata"]) if existing else {}
    if body.metadata is not None:
        merged_meta.update(body.metadata)

    ns = body.namespace if body.namespace is not None else (existing["namespace"] if existing else "")

    try:
        qdrant_svc.create_collection(collection, user_id=user_id)
        ids = qdrant_svc.upsert_vectors(
            collection=collection,
            texts=[new_text],
            vectors=[vec],
            metadata=[merged_meta],
            namespace=ns,
            ids=[point_id],
            user_id=user_id,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    return {
        "id": ids[0],
        "collection": collection,
        "updated": existing is not None,
        "text": new_text,
        "metadata": merged_meta,
    }


@router.get("/{collection}/points/{point_id}")
async def get_single_point(
    collection: str,
    point_id: str,
    user_id: str = Depends(verify_api_key),
):
    """Retrieve a single vector/document chunk by ID."""
    try:
        rec = qdrant_svc.get_point(collection, point_id, user_id=user_id)
    except Exception:
        rec = None
    if not rec:
        raise HTTPException(status_code=404, detail=f"Point '{point_id}' not found")
    return rec


@router.delete("/{collection}/points/{point_id}")
async def delete_single_point(
    collection: str,
    point_id: str,
    user_id: str = Depends(require_write),
):
    """Delete a single vector/document chunk by ID."""
    try:
        deleted = qdrant_svc.delete_point(collection, point_id, user_id=user_id)
    except Exception:
        deleted = False
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Point '{point_id}' not found")
    return {"deleted": True, "id": point_id, "collection": collection}


@router.get("/{collection}/scroll")
async def scroll_collection_points(
    collection: str,
    limit: int = 100,
    offset: int = 0,
    user_id: str = Depends(verify_api_key),
):
    """Paginate and export all documents and metadata in a collection (Zero Vendor Lock-In)."""
    points = qdrant_svc.scroll_points(collection, limit=limit, offset=offset, user_id=user_id)
    return {"collection": collection, "count": len(points), "points": points}


@router.delete("/{collection}/all")
async def clear_all_documents(
    collection: str,
    user_id: str = Depends(require_write),
):
    """Delete all documents inside a collection while keeping the collection."""
    cleared = qdrant_svc.clear_collection(collection, user_id=user_id)
    if not cleared:
        raise HTTPException(status_code=404, detail=f"Collection '{collection}' not found")
    return {"cleared": True, "collection": collection}
