"""
Zero-Lag Cloud Persistence Shield (`v1.0.0`) — R2 + Zero-Config Cloud Vault
===========================================================================
Automatically backs up and restores BOTH:
  1. SQLite Account Vault (`iceberg.db` — users, logins, API keys, projects, assistants, payments, waitlist)
  2. Native Rust Engine Vault (`rust_core/<col>/manifest.json` + `snapshot.ibsnap`)

Dual Cloud Storage Backends (100% Automatic):
  - Backend A (Cloudflare R2): Used automatically whenever `R2_ACCOUNT_ID` / `R2_ACCESS_KEY` are set.
  - Backend B (Zero-Config Cloud Vault `_sys_iceberg_vault_v1`): Used automatically on cloud containers
    when R2 keys are not set yet, storing zlib-compressed + SHA-256-verified `.ibsnap` & `iceberg.db`
    blobs inside the already-connected remote storage cluster — requiring ZERO manual dashboard clicks!
"""

import base64
import hashlib
import os
import sqlite3
import tempfile
import threading
import time
import uuid
import zlib
from pathlib import Path
from typing import List, Optional, Set
import httpx

from core.config import settings
from services import storage

R2_SQLITE_KEY = "engine_state/v1/sqlite/iceberg.db"
R2_RUST_PREFIX = "engine_state/v1/rust_core"
SYS_VAULT_COLLECTION = "_sys_iceberg_vault_v1"
CHUNK_BYTES = 180 * 1024  # 180 KB compressed chunks


class RemoteBlobVault:
    """
    Stores arbitrary binary snapshots (`.ibsnap`, `manifest.json`, `iceberg.db`) with zlib
    compression + SHA-256 verification inside `_sys_iceberg_vault_v1` over HTTPS.
    """

    def __init__(self):
        self._ensured = False
        self._lock = threading.Lock()
        self._http: Optional[httpx.Client] = None

    def _client(self) -> httpx.Client:
        if self._http is None:
            self._http = httpx.Client(headers=self._headers(), timeout=30.0)
        return self._http

    def is_available(self) -> bool:
        if os.environ.get("ICEBERG_DISABLE_CLOUD_VAULT", "").strip() == "1":
            return False
        url = (settings.qdrant_url or "").strip()
        key = (settings.qdrant_api_key or "").strip()
        return bool(url and key and url.startswith("https://") and "localhost" not in url)

    def _headers(self) -> dict:
        return {"api-key": settings.qdrant_api_key.strip(), "Content-Type": "application/json"}

    def _base(self) -> str:
        return settings.qdrant_url.strip().rstrip("/")

    def _manifest_id(self, key: str) -> str:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"iceberg.vault.manifest.{key}"))

    def _chunk_id(self, key: str, idx: int) -> str:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"iceberg.vault.chunk.{key}.{idx}"))

    def _ensure_vault_collection(self, client: httpx.Client):
        if self._ensured:
            return
        with self._lock:
            if self._ensured:
                return
            r = client.get(f"{self._base()}/collections/{SYS_VAULT_COLLECTION}")
            if r.status_code != 200:
                cr = client.put(
                    f"{self._base()}/collections/{SYS_VAULT_COLLECTION}",
                    json={"vectors": {"size": 4, "distance": "Cosine"}},
                )
                cr.raise_for_status()
            self._ensured = True

    def upload_bytes(self, data: bytes, key: str) -> Optional[str]:
        if not self.is_available():
            return None
        sha_hex = hashlib.sha256(data).hexdigest()
        comp = zlib.compress(data, level=6)
        chunks = [comp[i : i + CHUNK_BYTES] for i in range(0, len(comp), CHUNK_BYTES)] or [b""]

        points = []
        for idx, ch in enumerate(chunks):
            points.append({
                "id": self._chunk_id(key, idx),
                "vector": [1.0, 0.0, 0.0, 0.0],
                "payload": {
                    "_vault_type": "chunk",
                    "key": key,
                    "chunk_idx": idx,
                    "b64": base64.b64encode(ch).decode("ascii"),
                },
            })

        points.append({
            "id": self._manifest_id(key),
            "vector": [0.0, 1.0, 0.0, 0.0],
            "payload": {
                "_vault_type": "manifest",
                "key": key,
                "total_chunks": len(chunks),
                "raw_size": len(data),
                "comp_size": len(comp),
                "sha256": sha_hex,
                "updated_at": int(time.time()),
            },
        })

        client = self._client()
        self._ensure_vault_collection(client)
        for b_start in range(0, len(points), 32):
            batch = points[b_start : b_start + 32]
            r = client.put(
                f"{self._base()}/collections/{SYS_VAULT_COLLECTION}/points?wait=true",
                json={"points": batch},
            )
            r.raise_for_status()
        return f"vault://{SYS_VAULT_COLLECTION}/{key}"

    def download_bytes(self, key: str) -> Optional[bytes]:
        if not self.is_available():
            return None
        client = self._client()
        r_man = client.post(
            f"{self._base()}/collections/{SYS_VAULT_COLLECTION}/points",
            json={"ids": [self._manifest_id(key)], "with_payload": True, "with_vector": False},
        )
        if r_man.status_code != 200:
            return None
        pts = r_man.json().get("result", [])
        if not pts:
            return None
        man = pts[0].get("payload") or {}
        total_chunks = int(man.get("total_chunks", 0))
        expected_sha = man.get("sha256", "")
        if total_chunks <= 0:
            return None

        chunk_ids = [self._chunk_id(key, i) for i in range(total_chunks)]
        chunk_map = {}
        for b_start in range(0, len(chunk_ids), 64):
            batch_ids = chunk_ids[b_start : b_start + 64]
            r_ch = client.post(
                f"{self._base()}/collections/{SYS_VAULT_COLLECTION}/points",
                json={"ids": batch_ids, "with_payload": True, "with_vector": False},
            )
            r_ch.raise_for_status()
            for item in r_ch.json().get("result", []):
                pay = item.get("payload") or {}
                chunk_map[int(pay.get("chunk_idx", -1))] = base64.b64decode(pay.get("b64", ""))

        if len(chunk_map) != total_chunks:
            return None

        comp_bytes = b"".join(chunk_map[i] for i in range(total_chunks))
        raw = zlib.decompress(comp_bytes)
        if expected_sha and hashlib.sha256(raw).hexdigest() != expected_sha:
            raise RuntimeError(f"Vault SHA-256 mismatch for {key}")
        return raw

    def list_files(self, prefix: str = "") -> List[str]:
        if not self.is_available():
            return []
        client = self._client()
        r = client.get(f"{self._base()}/collections/{SYS_VAULT_COLLECTION}")
        if r.status_code != 200:
            return []
        found = []
        offset = None
        while True:
            body = {"limit": 250, "with_payload": True, "with_vector": False}
            if offset is not None:
                body["offset"] = offset
            sr = client.post(
                f"{self._base()}/collections/{SYS_VAULT_COLLECTION}/points/scroll",
                json=body,
            )
            if sr.status_code != 200:
                break
            res = sr.json().get("result", {})
            pts = res.get("points", [])
            for p in pts:
                pay = p.get("payload") or {}
                if pay.get("_vault_type") == "manifest":
                    k = str(pay.get("key", ""))
                    if k.startswith(prefix):
                        found.append(k)
            offset = res.get("next_page_offset")
            if offset is None or not pts:
                break
        return sorted(found)

    def delete_file(self, key: str) -> bool:
        if not self.is_available():
            return False
        client = self._client()
        r_man = client.post(
            f"{self._base()}/collections/{SYS_VAULT_COLLECTION}/points",
            json={"ids": [self._manifest_id(key)], "with_payload": True, "with_vector": False},
        )
        if r_man.status_code != 200:
            return False
        pts = r_man.json().get("result", [])
        ids_to_del = [self._manifest_id(key)]
        if pts:
            n = int((pts[0].get("payload") or {}).get("total_chunks", 0))
            ids_to_del.extend(self._chunk_id(key, i) for i in range(n))
        client.post(
            f"{self._base()}/collections/{SYS_VAULT_COLLECTION}/points/delete?wait=true",
            json={"points": ids_to_del},
        )
        return True


