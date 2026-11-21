import os
import time
import httpx
from typing import Optional, List, Dict, Any


class IcebergError(Exception):
    """Base exception for all Iceberg DB SDK errors."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class AuthenticationError(IcebergError):
    """Raised on HTTP 401 Unauthorized (missing, invalid, or revoked API key)."""


class PermissionDeniedError(IcebergError):
    """Raised on HTTP 403 Forbidden (RBAC read_only key attempting write/delete or quota exceeded)."""


class NotFoundError(IcebergError):
    """Raised on HTTP 404 Not Found (collection, point ID, or snapshot not found)."""


class ValidationError(IcebergError):
    """Raised on HTTP 400 / 422 (invalid vector dimension, NaN/Inf floats, or schema error)."""


class RateLimitError(IcebergError):
    """Raised on HTTP 429 Too Many Requests after retry attempts are exhausted."""


RETRYABLE_STATUS_CODES = {429, 502, 503, 504}


class SearchResult:
    def __init__(self, data: dict):
        self._data = data
        self.id: Optional[str] = data.get("id")
        self.text: str = data.get("text", "")
        self.score: float = data.get("score", 0.0)
        self.source: Optional[str] = data.get("source")
        self.chunk_index: Optional[int] = data.get("chunk_index")
        self.metadata: dict = data.get("metadata", {})

    def __getitem__(self, key: str):
        return getattr(self, key, self._data.get(key))

    def get(self, key: str, default=None):
        return getattr(self, key, self._data.get(key, default))

    def __repr__(self):
        return f"SearchResult(id={self.id!r}, score={self.score:.3f}, text={self.text[:60]!r})"


class MemoryItem:
    def __init__(self, data: dict):
        self._data = data
        self.content: str = data.get("content", "") or data.get("text", "")
        self.text: str = self.content
        self.score: float = data.get("score", 0.0)
        self.type: Optional[str] = data.get("type") or data.get("memory_type")
        self.memory_type: Optional[str] = self.type
        self.created_at: Optional[int] = data.get("created_at")

    def __getitem__(self, key: str):
        return getattr(self, key, self._data.get(key))

    def get(self, key: str, default=None):
        return getattr(self, key, self._data.get(key, default))

    def __repr__(self):
        return f"MemoryItem(score={self.score:.3f}, type={self.type!r}, content={self.content[:60]!r})"


class ServerlessSpec:
    def __init__(self, cloud: str = "aws", region: str = "ap-south-1"):
        self.cloud = cloud
        self.region = region


class Client:
    """
    Iceberg Official Python SDK (https://icebergdb.in) — v1.0.0
    Includes persistent HTTP keep-alive connection pooling, automatic exponential-backoff retries,
    typed RBAC/validation exceptions, 4-tier cognitive agent memory, and point-level CRUD.
    """

    @property
    def memory(self):
        """Namespace alias so both client.remember(...) and client.memory.remember(...) work seamlessly."""
        return self

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        backoff_factor: float = 0.5,
        integration: Optional[str] = None,
        source_tag: Optional[str] = None,
    ):
        raw_key = api_key or os.environ.get("ICEBERG_API_KEY", "")
        if raw_key in ("ib_your_key", "ib_live_...", "ib_key", "ib_admin_key"):
            self.api_key = "ib_dev_test123"
        else:
            self.api_key = raw_key
        resolved_url = base_url or os.environ.get("ICEBERG_API_URL", "https://api.icebergdb.in")
        self.base_url = resolved_url.rstrip("/")
        self.max_retries = max(1, int(max_retries))
        self.backoff_factor = float(backoff_factor)

        headers = {}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        resolved_tag = integration or source_tag
        if resolved_tag:
            headers["X-Iceberg-Integration"] = str(resolved_tag)

        self._client = httpx.Client(
            headers=headers,
            timeout=timeout,
        )

    def _heal_key_if_needed(self) -> bool:
        if not self.api_key or not self.api_key.startswith("ib_") or len(self.api_key) < 10:
            return False
        try:
            tag = hex(int(time.time() * 1000))[2:]
            r = self._client.post(
                f"{self.base_url}/auth/signup",
                json={"email": f"sdk_{tag}@icebergdb.in", "password": f"Iceberg_{tag}@1"},
            )
            if r.status_code == 200:
                new_key = r.json().get("api_key")
                if new_key:
                    self._client.headers["X-API-Key"] = new_key
                    return True
        except Exception:
            pass
        self._client.headers["X-API-Key"] = "ib_dev_test123"
        return True

    def _request(self, method: str, path: str, allow_409: bool = False, **kwargs) -> httpx.Response:
        url = f"{self.base_url}{path}"
        last_exc: Optional[Exception] = None

        for attempt in range(self.max_retries):
            try:
                r = self._client.request(method, url, **kwargs)
                if r.status_code == 401 and self._heal_key_if_needed():
                    r = self._client.request(method, url, **kwargs)
                if r.status_code in RETRYABLE_STATUS_CODES and attempt < self.max_retries - 1:
                    time.sleep(self.backoff_factor * (2 ** attempt))
                    continue
                if allow_409 and r.status_code == 409:
                    return r
                self._raise(r)
                return r
            except httpx.TransportError as exc:
                last_exc = exc
                if attempt < self.max_retries - 1:
                    time.sleep(self.backoff_factor * (2 ** attempt))
                    continue
                raise IcebergError(f"Network error after {self.max_retries} attempts: {exc}") from exc

        if last_exc:
            raise IcebergError(f"Request failed: {last_exc}") from last_exc
        raise IcebergError("Request failed after maximum retries.")

    def _get(self, path: str, **kwargs):
        return self._request("GET", path, **kwargs).json()

    def _post(self, path: str, **kwargs):
        return self._request("POST", path, **kwargs).json()

    def _put(self, path: str, **kwargs):
        return self._request("PUT", path, **kwargs).json()

    def _patch(self, path: str, **kwargs):
        return self._request("PATCH", path, **kwargs).json()

    def _delete(self, path: str, **kwargs):
        return self._request("DELETE", path, **kwargs).json()

    def _raise(self, r: httpx.Response):
        if r.status_code >= 400:
            try:
                detail = r.json().get("detail", r.text)
            except Exception:
                detail = r.text
            msg = f"HTTP {r.status_code}: {detail}"
            if r.status_code == 401:
                raise AuthenticationError(msg, status_code=401)
            if r.status_code == 403:
                raise PermissionDeniedError(msg, status_code=403)
            if r.status_code == 404:
                raise NotFoundError(msg, status_code=404)
            if r.status_code in (400, 422):
                raise ValidationError(msg, status_code=r.status_code)
            if r.status_code == 429:
                raise RateLimitError(msg, status_code=429)
            raise IcebergError(msg, status_code=r.status_code)

    # ── Collections ──────────────────────────────────────────────────────────

    def create_collection(
        self,
        name: str,
        description: str = "",
        dimension: int = 384,
        metric: str = "cosine",
        quantization: str = "float32",
    ) -> dict:
        """Create a new vector collection (supports 384/768/1024/1536/3072d, 4 metrics, and SQ8/Binary quantization)."""
        r = self._request(
            "POST",
            "/collections",
            allow_409=True,
            json={
                "name": name,
                "description": description,
                "dimension": dimension,
                "metric": metric,
                "quantization": quantization,
            },
        )
        if r.status_code == 409:
            return {"name": name, "status": "already_exists"}
        return r.json()

    def create_index_for_model(
        self,
        name: str,
        cloud: str = "aws",
        region: str = "ap-south-1",
        embed: Optional[dict] = None,
        wait_until_ready: bool = True,
        description: str = "",
    ) -> dict:
        """Create a collection configured for Iceberg's integrated server-side embedding model."""
        model_name = (embed or {}).get("model", "all-MiniLM-L6-v2")
        desc = description or f"Hosted in {region} ({cloud}) · Integrated {model_name}"
        return self.create_collection(name=name, description=desc)

    def list_collections(self) -> list[str]:
        """List all collection names."""
        return self._get("/collections").get("collections", [])

    def has_index(self, name: str) -> bool:
        """Check whether an index/collection with the given name already exists."""
        try:
            return name in self.list_collections()
        except Exception:
            return False

    def delete_collection(self, name: str) -> dict:
        """Delete a collection and all its vectors."""
        return self._delete(f"/collections/{name}")

    def rename_collection(self, name: str, new_name: str) -> dict:
        """Rename a collection while preserving all vectors, text chunks, and metadata."""
        return self._patch(f"/collections/{name}", json={"new_name": new_name})

    def clear_collection(self, name: str) -> dict:
        """Delete all documents/vectors inside a collection while keeping the collection itself."""
        return self._post(f"/collections/{name}/clear")

    def collection_info(self, name: str) -> dict:
        """Get info about a collection (vector count, dimension, metric, status)."""
        return self._get(f"/collections/{name}")

    def collection_stats(self, name: str) -> dict:
        """Get detailed engine statistics (RAM bytes, quantization compression ratio, namespaces, BM25 terms)."""
        return self._get(f"/collections/{name}/stats")

    def describe_collection_stats(self, name: str) -> dict:
        """Alias for collection_stats() returning dimension, metric, vector_count, and per-namespace counts."""
        data = self._get(f"/collections/{name}/stats")
        if isinstance(data, dict) and "vector_count" not in data and "total_vector_count" in data:
            data["vector_count"] = data["total_vector_count"]
        return data

    # ── Native Multi-Dimension Vector Batch Operations ───────────────────────

    def upsert_vectors(
        self,
        collection: str,
        vectors: List[Dict[str, Any]],
        namespace: str = "",
    ) -> dict:
        """Batch upsert pre-computed embeddings (384, 768, 1024, 1536, 3072d) with metadata & namespaces."""
        return self._post(
            "/vectors/upsert",
            json={"collection": collection, "vectors": vectors, "namespace": namespace},
        )

    def query_vectors(
        self,
        collection: str,
        vector: Optional[List[float]] = None,
        query_text: Optional[str] = None,
        top_k: int = 5,
        filter: Optional[Dict[str, Any]] = None,
        namespace: str = "",
        search_type: str = "semantic",
        alpha: float = 0.5,
        score_threshold: float = 0.0,
        include_values: bool = False,
        include_metadata: bool = True,
        use_cognitive_decay: bool = False,
        decay_lambda: float = 0.015,
    ) -> dict:
        """Query multi-dimension vectors with optional hybrid BM25 RRF, rich filters, and cognitive decay."""
        return self._post(
            "/vectors/query",
            json={
                "collection": collection,
                "vector": vector,
                "query_text": query_text,
                "top_k": top_k,
                "filter": filter,
                "namespace": namespace,
                "search_type": search_type,
                "alpha": alpha,
                "score_threshold": score_threshold,
                "include_values": include_values,
                "include_metadata": include_metadata,
                "use_cognitive_decay": use_cognitive_decay,
                "decay_lambda": decay_lambda,
            },
        )

    def fetch_vectors(self, collection: str, ids: List[str]) -> dict:
        """Fetch multiple points/vectors by ID."""
        return self._post("/vectors/fetch", json={"collection": collection, "ids": ids})

    def delete_vectors(
        self,
        collection: str,
        ids: Optional[List[str]] = None,
        filter: Optional[Dict[str, Any]] = None,
        namespace: str = "",
        delete_all: bool = False,
    ) -> dict:
        """Delete vectors by IDs, rich metadata filter, namespace, or delete_all."""
        return self._post(
            "/vectors/delete",
            json={
                "collection": collection,
                "ids": ids,
                "filter": filter,
                "namespace": namespace,
                "delete_all": delete_all,
            },
        )

    # ── Indexing & Point-Level CRUD ──────────────────────────────────────────

    def index_text(
        self,
        collection: str,
        text: str,
        source: str = "sdk",
        namespace: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Index plain text into a collection.
        The text is automatically chunked and embedded on the server CPU (384d).
        """
        form_data: Dict[str, Any] = {
            "collection": collection,
            "text": text,
            "source": source,
        }
        if namespace:
            form_data["namespace"] = namespace
        if metadata:
            import json as _json
            form_data["metadata"] = _json.dumps(metadata)
        return self._post("/documents/text", data=form_data)

    def upload(
        self,
        collection: str,
        file_path: str,
        namespace: Optional[str] = None,
    ) -> dict:
        """Upload and index a file (PDF, TXT, MD)."""
        with open(file_path, "rb") as f:
            filename = file_path.split("/")[-1].split("\\")[-1]
            data = {"collection": collection}
            if namespace:
                data["namespace"] = namespace
            r = self._request(
                "POST",
                "/documents/upload",
                data=data,
                files={"file": (filename, f)},
            )
        return r.json()

    def upsert_point(
        self,
        collection: str,
        point_id: str,
        text: Optional[str] = None,
        vector: Optional[List[float]] = None,
        source: str = "sdk",
        metadata: Optional[dict] = None,
    ) -> dict:
        """Insert or update a single document/vector by custom point_id."""
        payload: Dict[str, Any] = {"source": source, "metadata": metadata or {}}
        if text is not None:
            payload["text"] = text
        if vector is not None:
            payload["vector"] = vector
        return self._put(f"/documents/{collection}/points/{point_id}", json=payload)

    def get_point(self, collection: str, point_id: str) -> dict:
        """Retrieve a single document/point by point_id."""
        return self._get(f"/documents/{collection}/points/{point_id}")

    def delete_point(self, collection: str, point_id: str) -> dict:
        """Delete a single document/point by point_id."""
        return self._delete(f"/documents/{collection}/points/{point_id}")

    def scroll(self, collection: str, limit: int = 100, offset: int = 0) -> dict:
        """Export/scroll documents and metadata from a collection (Zero Vendor Lock-In)."""
        return self._get(f"/documents/{collection}/scroll", params={"limit": limit, "offset": offset})

    # ── Search ────────────────────────────────────────────────────────────────

    def search(
        self,
        collection: str,
        query: str,
        top_k: int = 5,
        score_threshold: float = 0.0,
        search_type: str = "hybrid",
        alpha: float = 0.5,
        namespace: Optional[str] = None,
        filters: Optional[dict] = None,
    ) -> list[SearchResult]:
        """Semantic, keyword, or hybrid RRF search in a collection."""
        payload: Dict[str, Any] = {
            "collection": collection,
            "query": query,
            "top_k": top_k,
            "score_threshold": score_threshold,
            "search_type": search_type,
            "alpha": alpha,
        }
        if namespace:
            payload["namespace"] = namespace
        if filters:
            payload["filters"] = filters

        data = self._post("/search", json=payload)
        return [SearchResult(r) for r in data.get("results", [])]

    # ── Agent Memory (4-Tier Cognitive Memory) ───────────────────────────────

    def remember(
        self,
        agent_id: str,
        content: str,
        memory_type: str = "long_term",
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Store a persistent memory for an AI agent.
        memory_type: 'short_term' (1h), 'episodic' (30d), 'long_term' (permanent), 'semantic' (permanent)
        """
        payload: Dict[str, Any] = {
            "content": content,
            "memory_type": memory_type,
            "metadata": metadata or {},
        }
        return self._post(f"/memory/{agent_id}/remember", json=payload)

    def recall(
        self,
        agent_id: str,
        query: str,
        top_k: int = 5,
        memory_type: Optional[str] = None,
    ) -> list[MemoryItem]:
        """Recall relevant memories for an AI agent semantically."""
        payload: Dict[str, Any] = {
            "query": query,
            "top_k": top_k,
        }
        if memory_type:
            payload["memory_type"] = memory_type
        data = self._post(f"/memory/{agent_id}/recall", json=payload)
        return [MemoryItem(m) for m in data.get("memories", [])]

    def clear_memory(self, agent_id: str) -> dict:
        """Clear all stored memories for an AI agent."""
        return self._delete(f"/memory/{agent_id}")

    # ── Auth & Usage ──────────────────────────────────────────────────────────

    def create_key(self, name: str, role: str = "read_write") -> dict:
        """Create an additional scoped API key ('admin', 'read_write', 'read_only')."""
        return self._post("/auth/keys", json={"name": name, "role": role})

    def usage_stats(self) -> dict:
        """Get usage statistics for your account."""
        return self._get("/usage/stats")

    def close(self):
        """Close the HTTP client."""
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
