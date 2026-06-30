from pydantic import BaseModel
from typing import Optional, Dict, Any

# Collections
class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class CollectionResponse(BaseModel):
    name: str
    description: str
    vector_count: int

# Search — with optional metadata filters and hybrid mode
class SearchRequest(BaseModel):
    query: str
    collection: str
    top_k: int = 5
    score_threshold: float = 0.3
    filters: Optional[Dict[str, Any]] = None
    search_type: str = "hybrid"
    alpha: float = 0.5
    namespace: Optional[str] = None

class SearchResult(BaseModel):
    text: str
    score: float
    metadata: Optional[dict] = {}

class SearchResponse(BaseModel):
    results: list[SearchResult]
    query: str
    collection: str
    total: int = 0
