"""
Qora Python SDK
"""
import httpx
from typing import Optional


class QoraError(Exception):
    pass


class SearchResult:
    def __init__(self, data: dict):
        self.text: str = data.get("text", "")
        self.score: float = data.get("score", 0.0)
        self.metadata: dict = data.get("metadata", {})

    def __repr__(self):
        return f"SearchResult(score={self.score:.3f}, text={self.text[:60]!r})"


class Client:
    """
    Qora API Client

    Usage:
        from qora import Client

        client = Client(api_key="your_api_key")

        # Create a collection
        client.create_collection("my_docs")

        # Index text
        client.index_text("my_docs", "Your document text here")

        # Upload a PDF
        client.upload("my_docs", "document.pdf")

        # Search
        results = client.search("my_docs", "your query")
        for r in results:
            print(r.score, r.text)
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.qora.in",
        timeout: float = 30.0,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            headers={"X-API-Key": api_key},
            timeout=timeout,
        )

    def _get(self, path: str, **kwargs):
        r = self._client.get(f"{self.base_url}{path}", **kwargs)
        self._raise(r)
        return r.json()

    def _post(self, path: str, **kwargs):
        r = self._client.post(f"{self.base_url}{path}", **kwargs)
        self._raise(r)
        return r.json()

    def _delete(self, path: str):
        r = self._client.delete(f"{self.base_url}{path}")
        self._raise(r)
        return r.json()

    def _raise(self, r: httpx.Response):
        if r.status_code >= 400:
            try:
                detail = r.json().get("detail", r.text)
            except Exception:
                detail = r.text
            raise QoraError(f"HTTP {r.status_code}: {detail}")

    # ── Collections ──────────────────────────────────────────────────────────

    def create_collection(self, name: str, description: str = "") -> dict:
        """Create a new vector collection."""
        return self._post("/collections", json={"name": name, "description": description})

    def list_collections(self) -> list[str]:
        """List all collection names."""
        return self._get("/collections").get("collections", [])

    def delete_collection(self, name: str) -> dict:
        """Delete a collection and all its vectors."""
        return self._delete(f"/collections/{name}")

    def collection_info(self, name: str) -> dict:
        """Get info about a collection (vector count, status)."""
        return self._get(f"/collections/{name}")

    # ── Indexing ──────────────────────────────────────────────────────────────

    def index_text(self, collection: str, text: str, source: str = "sdk") -> dict:
        """
        Index plain text into a collection.
        The text is automatically chunked and embedded.

        Args:
            collection: Collection name
            text: Text to index (Hindi/English/any language supported)
            source: Label for this content (for filtering later)
        """
        return self._post("/documents/text", data={
            "collection": collection,
            "text": text,
            "source": source,
        })

    def upload(self, collection: str, file_path: str) -> dict:
        """
        Upload and index a file (PDF, TXT, MD).

        Args:
            collection: Collection name
            file_path: Path to file on disk
        """
        with open(file_path, "rb") as f:
            filename = file_path.split("/")[-1].split("\\")[-1]
            r = self._client.post(
                f"{self.base_url}/documents/upload",
                data={"collection": collection},
                files={"file": (filename, f)},
            )
        self._raise(r)
        return r.json()

    # ── Search ────────────────────────────────────────────────────────────────

    def search(
        self,
        collection: str,
        query: str,
        top_k: int = 5,
        score_threshold: float = 0.3,
        filters: Optional[dict] = None,
    ) -> list[SearchResult]:
        """
        Semantic search in a collection.

        Args:
            collection: Collection name
            query: Search query (Hindi/English/Hinglish all work)
            top_k: Number of results to return
            score_threshold: Minimum similarity score (0-1)
            filters: Optional metadata filters e.g. {"source": "manual"}

        Returns:
            List of SearchResult objects with .text, .score, .metadata
        """
        payload = {
            "collection": collection,
            "query": query,
            "top_k": top_k,
            "score_threshold": score_threshold,
        }
        if filters:
            payload["filters"] = filters

        data = self._post("/search", json=payload)
        return [SearchResult(r) for r in data.get("results", [])]

    # ── Usage ─────────────────────────────────────────────────────────────────

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
