import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { Navbar, useSessionTheme } from '../components/Navbar'
import { CANONICAL_SPEC } from '../config/canonicalSpec'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

const ENGINE_LAYERS = [
  {
    id: 0,
    code: '01',
    shortLabel: 'ONNX 384D',
    tag: 'CPU VECTORIZER',
    tabMetric: '₹0 / token',
    title: 'In-Process 384d ONNX CPU Embedding',
    metric: 'all-MiniLM-L6-v2 · Zero API Cost',
  },
  {
    id: 1,
    code: '02',
    shortLabel: 'HYBRID RRF',
    tag: 'RAM DUAL-INDEX',
    tabMetric: `${CANONICAL_SPEC.latency.hybridP50.replace(' ', '')} p50`,
    title: 'HNSW Cosine + Okapi BM25 Fusion (k=60)',
    metric: `${CANONICAL_SPEC.latency.hybridP50.replace(' ', '')} p50 · 100% Recall@10`,
  },
  {
    id: 2,
    code: '03',
    shortLabel: 'NAMESPACE',
    tag: 'TENANT ISOLATION',
    tabMetric: `${CANONICAL_SPEC.latency.denseP50.replace(' ', '')} p50`,
    title: 'Scoped Namespace & JSON Metadata Pre-Filter',
    metric: `${CANONICAL_SPEC.latency.denseP50.replace(' ', '')} dense · Zero Leakage`,
  },
  {
    id: 3,
    code: '04',
    shortLabel: 'R2 SNAPSHOT',
    tag: 'OBJECT STORAGE',
    tabMetric: 'ap-south-1',
    title: 'Cloudflare R2 Point-in-Time Collection Snapshots',
    metric: 'Mumbai Residency · Zero Lock-In',
  },
]

const CORE_PILLARS = [
  {
    id: 'performant',
    href: '#performant',
    title: 'Performant',
    desc: `${CANONICAL_SPEC.latency.denseP50} p50 dense Cosine retrieval and ${CANONICAL_SPEC.latency.hybridP50} p50 Hybrid RRF maximize 100% Recall@10 with ultra-low ap-south-1 latency.`,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'serverless',
    href: '#serverless',
    title: 'Serverless',
    desc: 'Cloudflare R2 snapshot-backed serverless architecture ensures seamless scaling from 100K free vectors to 20M+ with zero cluster pausing.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 8l10 5 10-5-10-5zM2 12l10 5 10-5M2 16l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'reliable',
    href: '#reliable',
    title: 'Reliable',
    desc: 'With a 99.9% uptime SLA in ap-south-1 (Mumbai), Iceberg is trusted by AI startups and enterprises for 24/7 production RAG workloads.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 000 18M12 3a14.5 14.5 0 010 18" />
      </svg>
    ),
  },
  {
    id: 'secure',
    href: '#secure',
    title: 'Secure',
    desc: 'Data is encrypted at rest and in transit. Control access with RBAC API keys, IP allowlists, Customer-managed keys (CMEK), and DPDP residency.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <rect x="5" y="11" width="14" height="10" rx="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4" />
      </svg>
    ),
  },
]

const ARCHITECTURE_CARDS = [
  {
    title: 'Real-time indexing',
    desc: 'Instantly chunks, embeds via in-process 384d ONNX all-MiniLM-L6-v2 CPU inference, and indexes new data for immediate low-latency queries.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: 'Tiered storage',
    desc: 'Hot HNSW graphs and Okapi BM25 inverted indices serve sub-10ms reads from RAM while Cloudflare R2 snapshots persist collections cost-efficiently.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <rect x="9" y="3" width="6" height="4" rx="0.5" />
        <rect x="3" y="16" width="6" height="4" rx="0.5" />
        <rect x="15" y="16" width="6" height="4" rx="0.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v4m-6 5v-4h12v4" />
      </svg>
    ),
  },
  {
    title: 'Fast accurate reads',
    desc: 'SIMD-accelerated cosine distance and Reciprocal Rank Fusion (RRF k=60) deliver verified 100% Recall@10 accuracy at production concurrency.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

const RETRIEVAL_STRATEGIES = [
  {
    id: 'semantic',
    title: 'Semantic search',
    alpha: 'alpha = 1.0',
    latency: CANONICAL_SPEC.latency.denseP50.replace(' ', ''),
    queryPreview: 'db.search("fintech_kb", "recurring mandate rules for mutual funds", alpha=1.0)',
    matchPreview: 'rbi_circular_2026.pdf · score 0.964 · matched conceptual intent without exact words',
    desc: 'Dense 384d ONNX vectors capture meaning and context, surfacing results that match intent even when queries and documents share no words in common.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16" />
        <circle cx="9" cy="14" r="1.2" fill="currentColor" />
        <circle cx="13" cy="10" r="1.2" fill="currentColor" />
        <circle cx="17" cy="7" r="1.2" fill="currentColor" />
        <circle cx="15" cy="15" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'keyword',
    title: 'Keyword search',
    alpha: 'alpha = 0.0',
    latency: CANONICAL_SPEC.latency.bm25P50.replace(' ', ''),
    queryPreview: 'db.search("fintech_kb", "RBI/2023-24/88 SKU-9941A", alpha=0.0)',
    matchPreview: 'circular_88_annex.md · score 0.991 · exact Okapi BM25 lexical token match',
    desc: 'Sparse Okapi BM25 scoring represents documents by weighted terms, giving precise matching when exact SKUs, circular IDs, or error codes drive relevance.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 9h10M7 15h10M10 4L8 20M16 4l-2 16" />
      </svg>
    ),
  },
  {
    id: 'metadata',
    title: 'Full-text & Metadata',
    alpha: 'filter + BM25',
    latency: '2.40ms',
    queryPreview: 'db.search("fintech_kb", "UPI AutoPay", filter={"regulator": "RBI", "year": 2026})',
    matchPreview: 'upi_mandate_2026.pdf · score 0.958 · pre-filtered namespace & JSON metadata',
    desc: 'Native BM25 ranking, automatic chunking, tokenization, namespace partitioning, and JSON metadata pre-filters built directly into one engine.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="11" cy="11" r="6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'hybrid',
    title: 'Hybrid search',
    alpha: 'alpha = 0.5 · RRF',
    latency: CANONICAL_SPEC.latency.hybridP50.replace(' ', ''),
    queryPreview: 'db.search("fintech_kb", "UPI AutoPay INR 1,00,000 limit", alpha=0.5)',
    matchPreview: 'rbi_emandate_master.pdf · score 0.987 · fused 384d HNSW + Okapi BM25 (k=60)',
    desc: 'Combine semantic 384d vectors, full-text BM25, and metadata filters in a single API call via Reciprocal Rank Fusion (k=60) with dynamic alpha.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h5l4 5-4 5H4M13 12h7m0 0l-3-3m3 3l-3 3" />
      </svg>
    ),
  },
]

const RELIABILITY_CARDS = [
  {
    title: '99.9% uptime SLA',
    desc: 'Consistent production availability in ap-south-1 (Mumbai) for mission-critical AI applications, with zero cold starts and never-pausing collections.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Backup and restore',
    desc: 'Programmatically or in one click create immutable Cloudflare R2 snapshots of any collection and restore to a new namespace anytime.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: 'Namespace isolation',
    desc: 'Prevent cross-tenant vector leakage and accidental overwrites with strict logical namespace separation and SHA-256 scoped API keys.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" />
        <rect x="9" y="12" width="6" height="5" rx="1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12v-1.5a1.5 1.5 0 013 0V12" />
      </svg>
    ),
  },
  {
    title: 'Dedicated Read Nodes',
    desc: 'Scale high-concurrency workloads smoothly up to 565+ QPS burst across isolated read replicas in ap-south-1 with zero noisy neighbors.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5v14M15 5v14" />
      </svg>
    ),
  },
]

