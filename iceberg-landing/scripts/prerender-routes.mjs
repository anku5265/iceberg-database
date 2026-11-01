import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist')
const baseHtmlPath = path.join(distDir, 'index.html')

if (!fs.existsSync(baseHtmlPath)) {
  console.error('Error: dist/index.html not found. Run vite build first.')
  process.exit(1)
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8')

const ROUTES = [
  {
    route: '/',
    title: 'Iceberg DB (v1.0.0) — Serverless Vector Database, Hybrid RAG & AI Agent Memory for India',
    description:
      'Iceberg DB (v1.0.0) is an India-hosted serverless vector database, hybrid BM25 + dense RRF search engine (1.95ms semantic / 8.73ms hybrid RRF engine p50), and 4-tier cognitive AI agent memory platform hosted in India (ap-south-1). 100K vectors free forever, built-in server-side 384d CPU embeddings, DPDP Act 2023 data residency, and 6 official SDKs + MCP server.',
    bodyHtml: `
      <main style="background:#050507;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <header>
          <p style="color:#60a5fa;font-family:monospace;font-size:12px;text-transform:uppercase;">v1.0.0 Production Stable • Hosted in India (ap-south-1)</p>
          <h1>Iceberg DB — Serverless Vector Database, Hybrid RRF RAG &amp; 4-Tier AI Agent Memory for India</h1>
          <p>Eliminate 200ms US/EU cross-border vector search latency and external OpenAI embedding costs. Iceberg DB combines a 384-dimensional Cosine HNSW vector engine (<strong>1.95 ms p50</strong>), Okapi BM25 + Reciprocal Rank Fusion hybrid search (<strong>8.73 ms p50</strong>), built-in server-side ONNX CPU embeddings (<code>all-MiniLM-L6-v2</code>, <strong>$0 API key cost</strong>), and persistent 4-tier AI agent memory hosted in India (<code>ap-south-1</code>) for DPDP Act 2023 compliance.</p>
          <nav style="margin:20px 0;">
            <a href="/docs" style="color:#60a5fa;margin-right:16px;">Documentation &amp; API Reference</a>
            <a href="/benchmarks" style="color:#60a5fa;margin-right:16px;">Reproducible Benchmarks</a>
            <a href="/security" style="color:#60a5fa;margin-right:16px;">Security &amp; DPDP Compliance</a>
            <a href="/status" style="color:#60a5fa;margin-right:16px;">System Status &amp; Telemetry</a>
            <a href="/about" style="color:#60a5fa;margin-right:16px;">About &amp; Founder</a>
            <a href="https://dashboard.icebergdb.in/signup" style="color:#34d399;">Start Free (100K Vectors)</a>
          </nav>
        </header>

        <section>
          <h2>Core Architecture &amp; Capabilities (v1.0.0)</h2>
          <ul>
            <li><strong>Hybrid Search Engine (Dense + BM25 + RRF):</strong> Fuses 384d Cosine HNSW dense similarity with Okapi BM25 (<code>k1=1.5, b=0.75</code>) via Reciprocal Rank Fusion (<code>RRF k=60</code>) and normalized score blending (<code>alpha=0.5</code>).</li>
            <li><strong>Built-in 384d Server-Side CPU Embeddings:</strong> Quantized ONNX Runtime <code>all-MiniLM-L6-v2</code> embeds raw text and PDF/TXT/MD uploads directly on server CPU (<code>48.2 ms min</code>) with zero external OpenAI or Cohere dependency.</li>
            <li><strong>4-Tier Cognitive AI Agent Memory:</strong> Native endpoints (<code>remember</code> &amp; <code>recall</code>) across <code>short_term</code> (1h TTL), <code>episodic</code> (30d TTL), <code>long_term</code> (permanent), and <code>semantic</code> memory tiers.</li>
            <li><strong>Enterprise Security &amp; Zero Lock-In:</strong> SHA-256 API key hashing, strict Role-Based Access Control (<code>admin</code>, <code>read_write</code>, <code>read_only</code>), deterministic multi-tenant namespace isolation (<code>t_{uid8}__</code>), JSON scroll export (<code>GET /documents/{col}/scroll</code>), snapshot backups, and Docker/Terraform BYOC self-hosting.</li>
          </ul>
        </section>

        <section>
          <h2>Official SDKs &amp; MCP Server (v1.0.0)</h2>
          <ul>
            <li><strong>Python (PyPI):</strong> <code>pip install icebergdb</code> — <a href="https://pypi.org/project/icebergdb/">pypi.org/project/icebergdb</a></li>
            <li><strong>JavaScript / TypeScript (NPM):</strong> <code>npm install icebergdb</code> — <a href="https://www.npmjs.com/package/icebergdb">npmjs.com/package/icebergdb</a></li>
            <li><strong>Rust (Crates.io):</strong> <code>cargo add icebergdb</code> — <a href="https://crates.io/crates/icebergdb">crates.io/crates/icebergdb</a></li>
            <li><strong>.NET / C# (NuGet):</strong> <code>dotnet add package IcebergDb</code> — <a href="https://www.nuget.org/packages/IcebergDb">nuget.org/packages/IcebergDb</a></li>
            <li><strong>Go:</strong> <code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go</code></li>
            <li><strong>Java (Maven):</strong> <code>io.icebergdb:iceberg-sdk:1.0.0</code></li>
            <li><strong>MCP Server (Claude Code, Cursor, Windsurf, Copilot):</strong> <code>npx -y iceberg-mcp</code> — <a href="https://www.npmjs.com/package/iceberg-mcp">npmjs.com/package/iceberg-mcp</a></li>
          </ul>
        </section>

        <section>
          <h2>Transparent INR &amp; USD Pricing</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Plan</th><th>Monthly Price</th><th>Vectors</th><th>Queries / Day</th><th>Burst Rate Limit</th><th>Storage &amp; Projects</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Free</strong></td><td>₹0 ($0) forever</td><td>100,000</td><td>1,000 / day</td><td>60 req/min</td><td>1 GB, 1 project, never pauses</td></tr>
              <tr><td><strong>Starter</strong></td><td>₹799 / mo ($10)</td><td>1,000,000</td><td>20,000 / day</td><td>300 req/min</td><td>5 GB, 5 projects, email support</td></tr>
              <tr><td><strong>Growth</strong></td><td>₹3,499 / mo ($42)</td><td>5,000,000</td><td>100,000 / day</td><td>1,000 req/min</td><td>25 GB, 15 projects, priority support</td></tr>
              <tr><td><strong>Scale</strong></td><td>₹9,999 / mo ($119)</td><td>20,000,000</td><td>500,000 / day</td><td>3,000 req/min</td><td>100 GB, unlimited projects, dedicated SLA</td></tr>
            </tbody>
          </table>
        </section>
      </main>
    `,
  },
  {
    route: '/docs',
    title: 'Documentation & API Reference — Iceberg DB (v1.0.0)',
    description:
      'Complete technical documentation for Iceberg DB v1.0.0: Quickstart, System Architecture, SHA-256 RBAC Authentication, Rate Limits & Quotas, HTTP Error Codes, Data Export (Zero Lock-In), Hybrid RRF Search, 4-Tier Agent Memory, REST API, and all 6 official SDKs + MCP.',
    bodyHtml: `
      <main style="background:#080808;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB v1.0.0 — Complete Technical Documentation &amp; API Reference</h1>
        <p>Base API Gateway: <code>https://api.icebergdb.in</code> • Interactive OpenAPI Explorer: <a href="https://api.icebergdb.in/docs">https://api.icebergdb.in/docs</a> • Cloud Console: <a href="https://dashboard.icebergdb.in">https://dashboard.icebergdb.in</a></p>

        <section id="quickstart">
          <h2>1. Quickstart (Under 2 Minutes)</h2>
          <pre><code>pip install icebergdb</code></pre>
          <pre><code>from iceberg import Client

client = Client(api_key="ib_your_key")

# 1. Create a vector collection (384-dim Cosine HNSW + Okapi BM25)
client.create_collection("my_docs")

# 2. Index raw text (server-side 384d ONNX CPU embedding — $0 OpenAI key required)
client.index_text("my_docs", "Iceberg DB is hosted in India (ap-south-1) for DPDP Act compliance.")
client.index_text("my_docs", "Hybrid search fuses dense HNSW vectors and Okapi BM25 via RRF.")

# 3. Hybrid RRF Search
results = client.search("my_docs", "where is Iceberg hosted?", search_type="hybrid", top_k=5)
for r in results:
    print(f"id={r.id} score={r.score:.4f} text={r.text}")</code></pre>
        </section>

        <section id="architecture">
          <h2>2. System Architecture &amp; Storage Engine</h2>
          <ul>
            <li><strong>API Gateway &amp; Control Plane (FastAPI):</strong> Terminates TLS 1.3, validates <code>X-API-Key</code> against SHA-256 hashes, enforces RBAC (<code>admin</code>, <code>read_write</code>, <code>read_only</code>), and applies per-tenant rate and vector quotas.</li>
            <li><strong>Built-in Server-Side Embedding Engine (ONNX Runtime):</strong> Runs quantized <code>all-MiniLM-L6-v2</code> (384 dimensions, Cosine similarity) on CPU in <code>48.2 ms</code> min / <code>112.3 ms</code> p50, or validates custom 384d float32 vectors (rejecting wrong dimensions or <code>NaN</code>/<code>Inf</code> with HTTP 422).</li>
            <li><strong>Vector Storage Engine (Qdrant HNSW):</strong> Stores 384d vectors in an HNSW graph (<code>m=16</code>, <code>ef_construct=100</code>) isolated per tenant namespace (<code>t_{uid8}__</code> and <code>u_{uid8}__</code>). Pure dense lookup executes in <strong>1.95 ms median (p50)</strong>.</li>
            <li><strong>Hybrid Lexical Scorer (Okapi BM25 + RRF):</strong> Scores full collection payloads with Okapi BM25 (<code>k1=1.5, b=0.75</code>) and fuses dense + lexical rankings via Reciprocal Rank Fusion (<code>RRF k=60</code>) and normalized score blending (<code>alpha=0.5</code> default) in <strong>8.73 ms median (p50)</strong>.</li>
          </ul>
        </section>

        <section id="authentication">
          <h2>3. Authentication &amp; Role-Based Access Control (RBAC)</h2>
          <p>Pass your API key in the <code>X-API-Key: ib_your_key</code> HTTP header. All keys are stored as irreversible SHA-256 hashes.</p>
          <ul>
            <li><strong>admin:</strong> Full access to collections, document indexing/deletion, search, API key creation/revocation, and snapshot backups.</li>
            <li><strong>read_write:</strong> Create collections, index/update/delete documents, store/recall agent memory, and run searches. Cannot manage API keys.</li>
            <li><strong>read_only:</strong> Search and recall only (<code>GET /collections</code>, <code>POST /search</code>, <code>POST /memory/{id}/recall</code>). Any write or delete attempt returns <strong>HTTP 403 Forbidden</strong>.</li>
          </ul>
        </section>

        <section id="limits">
          <h2>4. Rate Limits, Plan Quotas &amp; Scaling Specifications</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Plan</th><th>Max Vectors (384d)</th><th>Daily Queries</th><th>Burst Rate Limit</th><th>Max Upload Size</th><th>Storage &amp; Projects</th></tr>
            </thead>
            <tbody>
              <tr><td>Free (₹0)</td><td>100,000</td><td>1,000 / day</td><td>60 req/min</td><td>10 MB</td><td>1 GB, 1 project, never pauses</td></tr>
              <tr><td>Starter (₹799/mo)</td><td>1,000,000</td><td>20,000 / day</td><td>300 req/min</td><td>25 MB</td><td>5 GB, 5 projects</td></tr>
              <tr><td>Growth (₹3,499/mo)</td><td>5,000,000</td><td>100,000 / day</td><td>1,000 req/min</td><td>50 MB</td><td>25 GB, 15 projects</td></tr>
              <tr><td>Scale (₹9,999/mo)</td><td>20,000,000</td><td>500,000 / day</td><td>3,000 req/min</td><td>100 MB</td><td>100 GB, unlimited projects</td></tr>
            </tbody>
          </table>
          <p><strong>Batch limits:</strong> Up to 100 text chunks or 256 raw 384d vectors per request. Supported document upload formats: <code>.pdf</code>, <code>.txt</code>, <code>.md</code>.</p>
        </section>

        <section id="errors">
          <h2>5. HTTP Error Codes &amp; Retry Strategy</h2>
          <ul>
            <li><strong>200 OK:</strong> Request succeeded.</li>
            <li><strong>400 Bad Request:</strong> Missing required field or empty query string.</li>
            <li><strong>401 Unauthorized:</strong> Missing, invalid, or revoked <code>X-API-Key</code> header.</li>
            <li><strong>403 Forbidden:</strong> RBAC violation (e.g., <code>read_only</code> key attempting a write/delete operation) or plan quota exceeded.</li>
            <li><strong>404 Not Found:</strong> Target collection, point ID, or snapshot does not exist.</li>
            <li><strong>422 Unprocessable Entity:</strong> Schema or vector validation error (e.g., vector dimension != 384, <code>NaN</code>/<code>Inf</code> floats, or <code>alpha</code> outside <code>0.0..1.0</code>).</li>
            <li><strong>429 Too Many Requests:</strong> Burst rate limit or daily query quota exceeded; retry with exponential backoff.</li>
            <li><strong>500 / 503 Server Error:</strong> Transient error; retry with exponential backoff (<code>0.5s, 1.0s, 2.0s</code>).</li>
          </ul>
        </section>

        <section id="export">
          <h2>6. Data Export, Point-Level CRUD &amp; Zero Vendor Lock-In</h2>
          <p>You retain 100% ownership of your data. Export all chunks and metadata or manage individual point IDs at any time:</p>
          <ul>
            <li><strong>Export / Scroll All Documents:</strong> <code>GET https://api.icebergdb.in/documents/{collection}/scroll?limit=100&amp;offset=0</code></li>
            <li><strong>Upsert Single Point by ID:</strong> <code>PUT https://api.icebergdb.in/documents/{collection}/points/{point_id}</code></li>
            <li><strong>Get Single Point by ID:</strong> <code>GET https://api.icebergdb.in/documents/{collection}/points/{point_id}</code></li>
            <li><strong>Delete Single Point by ID:</strong> <code>DELETE https://api.icebergdb.in/documents/{collection}/points/{point_id}</code></li>
            <li><strong>Snapshot Backup &amp; Restore:</strong> <code>POST /backup/create/{collection}</code>, <code>GET /backup/list</code>, <code>POST /backup/restore/{snapshot}</code></li>
          </ul>
        </section>

        <section id="endpoints">
          <h2>7. Complete REST API Endpoint Summary</h2>
          <ul>
            <li><code>GET /health</code> &amp; <code>GET /status</code> — Live cluster health and subsystem telemetry</li>
            <li><code>POST /auth/signup</code>, <code>POST /auth/login</code>, <code>GET /auth/keys</code>, <code>POST /auth/keys</code>, <code>DELETE /auth/keys/{id}</code></li>
            <li><code>GET /collections</code>, <code>POST /collections</code>, <code>DELETE /collections/{name}</code></li>
            <li><code>POST /documents/text</code>, <code>POST /documents/upload</code>, <code>PUT/GET/DELETE /documents/{collection}/points/{point_id}</code>, <code>GET /documents/{collection}/scroll</code></li>
            <li><code>POST /search</code> — <code>{"collection":"docs","query":"...","top_k":5,"search_type":"hybrid","alpha":0.5}</code></li>
            <li><code>POST /memory/{agent_id}/remember</code> &amp; <code>POST /memory/{agent_id}/recall</code> — 4-Tier Cognitive Agent Memory (<code>short_term</code>, <code>episodic</code>, <code>long_term</code>, <code>semantic</code>)</li>
          </ul>
        </section>
      </main>
    `,
  },
  {
    route: '/benchmarks',
    title: 'Reproducible Vector & Hybrid RRF Benchmarks — Iceberg DB (v1.0.0)',
    description:
      'Reproducible benchmark report for Iceberg DB v1.0.0: 1.95ms p50 dense 384d Cosine vector lookup, 6.93ms p50 Okapi BM25 lexical scoring, 8.73ms p50 Hybrid RRF search, 48.2ms min server-side ONNX CPU embedding, and Recall@10 evaluation.',
    bodyHtml: `
      <main style="background:#0a0a0a;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB v1.0.0 — Reproducible Engineering Benchmarks</h1>
        <p>Transparent stage-by-stage breakdown separating internal engine search latency (<code>1.95 ms</code> dense p50 / <code>8.73 ms</code> hybrid RRF p50), server-side ONNX CPU embedding time (<code>48.25 ms</code> min), and client-to-India (<code>ap-south-1</code>) network round-trip time.</p>

        <section>
          <h2>1. Stage-by-Stage Pipeline Latency Breakdown (120-Document Evaluation Corpus, 384-dim Cosine)</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Pipeline Stage</th><th>Min</th><th>Median (p50)</th><th>p95</th><th>Notes</th></tr>
            </thead>
            <tbody>
              <tr><td>1. Pure Dense Vector Lookup (384d Cosine HNSW)</td><td>1.42 ms</td><td><strong>1.95 ms</strong></td><td>3.80 ms</td><td>Pre-computed 384d vector query against HNSW graph</td></tr>
              <tr><td>2. Sparse BM25 Keyword Scoring (k1=1.5, b=0.75)</td><td>4.85 ms</td><td><strong>6.93 ms</strong></td><td>11.20 ms</td><td>Lexical term-frequency scoring across collection</td></tr>
              <tr><td>3. Hybrid RRF Search (Dense + BM25, alpha=0.5)</td><td>6.40 ms</td><td><strong>8.73 ms</strong></td><td>13.39 ms</td><td>Reciprocal Rank Fusion (k=60) + normalized score blend</td></tr>
              <tr><td>4. Server-Side CPU Query Embedding (ONNX all-MiniLM-L6-v2)</td><td>48.25 ms</td><td><strong>112.34 ms</strong></td><td>145.10 ms</td><td>Eliminates external OpenAI embedding API cost ($0)</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>2. Retrieval Quality Evaluation (40 Ground-Truth Queries: Conceptual + Exact IDs)</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Retrieval Mode</th><th>Recall@5</th><th>Recall@10</th><th>Strengths</th></tr>
            </thead>
            <tbody>
              <tr><td>Pure Dense Vector (384d Cosine)</td><td>90.0%</td><td>95.0%</td><td>Strong on paraphrases; can miss exact invoice/SKU codes</td></tr>
              <tr><td>Pure Keyword (Okapi BM25)</td><td>85.0%</td><td>90.0%</td><td>Exact alphanumeric IDs; misses semantic synonyms</td></tr>
              <tr><td><strong>Iceberg Hybrid RRF (Dense + BM25, alpha=0.5)</strong></td><td><strong>97.5%</strong></td><td><strong>100.0%</strong></td><td>Captures both semantic concepts and exact identifiers on the 120-doc evaluation corpus</td></tr>
            </tbody>
          </table>
        </section>

        <section id="reproduce">
          <h2>3. Reproducible Python Benchmark Script (pip install icebergdb)</h2>
          <pre><code>import time, statistics
from iceberg import Client

client = Client(api_key="ib_your_key")
client.create_collection("bench_test")
client.index_text("bench_test", "Iceberg HNSW engine delivers fast hybrid RRF vector search hosted in India (ap-south-1).", source="bench")

latencies = []
for _ in range(30):
    t0 = time.perf_counter()
    results = client.search("bench_test", "India vector search latency", top_k=5, search_type="hybrid")
    latencies.append((time.perf_counter() - t0) * 1000)

latencies.sort()
print(f"min={latencies[0]:.1f}ms p50={statistics.median(latencies):.1f}ms p95={latencies[int(len(latencies)*0.95)]:.1f}ms")</code></pre>
        </section>
      </main>
    `,
  },
  {
    route: '/security',
    title: 'Security, RBAC & DPDP Act 2023 Data Residency — Iceberg DB (v1.0.0)',
    description:
      'Iceberg DB security architecture: 100% India data residency (ap-south-1) for DPDP Act 2023 compliance, SHA-256 API key hashing, strict Role-Based Access Control (admin, read_write, read_only), multi-tenant namespace isolation, TLS 1.3, and BYOC VPC deployment.',
    bodyHtml: `
      <main style="background:#0a0a0a;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB Security, RBAC &amp; India Data Residency (v1.0.0)</h1>
        <p>Engineered for Indian regulatory compliance from day one — hosted in India (<code>ap-south-1</code>) with cryptographic key hashing, granular Role-Based Access Control, and strict multi-tenant namespace isolation.</p>

        <section>
          <h2>1. Data Localization &amp; Regulatory Alignment</h2>
          <ul>
            <li><strong>DPDP Act 2023 Alignment:</strong> All vectors, document chunks, embeddings, and agent memories remain in India (<code>ap-south-1</code>) with instant point/collection deletion and full JSON data export.</li>
            <li><strong>No Cross-Border Embedding Leakage:</strong> Built-in server-side ONNX CPU embeddings (<code>all-MiniLM-L6-v2</code>) run domestically in India so sensitive customer text never has to be sent to US-hosted embedding APIs.</li>
            <li><strong>BYOC VPC Deployment (RBI / BFSI):</strong> Deploy inside your own AWS, GCP, or Azure India VPC using our Docker and Terraform BYOC templates.</li>
          </ul>
        </section>

        <section>
          <h2>2. Role-Based Access Control (RBAC)</h2>
          <ul>
            <li><strong>admin:</strong> Full access to collections, document indexing/deletion, search, API key management, and snapshot backups.</li>
            <li><strong>read_write:</strong> Index/update/delete documents, manage agent memories, and execute searches. Cannot create or revoke API keys.</li>
            <li><strong>read_only:</strong> Search and recall only. Any write, index, or delete request using a <code>read_only</code> key is blocked with <strong>HTTP 403 Forbidden</strong>.</li>
          </ul>
        </section>

        <section>
          <h2>3. Defense-in-Depth Infrastructure</h2>
          <ul>
            <li><strong>SHA-256 Cryptographic Key Hashing:</strong> API keys (<code>ib_...</code>) are hashed using SHA-256 at rest; plaintext keys are never stored.</li>
            <li><strong>Multi-Tenant Storage Isolation:</strong> Deterministic namespace prefixes (<code>t_{uid8}__</code> and <code>u_{uid8}__</code>) isolate every tenant’s collections at the storage layer.</li>
            <li><strong>Encryption in Transit &amp; at Rest:</strong> HTTPS/TLS 1.3 for all API traffic and AES-256 volume encryption at rest.</li>
            <li><strong>Zero Customer Data Training:</strong> Customer vectors, queries, and memories are never used to train external AI models.</li>
          </ul>
          <p>Security &amp; Responsible Disclosure Contact: <a href="mailto:contact@icebergdb.in">contact@icebergdb.in</a></p>
        </section>
      </main>
    `,
  },
  {
    route: '/status',
    title: 'Live System Status & Telemetry — Iceberg DB (v1.0.0)',
    description:
      'Live operational status and telemetry for Iceberg DB (v1.0.0) in India (ap-south-1): 99.90% SLA target, 1.95ms dense HNSW p50, 8.73ms hybrid RRF p50, 48.2ms min ONNX CPU embedding, and real-time /health & /status probes.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB System Status — All Systems Operational (v1.0.0)</h1>
        <p>Primary Region: <strong>Hosted in India (ap-south-1)</strong> • SLA Target: <strong>99.90%</strong> • Live Health Endpoint: <a href="https://api.icebergdb.in/health">https://api.icebergdb.in/health</a> • Live Telemetry JSON: <a href="https://api.icebergdb.in/status">https://api.icebergdb.in/status</a></p>

        <section>
          <h2>Subsystem Health &amp; Measured Engine Latency</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Subsystem</th><th>Description</th><th>Measured Latency</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>Vector Search Engine (Qdrant HNSW 384d)</td><td>Pure dense cosine vector lookup (internal engine p50)</td><td>1.95 ms p50</td><td>Operational</td></tr>
              <tr><td>Hybrid RRF Search Engine (Dense + Okapi BM25)</td><td>Combined semantic vector + BM25 lexical fusion (RRF k=60)</td><td>8.73 ms p50</td><td>Operational</td></tr>
              <tr><td>Built-in CPU Embeddings (ONNX all-MiniLM-L6-v2)</td><td>Server-side 384d CPU embedding generation in India (ap-south-1)</td><td>48.2 ms min</td><td>Operational</td></tr>
              <tr><td>4-Tier Cognitive Agent Memory API</td><td>Short-term (1h), episodic (30d), long-term &amp; semantic recall</td><td>Operational</td><td>Operational</td></tr>
              <tr><td>Authentication, SHA-256 Keys &amp; RBAC</td><td>JWT session auth and admin / read_write / read_only key validation</td><td>1.2 ms</td><td>Operational</td></tr>
              <tr><td>Developer Console &amp; Dashboard</td><td>dashboard.icebergdb.in management interface &amp; Playground</td><td>Operational</td><td>Operational</td></tr>
            </tbody>
          </table>
        </section>
      </main>
    `,
  },
  {
    route: '/about',
    title: 'About Iceberg DB, Founder & Engineering Transparency — Iceberg DB (v1.0.0)',
    description:
      'About Iceberg Database Technologies: Founded by Ankush (@anku5265) in India to solve cross-border vector search latency and DPDP Act 2023 data localization with open-source v1.0.0 SDKs, honest benchmarks, and zero vendor lock-in.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>About Iceberg Database Technologies &amp; Engineering Transparency</h1>
        <p>Iceberg DB (<code>https://icebergdb.in</code>) is an independent AI infrastructure company based in Himachal Pradesh, India, building domestic cloud vector search, hybrid RAG, and 4-tier cognitive agent memory hosted in India (<code>ap-south-1</code>).</p>

        <section>
          <h2>Founder &amp; Lead Systems Engineer</h2>
          <ul>
            <li><strong>Founder:</strong> Ankush — Systems &amp; AI Infrastructure Engineer</li>
            <li><strong>GitHub:</strong> <a href="https://github.com/anku5265/iceberg-database">github.com/anku5265/iceberg-database</a></li>
            <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/ankush-a-96518a39b/">linkedin.com/in/ankush-a-96518a39b</a></li>
            <li><strong>X (Twitter):</strong> <a href="https://x.com/igankush33">x.com/igankush33</a></li>
            <li><strong>Direct Engineering &amp; Enterprise Contact:</strong> <a href="mailto:contact@icebergdb.in">contact@icebergdb.in</a></li>
          </ul>
        </section>

        <section>
          <h2>Open Architecture &amp; Zero Vendor Lock-In Guarantee</h2>
          <p>Iceberg DB is built on battle-tested foundations: FastAPI control plane, Qdrant HNSW 384d Cosine vector engine, Okapi BM25 + RRF hybrid ranker, and quantized ONNX Runtime (<code>all-MiniLM-L6-v2</code>) server-side CPU embeddings. All 6 official SDKs and the MCP server are published at version <code>1.0.0</code> across PyPI, NPM, Crates.io, NuGet, Go, and Maven. Users can export 100% of their raw chunks, metadata, and snapshots anytime via <code>GET /documents/{collection}/scroll</code> or self-host via Docker/Terraform BYOC.</p>
        </section>
      </main>
    `,
  },
  {
    route: '/contact',
    title: 'Contact, Support & Company Details — Iceberg DB (v1.0.0)',
    description:
      'Contact Iceberg Database Technologies (contact@icebergdb.in) for developer support, enterprise BYOC deployments, security inquiries, and architecture guidance.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Contact Iceberg Database Technologies</h1>
        <p>Primary Engineering, Support &amp; Enterprise Email: <a href="mailto:contact@icebergdb.in">contact@icebergdb.in</a> (Typical response time: 2–4 hours on business days).</p>
        <ul>
          <li><strong>Company:</strong> Iceberg Database Technologies (Himachal Pradesh, India • Cloud Cluster Hosted in India <code>ap-south-1</code>)</li>
          <li><strong>Founder &amp; Lead Engineer:</strong> Ankush (<a href="https://github.com/anku5265/iceberg-database">GitHub @anku5265</a>, <a href="https://www.linkedin.com/in/ankush-a-96518a39b/">LinkedIn</a>, <a href="https://x.com/igankush33">X @igankush33</a>)</li>
        </ul>
      </main>
    `,
  },
  {
    route: '/privacy',
    title: 'Privacy Policy & DPDP Act 2023 Compliance — Iceberg DB',
    description:
      'Iceberg DB Privacy Policy and DPDP Act 2023 data governance: 100% India data residency (ap-south-1), zero training on customer data, and full data deletion/export rights.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Privacy Policy &amp; DPDP Act 2023 Data Governance — Iceberg DB</h1>
        <p>All customer vectors, text chunks, and agent memories are hosted in India (<code>ap-south-1</code>), encrypted in transit (TLS 1.3) and at rest (AES-256), and are never used to train external AI models. Users may export or permanently delete their collections and account data at any time. Contact Data Protection Officer: <a href="mailto:contact@icebergdb.in">contact@icebergdb.in</a>.</p>
      </main>
    `,
  },
  {
    route: '/terms',
    title: 'Terms of Service & SLA — Iceberg DB',
    description:
      'Terms of Service, acceptable use, data ownership (100% customer-owned), and billing terms for Iceberg DB cloud vector database.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Terms of Service — Iceberg Database Technologies</h1>
        <p>Customers retain 100% ownership and intellectual property rights over all documents, embeddings, and memories indexed in Iceberg DB. Free tier workspaces include 100,000 vectors with zero automatic pausing. Contact: <a href="mailto:contact@icebergdb.in">contact@icebergdb.in</a>.</p>
      </main>
    `,
  },
  {
    route: '/integrations',
    title: 'Integrations: Claude Code MCP, Cursor, LangChain & LlamaIndex — Iceberg DB (v1.0.0)',
    description:
      'Connect Iceberg DB v1.0.0 with Claude Code, Cursor, Windsurf, GitHub Copilot, Gemini CLI via npx -y iceberg-mcp, or integrate with LangChain, LlamaIndex, and FastAPI.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB Integrations — MCP Server, LangChain, LlamaIndex &amp; REST</h1>
        <p>Connect Iceberg DB to Claude Code, Cursor, Windsurf, Copilot, and Gemini CLI with a single command: <code>claude mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp</code>.</p>
      </main>
    `,
  },
  {
    route: '/living-code',
    title: 'Living Code & Interactive SDK Examples — Iceberg DB (v1.0.0)',
    description:
      'Interactive multi-language code examples for Iceberg DB v1.0.0 across Python, JavaScript/TypeScript, Rust, Go, .NET, Java, and MCP.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB v1.0.0 — Multi-Language Code Examples</h1>
        <p>Production code patterns for Python (<code>pip install icebergdb</code>), TypeScript (<code>npm install icebergdb</code>), Rust (<code>cargo add icebergdb</code>), .NET (<code>dotnet add package IcebergDb</code>), Go, Java, and MCP.</p>
      </main>
    `,
  },
  {
    route: '/product/database',
    title: 'Iceberg Serverless Vector Database — Hybrid BM25 + RRF in India (v1.0.0)',
    description:
      'India-hosted serverless vector database (ap-south-1) with 1.95ms dense HNSW lookup, 8.73ms Hybrid BM25 + RRF search, and built-in 384d CPU embeddings.',
    bodyHtml: `<main style="background:#070709;color:#fff;padding:48px 24px;max-width:980px;margin:0 auto;"><h1>Iceberg Serverless Vector Database (v1.0.0)</h1><p>Hosted in India (ap-south-1) with 1.95ms p50 dense Cosine HNSW lookup, 8.73ms p50 Hybrid BM25 + RRF search, and built-in 384d ONNX CPU embeddings.</p></main>`,
  },
  {
    route: '/product/memory',
    title: 'Iceberg 4-Tier Cognitive AI Agent Memory — Short-Term, Episodic, Long-Term & Semantic',
    description:
      'Persistent 4-tier memory layer for AI agents and LLM assistants hosted in India (ap-south-1): short_term (1h TTL), episodic (30d TTL), long_term, and semantic recall.',
    bodyHtml: `<main style="background:#070709;color:#fff;padding:48px 24px;max-width:980px;margin:0 auto;"><h1>Iceberg 4-Tier Cognitive AI Agent Memory (v1.0.0)</h1><p>Give AI agents persistent memory across sessions with <code>client.remember()</code> and <code>client.recall()</code> across short_term (1h TTL), episodic (30d TTL), long_term, and semantic tiers.</p></main>`,
  },
  {
    route: '/product/assistant',
    title: 'Iceberg No-Code RAG Assistants — Website Chat Widget & WhatsApp Business',
    description:
      'Build no-code RAG chatbots backed by Iceberg hybrid search. Embed via a 1-line script tag or connect directly to WhatsApp Business.',
    bodyHtml: `<main style="background:#070709;color:#fff;padding:48px 24px;max-width:980px;margin:0 auto;"><h1>Iceberg No-Code RAG Assistants</h1><p>Upload PDFs, TXT, or Markdown files and deploy an embeddable website chat widget or WhatsApp Business RAG assistant in minutes.</p></main>`,
  },
  {
    route: '/product/byoc',
    title: 'Iceberg BYOC — Self-Host in Your Own AWS, GCP, or Azure India VPC',
    description:
      'Deploy Iceberg DB inside your own cloud VPC or on-premise Kubernetes cluster using Docker and Terraform BYOC templates for RBI and BFSI compliance.',
    bodyHtml: `<main style="background:#070709;color:#fff;padding:48px 24px;max-width:980px;margin:0 auto;"><h1>Iceberg BYOC (Bring Your Own Cloud)</h1><p>Deploy the full Iceberg DB vector, hybrid BM25+RRF, and ONNX embedding stack inside your own AWS, GCP, or Azure VPC via Docker and Terraform.</p></main>`,
  },
  {
    route: '/product/sdk',
    title: 'Official Iceberg DB SDKs (v1.0.0) — Python, JS/TS, Rust, Go, .NET, Java & MCP',
    description:
      'Unified v1.0.0 SDKs for Iceberg DB across Python (PyPI), JavaScript/TypeScript (NPM), Rust (Crates.io), .NET (NuGet), Go, Java (Maven), and MCP.',
    bodyHtml: `<main style="background:#070709;color:#fff;padding:48px 24px;max-width:980px;margin:0 auto;"><h1>Official Iceberg DB SDKs &amp; MCP Server (v1.0.0)</h1><p>Install via <code>pip install icebergdb</code>, <code>npm install icebergdb</code>, <code>cargo add icebergdb</code>, <code>dotnet add package IcebergDb</code>, or <code>npx -y iceberg-mcp</code>.</p></main>`,
  },
  {
    route: '/product/dashboard',
    title: 'Iceberg Cloud Console & Interactive Playground — dashboard.icebergdb.in',
    description:
      'Manage vector collections, test hybrid RRF vs semantic vs keyword search live in the Playground, inspect agent memories, and manage RBAC API keys.',
    bodyHtml: `<main style="background:#070709;color:#fff;padding:48px 24px;max-width:980px;margin:0 auto;"><h1>Iceberg Cloud Console (dashboard.icebergdb.in)</h1><p>Manage collections, upload PDFs, test hybrid RRF search, inspect 4-tier agent memory, and generate scoped RBAC API keys.</p></main>`,
  },
  {
    route: '/product/backup',
    title: 'Point-in-Time Snapshot Backups & Zero Lock-In Data Export — Iceberg DB',
    description:
      'Create one-click collection snapshots, restore point-in-time backups, and export 100% of your vectors and document payloads via JSON scroll.',
    bodyHtml: `<main style="background:#070709;color:#fff;padding:48px 24px;max-width:980px;margin:0 auto;"><h1>Snapshot Backups &amp; Zero Lock-In Data Export</h1><p>Create collection snapshots via <code>POST /backup/create/{collection}</code> or export all documents and metadata via <code>GET /documents/{collection}/scroll</code>.</p></main>`,
  },
  {
    route: '/product/namespaces',
    title: 'Multi-Tenant Namespace Isolation — Iceberg DB (v1.0.0)',
    description:
      'Deterministic server-side namespace isolation (t_{uid8}__ and u_{uid8}__) and project scoping for multi-tenant SaaS RAG applications.',
    bodyHtml: `<main style="background:#070709;color:#fff;padding:48px 24px;max-width:980px;margin:0 auto;"><h1>Multi-Tenant Namespace Isolation</h1><p>Isolate customer vectors and agent memories deterministically at the storage engine layer with zero cross-tenant leakage.</p></main>`,
  },
]

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

for (const item of ROUTES) {
  const canonicalUrl = item.route === '/' ? 'https://icebergdb.in/' : `https://icebergdb.in${item.route}`
  let html = baseHtml

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${item.title}</title>`)

  // Replace canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  )

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(item.description)}" />`
  )

  // Replace OpenGraph & Twitter meta tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  )
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeAttr(item.title)}" />`
  )
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeAttr(item.description)}" />`
  )
  html = html.replace(
    /<meta name="twitter:url" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:url" content="${canonicalUrl}" />`
  )
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeAttr(item.title)}" />`
  )
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeAttr(item.description)}" />`
  )

  // Inject pre-rendered semantic HTML inside <div id="root">...</div> so non-JS crawlers (Grok, ChatGPT, Perplexity, Googlebot)
  // read the full page content directly, while React createRoot().render() replaces #root seamlessly in browsers.
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${item.bodyHtml.trim()}</div>`
  )

  // Also update <noscript> to match the route's specific content
  html = html.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript>${item.bodyHtml.trim()}</noscript>`
  )

  if (item.route === '/') {
    fs.writeFileSync(baseHtmlPath, html, 'utf-8')
  } else {
    const cleanRel = item.route.replace(/^\//, '')
    const routeDir = path.join(distDir, cleanRel)
    fs.mkdirSync(routeDir, { recursive: true })
    fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf-8')
    fs.writeFileSync(path.join(distDir, `${cleanRel}.html`), html, 'utf-8')
  }
}

console.log(`[prerender-routes] Successfully generated static HTML for ${ROUTES.length} routes.`)
