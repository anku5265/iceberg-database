import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from services import qdrant as qdrant_svc
from services.embeddings import embed, chunk_text
from services import storage
from core.auth import verify_api_key
from core.database import log_usage

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload")
async def upload_document(
    collection: str = Form(...),
    file: UploadFile = File(...),
    namespace: str = Form(default=""),
    user_id: str = Depends(verify_api_key)
):
    content = await file.read()
    text = ""
    if file.filename.endswith(".pdf"):
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

    # Store original file in R2 if configured
    r2_key = None
    if storage.is_configured():
        r2_key = storage.upload_bytes(
            content,
            f"uploads/{user_id}/{collection}/{file.filename}",
            file.content_type or "application/octet-stream"
        )

    chunks = chunk_text(text)
    vectors = embed(chunks)
    metadata = [{"source": file.filename, "chunk_index": i, "r2_key": r2_key} for i in range(len(chunks))]
    count = qdrant_svc.upsert_vectors(collection, chunks, vectors, metadata, namespace=namespace)
    log_usage(user_id, "index", collection, str(count))

    return {
        "message": "Indexed successfully",
        "collection": collection,
        "chunks_indexed": count,
        "filename": file.filename,
        "stored_in_r2": r2_key is not None,
    }

@router.post("/text")
async def index_text(
    collection: str = Form(...),
    text: str = Form(...),
    source: str = Form(default="manual"),
    namespace: str = Form(default=""),
    user_id: str = Depends(verify_api_key)
):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is empty")

    chunks = chunk_text(text)
    vectors = embed(chunks)
    metadata = [{"source": source, "chunk_index": i} for i in range(len(chunks))]
    count = qdrant_svc.upsert_vectors(collection, chunks, vectors, metadata, namespace=namespace)
    log_usage(user_id, "index", collection, str(count))

    return {"message": "Indexed successfully", "collection": collection, "chunks_indexed": count, "namespace": namespace}