const SECURITY_CARDS = [
  {
    title: 'Data security',
    to: '/security',
    descBefore: 'With AES-256 encryption at rest, TLS 1.3 in transit, ',
    descLink: 'IP allowlists & private networking',
    descAfter: ', and Customer-managed encryption keys (CMEK), your vectors stay protected.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h4M6 12h3m6-1v3m-1.5 0h3" />
        <rect x="4" y="5" width="16" height="14" rx="2" />
      </svg>
    ),
  },
  {
    title: 'DPDP & India residency',
    to: '/security',
    descBefore: 'Keep embeddings and documents 100% domestic inside ap-south-1 (Mumbai) — engineered for ',
    descLink: 'DPDP Act 2023, RBI, and SEBI readiness',
    descAfter: ' with zero cross-border egress.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Bring your own cloud',
    to: '/product/byoc',
    descBefore: 'Deploy a dedicated, isolated Iceberg Vector Engine directly inside ',
    descLink: 'your own AWS, GCP, or Azure VPC',
    descAfter: ' with a zero-inbound-port operating model.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    title: 'Access controls',
    to: '/docs?section=auth',
    descBefore: 'Assign granular ',
    descLink: 'RBAC roles and permissions',
    descAfter: ' (admin, read_write, read_only) to scoped API keys with instant revocation and zero downtime.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="9" cy="8" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-1a5 5 0 015-5h2a5 5 0 015 5v1m3-8l2 2 3-3" />
      </svg>
    ),
  },
  {
    title: 'Observability & audit',
    to: '/status',
    descBefore: 'Full visibility across collections with real-time ',
    descLink: 'latency telemetry & audit logs',
    descAfter: ', per-key request tracking, health endpoints, and key rotation.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v10m0 0l-3-3m3 3l3-3M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
      </svg>
    ),
  },
]

