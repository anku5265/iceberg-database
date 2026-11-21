use std::fs::{self, File, OpenOptions};
use std::io::{BufReader, BufWriter, Read, Seek, Write};
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use crate::distance::DistanceMetric;
use crate::hnsw::HnswIndex;
use crate::quantization::{QuantizationMode, VectorQuantizer};

const WAL_MAGIC: [u8; 4] = *b"IBWL";
const WAL_VERSION: u8 = 1;
const SNAP_MAGIC: [u8; 4] = *b"IBSN";
const SNAP_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectionManifest {
    pub name: String,
    pub dim: usize,
    pub metric: DistanceMetric,
    pub quantization: QuantizationMode,
    pub m: usize,
    pub ef_construction: usize,
    pub ef_search: usize,
    pub created_at: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalPoint {
    pub id: String,
    pub vector: Vec<f32>,
    pub payload_json: String,
    pub timestamp: f64,
    pub importance: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WalRecord {
    UpsertBatch(Vec<WalPoint>),
    DeleteIds(Vec<String>),
    ClearAll,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectionSnapshot {
    pub manifest: CollectionManifest,
    pub slot_to_id: Vec<String>,
    pub flat_vectors: Vec<f32>,
    pub raw_vectors: Vec<f32>,
    pub payload_jsons: Vec<String>,
    pub timestamps: Vec<f64>,
    pub importances: Vec<f32>,
    pub access_counts: Vec<u32>,
    pub deleted: Vec<bool>,
    pub quantizer: VectorQuantizer,
    pub hnsw: HnswIndex,
}

pub fn safe_collection_dirname(name: &str) -> String {
    let mut out = String::with_capacity(name.len() + 8);
    for ch in name.chars() {
        if ch.is_ascii_alphanumeric() || ch == '_' || ch == '-' {
            out.push(ch);
        } else {
            out.push_str(&format!("_x{:02x}_", ch as u32));
        }
    }
    if out.is_empty() {
        "_empty_col".to_string()
    } else {
        out
    }
}

pub struct CollectionStorage {
    pub dir_path: PathBuf,
    wal_writer: Option<BufWriter<File>>,
    pub wal_ops_since_snap: usize,
}

impl CollectionStorage {
    pub fn open_or_create(base_dir: &Path, manifest: &CollectionManifest) -> Result<Self, String> {
        let dir_path = base_dir.join(safe_collection_dirname(&manifest.name));
        fs::create_dir_all(&dir_path)
            .map_err(|e| format!("Failed to create collection dir {:?}: {}", dir_path, e))?;

        let manifest_path = dir_path.join("manifest.json");
        if !manifest_path.exists() {
            let json_bytes = serde_json::to_vec_pretty(manifest)
                .map_err(|e| format!("Manifest serialize error: {}", e))?;
            fs::write(&manifest_path, json_bytes)
                .map_err(|e| format!("Manifest write error: {}", e))?;
        }

        let mut storage = Self {
            dir_path,
            wal_writer: None,
            wal_ops_since_snap: 0,
        };
        storage.ensure_wal_writer()?;
        Ok(storage)
    }

    pub fn open_existing_dir(dir_path: PathBuf) -> Result<(CollectionManifest, Self), String> {
        let manifest_path = dir_path.join("manifest.json");
        let bytes = fs::read(&manifest_path)
            .map_err(|e| format!("Failed reading {:?}: {}", manifest_path, e))?;
        let manifest: CollectionManifest = serde_json::from_slice(&bytes)
            .map_err(|e| format!("Invalid manifest {:?}: {}", manifest_path, e))?;

        let storage = Self {
            dir_path,
            wal_writer: None,
            wal_ops_since_snap: 0,
        };
        Ok((manifest, storage))
    }

    fn wal_path(&self) -> PathBuf {
        self.dir_path.join("wal.ibwal")
    }

    fn snap_path(&self) -> PathBuf {
        self.dir_path.join("snapshot.ibsnap")
    }

    fn ensure_wal_writer(&mut self) -> Result<(), String> {
        if self.wal_writer.is_none() {
            let f = OpenOptions::new()
                .create(true)
                .append(true)
                .open(self.wal_path())
                .map_err(|e| format!("Failed to open WAL {:?}: {}", self.wal_path(), e))?;
            self.wal_writer = Some(BufWriter::with_capacity(64 * 1024, f));
        }
        Ok(())
    }

    pub fn close_handles(&mut self) {
        if let Some(mut w) = self.wal_writer.take() {
            let _ = w.flush();
        }
    }

    pub fn append_wal(&mut self, record: &WalRecord, sync_disk: bool) -> Result<(), String> {
        self.ensure_wal_writer()?;
        let payload = bincode::serialize(record)
            .map_err(|e| format!("WAL serialize error: {}", e))?;
        let len = payload.len() as u32;
        let crc = crc32fast::hash(&payload);

        let w = self.wal_writer.as_mut().ok_or("WAL writer missing")?;
        w.write_all(&WAL_MAGIC)
            .map_err(|e| format!("WAL write magic failed: {}", e))?;
        w.write_all(&[WAL_VERSION])
            .map_err(|e| format!("WAL write version failed: {}", e))?;
        w.write_all(&len.to_le_bytes())
            .map_err(|e| format!("WAL write len failed: {}", e))?;
        w.write_all(&crc.to_le_bytes())
            .map_err(|e| format!("WAL write crc failed: {}", e))?;
        w.write_all(&payload)
            .map_err(|e| format!("WAL write payload failed: {}", e))?;
        w.flush().map_err(|e| format!("WAL flush failed: {}", e))?;

        if sync_disk {
            w.get_ref()
                .sync_data()
                .map_err(|e| format!("WAL fsync failed: {}", e))?;
        }
        self.wal_ops_since_snap += 1;
        Ok(())
    }

    /// Reads and verifies all WAL frames; if the tail frame was torn/corrupted by a crash,
    /// heals the WAL file by truncating back to `last_good_offset`.
    /// Returns `(valid_records, healed_corrupt_tail)`.
    pub fn read_and_heal_wal(&mut self) -> Result<(Vec<WalRecord>, bool), String> {
        self.close_handles();
        let path = self.wal_path();
        if !path.exists() {
            self.ensure_wal_writer()?;
            return Ok((Vec::new(), false));
        }

        let file_len = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
        if file_len == 0 {
            self.ensure_wal_writer()?;
            return Ok((Vec::new(), false));
        }

        let mut records = Vec::new();
        let mut last_good_offset: u64 = 0;
        let mut healed = false;

        {
            let f = File::open(&path).map_err(|e| format!("WAL read open error: {}", e))?;
            let mut reader = BufReader::new(f);

            loop {
                let mut header = [0u8; 13];
                match reader.read_exact(&mut header) {
                    Ok(()) => {}
                    Err(e) if e.kind() == std::io::ErrorKind::UnexpectedEof => {
                        let cur_pos = reader.stream_position().unwrap_or(last_good_offset);
                        if cur_pos > last_good_offset {
                            // Partial torn header at tail -> heal
                            healed = true;
                        }
                        break;
                    }
                    Err(e) => return Err(format!("WAL read error: {}", e)),
                }

                if header[0..4] != WAL_MAGIC || header[4] != WAL_VERSION {
                    healed = true;
                    break;
                }

                let len = u32::from_le_bytes([header[5], header[6], header[7], header[8]]) as usize;
                let expected_crc =
                    u32::from_le_bytes([header[9], header[10], header[11], header[12]]);

                // Sanity cap (512 MB max single WAL frame)
                if len > 512 * 1024 * 1024 {
                    healed = true;
                    break;
                }

                let mut payload = vec![0u8; len];
                if reader.read_exact(&mut payload).is_err() {
                    healed = true;
                    break;
                }

                let actual_crc = crc32fast::hash(&payload);
                if actual_crc != expected_crc {
                    healed = true;
                    break;
                }

                match bincode::deserialize::<WalRecord>(&payload) {
                    Ok(rec) => {
                        records.push(rec);
                        last_good_offset += 13 + (len as u64);
                    }
                    Err(_) => {
                        healed = true;
                        break;
                    }
                }
            }
        }

        if healed {
            if let Ok(wf) = OpenOptions::new().write(true).open(&path) {
                let _ = wf.set_len(last_good_offset);
                let _ = wf.sync_all();
            }
        }

        self.wal_ops_since_snap = records.len();
        self.ensure_wal_writer()?;
        Ok((records, healed))
    }

    pub fn write_snapshot_and_reset_wal(&mut self, snap: &CollectionSnapshot) -> Result<(), String> {
        self.close_handles();

        // Also update manifest.json in case collection was renamed
        let manifest_path = self.dir_path.join("manifest.json");
        let manifest_bytes = serde_json::to_vec_pretty(&snap.manifest)
            .map_err(|e| format!("Manifest serialize error: {}", e))?;
        fs::write(&manifest_path, manifest_bytes)
            .map_err(|e| format!("Manifest write error: {}", e))?;

        let snap_bytes = bincode::serialize(snap)
            .map_err(|e| format!("Snapshot serialize error: {}", e))?;
        let crc = crc32fast::hash(&snap_bytes);
        let len = snap_bytes.len() as u64;

        let tmp_path = self.dir_path.join("snapshot.ibsnap.tmp");
        {
            let f = File::create(&tmp_path)
                .map_err(|e| format!("Snapshot tmp create error: {}", e))?;
            let mut w = BufWriter::with_capacity(256 * 1024, f);
            w.write_all(&SNAP_MAGIC)
                .map_err(|e| format!("Snap magic error: {}", e))?;
            w.write_all(&SNAP_VERSION.to_le_bytes())
                .map_err(|e| format!("Snap version error: {}", e))?;
            w.write_all(&len.to_le_bytes())
                .map_err(|e| format!("Snap len error: {}", e))?;
            w.write_all(&crc.to_le_bytes())
                .map_err(|e| format!("Snap crc error: {}", e))?;
            w.write_all(&snap_bytes)
                .map_err(|e| format!("Snap payload error: {}", e))?;
            w.flush().map_err(|e| format!("Snap flush error: {}", e))?;
            w.get_ref()
                .sync_all()
                .map_err(|e| format!("Snap fsync error: {}", e))?;
        }

        fs::rename(&tmp_path, self.snap_path())
            .map_err(|e| format!("Atomic snapshot rename error: {}", e))?;

        // Reset WAL cleanly now that snapshot is safely fsynced and renamed
        let wf = File::create(self.wal_path())
            .map_err(|e| format!("WAL reset error: {}", e))?;
        let _ = wf.sync_all();
        drop(wf);

        self.wal_ops_since_snap = 0;
        self.ensure_wal_writer()?;
        Ok(())
    }

    pub fn load_snapshot(&self) -> Result<Option<CollectionSnapshot>, String> {
        let path = self.snap_path();
        if !path.exists() {
            return Ok(None);
        }
        let mut f = File::open(&path).map_err(|e| format!("Snap open error: {}", e))?;
        let mut header = [0u8; 20];
        if f.read_exact(&mut header).is_err() {
            return Err("Corrupted snapshot header".to_string());
        }
        if header[0..4] != SNAP_MAGIC {
            return Err("Invalid snapshot magic".to_string());
        }
        let ver = u32::from_le_bytes([header[4], header[5], header[6], header[7]]);
        if ver != SNAP_VERSION {
            return Err(format!("Unsupported snapshot version {}", ver));
        }
        let len = u64::from_le_bytes([
            header[8], header[9], header[10], header[11], header[12], header[13], header[14],
            header[15],
        ]) as usize;
        let expected_crc =
            u32::from_le_bytes([header[16], header[17], header[18], header[19]]);

        let mut payload = vec![0u8; len];
        f.read_exact(&mut payload)
            .map_err(|e| format!("Snap truncated payload: {}", e))?;
        let actual_crc = crc32fast::hash(&payload);
        if actual_crc != expected_crc {
            return Err("Snapshot CRC32 mismatch".to_string());
        }
        let snap: CollectionSnapshot = bincode::deserialize(&payload)
            .map_err(|e| format!("Snapshot decode error: {}", e))?;
        Ok(Some(snap))
    }

    pub fn disk_bytes(&self) -> u64 {
        let mut total = 0u64;
        if let Ok(entries) = fs::read_dir(&self.dir_path) {
            for ent in entries.flatten() {
                if let Ok(meta) = ent.metadata() {
                    total += meta.len();
                }
            }
        }
        total
    }

    pub fn rename_collection_dir(&mut self, base_dir: &Path, new_manifest: &CollectionManifest) -> Result<(), String> {
        self.close_handles();
        let new_dir = base_dir.join(safe_collection_dirname(&new_manifest.name));
        if new_dir != self.dir_path {
            fs::rename(&self.dir_path, &new_dir)
                .map_err(|e| format!("Rename dir error: {}", e))?;
            self.dir_path = new_dir;
        }
        let manifest_path = self.dir_path.join("manifest.json");
        let manifest_bytes = serde_json::to_vec_pretty(new_manifest)
            .map_err(|e| format!("Manifest serialize error: {}", e))?;
        fs::write(&manifest_path, manifest_bytes)
            .map_err(|e| format!("Manifest write error: {}", e))?;
        self.ensure_wal_writer()?;
        Ok(())
    }

    pub fn delete_collection_dir(mut self) -> Result<(), String> {
        self.close_handles();
        if self.dir_path.exists() {
            fs::remove_dir_all(&self.dir_path)
                .map_err(|e| format!("Delete dir error {:?}: {}", self.dir_path, e))?;
        }
        Ok(())
    }
}
