"""
High-throughput transport client (`IcebergGRPC`) for Iceberg DB (v1.0.0).

Provides the `from iceberg.grpc import IcebergGRPC` client interface with persistent
keep-alive connection pooling and full `source_tag` partner attribution.
"""
from typing import Optional
from .client import Client


class IcebergGRPC(Client):
    """
    Persistent low-latency Iceberg client supporting `source_tag` attribution
    and environment-driven `ICEBERG_API_KEY` authentication.
    """

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
        super().__init__(
            api_key=api_key,
            base_url=base_url,
            timeout=timeout,
            max_retries=max_retries,
            backoff_factor=backoff_factor,
            integration=integration,
            source_tag=source_tag,
        )


__all__ = ["IcebergGRPC"]
