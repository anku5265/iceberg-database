# Qora Rust SDK

Official Rust client for [Qora](https://qora.in) — vector search for Indian AI teams.

## Installation

```toml
# Cargo.toml
[dependencies]
qora = "0.1.0"
tokio = { version = "1", features = ["full"] }
```

## Quickstart

```rust
use qora::Client;

#[tokio::main]
async fn main() -> Result<(), qora::QoraError> {
    let client = Client::new("your_api_key");

    // Create a collection
    client.create_collection("my_docs", None).await?;

    // Index text
    client.index_text("my_docs", "Qora is a vector database for Indian AI teams.", None).await?;

    // Upload a PDF
    client.upload("my_docs", "knowledge_base.pdf").await?;

    // Search
    let results = client.search("my_docs", "Indian AI", 5).await?;
    for r in &results {
        println!("{:.3} {}", r.score, r.text);
    }

    Ok(())
}
```

## Hybrid Search

```rust
use std::collections::HashMap;

let results = client.search_with_options(
    "my_docs",
    "affordable phone",
    10,
    "hybrid",   // "hybrid" | "semantic" | "keyword"
    0.7,        // alpha: 0.0 = keyword, 1.0 = semantic
    None,
    None,
).await?;
```

## Agent Memory

```rust
// Store memory
client.remember("user_123", "User prefers dark mode. Lives in Delhi.", "long_term").await?;

// Recall
let memories = client.recall("user_123", "user preferences", 5).await?;
for m in &memories {
    println!("{:.3} {}", m.score, m.content);
}
```

## Self-hosted / Local

```rust
let client = Client::with_base_url("your_api_key", "http://localhost:8000");
```

## API Reference

| Method | Description |
|--------|-------------|
| `create_collection(name, desc)` | Create a new collection |
| `list_collections()` | List all collections |
| `delete_collection(name)` | Delete a collection |
| `index_text(collection, text, source)` | Index text content |
| `upload(collection, path)` | Upload PDF/TXT/MD |
| `search(collection, query, top_k)` | Semantic search |
| `search_with_options(...)` | Full search control |
| `remember(agent_id, content, type)` | Store agent memory |
| `recall(agent_id, query, top_k)` | Recall agent memory |
| `usage_stats()` | Get usage stats |
| `backup(collection)` | Backup a collection |
