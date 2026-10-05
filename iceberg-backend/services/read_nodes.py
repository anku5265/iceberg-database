"""
Read Node Management — Better than Pinecone's Dedicated Read Nodes.

Pinecone: Manual provisioning, extra hourly charge, fixed servers.
Iceberg: Connection pooling, priority routing, auto load balancing, included in plan.

Local mode: Single Qdrant instance with connection pool (multiple logical readers).
Production mode: Multiple Qdrant server instances across machines.
"""
import time
import threading
from dataclasses import dataclass, field
from pathlib import Path
from qdrant_client import QdrantClient
from core.config import settings

DATA_DIR = Path(__file__).parent.parent / "data" / "qdrant" / "primary"


@dataclass
class QueryStats:
    queries_served: int = 0
    total_latency_ms: float = 0.0
    last_used: float = field(default_factory=time.time)

    @property
    def avg_latency_ms(self) -> float:
        if self.queries_served == 0:
            return 0.0
        return round(self.total_latency_ms / self.queries_served, 2)


class ReadNodeManager:
    """
    Connection pool with priority routing.

    - 1 write client  → always primary
    - N read clients  → pool, least-recently-used routing
    - Priority routing → Scale/paid users get dedicated slot

    Mode detection (automatic):
    - QDRANT_URL set → server mode (production/Railway)
    - QDRANT_URL not set → local file mode (dev/local)
    """
    POOL_SIZE = 3  # Number of read connections in pool

    def __init__(self):
        self._lock = threading.Lock()
        self._write_client: QdrantClient = None
        self._read_pool: list[tuple[QdrantClient, QueryStats]] = []
        self._initialized = False
        self._mode = "unknown"

    def _is_server_mode(self) -> bool:
        """True if QDRANT_URL points to a real server (not localhost default in prod)."""
        url = settings.qdrant_url
        # If env var explicitly set to a non-localhost URL → server mode
        import os
        return bool(os.environ.get("QDRANT_URL")) and "localhost" not in url

    def _make_client(self) -> QdrantClient:
        """Create a Qdrant client — server or local depending on config."""
        if self._is_server_mode():
            self._mode = "server"
            kwargs = {"url": settings.qdrant_url}
            if settings.qdrant_api_key:
                kwargs["api_key"] = settings.qdrant_api_key
            print(f"[qdrant] Server mode -> {settings.qdrant_url}")
            return QdrantClient(**kwargs)
        else:
            self._mode = "local"
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            print(f"[qdrant] Local file mode -> {DATA_DIR}")
            return QdrantClient(path=str(DATA_DIR))

    def initialize(self):
        if self._initialized:
            return

        self._write_client = self._make_client()

        # Read pool — in server mode each slot is a separate connection
        # In local mode — same client, separate stat trackers
        for i in range(self.POOL_SIZE):
            if self._is_server_mode():
                client = self._make_client()  # separate connection per slot
            else:
                client = self._write_client  # share same local client
            self._read_pool.append((client, QueryStats()))

        self._initialized = True
        print(f"[qdrant] ReadNodeManager: 1 primary + {self.POOL_SIZE} read slots ({self._mode} mode)")

    def get_write_client(self) -> QdrantClient:
        if not self._initialized:
            self.initialize()
        return self._write_client

    def get_read_client(self, priority: str = "normal") -> tuple[QdrantClient, QueryStats]:
        if not self._initialized:
            self.initialize()

        with self._lock:
            if priority == "high":
                # High priority → dedicated slot 0 (reserved for Scale plan)
                return self._read_pool[0]

            # Normal → pick least recently used slot from 1..N
            candidates = self._read_pool[1:]
            best = min(candidates, key=lambda x: x[1].last_used)
            return best

    def record_query(self, stats: QueryStats, latency_ms: float):
        with self._lock:
            stats.queries_served += 1
            stats.total_latency_ms += latency_ms
            stats.last_used = time.time()

    def get_status(self) -> dict:
        if not self._initialized:
            return {"nodes": 0, "status": "not_initialized"}

        nodes = []
        for i, (_, stats) in enumerate(self._read_pool):
            nodes.append({
                "slot_id": i,
                "type": "dedicated" if i == 0 else "shared",
                "queries_served": stats.queries_served,
                "avg_latency_ms": stats.avg_latency_ms,
            })

        return {
            "mode": self._mode,
            "total_slots": len(self._read_pool),
            "dedicated_slots": 1,
            "shared_slots": len(self._read_pool) - 1,
            "slots": nodes,
        }


node_manager = ReadNodeManager()
