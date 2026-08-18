//! # Iceberg Rust SDK
//!
//! Official Rust client for [Iceberg](https://icebergdb.io) — vector search for Indian AI teams.
//!
//! ## Quickstart
//!
//! ```rust,no_run
//! use iceberg::Client;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), iceberg::IcebergError> {
//!     let client = Client::new("your_api_key");
//!
//!     client.create_collection("my_docs", None).await?;
//!     client.index_text("my_docs", "Iceberg is a vector database for Indian AI teams.", None).await?;
//!
//!     let results = client.search("my_docs", "Indian AI", 5).await?;
//!     for r in &results {
//!         println!("{:.3} {}", r.score, r.text);
//!     }
//!     Ok(())
//! }
//! ```

use reqwest::multipart;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use thiserror::Error;

pub const DEFAULT_BASE_URL: &str = "https://api.icebergdb.io";

// ── Error ─────────────────────────────────────────────────────────────────────

#[derive(Error, Debug)]
pub enum IcebergError {
    #[error("HTTP {status}: {message}")]
    Api { status: u16, message: String },

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

// ── Models ────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Deserialize)]
pub struct SearchResult {
    pub text: String,
    pub score: f64,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Deserialize)]
struct SearchResponse {
    results: Vec<SearchResult>,
}

#[derive(Debug, Deserialize)]
struct CollectionsResponse {
    collections: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct IndexResponse {
    chunks_indexed: usize,
}

#[derive(Debug, Deserialize)]
struct MemoryItem {
    pub content: String,
    pub score: f64,
    #[serde(rename = "type")]
    pub memory_type: Option<String>,
}

#[derive(Debug, Deserialize)]
struct MemoryResponse {
    memories: Vec<MemoryItem>,
}

#[derive(Debug, Clone)]
pub struct Memory {
    pub content: String,
    pub score: f64,
    pub memory_type: Option<String>,
}

#[derive(Debug, Serialize)]
struct SearchRequest<'a> {
    collection: &'a str,
    query: &'a str,
    top_k: usize,
    search_type: &'a str,
    alpha: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    filters: Option<&'a HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    namespace: Option<&'a str>,
}

// ── Client ────────────────────────────────────────────────────────────────────

/// Official Rust client for the Iceberg Vector Database API.
pub struct Client {
    api_key: String,
    base_url: String,
    http: reqwest::Client,
}

impl Client {
    /// Create a new client with default base URL.
    pub fn new(api_key: impl Into<String>) -> Self {
        Self::with_base_url(api_key, DEFAULT_BASE_URL)
    }

    /// Create a new client with a custom base URL (for local/self-hosted instances).
    pub fn with_base_url(api_key: impl Into<String>, base_url: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
            base_url: base_url.into().trim_end_matches('/').to_string(),
            http: reqwest::Client::new(),
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{}", self.base_url, path)
    }

    async fn check_response(&self, resp: reqwest::Response) -> Result<String, IcebergError> {
        let status = resp.status().as_u16();
        let body = resp.text().await?;
        if status >= 400 {
            let detail = serde_json::from_str::<serde_json::Value>(&body)
                .ok()
                .and_then(|v| v.get("detail")?.as_str().map(|s| s.to_string()))
                .unwrap_or(body);
            return Err(IcebergError::Api { status, message: detail });
        }
        Ok(body)
    }

    // ── Collections ───────────────────────────────────────────────────────────

    pub async fn create_collection(&self, name: &str, description: Option<&str>) -> Result<(), IcebergError> {
        let body = serde_json::json!({
            "name": name,
            "description": description.unwrap_or(""),
        });
        let resp = self.http.post(self.url("/collections"))
            .header("X-API-Key", &self.api_key)
            .json(&body)
            .send().await?;
        self.check_response(resp).await?;
        Ok(())
    }

    pub async fn list_collections(&self) -> Result<Vec<String>, IcebergError> {
        let resp = self.http.get(self.url("/collections"))
            .header("X-API-Key", &self.api_key)
            .send().await?;
        let body = self.check_response(resp).await?;
        let data: CollectionsResponse = serde_json::from_str(&body)
            .map_err(|e| IcebergError::Api { status: 0, message: e.to_string() })?;
        Ok(data.collections)
    }

    pub async fn delete_collection(&self, name: &str) -> Result<(), IcebergError> {
        let resp = self.http.delete(self.url(&format!("/collections/{}", name)))
            .header("X-API-Key", &self.api_key)
            .send().await?;
        self.check_response(resp).await?;
        Ok(())
    }

    // ── Indexing ──────────────────────────────────────────────────────────────

