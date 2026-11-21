from pydantic import BaseModel
from typing import Optional, Dict, Any, List


# Collections — backward-compatible defaults (384d Cosine Float32) + Multi-Dimension & Quantization
class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    dimension: int = 384
    metric: str = "cosine"
    quantization: str = "float32"
    engine: Optional[str] = None


class CollectionResponse(BaseModel):
    name: str
    description: str
    vector_count: int


# Search — supports text auto-embed, optional BYO query vector, rich filters, hybrid RRF & cognitive decay
class SearchRequest(BaseModel):
    query: str = ""
    vector: Optional[List[float]] = None
    collection: str
    top_k: int = 5
    score_threshold: float = 0.2
    filters: Optional[Dict[str, Any]] = None
    search_type: str = "hybrid"
    alpha: float = 0.5
    namespace: Optional[str] = None
    use_cognitive_decay: bool = False
    decay_lambda: float = 0.015


class SearchResult(BaseModel):
    id: Optional[str] = None
    text: str
    score: float
    metadata: Optional[dict] = {}


class SearchResponse(BaseModel):
    results: list[SearchResult]
    query: str
    collection: str
    total: int = 0
