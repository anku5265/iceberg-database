import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, useSessionTheme } from '../components/Navbar'
import Footer from '../components/Footer'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

/**
 * Original Isometric CAD Telemetry Blueprint for Benchmarks Hero (FIG. 02 // LATENCY & RECALL TELEMETRY)
 */
function BenchmarkTelemetryBlueprint({ dark }) {
  const strokeMain = dark ? '#fafaf9' : '#18181b'
  const strokeDim = dark ? 'rgba(250,250,249,0.28)' : 'rgba(24,24,27,0.24)'
  const strokeFaint = dark ? 'rgba(250,250,249,0.14)' : 'rgba(24,24,27,0.12)'
  const blueAccent = dark ? '#3b82f6' : '#2563eb'
  const labelColor = dark ? '#a1a1aa' : '#52525b'
  const nodeFill = dark ? '#111215' : '#f8fafc'

  return (
    <div
      className="relative aspect-square w-full select-none overflow-hidden"
      style={{
        background: dark ? '#111215' : '#f8fafc',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      }}
    >
      <svg viewBox="0 0 600 600" className="w-full h-full block" fill="none">
        {/* Top-Left Technical Caption */}
        <text x="36" y="52" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.3">
          FIG. 02
        </text>
        <text x="36" y="65" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.3">
          LATENCY &amp; RECALL TELEMETRY
        </text>

        {/* Central Isometric Axis Spine */}
        <line x1="300" y1="74" x2="300" y2="510" stroke={strokeDim} strokeWidth="1" strokeDasharray="3 3" />
        <line x1="126.8" y1="180" x2="126.8" y2="410" stroke={strokeFaint} strokeWidth="0.9" strokeDasharray="2 4" />
        <line x1="473.2" y1="180" x2="473.2" y2="410" stroke={strokeFaint} strokeWidth="0.9" strokeDasharray="2 4" />

        {/* Bottom Isometric Base Platform: 50-Worker Concurrency & Quantization Slab */}
        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 410)">
          <rect x="-100" y="-100" width="200" height="200" stroke={strokeMain} strokeWidth="1.2" fill={nodeFill} />
          {[-50, 0, 50].map((p) => (
            <g key={`base-${p}`}>
              <line x1="-100" y1={p} x2="100" y2={p} stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1={p} y1="-100" x2={p} y2="100" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="3 3" />
            </g>
          ))}
        </g>
        <path
          d="M 126.8 410 L 300 510 L 473.2 410 L 473.2 436 L 300 536 L 126.8 436 Z"
          fill={nodeFill}
          stroke={strokeMain}
          strokeWidth="1.1"
        />
        <line x1="300" y1="510" x2="300" y2="536" stroke={strokeMain} strokeWidth="1.1" />

        {/* Middle Isometric Plane: 100% Recall@10 RRF Fusion Wafer */}
        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 320)">
          <rect
            x="-100"
            y="-100"
            width="200"
            height="200"
            stroke={blueAccent}
            strokeWidth="1.25"
            fill={dark ? 'rgba(59,130,246,0.05)' : 'rgba(37,99,235,0.05)'}
          />
          <line x1="-100" y1="0" x2="100" y2="0" stroke={blueAccent} strokeWidth="0.9" strokeDasharray="3 3" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke={blueAccent} strokeWidth="0.9" strokeDasharray="3 3" />
          <circle cx="0" cy="0" r="52" stroke={blueAccent} strokeWidth="1.1" strokeDasharray="4 3" />
          <circle cx="0" cy="0" r="24" stroke={blueAccent} strokeWidth="1.3" fill={nodeFill} />
          <circle cx="0" cy="0" r="5" fill={blueAccent} />
        </g>

        {/* Top Isometric Telemetry Chamber: 3D Latency Percentile Pillars (p50 / p95 / p99) */}
        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 230)">
          <rect x="-100" y="-100" width="200" height="200" stroke={strokeMain} strokeWidth="1.15" />
          {[-50, 0, 50].map((p) => (
            <g key={`top-${p}`}>
              <line x1="-100" y1={p} x2="100" y2={p} stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="2 3" />
              <line x1={p} y1="-100" x2={p} y2="100" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="2 3" />
            </g>
          ))}
        </g>

        {/* Vertical Percentile Distribution Spikes Inside Top Chamber */}
        {[
          { x: 222, yBase: 230, h: 48, accent: false },
          { x: 248, yBase: 245, h: 66, accent: false },
          { x: 274, yBase: 260, h: 88, accent: true },
          { x: 300, yBase: 275, h: 112, accent: true },
          { x: 326, yBase: 260, h: 84, accent: true },
          { x: 352, yBase: 245, h: 62, accent: false },
          { x: 378, yBase: 230, h: 44, accent: false },
        ].map((bar, idx) => (
          <g key={idx}>
            <line
              x1={bar.x}
              y1={bar.yBase}
              x2={bar.x}
              y2={bar.yBase - bar.h}
              stroke={bar.accent ? blueAccent : strokeMain}
              strokeWidth={bar.accent ? '2.2' : '1.4'}
            />
            <circle
              cx={bar.x}
              cy={bar.yBase - bar.h}
              r="3.8"
              fill={bar.accent ? blueAccent : nodeFill}
              stroke={bar.accent ? blueAccent : strokeMain}
              strokeWidth="1.2"
            />
          </g>
        ))}

        {/* Top Isometric Roof Wireframe */}
        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 156)">
          <rect x="-100" y="-100" width="200" height="200" stroke={strokeMain} strokeWidth="1.1" />
        </g>
        <line x1="126.8" y1="156" x2="126.8" y2="230" stroke={strokeMain} strokeWidth="1.1" />
        <line x1="473.2" y1="156" x2="473.2" y2="230" stroke={strokeMain} strokeWidth="1.1" />
        <line x1="300" y1="256" x2="300" y2="330" stroke={strokeMain} strokeWidth="1.1" />

        {/* Technical Callout Leader Lines */}
        <polyline points="432,136 472,108 494,108" fill="none" stroke={strokeMain} strokeWidth="1" />
        <text x="498" y="105" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          01.
        </text>
        <text x="498" y="118" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          1.95MS P50
        </text>

        <polyline points="473,320 494,320" fill="none" stroke={blueAccent} strokeWidth="1" />
        <text x="498" y="316" fill={blueAccent} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          02.
        </text>
        <text x="498" y="329" fill={blueAccent} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          100% RECALL
        </text>

        <polyline points="434,492 472,516 494,516" fill="none" stroke={strokeMain} strokeWidth="1" />
        <text x="498" y="512" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          03.
        </text>
        <text x="498" y="525" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          565 QPS PEAK
        </text>

        {/* Bottom-Left Revision Stamp */}
        <text x="36" y="560" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.5">
          REV 1.0 · AP-SOUTH-1
        </text>
      </svg>
    </div>
  )
}

const MARQUEE_SPECS = [
  '384d Float32 Cosine',
  'HNSW (m=16, ef=64)',
  'Okapi BM25 (k1=1.5)',
  'Hybrid RRF (k=60)',
  'ONNX 384d CPU Runtime',
  'Int8 SQ8 (4x RAM)',
  'Binary BQ (32x RAM)',
  'India ap-south-1',
]

const KEY_BENCHMARK_METRICS = [
  {
    value: '100%',
    label: 'Hybrid RRF Recall@10',
    sub: '40-query ground-truth evaluation · alpha=0.5, k=60',
  },
  {
    value: '1.95ms',
    label: 'Dense HNSW latency (p50)',
    sub: '3.80ms p95 · 10,000 × 384d float32 vectors',
  },
  {
    value: '8.73ms',
    label: 'Hybrid RRF latency (p50)',
    sub: '13.39ms p95 · Simultaneous HNSW + Okapi BM25',
  },
  {
    value: '565 QPS',
    label: 'Peak concurrent throughput',
    sub: '50 parallel workers · 0.00% error rate',
  },
  {
    value: '32x',
    label: 'Binary quantization compression',
    sub: '0.46 MB vs 14.65 MB RAM · 100% recall @ 4x oversample',
  },
  {
    value: '48.2ms',
    label: 'Server-side 384d CPU embed',
    sub: 'Quantized ONNX Runtime · $0 external API cost',
  },
]