    pub async fn index_text(&self, collection: &str, text: &str, source: Option<&str>) -> Result<usize, IcebergError> {
        let form = multipart::Form::new()
            .text("collection", collection.to_string())
            .text("text", text.to_string())
            .text("source", source.unwrap_or("sdk").to_string());

        let resp = self.http.post(self.url("/documents/text"))
            .header("X-API-Key", &self.api_key)
            .multipart(form)
            .send().await?;
        let body = self.check_response(resp).await?;
        let data: IndexResponse = serde_json::from_str(&body)
            .map_err(|e| IcebergError::Api { status: 0, message: e.to_string() })?;
        Ok(data.chunks_indexed)
    }

    pub async fn upload<P: AsRef<Path>>(&self, collection: &str, file_path: P) -> Result<usize, IcebergError> {
        let path = file_path.as_ref();
        let file_name = path.file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| "file".to_string());
        let bytes = tokio::fs::read(path).await?;
        let file_part = multipart::Part::bytes(bytes).file_name(file_name);
        let form = multipart::Form::new()
            .text("collection", collection.to_string())
            .part("file", file_part);

        let resp = self.http.post(self.url("/documents/upload"))
            .header("X-API-Key", &self.api_key)
            .multipart(form)
            .send().await?;
        let body = self.check_response(resp).await?;
        let data: IndexResponse = serde_json::from_str(&body)
            .map_err(|e| IcebergError::Api { status: 0, message: e.to_string() })?;
        Ok(data.chunks_indexed)
    }

    // ── Search ────────────────────────────────────────────────────────────────

    pub async fn search(&self, collection: &str, query: &str, top_k: usize) -> Result<Vec<SearchResult>, IcebergError> {
        self.search_with_options(collection, query, top_k, "hybrid", 0.5, None, None).await
    }

    pub async fn search_with_options(
        &self,
        collection: &str,
        query: &str,
        top_k: usize,
        search_type: &str,
        alpha: f64,
        filters: Option<&HashMap<String, serde_json::Value>>,
        namespace: Option<&str>,
    ) -> Result<Vec<SearchResult>, IcebergError> {
        let body = SearchRequest { collection, query, top_k, search_type, alpha, filters, namespace };
        let resp = self.http.post(self.url("/search"))
            .header("X-API-Key", &self.api_key)
            .json(&body)
            .send().await?;
        let text = self.check_response(resp).await?;
        let data: SearchResponse = serde_json::from_str(&text)
            .map_err(|e| IcebergError::Api { status: 0, message: e.to_string() })?;
        Ok(data.results)
    }

    // ── Agent Memory ──────────────────────────────────────────────────────────

    pub async fn remember(&self, agent_id: &str, content: &str, memory_type: &str) -> Result<(), IcebergError> {
        let body = serde_json::json!({ "content": content, "memory_type": memory_type });
        let resp = self.http.post(self.url(&format!("/memory/{}/remember", agent_id)))
            .header("X-API-Key", &self.api_key)
            .json(&body)
            .send().await?;
        self.check_response(resp).await?;
        Ok(())
    }

    pub async fn recall(&self, agent_id: &str, query: &str, top_k: usize) -> Result<Vec<Memory>, IcebergError> {
        let body = serde_json::json!({ "query": query, "top_k": top_k });
        let resp = self.http.post(self.url(&format!("/memory/{}/recall", agent_id)))
            .header("X-API-Key", &self.api_key)
            .json(&body)
            .send().await?;
        let text = self.check_response(resp).await?;
        let data: MemoryResponse = serde_json::from_str(&text)
            .map_err(|e| IcebergError::Api { status: 0, message: e.to_string() })?;
        Ok(data.memories.into_iter().map(|m| Memory {
            content: m.content,
            score: m.score,
            memory_type: m.memory_type,
        }).collect())
    }

    // ── Usage ─────────────────────────────────────────────────────────────────

    pub async fn usage_stats(&self) -> Result<serde_json::Value, IcebergError> {
        let resp = self.http.get(self.url("/usage/stats"))
            .header("X-API-Key", &self.api_key)
            .send().await?;
        let body = self.check_response(resp).await?;
        serde_json::from_str(&body).map_err(|e| IcebergError::Api { status: 0, message: e.to_string() })
    }

    // ── Backup ────────────────────────────────────────────────────────────────

    pub async fn backup(&self, collection: &str) -> Result<String, IcebergError> {
        let resp = self.http.post(self.url(&format!("/backup/{}", collection)))
            .header("X-API-Key", &self.api_key)
            .send().await?;
        let body = self.check_response(resp).await?;
        let data: serde_json::Value = serde_json::from_str(&body)
            .map_err(|e| IcebergError::Api { status: 0, message: e.to_string() })?;
        Ok(data["backup_id"].as_str().unwrap_or("").to_string())
    }
}
