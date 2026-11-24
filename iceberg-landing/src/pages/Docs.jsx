import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { CodeBlock } from '../components/CodeBlock'
import Footer from '../components/Footer'
import { CANONICAL_SPEC } from '../config/canonicalSpec'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'
const API = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'

const NAV = [
  {
    group: 'Getting Started',
    items: [
      { id: 'quickstart', title: 'Quickstart' },
      { id: 'authentication', title: 'Authentication & RBAC' },
      { id: 'concepts', title: 'Core Concepts' },
      { id: 'architecture', title: 'System Architecture' },
    ]
  },
  {
    group: 'Production & Operations',
    items: [
      { id: 'limits', title: 'Rate Limits & Quotas' },
      { id: 'errors', title: 'Error Codes & Retries' },
      { id: 'export', title: 'Data Export & Backups' },
    ]
  },
  {
    group: 'API Reference',
    items: [
      { id: 'collections', title: 'Collections' },
      { id: 'indexing', title: 'Indexing & Point CRUD' },
      { id: 'search', title: 'Hybrid & Vector Search' },
      { id: 'memory', title: '4-Tier Agent Memory' },
      { id: 'assistants', title: 'RAG Assistants' },
    ]
  },
  {
    group: 'Official SDKs',
    items: [
      { id: 'python', title: 'Python' },
      { id: 'javascript', title: 'JavaScript / TS' },
      { id: 'rust', title: 'Rust' },
      { id: 'go', title: 'Go' },
      { id: 'dotnet', title: '.NET / C#' },
      { id: 'java', title: 'Java' },
      { id: 'mcp', title: 'MCP Server' },
      { id: 'rest', title: 'REST API Reference' },
    ]
  },
]

