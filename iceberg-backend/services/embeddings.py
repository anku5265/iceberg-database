import os
import shutil
from fastembed import TextEmbedding
import concurrent.futures

if os.name == "nt":
    _orig_symlink = os.symlink
    def _safe_symlink(src, dst, *args, **kwargs):
        try:
            return _orig_symlink(src, dst, *args, **kwargs)
        except OSError as e:
            if getattr(e, "winerror", None) == 1314:
                src_abs = os.path.normpath(os.path.join(os.path.dirname(dst), src)) if not os.path.isabs(src) else src
                if os.path.isdir(src_abs):
                    shutil.copytree(src_abs, dst, dirs_exist_ok=True)
                else:
                    shutil.copy2(src_abs, dst)
            else:
                raise
    os.symlink = _safe_symlink

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
VECTOR_SIZE = 384

print("Loading embedding model...", flush=True)
_model = TextEmbedding(model_name=MODEL_NAME, threads=4)
print("Embedding model ready.", flush=True)

def embed(texts: list[str]) -> list[list[float]]:
    # Use parallel=True for batch processing
    return [v.tolist() for v in _model.embed(texts, batch_size=32, parallel=0)]

def embed_query(text: str) -> list[float]:
    # Single query — use embed directly, fastest path
    return next(_model.query_embed(text)).tolist()

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return [c for c in chunks if c.strip()]