remote_vault = RemoteBlobVault()


class R2PersistenceManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._dirty_sqlite: bool = False
        self._dirty_collections: Set[str] = set()
        self._deleted_collections: Set[str] = set()
        self._wakeup = threading.Event()
        self._stop = False
        self._worker: threading.Thread | None = None

    def is_any_cloud_configured(self) -> bool:
        # In isolated temp unit tests (`iceberg_audit_`), do not pull live production state unless R2 is mocked!
        import services.read_nodes as rn_mod
        d_str = str(rn_mod.DATA_DIR)
        if "iceberg_audit_" in d_str or "iceberg_prod_ready_" in d_str:
            return storage.is_configured()
        return storage.is_configured() or remote_vault.is_available()

    def put_blob(self, data: bytes, key: str) -> Optional[str]:
        if storage.is_configured():
            return storage.upload_bytes(data, key, "application/octet-stream")
        if remote_vault.is_available():
            return remote_vault.upload_bytes(data, key)
        return None

    def get_blob(self, key: str) -> Optional[bytes]:
        if storage.is_configured():
            return storage.download_bytes(key)
        if remote_vault.is_available():
            return remote_vault.download_bytes(key)
        return None

    def list_blobs(self, prefix: str = "") -> List[str]:
        if storage.is_configured():
            return storage.list_files(prefix)
        if remote_vault.is_available():
            return remote_vault.list_files(prefix)
        return []

    def remove_blob(self, key: str) -> bool:
        if storage.is_configured():
            return storage.delete_file(key)
        if remote_vault.is_available():
            return remote_vault.delete_file(key)
        return False

    def start_background_worker(self):
        if not self.is_any_cloud_configured():
            return
        with self._lock:
            if self._worker is not None and self._worker.is_alive():
                return
            self._stop = False
            self._worker = threading.Thread(
                target=self._run_loop,
                name="iceberg-cloud-sync",
                daemon=True,
            )
            self._worker.start()
            mode = "cloudflare-r2" if storage.is_configured() else "cloud-vault"
            print(f"[cloud-shield] Background zero-loss sync worker active ({mode})")

    def stop_and_flush(self):
        if not self.is_any_cloud_configured():
            return
        self._stop = True
        self._wakeup.set()
        if self._worker and self._worker.is_alive():
            self._worker.join(timeout=5.0)
        self._flush_pending_once()

    def mark_sqlite_dirty(self):
        if not self.is_any_cloud_configured():
            return
        with self._lock:
            self._dirty_sqlite = True
        self._wakeup.set()

    def mark_collection_dirty(self, scoped_name: str):
        if not self.is_any_cloud_configured() or not scoped_name:
            return
        with self._lock:
            self._dirty_collections.add(scoped_name)
            self._deleted_collections.discard(scoped_name)
        self._wakeup.set()

    def mark_collection_deleted(self, scoped_name: str):
        if not self.is_any_cloud_configured() or not scoped_name:
            return
        with self._lock:
            self._dirty_collections.discard(scoped_name)
            self._deleted_collections.add(scoped_name)
        self._wakeup.set()

    def _safe_dirname(self, name: str) -> str:
        out = []
        for ch in name:
            if ch.isascii() and (ch.isalnum() or ch in "_-"):
                out.append(ch)
            else:
                out.append(f"_x{ord(ch):02x}_")
        return "".join(out) or "_empty_col"

    def restore_on_startup(self, db_path: Path, rust_core_dir: Path):
        if not self.is_any_cloud_configured():
            return

        t0 = time.perf_counter()
        if not db_path.exists() or db_path.stat().st_size == 0:
            raw_db = self.get_blob(R2_SQLITE_KEY)
            if raw_db:
                db_path.parent.mkdir(parents=True, exist_ok=True)
                db_path.write_bytes(raw_db)
                print(f"[cloud-shield] Restored SQLite account vault ({len(raw_db)} bytes)")

        keys = self.list_blobs(f"{R2_RUST_PREFIX}/")
        restored_files = 0
        for key in keys:
            rel = key[len(R2_RUST_PREFIX) + 1 :]
            if not rel or "/" not in rel:
                continue
            target_file = rust_core_dir / rel
            if not target_file.exists():
                blob = self.get_blob(key)
                if blob is not None:
                    target_file.parent.mkdir(parents=True, exist_ok=True)
                    target_file.write_bytes(blob)
                    restored_files += 1

        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        if restored_files > 0:
            print(f"[cloud-shield] Restored {restored_files} Rust Engine snapshot files in {elapsed_ms:.0f}ms")

    def _run_loop(self):
        while not self._stop:
            self._wakeup.wait(timeout=5.0)
            self._wakeup.clear()
            if not self._stop:
                time.sleep(0.4)
            self._flush_pending_once()

    def _flush_pending_once(self):
        with self._lock:
            do_sqlite = self._dirty_sqlite
            self._dirty_sqlite = False
            dirty_cols = list(self._dirty_collections)
            self._dirty_collections.clear()
            del_cols = list(self._deleted_collections)
            self._deleted_collections.clear()

        if do_sqlite:
            self._upload_sqlite_safely()

        for cname in del_cols:
            dname = self._safe_dirname(cname)
            self.remove_blob(f"{R2_RUST_PREFIX}/{dname}/manifest.json")
            self.remove_blob(f"{R2_RUST_PREFIX}/{dname}/snapshot.ibsnap")

        for cname in dirty_cols:
            self._upload_collection_safely(cname)

    def _upload_sqlite_safely(self):
        try:
            import core.database as db_mod
            src_path = Path(db_mod.DB_PATH)
            if not src_path.exists():
                return
            fd, tmp_name = tempfile.mkstemp(suffix=".db")
            os.close(fd)
            try:
                src_conn = sqlite3.connect(str(src_path))
                dst_conn = sqlite3.connect(tmp_name)
                src_conn.backup(dst_conn)
                dst_conn.close()
                src_conn.close()
                data = Path(tmp_name).read_bytes()
                self.put_blob(data, R2_SQLITE_KEY)
            finally:
                try:
                    os.remove(tmp_name)
                except OSError:
                    pass
        except Exception as e:
            print(f"[cloud-shield] SQLite sync warning: {e}")

    def _upload_collection_safely(self, scoped_name: str):
        try:
            from services.rust_engine import rust_engine, _enc
            import services.read_nodes as rn_mod

            client = rust_engine.ensure_started()
            client.post(f"/collections/{_enc(scoped_name)}/flush")

            rust_dir = Path(rn_mod.DATA_DIR).parent / "rust_core"
            dname = self._safe_dirname(scoped_name)
            col_dir = rust_dir / dname
            for fname in ("manifest.json", "snapshot.ibsnap"):
                fpath = col_dir / fname
                if fpath.exists():
                    self.put_blob(fpath.read_bytes(), f"{R2_RUST_PREFIX}/{dname}/{fname}")
        except Exception as e:
            print(f"[cloud-shield] Collection '{scoped_name}' sync warning: {e}")


r2_shield = R2PersistenceManager()