const CONTENT = {
  quickstart: {
    title: 'Quickstart (v1.0.0)',
    desc: 'Get up and running with Iceberg DB v1.0.0 in under 2 minutes.',
    sections: [
      { heading: '1. Sign up & Get API Key', text: `Create a free account at ${D}/signup. Your project API key (prefixed with **ib_**) is generated automatically upon registration with 100,000 free vectors and zero cluster pausing.` },
      { heading: '2. Install Official SDK', text: 'Install the official Iceberg DB package for your language:', code: `# Python (PyPI)\npip install icebergdb\n\n# JavaScript / TypeScript (npm)\nnpm install icebergdb\n\n# Rust (Crates.io)\ncargo add icebergdb\n\n# .NET / C# (NuGet)\ndotnet add package IcebergDb\n\n# Go (pkg.go.dev)\ngo get github.com/anku5265/iceberg-database/iceberg-sdk-go\n\n# MCP Server (Claude Code, Cursor, Windsurf, Copilot)\nnpx -y iceberg-mcp`, lang: 'bash' },
      { heading: '3. Index and Run Hybrid RRF Search (Python v1.0.0)', code: `from iceberg import Client

client = Client(api_key="ib_your_key")

# 1. Create a vector collection (384-dim Cosine HNSW + BM25 index)
client.create_collection("my_docs")

# 2. Index raw text (server-side 384d ONNX CPU embedding — $0 OpenAI key needed)
client.index_text("my_docs", "Iceberg DB is hosted in India (ap-south-1) for DPDP Act compliance.")
client.index_text("my_docs", "Hybrid search fuses dense HNSW vectors and Okapi BM25 via RRF.")

# 3. Query using Hybrid RRF (Dense + BM25)
results = client.search("my_docs", "where is Iceberg hosted?", search_type="hybrid", top_k=5)
for r in results:
    print(f"id={r.id} score={r.score:.4f} text={r.text}")`, lang: 'python' },
      { heading: "Ready for Production", text: "You've indexed vectors with built-in 384d CPU embeddings and executed a hybrid semantic + keyword search hosted in India (ap-south-1). Explore the production guides below for rate limits, RBAC security, error handling, and data export." }
    ]
  },
  authentication: {
    title: 'Authentication & Role-Based Access Control (RBAC)',
    desc: 'All API requests authenticate via the X-API-Key header using SHA-256 hashed credentials.',
    sections: [
      { heading: 'API Key Header', text: 'Pass your key in the **X-API-Key** HTTP header on every request. Keys are hashed with **SHA-256** at rest — plaintext keys are shown only once at creation.', code: `curl ${API}/collections \\\n  -H "X-API-Key: ib_your_key"`, lang: 'bash' },
      { heading: 'RBAC Permission Matrix', list: [
        '**admin** — Full control: create/delete collections, index/update/delete documents, run searches, create/revoke API keys, and trigger snapshot backups.',
        '**read_write** — Data plane write + read: create collections, index/update/delete documents, store/recall agent memories, and execute searches. Cannot manage API keys or billing.',
        '**read_only** — Search & recall only: allowed to call `/search`, `/collections` (GET), and `/memory/{agent_id}/recall`. Any write, index, or delete request with a `read_only` key is rejected with **HTTP 403 Forbidden**.'
      ] },
      { heading: 'Create Scoped API Keys', code: `# Via Python SDK\nkey = client.create_key(name="frontend-search-key", role="read_only")\n\n# Via REST API\ncurl -X POST ${API}/auth/keys \\\n  -H "X-API-Key: ib_admin_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"prod-worker","role":"read_write"}'`, lang: 'bash' },
    ]
  },
  concepts: {
    title: 'Core Concepts',
    desc: 'How Collections, Chunks, Built-in Embeddings, Hybrid RRF, and Tenant Isolation work.',
    sections: [
      { heading: 'Collections & Multi-Tenant Isolation', text: 'A collection is a named container for your vectors and document payloads. Every collection is automatically isolated at the storage engine layer using deterministic tenant prefixes (**t_{uid8}__** for SDK keys and **u_{uid8}__** for console projects) so two accounts can never read or overwrite each other’s collections.' },
      { heading: 'Automatic Chunking & Document IDs', text: 'When you index raw text or upload a PDF/TXT/MD file, Iceberg splits long documents into semantic chunks (default 500 characters with overlap), embeds each chunk into a 384-dimensional normalized vector, and assigns a deterministic or user-supplied point ID (`point_id`).' },
      { heading: 'Built-in 384d Server-Side CPU Embeddings', text: 'Iceberg runs quantized **ONNX all-MiniLM-L6-v2** (384 dimensions, Cosine distance) directly on the server CPU (`48.25 ms` min / `112.34 ms` p50). You do not need an external OpenAI or Cohere API key, eliminating external embedding costs and US round-trip latency.' },
      { heading: 'Hybrid Search (Dense Cosine + Okapi BM25 + RRF)', text: 'Pure vector search often misses exact SKU codes, invoice IDs, or legal section numbers. Iceberg scores both **384d HNSW Cosine similarity** and **Okapi BM25 (`k1=1.5, b=0.75`)** across your collection, fusing rankings via **Reciprocal Rank Fusion (`RRF k=60`)** plus normalized score blending (`alpha=0.5` default).', code: `results = client.search("docs", "DPDP section 16 penalty", search_type="hybrid", alpha=0.5, top_k=5)`, lang: 'python' },
    ]
  },
  architecture: {
    title: 'System Architecture & Storage Engine',
    desc: 'Under the hood of Iceberg DB v1.0.0 — FastAPI Control Plane, ONNX Embedder, and Qdrant HNSW + BM25.',
    sections: [
      { heading: 'Request Pipeline', list: [
        '**1. API Gateway & Auth Layer (FastAPI):** Terminates TLS 1.3, validates `X-API-Key` against SHA-256 key hashes, enforces RBAC (`admin`, `read_write`, `read_only`), and applies per-tenant rate & vector quota checks.',
        '**2. Server-Side Embedding Engine (ONNX Runtime):** Converts raw text chunks and queries into 384-dimensional float32 vectors using `all-MiniLM-L6-v2` on CPU (`48.25 ms` min / `112.34 ms` p50), or accepts pre-computed 384d vectors directly with strict dimension & `NaN`/`Inf` validation.',
        '**3. Vector & Payload Storage Engine (Qdrant HNSW):** Stores 384d vectors in an in-memory/SSD HNSW graph (`m=16`, `ef_construct=100`, Cosine metric) isolated per tenant namespace. Pure dense lookup executes in **1.95 ms median (`p50`)**.',
        '**4. Hybrid Lexical Scorer (Okapi BM25 + RRF):** Evaluates exact keyword matches (`k1=1.5, b=0.75`) across full collection payloads and merges dense + sparse rankings via Reciprocal Rank Fusion (`k=60`), completing in **8.73 ms median (`p50`)**.',
        '**5. Cognitive Memory Engine:** Manages 4 distinct memory tiers (`short_term` 1h TTL, `episodic` 30d TTL, `long_term` permanent, `semantic` factual) with automatic timestamp filtering and importance scoring.'
      ] },
      { heading: 'Data Residency & Infrastructure', text: 'Primary cloud compute and storage are hosted in **India (ap-south-1)** so vectors, raw document chunks, and agent memories remain within Indian jurisdiction for **DPDP Act 2023** and **RBI** data localization requirements. Enterprise teams can also deploy the exact same stack inside their own AWS/GCP/Azure VPC via our **Docker & Terraform BYOC** templates.' },
    ]
  },
  limits: {
    title: 'Rate Limits, Quotas & Pricing Plans (v1.0.0)',
    desc: 'Canonical plan pricing, quotas, request rate limits, and payload size specifications.',
    sections: [
      {
        heading: 'Canonical Plan Pricing, Quotas & Rate Limits',
        list: CANONICAL_SPEC.plans.map(
          (p) =>
            `**${p.name} Plan (${p.priceInr}${p.period} / ${p.priceUsd}${p.period}${
              p.yearlyInr ? ` • ${p.yearlyInr} (${p.yearlyUsd})` : ' • Forever free'
            }):** Up to **${p.vectors} vectors** (384d), **${p.queriesPerDay}** search queries, **${p.storage} storage**, **${p.burstLimit}** burst limit, unlimited collections, **${p.projects}**, max file upload **${p.maxUpload}**, ${p.support.toLowerCase()}.`
        ),
      },
      {
        heading: 'Pay-As-You-Grow Overage',
        text: `If your application exceeds plan quotas during a traffic spike, requests are not dropped: extra capacity is billed transparently at **${CANONICAL_SPEC.overage.vectorsInr}** and **${CANONICAL_SPEC.overage.queriesInr}**.`,
      },
      { heading: 'Payload & Indexing Constraints', list: [
        '**Vector Dimension:** Standard built-in collections use **384 dimensions** (`float32`, Cosine similarity). Custom raw vectors are validated for exact dimensionality and finite values (`NaN`/`Inf` rejected with HTTP 422).',
        '**Batch Indexing Limit:** Up to **100 text chunks** or **256 raw vectors** per single API call for optimal p95 latency.',
        '**Supported Upload Formats:** `.pdf`, `.txt`, and `.md` via `POST /documents/upload` with automatic chunking (default `chunk_size=500`, `overlap=50`).'
      ] },
    ]
  },
  errors: {
    title: 'Error Codes, Status Responses & Retries',
    desc: 'Standard HTTP status codes, JSON error schemas, and recommended retry logic.',
    sections: [
      { heading: 'HTTP Status Code Reference', list: [
        '**200 OK** — Request succeeded (`status: "ok"` or requested resource payload).',
        '**400 Bad Request** — Missing required parameter (e.g., empty query string or missing collection name).',
        '**401 Unauthorized** — Missing or invalid `X-API-Key` header, or revoked API key.',
        '**403 Forbidden** — Insufficient RBAC permissions (e.g., `read_only` key attempting `POST /documents/text` or `DELETE /collections/{name}`) or plan vector/query quota exceeded.',
        '**404 Not Found** — Target collection, point ID, or snapshot backup does not exist.',
        '**422 Unprocessable Entity** — Schema validation error (e.g., invalid `search_type`, `alpha` outside `0.0..1.0`, wrong vector dimension, or `NaN`/`Inf` float values).',
        '**429 Too Many Requests** — Per-minute rate limit or daily plan query quota exceeded. Retry after backoff.',
        '**500 / 503 Server Error** — Transient internal error; safe to retry with exponential backoff.'
      ] },
      { heading: 'Standard Error Response Format', code: `{\n  "detail": "Write permission required. Current key role is 'read_only'."\n}`, lang: 'json' },
      { heading: 'Recommended Exponential Backoff Pattern (Python)', code: `import time\nimport httpx\nfrom iceberg import Client\n\nclient = Client(api_key="ib_your_key")\n\ndef search_with_retry(collection: str, query: str, retries: int = 3):\n    for attempt in range(retries):\n        try:\n            return client.search(collection, query, top_k=5)\n        except httpx.HTTPStatusError as exc:\n            if exc.response.status_code in (429, 502, 503, 504) and attempt < retries - 1:\n                time.sleep(0.5 * (2 ** attempt))\n                continue\n            raise`, lang: 'python' },
    ]
  },
  export: {
    title: 'Data Export, Snapshot Backups & Zero Vendor Lock-In',
    desc: 'You own 100% of your vectors, text chunks, and metadata. Export or snapshot anytime.',
    sections: [
      { heading: 'Zero Vendor Lock-In Guarantee', text: 'Iceberg DB never locks in your data. Every document chunk, point ID, metadata dictionary, and vector stored in your collections can be paginated and exported in standard JSON/JSONL format or backed up as a portable Qdrant-compatible collection snapshot.' },
      { heading: 'Export All Documents & Metadata (Scroll API)', code: `# Paginate and export all points in a collection to JSONL\ncurl -X GET "${API}/documents/my_docs/scroll?limit=100&offset=0" \\\n  -H "X-API-Key: ib_your_key"`, lang: 'bash' },
      { heading: 'One-Click Collection Snapshot Backup & Restore', code: `# 1. Create a point-in-time snapshot backup\ncurl -X POST "${API}/backup/create/my_docs" \\\n  -H "X-API-Key: ib_admin_key"\n\n# 2. List available snapshots\ncurl -X GET "${API}/backup/list" \\\n  -H "X-API-Key: ib_admin_key"\n\n# 3. Restore a collection from snapshot\ncurl -X POST "${API}/backup/restore/my_docs_20261031.snapshot" \\\n  -H "X-API-Key: ib_admin_key"`, lang: 'bash' },
    ]
  },
  collections: {
    title: 'Collections API',
    desc: 'Create, list, inspect, and delete tenant-isolated vector collections.',
    sections: [
      { heading: 'Create Collection', code: `client.create_collection("products")\n\n# REST API\ncurl -X POST ${API}/collections \\\n  -H "X-API-Key: ib_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"products"}'`, lang: 'bash' },
      { heading: 'List Collections', code: `collections = client.list_collections()\n# -> [{'name': 'products', 'vectors_count': 42, 'status': 'green'}]\n\n# REST API: GET ${API}/collections`, lang: 'python' },
      { heading: 'Delete Collection', code: `client.delete_collection("products")\n\n# REST API: DELETE ${API}/collections/products`, lang: 'python' },
    ]
  },
  indexing: {
    title: 'Indexing, File Upload & Point-Level CRUD',
    desc: 'Index text, upload PDF/TXT/MD documents, or upsert/get/delete individual point IDs.',
    sections: [
      { heading: 'Index Text (Auto-Chunked + 384d CPU Embedded)', code: `client.index_text("my_docs", "Your content here.", source="policy_v1", metadata={"dept": "legal"})`, lang: 'python' },
      { heading: 'Upload File (PDF, TXT, MD)', code: `client.upload("my_docs", "company_policy.pdf")`, lang: 'python' },
      { heading: 'Single-Point Upsert, Get & Delete by ID', text: 'Manage individual documents or vectors deterministically by `point_id` (supports UUIDs or custom string IDs such as `"doc_101"`):', code: `# Upsert or overwrite a specific point ID\ncurl -X PUT ${API}/documents/my_docs/points/doc_101 \\\n  -H "X-API-Key: ib_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"text": "Updated refund policy: 14 days full refund.", "source": "v2", "metadata": {"version": 2}}'\n\n# Retrieve a single point by ID\ncurl -X GET ${API}/documents/my_docs/points/doc_101 \\\n  -H "X-API-Key: ib_key"\n\n# Delete a single point by ID\ncurl -X DELETE ${API}/documents/my_docs/points/doc_101 \\\n  -H "X-API-Key: ib_key"`, lang: 'bash' },
    ]
  },
  search: {
    title: 'Hybrid RRF, Semantic & Keyword Search',
    desc: 'Query collections with Dense Cosine vectors, Okapi BM25 keywords, or Hybrid Reciprocal Rank Fusion.',
    sections: [
      { heading: 'Search Modes', code: `# 1. Hybrid RRF (Default — Dense 384d + Okapi BM25 fused via RRF)\nresults = client.search("my_docs", "DPDP section 16", search_type="hybrid", alpha=0.5, top_k=5)\n\n# 2. Pure Semantic Dense Vector Search (1.95ms p50 engine lookup)\nresults = client.search("my_docs", "data localization rules", search_type="semantic", top_k=5)\n\n# 3. Pure Keyword Search (Okapi BM25 exact term matching)\nresults = client.search("my_docs", "INV-2026-9981", search_type="keyword", top_k=5)`, lang: 'python' },
      { heading: 'Parameters & Response Schema', list: [
        '**collection** (str, required) — Target collection name.',
        '**query** (str, required) — Natural language query or keyword string.',
        '**top_k** (int, default `5`, max `100`) — Number of ranked results to return.',
        '**search_type** — `"hybrid"` (default), `"semantic"`, or `"keyword"`.',
        '**alpha** (`0.0` to `1.0`, default `0.5`) — Balance between dense semantic score (`1.0`) and BM25 lexical score (`0.0`).',
        '**filter_source** (str, optional) — Filter results to a specific `source` tag.',
        '**Response items:** Each result includes `id` (point ID), `text`, `score` (`0.0..1.0` normalized), `source`, `chunk_index`, and `metadata`.'
      ] },
      { heading: 'REST API Example', code: `curl -X POST ${API}/search \\\n  -H "X-API-Key: ib_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"collection":"my_docs","query":"refund policy","top_k":5,"search_type":"hybrid","alpha":0.5}'`, lang: 'bash' },
    ]
  },
  memory: {
    title: '4-Tier Cognitive Agent Memory API',
    desc: 'Give AI agents persistent short-term, episodic, long-term, and semantic memory.',
    sections: [
      { heading: 'Store Agent Memory', code: `client.remember(\n    agent_id="user_123",\n    content="User is a fintech CTO in Mumbai using Python and FastAPI.",\n    memory_type="long_term",\n    importance=0.9\n)`, lang: 'python' },
      { heading: 'Semantic Memory Recall', code: `memories = client.recall("user_123", "what tech stack does the user run?", top_k=3)\nfor m in memories:\n    print(f"[{m.memory_type}] {m.score:.2f} — {m.content}")`, lang: 'python' },
      { heading: 'The 4 Cognitive Memory Tiers', list: [
        '**short_term** — Active working context, automatically expires after **1 hour TTL**.',
        '**episodic** — Session & interaction history, automatically expires after **30 days TTL**.',
        '**long_term** — Permanent user preferences, identity, and recurring instructions (never expires).',
        '**semantic** — Permanent domain facts and structured knowledge learned by the agent.'
      ] },
    ]
  },
  assistants: {
    title: 'No-Code RAG Assistants',
    desc: 'Turn any Iceberg collection into an embeddable website chatbot or WhatsApp Business agent.',
    sections: [
      { heading: 'Create in Console', text: `Open ${D} -> **Assistants** -> **New Assistant**. Select your collection, configure system instructions, and pick your LLM provider (OpenAI GPT-4o, Anthropic Claude, Google Gemini, Groq Llama 3.3, DeepSeek, or Iceberg Native AI).` },
      { heading: 'Embed Website Chat Widget', code: `<script src="${API}/assistant/{assistant_id}/widget.js" async></script>`, lang: 'html' },
      { heading: 'WhatsApp Business Webhook', text: 'Connect your Meta WhatsApp Business Cloud API webhook directly to your assistant endpoint:', code: `Webhook URL: ${API}/assistant/{assistant_id}/whatsapp`, lang: 'text' },
    ]
  },
  python: {
    title: 'Python SDK',
    desc: 'pip install icebergdb -- Official package on PyPI (https://pypi.org/project/icebergdb/)',
    sections: [
      { heading: 'Install from PyPI', code: `pip install icebergdb`, lang: 'bash' },
      { heading: 'End-to-End Example (v1.0.0)', code: `from iceberg import Iceberg\n\nclient = Iceberg(api_key="ib_your_key", source_tag="my_app")\n\n# 1. Collections & Indexing\nclient.create_collection("my_docs")\nclient.index_text("my_docs", "Our return policy allows 30 day returns.", source="catalog")\nclient.upload("my_docs", "handbook.pdf")\n\n# 2. Hybrid RRF Search (Dense 384d + Okapi BM25)\nresults = client.search("my_docs", "can I return my order?", search_type="hybrid", top_k=5)\nfor r in results:\n    print(f"{r.score:.3f} -- {r.text}")\n\n# 3. 4-Tier Agent Memory\nclient.remember("agent_001", "User prefers dark mode", memory_type="long_term")\nmemories = client.recall("agent_001", "what does user prefer?", top_k=3)`, lang: 'python' },
    ]
  },
  javascript: {
    title: 'JavaScript / TypeScript SDK',
    desc: 'npm install icebergdb -- Official zero-dependency client for Node.js, Next.js, Edge Runtime, Deno & Bun.',
    sections: [
      { heading: 'Install from npm', code: `npm install icebergdb`, lang: 'bash' },
      { heading: 'TypeScript / ESM Usage (v1.0.0)', code: `import { Iceberg } from 'icebergdb'\n\nconst client = new Iceberg({\n  apiKey: process.env.ICEBERG_API_KEY || 'ib_your_key',\n  sourceTag: 'my_app',\n})\n\n// 1. Create collection & index raw text\nawait client.createCollection('my_docs')\nawait client.indexText('my_docs', 'Our return policy allows 30 day returns.')\n\n// 2. Hybrid RRF Search\nconst results = await client.search('my_docs', 'return order', {\n  topK: 5,\n  searchType: 'hybrid',\n  alpha: 0.5,\n})\nresults.forEach(r => console.log(r.score, r.text))`, lang: 'javascript' },
    ]
  },
  rust: {
    title: 'Rust SDK',
    desc: 'cargo add icebergdb -- Official async Tokio/Reqwest client on Crates.io (https://crates.io/crates/icebergdb)',
    sections: [
      { heading: 'Install from Crates.io', code: `cargo add icebergdb`, lang: 'bash' },
      { heading: 'Usage (v1.0.0)', code: `use icebergdb::Iceberg;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {\n    let client = Iceberg::new("ib_your_key").with_source_tag("my_app");\n\n    // Create & index\n    client.create_collection("my_docs", None).await?;\n    client.index_text("my_docs", "Our return policy allows 30 day returns.", None).await?;\n\n    // Hybrid RRF Search\n    let res = client.search("my_docs", "return order", 5).await?;\n    for r in res {\n        println!("{:.4} -- {}", r.score, r.text);\n    }\n    Ok(())\n}`, lang: 'rust' },
    ]
  },
  go: {
    title: 'Go SDK',
    desc: 'go get github.com/anku5265/iceberg-database/iceberg-sdk-go -- Official Go module',
    sections: [
      { heading: 'Install Go Module', code: `go get github.com/anku5265/iceberg-database/iceberg-sdk-go`, lang: 'bash' },
      { heading: 'Usage (v1.0.0)', code: `package main\n\nimport (\n    "fmt"\n    iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"\n)\n\nfunc main() {\n    client, _ := iceberg.NewClient(iceberg.NewClientParams{\n        ApiKey:    "ib_your_key",\n        SourceTag: "my_app",\n    })\n\n    // Create & index\n    _ = client.CreateCollection("my_docs")\n    _, _ = client.IndexText("my_docs", "Our return policy allows 30 day returns.", "docs")\n\n    // Hybrid RRF Search\n    res, _ := client.Search("my_docs", "return order", 5)\n    for _, r := range res.Results {\n        fmt.Printf("%.4f -- %s\\n", r.Score, r.Text)\n    }\n}`, lang: 'go' },
    ]
  },
  dotnet: {
    title: '.NET / C# SDK',
    desc: 'dotnet add package IcebergDb -- Official NuGet package for .NET 8.0+',
    sections: [
      { heading: 'Install from NuGet', code: `dotnet add package IcebergDb`, lang: 'bash' },
      { heading: 'Usage (v1.0.0)', code: `using Iceberg;\n\nvar client = new IcebergClient(\n    apiKey: "ib_your_key",\n    sourceTag: "my_app"\n);\n\n// Create & index\nawait client.CreateCollectionAsync("my_docs");\nawait client.IndexTextAsync("my_docs", "Our return policy allows 30 day returns.");\n\n// Hybrid RRF Search\nvar results = await client.SearchAsync("my_docs", "return order", topK: 5);\nforeach (var r in results)\n{\n    Console.WriteLine($"{r.Score:F4} -- {r.Text}");\n}`, lang: 'csharp' },
    ]
  },
  java: {
    title: 'Java SDK',
    desc: 'io.icebergdb:iceberg-sdk:1.0.0 -- Official Java 17+ HTTP client for Spring Boot & enterprise JVM stacks.',
    sections: [
      { heading: 'Maven Dependency (pom.xml)', code: `<dependency>\n  <groupId>io.icebergdb</groupId>\n  <artifactId>iceberg-sdk</artifactId>\n  <version>1.0.0</version>\n</dependency>`, lang: 'xml' },
      { heading: 'Java Usage (v1.0.0)', code: `import in.iceberg.Iceberg;\nimport java.util.Map;\n\npublic class Example {\n    public static void main(String[] args) throws Exception {\n        Iceberg client = new Iceberg.Builder("ib_your_key")\n                .withSourceTag("my_app")\n                .build();\n\n        // Create & index\n        client.createCollection("my_docs");\n        client.indexText("my_docs", "Our return policy allows 30 day returns.", "docs");\n\n        // Hybrid RRF Search\n        Map<String, Object> results = client.search("my_docs", "return order", 5, "hybrid");\n        System.out.println(results);\n    }\n}`, lang: 'java' },
    ]
  },
  mcp: {
    title: 'Model Context Protocol (MCP) Server',
    desc: 'npx -y iceberg-mcp — Official MCP server for Claude Code, Cursor, Windsurf, Copilot & Gemini CLI.',
    sections: [
      { heading: 'Quick Add to Claude Code', code: `claude mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp`, lang: 'bash' },
      { heading: 'Cursor / Windsurf / Claude Desktop (mcp.json)', code: `{\n  "mcpServers": {\n    "icebergdb": {\n      "command": "npx",\n      "args": ["-y", "iceberg-mcp"],\n      "env": {\n        "ICEBERG_API_KEY": "ib_your_key",\n        "ICEBERG_API_URL": "https://api.icebergdb.in"\n      }\n    }\n  }\n}`, lang: 'json' },
      { heading: 'Available MCP Tools (16 Live Tools)', list: [
        '**iceberg_list_collections / iceberg_create_collection / iceberg_collection_info / iceberg_delete_collection** -- Full collection lifecycle (`384d` default or custom `768d`..`3072d` with `float32`, `sq8`, or `binary` quantization).',
        '**iceberg_upsert_vectors / iceberg_query_vectors / iceberg_delete_vectors** -- Custom-dimension vector CRUD and filtered queries across isolated namespaces.',
        '**iceberg_index_text & iceberg_search** -- Server-side `384d` ONNX CPU ingestion (`Rs.0` cost) and hybrid BM25 + dense vector RRF search.',
        '**iceberg_remember & iceberg_recall** -- Store and recall 4-tier cognitive agent memories (`short_term`, `episodic`, `long_term`, `semantic`).',
        '**iceberg_create_assistant / iceberg_list_assistants / iceberg_upload_assistant_doc / iceberg_chat_assistant / iceberg_delete_assistant** -- Managed grounded RAG Assistants.'
      ] },
    ]
  },
  rest: {
    title: 'REST API Reference (v1.0.0)',
    desc: `Base URL: ${API} • Content-Type: application/json`,
    sections: [
      { heading: 'Authentication Header', code: `X-API-Key: ib_your_key`, lang: 'text' },
      { heading: 'Core Endpoints', list: [
        '**GET /health** — Liveness check (`{"status": "ok", "version": "1.0.0", "region": "Hosted in India (ap-south-1)"}`)',
        '**GET /status** — Real-time subsystem telemetry & latency metrics',
        '**POST /auth/signup** & **POST /auth/login** — Account creation and JWT session login',
        '**GET /auth/keys**, **POST /auth/keys**, **DELETE /auth/keys/{id}** — RBAC API key management (`admin`, `read_write`, `read_only`)',
        '**GET /collections**, **POST /collections**, **DELETE /collections/{name}** — Collection lifecycle',
        '**POST /documents/text** & **POST /documents/upload** — Auto-chunked text and PDF/TXT/MD ingestion',
        '**PUT /documents/{collection}/points/{point_id}** — Upsert or update a single document/vector by ID',
        '**GET /documents/{collection}/points/{point_id}** — Retrieve a single point payload by ID',
        '**DELETE /documents/{collection}/points/{point_id}** — Delete a single point by ID',
        '**GET /documents/{collection}/scroll** — Paginate & export all documents/metadata (Zero Lock-In)',
        '**POST /search** — Hybrid RRF (`search_type="hybrid"`), Semantic (`"semantic"`), or BM25 (`"keyword"`) search',
        '**POST /memory/{agent_id}/remember** & **POST /memory/{agent_id}/recall** — 4-Tier Cognitive Agent Memory',
        '**POST /backup/create/{collection}**, **GET /backup/list**, **POST /backup/restore/{snapshot}** — Point-in-time snapshots'
      ] },
      { heading: 'Interactive OpenAPI / Swagger Explorer', text: 'Explore full request/response schemas and test endpoints live:', code: `${API}/docs`, lang: 'text' },
    ]
  },
}