const CODE_TABS = {
  python: {
    label: 'Python',
    filename: 'setup_iceberg.py',
    raw: `from iceberg import Client

db = Client(api_key="icb_live_YOUR_API_KEY")

# 1. Create a serverless collection in ap-south-1 (Mumbai)
db.create_collection(name="india_fintech_kb", dimension=384, metric="cosine")

# 2. Index raw text — built-in 384d ONNX CPU embedding at ₹0 cost
db.index_text(
    collection="india_fintech_kb",
    text="UPI AutoPay mandate limit for mutual funds is ₹1,00,000.",
    namespace="rbi_circulars",
    metadata={"regulator": "RBI", "year": 2026}
)

# 3. Query with Hybrid RRF (Dense 384d Cosine + Sparse Okapi BM25)
hits = db.search("india_fintech_kb", "UPI AutoPay limit", alpha=0.5)`,
    lines: [
      { ln: 1, code: <><span className="s-kw">from</span> iceberg <span className="s-kw">import</span> Client</> },
      { ln: 2, code: '' },
      { ln: 3, code: <>db = <span className="s-fn">Client</span>(api_key=<span className="s-str">&quot;icb_live_YOUR_API_KEY&quot;</span>)</> },
      { ln: 4, code: '' },
      { ln: 5, code: <><span className="s-cmt"># 1. Create a serverless collection in ap-south-1 (Mumbai)</span></> },
      { ln: 6, code: <>db.<span className="s-fn">create_collection</span>(name=<span className="s-str">&quot;india_fintech_kb&quot;</span>, dimension=<span className="s-num">384</span>, metric=<span className="s-str">&quot;cosine&quot;</span>)</> },
      { ln: 7, code: '' },
      { ln: 8, code: <><span className="s-cmt"># 2. Index raw text — built-in 384d ONNX CPU embedding at ₹0 cost</span></> },
      { ln: 9, code: <>db.<span className="s-fn">index_text</span>(</> },
      { ln: 10, code: <>    collection=<span className="s-str">&quot;india_fintech_kb&quot;</span>,</> },
      { ln: 11, code: <>    text=<span className="s-str">&quot;UPI AutoPay mandate limit for mutual funds is ₹1,00,000.&quot;</span>,</> },
      { ln: 12, code: <>    namespace=<span className="s-str">&quot;rbi_circulars&quot;</span>,</> },
      { ln: 13, code: <>    metadata=&#123;<span className="s-str">&quot;regulator&quot;</span>: <span className="s-str">&quot;RBI&quot;</span>, <span className="s-str">&quot;year&quot;</span>: <span className="s-num">2026</span>&#125;</> },
      { ln: 14, code: <>)</> },
      { ln: 15, code: '' },
      { ln: 16, code: <><span className="s-cmt"># 3. Query with Hybrid RRF (Dense 384d Cosine + Sparse Okapi BM25)</span></> },
      { ln: 17, code: <>hits = db.<span className="s-fn">search</span>(<span className="s-str">&quot;india_fintech_kb&quot;</span>, <span className="s-str">&quot;UPI AutoPay limit&quot;</span>, alpha=<span className="s-num">0.5</span>)</> },
    ],
  },
  typescript: {
    label: 'TypeScript',
    filename: 'setup_iceberg.ts',
    raw: `import { IcebergClient } from 'iceberg-js'

const db = new IcebergClient({ apiKey: 'icb_live_YOUR_API_KEY' })

// 1. Create serverless collection in ap-south-1
await db.createCollection({ name: 'india_fintech_kb', dimension: 384, metric: 'cosine' })

// 2. Index raw text (₹0/token 384d ONNX CPU embedding)
await db.indexText('india_fintech_kb', {
  text: 'UPI AutoPay mandate limit for mutual funds is ₹1,00,000.',
  namespace: 'rbi_circulars',
  metadata: { regulator: 'RBI', year: 2026 },
})

// 3. Hybrid RRF search (Dense + Okapi BM25)
const hits = await db.search('india_fintech_kb', { query: 'UPI AutoPay limit', alpha: 0.5 })`,
    lines: [
      { ln: 1, code: <><span className="s-kw">import</span> &#123; IcebergClient &#125; <span className="s-kw">from</span> <span className="s-str">&apos;iceberg-js&apos;</span></> },
      { ln: 2, code: '' },
      { ln: 3, code: <><span className="s-kw">const</span> db = <span className="s-kw">new</span> <span className="s-fn">IcebergClient</span>(&#123; apiKey: <span className="s-str">&apos;icb_live_YOUR_API_KEY&apos;</span> &#125;)</> },
      { ln: 4, code: '' },
      { ln: 5, code: <><span className="s-cmt">// 1. Create serverless collection in ap-south-1</span></> },
      { ln: 6, code: <><span className="s-kw">await</span> db.<span className="s-fn">createCollection</span>(&#123; name: <span className="s-str">&apos;india_fintech_kb&apos;</span>, dimension: <span className="s-num">384</span>, metric: <span className="s-str">&apos;cosine&apos;</span> &#125;)</> },
      { ln: 7, code: '' },
      { ln: 8, code: <><span className="s-cmt">// 2. Index raw text (₹0/token 384d ONNX CPU embedding)</span></> },
      { ln: 9, code: <><span className="s-kw">await</span> db.<span className="s-fn">indexText</span>(<span className="s-str">&apos;india_fintech_kb&apos;</span>, &#123;</> },
      { ln: 10, code: <>  text: <span className="s-str">&apos;UPI AutoPay mandate limit for mutual funds is ₹1,00,000.&apos;</span>,</> },
      { ln: 11, code: <>  namespace: <span className="s-str">&apos;rbi_circulars&apos;</span>,</> },
      { ln: 12, code: <>  metadata: &#123; regulator: <span className="s-str">&apos;RBI&apos;</span>, year: <span className="s-num">2026</span> &#125;,</> },
      { ln: 13, code: <>&#125;)</> },
      { ln: 14, code: '' },
      { ln: 15, code: <><span className="s-cmt">// 3. Hybrid RRF search (Dense + Okapi BM25)</span></> },
      { ln: 16, code: <><span className="s-kw">const</span> hits = <span className="s-kw">await</span> db.<span className="s-fn">search</span>(<span className="s-str">&apos;india_fintech_kb&apos;</span>, &#123; query: <span className="s-str">&apos;UPI AutoPay limit&apos;</span>, alpha: <span className="s-num">0.5</span> &#125;)</> },
    ],
  },
  curl: {
    label: 'cURL',
    filename: 'hybrid_search.sh',
    raw: `curl -X POST https://api.icebergdb.in/v2/collections/india_fintech_kb/search \\
  -H "X-API-Key: icb_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query_text": "UPI AutoPay limit",
    "namespace": "rbi_circulars",
    "alpha": 0.5,
    "top_k": 5
  }'`,
    lines: [
      { ln: 1, code: <><span className="s-kw">curl</span> -X POST https://api.icebergdb.in/v2/collections/india_fintech_kb/search \</> },
      { ln: 2, code: <>  -H <span className="s-str">&quot;X-API-Key: icb_live_YOUR_API_KEY&quot;</span> \</> },
      { ln: 3, code: <>  -H <span className="s-str">&quot;Content-Type: application/json&quot;</span> \</> },
      { ln: 4, code: <>  -d <span className="s-str">&apos;&#123;</span></> },
      { ln: 5, code: <>    <span className="s-str">&quot;query_text&quot;: &quot;UPI AutoPay limit&quot;,</span></> },
      { ln: 6, code: <>    <span className="s-str">&quot;namespace&quot;: &quot;rbi_circulars&quot;,</span></> },
      { ln: 7, code: <>    <span className="s-str">&quot;alpha&quot;: 0.5,</span></> },
      { ln: 8, code: <>    <span className="s-str">&quot;top_k&quot;: 5</span></> },
      { ln: 9, code: <>  <span className="s-str">&#125;&apos;</span></> },
    ],
  },
}

function trackCardGlow(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
}

/**
 * Animated 8-Hairline Retracting Crop-Mark Button (Scoped strictly to ProductDatabase)
 * At rest: 8 outward 6px×1px CAD crosshairs extend from the 4 corners.
 * On hover: all 8 hairlines glide 5px inward (200ms ease-out) to lock onto the button corners
 * while primary flips to crisp white (dark mode) / deep navy (light mode) and secondary lights its border.
 */
function CropMarkButton({ to, href, variant = 'secondary', dark = true, children }) {
  const cls = `ib-db-crop-btn ${
    variant === 'primary'
      ? dark
        ? 'ib-db-crop-primary-dark'
        : 'ib-db-crop-primary-light'
      : dark
      ? 'ib-db-crop-sec-dark'
      : 'ib-db-crop-sec-light'
  }`

  const inner = (
    <>
      <span className="ib-db-crop-box">{children}</span>
      <span aria-hidden="true" className="ib-db-tick ib-db-tl-h" />
      <span aria-hidden="true" className="ib-db-tick ib-db-tl-v" />
      <span aria-hidden="true" className="ib-db-tick ib-db-tr-h" />
      <span aria-hidden="true" className="ib-db-tick ib-db-tr-v" />
      <span aria-hidden="true" className="ib-db-tick ib-db-bl-h" />
      <span aria-hidden="true" className="ib-db-tick ib-db-bl-v" />
      <span aria-hidden="true" className="ib-db-tick ib-db-br-h" />
      <span aria-hidden="true" className="ib-db-tick ib-db-br-v" />
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  )
}

/**
 * 100% Original Live-Animated Iceberg Sovereign Vector Engine Blueprint
 * Square-diamond 30° isometric wafer geometry + live query pulse + interactive layer selector
 */
function IcebergEngineBlueprint({ dark, activeLayer, setActiveLayer }) {
  const cyan = dark ? '#00d2ff' : '#0284c7'
  const strokeMain = dark ? '#f4f4f5' : '#0f172a'
  const strokeSub = dark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.42)'
  const strokeDim = dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,23,42,0.2)'
  const strokeFaint = dark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)'
  const waferBg = dark ? '#0d0e12' : '#f8fafc'
  const rimLeftBg = dark ? '#13151c' : '#f1f5f9'
  const rimRightBg = dark ? '#090a0d' : '#e2e8f0'
  const activeBg = dark ? '#0c1b24' : '#e0f2fe'
  const activeRimLeft = dark ? 'rgba(0, 210, 255, 0.22)' : 'rgba(2, 132, 199, 0.18)'
  const activeRimRight = dark ? 'rgba(0, 210, 255, 0.11)' : 'rgba(2, 132, 199, 0.1)'
  const gridLine = dark ? 'border-white/[0.12]' : 'border-black/[0.1]'

  // Y positions of the 4 square isometric wafers along central spine x=265
  const waferY = [70, 131, 192, 253]
  const pulseY = waferY[activeLayer] ?? 70

  return (
    <div
      className={`w-full max-w-[500px] border ${gridLine} ${
        dark ? 'bg-[#0b0c0f]' : 'bg-white'
      } relative overflow-hidden`}
    >
      {/* Top Architectural Header */}
      <div className={`px-5 py-3.5 border-b ${gridLine} flex items-center justify-between gap-3`}>
        <div
          className={`text-[10px] tracking-[0.16em] uppercase font-medium ${
            dark ? 'text-[#a1a1aa]' : 'text-slate-600'
          } select-none`}
        >
          ICEBERG // VECTOR ENGINE · AP-SOUTH-1
        </div>
        <div
          className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase font-semibold"
          style={{
            border: `1px solid ${dark ? 'rgba(0,210,255,0.35)' : 'rgba(2,132,199,0.35)'}`,
            background: dark ? 'rgba(0,210,255,0.08)' : 'rgba(2,132,199,0.07)',
            color: cyan,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cyan }} />
          <span>STAGE {ENGINE_LAYERS[activeLayer].code}</span>
        </div>
      </div>

      {/* Original 30-Degree 3D Isometric Wafer Stack + Live Query Spine */}
      <svg
        viewBox="0 0 460 326"
        className="w-full h-auto select-none block"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ibQueryBeam" x1="265" y1="14" x2="265" y2="265" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={cyan} stopOpacity="0.55" />
            <stop offset="50%" stopColor={cyan} stopOpacity="0.25" />
            <stop offset="100%" stopColor={cyan} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Vertical Isometric Alignment Rails */}
        <line x1="162.8" y1="70" x2="162.8" y2="264" stroke={strokeFaint} strokeWidth="0.9" strokeDasharray="2 4" />
        <line x1="367.2" y1="70" x2="367.2" y2="264" stroke={strokeFaint} strokeWidth="0.9" strokeDasharray="2 4" />
        <line x1="265" y1="14" x2="265" y2="318" stroke="url(#ibQueryBeam)" strokeWidth="1.2" strokeDasharray="3 3" />

        {/* Query Ingress Callout at Top of Spine */}
        <circle cx="265" cy="14" r="2.2" fill={cyan} />
        <text
          x="273"
          y="17"
          fill={cyan}
          fontSize="7.4"
          fontWeight="700"
          letterSpacing="1.1"
        >
          QUERY IN
        </text>

        {/* Render Wafers Bottom-to-Top for True Painter's 3D Depth */}
        {[3, 2, 1, 0].map((idx) => {
          const cy = waferY[idx]
          const isActive = activeLayer === idx
          const layer = ENGINE_LAYERS[idx]
          const depth = idx === 3 ? 11 : 6
          const edgeStroke = isActive ? cyan : strokeSub

          return (
            <g
              key={layer.id}
              onClick={() => setActiveLayer(idx)}
              className="cursor-pointer"
            >
              {/* 3D Isometric Wafer Front-Left & Front-Right Beveled Thickness */}
              <path
                d={`M 162.8 ${cy} L 265 ${cy + 59} L 265 ${cy + 59 + depth} L 162.8 ${cy + depth} Z`}
                fill={isActive ? activeRimLeft : rimLeftBg}
                stroke={edgeStroke}
                strokeWidth={isActive ? '1.2' : '0.95'}
                strokeLinejoin="round"
              />
              <path
                d={`M 265 ${cy + 59} L 367.2 ${cy} L 367.2 ${cy + depth} L 265 ${cy + 59 + depth} Z`}
                fill={isActive ? activeRimRight : rimRightBg}
                stroke={edgeStroke}
                strokeWidth={isActive ? '1.2' : '0.95'}
                strokeLinejoin="round"
              />

              {/* Top Isometric Square Wafer Plane */}
              <g transform={`matrix(0.866025 0.5 -0.866025 0.5 265 ${cy})`}>
                <rect
                  x="-59"
                  y="-59"
                  width="118"
                  height="118"
                  fill={isActive ? activeBg : waferBg}
                  stroke={isActive ? cyan : strokeMain}
                  strokeWidth={isActive ? '1.5' : '1.1'}
                />

                {/* Layer-Specific Internal Technical Geometry */}
                {idx === 0 && (
                  <>
                    {[-30, 0, 30].map((gx) =>
                      [-30, 0, 30].map((gy) => (
                        <rect
                          key={`c-${gx}-${gy}`}
                          x={gx - 8}
                          y={gy - 8}
                          width="16"
                          height="16"
                          fill={gx === 0 && gy === 0 ? cyan : waferBg}
                          stroke={isActive ? cyan : strokeDim}
                          strokeWidth="0.9"
                        />
                      ))
                    )}
                  </>
                )}

                {idx === 1 && (
                  <>
                    <line x1="-59" y1="0" x2="59" y2="0" stroke={isActive ? cyan : strokeDim} strokeWidth="0.9" strokeDasharray="3 3" />
                    <line x1="0" y1="-59" x2="0" y2="59" stroke={isActive ? cyan : strokeDim} strokeWidth="0.9" strokeDasharray="3 3" />
                    <circle cx="0" cy="0" r="38" stroke={isActive ? cyan : strokeMain} strokeWidth="1.15" strokeDasharray="4 3" />
                    <circle cx="0" cy="0" r="18" fill={waferBg} stroke={isActive ? cyan : strokeMain} strokeWidth="1.25" />
                  </>
                )}

                {idx === 2 && (
                  <>
                    <rect x="-36" y="-36" width="72" height="72" stroke={isActive ? cyan : strokeDim} strokeWidth="1" strokeDasharray="3 2" />
                    <rect x="-16" y="-16" width="32" height="32" fill={waferBg} stroke={isActive ? cyan : strokeMain} strokeWidth="1.15" />
                  </>
                )}

                {idx === 3 && (
                  <>
                    {[-29, 0, 29].map((p) => (
                      <g key={`r2-${p}`}>
                        <line x1="-59" y1={p} x2="59" y2={p} stroke={isActive ? cyan : strokeFaint} strokeWidth="0.85" strokeDasharray="3 3" />
                        <line x1={p} y1="-59" x2={p} y2="59" stroke={isActive ? cyan : strokeFaint} strokeWidth="0.85" strokeDasharray="3 3" />
                      </g>
                    ))}
                  </>
                )}
              </g>

              {/* Left Horizontal Leader Callout */}
              <line
                x1="22"
                y1={cy}
                x2="156"
                y2={cy}
                stroke={isActive ? cyan : strokeDim}
                strokeWidth={isActive ? '1.15' : '0.9'}
                strokeDasharray="2.5 2.5"
              />
              <circle cx="158" cy={cy} r="2.4" fill={isActive ? cyan : strokeMain} />
              <text
                x="22"
                y={cy - 7}
                fill={isActive ? cyan : dark ? '#e4e4e7' : '#1e293b'}
                fontSize="8.8"
                fontWeight="700"
                letterSpacing="1.1"
              >
                {layer.code}. {layer.shortLabel}
              </text>
              <text
                x="22"
                y={cy + 11}
                fill={dark ? '#71717a' : '#64748b'}
                fontSize="7.8"
                letterSpacing="0.9"
              >
                {layer.tag}
              </text>
            </g>
          )
        })}

        {/* Continuous Vertical Query Vector Stream Flowing Down Central Spine */}
        <line x1="265" y1="18" x2="265" y2="253" stroke={cyan} strokeWidth="1.6" strokeOpacity="0.22" />
        <circle cx="265" cy="18" r="3" fill={cyan}>
          <animate attributeName="cy" values="18;253" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="2.6s" repeatCount="indefinite" />
        </circle>

        {/* Active Wafer Lock-On Pulse Ring */}
        <circle
          cx="265"
          cy={pulseY}
          r="4.8"
          fill={cyan}
          style={{ transition: 'cy 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
        <circle
          cx="265"
          cy={pulseY}
          r="12"
          stroke={cyan}
          strokeWidth="1.2"
          opacity="0.45"
          style={{ transition: 'cy 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>

      {/* Non-Redundant 4-Stage Metric Selector + Full Telemetry Readout */}
      <div className={`border-t ${gridLine}`}>
        <div className={`grid grid-cols-4 divide-x ${dark ? 'divide-white/[0.12]' : 'divide-black/[0.1]'}`}>
          {ENGINE_LAYERS.map((layer) => {
            const active = activeLayer === layer.id
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                className={`px-2.5 py-2.5 text-left transition cursor-pointer ${
                  active
                    ? dark
                      ? 'bg-[#12141a] text-white'
                      : 'bg-sky-50/80 text-slate-900'
                    : dark
                    ? 'bg-[#0b0c0f] text-[#71717a] hover:text-white'
                    : 'bg-white text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[8.5px] tracking-[0.12em] uppercase">
                  <span style={{ color: active ? cyan : undefined }} className="font-semibold">
                    STAGE {layer.code}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: active ? cyan : dark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.16)',
                    }}
                  />
                </div>
                <div className="text-[10.5px] font-semibold tracking-[0.02em] mt-0.5">
                  {layer.tabMetric}
                </div>
              </button>
            )
          })}
        </div>

        <div
          className={`px-4 py-2.5 border-t ${gridLine} ${
            dark ? 'bg-[#0d0e12]' : 'bg-slate-50'
          } flex flex-wrap items-center justify-between gap-2 text-[11.5px]`}
        >
          <span className={dark ? 'text-[#d4d4d8]' : 'text-slate-700'}>
            {ENGINE_LAYERS[activeLayer].title}
          </span>
          <span className="font-semibold" style={{ color: cyan }}>
            {ENGINE_LAYERS[activeLayer].metric}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ProductDatabase() {
  const [dark, setDark] = useSessionTheme()
  const [activeLayer, setActiveLayer] = useState(1)
  const [blueprintPaused, setBlueprintPaused] = useState(false)
  const [activeStrategy, setActiveStrategy] = useState(3)
  const [strategyPaused, setStrategyPaused] = useState(false)
  const [codeTab, setCodeTab] = useState('python')
  const [copied, setCopied] = useState(false)
  const [barsAnimated, setBarsAnimated] = useState(false)
  const perfRef = useRef(null)

  useEffect(() => {
    if (blueprintPaused) return undefined
    const id = setInterval(() => {
      setActiveLayer((prev) => (prev + 1) % ENGINE_LAYERS.length)
    }, 2800)
    return () => clearInterval(id)
  }, [blueprintPaused])

  useEffect(() => {
    if (strategyPaused) return undefined
    const id = setInterval(() => {
      setActiveStrategy((prev) => (prev + 1) % RETRIEVAL_STRATEGIES.length)
    }, 3600)
    return () => clearInterval(id)
  }, [strategyPaused])

  useEffect(() => {
    const el = perfRef.current
    if (!el) return undefined
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setBarsAnimated(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const bgMain = dark ? 'bg-[#0a0b0d] text-white' : 'bg-white text-[#111827]'
  const gridLine = dark ? 'border-white/[0.12]' : 'border-black/[0.1]'
  const cardBg = dark ? 'bg-[#0b0c0f]' : 'bg-white'
  const cardSubBg = dark ? 'bg-[#0d0e12]' : 'bg-slate-50/70'
  const textMain = dark ? 'text-white' : 'text-[#111827]'
  const textSub = dark ? 'text-[#a1a1aa]' : 'text-[#52525b]'
  const textMuted = dark ? 'text-[#71717a]' : 'text-slate-400'
  const cyanText = dark ? 'text-[#00d2ff]' : 'text-[#0284c7]'
  const iconBox = dark
    ? 'border-white/[0.15] bg-[#111318] text-white'
    : 'border-slate-300 bg-slate-50 text-slate-800'
  const hoverSpotlight = dark
    ? 'radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(0, 210, 255, 0.075), transparent 75%)'
    : 'radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(2, 132, 199, 0.055), transparent 75%)'

  const currentStrategy = RETRIEVAL_STRATEGIES[activeStrategy]
  const currentCode = CODE_TABS[codeTab]
  const themeQuery = !dark ? '?theme=light' : ''

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentCode.raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between antialiased transition-colors duration-200 ${bgMain}`}>
      <style>{`
        .ib-db-crop-btn {
          position: relative;
          display: inline-block;
          padding: 6px;
          text-decoration: none;
          cursor: pointer;
        }
        .ib-db-plain-btn-dark {
          background-color: #0a0b0d;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff !important;
          transition: border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-db-plain-btn-dark:hover,
        .group:hover .ib-db-plain-btn-dark {
          border-color: #ffffff;
        }
        .ib-db-plain-btn-light {
          background-color: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.16);
          color: #111827 !important;
          transition: border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-db-plain-btn-light:hover,
        .group:hover .ib-db-plain-btn-light {
          border-color: #0f172a;
        }
        .ib-db-cta-solid-dark {
          background-color: #ffffff;
          border: 1px solid #ffffff;
          color: #0a0b0d !important;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-db-cta-solid-dark:hover {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-db-cta-solid-light {
          background-color: #0f172a;
          border: 1px solid #0f172a;
          color: #ffffff !important;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-db-cta-solid-light:hover {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-db-crop-box {
          display: block;
          padding: 10px 22px;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 500;
          border-width: 1px;
          border-style: solid;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-db-tick {
          position: absolute;
          pointer-events: none;
          transition: transform 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-db-tl-h { left: 0; top: 5px; width: 6px; height: 1px; }
        .ib-db-tl-v { left: 5px; top: 0; width: 1px; height: 6px; }
        .ib-db-tr-h { right: 0; top: 5px; width: 6px; height: 1px; }
        .ib-db-tr-v { right: 5px; top: 0; width: 1px; height: 6px; }
        .ib-db-bl-h { left: 0; bottom: 5px; width: 6px; height: 1px; }
        .ib-db-bl-v { left: 5px; bottom: 0; width: 1px; height: 6px; }
        .ib-db-br-h { right: 0; bottom: 5px; width: 6px; height: 1px; }
        .ib-db-br-v { right: 5px; bottom: 0; width: 1px; height: 6px; }

        .ib-db-crop-btn:hover .ib-db-tl-h,
        .ib-db-crop-btn:hover .ib-db-bl-h { transform: translate3d(5px, 0, 0); }
        .ib-db-crop-btn:hover .ib-db-tr-h,
        .ib-db-crop-btn:hover .ib-db-br-h { transform: translate3d(-5px, 0, 0); }
        .ib-db-crop-btn:hover .ib-db-tl-v,
        .ib-db-crop-btn:hover .ib-db-tr-v { transform: translate3d(0, 5px, 0); }
        .ib-db-crop-btn:hover .ib-db-bl-v,
        .ib-db-crop-btn:hover .ib-db-br-v { transform: translate3d(0, -5px, 0); }

        /* Primary Blue (Dark Mode): Royal Blue -> Crisp White on Hover */
        .ib-db-crop-primary-dark .ib-db-crop-box {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-db-crop-primary-dark .ib-db-tick { background-color: #1d6bf3; }
        .ib-db-crop-primary-dark:hover .ib-db-crop-box {
          background-color: #ffffff;
          border-color: #ffffff;
          color: #0a0b0d !important;
        }
        .ib-db-crop-primary-dark:hover .ib-db-tick { background-color: #ffffff; }

        /* Primary Blue (Light Mode): Royal Blue -> Deep Navy on Hover */
        .ib-db-crop-primary-light .ib-db-crop-box {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-db-crop-primary-light .ib-db-tick { background-color: #1d6bf3; }
        .ib-db-crop-primary-light:hover .ib-db-crop-box {
          background-color: #0f172a;
          border-color: #0f172a;
          color: #ffffff !important;
        }
        .ib-db-crop-primary-light:hover .ib-db-tick { background-color: #0f172a; }

        /* Secondary Outlined (Dark Mode) */
        .ib-db-crop-sec-dark .ib-db-crop-box {
          background-color: #0b0c0f;
          border-color: rgba(255, 255, 255, 0.16);
          color: #ffffff !important;
        }
        .ib-db-crop-sec-dark .ib-db-tick { background-color: #ffffff; }
        .ib-db-crop-sec-dark:hover .ib-db-crop-box {
          border-color: #ffffff;
        }

        /* Secondary Outlined (Light Mode) */
        .ib-db-crop-sec-light .ib-db-crop-box {
          background-color: #ffffff;
          border-color: rgba(15, 23, 42, 0.16);
          color: #111827 !important;
        }
        .ib-db-crop-sec-light .ib-db-tick { background-color: #111827; }
        .ib-db-crop-sec-light:hover .ib-db-crop-box {
          border-color: #0f172a;
        }
      `}</style>
      <Navbar dark={dark} setDark={setDark} />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* SECTION 1: HERO (DIRECTLY BELOW NAVBAR — SINGLE 1PX LINE!)    */}
        {/* ============================================================ */}
        <section className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-12 sm:py-16 border-x ${gridLine}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column */}
              <div className="lg:col-span-6">
                <div className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 ${cyanText}`}>
                  ICEBERG VECTOR DATABASE
                </div>
                <h1 className={`text-4xl sm:text-5xl lg:text-[48px] font-semibold tracking-[-0.025em] leading-[1.08] mb-5 ${textMain}`}>
                  Battle tested for{' '}
                  <span className={cyanText}>production workloads</span>
                </h1>
                <p className={`text-[15.5px] leading-[1.6] max-w-[490px] mb-8 ${textSub}`}>
                  {CANONICAL_SPEC.latency.denseP50} dense Cosine retrieval, {CANONICAL_SPEC.latency.hybridP50} Hybrid RRF, and free built-in 384d ONNX CPU embeddings — hosted in India (<span className={textMain}>ap-south-1</span>) with zero cold starts.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <CropMarkButton href={`${D}/signup${themeQuery}`} variant="primary" dark={dark}>
                    Create Collection
                  </CropMarkButton>

                  <CropMarkButton to="/docs" variant="secondary" dark={dark}>
                    View Docs
                  </CropMarkButton>
                </div>
              </div>

              {/* Right Column — Original Live Iceberg Engine Blueprint */}
              <div
                className="lg:col-span-6 flex lg:justify-end"
                onMouseEnter={() => setBlueprintPaused(true)}
                onMouseLeave={() => setBlueprintPaused(false)}
              >
                <IcebergEngineBlueprint
                  dark={dark}
                  activeLayer={activeLayer}
                  setActiveLayer={setActiveLayer}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: FLUSH 4-COLUMN CORE PILLARS ANCHOR BAR             */}
        {/* ============================================================ */}
        <section className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto border-x ${gridLine} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`}>
            {CORE_PILLARS.map((item, idx) => (
              <a
                key={item.id}
                href={item.href}
                onMouseMove={trackCardGlow}
                className={`group relative p-7 sm:p-8 flex flex-col justify-between no-underline transition-colors ${cardBg} ${
                  idx < 3 ? `border-b lg:border-b-0 lg:border-r ${gridLine}` : ''
                } ${idx === 1 ? 'sm:border-r-0 lg:border-r' : ''} ${idx === 2 ? 'sm:border-b-0' : ''}`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: hoverSpotlight }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-10 h-10 border flex items-center justify-center ${iconBox}`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${cyanText}`}>
                      &#8595;
                    </span>
                  </div>
                  <h2 className={`text-lg font-semibold tracking-tight mb-2.5 ${textMain}`}>{item.title}</h2>
                  <p className={`text-[13.5px] leading-relaxed ${textSub}`}>{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: PERFORMANCE AT PRODUCTION SCALE (ANIMATED BARS)    */}
        {/* ============================================================ */}
        <section id="performant" ref={perfRef} className={`border-b ${gridLine} scroll-mt-20`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-20 border-x ${gridLine}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-9">
              <div>
                <div className={`text-[11px] uppercase tracking-[0.2em] mb-2.5 ${textMuted}`}>
                  VERIFIED TELEMETRY
                </div>
                <h2 className={`text-3xl sm:text-[38px] font-semibold tracking-[-0.025em] leading-[1.12] mb-2.5 ${textMain}`}>
                  Performance at <span className={cyanText}>production scale</span>
                </h2>
                <p className={`text-[15px] ${textSub}`}>
                  Built for semantic search, recommender systems, and autonomous AI agents in ap-south-1.
                </p>
              </div>
              <Link
                to="/benchmarks"
                className={`inline-flex items-center gap-1.5 text-[13.5px] font-medium pb-1 border-b transition shrink-0 self-start md:self-end no-underline ${
                  dark
                    ? 'text-white border-white/70 hover:text-[#00d2ff] hover:border-[#00d2ff]'
                    : 'text-[#111827] border-[#111827]/70 hover:text-[#0284c7] hover:border-[#0284c7]'
                }`}
              >
                <span>Inspect full benchmarks</span>
                <span className="text-xs leading-none">&#8599;</span>
              </Link>
            </div>

            {/* Radial Dot-Grid Latency Box */}
            <div className={`border ${gridLine} ${cardBg}`}>
              <div className={`px-6 sm:px-8 py-4 border-b ${gridLine} flex flex-wrap items-center justify-between gap-3`}>
                <h3 className={`text-sm font-semibold tracking-tight ${textMain}`}>
                  Verified query latency in ap-south-1 (Mumbai) — 100% Recall@10
                </h3>
                <span className={`text-xs font-medium ${cyanText}`}>
                  50-Worker Concurrent Load · 384d Vectors
                </span>
              </div>

              <div
                className="grid grid-cols-1 lg:grid-cols-2"
                style={{
                  backgroundImage: dark
                    ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(15, 23, 42, 0.1) 1px, transparent 1px)',
                  backgroundSize: '10px 10px',
                }}
              >
                {/* Left Chart: Dense Index */}
                <div className={`p-7 sm:p-8 border-b lg:border-b-0 lg:border-r ${gridLine}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${textMain}`}>Dense Index (384d Cosine)</span>
                      <span
                        title="384-dimensional ONNX all-MiniLM-L6-v2 HNSW cosine similarity in ap-south-1"
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full border text-[10px] ${gridLine} ${textMuted}`}
                      >
                        i
                      </span>
                    </div>
                    <span className={`text-xs ${textMuted}`}>alpha = 1.0</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Min', ms: CANONICAL_SPEC.latency.denseMin.replace(' ', ''), width: '18%' },
                      { label: 'p50', ms: CANONICAL_SPEC.latency.denseP50.replace(' ', ''), width: '26%' },
                      { label: 'p95', ms: CANONICAL_SPEC.latency.denseP95.replace(' ', ''), width: '44%' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-5">
                        <span className={`w-9 text-xs font-medium ${textSub}`}>{row.label}</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div
                            className={`h-5 ${dark ? 'bg-white' : 'bg-slate-900'} transition-all duration-700 ease-out`}
                            style={{ width: barsAnimated ? row.width : '0%' }}
                          />
                          <span className={`text-xs font-semibold ${textMain}`}>{row.ms}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Chart: Hybrid RRF Index */}
                <div className="p-7 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${textMain}`}>Hybrid RRF Index (Dense + BM25)</span>
                      <span
                        title="Reciprocal Rank Fusion (k=60) combining 384d Cosine + Okapi BM25 lexical search"
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full border text-[10px] ${gridLine} ${textMuted}`}
                      >
                        i
                      </span>
                    </div>
                    <span className={`text-xs ${cyanText}`}>RRF k = 60</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Min', ms: CANONICAL_SPEC.latency.hybridMin.replace(' ', ''), width: '38%' },
                      { label: 'p50', ms: CANONICAL_SPEC.latency.hybridP50.replace(' ', ''), width: '54%' },
                      { label: 'p95', ms: CANONICAL_SPEC.latency.hybridP95.replace(' ', ''), width: '78%' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-5">
                        <span className={`w-9 text-xs font-medium ${textSub}`}>{row.label}</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div
                            className="h-5 transition-all duration-700 ease-out"
                            style={{
                              width: barsAnimated ? row.width : '0%',
                              background: dark ? '#00d2ff' : '#0284c7',
                            }}
                          />
                          <span className={`text-xs font-semibold ${textMain}`}>{row.ms}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: INNOVATIVE ARCHITECTURE (3-COLUMN FRAMED LEDGER)   */}
        {/* ============================================================ */}
        <section id="serverless" className={`border-b ${gridLine} scroll-mt-20`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-20 border-x ${gridLine}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-9">
              <div>
                <div className={`text-[11px] uppercase tracking-[0.2em] mb-2.5 ${textMuted}`}>
                  SERVERLESS ENGINE
                </div>
                <h2 className={`text-3xl sm:text-[38px] font-semibold tracking-[-0.025em] leading-[1.12] mb-2.5 ${textMain}`}>
                  Innovative <span className={cyanText}>architecture</span>
                </h2>
                <p className={`text-[15px] max-w-[640px] ${textSub}`}>
                  Backed by Cloudflare R2 object storage and in-process ONNX CPU inference for scalable, always-hot serverless vector search.
                </p>
              </div>
              <Link
                to="/engine"
                className={`inline-flex items-center justify-center px-5 py-2.5 text-[13.5px] font-medium shrink-0 no-underline ${
                  dark ? 'ib-db-plain-btn-dark' : 'ib-db-plain-btn-light'
                }`}
              >
                View Engine Architecture
              </Link>
            </div>

            <div className={`border ${gridLine} ${cardBg} grid grid-cols-1 md:grid-cols-3`}>
              {ARCHITECTURE_CARDS.map((card, idx) => (
                <div
                  key={card.title}
                  onMouseMove={trackCardGlow}
                  className={`group relative p-7 sm:p-8 transition-colors ${
                    idx < 2 ? `border-b md:border-b-0 md:border-r ${gridLine}` : ''
                  }`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: hoverSpotlight }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className={`w-10 h-10 border flex items-center justify-center shrink-0 ${iconBox}`}>
                        {card.icon}
                      </div>
                      <h3 className={`text-base sm:text-lg font-semibold tracking-tight ${textMain}`}>
                        {card.title}
                      </h3>
                    </div>
                    <p className={`text-[13.5px] leading-relaxed ${textSub}`}>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 5: ONE DATABASE, EVERY RETRIEVAL STRATEGY (LIVE!)     */}
        {/* ============================================================ */}
        <section className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-20 border-x ${gridLine}`}>
            <div className="mb-9">
              <div className={`text-[11px] uppercase tracking-[0.2em] mb-2.5 ${textMuted}`}>
                UNIFIED RETRIEVAL
              </div>
              <h2 className={`text-3xl sm:text-[38px] font-semibold tracking-[-0.025em] leading-[1.12] mb-2.5 ${textMain}`}>
                One database, <span className={cyanText}>every retrieval strategy</span>
              </h2>
              <p className={`text-[15px] ${textSub}`}>
                Dense 384d vectors, sparse BM25 lexical tokens, and JSON metadata filters declared in one collection, served from one API.
              </p>
            </div>

            <div
              className={`border ${gridLine} ${cardBg}`}
              onMouseEnter={() => setStrategyPaused(true)}
              onMouseLeave={() => setStrategyPaused(false)}
            >
              {/* 4 Interactive Strategy Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {RETRIEVAL_STRATEGIES.map((item, idx) => {
                  const isSelected = activeStrategy === idx
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveStrategy(idx)}
                      onMouseMove={trackCardGlow}
                      className={`group relative p-7 sm:p-8 text-left transition-colors cursor-pointer ${
                        isSelected ? (dark ? 'bg-[#111319]' : 'bg-sky-50/60') : ''
                      } ${idx < 3 ? `border-b lg:border-b-0 lg:border-r ${gridLine}` : ''} ${
                        idx === 1 ? 'sm:border-r-0 lg:border-r' : ''
                      } ${idx === 2 ? 'sm:border-b-0' : ''}`}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: hoverSpotlight }}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between gap-2 mb-5">
                          <div className={`w-10 h-10 border flex items-center justify-center shrink-0 ${iconBox}`}>
                            {item.icon}
                          </div>
                          <span
                            className={`text-[10.5px] px-2 py-0.5 border font-semibold ${
                              isSelected
                                ? dark
                                  ? 'border-[#00d2ff]/40 text-[#00d2ff] bg-[#00d2ff]/10'
                                  : 'border-[#0284c7]/40 text-[#0284c7] bg-[#0284c7]/10'
                                : `${gridLine} ${textMuted}`
                            }`}
                          >
                            {item.alpha}
                          </span>
                        </div>
                        <h3 className={`text-base font-semibold tracking-tight mb-2.5 ${textMain}`}>
                          {item.title}
                        </h3>
                        <p className={`text-[13.5px] leading-relaxed ${textSub}`}>{item.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Attached Live Query Execution Readout Strip (Single 1px border-t) */}
              <div className={`px-6 sm:px-8 py-4 border-t ${gridLine} ${cardSubBg} flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs`}>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`uppercase tracking-[0.14em] font-semibold ${cyanText}`}>
                    LIVE QUERY
                  </span>
                  <code className={`${textMain} bg-black/20 px-2.5 py-1 border ${gridLine}`}>
                    {currentStrategy.queryPreview}
                  </code>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={textSub}>{currentStrategy.matchPreview}</span>
                  <span className="text-emerald-400 font-semibold">{currentStrategy.latency}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 6: UNCOMPROMISING RELIABILITY (4-COLUMN GRID)         */}
        {/* ============================================================ */}
        <section id="reliable" className={`border-b ${gridLine} scroll-mt-20`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-20 border-x ${gridLine}`}>
            <div className="mb-9">
              <div className={`text-[11px] uppercase tracking-[0.2em] mb-2.5 ${textMuted}`}>
                ALWAYS-ON INFRASTRUCTURE
              </div>
              <h2 className={`text-3xl sm:text-[38px] font-semibold tracking-[-0.025em] leading-[1.12] mb-2.5 ${textMain}`}>
                Uncompromising <span className={cyanText}>reliability</span>
              </h2>
              <p className={`text-[15px] ${textSub}`}>
                Engineered for continuous 24/7 production availability in ap-south-1 (Mumbai).
              </p>
            </div>

            <div className={`border ${gridLine} ${cardBg} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`}>
              {RELIABILITY_CARDS.map((item, idx) => (
                <div
                  key={item.title}
                  onMouseMove={trackCardGlow}
                  className={`group relative p-7 sm:p-8 transition-colors ${
                    idx < 3 ? `border-b lg:border-b-0 lg:border-r ${gridLine}` : ''
                  } ${idx === 1 ? 'sm:border-r-0 lg:border-r' : ''} ${idx === 2 ? 'sm:border-b-0' : ''}`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: hoverSpotlight }}
                  />
                  <div className="relative z-10">
                    <div className={`w-10 h-10 border flex items-center justify-center mb-6 ${iconBox}`}>
                      {item.icon}
                    </div>
                    <h3 className={`text-lg font-semibold tracking-tight mb-2.5 ${textMain}`}>{item.title}</h3>
                    <p className={`text-[13.5px] leading-relaxed ${textSub}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 7: WORLD-CLASS SECURITY (3x2 ARCHITECTURAL GRID)      */}
        {/* ============================================================ */}
        <section id="secure" className={`border-b ${gridLine} scroll-mt-20`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-20 border-x ${gridLine}`}>
            <div className="mb-9">
              <div className={`text-[11px] uppercase tracking-[0.2em] mb-2.5 ${textMuted}`}>
                SOVEREIGN SECURITY
              </div>
              <h2 className={`text-3xl sm:text-[38px] font-semibold tracking-[-0.025em] leading-[1.12] mb-2.5 ${textMain}`}>
                World-class <span className={cyanText}>security</span>
              </h2>
              <p className={`text-[15px] ${textSub}`}>
                Enterprise-grade encryption, DPDP Act 2023 India residency, and zero-trust access controls.
              </p>
            </div>

            <div className={`border ${gridLine} ${cardBg} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}>
              {SECURITY_CARDS.map((item, idx) => {
                const isRow1Lg = idx < 3
                const isNotLastColLg = idx % 3 !== 2
                const isNotLastColMd = idx % 2 === 0
                return (
                  <Link
                    key={item.title}
                    to={item.to}
                    onMouseMove={trackCardGlow}
                    className={`group relative p-7 sm:p-9 transition-colors no-underline border-b ${
                      !isRow1Lg ? 'lg:border-b-0' : ''
                    } ${isNotLastColMd ? 'md:border-r' : 'md:border-r-0'} ${
                      isNotLastColLg ? 'lg:border-r' : 'lg:border-r-0'
                    } ${gridLine}`}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: hoverSpotlight }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-11 h-11 border flex items-center justify-center ${iconBox}`}>
                          {item.icon}
                        </div>
                      </div>
                      <h3 className={`text-lg font-semibold tracking-tight mb-2.5 ${textMain}`}>{item.title}</h3>
                      <p className={`text-[13.5px] leading-relaxed ${textSub}`}>
                        {item.descBefore}
                        <span
                          className={`underline underline-offset-2 transition-colors duration-200 ${
                            dark
                              ? 'decoration-white/40 group-hover:text-white group-hover:decoration-white'
                              : 'decoration-slate-400 group-hover:text-slate-900 group-hover:decoration-slate-900'
                          }`}
                        >
                          {item.descLink}
                        </span>
                        {item.descAfter}
                      </p>
                    </div>
                  </Link>
                )
              })}

              {/* 6th Cell: Security Callout Card (Full Clickable Card + Clean Border Button) */}
              <Link
                to="/security"
                onMouseMove={trackCardGlow}
                className="group relative p-7 sm:p-9 flex flex-col justify-between transition-colors no-underline"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: hoverSpotlight }}
                />
                <div className="relative z-10 text-lg sm:text-xl font-semibold leading-snug tracking-tight mb-6">
                  <span className={textMain}>Built and trusted for </span>
                  <span className={textSub}>
                    India&apos;s most security-conscious AI startups and regulated enterprises.
                  </span>
                </div>
                <div className="relative z-10 pt-2">
                  <span
                    className={`inline-flex items-center justify-center px-5 py-2.5 text-[13.5px] font-medium ${
                      dark ? 'ib-db-plain-btn-dark' : 'ib-db-plain-btn-light'
                    }`}
                  >
                    Learn More
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 8: DEPLOY IN SECONDS (MULTI-TAB CODE WINDOW)          */}
        {/* ============================================================ */}
        <section className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-20 border-x ${gridLine}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column */}
              <div className="lg:col-span-5 pt-2">
                <div className={`text-[11px] uppercase tracking-[0.2em] mb-2.5 ${textMuted}`}>
                  DEVELOPER EXPERIENCE
                </div>
                <h2 className={`text-3xl sm:text-[38px] font-semibold tracking-[-0.025em] leading-[1.12] mb-3 ${textMain}`}>
                  Deploy in <span className={cyanText}>seconds</span>
                </h2>
                <p className={`text-[15.5px] leading-relaxed mb-8 ${textSub}`}>
                  Create a collection, auto-embed raw text on CPU at ₹0/token, and run Hybrid RRF queries in minutes.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <CropMarkButton href={`${D}/signup${themeQuery}`} variant="secondary" dark={dark}>
                    Get an API Key
                  </CropMarkButton>
                  <CropMarkButton to="/docs" variant="secondary" dark={dark}>
                    Quickstart Guide
                  </CropMarkButton>
                </div>
              </div>

              {/* Right Column: Interactive Code Window */}
              <div className="lg:col-span-7">
                <div className={`border ${gridLine} ${cardBg} overflow-hidden`}>
                  <div className={`flex flex-wrap items-center justify-between border-b ${gridLine}`}>
                    <div className="flex items-center">
                      {Object.entries(CODE_TABS).map(([key, tab]) => {
                        const active = codeTab === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setCodeTab(key)}
                            className={`px-4 py-3.5 text-xs font-semibold border-r ${gridLine} transition cursor-pointer ${
                              active
                                ? `${textMain} border-b-2 ${dark ? 'border-b-[#00d2ff]' : 'border-b-[#0284c7]'}`
                                : `${textMuted} hover:${textMain}`
                            }`}
                          >
                            {tab.label}
                          </button>
                        )
                      })}
                      <span className={`hidden sm:inline-block px-4 text-xs ${textMuted}`}>
                        {currentCode.filename}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`px-4 py-3.5 border-l ${gridLine} flex items-center gap-2 text-xs ${textSub} hover:${textMain} transition cursor-pointer`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="p-5 sm:p-6 text-[12.5px] leading-[1.75] overflow-x-auto">
                    {currentCode.lines.map((row) => (
                      <div key={row.ln} className="flex items-baseline">
                        <span className={`w-8 shrink-0 select-none text-right pr-4 ${textMuted}`}>
                          {row.ln}
                        </span>
                        <span className={`whitespace-pre ${textMain}`}>{row.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 9: FLUSH 3-COLUMN BOTTOM CTA BANNER (SINGLE 1PX LINE) */}
        {/* ============================================================ */}
        <section className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto border-x ${gridLine} ${cardBg} grid grid-cols-1 lg:grid-cols-12`}>
            <div className={`lg:col-span-5 px-6 sm:px-10 lg:px-14 py-10 border-b lg:border-b-0 lg:border-r ${gridLine} flex items-center`}>
              <h2 className={`text-2xl sm:text-3xl font-semibold tracking-[-0.02em] leading-snug ${textMain}`}>
                Start building
                <br />
                <span className={cyanText}>knowledgeable AI</span> today
              </h2>
            </div>

            <div className={`lg:col-span-5 px-6 sm:px-10 py-10 border-b lg:border-b-0 lg:border-r ${gridLine} flex items-center`}>
              <p className={`text-[15px] leading-relaxed ${textSub}`}>
                Create your first collection for free in ap-south-1 (100,000 vectors &amp; ₹0/token CPU embeddings), then scale seamlessly as you grow.
              </p>
            </div>

            <div className="lg:col-span-2 p-5 flex flex-col justify-center gap-3">
              <a
                href={`${D}/signup${themeQuery}`}
                className={`w-full py-2.5 px-4 text-center text-[13.5px] font-medium no-underline ${
                  dark ? 'ib-db-cta-solid-dark' : 'ib-db-cta-solid-light'
                }`}
              >
                Start building
              </a>
              <Link
                to="/contact"
                className={`w-full py-2.5 px-4 text-center text-[13.5px] font-medium no-underline ${
                  dark ? 'ib-db-plain-btn-dark' : 'ib-db-plain-btn-light'
                }`}
              >
                Get a demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer dark={dark} />
    </div>
  )
}
