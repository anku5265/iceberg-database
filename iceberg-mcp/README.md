# `iceberg-mcp` -- Official MCP Server for Iceberg DB (`v1.0.0`)

Connect **Claude Code**, **Cursor**, **GitHub Copilot**, **OpenAI Codex**, **Gemini CLI**, and **Windsurf** directly to [Iceberg DB](https://icebergdb.in) (`ap-south-1`, Mumbai -- Serverless Vector Database, Hybrid BM25 + HNSW RRF Search, 4-Tier Cognitive Agent Memory, and Managed RAG Assistants).

## Quickstart

### 1. Claude Code
```bash
claude mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp
```

### 2. Cursor (`.cursor/mcp.json`) / Claude Desktop / Windsurf
```json
{
  "mcpServers": {
    "icebergdb": {
      "command": "npx",
      "args": ["-y", "iceberg-mcp"],
      "env": {
        "ICEBERG_API_KEY": "ib_your_key"
      }
    }
  }
}
```

## Available MCP Tools (16 Live Tools)

### Collections & Multi-Dimension Vectors
- `iceberg_list_collections` -- List all vector collections in the project
- `iceberg_create_collection` -- Create a `384d` or custom `768d` / `1024d` / `1536d` / `3072d` collection (`float32`, `sq8`, `binary`)
- `iceberg_collection_info` -- Inspect vector count, dimension, metric, quantization, and namespaces
- `iceberg_delete_collection` -- Delete a collection and release quota
- `iceberg_upsert_vectors` -- Batch upsert custom-dimension vectors with metadata & namespaces
- `iceberg_query_vectors` -- Query custom-dimension vectors with `$eq/$gt/$gte/$in` filters
- `iceberg_delete_vectors` -- Delete vectors by IDs, metadata filter, or `delete_all`

### Text Ingestion, Hybrid Search & 4-Tier Memory
- `iceberg_index_text` -- Chunk and embed plain text on server CPU (`all-MiniLM-L6-v2`, Rs.0 cost)
- `iceberg_search` -- Hybrid (Dense 384d + Okapi BM25 RRF), semantic, or keyword search
- `iceberg_remember` -- Store agent memory (`short_term`, `episodic`, `long_term`, `semantic`)
- `iceberg_recall` -- Recall ranked cognitive memories in `<15ms`

### Managed RAG Assistants
- `iceberg_create_assistant` -- Create an assistant with Web Widget (`widget.js`), WhatsApp webhook, and 6 pluggable LLMs
- `iceberg_list_assistants` -- List all assistants in the project
- `iceberg_upload_assistant_doc` -- Train an assistant from raw text/Markdown or a local `.pdf` / `.md` / `.txt` file
- `iceberg_chat_assistant` -- Ask grounded questions with document citations
- `iceberg_delete_assistant` -- Delete an assistant and its isolated collection
