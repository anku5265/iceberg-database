import fs from 'node:fs'
import path from 'node:path'
import { ALL_INTEGRATIONS, INTEGRATION_CATEGORIES } from '../src/data/integrationsInfraModelsObs.js'

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
    title: 'Iceberg — Vector Database & Memory Infrastructure for AI',
    description:
      'Serverless vector database hosted in India (ap-south-1). Built-in embeddings, hybrid vector + keyword search, and persistent memory for AI agents and RAG apps.',
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

        <section id="canonical-sdk-registry">
          <h2>Canonical Official Package Registry Table (v1.0.0 — Clean Environment Verified)</h2>
          <p><strong>Official Package Disambiguation Notice (v1.0.0):</strong> Always install the single official <code>v1.0.0</code> packages listed below: <code>icebergdb</code> (PyPI, npm, Crates.io), <code>IcebergDb</code> (NuGet), <code>github.com/anku5265/iceberg-database/iceberg-sdk-go</code> (Go), <code>io.icebergdb:iceberg-sdk:1.0.0</code> (Maven), and <code>iceberg-mcp</code> (MCP Server). Legacy pre-release beta package names (<code>iceberg-db</code>, <code>iceberg-js-sdk</code>, <code>iceberg-Vector-db</code>, <code>Iceberg.VectorDB</code>) are permanently deprecated and retired.</p>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr>
                <th>Language &amp; Runtime</th>
                <th>Official Package</th>
                <th>Tested Version</th>
                <th>Standard Install Command</th>
                <th>Version-Pinned Install</th>
                <th>Official Registry</th>
                <th>Deprecated Legacy Beta Names (Do Not Use)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Python</strong> (Python 3.9+)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>pip install icebergdb</code></td>
                <td><code>pip install icebergdb==1.0.0</code></td>
                <td><a href="https://pypi.org/project/icebergdb/">PyPI</a></td>
                <td><del>iceberg-db</del>, <del>iceberg-python</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>JavaScript / TypeScript</strong> (Node 18+, Next.js, Deno, Bun)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>npm install icebergdb</code></td>
                <td><code>npm install icebergdb@1.0.0</code></td>
                <td><a href="https://www.npmjs.com/package/icebergdb">npm</a></td>
                <td><del>iceberg-js-sdk</del>, <del>iceberg-db</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Rust</strong> (Rust 1.75+ / Tokio 1.x)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>cargo add icebergdb</code></td>
                <td><code>cargo add icebergdb@1.0.0</code></td>
                <td><a href="https://crates.io/crates/icebergdb">Crates.io</a></td>
                <td><del>iceberg-Vector-db</del>, <del>iceberg-rs</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>.NET / C#</strong> (.NET 8.0+ / C# 12)</td>
                <td><code>IcebergDb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>dotnet add package IcebergDb</code></td>
                <td><code>dotnet add package IcebergDb --version 1.0.0</code></td>
                <td><a href="https://www.nuget.org/packages/IcebergDb">NuGet</a></td>
                <td><del>Iceberg.VectorDB</del>, <del>Iceberg.Net</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Go</strong> (Go 1.21+)</td>
                <td><code>github.com/anku5265/iceberg-database/iceberg-sdk-go</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go</code></td>
                <td><code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go@v1.0.0</code></td>
                <td><a href="https://pkg.go.dev/github.com/anku5265/iceberg-database/iceberg-sdk-go">pkg.go.dev</a></td>
                <td><del>iceberg-go</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Java</strong> (Java 17+ / Spring Boot 3.x)</td>
                <td><code>io.icebergdb:iceberg-sdk:1.0.0</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>io.icebergdb:iceberg-sdk:1.0.0</code></td>
                <td><code>&lt;version&gt;1.0.0&lt;/version&gt;</code></td>
                <td><a href="https://github.com/anku5265/iceberg-database/tree/main/iceberg-sdk-java">Maven</a></td>
                <td><del>in.icebergdb:iceberg-sdk-java</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>MCP Server</strong> (Claude Code, Cursor, Windsurf, Copilot)</td>
                <td><code>iceberg-mcp</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>npx -y iceberg-mcp</code></td>
                <td><code>npx -y iceberg-mcp@1.0.0</code></td>
                <td><a href="https://www.npmjs.com/package/iceberg-mcp">npm</a></td>
                <td><del>iceberg-mcp-server</del> (Deprecated)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>Transparent INR &amp; USD Pricing (v1.0.0)</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Plan</th><th>Monthly (INR / USD)</th><th>Annual (2 Mo Free)</th><th>Max Vectors (384d)</th><th>Daily Queries</th><th>Burst Rate Limit</th><th>Storage &amp; Projects</th><th>Max Upload</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Free</strong></td><td>₹0 ($0) forever</td><td>₹0 / yr</td><td>100,000</td><td>1,000 / day</td><td>60 req/min</td><td>1 GB, 1 project, never pauses</td><td>10 MB</td></tr>
              <tr><td><strong>Starter</strong></td><td>₹799 / mo ($10)</td><td>₹7,990 / yr ($100)</td><td>1,000,000</td><td>20,000 / day</td><td>300 req/min</td><td>5 GB, 5 projects, email support</td><td>25 MB</td></tr>
              <tr><td><strong>Growth</strong></td><td>₹3,499 / mo ($42)</td><td>₹34,990 / yr ($420)</td><td>5,000,000</td><td>100,000 / day</td><td>1,000 req/min</td><td>25 GB, 15 projects, priority support</td><td>50 MB</td></tr>
              <tr><td><strong>Scale</strong></td><td>₹14,999 / mo ($179)</td><td>₹1,49,990 / yr ($1,790)</td><td>20,000,000</td><td>500,000 / day</td><td>3,000 req/min</td><td>100 GB, unlimited projects, dedicated support &amp; 99.90% SLA</td><td>100 MB</td></tr>
            </tbody>
          </table>
          <p><strong>Pay-As-You-Grow Overage:</strong> ₹100 per 100K extra vectors and ₹50 per 50K extra queries.</p>
        </section>
      </main>
    `,
  },
  {
    route: '/pricing',
    title: 'Pricing, Plan Quotas & Billing Unit Definitions (INR & USD) — Iceberg DB (v1.0.0)',
    description:
      'Transparent INR and USD pricing for Iceberg DB v1.0.0: Free (₹0 / $0, 100K vectors), Starter (₹799/mo / $10, 1M vectors), Growth (₹3,499/mo / $42, 5M vectors), and Scale (₹14,999/mo / $179, 20M vectors). Includes ₹0 built-in 384d CPU embeddings and zero data deletion on quota limit.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB v1.0.0 — Canonical Pricing, Plan Quotas &amp; Billing Unit Definitions (INR &amp; USD)</h1>
        <p>Start free with 100,000 vectors (384d), built-in server-side ONNX CPU embeddings, and zero cluster pausing. Hosted in India (<code>ap-south-1</code>).</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
          <thead>
            <tr><th>Plan</th><th>Monthly (INR / USD)</th><th>Annual (2 Mo Free)</th><th>Max Vectors (384d)</th><th>Daily Queries</th><th>Burst Rate Limit</th><th>Storage &amp; Projects</th><th>Max Upload</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Free</strong></td><td>₹0 ($0) forever</td><td>₹0 / yr</td><td>100,000</td><td>1,000 / day</td><td>60 req/min</td><td>1 GB, 1 project, never pauses</td><td>10 MB</td></tr>
            <tr><td><strong>Starter</strong></td><td>₹799 / mo ($10)</td><td>₹7,990 / yr ($100)</td><td>1,000,000</td><td>20,000 / day</td><td>300 req/min</td><td>5 GB, 5 projects, email support</td><td>25 MB</td></tr>
            <tr><td><strong>Growth</strong></td><td>₹3,499 / mo ($42)</td><td>₹34,990 / yr ($420)</td><td>5,000,000</td><td>100,000 / day</td><td>1,000 req/min</td><td>25 GB, 15 projects, priority support</td><td>50 MB</td></tr>
            <tr><td><strong>Scale</strong></td><td>₹14,999 / mo ($179)</td><td>₹1,49,990 / yr ($1,790)</td><td>20,000,000</td><td>500,000 / day</td><td>3,000 req/min</td><td>100 GB, unlimited projects, dedicated support &amp; 99.90% SLA</td><td>100 MB</td></tr>
          </tbody>
        </table>
        <p><strong>Pay-As-You-Grow Overage (Zero Downtime):</strong> Extra capacity is billed transparently at ₹100 per 100K extra vectors and ₹50 per 50K extra queries.</p>

        <section id="billing-unit-definitions">
          <h2>Billing Unit Definitions, Metering Rules &amp; Quota Protection (v1.0.0)</h2>
          <ul>
            <li><strong>1 Vector Definition:</strong> 1 indexed chunk (<code>POST /documents/text</code>, PDF chunk, or <code>POST /memory/remember</code>) = one 384-dim float32 HNSW vector (1.5 KB) + Okapi BM25 inverted index entry + up to 4 KB JSON metadata payload. Deleting points or collections immediately frees vector quota.</li>
            <li><strong>1 Query Definition:</strong> 1 call to <code>POST /search</code> (semantic, keyword, or hybrid RRF) or <code>POST /memory/{agent_id}/recall</code> regardless of <code>top_k</code>. Control-plane calls (<code>GET /health</code>, <code>GET /status</code>, <code>GET /collections</code>) are 100% free and never consume query quota.</li>
            <li><strong>Built-in CPU Embeddings Cost (₹0 / $0):</strong> Server-side <code>all-MiniLM-L6-v2</code> (384d Cosine) ONNX CPU embedding generation is included at ₹0 ($0) extra cost on all plans — zero per-token embedding charges.</li>
            <li><strong>Quota Exhaustion Protection (Zero Data Deletion):</strong> Indexed data is never deleted or paused when you reach a plan limit. Free tier workspaces at 100,000 vectors remain 100% searchable while new writes return HTTP 403 Quota Exceeded until old vectors are deleted or the plan is upgraded.</li>
          </ul>
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
          <h2>4. Canonical Plan Pricing, Rate Limits &amp; Scaling Specifications (v1.0.0)</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Plan</th><th>Monthly (INR / USD)</th><th>Annual (2 Mo Free)</th><th>Max Vectors (384d)</th><th>Daily Queries</th><th>Burst Rate Limit</th><th>Storage &amp; Projects</th><th>Max Upload</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Free</strong></td><td>₹0 ($0) forever</td><td>₹0 / yr</td><td>100,000</td><td>1,000 / day</td><td>60 req/min</td><td>1 GB, 1 project, never pauses</td><td>10 MB</td></tr>
              <tr><td><strong>Starter</strong></td><td>₹799 / mo ($10)</td><td>₹7,990 / yr ($100)</td><td>1,000,000</td><td>20,000 / day</td><td>300 req/min</td><td>5 GB, 5 projects, email support</td><td>25 MB</td></tr>
              <tr><td><strong>Growth</strong></td><td>₹3,499 / mo ($42)</td><td>₹34,990 / yr ($420)</td><td>5,000,000</td><td>100,000 / day</td><td>1,000 req/min</td><td>25 GB, 15 projects, priority support</td><td>50 MB</td></tr>
              <tr><td><strong>Scale</strong></td><td>₹14,999 / mo ($179)</td><td>₹1,49,990 / yr ($1,790)</td><td>20,000,000</td><td>500,000 / day</td><td>3,000 req/min</td><td>100 GB, unlimited projects, dedicated support &amp; 99.90% SLA</td><td>100 MB</td></tr>
            </tbody>
          </table>
          <p><strong>Pay-As-You-Grow Overage:</strong> ₹100 per 100K extra vectors and ₹50 per 50K extra queries. <strong>Batch limits:</strong> Up to 100 text chunks or 256 raw 384d vectors per request. Supported document upload formats: <code>.pdf</code>, <code>.txt</code>, <code>.md</code>.</p>
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

        <section id="canonical-sdk-registry">
          <h2>Canonical Official Package Registry Table (v1.0.0 — Clean Environment Verified)</h2>
          <p><strong>Official Package Disambiguation Notice (v1.0.0):</strong> Always install the single official <code>v1.0.0</code> packages listed below: <code>icebergdb</code> (PyPI, npm, Crates.io), <code>IcebergDb</code> (NuGet), <code>github.com/anku5265/iceberg-database/iceberg-sdk-go</code> (Go), <code>io.icebergdb:iceberg-sdk:1.0.0</code> (Maven), and <code>iceberg-mcp</code> (MCP Server). Legacy pre-release beta package names (<code>iceberg-db</code>, <code>iceberg-js-sdk</code>, <code>iceberg-Vector-db</code>, <code>Iceberg.VectorDB</code>) are permanently deprecated and retired.</p>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr>
                <th>Language &amp; Runtime</th>
                <th>Official Package</th>
                <th>Tested Version</th>
                <th>Standard Install Command</th>
                <th>Version-Pinned Install</th>
                <th>Official Registry</th>
                <th>Deprecated Legacy Beta Names (Do Not Use)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Python</strong> (Python 3.9+)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>pip install icebergdb</code></td>
                <td><code>pip install icebergdb==1.0.0</code></td>
                <td><a href="https://pypi.org/project/icebergdb/">PyPI</a></td>
                <td><del>iceberg-db</del>, <del>iceberg-python</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>JavaScript / TypeScript</strong> (Node 18+, Next.js, Deno, Bun)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>npm install icebergdb</code></td>
                <td><code>npm install icebergdb@1.0.0</code></td>
                <td><a href="https://www.npmjs.com/package/icebergdb">npm</a></td>
                <td><del>iceberg-js-sdk</del>, <del>iceberg-db</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Rust</strong> (Rust 1.75+ / Tokio 1.x)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>cargo add icebergdb</code></td>
                <td><code>cargo add icebergdb@1.0.0</code></td>
                <td><a href="https://crates.io/crates/icebergdb">Crates.io</a></td>
                <td><del>iceberg-Vector-db</del>, <del>iceberg-rs</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>.NET / C#</strong> (.NET 8.0+ / C# 12)</td>
                <td><code>IcebergDb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>dotnet add package IcebergDb</code></td>
                <td><code>dotnet add package IcebergDb --version 1.0.0</code></td>
                <td><a href="https://www.nuget.org/packages/IcebergDb">NuGet</a></td>
                <td><del>Iceberg.VectorDB</del>, <del>Iceberg.Net</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Go</strong> (Go 1.21+)</td>
                <td><code>github.com/anku5265/iceberg-database/iceberg-sdk-go</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go</code></td>
                <td><code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go@v1.0.0</code></td>
                <td><a href="https://pkg.go.dev/github.com/anku5265/iceberg-database/iceberg-sdk-go">pkg.go.dev</a></td>
                <td><del>iceberg-go</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Java</strong> (Java 17+ / Spring Boot 3.x)</td>
                <td><code>io.icebergdb:iceberg-sdk:1.0.0</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>io.icebergdb:iceberg-sdk:1.0.0</code></td>
                <td><code>&lt;version&gt;1.0.0&lt;/version&gt;</code></td>
                <td><a href="https://github.com/anku5265/iceberg-database/tree/main/iceberg-sdk-java">Maven</a></td>
                <td><del>in.icebergdb:iceberg-sdk-java</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>MCP Server</strong> (Claude Code, Cursor, Windsurf, Copilot)</td>
                <td><code>iceberg-mcp</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>npx -y iceberg-mcp</code></td>
                <td><code>npx -y iceberg-mcp@1.0.0</code></td>
                <td><a href="https://www.npmjs.com/package/iceberg-mcp">npm</a></td>
                <td><del>iceberg-mcp-server</del> (Deprecated)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="verified-sdk-examples">
          <h2>Verified Working SDK Quickstart Examples (v1.0.0)</h2>
          <h3>Python (PyPI: icebergdb v1.0.0)</h3>
          <pre><code>pip install icebergdb</code></pre>
          <pre><code>from iceberg import Client

client = Client(api_key="ib_your_key")
client.create_collection("my_docs")
client.index_text("my_docs", "Our return policy allows 30 day returns.")

results = client.search("my_docs", "can I return my order?", search_type="hybrid", top_k=5)
for r in results:
    print(f"{r.score:.3f} — {r.text}")

client.remember("agent_001", "User prefers dark mode", memory_type="long_term")
memories = client.recall("agent_001", "what does user prefer?", top_k=3)</code></pre>

          <h3>JavaScript / TypeScript (npm: icebergdb v1.0.0)</h3>
          <pre><code>npm install icebergdb</code></pre>
          <pre><code>import { Client } from 'icebergdb'

const client = new Client({ apiKey: 'ib_your_key' })
await client.createCollection('my_docs')
await client.indexText('my_docs', 'Our return policy allows 30 day returns.')
const results = await client.search('my_docs', 'return order', { topK: 5, searchType: 'hybrid', alpha: 0.5 })
results.forEach(r =&gt; console.log(r.score, r.text))</code></pre>

          <h3>Rust (Crates.io: icebergdb v1.0.0)</h3>
          <pre><code>cargo add icebergdb</code></pre>
          <pre><code>use icebergdb::Client;

#[tokio::main]
async fn main() -&gt; Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt; {
    let client = Client::new("ib_your_key");
    client.create_collection("my_docs").await?;
    client.index_text("my_docs", "Our return policy allows 30 day returns.", None).await?;
    let res = client.search("my_docs", "return order", 5).await?;
    for r in res.results {
        println!("{:.4} — {}", r.score, r.text);
    }
    Ok(())
}</code></pre>

          <h3>.NET / C# (NuGet: IcebergDb v1.0.0)</h3>
          <pre><code>dotnet add package IcebergDb --version 1.0.0</code></pre>
          <pre><code>using IcebergDb;

var client = new IcebergClient("ib_your_key");
await client.CreateCollectionAsync("my_docs");
await client.IndexTextAsync("my_docs", "Our return policy allows 30 day returns.");
var results = await client.SearchAsync("my_docs", "return order", topK: 5);
foreach (var r in results.Results)
    Console.WriteLine($"{r.Score:F4} — {r.Text}");</code></pre>

          <h3>Go (v1.0.0)</h3>
          <pre><code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go@v1.0.0</code></pre>
          <pre><code>package main

import (
    "fmt"
    iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"
)

func main() {
    client := iceberg.New("ib_your_key")
    _ = client.CreateCollection("my_docs")
    _ = client.IndexText("my_docs", "Our return policy allows 30 day returns.", "docs")
    res, _ := client.Search("my_docs", "return order", 5)
    for _, r := range res.Results {
        fmt.Printf("%.4f — %s\n", r.Score, r.Text)
    }
}</code></pre>

          <h3>Java (Maven: io.icebergdb:iceberg-sdk:1.0.0)</h3>
          <pre><code>import in.iceberg.Client;
import java.util.Map;

public class Example {
    public static void main(String[] args) throws Exception {
        Client client = new Client("ib_your_key");
        client.createCollection("my_docs");
        client.indexText("my_docs", "Our return policy allows 30 day returns.", "docs");
        Map&lt;String, Object&gt; results = client.search("my_docs", "return order", 5, "hybrid");
        System.out.println(results);
    }
}</code></pre>
        </section>
      </main>
    `,
  },
  {
    route: '/benchmarks',
    title: 'Reproducible Vector & Hybrid RRF Benchmarks — Iceberg DB (v1.0.0)',
    description:
      'Reproducible benchmark report for Iceberg DB v1.0.0: Hardware specs (4 vCPU, 16GB RAM, NVMe SSD, ap-south-1), 1.95ms p50 / 5.12ms p99 dense 384d Cosine lookup, 8.73ms p50 / 17.85ms p99 Hybrid RRF search, 1K/10K/50K dataset scaling, 1/10/50 concurrent users, Recall@10, and Qdrant pipeline comparison.',
    bodyHtml: `
      <main style="background:#0a0a0a;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB v1.0.0 — Reproducible Engineering Benchmarks</h1>
        <p>Complete hardware specifications, index parameters, <code>p50 / p95 / p99</code> latency percentiles, dataset scaling (<code>1,000</code> to <code>50,000</code> 384d vectors), concurrent user load (<code>1 / 10 / 50</code> workers), <code>Recall@10</code> evaluation, and transparent Qdrant vs. Iceberg pipeline comparison. Raw JSON telemetry: <a href="/benchmark-report.json">/benchmark-report.json</a>.</p>

        <section id="hardware-specs">
          <h2>1. Hardware, Test Environment &amp; Index Configuration (v1.0.0)</h2>
          <ul>
            <li><strong>Cloud Region &amp; Jurisdiction:</strong> Hosted in India (<code>ap-south-1</code> • Mumbai)</li>
            <li><strong>Compute &amp; Memory:</strong> 4 vCPU (x86_64 AVX2 SIMD), 16 GB DDR4 RAM, NVMe SSD, Ubuntu 22.04 LTS (Linux 6.x)</li>
            <li><strong>Vector Dimensions &amp; Metric:</strong> 384-dimensional <code>float32</code>, Cosine similarity</li>
            <li><strong>HNSW Graph Parameters:</strong> Qdrant HNSW (<code>m=16</code>, <code>ef_construct=100</code>, <code>ef_search=64</code>)</li>
            <li><strong>Lexical &amp; Hybrid Fusion Parameters:</strong> Okapi BM25 (<code>k1=1.5</code>, <code>b=0.75</code>) + Reciprocal Rank Fusion (<code>RRF k=60</code>, <code>alpha=0.5</code> default)</li>
            <li><strong>Server-Side Embedding Model:</strong> Quantized ONNX Runtime (<code>all-MiniLM-L6-v2</code>, 384-dim CPU, $0 external API key cost)</li>
            <li><strong>Benchmark Methodology:</strong> 20 warm-up iterations followed by 200 to 500 measured benchmark runs per test</li>
          </ul>
        </section>

        <section id="latency-breakdown">
          <h2>2. Stage-by-Stage Pipeline Latency Percentiles (Min / p50 / p95 / p99)</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Pipeline Stage</th><th>Runs</th><th>Min</th><th>Median (p50)</th><th>p95</th><th>p99</th><th>Notes</th></tr>
            </thead>
            <tbody>
              <tr><td>1. Pure Dense Vector Lookup (384d Cosine HNSW)</td><td>200</td><td>1.42 ms</td><td><strong>1.95 ms</strong></td><td>3.80 ms</td><td><strong>5.12 ms</strong></td><td>Post-embedding 384d vector query against HNSW graph (top_k=10)</td></tr>
              <tr><td>2. Sparse BM25 Keyword Scoring (k1=1.5, b=0.75)</td><td>200</td><td>4.85 ms</td><td><strong>6.93 ms</strong></td><td>11.20 ms</td><td><strong>14.65 ms</strong></td><td>Lexical term-frequency scoring across collection</td></tr>
              <tr><td>3. Hybrid RRF Search (Dense + BM25, k=60, alpha=0.5)</td><td>200</td><td>6.40 ms</td><td><strong>8.73 ms</strong></td><td>13.39 ms</td><td><strong>17.85 ms</strong></td><td>Reciprocal Rank Fusion (k=60) + normalized score blend</td></tr>
              <tr><td>4. Server-Side CPU Query Embedding (ONNX all-MiniLM-L6-v2)</td><td>200</td><td>48.25 ms</td><td><strong>112.34 ms</strong></td><td>145.10 ms</td><td><strong>218.40 ms</strong></td><td>Eliminates external OpenAI embedding API cost ($0)</td></tr>
              <tr><td>5. Full E2E HTTPS /search (Internet RTT + CPU Embed + Hybrid RRF)</td><td>30</td><td>269.7 ms</td><td><strong>685.1 ms</strong></td><td>1023.9 ms</td><td><strong>1184.5 ms</strong></td><td>Measured over external HTTPS keep-alive</td></tr>
            </tbody>
          </table>
        </section>

        <section id="dataset-and-concurrency-scaling">
          <h2>3. Dataset Size Scaling (1K / 10K / 50K Vectors) &amp; Concurrent User Load (1 / 10 / 50 Workers)</h2>
          <h3>3A. Dataset Scaling &amp; Memory Quantization (384-dim Cosine, top_k=10, 200 Runs)</h3>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Dataset Size</th><th>Index / Quantization Mode</th><th>Runs</th><th>Min</th><th>p50</th><th>p95</th><th>p99</th><th>RAM Used</th><th>Recall@10</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>1,000 vectors</strong></td><td>Float32 (384d Cosine)</td><td>200</td><td>0.84 ms</td><td><strong>1.20 ms</strong></td><td>6.98 ms</td><td>16.85 ms</td><td>1.46 MB</td><td>100.0%</td></tr>
              <tr><td><strong>10,000 vectors</strong></td><td>Float32 (384d Cosine)</td><td>200</td><td>1.95 ms</td><td><strong>2.53 ms</strong></td><td>6.11 ms</td><td>8.88 ms</td><td>14.65 MB</td><td>100.0%</td></tr>
              <tr><td><strong>50,000 vectors</strong></td><td>Float32 (384d Cosine)</td><td>200</td><td>3.56 ms</td><td><strong>4.24 ms</strong></td><td>5.97 ms</td><td>8.53 ms</td><td>73.24 MB</td><td>100.0%</td></tr>
              <tr><td><strong>10,000 vectors</strong></td><td>Int8 SQ8 (4x RAM Compression)</td><td>200</td><td>28.40 ms</td><td><strong>36.82 ms</strong></td><td>54.77 ms</td><td>77.05 ms</td><td>3.66 MB</td><td>98.4%</td></tr>
              <tr><td><strong>10,000 vectors</strong></td><td>Binary BQ (32x RAM Compression)</td><td>200</td><td>10.12 ms</td><td><strong>13.55 ms</strong></td><td>22.50 ms</td><td>30.99 ms</td><td>0.46 MB</td><td>100.0% (4x oversample)</td></tr>
            </tbody>
          </table>

          <h3>3B. Concurrent User Load (1, 10, and 50 Concurrent Workers — 500 Total Queries on 10,000 Vectors)</h3>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Concurrent Users</th><th>Dataset Size</th><th>Total Queries</th><th>Min</th><th>Median (p50)</th><th>p95</th><th>p99</th><th>Throughput</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>1 Concurrent User (Sequential)</strong></td><td>10,000 vectors (384d)</td><td>500</td><td>1.59 ms</td><td><strong>1.99 ms</strong></td><td>2.92 ms</td><td>11.42 ms</td><td>149 QPS</td></tr>
              <tr><td><strong>10 Concurrent Users (Parallel Workers)</strong></td><td>10,000 vectors (384d)</td><td>500</td><td>2.96 ms</td><td><strong>14.16 ms</strong></td><td>29.56 ms</td><td>42.21 ms</td><td>470 QPS</td></tr>
              <tr><td><strong>50 Concurrent Users (High Burst Load)</strong></td><td>10,000 vectors (384d)</td><td>500</td><td>3.43 ms</td><td><strong>37.88 ms</strong></td><td>81.25 ms</td><td>105.64 ms</td><td>565 QPS</td></tr>
            </tbody>
          </table>
        </section>

        <section id="retrieval-accuracy">
          <h2>4. Retrieval Quality Evaluation (120-Document Corpus, 40 Ground-Truth Queries: Conceptual + Exact IDs)</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Retrieval Mode</th><th>Recall@1</th><th>Recall@5</th><th>Recall@10</th><th>MRR@10</th><th>Engine p50</th><th>Engine p99</th></tr>
            </thead>
            <tbody>
              <tr><td>Pure Dense Vector (384d Cosine, alpha=1.0)</td><td>32.5%</td><td>90.0%</td><td>95.0%</td><td>0.502</td><td>1.95 ms</td><td>5.12 ms</td></tr>
              <tr><td>Pure Keyword (Okapi BM25, alpha=0.0)</td><td>30.0%</td><td>85.0%</td><td>90.0%</td><td>0.525</td><td>6.93 ms</td><td>14.65 ms</td></tr>
              <tr><td><strong>Iceberg Hybrid RRF (Dense + BM25, alpha=0.5, k=60)</strong></td><td><strong>47.5%</strong></td><td><strong>97.5%</strong></td><td><strong>100.0%</strong></td><td><strong>0.677</strong></td><td><strong>8.73 ms</strong></td><td><strong>17.85 ms</strong></td></tr>
            </tbody>
          </table>
        </section>

        <section id="architecture-comparison">
          <h2>5. Transparent Architecture Comparison: Underlying Qdrant HNSW vs. Complete Unified Pipeline</h2>
          <p><strong>Engineering Honesty Note:</strong> Iceberg DB uses <strong>Qdrant HNSW</strong> (<code>384d</code> Cosine, <code>m=16, ef_construct=100</code>) as its underlying cloud vector index alongside our vectorized <code>IcebergCore</code> SIMD/SQ8/BQ engine. We do <strong>not</strong> claim our HNSW graph lookup is "28.3x faster than Qdrant's Rust HNSW binary" (that legacy ratio came from comparing vectorized C/NumPy search <code>3.92 ms</code> against <code>QdrantClient(":memory:")</code> pure-Python local emulation <code>111.20 ms</code>, and has been removed). Instead, Iceberg eliminates external US OpenAI embedding round-trips (~180–280 ms + per-token billing) by executing <strong>server-side ONNX CPU embeddings + Qdrant HNSW + Okapi BM25 + RRF fusion + 4-Tier Memory</strong> inside a single India (<code>ap-south-1</code>) pipeline.</p>
        </section>

        <section id="reproduce">
          <h2>6. Reproducible Python Benchmark Script (pip install icebergdb==1.0.0)</h2>
          <pre><code>import time, statistics
from concurrent.futures import ThreadPoolExecutor
from iceberg import Client

client = Client(api_key="ib_your_key")
client.create_collection("bench_test")
client.index_text("bench_test", "Iceberg HNSW engine delivers fast hybrid RRF vector search hosted in India (ap-south-1) for DPDP compliance.", source="bench")

latencies = []
for _ in range(30):
    t0 = time.perf_counter()
    results = client.search("bench_test", "India vector search latency", top_k=5, search_type="hybrid")
    latencies.append((time.perf_counter() - t0) * 1000)

latencies.sort()
print(f"Sequential (30 runs) -> min={latencies[0]:.1f}ms p50={statistics.median(latencies):.1f}ms p95={latencies[int(len(latencies)*0.95)]:.1f}ms p99={latencies[int(len(latencies)*0.99)]:.1f}ms")</code></pre>
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
    title: 'Live System Status, Uptime History & 99.90% SLA Telemetry — Iceberg DB (v1.0.0)',
    description:
      'Live operational status and telemetry for Iceberg DB (v1.0.0) in India (ap-south-1): API Gateway availability, Query API health (1.95ms dense / 8.73ms hybrid), Write/Indexing API health (4.80ms p50), ONNX Embedding service health, Dashboard health, 90-day monthly uptime breakdown (99.96%), scheduled maintenance window, incident history, and 99.90% SLA terms.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB System Status — All Systems Operational (v1.0.0)</h1>
        <p><strong>Primary Region:</strong> Hosted in India (<code>ap-south-1</code> Mumbai) • <strong>90-Day Actual Uptime:</strong> 99.96% (SLA Target: 99.90%) • <strong>Last Updated Timestamp:</strong> 2026-11-06 14:45:00 IST (UTC+05:30, automated 60-second probe interval) • <strong>Live Endpoints:</strong> <a href="https://api.icebergdb.in/health">GET https://api.icebergdb.in/health</a> &amp; <a href="https://api.icebergdb.in/status">GET https://api.icebergdb.in/status</a></p>

        <section id="subsystem-health">
          <h2>1. Granular Subsystem Health (API Gateway, Query API, Write/Indexing API, Embedding &amp; Dashboard)</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Category</th><th>Subsystem</th><th>Monitored Endpoint / Scope</th><th>Measured Latency</th><th>90-Day Uptime</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>1. API Gateway Availability</td><td>Primary REST API Gateway (<code>api.icebergdb.in</code>)</td><td><code>GET /health</code>, <code>GET /status</code> (TLS 1.3 &amp; rate-limiter)</td><td>1.40 ms gateway overhead</td><td>99.98%</td><td>Operational</td></tr>
              <tr><td>2. Query API Health (Read)</td><td>Dense Vector Search Engine (Qdrant HNSW 384d)</td><td><code>POST /search</code> (<code>search_type="semantic"</code>, Cosine 384d)</td><td>1.95 ms p50 • 6.11 ms p95</td><td>99.98%</td><td>Operational</td></tr>
              <tr><td>2. Query API Health (Hybrid)</td><td>Hybrid BM25 + RRF Search Engine</td><td><code>POST /search</code> (<code>search_type="hybrid"</code>, RRF k=60)</td><td>8.73 ms p50 • 19.40 ms p95</td><td>99.97%</td><td>Operational</td></tr>
              <tr><td>3. Write &amp; Indexing Health</td><td>Document Indexing, Upsert &amp; Point CRUD Pipeline</td><td><code>POST /documents/text</code>, <code>POST /documents/upload</code>, <code>PUT/DELETE /points/{id}</code></td><td>4.80 ms commit p50</td><td>99.96%</td><td>Operational</td></tr>
              <tr><td>4. Embedding Service Health</td><td>Built-in ONNX CPU Embeddings (<code>all-MiniLM-L6-v2</code>)</td><td>Server-side 384d float32 CPU inference in <code>ap-south-1</code> ($0 external API key)</td><td>48.2 ms min • 112.3 ms p50</td><td>99.98%</td><td>Operational</td></tr>
              <tr><td>5. Agent Memory API Health</td><td>4-Tier Cognitive Agent Memory &amp; Decay Engine</td><td><code>POST /memory/{id}/remember</code>, <code>POST /memory/{id}/recall</code>, <code>/memory/decay</code></td><td>8.90 ms recall p50</td><td>99.98%</td><td>Operational</td></tr>
              <tr><td>6. Dashboard &amp; Control Plane</td><td>Developer Console, Playground &amp; RBAC Auth</td><td><code>https://dashboard.icebergdb.in</code>, <code>POST /auth/*</code>, SHA-256 API keys</td><td>1.20 ms auth check</td><td>99.99%</td><td>Operational</td></tr>
              <tr><td>7. Backups &amp; Data Export</td><td>Point-in-Time Snapshots, Scroll Export &amp; Billing</td><td><code>POST /backup/*</code>, <code>GET /documents/{col}/scroll</code>, Razorpay webhooks</td><td>Operational</td><td>100.00%</td><td>Operational</td></tr>
            </tbody>
          </table>
        </section>

        <section id="historical-uptime">
          <h2>2. Historical Uptime (90-Day &amp; Monthly Subsystem Breakdown)</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Time Window</th><th>API Gateway</th><th>Query API</th><th>Write / Indexing API</th><th>ONNX Embedding</th><th>Dashboard UI</th><th>Unscheduled Downtime</th><th>SLA Status</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Last 30 Days (Rolling)</strong></td><td>99.98%</td><td>99.98%</td><td>99.97%</td><td>99.99%</td><td>100.00%</td><td>0.8 min (&lt; 43.2 min SLA budget)</td><td>Met (99.90% Target)</td></tr>
              <tr><td><strong>Days 31 – 60</strong></td><td>99.95%</td><td>99.96%</td><td>99.94%</td><td>99.98%</td><td>99.99%</td><td>2.1 min (&lt; 43.2 min SLA budget)</td><td>Met (99.90% Target)</td></tr>
              <tr><td><strong>Days 61 – 90</strong></td><td>99.96%</td><td>99.97%</td><td>99.95%</td><td>99.97%</td><td>99.99%</td><td>1.7 min (&lt; 43.2 min SLA budget)</td><td>Met (99.90% Target)</td></tr>
              <tr><td><strong>90-Day Aggregate</strong></td><td><strong>99.96%</strong></td><td><strong>99.97%</strong></td><td><strong>99.95%</strong></td><td><strong>99.98%</strong></td><td><strong>99.99%</strong></td><td><strong>4.6 min total across 90 days</strong></td><td><strong>99.96% Aggregate Uptime</strong></td></tr>
            </tbody>
          </table>
        </section>

        <section id="scheduled-maintenance">
          <h2>3. Scheduled Maintenance Window &amp; Upgrade Policy</h2>
          <ul>
            <li><strong>Standard Maintenance Window:</strong> Sundays, <code>02:00 AM – 03:30 AM IST</code> (<code>20:30 – 22:00 UTC Saturday</code>), scheduled during lowest domestic traffic in India (<code>ap-south-1</code>).</li>
            <li><strong>Zero-Downtime Rolling Deployments:</strong> Control plane, FastAPI gateway, and SDK updates deploy via rolling container replacement with zero dropped search queries.</li>
            <li><strong>48-Hour Advance Notice:</strong> Any maintenance requiring a brief write-lock (&gt; 60 seconds) is published on <code>/status</code> and emailed to workspace administrators at least 48 hours in advance.</li>
            <li><strong>Next Scheduled Maintenance:</strong> Routine monthly HNSW snapshot checksum verification — Sunday 02:00 AM IST (0 minutes expected read downtime).</li>
          </ul>
        </section>

        <section id="sla-terms">
          <h2>4. 99.90% Uptime SLA Terms &amp; Measurement Methodology</h2>
          <ul>
            <li><strong>Measurement Methodology:</strong> Uptime is measured monthly across automated 60-second probes to <code>GET /health</code>, <code>POST /search</code>, and <code>POST /documents/text</code> in <code>ap-south-1</code>. A minute is counted as available when endpoints return HTTP <code>200 OK</code> within <code>5,000 ms</code>.</li>
            <li><strong>Monthly Downtime Budget:</strong> <code>99.90%</code> monthly uptime allows at most <strong>43.2 minutes</strong> of unscheduled downtime per 30-day billing cycle.</li>
            <li><strong>Covered Plans &amp; Service Credits:</strong> Paid <strong>Growth (₹3,499/mo)</strong> and <strong>Scale (₹14,999/mo)</strong> workspaces are covered by the 99.90% SLA. Monthly uptime between <code>99.00% – 99.89%</code> qualifies for a <strong>10% service credit</strong>; below <code>99.00%</code> qualifies for a <strong>25% service credit</strong> applied to the next invoice upon request to <a href="mailto:contact@icebergdb.in">contact@icebergdb.in</a> within 15 days.</li>
            <li><strong>Free &amp; Starter Plans:</strong> Hosted on the exact same <code>ap-south-1</code> production cluster with the same 99.90% engineering target on a best-effort basis without financial SLA credits.</li>
            <li><strong>SLA Exclusions:</strong> Scheduled maintenance windows announced 48h in advance, client-side HTTP <code>401/403/422/429</code> errors, or external ISP/DNS failures outside <code>ap-south-1</code>.</li>
          </ul>
        </section>

        <section id="incident-history">
          <h2>5. Incident History &amp; 90-Day Operational Audit Log</h2>
          <ul>
            <li><strong>Nov 2026 (Current — 0 Active Incidents):</strong> All Read, Write, Embedding, Memory, and Dashboard subsystems operational in <code>ap-south-1</code>. Unscheduled downtime: <code>0 minutes</code>.</li>
            <li><strong>Scheduled Maintenance Log (Rolling Window):</strong> Routine HNSW graph compaction, WAL flush, and snapshot checksum verification completed during Sunday 02:00 AM – 02:30 AM IST window. <code>0 minutes</code> read downtime (18s brief write queueing during snapshot seal).</li>
            <li><strong>Infrastructure Upgrade Log (v1.0.0 Release):</strong> ONNX Runtime thread-pool pinning and BM25 inverted index lock optimization deployed via zero-downtime rolling container update. Stabilized write commit latency at <code>4.80 ms p50</code>.</li>
          </ul>
          <p>Verify live health anytime via terminal: <code>curl -s https://api.icebergdb.in/health</code> and <code>curl -s https://api.icebergdb.in/status</code>.</p>
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
    route: '/security',
    title: 'Security, India Data Residency (ap-south-1) & DPDP Act 2023 Governance — Iceberg DB (v1.0.0)',
    description:
      'Enterprise security and DPDP Act 2023 governance for Iceberg DB (v1.0.0): 100% India data residency (ap-south-1 Mumbai), Data Fiduciary vs. Data Processor DPA roles, Subprocessor Disclosure, End-to-End Domestic Data Flow, 30-day backup lifecycle, 72-hour breach notification SLA, SHA-256 RBAC, and zero-lock-in JSON scroll export.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Iceberg DB Security, India Data Residency (ap-south-1) &amp; DPDP Act 2023 Governance (v1.0.0)</h1>
        <p>Iceberg DB provides <strong>100% India data residency (<code>ap-south-1</code> Mumbai)</strong> with technical and organizational controls engineered to help Data Fiduciaries comply with India’s <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.</p>

        <section id="dpdp-roles">
          <h2>1. DPDP Act 2023 Roles &amp; Data Processing Agreement (DPA)</h2>
          <ul>
            <li><strong>Customer = Data Fiduciary (Section 2(i) DPDP Act 2023):</strong> You retain 100% ownership and intellectual property rights over all ingested documents, 384d vectors, JSON metadata, and agent memories, and control end-user consent and erasure instructions.</li>
            <li><strong>Iceberg DB = Data Processor (Section 2(k) &amp; Section 8(5) DPDP Act 2023):</strong> Iceberg DB processes vectors and text solely on your authenticated API instructions within India (<code>ap-south-1</code>) and never uses customer data to train foundation models.</li>
            <li><strong>Countersigned DPA &amp; BYOC VPC:</strong> Standard DPA terms are incorporated into our <a href="https://icebergdb.in/privacy">Privacy Policy</a> and <a href="https://icebergdb.in/terms">Terms of Service</a>. Regulated RBI/BFSI and healthcare enterprises can also deploy Iceberg DB inside their own AWS/GCP/Azure India VPC via <a href="https://icebergdb.in/product/byoc">BYOC</a>.</li>
          </ul>
        </section>

        <section id="data-flow">
          <h2>2. End-to-End Domestic Data-Flow Architecture (India ap-south-1)</h2>
          <ol>
            <li><strong>Step 1 — TLS 1.3 Client Ingress:</strong> Client SDK (<code>v1.0.0</code>) or REST call connects to <code>https://api.icebergdb.in</code> over HTTPS / TLS 1.3.</li>
            <li><strong>Step 2 — SHA-256 Key Verification &amp; RBAC Gate:</strong> Incoming <code>X-API-Key</code> is hashed with SHA-256 and checked against role permissions (<code>admin</code>, <code>read_write</code>, <code>read_only</code>).</li>
            <li><strong>Step 3 — In-Memory Domestic ONNX CPU Embedding (Zero External AI Sharing):</strong> Raw text is embedded into 384d float32 vectors in RAM on domestic CPU nodes (<code>all-MiniLM-L6-v2</code>, <code>48.2 ms</code> min / <code>112.3 ms</code> p50). <strong>0% of customer text or queries are sent to OpenAI, Anthropic, Cohere, or foreign APIs.</strong></li>
            <li><strong>Step 4 — Tenant-Isolated NVMe Storage (AES-256):</strong> Vectors and BM25 indexes are stored under deterministic namespace prefixes (<code>t_{uid8}__</code> and <code>u_{uid8}__</code>) on AES-256 encrypted NVMe storage in India (<code>ap-south-1</code>).</li>
          </ol>
        </section>

        <section id="subprocessors">
          <h2>3. Official Subprocessor Disclosure Table</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Subprocessor / Subsystem</th><th>Operational Scope</th><th>Processing Location</th><th>Data Scope &amp; Safeguards</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Domestic Cloud Compute &amp; NVMe Storage</strong></td><td>API Gateway, ONNX CPU Embeddings, Qdrant HNSW &amp; BM25 Storage, Snapshots</td><td>India (<code>ap-south-1</code> Mumbai)</td><td>AES-256 encrypted vector collections, payloads &amp; snapshots</td></tr>
              <tr><td><strong>Razorpay Software Pvt. Ltd.</strong></td><td>Subscription Billing, UPI / Card Checkout &amp; Webhooks</td><td>India (PCI-DSS Level 1)</td><td>Billing email &amp; plan tier only (Zero access to vectors or documents)</td></tr>
              <tr><td><strong>Vercel Inc.</strong></td><td>Static Web Frontend CDN (<code>icebergdb.in</code> &amp; <code>dashboard.icebergdb.in</code>)</td><td>India Edge (<code>bom1</code>)</td><td>Static HTML/JS/CSS UI assets only (Zero customer collections stored)</td></tr>
              <tr><td><strong>External Third-Party LLM / Embedding APIs</strong></td><td>None (100% Built-in ONNX Runtime CPU inference)</td><td>0% External Sharing</td><td>None — Customer prompts and documents never leave Iceberg DB</td></tr>
            </tbody>
          </table>
        </section>

        <section id="retention-deletion">
          <h2>4. Data Retention, Right to Erasure &amp; 30-Day Backup Lifecycle</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr><th>Event</th><th>API / Control Trigger</th><th>Active Index &amp; RAM Purge</th><th>Backup &amp; Snapshot Purge</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Single Point Deletion</strong></td><td><code>DELETE /documents/{collection}/points/{point_id}</code></td><td>Immediate (&lt; 1 second synchronous removal)</td><td>Aged out of rolling snapshots within 30 days</td></tr>
              <tr><td><strong>Full Collection Deletion</strong></td><td><code>DELETE /collections/{name}</code></td><td>Immediate (&lt; 1 second purge of vectors, BM25 &amp; cache)</td><td>Purged from encrypted disaster-recovery backups within 30 days</td></tr>
              <tr><td><strong>4-Tier Agent Memory Expiry</strong></td><td>TTL Policy or <code>POST /memory/decay</code></td><td><code>short_term</code>: 1h TTL • <code>episodic</code>: 30d TTL • Immediate via API</td><td>Purged within 30-day rolling snapshot window</td></tr>
              <tr><td><strong>Workspace / Account Termination</strong></td><td>Dashboard or request to <code>contact@icebergdb.in</code></td><td>Complete cryptographic erasure within 72 hours</td><td>Final backup purge completed within 30 days</td></tr>
            </tbody>
          </table>
        </section>

        <section id="breach-and-export">
          <h2>5. 72-Hour Breach Notification SLA &amp; Zero Lock-In Customer Data Export</h2>
          <ul>
            <li><strong>Security Breach Notification (&le; 72 Hours):</strong> In accordance with Section 8(6) of the DPDP Act 2023 and CERT-In directives, confirmed personal data breaches impacting customer collections are reported to affected workspace administrators within <strong>72 hours</strong> (alongside statutory reporting to CERT-In and the Data Protection Board of India).</li>
            <li><strong>Customer Data Export (Zero Vendor Lock-In):</strong> Export 100% of your indexed chunks, 384d vectors, and JSON metadata at any time via <code>GET https://api.icebergdb.in/documents/{collection}/scroll?limit=100&amp;offset=0</code> or trigger snapshots via <code>POST /backup/create/{collection}</code> with zero egress fees.</li>
            <li><strong>Data Protection &amp; Security Contact:</strong> <a href="mailto:contact@icebergdb.in">contact@icebergdb.in</a></li>
          </ul>
        </section>
      </main>
    `,
  },
  {
    route: '/privacy',
    title: 'Privacy Policy, DPA & DPDP Act 2023 Governance — Iceberg DB (v1.0.0)',
    description:
      'Iceberg DB Privacy Policy and Data Processing Addendum (DPA): DPDP Act 2023 Data Fiduciary vs. Data Processor roles, 100% India data residency (ap-south-1), Subprocessor Disclosure, immediate active deletion + 30-day backup lifecycle, 72-hour breach notification protocol, and zero-lock-in data export.',
    bodyHtml: `
      <main style="background:#070709;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Privacy Policy &amp; Data Processing Addendum (DPA) — Iceberg DB (v1.0.0)</h1>
        <p><strong>Effective Date:</strong> October 19, 2026 • <strong>Last Updated:</strong> November 6, 2026 • <strong>Primary Cluster:</strong> Hosted in India (<code>ap-south-1</code> Mumbai)</p>

        <section>
          <h2>1. DPDP Act 2023 Roles (Customer = Data Fiduciary, Iceberg DB = Data Processor)</h2>
          <p>Under India’s Digital Personal Data Protection (DPDP) Act, 2023, the Customer acts as the <strong>Data Fiduciary</strong> (retaining 100% ownership of all documents, 384d embeddings, and agent memories), and Iceberg Database Technologies acts strictly as a <strong>Data Processor</strong> executing authenticated API instructions within India (<code>ap-south-1</code>).</p>
        </section>

        <section>
          <h2>2. 100% India Data Residency (ap-south-1) &amp; Zero External AI Sharing</h2>
          <p>All Qdrant HNSW vector indexes, Okapi BM25 inverted indexes, server-side ONNX CPU embeddings (<code>all-MiniLM-L6-v2</code>, 384d), and snapshots are stored on AES-256 encrypted volumes in India (<code>ap-south-1</code>). <strong>0% of customer text or queries are shared with OpenAI, Anthropic, Cohere, or external AI providers, and customer data is never used to train foundation models.</strong></p>
        </section>

        <section>
          <h2>3. Subprocessor Disclosure</h2>
          <ul>
            <li><strong>Domestic Cloud Compute &amp; Storage (India ap-south-1):</strong> Primary API gateway, ONNX CPU embedding workers, and encrypted NVMe vector storage.</li>
            <li><strong>Razorpay Software Pvt. Ltd. (India, PCI-DSS Level 1):</strong> Subscription billing and payment processing (billing email &amp; plan metadata only; zero access to vectors).</li>
            <li><strong>Vercel Inc. (India Edge bom1):</strong> Static frontend hosting for <code>icebergdb.in</code> and <code>dashboard.icebergdb.in</code> (zero customer vector collections stored).</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Retention, Right to Erasure &amp; 30-Day Backup Retention</h2>
          <ul>
            <li><strong>Immediate Active Deletion:</strong> Calling <code>DELETE /documents/{collection}/points/{id}</code> or <code>DELETE /collections/{name}</code> synchronously purges vectors and payloads from active RAM and disk indexes in under <strong>1 second</strong>.</li>
            <li><strong>Backup Lifecycle:</strong> Deleted collections age out of encrypted disaster-recovery snapshots within a strict <strong>30-day rolling retention window</strong>.</li>
            <li><strong>Account Termination:</strong> Workspace deletion requests purge all active collections and SHA-256 keys within <strong>72 hours</strong>.</li>
            <li><strong>Data Portability &amp; Export:</strong> Export 100% of your data anytime via <code>GET /documents/{collection}/scroll?limit=100&amp;offset=0</code>.</li>
          </ul>
        </section>

        <section>
          <h2>5. Security Breach Notification (&le; 72 Hours) &amp; DPO Contact</h2>
          <p>Confirmed personal data breaches impacting customer workspaces are notified to affected administrators within <strong>72 hours</strong> (and reported to CERT-In and the Data Protection Board of India per statutory timelines). Contact Grievance &amp; Data Protection Officer (Ankush): <a href="mailto:contact@icebergdb.in">contact@icebergdb.in</a>.</p>
        </section>
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
    title: 'Integrations Overview: AI Coding Tools, RAG Frameworks, Models & Cloud — Iceberg DB (v1.0.0)',
    description:
      'Browse 59 official Iceberg DB v1.0.0 integrations across Claude Code, Codex, Cursor, Agent Skills, LangChain, LlamaIndex, Haystack, Amazon Bedrock, Cohere, Voyage AI, Databricks, Terraform, Datadog, and TruLens.',
    bodyHtml: `
      <main style="background:#0f0f11;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <h1>Integrations overview — Iceberg DB (v1.0.0)</h1>
        <p>Browse Iceberg integrations across AI coding tools, vector embedding providers, data ingestion tools, frameworks, cloud infrastructure, and observability to ship AI apps faster.</p>
        <ul>
          ${ALL_INTEGRATIONS.map(it => `<li><a href="/integrations/${it.slug}">${(it.cardTitle || it.name).replace(/&/g, '&amp;')}</a> — ${String(it.shortDesc || '').replace(/&/g, '&amp;')}</li>`).join('\n          ')}
        </ul>
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
    title: 'Iceberg 4-Tier Cognitive AI Agent Memory & Ebbinghaus Decay Architecture (v1.0.0)',
    description:
      'Persistent 4-tier cognitive memory layer for AI agents hosted in India (ap-south-1): short_term (1h TTL), episodic (30d TTL), long_term, and semantic recall, backed by 384d HNSW + BM25 storage and Ebbinghaus retention scoring (R(t) = exp(-t / S)).',
    bodyHtml: `
      <main style="background:#070709;color:#fff;font-family:system-ui,-apple-system,sans-serif;padding:48px 24px;max-width:980px;margin:0 auto;line-height:1.6;">
        <h1>Iceberg 4-Tier Cognitive AI Agent Memory &amp; Ebbinghaus Decay Architecture (v1.0.0)</h1>
        <p>Give AI agents persistent memory across sessions with <code>client.remember()</code> and <code>client.recall()</code> across 4 distinct lifecycle tiers stored in tenant-isolated namespaces (<code>u_{uid8}__memory_{agent_id}</code>) in India (<code>ap-south-1</code>):</p>
        <ul>
          <li><strong>short_term (TTL: 1 hour / 3,600s):</strong> Active conversation turns and temporary scratchpad state. Automatically filtered and purged after 1 hour.</li>
          <li><strong>episodic (TTL: 30 days / 2,592,000s):</strong> Timestamped interaction events (e.g., "User upgraded to Growth plan on Nov 6"). Subject to Ebbinghaus retention decay.</li>
          <li><strong>long_term (TTL: Never expires):</strong> Persistent user preferences, identity facts, and architectural decisions.</li>
          <li><strong>semantic (TTL: Never expires):</strong> Domain knowledge and learned rules shared across agent executions.</li>
        </ul>
        <section>
          <h2>Ebbinghaus Forgetting Curve Formula (<code>POST /memory/decay</code>)</h2>
          <pre><code>t = (now_utc - last_accessed_at) in hours
S = base_stability * (1.0 + 0.5 * access_count)
R(t) = exp(-t / S)
final_score = 0.75 * hybrid_rrf_score + 0.25 * R(t)</code></pre>
          <p>Frequently recalled memories increment <code>access_count</code> and strengthen stability <code>S</code>, while unreferenced episodic/short-term memories decay below <code>R(t) &lt; 0.15</code> and are pruned.</p>
        </section>
      </main>
    `,
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
      'Canonical v1.0.0 SDKs for Iceberg DB across Python (PyPI: icebergdb), JavaScript/TypeScript (npm: icebergdb), Rust (Crates.io: icebergdb), .NET (NuGet: IcebergDb), Go, Java (Maven: io.icebergdb:iceberg-sdk:1.0.0), and MCP (npx -y iceberg-mcp).',
    bodyHtml: `
      <main style="background:#070709;color:#fff;font-family:system-ui,-apple-system,sans-serif;padding:48px 24px;max-width:980px;margin:0 auto;line-height:1.6;">
        <h1>Official Iceberg DB SDKs &amp; Canonical Package Registry (v1.0.0)</h1>
        <p>Clean-environment verified <strong>v1.0.0</strong> SDKs for Python, JavaScript/TypeScript, Rust, .NET/C#, Go, Java, and Model Context Protocol (MCP).</p>
        
        <section id="canonical-sdk-registry">
          <h2>Canonical Official Package Registry Table (v1.0.0 — Clean Environment Verified)</h2>
          <p><strong>Official Package Disambiguation Notice (v1.0.0):</strong> Always install the single official <code>v1.0.0</code> packages listed below: <code>icebergdb</code> (PyPI, npm, Crates.io), <code>IcebergDb</code> (NuGet), <code>github.com/anku5265/iceberg-database/iceberg-sdk-go</code> (Go), <code>io.icebergdb:iceberg-sdk:1.0.0</code> (Maven), and <code>iceberg-mcp</code> (MCP Server). Legacy pre-release beta package names (<code>iceberg-db</code>, <code>iceberg-js-sdk</code>, <code>iceberg-Vector-db</code>, <code>Iceberg.VectorDB</code>) are permanently deprecated and retired.</p>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border-color:#222;width:100%;">
            <thead>
              <tr>
                <th>Language &amp; Runtime</th>
                <th>Official Package</th>
                <th>Tested Version</th>
                <th>Standard Install Command</th>
                <th>Version-Pinned Install</th>
                <th>Official Registry</th>
                <th>Deprecated Legacy Beta Names (Do Not Use)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Python</strong> (Python 3.9+)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>pip install icebergdb</code></td>
                <td><code>pip install icebergdb==1.0.0</code></td>
                <td><a href="https://pypi.org/project/icebergdb/">PyPI</a></td>
                <td><del>iceberg-db</del>, <del>iceberg-python</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>JavaScript / TypeScript</strong> (Node 18+, Next.js, Deno, Bun)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>npm install icebergdb</code></td>
                <td><code>npm install icebergdb@1.0.0</code></td>
                <td><a href="https://www.npmjs.com/package/icebergdb">npm</a></td>
                <td><del>iceberg-js-sdk</del>, <del>iceberg-db</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Rust</strong> (Rust 1.75+ / Tokio 1.x)</td>
                <td><code>icebergdb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>cargo add icebergdb</code></td>
                <td><code>cargo add icebergdb@1.0.0</code></td>
                <td><a href="https://crates.io/crates/icebergdb">Crates.io</a></td>
                <td><del>iceberg-Vector-db</del>, <del>iceberg-rs</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>.NET / C#</strong> (.NET 8.0+ / C# 12)</td>
                <td><code>IcebergDb</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>dotnet add package IcebergDb</code></td>
                <td><code>dotnet add package IcebergDb --version 1.0.0</code></td>
                <td><a href="https://www.nuget.org/packages/IcebergDb">NuGet</a></td>
                <td><del>Iceberg.VectorDB</del>, <del>Iceberg.Net</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Go</strong> (Go 1.21+)</td>
                <td><code>github.com/anku5265/iceberg-database/iceberg-sdk-go</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go</code></td>
                <td><code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go@v1.0.0</code></td>
                <td><a href="https://pkg.go.dev/github.com/anku5265/iceberg-database/iceberg-sdk-go">pkg.go.dev</a></td>
                <td><del>iceberg-go</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>Java</strong> (Java 17+ / Spring Boot 3.x)</td>
                <td><code>io.icebergdb:iceberg-sdk:1.0.0</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>io.icebergdb:iceberg-sdk:1.0.0</code></td>
                <td><code>&lt;version&gt;1.0.0&lt;/version&gt;</code></td>
                <td><a href="https://github.com/anku5265/iceberg-database/tree/main/iceberg-sdk-java">Maven</a></td>
                <td><del>in.icebergdb:iceberg-sdk-java</del> (Deprecated)</td>
              </tr>
              <tr>
                <td><strong>MCP Server</strong> (Claude Code, Cursor, Windsurf, Copilot)</td>
                <td><code>iceberg-mcp</code></td>
                <td><strong>v1.0.0</strong></td>
                <td><code>npx -y iceberg-mcp</code></td>
                <td><code>npx -y iceberg-mcp@1.0.0</code></td>
                <td><a href="https://www.npmjs.com/package/iceberg-mcp">npm</a></td>
                <td><del>iceberg-mcp-server</del> (Deprecated)</td>
              </tr>
            </tbody>
          </table>
        </section>
        
        <section id="verified-sdk-examples">
          <h2>Verified Working SDK Quickstart Examples (v1.0.0)</h2>
          <h3>Python (PyPI: icebergdb v1.0.0)</h3>
          <pre><code>pip install icebergdb</code></pre>
          <pre><code>from iceberg import Client

client = Client(api_key="ib_your_key")
client.create_collection("my_docs")
client.index_text("my_docs", "Our return policy allows 30 day returns.")

results = client.search("my_docs", "can I return my order?", search_type="hybrid", top_k=5)
for r in results:
    print(f"{r.score:.3f} — {r.text}")

client.remember("agent_001", "User prefers dark mode", memory_type="long_term")
memories = client.recall("agent_001", "what does user prefer?", top_k=3)</code></pre>

          <h3>JavaScript / TypeScript (npm: icebergdb v1.0.0)</h3>
          <pre><code>npm install icebergdb</code></pre>
          <pre><code>import { Client } from 'icebergdb'

const client = new Client({ apiKey: 'ib_your_key' })
await client.createCollection('my_docs')
await client.indexText('my_docs', 'Our return policy allows 30 day returns.')
const results = await client.search('my_docs', 'return order', { topK: 5, searchType: 'hybrid', alpha: 0.5 })
results.forEach(r =&gt; console.log(r.score, r.text))</code></pre>

          <h3>Rust (Crates.io: icebergdb v1.0.0)</h3>
          <pre><code>cargo add icebergdb</code></pre>
          <pre><code>use icebergdb::Client;

#[tokio::main]
async fn main() -&gt; Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt; {
    let client = Client::new("ib_your_key");
    client.create_collection("my_docs").await?;
    client.index_text("my_docs", "Our return policy allows 30 day returns.", None).await?;
    let res = client.search("my_docs", "return order", 5).await?;
    for r in res.results {
        println!("{:.4} — {}", r.score, r.text);
    }
    Ok(())
}</code></pre>

          <h3>.NET / C# (NuGet: IcebergDb v1.0.0)</h3>
          <pre><code>dotnet add package IcebergDb --version 1.0.0</code></pre>
          <pre><code>using IcebergDb;

var client = new IcebergClient("ib_your_key");
await client.CreateCollectionAsync("my_docs");
await client.IndexTextAsync("my_docs", "Our return policy allows 30 day returns.");
var results = await client.SearchAsync("my_docs", "return order", topK: 5);
foreach (var r in results.Results)
    Console.WriteLine($"{r.Score:F4} — {r.Text}");</code></pre>

          <h3>Go (v1.0.0)</h3>
          <pre><code>go get github.com/anku5265/iceberg-database/iceberg-sdk-go@v1.0.0</code></pre>
          <pre><code>package main

import (
    "fmt"
    iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"
)

func main() {
    client := iceberg.New("ib_your_key")
    _ = client.CreateCollection("my_docs")
    _ = client.IndexText("my_docs", "Our return policy allows 30 day returns.", "docs")
    res, _ := client.Search("my_docs", "return order", 5)
    for _, r := range res.Results {
        fmt.Printf("%.4f — %s\n", r.Score, r.Text)
    }
}</code></pre>

          <h3>Java (Maven: io.icebergdb:iceberg-sdk:1.0.0)</h3>
          <pre><code>import in.iceberg.Client;
import java.util.Map;

public class Example {
    public static void main(String[] args) throws Exception {
        Client client = new Client("ib_your_key");
        client.createCollection("my_docs");
        client.indexText("my_docs", "Our return policy allows 30 day returns.", "docs");
        Map&lt;String, Object&gt; results = client.search("my_docs", "return order", 5, "hybrid");
        System.out.println(results);
    }
}</code></pre>
        </section>
      </main>
    `,
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
  return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Dynamically append all 59 /integrations/:slug subpages for full crawler & OpenGraph SEO coverage
for (const item of ALL_INTEGRATIONS) {
  const catLabel = INTEGRATION_CATEGORIES.find(c => c.id === item.category)?.label || 'Integration'
  const cleanSummary = String(item.summary || item.shortDesc || '').replace(/`/g, '')
  const sectionTitles = (item.sections || [])
    .filter(s => s.title)
    .map(s => `<h2>${escapeAttr(s.title)}</h2>`)
    .join('\n        ')

  ROUTES.push({
    route: `/integrations/${item.slug}`,
    title: `${item.pageTitle || item.name} — Iceberg DB ${catLabel} Integration (v1.0.0)`,
    description: cleanSummary,
    bodyHtml: `
      <main style="background:#0f0f11;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;padding:48px 24px;line-height:1.6;">
        <p><a href="/integrations">Back to Integrations</a> · ${escapeAttr(catLabel)}</p>
        <h1>${escapeAttr(item.pageTitle || item.name)}</h1>
        <p>${escapeAttr(cleanSummary)}</p>
        ${(item.intro || []).map(p => `<p>${escapeAttr(String(p).replace(/`/g, ''))}</p>`).join('\n        ')}
        ${sectionTitles}
      </main>
    `,
  })
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

  // For sub-routes, replace the homepage JSON-LD block with a clean route-specific WebPage JSON-LD
  // so crawlers inspecting /docs, /pricing, /benchmarks, or /status see only that route's structured data.
  if (item.route !== '/') {
    const pageJsonLd = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: item.title,
        url: canonicalUrl,
        description: item.description,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Iceberg DB',
          url: 'https://icebergdb.in',
        },
      },
      null,
      2
    )
    html = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${pageJsonLd}\n    </script>`
    )
  }

  // Inject pre-rendered semantic HTML inside <div id="root">...</div> so non-JS crawlers (Grok, ChatGPT, Perplexity, Googlebot)
  // read the full page content directly, while React createRoot().render() replaces #root seamlessly in browsers.
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root"><div id="seo-prerender-content">${item.bodyHtml.trim()}</div></div>`
  )

  // Remove any <noscript> block so headlines and content are never duplicated in the HTML
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, '')

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
