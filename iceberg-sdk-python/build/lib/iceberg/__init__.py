from .client import Client, SearchResult, IcebergError
from typing import Optional

__version__ = "0.1.0"
__all__ = ["Client", "SearchResult", "IcebergError", "connect"]


def connect(
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    timeout: float = 30.0,
) -> Client:
    """
    Connect to Iceberg Vector Database.
    
    Example:
        import iceberg
        db = iceberg.connect(api_key="your_key")
    """
    return Client(api_key=api_key, base_url=base_url, timeout=timeout)