const METHODOLOGY_CARDS = [
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path strokeLinecap="round" d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Compute & Region',
    desc: 'All benchmarks executed on production Mumbai (ap-south-1) nodes with zero synthetic caching.',
    bullets: [
      'Hosted in India (ap-south-1 Mumbai)',
      '4 vCPU (x86_64 AVX2 SIMD) · 16 GB RAM',
      'NVMe SSD · Ubuntu 22.04 LTS (Linux 6.x)',
    ],
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
      </svg>
    ),
    title: 'HNSW Graph Index',
    desc: 'In-memory Cosine vector similarity graph powered by Qdrant HNSW segments with SIMD distance scoring.',
    bullets: [
      '384-dimensional float32 Cosine metric',
      'm = 16 bi-directional links per node',
      'ef_construct = 100 · ef_search = 64',
    ],
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Hybrid RRF Fusion',
    desc: 'Dense Cosine HNSW and Sparse Okapi BM25 inverted indexes queried in parallel and fused in sub-millisecond time.',
    bullets: [
      'Okapi BM25 (k1 = 1.5, b = 0.75)',
      'Reciprocal Rank Fusion (k = 60)',
      'Configurable alpha = 0.5 weight',
    ],
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-7 4 14 3-7h4" />
      </svg>
    ),
    title: 'ONNX CPU Runtime',
    desc: 'Server-side text-to-384d vector generation runs in-process on quantized ONNX Runtime threads.',
    bullets: [
      'all-MiniLM-L6-v2 (384d quantized)',
      '20 warm-up + 200 measured runs',
      '$0 external OpenAI/Cohere API keys',
    ],
  },
]

const LATENCY_STAGE_ROWS = [
  {
    code: 'STAGE 01',
    stage: 'Core HNSW Vector Search',
    op: '384d Cosine similarity over 10,000 vectors · top_k=10, ef=64',
    min: '0.13ms',
    p50: '1.95ms',
    p95: '3.80ms',
    p99: '5.12ms',
    barPct: '18%',
    highlight: true,
  },
  {
    code: 'STAGE 02',
    stage: 'Sparse Lexical BM25 Search',
    op: 'Okapi BM25 (k1=1.5, b=0.75) inverted index scan over 10,000 docs',
    min: '4.18ms',
    p50: '6.93ms',
    p95: '11.20ms',
    p99: '14.65ms',
    barPct: '32%',
  },
  {
    code: 'STAGE 03',
    stage: 'Hybrid RRF Fusion Search',
    op: 'Simultaneous Dense HNSW + Sparse BM25 fused via RRF (k=60, alpha=0.5)',
    min: '5.84ms',
    p50: '8.73ms',
    p95: '13.39ms',
    p99: '17.85ms',
    barPct: '42%',
    highlight: true,
  },
  {
    code: 'STAGE 04',
    stage: 'Server-Side 384d CPU Embed',
    op: 'In-process quantized ONNX all-MiniLM-L6-v2 text-to-vector inference',
    min: '48.2ms',
    p50: '62.4ms',
    p95: '84.0ms',
    p99: '96.5ms',
    barPct: '72%',
  },
  {
    code: 'STAGE 05',
    stage: 'End-to-End Hybrid Query',
    op: 'HTTPS keep-alive + 384d ONNX CPU embedding + Hybrid RRF search',
    min: '55.4ms',
    p50: '72.8ms',
    p95: '96.2ms',
    p99: '112.4ms',
    barPct: '84%',
  },
  {
    code: 'STAGE 06',
    stage: '4-Tier Agent Memory Recall',
    op: 'POST /memory/recall · 384d semantic similarity + automatic TTL filter',
    min: '52.0ms',
    p50: '68.5ms',
    p95: '91.4ms',
    p99: '108.0ms',
    barPct: '78%',
  },
]

const SCALE_ROWS = [
  {
    code: '1K CORPUS',
    vectors: '1,000 Vectors',
    mode: 'Float32 (384d Cosine · Full Precision)',
    p50_ms: '1.20ms',
    p95_ms: '6.98ms',
    qps: '510 QPS',
    ram_mb: '1.46 MB',
    recall: '100.0%',
    highlight: true,
  },
  {
    code: '10K CORPUS',
    vectors: '10,000 Vectors',
    mode: 'Float32 (384d Cosine · Full Precision)',
    p50_ms: '2.53ms',
    p95_ms: '6.11ms',
    qps: '324 QPS',
    ram_mb: '14.65 MB',
    recall: '100.0%',
    highlight: true,
  },
  {
    code: '50K CORPUS',
    vectors: '50,000 Vectors',
    mode: 'Float32 (384d Cosine · Full Precision)',
    p50_ms: '4.24ms',
    p95_ms: '5.97ms',
    qps: '225 QPS',
    ram_mb: '73.24 MB',
    recall: '100.0%',
    highlight: true,
  },
  {
    code: 'INT8 SQ8',
    vectors: '10,000 Vectors',
    mode: 'Scalar Quantization (4x RAM Compression)',
    p50_ms: '36.82ms',
    p95_ms: '54.77ms',
    qps: '27 QPS',
    ram_mb: '3.66 MB',
    recall: '98.4%',
  },
  {
    code: 'BINARY BQ',
    vectors: '10,000 Vectors',
    mode: 'Binary Quantization (32x RAM Compression · 4x Oversample)',
    p50_ms: '13.55ms',
    p95_ms: '22.50ms',
    qps: '74 QPS',
    ram_mb: '0.46 MB',
    recall: '100.0%',
    highlight: true,
  },
]

const CONCURRENCY_ROWS = [
  {
    code: 'SEQUENTIAL',
    users: '1 Concurrent Worker',
    dataset: '500 sequential hybrid queries over 10,000 × 384d vectors',
    min_ms: '1.59ms',
    p50_ms: '1.99ms',
    p95_ms: '2.92ms',
    p99_ms: '11.42ms',
    qps: '149 QPS',
    errors: '0.00%',
  },
  {
    code: 'PARALLEL',
    users: '10 Concurrent Workers',
    dataset: '500 parallel hybrid queries across 10 worker threads',
    min_ms: '2.96ms',
    p50_ms: '14.16ms',
    p95_ms: '29.56ms',
    p99_ms: '42.21ms',
    qps: '470 QPS',
    errors: '0.00%',
    highlight: true,
  },
  {
    code: 'HIGH BURST',
    users: '50 Concurrent Workers',
    dataset: '500 high-burst parallel queries across 50 worker threads',
    min_ms: '3.43ms',
    p50_ms: '37.88ms',
    p95_ms: '81.25ms',
    p99_ms: '105.64ms',
    qps: '565 QPS',
    errors: '0.00%',
    highlight: true,
  },
]

const ACCURACY_CARDS = [
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
      </svg>
    ),
    badge: '95.0% RECALL@10',
    title: 'Dense Vector HNSW',
    desc: 'In-memory 384d Cosine graph walk for fast conceptual similarity, best paired with lexical fusion for exact IDs.',
    bullets: [
      '1.95ms median (p50) latency',
      '95.0% Recall@10 accuracy',
      '384d float32 Cosine graph',
    ],
    to: '/product/database',
    cta: 'Explore Vector Engine →',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h14" />
      </svg>
    ),
    badge: '90.0% RECALL@10',
    title: 'Sparse Okapi BM25',
    desc: 'Inverted keyword index engineered for exact token matching on SKUs, invoice numbers, GSTINs, and error codes.',
    bullets: [
      '6.93ms median (p50) latency',
      '90.0% Recall@10 accuracy',
      'Okapi BM25 (k1=1.5, b=0.75)',
    ],
    to: '/product/database',
    cta: 'Explore Lexical Index →',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    badge: '100.0% RECALL@10',
    title: 'Hybrid RRF Fusion',
    desc: 'Simultaneous Dense HNSW and Sparse BM25 retrieval fused via Reciprocal Rank Fusion (k=60) with zero missed hits.',
    bullets: [
      '8.73ms median (p50) latency',
      '100.0% Recall@10 accuracy',
      'Configurable alpha=0.5 weight',
    ],
    to: '/engine',
    cta: 'Explore Hybrid RRF →',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    badge: '$0 EMBEDDING TAX',
    title: 'Honest Engine Scope',
    desc: 'Built on Qdrant HNSW segments for raw vector speed, adding native 384d ONNX CPU embeddings and 4-tier Agent Memory.',
    bullets: [
      'Built-in 384d CPU embeddings',
      '4-tier cognitive agent memory',
      'India residency (ap-south-1)',
    ],
    to: '/product/memory',
    cta: 'Explore Agent Memory →',
  },
]

