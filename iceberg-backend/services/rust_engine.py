"""
Native Rust Engine Bridge (`iceberg-core-rs` v1.0.0)
====================================================
Manages lifecycle and persistent HTTP/1.1 Keep-Alive communication between
FastAPI (`iceberg-backend`) and the compiled native Rust engine (`iceberg-core-rs`).
"""

import atexit
import os
import socket
import subprocess
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import quote
import httpx


def _enc(name: str) -> str:
    return quote(str(name).strip(), safe="")


DEFAULT_BIN = (
    Path(__file__).resolve().parent.parent.parent
    / "iceberg-core-rs"
    / "target"
    / "release"
    / ("iceberg-core-rs.exe" if os.name == "nt" else "iceberg-core-rs")
)


def _find_free_port(preferred: int = 6334) -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if preferred > 0:
            try:
                s.bind(("127.0.0.1", preferred))
                return s.getsockname()[1]
            except OSError:
                pass
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class RustEngineManager:
    def __init__(self):
        self._lock = threading.RLock()
        self._proc: Optional[subprocess.Popen] = None
        self._client: Optional[httpx.Client] = None
        self._base_url: Optional[str] = None
        self._active_data_dir: Optional[Path] = None
        atexit.register(self.shutdown)

    def binary_path(self) -> Path:
        custom = os.environ.get("ICEBERG_RUST_BIN", "").strip()
        if custom:
            return Path(custom)
        return DEFAULT_BIN

    def is_binary_available(self) -> bool:
        if os.environ.get("ICEBERG_RUST_URL", "").strip():
            return True
        return self.binary_path().exists()

    def _desired_data_dir(self) -> Path:
        import services.read_nodes as rn_mod
        base = Path(rn_mod.DATA_DIR)
        return base.parent / "rust_core"

    def ensure_started(self) -> httpx.Client:
        with self._lock:
            ext_url = os.environ.get("ICEBERG_RUST_URL", "").strip()
            if ext_url:
                if self._client is None or self._base_url != ext_url:
                    if self._client:
                        self._client.close()
                    self._base_url = ext_url.rstrip("/")
                    self._client = httpx.Client(base_url=self._base_url, timeout=30.0)
                return self._client

            desired_dir = self._desired_data_dir()
            if (
                self._proc is not None
                and self._proc.poll() is None
                and self._client is not None
                and self._active_data_dir == desired_dir
            ):
                return self._client

            # Restart if data_dir changed (e.g. isolated test suite) or process exited
            self._stop_locked()

            bin_path = self.binary_path()
            if not bin_path.exists():
                raise RuntimeError(f"Rust engine binary not found at {bin_path}")

            desired_dir.mkdir(parents=True, exist_ok=True)
            is_temp_test = "iceberg_audit_" in str(desired_dir) or "temp" in str(desired_dir).lower()
            port = _find_free_port(0 if is_temp_test else 6334)
            base_url = f"http://127.0.0.1:{port}"

            self._proc = subprocess.Popen(
                [
                    str(bin_path),
                    "--host",
                    "127.0.0.1",
                    "--port",
                    str(port),
                    "--data-dir",
                    str(desired_dir),
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

            client = httpx.Client(base_url=base_url, timeout=30.0)
            deadline = time.time() + 12.0
            started = False
            while time.time() < deadline:
                if self._proc.poll() is not None:
                    break
                try:
                    r = client.get("/health", timeout=1.0)
                    if r.status_code == 200:
                        started = True
                        break
                except Exception:
                    time.sleep(0.08)

            if not started:
                client.close()
                if self._proc and self._proc.poll() is None:
                    self._proc.kill()
                self._proc = None
                raise RuntimeError("Failed to start iceberg-core-rs daemon")

            self._base_url = base_url
            self._client = client
            self._active_data_dir = desired_dir
            print(f"[rust-engine] iceberg-core-rs v1.0.0 online at {base_url} -> {desired_dir}")
            return self._client

    def _stop_locked(self):
        if self._client is not None:
            try:
                self._client.post("/flush-all", timeout=2.0)
            except Exception:
                pass
            try:
                self._client.close()
            except Exception:
                pass
            self._client = None

        if self._proc is not None:
            if self._proc.poll() is None:
                try:
                    self._proc.terminate()
                    self._proc.wait(timeout=3.0)
                except Exception:
                    try:
                        self._proc.kill()
                        self._proc.wait(timeout=2.0)
                    except Exception:
                        pass
            self._proc = None
        self._base_url = None
        self._active_data_dir = None

    def shutdown(self):
        with self._lock:
            self._stop_locked()

    # ── High-Level Engine Calls ────────────────────────────────────────────────

    def health(self) -> Dict[str, Any]:
        r = self.ensure_started().get("/health")
        r.raise_for_status()
        return r.json()

    def metrics_text(self) -> str:
        r = self.ensure_started().get("/metrics")
        r.raise_for_status()
        return r.text

    def create_collection(
        self,
        name: str,
        dimension: int = 384,
        metric: str = "cosine",
        quantization: str = "float32",
    ) -> bool:
        r = self.ensure_started().post(
            "/collections",
            json={
                "name": name,
                "dimension": int(dimension),
                "metric": metric,
                "quantization": quantization,
            },
        )
        if r.status_code == 400:
            raise ValueError(r.json().get("detail", "Invalid collection parameters"))
        r.raise_for_status()
        return bool(r.json().get("created", False))

    def list_collections(self) -> List[Dict[str, Any]]:
        r = self.ensure_started().get("/collections")
        r.raise_for_status()
        return r.json().get("collections", [])

    def get_collection(self, name: str) -> Dict[str, Any]:
        r = self.ensure_started().get(f"/collections/{_enc(name)}")
        if r.status_code == 404:
            raise KeyError(f"Collection '{name}' not found")
        r.raise_for_status()
        return r.json()

    def delete_collection(self, name: str) -> bool:
        r = self.ensure_started().delete(f"/collections/{_enc(name)}")
        r.raise_for_status()
        return bool(r.json().get("deleted", False))

    def clear_collection(self, name: str) -> bool:
        r = self.ensure_started().post(f"/collections/{_enc(name)}/clear")
        if r.status_code == 404:
            return False
        r.raise_for_status()
        return True

    def rename_collection(self, old_name: str, new_name: str) -> Dict[str, Any]:
        r = self.ensure_started().post(
            f"/collections/{_enc(old_name)}/rename",
            json={"new_name": new_name},
        )
        if r.status_code in (400, 404, 409):
            raise ValueError(r.json().get("detail", "Rename failed"))
        r.raise_for_status()
        return r.json()

    def upsert_points(
        self,
        collection: str,
        points: List[Dict[str, Any]],
        auto_create_dim: Optional[int] = None,
        metric: Optional[str] = None,
        quantization: Optional[str] = None,
    ) -> Dict[str, Any]:
        body: Dict[str, Any] = {"points": points}
        if auto_create_dim is not None:
            body["auto_create_dim"] = int(auto_create_dim)
        if metric:
            body["metric"] = metric
        if quantization:
            body["quantization"] = quantization
        r = self.ensure_started().post(f"/collections/{_enc(collection)}/points/upsert", json=body)
        if r.status_code in (400, 404):
            raise ValueError(r.json().get("detail", "Upsert validation error"))
        r.raise_for_status()
        return r.json()

    def get_points(self, collection: str, ids: List[str], with_vectors: bool = True) -> List[Dict[str, Any]]:
        r = self.ensure_started().post(
            f"/collections/{_enc(collection)}/points/get",
            json={"ids": ids, "with_vectors": with_vectors},
        )
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json().get("points", [])

    def delete_points(
        self,
        collection: str,
        ids: Optional[List[str]] = None,
        filter_obj: Optional[Dict[str, Any]] = None,
        namespace: Optional[str] = None,
        delete_all: bool = False,
    ) -> int:
        r = self.ensure_started().post(
            f"/collections/{_enc(collection)}/points/delete",
            json={
                "ids": ids,
                "filter": filter_obj,
                "namespace": namespace,
                "delete_all": delete_all,
            },
        )
        if r.status_code == 404:
            return 0
        if r.status_code == 400:
            raise ValueError(r.json().get("detail", "Delete error"))
        r.raise_for_status()
        return int(r.json().get("deleted_count", 0))

    def scroll_points(
        self,
        collection: str,
        limit: int = 100,
        offset: int = 0,
        with_vectors: bool = False,
        filter_obj: Optional[Dict[str, Any]] = None,
        namespace: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        r = self.ensure_started().post(
            f"/collections/{_enc(collection)}/points/scroll",
            json={
                "limit": limit,
                "offset": offset,
                "with_vectors": with_vectors,
                "filter": filter_obj,
                "namespace": namespace,
            },
        )
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json().get("points", [])

    def search(
        self,
        collection: str,
        vector: Optional[List[float]] = None,
        query_text: Optional[str] = None,
        top_k: int = 5,
        search_type: str = "hybrid",
        alpha: float = 0.5,
        score_threshold: float = 0.0,
        filter_obj: Optional[Dict[str, Any]] = None,
        namespace: Optional[str] = None,
        use_cognitive_decay: bool = False,
        decay_lambda: float = 0.015,
        reinforce_access: bool = False,
        with_vectors: bool = False,
    ) -> Dict[str, Any]:
        r = self.ensure_started().post(
            f"/collections/{_enc(collection)}/points/search",
            json={
                "vector": vector,
                "query_text": query_text,
                "top_k": top_k,
                "search_type": search_type,
                "alpha": alpha,
                "score_threshold": score_threshold if score_threshold > 0 else None,
                "filter": filter_obj,
                "namespace": namespace,
                "use_cognitive_decay": use_cognitive_decay,
                "decay_lambda": decay_lambda,
                "reinforce_access": reinforce_access,
                "with_vectors": with_vectors,
            },
        )
        if r.status_code == 404:
            return {"results": [], "count": 0, "latency_ms": 0.0}
        if r.status_code == 400:
            raise ValueError(r.json().get("detail", "Search validation error"))
        r.raise_for_status()
        return r.json()


rust_engine = RustEngineManager()
