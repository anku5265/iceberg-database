---
name: iceberg-db
description: Official Iceberg DB (v1.0.0) Agent Skill for AI coding assistants (Cursor, Claude Code, Antigravity, Windsurf, Copilot). Use when building RAG pipelines, hybrid vector + BM25 search, multi-dimension embeddings (384/768/1024/1536/3072d), SQ8/Binary quantized indexes, or 4-tier cognitive agent memory on Iceberg DB.
---

# Iceberg DB (`v1.0.0`) — Developer & AI Agent Guide

Iceberg DB is a high-performance Vector, Hybrid Okapi BM25, Quantization, and 4-Tier Cognitive Memory Engine powered by **IcebergCore (`iceberg-core-rs` v1.0.0)**.

## 1. Quickstart (Built-in Rs.0 CPU Embeddings — 384d)
```python
import iceberg

db = iceberg.connect(api_key="ib_your_api_key")
db.create_collection("docs")

db.index_text("docs", "Invoice INV-9042-AX was settled via UPI.", namespace="prod")
results = db.search("docs", "INV-9042-AX", search_type="hybrid", namespace="prod")
for hit in results:
    print(hit.id, hit.score, hit.text)
```

## 2. Multi-Dimension BYO Vectors (OpenAI 1536d/3072d, Cohere/Voyage 1024d, Gemini 768d)
```python
db.create_collection(
    name="openai_rag",
    dimension=1536,
    metric="cosine",        # cosine | dotproduct | euclidean | manhattan
    quantization="sq8",     # float32 | sq8 (4x less RAM) | binary (32x less RAM)
)

db.upsert_vectors(
    collection="openai_rag",
    namespace="tenant_a",
    vectors=[
        {"id": "doc_1", "values": embedding_1536, "text": "Contract clause 4.2", "metadata": {"year": 2026}},
    ],
)

matches = db.query_vectors(
    collection="openai_rag",
    vector=query_embedding_1536,
    query_text="clause 4.2",
    search_type="hybrid",
    namespace="tenant_a",
    filter={"year": {"$gte": 2025}},
    top_k=5,
)
```

## 3. 4-Tier Cognitive Agent Memory (Ebbinghaus Decay)
```python
db.remember("support_agent", "User prefers concise TypeScript answers", memory_type="semantic")
memories = db.recall("support_agent", "How should I format code replies?", top_k=3)
```