const REPRODUCE_STAGES = [
  {
    num: '01',
    title: '384d CPU Ingestion',
    sub: 'In-process ONNX all-MiniLM-L6-v2 ($0 API key)',
    badge: '48.2ms MIN',
    telemetryTitle: 'STAGE 01 // 384D CPU INGESTION',
    telemetryRows: [
      { label: 'EMBEDDING ENGINE', val: 'In-process 384d ONNX (all-MiniLM-L6-v2)' },
      { label: 'INGESTION LATENCY', val: '48.2 ms min · 62.4 ms p50 ($0 API key)' },
      { label: 'VERIFIED STDOUT', val: '[PASS] Indexed 384d vector in 48.2 ms' },
    ],
  },
  {
    num: '02',
    title: 'Hybrid RRF Search',
    sub: 'Dense HNSW + Okapi BM25 across 200 queries',
    badge: '8.73ms P50',
    telemetryTitle: 'STAGE 02 // HYBRID RRF ENGINE',
    telemetryRows: [
      { label: 'FUSION ALGORITHM', val: 'Dense Cosine HNSW + BM25 via RRF (k=60)' },
      { label: 'LATENCY PERCENTILES', val: '1.95 ms HNSW p50 · 8.73 ms Hybrid p50' },
      { label: 'RECALL@10 ACCURACY', val: '100.0% Recall@10 across 40 test queries' },
    ],
  },
  {
    num: '03',
    title: 'Burst & Agent Memory',
    sub: '50-worker load test + 4-tier semantic recall',
    badge: '565 QPS',
    telemetryTitle: 'STAGE 03 // CONCURRENCY & MEMORY',
    telemetryRows: [
      { label: '50-WORKER THROUGHPUT', val: '565 QPS (HNSW) · 397 QPS (Hybrid RRF)' },
      { label: '4-TIER MEMORY RECALL', val: 'score=0.96 · 52.0 ms min (TTL filtered)' },
      { label: 'RELIABILITY SLA', val: '0.00% error rate · 0ms cold start' },
    ],
  },
]