const SDK_KEYS = ['quickstart', 'python', 'javascript', 'rust', 'go', 'dotnet', 'java', 'mcp']

function renderBold(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
  )
}

export default function Docs() {
  const location = useLocation()
  const [dark] = useState(true)
  const [active, setActive] = useState('quickstart')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const sec = params.get('section')
    if (sec && CONTENT[sec]) {
      setShowAll(false)
      setActive(sec)
    }
    window.scrollTo(0, 0)
  }, [location.search])

  const doc = CONTENT[active]

  const allKeys = NAV.flatMap(g => g.items.map(i => i.id))

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      <Navbar dark={dark} />

      {/* Mobile Horizontal Topic Bar (< 768px only) */}
      <div className="md:hidden border-b border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 overflow-x-auto flex items-center gap-1.5 whitespace-nowrap">
        {NAV.flatMap(g => g.items).map(item => (
          <button
            key={item.id}
            onClick={() => { setShowAll(false); setActive(item.id) }}
            className={`px-3 py-1.5 rounded-lg text-xs transition shrink-0 ${
              !showAll && active === item.id
                ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                : 'text-[#777] bg-[#121212] border border-[#1f1f1f]'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-w-0">
        {/* Sidebar (Desktop >= 768px) */}
        <div className="hidden md:block w-64 border-r border-[#1a1a1a] flex-shrink-0 overflow-y-auto bg-[#0a0a0a]">
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-[#666] uppercase tracking-widest">Docs • v1.0.0</p>
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition"
              >
                {showAll ? 'Single Topic' : 'Full Reference'}
              </button>
            </div>
            {NAV.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-6' : ''}>
                <p className="text-[10px] font-semibold text-[#444] uppercase tracking-widest px-2 mb-2">{group.group}</p>
                <div className="space-y-px">
                  {group.items.map(item => (
                    <button key={item.id} onClick={() => { setShowAll(false); setActive(item.id) }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        !showAll && active === item.id
                          ? 'bg-blue-600/15 text-blue-400 font-medium'
                          : 'text-[#666] hover:text-[#aaa] hover:bg-[#141414]'
                      }`}>
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-8 pt-5 border-t border-[#1a1a1a] space-y-2">
              <a href={`${API}/docs`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition px-2">
                Interactive OpenAPI Docs
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="/llms-full.txt" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#777] hover:text-white transition px-2">
                Full LLM Reference (llms-full.txt)
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-3xl mx-auto px-4 py-6 md:px-10 md:py-10">
            {!showAll && doc && (
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{doc.title}</h1>
                    <button
                      onClick={() => setShowAll(true)}
                      className="text-xs font-mono text-blue-400 hover:text-blue-300 border border-blue-500/30 bg-blue-500/10 px-3 py-1 rounded-md shrink-0"
                    >
                      View All {allKeys.length} Sections →
                    </button>
                  </div>
                  <p className="text-[#777] text-sm font-mono">{doc.desc}</p>
                  <div className="mt-5 h-px bg-[#1a1a1a]"/>
                </div>

                <div className="space-y-8">
                  {doc.sections.map((sec, si) => (
                    <div key={si}>
                      {sec.heading && (
                        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <span className="text-[#444] text-xs font-mono">{String(si + 1).padStart(2, '0')}</span>
                          {sec.heading}
                        </h2>
                      )}
                      {sec.text && <p className="text-[#888] text-sm leading-relaxed mb-3">{renderBold(sec.text)}</p>}
                      {sec.list && (
                        <ul className="space-y-2 mb-3">
                          {sec.list.map((item, li) => (
                            <li key={li} className="flex items-start gap-2 text-sm text-[#888]">
                              <span className="text-blue-400 mt-1 shrink-0">•</span>
                              <span>{renderBold(item)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {sec.code && (
                        <CodeBlock code={sec.code} label={sec.lang || 'code'} />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {showAll && (
              <div className="space-y-14">
                <div className="border-b border-[#1a1a1a] pb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Iceberg DB — Complete Technical Documentation</h1>
                    <p className="text-sm text-[#777] mt-1 font-mono">Full single-page reference covering architecture, RBAC, rate limits, error codes, data export, API endpoints, and all 6 official SDKs + MCP.</p>
                  </div>
                  <button
                    onClick={() => setShowAll(false)}
                    className="text-xs font-mono text-[#aaa] hover:text-white border border-[#333] px-3 py-1.5 rounded-md shrink-0"
                  >
                    ← Topic View
                  </button>
                </div>

                {allKeys.map(key => {
                  const sectionDoc = CONTENT[key]
                  if (!sectionDoc) return null
                  return (
                    <section key={key} id={key} className="border-b border-[#161616] pb-10">
                      <h2 className="text-xl font-bold text-white mb-1">{sectionDoc.title}</h2>
                      <p className="text-xs font-mono text-[#666] mb-6">{sectionDoc.desc}</p>
                      <div className="space-y-6">
                        {sectionDoc.sections.map((sec, si) => (
                          <div key={si}>
                            {sec.heading && <h3 className="text-sm font-semibold text-blue-400 mb-2">{sec.heading}</h3>}
                            {sec.text && <p className="text-[#888] text-sm leading-relaxed mb-3">{renderBold(sec.text)}</p>}
                            {sec.list && (
                              <ul className="space-y-1.5 mb-3">
                                {sec.list.map((item, li) => (
                                  <li key={li} className="flex items-start gap-2 text-sm text-[#888]">
                                    <span className="text-blue-400 mt-1 shrink-0">•</span>
                                    <span>{renderBold(item)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {sec.code && <CodeBlock code={sec.code} label={sec.lang || 'code'} />}
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
