# Qora Python SDK

Vector search infrastructure for Indian AI teams.

## Install

```bash
pip install qora
```

## Quickstart

```python
from qora import Client

client = Client(api_key="your_api_key")

# Create collection
client.create_collection("my_docs")

# Index text (Hindi + English both work)
client.index_text("my_docs", "Qora is a vector database for Indian AI teams.")
client.index_text("my_docs", "भारत में AI स्टार्टअप के लिए सेमांटिक सर्च।")

# Upload PDF
client.upload("my_docs", "document.pdf")

# Search
results = client.search("my_docs", "Indian AI database")
for r in results:
    print(f"{r.score:.2f} — {r.text[:80]}")

# Search with filters
results = client.search("my_docs", "AI teams", filters={"source": "document.pdf"})

# Usage stats
print(client.usage_stats())
```

## API Reference

### `Client(api_key, base_url, timeout)`
Initialize the client.

### Collections
- `create_collection(name, description)` — Create a new collection
- `list_collections()` — List all collections
- `delete_collection(name)` — Delete a collection
- `collection_info(name)` — Get vector count and status

### Indexing
- `index_text(collection, text, source)` — Index plain text
- `upload(collection, file_path)` — Upload PDF/TXT/MD file

### Search
- `search(collection, query, top_k, score_threshold, filters)` — Semantic search

### Usage
- `usage_stats()` — Get searches/day and chunks indexed