const REPRODUCE_LANGS = {
  python: {
    label: 'Python',
    files: ['01_ingest.py', '02_hybrid_rrf.py', '03_memory_qps.py'],
    install: 'pip install iceberg-VectorDB==1.0.0',
    stages: [
      {
        raw: `from iceberg import Client

client = Client(api_key="ib_your_key")
client.create_collection("bench_test")

# Server-Side 384d ONNX CPU Embed ($0 external API key)
client.index_text("bench_test", "Hybrid RRF in ap-south-1.", source="bench")`,
        lines: [
          <><span style={{ color: '#71717a' }}># Step 01: In-process 384d ONNX CPU embed ($0 API key)</span></>,
          <><span style={{ color: '#3b82f6' }}>from</span> <span style={{ color: '#e4e4e7' }}>iceberg</span> <span style={{ color: '#3b82f6' }}>import</span> <span style={{ color: '#ffffff', fontWeight: 500 }}>Client</span></>,
          <>{'\u00A0'}</>,
          <><span style={{ color: '#e4e4e7' }}>client</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#ffffff', fontWeight: 500 }}>Client</span><span style={{ color: '#a1a1aa' }}>(api_key=</span><span style={{ color: '#93c5fd' }}>"ib_your_key"</span><span style={{ color: '#a1a1aa' }}>)</span></>,
          <><span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>create_collection</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>)</span></>,
          <><span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>index_text</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"Hybrid RRF in ap-south-1."</span><span style={{ color: '#a1a1aa' }}>)</span></>,
        ],
      },
      {
        raw: `# Step 02: Simultaneous Dense HNSW + Sparse BM25 via RRF (k=60)
hits = client.search(
    collection="bench_test",
    query="India vector latency benchmark",
    search_type="hybrid", top_k=5
)`,
        lines: [
          <><span style={{ color: '#71717a' }}># Step 02: Dense Cosine HNSW + Sparse BM25 via RRF</span></>,
          <><span style={{ color: '#e4e4e7' }}>hits</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>search</span><span style={{ color: '#a1a1aa' }}>(</span></>,
          <>  <span style={{ color: '#e4e4e7' }}>collection</span><span style={{ color: '#71717a' }}>=</span><span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#e4e4e7' }}>query</span><span style={{ color: '#71717a' }}>=</span><span style={{ color: '#93c5fd' }}>"India vector latency benchmark"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#e4e4e7' }}>search_type</span><span style={{ color: '#71717a' }}>=</span><span style={{ color: '#93c5fd' }}>"hybrid"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#e4e4e7' }}>top_k</span><span style={{ color: '#71717a' }}>=</span><span style={{ color: '#3b82f6' }}>5</span></>,
          <><span style={{ color: '#a1a1aa' }}>)</span></>,
        ],
      },
      {
        raw: `# Step 03: 4-Tier Cognitive Agent Memory Store & Recall
client.remember(
    "bench_agent", "User builds with FastAPI + React",
    memory_type="long_term"
)
mem = client.recall("bench_agent", "preferred stack?", top_k=1)`,
        lines: [
          <><span style={{ color: '#71717a' }}># Step 03: 4-Tier Cognitive Agent Memory Recall</span></>,
          <><span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>remember</span><span style={{ color: '#a1a1aa' }}>(</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"bench_agent"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"User builds with FastAPI + React"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#e4e4e7' }}>memory_type</span><span style={{ color: '#71717a' }}>=</span><span style={{ color: '#93c5fd' }}>"long_term"</span></>,
          <><span style={{ color: '#a1a1aa' }}>)</span></>,
          <><span style={{ color: '#e4e4e7' }}>mem</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>recall</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_agent"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"preferred stack?"</span><span style={{ color: '#a1a1aa' }}>)</span></>,
        ],
      },
    ],
  },
  javascript: {
    label: 'JavaScript',
    files: ['01_ingest.mjs', '02_hybrid_rrf.mjs', '03_memory_qps.mjs'],
    install: 'npm install iceberg-js@1.0.0',
    stages: [
      {
        raw: `import { IcebergClient } from "iceberg-js";

const client = new IcebergClient({ apiKey: "ib_your_key" });
await client.createCollection("bench_test");
await client.indexText("bench_test", "Hybrid RRF in ap-south-1.");`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 01: In-process 384d ONNX CPU embed ($0 API key)</span></>,
          <><span style={{ color: '#3b82f6' }}>import</span> <span style={{ color: '#a1a1aa' }}>{'{'}</span> <span style={{ color: '#ffffff', fontWeight: 500 }}>IcebergClient</span> <span style={{ color: '#a1a1aa' }}>{'}'}</span> <span style={{ color: '#3b82f6' }}>from</span> <span style={{ color: '#93c5fd' }}>"iceberg-js"</span><span style={{ color: '#a1a1aa' }}>;</span></>,
          <>{'\u00A0'}</>,
          <><span style={{ color: '#3b82f6' }}>const</span> <span style={{ color: '#e4e4e7' }}>client</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#3b82f6' }}>new</span> <span style={{ color: '#ffffff', fontWeight: 500 }}>IcebergClient</span><span style={{ color: '#a1a1aa' }}>({'{'} apiKey: </span><span style={{ color: '#93c5fd' }}>"ib_your_key"</span><span style={{ color: '#a1a1aa' }}> {'}'});</span></>,
          <><span style={{ color: '#3b82f6' }}>await</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>createCollection</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>);</span></>,
          <><span style={{ color: '#3b82f6' }}>await</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>indexText</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"Hybrid RRF in ap-south-1."</span><span style={{ color: '#a1a1aa' }}>);</span></>,
        ],
      },
      {
        raw: `// Step 02: Dense Cosine HNSW + Sparse BM25 via RRF
const hits = await client.search("bench_test", "India vector latency", {
  searchType: "hybrid",
  topK: 5,
});`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 02: Dense Cosine HNSW + Sparse BM25 via RRF</span></>,
          <><span style={{ color: '#3b82f6' }}>const</span> <span style={{ color: '#e4e4e7' }}>hits</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#3b82f6' }}>await</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>search</span><span style={{ color: '#a1a1aa' }}>(</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"India vector latency"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#a1a1aa' }}>{'{'} searchType: </span><span style={{ color: '#93c5fd' }}>"hybrid"</span><span style={{ color: '#a1a1aa' }}>, topK: </span><span style={{ color: '#3b82f6' }}>5</span><span style={{ color: '#a1a1aa' }}> {'}'}</span></>,
          <><span style={{ color: '#a1a1aa' }}>);</span></>,
          <><span style={{ color: '#e4e4e7' }}>console</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>log</span><span style={{ color: '#a1a1aa' }}>(hits[</span><span style={{ color: '#3b82f6' }}>0</span><span style={{ color: '#a1a1aa' }}>].score);</span></>,
        ],
      },
      {
        raw: `// Step 03: 4-Tier Cognitive Agent Memory Recall
await client.remember("bench_agent", "User builds with FastAPI + React", {
  memoryType: "long_term",
});
const mem = await client.recall("bench_agent", "preferred stack?");`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 03: 4-Tier Cognitive Agent Memory Recall</span></>,
          <><span style={{ color: '#3b82f6' }}>await</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>remember</span><span style={{ color: '#a1a1aa' }}>(</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"bench_agent"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"User builds with FastAPI + React"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#a1a1aa' }}>{'{'} memoryType: </span><span style={{ color: '#93c5fd' }}>"long_term"</span><span style={{ color: '#a1a1aa' }}> {'}'}</span></>,
          <><span style={{ color: '#a1a1aa' }}>);</span></>,
          <><span style={{ color: '#3b82f6' }}>const</span> <span style={{ color: '#e4e4e7' }}>mem</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#3b82f6' }}>await</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>recall</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_agent"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"preferred stack?"</span><span style={{ color: '#a1a1aa' }}>);</span></>,
        ],
      },
    ],
  },
  go: {
    label: 'Go',
    files: ['01_ingest.go', '02_hybrid_rrf.go', '03_memory_qps.go'],
    install: 'go get github.com/icebergdb/iceberg-go@v1.0.0',
    stages: [
      {
        raw: `package main
import "github.com/icebergdb/iceberg-go"

func main() {
    client := iceberg.NewClient("ib_your_key")
    _ = client.IndexText("bench_test", "Hybrid RRF in ap-south-1.", "bench", nil)
}`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 01: In-process 384d ONNX CPU embed ($0 API key)</span></>,
          <><span style={{ color: '#3b82f6' }}>package</span> <span style={{ color: '#e4e4e7' }}>main</span></>,
          <><span style={{ color: '#3b82f6' }}>import</span> <span style={{ color: '#93c5fd' }}>"github.com/icebergdb/iceberg-go"</span></>,
          <><span style={{ color: '#3b82f6' }}>func</span> <span style={{ color: '#ffffff', fontWeight: 500 }}>main</span><span style={{ color: '#a1a1aa' }}>() {'{'}</span></>,
          <>  <span style={{ color: '#e4e4e7' }}>client</span> <span style={{ color: '#71717a' }}>:=</span> <span style={{ color: '#e4e4e7' }}>iceberg</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>NewClient</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"ib_your_key"</span><span style={{ color: '#a1a1aa' }}>)</span></>,
          <>  <span style={{ color: '#e4e4e7' }}>_</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>IndexText</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"Hybrid RRF in ap-south-1."</span><span style={{ color: '#a1a1aa' }}>)</span></>,
        ],
      },
      {
        raw: `// Step 02: Dense Cosine HNSW + Sparse BM25 via RRF
hits, err := client.Search(
    "bench_test",
    "India vector latency",
    5, "hybrid",
)`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 02: Dense Cosine HNSW + Sparse BM25 via RRF</span></>,
          <><span style={{ color: '#e4e4e7' }}>hits, err</span> <span style={{ color: '#71717a' }}>:=</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>Search</span><span style={{ color: '#a1a1aa' }}>(</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"India vector latency"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#3b82f6' }}>5</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"hybrid"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <><span style={{ color: '#a1a1aa' }}>)</span></>,
        ],
      },
      {
        raw: `// Step 03: 4-Tier Cognitive Agent Memory Recall
_ = client.Remember("bench_agent", "User builds with FastAPI + React", "long_term")
mem, _ := client.Recall("bench_agent", "preferred stack?", 1)`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 03: 4-Tier Cognitive Agent Memory Recall</span></>,
          <><span style={{ color: '#e4e4e7' }}>_</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>Remember</span><span style={{ color: '#a1a1aa' }}>(</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"bench_agent"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"User builds with FastAPI + React"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"long_term"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <><span style={{ color: '#a1a1aa' }}>)</span></>,
          <><span style={{ color: '#e4e4e7' }}>mem, _</span> <span style={{ color: '#71717a' }}>:=</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>Recall</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_agent"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"preferred stack?"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#3b82f6' }}>1</span><span style={{ color: '#a1a1aa' }}>)</span></>,
        ],
      },
    ],
  },
  rust: {
    label: 'Rust',
    files: ['01_ingest.rs', '02_hybrid_rrf.rs', '03_memory_qps.rs'],
    install: 'cargo add iceberg-client@1.0.0',
    stages: [
      {
        raw: `use iceberg_client::Client;

let client = Client::new("ib_your_key");
client.create_collection("bench_test").await?;
client.index_text("bench_test", "Hybrid RRF in ap-south-1.").await?;`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 01: In-process 384d ONNX CPU embed ($0 API key)</span></>,
          <><span style={{ color: '#3b82f6' }}>use</span> <span style={{ color: '#e4e4e7' }}>iceberg_client::</span><span style={{ color: '#ffffff', fontWeight: 500 }}>Client</span><span style={{ color: '#a1a1aa' }}>;</span></>,
          <>{'\u00A0'}</>,
          <><span style={{ color: '#3b82f6' }}>let</span> <span style={{ color: '#e4e4e7' }}>client</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#ffffff', fontWeight: 500 }}>Client::new</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"ib_your_key"</span><span style={{ color: '#a1a1aa' }}>);</span></>,
          <><span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>create_collection</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>).</span><span style={{ color: '#3b82f6' }}>await</span><span style={{ color: '#a1a1aa' }}>?;</span></>,
          <><span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>index_text</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"Hybrid RRF in ap-south-1."</span><span style={{ color: '#a1a1aa' }}>).</span><span style={{ color: '#3b82f6' }}>await</span><span style={{ color: '#a1a1aa' }}>?;</span></>,
        ],
      },
      {
        raw: `// Step 02: Dense Cosine HNSW + Sparse BM25 via RRF
let hits = client.search(
    "bench_test",
    "India vector latency",
    5, "hybrid"
).await?;`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 02: Dense Cosine HNSW + Sparse BM25 via RRF</span></>,
          <><span style={{ color: '#3b82f6' }}>let</span> <span style={{ color: '#e4e4e7' }}>hits</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>search</span><span style={{ color: '#a1a1aa' }}>(</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"bench_test"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"India vector latency"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#3b82f6' }}>5</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"hybrid"</span></>,
          <><span style={{ color: '#a1a1aa' }}>).</span><span style={{ color: '#3b82f6' }}>await</span><span style={{ color: '#a1a1aa' }}>?;</span></>,
        ],
      },
      {
        raw: `// Step 03: 4-Tier Cognitive Agent Memory Recall
client.remember("bench_agent", "User builds with FastAPI + React", "long_term").await?;
let mem = client.recall("bench_agent", "preferred stack?", 1).await?;`,
        lines: [
          <><span style={{ color: '#71717a' }}>// Step 03: 4-Tier Cognitive Agent Memory Recall</span></>,
          <><span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>remember</span><span style={{ color: '#a1a1aa' }}>(</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"bench_agent"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"User builds with FastAPI + React"</span><span style={{ color: '#a1a1aa' }}>,</span></>,
          <>  <span style={{ color: '#93c5fd' }}>"long_term"</span></>,
          <><span style={{ color: '#a1a1aa' }}>).</span><span style={{ color: '#3b82f6' }}>await</span><span style={{ color: '#a1a1aa' }}>?;</span></>,
          <><span style={{ color: '#3b82f6' }}>let</span> <span style={{ color: '#e4e4e7' }}>mem</span> <span style={{ color: '#71717a' }}>=</span> <span style={{ color: '#e4e4e7' }}>client</span><span style={{ color: '#a1a1aa' }}>.</span><span style={{ color: '#ffffff', fontWeight: 500 }}>recall</span><span style={{ color: '#a1a1aa' }}>(</span><span style={{ color: '#93c5fd' }}>"bench_agent"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#93c5fd' }}>"preferred stack?"</span><span style={{ color: '#a1a1aa' }}>, </span><span style={{ color: '#3b82f6' }}>1</span><span style={{ color: '#a1a1aa' }}>).</span><span style={{ color: '#3b82f6' }}>await</span><span style={{ color: '#a1a1aa' }}>?;</span></>,
        ],
      },
    ],
  },
}

