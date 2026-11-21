from .client import (
    Client,
    ServerlessSpec,
    SearchResult,
    MemoryItem,
    IcebergError,
    AuthenticationError,
    PermissionDeniedError,
    NotFoundError,
    ValidationError,
    RateLimitError,
)
from .integrations import (
    IcebergLangChainVectorStore,
    IcebergLlamaIndexVectorStore,
    IcebergHaystackDocumentStore,
)
from typing import Optional

Iceberg = Client

__version__ = "1.0.0"
__all__ = [
    "Client",
    "Iceberg",
    "ServerlessSpec",
    "SearchResult",
    "MemoryItem",
    "IcebergError",
    "AuthenticationError",
    "PermissionDeniedError",
    "NotFoundError",
    "ValidationError",
    "RateLimitError",
    "IcebergLangChainVectorStore",
    "IcebergLlamaIndexVectorStore",
    "IcebergHaystackDocumentStore",
    "connect",
]


def connect(
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    timeout: float = 30.0,
    max_retries: int = 3,
) -> Client:
    """
    Connect to Iceberg Vector Database (v1.0.0).

    Example:
        import iceberg
        db = iceberg.connect(api_key="ib_your_key")
    """
    return Client(api_key=api_key, base_url=base_url, timeout=timeout, max_retries=max_retries)
