# `iceberg-mcp` — Official MCP Server for Iceberg DB (`v0.1.1`)

Connect **Claude Code**, **Cursor**, **GitHub Copilot**, **OpenAI Codex**, **Gemini CLI**, and **Windsurf** directly to [Iceberg DB](https://icebergdb.in) (`ap-south-1` India (ap-south-1) Vector Search & 4-Tier Cognitive Agent Memory).

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

### 3. Available MCP Tools
- `iceberg_search` — Hybrid (Dense 384d + BM25 RRF), semantic, or keyword search
- `iceberg_index_text` — Index text with automatic server-side 384d CPU embeddings
- `iceberg_remember` — Store agent memory (`short_term`, `episodic`, `long_term`, `semantic`)
- `iceberg_recall` — Recall relevant memories in `<15ms`
- `iceberg_list_collections` — List all vector collections

## Canonical Iceberg DB SDKs (`v0.1.1`)
- **Python (`PyPI`):** `pip install icebergdb`
- **JavaScript / TypeScript (`npm`):** `npm install icebergdb`
- **Rust (`Crates.io`):** `cargo add icebergdb`
- **.NET / C# (`NuGet`):** `dotnet add package IcebergDb`
- **Go:** `go get github.com/anku5265/iceberg-database/iceberg-sdk-go`
- **Java (`Maven`):** `io.icebergdb:iceberg-sdk:0.1.0`