export default function Benchmarks() {
  const [dark] = useSessionTheme()
  const [activeTab, setActiveTab] = useState('latency') // 'latency' | 'scale' | 'concurrency'
  const [reproduceStep, setReproduceStep] = useState(0) // 0 | 1 | 2
  const [codeLang, setCodeLang] = useState('python')
  const [copiedScript, setCopiedScript] = useState(false)
  const [copiedInstall, setCopiedInstall] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const copyScript = () => {
    navigator.clipboard.writeText(REPRODUCE_LANGS[codeLang].stages[reproduceStep].raw)
    setCopiedScript(true)
    setTimeout(() => setCopiedScript(false), 2000)
  }

  const copyInstallCmd = () => {
    navigator.clipboard.writeText(REPRODUCE_LANGS[codeLang].install)
    setCopiedInstall(true)
    setTimeout(() => setCopiedInstall(false), 2000)
  }

  const bg = dark ? '#0a0b0d' : '#ffffff'
  const paperBg = dark ? '#111215' : '#f8fafc'
  const gridLine = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const textPrimary = dark ? '#fafaf9' : '#111827'
  const textSecondary = dark ? '#a1a1aa' : '#52525b'
  const eyebrowMuted = dark ? '#71717a' : '#6b7280'
  const blueAccent = dark ? '#3b82f6' : '#2563eb'
  const blueCellTint = dark ? 'rgba(29, 107, 243, 0.06)' : 'rgba(37, 99, 235, 0.04)'

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: bg, color: textPrimary }}>
      <Navbar />

      {/* ── Section 1: Hero + Isometric CAD Telemetry Blueprint (FIG. 02) ── */}
      <section style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-12 py-12 md:py-16"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-10">
            {/* Left Column (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              <span
                className="block text-[11px] font-mono font-medium uppercase tracking-[0.18em]"
                style={{ color: blueAccent }}
              >
                BENCHMARKS
              </span>

              <h1 className="text-4xl sm:text-[46px] lg:text-[52px] font-semibold leading-[1.08] tracking-[-0.025em]">
                Measured speed and recall{' '}
                <span style={{ color: blueAccent }}>built for production scale</span>
              </h1>

              <p className="text-[16px] sm:text-[17px] leading-[1.6] max-w-[490px]" style={{ color: textSecondary }}>
                Verified p50 / p95 / p99 latency percentiles, 100% Hybrid RRF Recall@10 evaluation, 50-worker concurrency scaling, and reproducible Python telemetry in ap-south-1.
              </p>

              {/* Exact Pinecone Royal Blue Primary + Dark Bordered Secondary Buttons with CAD Crop-Mark Ticks */}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <a
                  href={`${D}/signup${!dark ? '?theme=light' : ''}`}
                  className="relative inline-flex items-center justify-center px-6 py-3 text-[14px] font-medium text-white bg-[#1d6bf3] hover:bg-[#1559d6] transition no-underline"
                  style={{ '--ib-corner-color': '#3b82f6' }}
                >
                  <span className="ib-corner-tl" />
                  <span className="ib-corner-tr" />
                  <span className="ib-corner-bl" />
                  <span className="ib-corner-br" />
                  Start building free
                </a>

                <a
                  href="#reproduce"
                  className="relative inline-flex items-center justify-center px-6 py-3 text-[14px] font-medium transition no-underline"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${dark ? '#2e2e34' : 'rgba(0,0,0,0.22)'}`,
                    color: textPrimary,
                    '--ib-corner-color': dark ? '#a1a1aa' : '#52525b',
                  }}
                >
                  <span className="ib-corner-tl" />
                  <span className="ib-corner-tr" />
                  <span className="ib-corner-bl" />
                  <span className="ib-corner-br" />
                  Reproducible script &rarr;
                </a>
              </div>
            </div>

            {/* Right Column (5 cols): Isometric CAD Telemetry Blueprint */}
            <div className="md:col-span-5">
              <BenchmarkTelemetryBlueprint dark={dark} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Dotted Marquee Strip ── */}
      <section style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto py-7 px-6 overflow-hidden"
          style={{
            borderLeft: `1px solid ${gridLine}`,
            borderRight: `1px solid ${gridLine}`,
            backgroundImage: dark
              ? 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)'
              : 'radial-gradient(rgba(0,0,0,0.14) 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              maskImage: 'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)',
            }}
          >
            <div className="marquee-track" style={{ gap: '64px', alignItems: 'center' }}>
              {[...MARQUEE_SPECS, ...MARQUEE_SPECS].map((item, idx) => (
                <span
                  key={idx}
                  className="text-[17px] font-semibold tracking-[-0.02em] flex-shrink-0 select-none"
                  style={{ color: textPrimary, opacity: 0.9 }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: PERFORMANCE ("Built for the workloads that matter" — Inset Framed 2x3 Numbers Grid) ── */}
      <section style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div className="mb-10">
            <span
              className="block text-[11px] font-mono uppercase tracking-[0.18em] mb-3"
              style={{ color: eyebrowMuted }}
            >
              PERFORMANCE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em]">
              Built for the workloads that matter
            </h2>
          </div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3"
            style={{ border: `1px solid ${gridLine}`, background: paperBg }}
          >
            {KEY_BENCHMARK_METRICS.map((m, idx) => (
              <div
                key={m.label}
                className="flex flex-col gap-1.5 px-8 py-10"
                style={{
                  borderRight: (idx + 1) % 3 !== 0 ? `1px solid ${gridLine}` : 'none',
                  borderBottom: idx < 3 ? `1px solid ${gridLine}` : 'none',
                }}
              >
                <span className="text-5xl md:text-[56px] font-bold tabular-nums leading-none tracking-tight whitespace-nowrap">
                  {m.value}
                </span>
                <span className="mt-3 text-sm font-medium" style={{ color: blueAccent }}>
                  {m.label}
                </span>
                <span className="text-xs" style={{ color: textSecondary }}>
                  {m.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: METHODOLOGY ("Hardware and index configuration" — Inset Framed 4-Column Grid) ── */}
      <section style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div className="mb-10">
            <span
              className="block text-[11px] font-mono uppercase tracking-[0.18em] mb-3"
              style={{ color: eyebrowMuted }}
            >
              METHODOLOGY
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em] mb-3">
              Hardware and index configuration
            </h2>
            <p className="text-sm sm:text-[15px]" style={{ color: textSecondary }}>
              Every latency and recall metric on this page was recorded under the exact compute, vector dimension, HNSW graph, and Okapi BM25 parameters below.
            </p>
          </div>

          <div style={{ border: `1px solid ${gridLine}`, background: paperBg }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {METHODOLOGY_CARDS.map((card, i) => (
                <div
                  key={card.title}
                  className="flex flex-col p-8"
                  style={{
                    borderRight: i < 3 ? `1px solid ${gridLine}` : 'none',
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center mb-6"
                    style={{ border: `1px solid ${gridLine}`, background: bg }}
                  >
                    {card.icon}
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{card.title}</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: textSecondary }}>
                    {card.desc}
                  </p>

                  <ul className="space-y-2.5 mt-auto text-xs" style={{ color: textSecondary }}>
                    {card.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={blueAccent}
                          strokeWidth="2.4"
                          className="mt-0.5 shrink-0"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                        </svg>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="flex justify-center py-6"
              style={{ borderTop: `1px solid ${gridLine}` }}
            >
              <a
                href="/benchmark-report.json"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium hover:underline no-underline"
                style={{ color: blueAccent }}
              >
                Download raw /benchmark-report.json telemetry &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: TELEMETRY LEDGER (True Pinecone Architectural Vertical+Horizontal Cell Grid) ── */}
      <section style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <span
                className="block text-[11px] font-mono uppercase tracking-[0.18em] mb-3"
                style={{ color: eyebrowMuted }}
              >
                TELEMETRY LEDGER
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em] mb-2">
                Latency percentiles, corpus scale, and concurrency
              </h2>
              <p className="text-sm sm:text-[15px]" style={{ color: textSecondary }}>
                Inspect stage-by-stage p50 / p95 / p99 latencies, dataset scaling (1K to 50K vectors), and 50-worker burst load tests.
              </p>
            </div>

            {/* Pinecone-Style Segmented Switcher Buttons */}
            <div
              className="inline-flex items-center self-start lg:self-end shrink-0"
              style={{ border: `1px solid ${gridLine}`, background: bg }}
            >
              {[
                { id: 'latency', label: 'Stage Latencies' },
                { id: 'scale', label: 'Corpus Scale' },
                { id: 'concurrency', label: 'Concurrency' },
              ].map((t, idx) => {
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className="px-4 sm:px-5 py-2.5 text-xs sm:text-[13px] font-medium transition cursor-pointer whitespace-nowrap"
                    style={{
                      borderRight: idx < 2 ? `1px solid ${gridLine}` : 'none',
                      background: active ? '#1d6bf3' : 'transparent',
                      color: active ? '#ffffff' : textSecondary,
                    }}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Architectural Grid Box with Crisp Vertical + Horizontal Cell Borders & Zero Wrapping */}
          <div style={{ border: `1px solid ${gridLine}`, background: paperBg }}>
            {/* TAB 1: STAGE-BY-STAGE LATENCY GRID */}
            {activeTab === 'latency' && (
              <div>
                {/* Column Header Row */}
                <div
                  className="hidden md:grid md:grid-cols-12 text-[11px] font-mono uppercase tracking-[0.14em]"
                  style={{ borderBottom: `1px solid ${gridLine}`, background: bg, color: eyebrowMuted }}
                >
                  <div className="col-span-6 px-7 py-4" style={{ borderRight: `1px solid ${gridLine}` }}>
                    ENGINE SUBSYSTEM &amp; OPERATION
                  </div>
                  <div className="col-span-1 px-4 py-4 text-right" style={{ borderRight: `1px solid ${gridLine}` }}>
                    MIN
                  </div>
                  <div
                    className="col-span-2 px-5 py-4 text-right font-semibold"
                    style={{ borderRight: `1px solid ${gridLine}`, color: blueAccent, background: blueCellTint }}
                  >
                    P50 (MEDIAN)
                  </div>
                  <div className="col-span-1 px-4 py-4 text-right" style={{ borderRight: `1px solid ${gridLine}` }}>
                    P95
                  </div>
                  <div className="col-span-2 px-6 py-4 text-right">
                    P99
                  </div>
                </div>

                {/* Data Rows */}
                {LATENCY_STAGE_ROWS.map((r, idx) => (
                  <div
                    key={r.code}
                    className="grid grid-cols-1 md:grid-cols-12 items-stretch"
                    style={{
                      borderBottom: idx < LATENCY_STAGE_ROWS.length - 1 ? `1px solid ${gridLine}` : 'none',
                    }}
                  >
                    {/* Left Cell (6 cols): Stage Badge + Title + Single-Line Subtitle */}
                    <div
                      className="md:col-span-6 px-6 sm:px-7 py-5 flex flex-col justify-center gap-1"
                      style={{ borderRight: `1px solid ${gridLine}` }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] px-2 py-0.5 shrink-0"
                          style={{
                            border: `1px solid ${r.highlight ? blueAccent : gridLine}`,
                            color: r.highlight ? blueAccent : textSecondary,
                            background: bg,
                          }}
                        >
                          {r.code}
                        </span>
                        <span className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: textPrimary }}>
                          {r.stage}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>
                        {r.op}
                      </p>
                    </div>

                    {/* Right Metric Cells (6 cols split 1 + 2 + 1 + 2) */}
                    <div className="md:col-span-6 grid grid-cols-4 md:grid-cols-6 items-stretch">
                      {/* MIN */}
                      <div
                        className="col-span-1 px-4 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}` }}
                      >
                        <span className="md:hidden text-[9px] font-mono uppercase mb-1" style={{ color: eyebrowMuted }}>
                          MIN
                        </span>
                        <span className="font-mono text-sm font-medium tabular-nums whitespace-nowrap" style={{ color: textSecondary }}>
                          {r.min}
                        </span>
                      </div>

                      {/* P50 (MEDIAN) — Highlighted */}
                      <div
                        className="col-span-1 md:col-span-2 px-5 py-5 flex flex-col justify-center items-end gap-1.5"
                        style={{
                          borderRight: `1px solid ${gridLine}`,
                          background: blueCellTint,
                        }}
                      >
                        <span className="md:hidden text-[9px] font-mono uppercase" style={{ color: blueAccent }}>
                          P50
                        </span>
                        <span
                          className="font-mono text-base sm:text-[18px] font-bold tabular-nums whitespace-nowrap leading-none"
                          style={{ color: r.highlight ? blueAccent : textPrimary }}
                        >
                          {r.p50}
                        </span>
                        <div className="hidden sm:block w-20 h-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full" style={{ width: r.barPct, background: blueAccent }} />
                        </div>
                      </div>

                      {/* P95 */}
                      <div
                        className="col-span-1 px-4 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}` }}
                      >
                        <span className="md:hidden text-[9px] font-mono uppercase mb-1" style={{ color: eyebrowMuted }}>
                          P95
                        </span>
                        <span className="font-mono text-sm font-medium tabular-nums whitespace-nowrap" style={{ color: textSecondary }}>
                          {r.p95}
                        </span>
                      </div>

                      {/* P99 */}
                      <div className="col-span-1 md:col-span-2 px-6 py-5 flex flex-col justify-center items-end">
                        <span className="md:hidden text-[9px] font-mono uppercase mb-1" style={{ color: eyebrowMuted }}>
                          P99
                        </span>
                        <span className="font-mono text-sm font-medium tabular-nums whitespace-nowrap" style={{ color: textSecondary }}>
                          {r.p99}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: CORPUS SCALE & QUANTIZATION GRID */}
            {activeTab === 'scale' && (
              <div>
                <div
                  className="hidden md:grid md:grid-cols-12 text-[11px] font-mono uppercase tracking-[0.14em]"
                  style={{ borderBottom: `1px solid ${gridLine}`, background: bg, color: eyebrowMuted }}
                >
                  <div className="col-span-5 px-7 py-4" style={{ borderRight: `1px solid ${gridLine}` }}>
                    CORPUS SIZE &amp; QUANTIZATION MODE
                  </div>
                  <div
                    className="col-span-2 px-5 py-4 text-right font-semibold"
                    style={{ borderRight: `1px solid ${gridLine}`, color: blueAccent, background: blueCellTint }}
                  >
                    P50 LATENCY
                  </div>
                  <div className="col-span-1 px-4 py-4 text-right" style={{ borderRight: `1px solid ${gridLine}` }}>
                    P95
                  </div>
                  <div className="col-span-2 px-5 py-4 text-right" style={{ borderRight: `1px solid ${gridLine}` }}>
                    THROUGHPUT
                  </div>
                  <div className="col-span-1 px-4 py-4 text-right" style={{ borderRight: `1px solid ${gridLine}` }}>
                    RAM
                  </div>
                  <div className="col-span-1 px-4 py-4 text-right" style={{ color: blueAccent }}>
                    RECALL
                  </div>
                </div>

                {SCALE_ROWS.map((row, idx) => (
                  <div
                    key={`${row.code}-${idx}`}
                    className="grid grid-cols-1 md:grid-cols-12 items-stretch"
                    style={{
                      borderBottom: idx < SCALE_ROWS.length - 1 ? `1px solid ${gridLine}` : 'none',
                    }}
                  >
                    <div
                      className="md:col-span-5 px-6 sm:px-7 py-5 flex flex-col justify-center gap-1"
                      style={{ borderRight: `1px solid ${gridLine}` }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] px-2 py-0.5 shrink-0"
                          style={{
                            border: `1px solid ${row.highlight ? blueAccent : gridLine}`,
                            color: row.highlight ? blueAccent : textSecondary,
                            background: bg,
                          }}
                        >
                          {row.code}
                        </span>
                        <span className="text-[15px] font-semibold" style={{ color: textPrimary }}>
                          {row.vectors}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: textSecondary }}>
                        {row.mode}
                      </p>
                    </div>

                    <div className="md:col-span-7 grid grid-cols-5 md:grid-cols-7 items-stretch">
                      <div
                        className="col-span-1 md:col-span-2 px-5 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}`, background: blueCellTint }}
                      >
                        <span className="font-mono text-base sm:text-[18px] font-bold tabular-nums whitespace-nowrap" style={{ color: blueAccent }}>
                          {row.p50_ms}
                        </span>
                      </div>

                      <div
                        className="col-span-1 px-4 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}` }}
                      >
                        <span className="font-mono text-sm tabular-nums whitespace-nowrap" style={{ color: textSecondary }}>
                          {row.p95_ms}
                        </span>
                      </div>

                      <div
                        className="col-span-1 md:col-span-2 px-5 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}` }}
                      >
                        <span className="font-mono text-sm font-semibold tabular-nums whitespace-nowrap" style={{ color: textPrimary }}>
                          {row.qps}
                        </span>
                      </div>

                      <div
                        className="col-span-1 px-4 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}` }}
                      >
                        <span className="font-mono text-xs tabular-nums whitespace-nowrap" style={{ color: textSecondary }}>
                          {row.ram_mb}
                        </span>
                      </div>

                      <div className="col-span-1 px-4 py-5 flex flex-col justify-center items-end">
                        <span className="font-mono text-sm font-bold tabular-nums whitespace-nowrap" style={{ color: blueAccent }}>
                          {row.recall}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: CONCURRENCY SCALING GRID */}
            {activeTab === 'concurrency' && (
              <div>
                <div
                  className="hidden md:grid md:grid-cols-12 text-[11px] font-mono uppercase tracking-[0.14em]"
                  style={{ borderBottom: `1px solid ${gridLine}`, background: bg, color: eyebrowMuted }}
                >
                  <div className="col-span-5 px-7 py-4" style={{ borderRight: `1px solid ${gridLine}` }}>
                    CONCURRENCY LEVEL &amp; WORKLOAD
                  </div>
                  <div className="col-span-1 px-4 py-4 text-right" style={{ borderRight: `1px solid ${gridLine}` }}>
                    MIN
                  </div>
                  <div className="col-span-2 px-5 py-4 text-right" style={{ borderRight: `1px solid ${gridLine}` }}>
                    P50 MEDIAN
                  </div>
                  <div className="col-span-1 px-4 py-4 text-right" style={{ borderRight: `1px solid ${gridLine}` }}>
                    P95
                  </div>
                  <div
                    className="col-span-2 px-5 py-4 text-right font-semibold"
                    style={{ borderRight: `1px solid ${gridLine}`, color: blueAccent, background: blueCellTint }}
                  >
                    SUSTAINED QPS
                  </div>
                  <div className="col-span-1 px-4 py-4 text-right">
                    ERRORS
                  </div>
                </div>

                {CONCURRENCY_ROWS.map((row, idx) => (
                  <div
                    key={row.code}
                    className="grid grid-cols-1 md:grid-cols-12 items-stretch"
                    style={{
                      borderBottom: idx < CONCURRENCY_ROWS.length - 1 ? `1px solid ${gridLine}` : 'none',
                    }}
                  >
                    <div
                      className="md:col-span-5 px-6 sm:px-7 py-5 flex flex-col justify-center gap-1"
                      style={{ borderRight: `1px solid ${gridLine}` }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] px-2 py-0.5 shrink-0"
                          style={{
                            border: `1px solid ${row.highlight ? blueAccent : gridLine}`,
                            color: row.highlight ? blueAccent : textSecondary,
                            background: bg,
                          }}
                        >
                          {row.code}
                        </span>
                        <span className="text-[15px] font-semibold" style={{ color: textPrimary }}>
                          {row.users}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: textSecondary }}>
                        {row.dataset}
                      </p>
                    </div>

                    <div className="md:col-span-7 grid grid-cols-5 md:grid-cols-7 items-stretch">
                      <div
                        className="col-span-1 px-4 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}` }}
                      >
                        <span className="font-mono text-sm tabular-nums whitespace-nowrap" style={{ color: textSecondary }}>
                          {row.min_ms}
                        </span>
                      </div>

                      <div
                        className="col-span-1 md:col-span-2 px-5 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}` }}
                      >
                        <span className="font-mono text-sm font-semibold tabular-nums whitespace-nowrap" style={{ color: textPrimary }}>
                          {row.p50_ms}
                        </span>
                      </div>

                      <div
                        className="col-span-1 px-4 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}` }}
                      >
                        <span className="font-mono text-sm tabular-nums whitespace-nowrap" style={{ color: textSecondary }}>
                          {row.p95_ms}
                        </span>
                      </div>

                      <div
                        className="col-span-1 md:col-span-2 px-5 py-5 flex flex-col justify-center items-end"
                        style={{ borderRight: `1px solid ${gridLine}`, background: blueCellTint }}
                      >
                        <span className="font-mono text-base sm:text-[18px] font-bold tabular-nums whitespace-nowrap" style={{ color: blueAccent }}>
                          {row.qps}
                        </span>
                      </div>

                      <div className="col-span-1 px-4 py-5 flex flex-col justify-center items-end">
                        <span className="font-mono text-xs font-semibold tabular-nums whitespace-nowrap" style={{ color: blueAccent }}>
                          {row.errors}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ledger Footer Strip */}
            <div
              className="px-6 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              style={{ borderTop: `1px solid ${gridLine}`, background: bg, color: eyebrowMuted }}
            >
              <span>REGION: ap-south-1 (Mumbai) · 384d Float32 Cosine + Okapi BM25</span>
              <span>WARM-UP: 20 iterations · MEASURED: 200–500 runs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: ACCURACY & TRANSPARENCY ("Recall@10 and engine scope" — Inset Framed 4-Column Grid) ── */}
      <section style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div className="mb-10">
            <span
              className="block text-[11px] font-mono uppercase tracking-[0.18em] mb-3"
              style={{ color: eyebrowMuted }}
            >
              ACCURACY &amp; TRANSPARENCY
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em] mb-3">
              Recall@10 evaluation and honest engine scope
            </h2>
            <p className="text-sm sm:text-[15px]" style={{ color: textSecondary }}>
              How Dense Cosine HNSW, Sparse Okapi BM25, and Hybrid RRF compare across 40 ground-truth production queries.
            </p>
          </div>

          <div style={{ border: `1px solid ${gridLine}`, background: paperBg }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {ACCURACY_CARDS.map((card, i) => (
                <Link
                  key={card.title}
                  to={card.to}
                  className="group flex flex-col p-8 transition-colors no-underline"
                  style={{
                    borderRight: i < 3 ? `1px solid ${gridLine}` : 'none',
                    color: textPrimary,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center"
                      style={{ border: `1px solid ${gridLine}`, background: bg }}
                    >
                      {card.icon}
                    </div>
                    <span
                      className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.12em] px-2.5 py-1 whitespace-nowrap"
                      style={{
                        border: `1px solid ${gridLine}`,
                        background: bg,
                        color: blueAccent,
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{card.title}</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: textSecondary }}>
                    {card.desc}
                  </p>

                  <ul className="space-y-2.5 mb-8 text-xs" style={{ color: textSecondary }}>
                    {card.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 whitespace-nowrap">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={blueAccent}
                          strokeWidth="2.4"
                          className="shrink-0"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                        </svg>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <span className="mt-auto text-sm font-medium group-hover:underline" style={{ color: textPrimary }}>
                    {card.cta}
                  </span>
                </Link>
              ))}
            </div>

            <div
              className="flex justify-center py-6"
              style={{ borderTop: `1px solid ${gridLine}` }}
            >
              <Link
                to="/engine"
                className="text-sm font-medium hover:underline no-underline"
                style={{ color: blueAccent }}
              >
                Explore full engine architecture and subsystems &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: REPRODUCE ("Verify every number in 60 seconds" — Pinecone Split Code & Live Telemetry Console) ── */}
      <section id="reproduce" style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span
                className="block text-[11px] font-mono uppercase tracking-[0.18em] mb-3"
                style={{ color: eyebrowMuted }}
              >
                REPRODUCE YOURSELF
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em] mb-2">
                Verify every number in 60 seconds
              </h2>
              <p className="text-sm sm:text-[15px] max-w-[560px]" style={{ color: textSecondary }}>
                Run the official benchmark suite in your stack against ap-south-1 (Mumbai). Measure 384d CPU ingestion, Hybrid RRF latency percentiles, and 4-tier memory recall.
              </p>
            </div>

            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium pb-1 border-b transition shrink-0 self-start md:self-end no-underline"
              style={{
                color: textPrimary,
                borderColor: dark ? 'rgba(255,255,255,0.6)' : 'rgba(17,24,39,0.6)',
              }}
            >
              <span>View SDK documentation</span>
              <span className="text-xs leading-none">&#8599;</span>
            </Link>
          </div>

          {/* Interactive 3-Stage Pinecone Code & Telemetry Frame */}
          <div
            style={{
              border: `1px solid ${gridLine}`,
              background: paperBg,
            }}
          >
            {/* Top 3-Stage Architectural Selector Bar */}
            <div
              className="grid grid-cols-1 md:grid-cols-3"
              style={{
                borderBottom: `1px solid ${gridLine}`,
                background: bg,
              }}
            >
              {REPRODUCE_STAGES.map((stage, i) => {
                const isActive = reproduceStep === i
                return (
                  <button
                    key={stage.num}
                    type="button"
                    onClick={() => setReproduceStep(i)}
                    onMouseEnter={() => setReproduceStep(i)}
                    className="group relative text-left px-6 py-4 transition-all duration-150 cursor-pointer outline-none focus:outline-none"
                    style={{
                      borderRight: i < 2 ? `1px solid ${gridLine}` : 'none',
                      background: isActive ? paperBg : 'transparent',
                    }}
                  >
                    {/* Top Active Royal Blue Bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-150"
                      style={{
                        background: isActive ? blueAccent : 'transparent',
                      }}
                    />

                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        {/* Crisp White Active Step Number Pill */}
                        <span
                          className="text-[11px] font-mono px-1.5 py-0.5 tracking-[0.08em]"
                          style={{
                            background: isActive
                              ? dark
                                ? '#ffffff'
                                : '#0a0b0d'
                              : dark
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(15,23,42,0.06)',
                            color: isActive
                              ? dark
                                ? '#0a0b0d'
                                : '#ffffff'
                              : textSecondary,
                            fontWeight: 700,
                          }}
                        >
                          {stage.num}
                        </span>
                        <span
                          className="text-[15.5px] font-semibold tracking-[-0.01em]"
                          style={{
                            color: isActive ? textPrimary : textSecondary,
                          }}
                        >
                          {stage.title}
                        </span>
                      </div>

                      <span
                        className="text-[9.5px] font-mono px-2 py-0.5 uppercase tracking-[0.12em] font-semibold whitespace-nowrap"
                        style={{
                          background: isActive ? blueCellTint : 'transparent',
                          color: isActive ? blueAccent : eyebrowMuted,
                          border: isActive
                            ? `1px solid ${gridLine}`
                            : '1px solid transparent',
                        }}
                      >
                        {stage.badge}
                      </span>
                    </div>

                    <div className="text-[12.5px] pl-[34px]" style={{ color: textSecondary }}>
                      {stage.sub}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Bottom Split: Code Execution Window (7/12) + Live Stage Telemetry (5/12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left (7/12): Active Stage Snippet with Language Switcher & Locked Line Numbers */}
              <div
                className="lg:col-span-7 flex flex-col justify-between"
                style={{
                  borderRight: `1px solid ${gridLine}`,
                  background: dark ? '#0c0d10' : '#0f1117',
                }}
              >
                {/* Sub-Header Bar: Active Filename Pill + Language Tabs + Copy Button */}
                <div
                  className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    background: dark ? '#0e1014' : '#0b0d12',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[12px] font-mono font-semibold bg-white text-[#0a0b0d]">
                      {REPRODUCE_LANGS[codeLang].files[reproduceStep]}
                    </span>

                    <div className="flex items-center gap-0.5 pl-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                      {Object.entries(REPRODUCE_LANGS).map(([key, cfg]) => {
                        const isSelected = codeLang === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setCodeLang(key)}
                            className="px-2.5 py-1 text-[11.5px] font-mono transition cursor-pointer"
                            style={{
                              background: isSelected ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
                              color: isSelected ? '#3b82f6' : '#a1a1aa',
                              fontWeight: isSelected ? 600 : 400,
                            }}
                          >
                            {cfg.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={copyScript}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono transition cursor-pointer"
                    style={{
                      border: copiedScript
                        ? '1px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid rgba(255,255,255,0.12)',
                      background: copiedScript
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(255,255,255,0.03)',
                      color: copiedScript ? '#3b82f6' : '#d4d4d8',
                    }}
                  >
                    <span>{copiedScript ? '✓ Copied' : 'Copy snippet'}</span>
                  </button>
                </div>

                {/* 6-Line Focused Code Body — Zero Horizontal Scrollbar, Locked Line Numbers */}
                <div className="px-5 sm:px-6 py-6 font-mono text-[13px] leading-[1.85] overflow-x-auto min-h-[195px] flex flex-col justify-center text-[#f4f4f5]">
                  {REPRODUCE_LANGS[codeLang].stages[reproduceStep].lines.map((lineNode, idx) => (
                    <div key={idx} className="flex items-baseline">
                      <span
                        className="w-8 shrink-0 select-none text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="whitespace-pre">{lineNode}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Install Command Bar */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-mono"
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    background: dark ? '#0a0b0e' : '#0b0d12',
                  }}
                >
                  <button
                    type="button"
                    onClick={copyInstallCmd}
                    className="inline-flex items-center gap-2 text-left transition cursor-pointer"
                    style={{ color: '#d4d4d8' }}
                  >
                    <span style={{ color: '#71717a' }}>$</span>
                    <span>{REPRODUCE_LANGS[codeLang].install}</span>
                    <span className="text-[11px] font-semibold" style={{ color: '#3b82f6' }}>
                      {copiedInstall ? '✓ Copied' : 'Copy'}
                    </span>
                  </button>

                  <span className="text-[10.5px] font-mono text-[#71717a] hidden sm:inline">
                    STAGE 0{reproduceStep + 1} OF 03 · SDK v1.0.0
                  </span>
                </div>
              </div>

              {/* Right (5/12): Dot-Matrix Live Stage Telemetry Output */}
              <div
                className="lg:col-span-5 p-6 flex flex-col justify-between"
                style={{
                  backgroundImage: dark
                    ? 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(15,23,42,0.055) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  backgroundColor: bg,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[10.5px] font-mono tracking-[0.16em] uppercase font-semibold"
                      style={{ color: blueAccent }}
                    >
                      {REPRODUCE_STAGES[reproduceStep].telemetryTitle}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>200 OK</span>
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {REPRODUCE_STAGES[reproduceStep].telemetryRows.map((item) => (
                      <div
                        key={item.label}
                        className="px-3.5 py-2.5"
                        style={{
                          border: `1px solid ${gridLine}`,
                          background: paperBg,
                        }}
                      >
                        <div className="text-[9.5px] font-mono tracking-[0.14em] uppercase mb-0.5" style={{ color: eyebrowMuted }}>
                          {item.label}
                        </div>
                        <div
                          className="text-[12.5px] font-mono font-medium whitespace-nowrap"
                          style={{ color: textPrimary }}
                        >
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Bottom Split Architectural Action Banner ── */}
      <section style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto grid lg:grid-cols-12"
          style={{
            borderLeft: `1px solid ${gridLine}`,
            borderRight: `1px solid ${gridLine}`,
            background: paperBg,
          }}
        >
          <div
            className="lg:col-span-5 p-8 sm:p-10 flex items-end"
            style={{ borderRight: `1px solid ${gridLine}` }}
          >
            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-[-0.02em]">
              Put a plan in front of your team
            </h2>
          </div>

          <div
            className="lg:col-span-4 p-8 sm:p-10 flex items-end"
            style={{ borderRight: `1px solid ${gridLine}` }}
          >
            <p className="text-[15.5px] leading-relaxed" style={{ color: textSecondary }}>
              Talk to a solutions architect about your workload, your timeline, and what it will cost to run in production.
            </p>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-center">
            <div className="p-4" style={{ borderBottom: `1px solid ${gridLine}` }}>
              <Link
                to="/contact"
                className={`block w-full py-3 px-5 text-center text-sm font-semibold transition no-underline ${
                  dark
                    ? 'bg-white text-[#0a0b0d] hover:bg-[#e4e4e7]'
                    : 'bg-[#0a0b0d] text-white hover:bg-[#27272a]'
                }`}
              >
                Talk to our team
              </Link>
            </div>
            <div className="p-4">
              <a
                href="/benchmark-report.json"
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 px-5 text-center text-sm font-medium transition no-underline"
                style={{
                  border: `1px solid ${gridLine}`,
                  background: bg,
                  color: textPrimary,
                }}
              >
                Download benchmark JSON
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer dark={dark} />
    </div>
  )
}
