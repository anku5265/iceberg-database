import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, useSessionTheme } from '../components/Navbar'
import Footer from '../components/Footer'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

/**
 * Original 3-Tier Isometric CAD Blueprint for Iceberg Engine (FIG. 01 // ENGINE ARCHITECTURE)
 * Uses exact 30-degree isometric projection matrices (`matrix(0.866025 0.5 -0.866025 0.5 ...)`).
 */
function IcebergEngineBlueprint({ dark }) {
  const strokeMain = dark ? '#fafaf9' : '#18181b'
  const strokeDim = dark ? 'rgba(250,250,249,0.28)' : 'rgba(24,24,27,0.24)'
  const strokeFaint = dark ? 'rgba(250,250,249,0.14)' : 'rgba(24,24,27,0.12)'
  const blueAccent = dark ? '#3b82f6' : '#2563eb'
  const labelColor = dark ? '#a1a1aa' : '#52525b'
  const nodeFill = dark ? '#111215' : '#f8fafc'

  const clusterNW = [
    [-68, -68], [-56, -74], [-76, -54], [-62, -58], [-48, -62],
    [-82, -68], [-70, -82], [-54, -48], [-66, -44], [-42, -74],
    [-78, -42], [-58, -86], [-86, -56], [-46, -52],
  ]
  const clusterNE = [
    [68, -68], [56, -74], [76, -54], [62, -58], [48, -62],
    [82, -68], [70, -82], [54, -48], [66, -44], [42, -74],
    [78, -42], [58, -86], [86, -56], [46, -52],
  ]
  const clusterSW = [
    [-68, 68], [-56, 74], [-76, 54], [-62, 58], [-48, 62],
    [-82, 68], [-70, 82], [-54, 48], [-66, 44], [-42, 74],
    [-78, 42], [-58, 86], [-86, 56], [-46, 52],
  ]
  const clusterSE = [
    [68, 68], [56, 74], [76, 54], [62, 58], [48, 62],
    [82, 68], [70, 82], [54, 48], [66, 44], [42, 74],
    [78, 42], [58, 86], [86, 56], [46, 52],
  ]
  const clusterCenter = [
    [0, 0], [-12, -8], [12, -8], [-8, 12], [8, 12],
    [-18, 4], [18, 4], [0, -16], [0, 16], [-14, -18],
    [14, -18], [-14, 18], [14, 18], [-24, -6], [24, -6],
    [-6, -24], [6, 24],
  ]

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
          FIG. 01
        </text>
        <text x="36" y="65" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.3">
          ENGINE ARCHITECTURE
        </text>

        {/* Vertical Spine Connecting All 3 Isometric Layers */}
        <line x1="300" y1="66" x2="300" y2="512" stroke={strokeDim} strokeWidth="1" strokeDasharray="3 3" />
        <line x1="126.8" y1="166" x2="126.8" y2="412" stroke={strokeFaint} strokeWidth="0.9" strokeDasharray="2 4" />
        <line x1="473.2" y1="166" x2="473.2" y2="412" stroke={strokeFaint} strokeWidth="0.9" strokeDasharray="2 4" />

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 03 (BOTTOM): 4-TIER COGNITIVE MEMORY & WAL PERSISTENCE SLAB
           ══════════════════════════════════════════════════════════════════ */}
        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 412)">
          <rect x="-100" y="-100" width="200" height="200" stroke={strokeMain} strokeWidth="1.2" fill={nodeFill} />
          <line x1="-100" y1="0" x2="100" y2="0" stroke={strokeDim} strokeWidth="1" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke={strokeDim} strokeWidth="1" />
          <line x1="-100" y1="-50" x2="100" y2="-50" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="-100" y1="50" x2="100" y2="50" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="-50" y1="-100" x2="-50" y2="100" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="50" y1="-100" x2="50" y2="100" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="3 3" />
          {[-50, 50].map((cx) =>
            [-50, 50].map((cy) => (
              <circle
                key={`mem-${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="4"
                fill={nodeFill}
                stroke={strokeMain}
                strokeWidth="1.1"
              />
            ))
          )}
        </g>
        <path
          d="M 126.8 412 L 300 512 L 473.2 412 L 473.2 440 L 300 540 L 126.8 440 Z"
          fill={nodeFill}
          stroke={strokeMain}
          strokeWidth="1.1"
        />
        <line x1="300" y1="512" x2="300" y2="540" stroke={strokeMain} strokeWidth="1.1" />
        <path d="M 126.8 426 L 300 526 L 473.2 426" stroke={strokeDim} strokeWidth="0.9" fill="none" />

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 02 (MIDDLE): SUSPENDED RRF FUSION & BM25 WAFER
           ══════════════════════════════════════════════════════════════════ */}
        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 338)">
          <rect
            x="-100"
            y="-100"
            width="200"
            height="200"
            stroke={blueAccent}
            strokeWidth="1.2"
            fill={dark ? 'rgba(59,130,246,0.04)' : 'rgba(37,99,235,0.04)'}
          />
          {[-50, 0, 50].map((pos) => (
            <g key={`rrf-grid-${pos}`}>
              <line x1="-100" y1={pos} x2="100" y2={pos} stroke={strokeDim} strokeWidth="0.8" strokeDasharray="2 3" />
              <line x1={pos} y1="-100" x2={pos} y2="100" stroke={strokeDim} strokeWidth="0.8" strokeDasharray="2 3" />
            </g>
          ))}
          <line x1="-68" y1="-68" x2="0" y2="0" stroke={blueAccent} strokeWidth="1.1" />
          <line x1="68" y1="-68" x2="0" y2="0" stroke={blueAccent} strokeWidth="1.1" />
          <line x1="-68" y1="68" x2="0" y2="0" stroke={blueAccent} strokeWidth="1.1" />
          <line x1="68" y1="68" x2="0" y2="0" stroke={blueAccent} strokeWidth="1.1" />
          <rect x="-14" y="-14" width="28" height="28" fill={nodeFill} stroke={blueAccent} strokeWidth="1.4" />
          <circle cx="0" cy="0" r="4" fill={blueAccent} />
        </g>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 01 (TOP): 3D ISOMETRIC HNSW VECTOR GRAPH CHAMBER
           ══════════════════════════════════════════════════════════════════ */}
        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 250)">
          <rect x="-100" y="-100" width="200" height="200" stroke={strokeMain} strokeWidth="1.1" />
          <line x1="-100" y1="-33.3" x2="100" y2="-33.3" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="-100" y1="33.3" x2="100" y2="33.3" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="-33.3" y1="-100" x2="-33.3" y2="100" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="33.3" y1="-100" x2="33.3" y2="100" stroke={strokeFaint} strokeWidth="0.8" strokeDasharray="2 2" />
        </g>

        <line x1="300" y1="66" x2="300" y2="250" stroke={strokeMain} strokeWidth="1" />
        <line x1="126.8" y1="166" x2="126.8" y2="250" stroke={strokeMain} strokeWidth="1.1" />
        <line x1="473.2" y1="166" x2="473.2" y2="250" stroke={strokeMain} strokeWidth="1.1" />
        <line x1="300" y1="166" x2="300" y2="350" stroke={strokeMain} strokeWidth="1.1" />

        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 208)">
          <polyline
            points="-68,-68 -56,-74 -48,-62 -62,-58 -68,-68 -76,-54 -66,-44 -54,-48 -62,-58"
            stroke={strokeDim}
            strokeWidth="0.9"
            fill="none"
          />
          <polyline
            points="68,-68 56,-74 48,-62 62,-58 68,-68 76,-54 66,-44 54,-48 62,-58"
            stroke={strokeDim}
            strokeWidth="0.9"
            fill="none"
          />
          <polyline
            points="-68,68 -56,74 -48,62 -62,58 -68,68 -76,54 -66,44 -54,48 -62,58"
            stroke={strokeDim}
            strokeWidth="0.9"
            fill="none"
          />
          <polyline
            points="68,68 56,74 48,62 62,58 68,68 76,54 66,44 54,48 62,58"
            stroke={strokeDim}
            strokeWidth="0.9"
            fill="none"
          />
          <line x1="-54" y1="-48" x2="-12" y2="-8" stroke={blueAccent} strokeWidth="0.9" strokeDasharray="2 2" />
          <line x1="54" y1="-48" x2="12" y2="-8" stroke={blueAccent} strokeWidth="0.9" strokeDasharray="2 2" />
          <line x1="-54" y1="48" x2="-8" y2="12" stroke={blueAccent} strokeWidth="0.9" strokeDasharray="2 2" />
          <line x1="54" y1="48" x2="8" y2="12" stroke={blueAccent} strokeWidth="0.9" strokeDasharray="2 2" />

          {[...clusterNW, ...clusterNE, ...clusterSW, ...clusterSE].map(([cx, cy], idx) => (
            <circle
              key={`c-outer-${idx}`}
              cx={cx}
              cy={cy}
              r="3.2"
              fill={nodeFill}
              stroke={strokeMain}
              strokeWidth="1.1"
            />
          ))}

          {clusterCenter.map(([cx, cy], idx) => (
            <circle
              key={`c-center-${idx}`}
              cx={cx}
              cy={cy}
              r={idx === 0 ? '4.2' : '3.3'}
              fill={idx === 0 ? blueAccent : nodeFill}
              stroke={blueAccent}
              strokeWidth="1.25"
            />
          ))}
        </g>

        <g transform="matrix(0.866025 0.5 -0.866025 0.5 300 166)">
          <rect x="-100" y="-100" width="200" height="200" stroke={strokeMain} strokeWidth="1.15" />
          <line x1="-100" y1="0" x2="100" y2="0" stroke={strokeDim} strokeWidth="0.85" strokeDasharray="3 3" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke={strokeDim} strokeWidth="0.85" strokeDasharray="3 3" />
        </g>

        {/* Technical Callout Leader Lines */}
        <polyline points="432,142 472,112 494,112" fill="none" stroke={strokeMain} strokeWidth="1" />
        <text x="498" y="109" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          01.
        </text>
        <text x="498" y="122" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          HNSW GRAPH
        </text>

        <polyline points="473,338 494,338" fill="none" stroke={blueAccent} strokeWidth="1" />
        <text x="498" y="334" fill={blueAccent} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          02.
        </text>
        <text x="498" y="347" fill={blueAccent} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          RRF FUSION
        </text>

        <polyline points="434,496 472,520 494,520" fill="none" stroke={strokeMain} strokeWidth="1" />
        <text x="498" y="516" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          03.
        </text>
        <text x="498" y="529" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.2">
          MEMORY VAULT
        </text>

        <text x="36" y="560" fill={labelColor} fontSize="9.5" fontFamily="monospace" letterSpacing="1.5">
          REV 1.0
        </text>
      </svg>
    </div>
  )
}

const MARQUEE_ITEMS = [
  'Python SDK v1.0.0',
  'JavaScript / TypeScript',
  'Go Native Client',
  'Rust High-QPS SDK',
  'Java & .NET',
  'LangChain',
  'LlamaIndex',
  'ONNX 384d Runtime',
  'Okapi BM25 + RRF',
  'India ap-south-1',
]

const SUBSYSTEM_CARDS = [
  {
    header: 'ONNX 384D',
    category: 'ZERO EMBEDDING TAX',
    desc: 'In-process quantized all-MiniLM-L6-v2 CPU embeddings on AVX2 SIMD threads with $0 external API keys required.',
    to: '/product/database',
    cta: 'Explore Vector Engine →',
  },
  {
    header: 'HYBRID RRF',
    category: 'DENSE + SPARSE FUSION',
    desc: 'Simultaneous Cosine HNSW graph walk (m=16, ef=64) and Okapi BM25 keyword scan fused via RRF (k=60).',
    to: '/benchmarks',
    cta: 'Verify RRF Latency →',
  },
  {
    header: '4-TIER MEMORY',
    category: 'COGNITIVE AGENTS',
    desc: 'First-class Working, Episodic, Semantic, and Long-Term agent memory with sub-8ms context recall.',
    to: '/product/memory',
    cta: 'Explore Agent Memory →',
  },
  {
    header: 'WAL + SNAPSHOTS',
    category: 'CRASH-SAFE STORAGE',
    desc: 'Hardware-enforced tenant namespaces, Write-Ahead Logging, and instant point-in-time TAR.GZ backups.',
    to: '/product/backup',
    cta: 'Explore Snapshots →',
  },
]

const PERFORMANCE_METRICS = [
  {
    value: '100%',
    label: 'Hybrid RRF Recall@10',
    sub: '40-query ground-truth evaluation · alpha=0.5',
  },
  {
    value: '1.95ms',
    label: 'Dense HNSW latency (p50)',
    sub: '384d float32 Cosine · 10K vector corpus',
  },
  {
    value: '8.73ms',
    label: 'Hybrid RRF latency (p50)',
    sub: 'Simultaneous HNSW + Okapi BM25 fusion',
  },
  {
    value: '$0',
    label: 'Embedding API cost',
    sub: 'Server-side 384d ONNX CPU runtime',
  },
  {
    value: '99.95%',
    label: 'Uptime SLA',
    sub: 'Enterprise & Dedicated cluster tier',
  },
  {
    value: '6 SDKs',
    label: 'Official client libraries',
    sub: 'Python, JS, Go, Java, .NET, Rust (v1.0.0)',
  },
]

const DEPLOYMENT_OPTIONS = [
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'On-Demand',
    desc: 'Fully managed and auto-scaling in Mumbai (ap-south-1). Zero ops, go from API key to production in minutes.',
    bullets: ['Instant startup', 'Usage-based pricing', 'Auto-scales to millions of vectors'],
    to: '/product/database',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path strokeLinecap="round" d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Dedicated',
    desc: 'Reserved compute for predictable performance. Ideal for consistent high-throughput production requirements.',
    bullets: ['Reserved capacity', 'Predictable pricing', 'Uptime SLA'],
    to: '/pricing',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'BYOC Database',
    desc: 'A privately managed Iceberg region inside your own AWS, Azure, or Google Cloud account in India.',
    bullets: ['Data never leaves your VPC', 'Choose your cloud & region', 'Custom compliance requirements'],
    to: '/product/byoc',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
      </svg>
    ),
    title: 'Assistant',
    desc: 'Managed RAG pipeline as a service. Upload documents, get a production-ready AI & WhatsApp assistant.',
    bullets: ['Managed retrieval pipeline', 'Enterprise document support', 'API & no-code access'],
    to: '/product/assistant',
  },
]

const OPERATIONS_CARDS = [
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5" />
      </svg>
    ),
    title: 'Dedicated Customer Success',
    desc: 'A named solutions architect embedded with your team — from initial HNSW index sizing through production scale.',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
      </svg>
    ),
    title: 'Shared Slack Channel',
    desc: 'Direct access to Iceberg engineers in a private Slack & WhatsApp channel with guaranteed response times — no ticket queues.',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
      </svg>
    ),
    title: 'SLA-backed Uptime',
    desc: 'Financially-backed SLAs with defined response and resolution windows for P0 and P1 incidents, plus TAR.GZ snapshots.',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-7 4 14 3-7h4" />
      </svg>
    ),
    title: 'Usage & Cost Management',
    desc: 'Spend controls, real-time latency dashboards, and $0 built-in 384d CPU embeddings so your org stays on budget.',
  },
]

const COMPLIANCE_CARDS = [
  {
    title: 'DPDP Act 2023',
    desc: '100% India data residency (ap-south-1 Mumbai) engineered for Digital Personal Data Protection compliance.',
  },
  {
    title: 'SOC 2 Type II',
    desc: 'Strict architectural controls for security, availability, SHA-256 key hashing, and tenant confidentiality.',
  },
  {
    title: 'GDPR',
    desc: 'Data processing agreements, strict namespace isolation, and instant right-to-erasure vector purge support.',
  },
  {
    title: 'ISO 27001',
    desc: 'Internationally recognized information security architecture with TLS 1.3 in transit and AES-256 at rest.',
  },
]

export default function Engine() {
  const [dark] = useSessionTheme()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const bg = dark ? '#0a0b0d' : '#ffffff'
  const paperBg = dark ? '#111215' : '#f8fafc'
  const gridLine = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const textPrimary = dark ? '#fafaf9' : '#111827'
  const textSecondary = dark ? '#a1a1aa' : '#52525b'
  const eyebrowMuted = dark ? '#71717a' : '#6b7280'
  const blueAccent = dark ? '#3b82f6' : '#2563eb'

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: bg, color: textPrimary }}>
      <Navbar />

      {/* ── Section 1: Hero + Original 3-Tier Iceberg CAD Blueprint (FIG. 01) ── */}
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
                TRUSTED KNOWLEDGE INFRASTRUCTURE
              </span>

              <h1 className="text-4xl sm:text-[46px] lg:text-[52px] font-semibold leading-[1.08] tracking-[-0.025em]">
                Enterprise AI needs{' '}
                <span style={{ color: blueAccent }}>an engine it can trust</span>
              </h1>

              <p className="text-[16px] sm:text-[17px] leading-[1.6] max-w-[490px]" style={{ color: textSecondary }}>
                Purpose-built for accurate, sub-10ms hybrid vector retrieval and 4-tier cognitive agent memory at production scale.
              </p>

              {/* Exact Pinecone Royal Blue + Dark Bordered Buttons with CAD Crop-Mark Ticks */}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Link
                  to="/contact"
                  className="relative inline-flex items-center justify-center px-6 py-3 text-[14px] font-medium text-white bg-[#1d6bf3] hover:bg-[#1559d6] transition no-underline"
                  style={{ '--ib-corner-color': '#3b82f6' }}
                >
                  <span className="ib-corner-tl" />
                  <span className="ib-corner-tr" />
                  <span className="ib-corner-bl" />
                  <span className="ib-corner-br" />
                  Talk to our team
                </Link>

                <Link
                  to="/benchmarks"
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
                  See live benchmarks &rarr;
                </Link>
              </div>
            </div>

            {/* Right Column (5 cols): Original 3-Tier Iceberg CAD Blueprint */}
            <div className="md:col-span-5">
              <IcebergEngineBlueprint dark={dark} />
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
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
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

      {/* ── Section 3: CORE SUBSYSTEMS (Inset Framed 4-Column Architectural Grid) ── */}
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
              CORE SUBSYSTEMS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em]">
              Four layers unified inside the Iceberg Engine
            </h2>
          </div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-4"
            style={{ border: `1px solid ${gridLine}`, background: paperBg }}
          >
            {SUBSYSTEM_CARDS.map((card, i) => (
              <Link
                key={card.header}
                to={card.to}
                className="group flex flex-col gap-4 p-8 transition-colors no-underline"
                style={{
                  borderRight: i < 3 ? `1px solid ${gridLine}` : 'none',
                }}
              >
                <div className="text-xl font-bold tracking-tight" style={{ color: textPrimary }}>
                  {card.header}
                </div>
                <div className="mt-1 flex flex-col gap-2">
                  <span
                    className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em]"
                    style={{ color: blueAccent }}
                  >
                    {card.category}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                    {card.desc}
                  </p>
                </div>
                <span
                  className="mt-auto pt-4 text-sm font-medium group-hover:underline"
                  style={{ color: blueAccent }}
                >
                  {card.cta}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: PERFORMANCE (Inset Framed 2x3 Big Bold Numbers Grid) ── */}
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
            {PERFORMANCE_METRICS.map((m, idx) => (
              <div
                key={m.label}
                className="flex flex-col gap-1.5 px-8 py-10"
                style={{
                  borderRight: (idx + 1) % 3 !== 0 ? `1px solid ${gridLine}` : 'none',
                  borderBottom: idx < 3 ? `1px solid ${gridLine}` : 'none',
                }}
              >
                <span className="text-5xl md:text-[56px] font-bold tabular-nums leading-none tracking-tight">
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

      {/* ── Section 5: DEPLOYMENT ("Deploy on your terms" — Inset Framed 4-Column Grid + Bottom Strip) ── */}
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
              DEPLOYMENT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em] mb-3">
              Deploy on your terms
            </h2>
            <p className="text-sm sm:text-[15px]" style={{ color: textSecondary }}>
              From instant serverless in India to privately managed BYOC cloud regions, Iceberg fits into your infrastructure, not the other way around.
            </p>
          </div>

          <div style={{ border: `1px solid ${gridLine}`, background: paperBg }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {DEPLOYMENT_OPTIONS.map((opt, i) => (
                <Link
                  key={opt.title}
                  to={opt.to}
                  className="group flex flex-col p-8 transition-colors no-underline"
                  style={{
                    borderRight: i < 3 ? `1px solid ${gridLine}` : 'none',
                    color: textPrimary,
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center mb-6"
                    style={{ border: `1px solid ${gridLine}`, background: bg }}
                  >
                    {opt.icon}
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{opt.title}</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: textSecondary }}>
                    {opt.desc}
                  </p>

                  <ul className="space-y-2.5 mb-8 text-xs" style={{ color: textSecondary }}>
                    {opt.bullets.map((b) => (
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

                  <span className="mt-auto text-sm font-medium group-hover:underline" style={{ color: textPrimary }}>
                    Learn more &rarr;
                  </span>
                </Link>
              ))}
            </div>

            <div
              className="flex justify-center py-6"
              style={{ borderTop: `1px solid ${gridLine}` }}
            >
              <Link
                to="/product/byoc"
                className="text-sm font-medium hover:underline no-underline"
                style={{ color: blueAccent }}
              >
                Explore all deployment options &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: SUPPORT ("Support built for production" — Inset Framed 4-Column Grid) ── */}
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
              SUPPORT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em]">
              Support built for production
            </h2>
          </div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-4"
            style={{ border: `1px solid ${gridLine}`, background: paperBg }}
          >
            {OPERATIONS_CARDS.map((s, i) => (
              <div
                key={s.title}
                className="flex flex-col gap-3 p-8"
                style={{
                  borderRight: i < 3 ? `1px solid ${gridLine}` : 'none',
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center mb-3"
                  style={{ border: `1px solid ${gridLine}`, background: bg }}
                >
                  {s.icon}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: COMPLIANCE ("Security and compliance your team can trust") ── */}
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
              COMPLIANCE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-[-0.02em]">
              Security and compliance your team can trust
            </h2>
          </div>

          <div style={{ border: `1px solid ${gridLine}`, background: paperBg }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {COMPLIANCE_CARDS.map((c, i) => (
                <div
                  key={c.title}
                  className="flex flex-col gap-3 p-8"
                  style={{
                    borderRight: i < 3 ? `1px solid ${gridLine}` : 'none',
                  }}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center mb-3"
                    style={{ border: `1px solid ${gridLine}`, background: bg }}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="flex justify-center py-6"
              style={{ borderTop: `1px solid ${gridLine}` }}
            >
              <Link
                to="/security"
                className="text-sm font-medium hover:underline no-underline"
                style={{ color: blueAccent }}
              >
                View full security documentation &rarr;
              </Link>
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
              <Link
                to="/security"
                className="block w-full py-3 px-5 text-center text-sm font-medium transition no-underline"
                style={{
                  border: `1px solid ${gridLine}`,
                  background: bg,
                  color: textPrimary,
                }}
              >
                Request the security packet
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer dark={dark} />
    </div>
  )
}
