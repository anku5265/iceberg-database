---
name: iceberg-db
description: Official Iceberg DB Agent Skills Library (9 Skills) for Claude Code, Cursor, Codex, GitHub Copilot, Windsurf, Cline, and Antigravity. Provides verified workflows for collections, hybrid BM25 + HNSW RRF search, multi-dimension vectors (384/768/1024/1536/3072d), 4-tier cognitive memory, RAG Assistants, n8n, and MCP tools.
---

# Iceberg DB -- Official Agent Skills Library (`v1.0.0`)

Powered by **IcebergCore (`iceberg-core-rs`)** hosted in India (`ap-south-1` Mumbai, `https://api.icebergdb.in`).

---

## 1. `iceberg-quickstart` -- Create Collection, Index Text & Hybrid Search
```python
from iceberg import Client

ib = Client(api_key="ib_your_api_key", source_tag="agent-skills")
ib.create_collection("docs")  # Default: 384d CPU ONNX + Okapi BM25

ib.index_text("docs", "Invoice INV-9042-AX was settled via UPI in Mumbai.", namespace="prod")
results = ib.search("docs", "INV-9042-AX", search_type="hybrid", namespace="prod", top_k=5)
for hit in results:
    print(hit.id, hit.score, hit.text)
```

---

## 2. `iceberg-query` -- Semantic, Keyword & Filtered Queries
```python
hits = ib.search(
    collection="docs",
    query="UPI settlement status",
    search_type="hybrid",  # 'hybrid' | 'semantic' | 'keyword'
    alpha=0.5,             # 0.0 = pure BM25, 1.0 = pure dense HNSW
    namespace="prod",
    filters={"department": {"$eq": "finance"}},
    top_k=5,
)
```

---

## 3. `iceberg-memory` -- 4-Tier Cognitive Agent Memory (Ebbinghaus Decay)
```python
# Tiers: 'short_term' (1h), 'episodic' (30d), 'long_term' (permanent), 'semantic' (permanent)
ib.remember("coder_agent", "Project uses TypeScript strict mode and ap-south-1 residency.", memory_type="semantic")

memories = ib.recall("coder_agent", "What language and region rules apply?", top_k=3)
for m in memories:
    print(m.score, m.memory_type, m.content)
```

---

## 4. `iceberg-assistant` -- Managed Grounded RAG Assistants
- Create & train via MCP (`iceberg_create_assistant`, `iceberg_upload_assistant_doc`, `iceberg_chat_assistant`) or REST:
  - `POST https://api.icebergdb.in/assistant` (`{"name": "support-bot", "llm_provider": "iceberg_fast"}`)
  - `POST https://api.icebergdb.in/assistant/{id}/upload` (multipart `.pdf`, `.md`, `.txt`)
  - `POST https://api.icebergdb.in/assistant/{id}/chat` (`{"message": "What is our refund SLA?"}`)

---

## 5. `iceberg-vectors` -- Custom Multi-Dimension Collections (`768d`, `1024d`, `1536d`, `3072d`)
```python
ib.create_collection(
    name="openai_1536",
    dimension=1536,
    metric="cosine",        # 'cosine' | 'dotproduct' | 'euclidean' | 'manhattan'
    quantization="sq8",     # 'float32' | 'sq8' (4x less RAM) | 'binary' (32x less RAM)
)

ib.upsert_vectors(
    collection="openai_1536",
    vectors=[{"id": "vec_1", "values": embedding_1536, "text": "Clause 4.2", "metadata": {"year": 2026}}],
    namespace="tenant_a",
)

res = ib.query_vectors("openai_1536", vector=query_1536, top_k=5, namespace="tenant_a")
print(ib.describe_collection_stats("openai_1536"))
```

---

## 6. `iceberg-hybrid-search` -- Dense + Okapi BM25 Reciprocal Rank Fusion
Pass both `vector` and `query_text` with `search_type="hybrid"` and `alpha=0.5` to fuse dense cosine similarity with exact part numbers, SKUs, and legal citations:
```python
res = ib.query_vectors(
    collection="openai_1536",
    vector=query_1536,
    query_text="INV-9042-AX Clause 4.2",
    search_type="hybrid",
    alpha=0.5,
    filter={"year": {"$gte": 2025}},
    top_k=5,
)
```

---

## 7. `iceberg-n8n` -- Visual Automation Workflows (`n8n-nodes-iceberg`)
- Install community node `n8n-nodes-iceberg` in self-hosted n8n (**Settings -> Community Nodes -> Install**).
- Resources supported:
  1. `Vector Search` (`indexText`, `search`)
  2. `Agent Memory` (`remember`, `recall`)
  3. `Assistant` (`create`, `upload`, `chat`, `list`, `delete`)

---

## 8. `iceberg-mcp` -- Live MCP Server Tools (`npx -y iceberg-mcp`)
- `iceberg_list_collections` -- List all collections in the active project
- `iceberg_create_collection` -- Create a 384d or custom-dimension vector collection
- `iceberg_collection_info` -- Inspect vector count, dimension, metric, quantization, and namespaces
- `iceberg_delete_collection` -- Delete a collection and release vector quota
- `iceberg_index_text` -- Chunk and embed plain text on server CPU (`all-MiniLM-L6-v2`, Rs.0)
- `iceberg_search` -- Run `hybrid`, `semantic`, or `keyword` search
- `iceberg_remember` -- Store 4-tier cognitive agent memory
- `iceberg_recall` -- Recall ranked agent memories
- `iceberg_create_assistant` / `iceberg_list_assistants` / `iceberg_upload_assistant_doc` / `iceberg_chat_assistant` / `iceberg_delete_assistant`

---

## 9. `iceberg-docs` -- Official Endpoints & Links
- Base API: `https://api.icebergdb.in` (Interactive OpenAPI: `https://api.icebergdb.in/docs`)
- Cloud Console & Keys: `https://dashboard.icebergdb.in`
- Documentation & Integrations Hub: `https://icebergdb.in/integrations`
- Framework Adapters (`from iceberg.integrations import ...`): `IcebergLangChainVectorStore`, `IcebergLlamaIndexVectorStore`, `IcebergHaystackDocumentStore`
