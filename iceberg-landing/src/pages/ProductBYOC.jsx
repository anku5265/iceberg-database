import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { Navbar, useSessionTheme } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

/* ========================================================================== */
/* CANONICAL ICEBERG BYOC DATA (ZERO-ACCESS SPLIT-PLANE · V1.0.0)             */
/* ========================================================================== */
const KEY_BENEFITS = [
  {
    title: 'Zero-access operations',
    lead: 'Pass security reviews faster:',
    body: 'No SSH, VPN, or inbound firewall ports means zero inbound attack surface and faster sign-off from your security team.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h2v4H7zM12 7v4m3-3.5h2.5v3H15z" />
        <rect x="6" y="13" width="6" height="5" rx="0.8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18v-2.2a1.8 1.8 0 0 1 3.6 0V18H15z" />
      </svg>
    ),
  },
  {
    title: 'Data sovereignty',
    lead: 'Meet data residency requirements:',
    body: 'Vectors, documents, 384d ONNX embeddings, and queries never leave your AWS, GCP, Azure, or ap-south-1 VPC.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <rect x="5" y="11" width="3.2" height="7" rx="0.5" />
        <rect x="10.4" y="7" width="3.2" height="11" rx="0.5" />
        <rect x="15.8" y="13" width="3.2" height="5" rx="0.5" />
      </svg>
    ),
  },
  {
    title: 'Governance & auditability',
    lead: 'Satisfy compliance audits:',
    body: 'Every collection, snapshot, and cluster lifecycle operation is logged as an immutable audit resource inside your boundary.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="9.5" cy="8" r="2.6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 18.5c0-2.6 2.2-4.5 5-4.5 1.1 0 2.1.3 2.9.8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 11.5l3 1.2v2.4c0 2.1-1.3 3.6-3 4.4-1.7-.8-3-2.3-3-4.4v-2.4l3-1.2z" />
      </svg>
    ),
  },
  {
    title: 'Network isolation',
    lead: 'Reduce your attack surface:',
    body: 'Use restricted endpoints or go private-only with AWS PrivateLink, GCP Private Service Connect, Azure Private Link, or air-gapped subnets.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <rect x="6" y="11" width="12" height="9" rx="1.2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 11V8.2a3.5 3.5 0 0 1 7 0V11" />
      </svg>
    ),
  },
]

const ZERO_ACCESS_MEANS = [
  'No SSH, VPN, or inbound access to your VPC or cluster.',
  'Your cluster pulls queued operations from the control plane over TLS 1.3 and executes them locally.',
  'Only operational metrics and health traces are sent for monitoring — never vectors, documents, or request payloads.',
]

const ZERO_ACCESS_DOES_NOT_MEAN = [
  "You don't lose the Iceberg workflow you're used to. You still use the exact same SDKs, REST API, and console for collection lifecycle, RBAC auth, and usage visibility.",
  "You don't lose support. Our engineering team supports and upgrades your deployment without ever accessing your cloud account or raw data.",
]

const DEPLOY_TABS = [
  {
    id: 'bootstrap',
    filename: 'bootstrap.sh',
    raw: `# Run the Iceberg BYOC setup wizard\ncurl -fsSL https://get.icebergdb.in/byoc/bootstrap.sh | bash\n\n# Deploy into your AWS, GCP, or Azure VPC\ncd iceberg-byoc\niceberg-byoc up --region ap-south-1`,
    lines: [
      [{ t: '# Run the Iceberg BYOC setup wizard', c: 'cmt' }],
      [
        { t: 'curl', c: 'kw' },
        { t: ' -fsSL https://get.icebergdb.in/byoc/bootstrap.sh | ' },
        { t: 'bash', c: 'fn' },
      ],
      [],
      [{ t: '# Deploy into your AWS, GCP, or Azure VPC', c: 'cmt' }],
      [
        { t: 'cd', c: 'kw' },
        { t: ' iceberg-byoc' },
      ],
      [
        { t: 'iceberg-byoc', c: 'cls' },
        { t: ' up --region ' },
        { t: 'ap-south-1', c: 'str' },
      ],
    ],
  },
  {
    id: 'helm',
    filename: 'helm-values.yaml',
    raw: `# Deploy on existing EKS, GKE, or AKS Kubernetes cluster\nhelm repo add iceberg https://charts.icebergdb.in\nhelm install iceberg-dataplane iceberg/byoc \\\n  --namespace iceberg-vpc --create-namespace \\\n  --set license.secretName="iceberg-byoc-key" \\\n  --set network.inboundAccess=false`,
    lines: [
      [{ t: '# Deploy on existing EKS, GKE, or AKS Kubernetes cluster', c: 'cmt' }],
      [
        { t: 'helm', c: 'kw' },
        { t: ' repo add iceberg https://charts.icebergdb.in' },
      ],
      [
        { t: 'helm', c: 'kw' },
        { t: ' install iceberg-dataplane iceberg/byoc \\' },
      ],
      [{ t: '  --namespace iceberg-vpc --create-namespace \\' }],
      [
        { t: '  --set license.secretName=' },
        { t: '"iceberg-byoc-key"', c: 'str' },
        { t: ' \\' },
      ],
      [
        { t: '  --set network.inboundAccess=' },
        { t: 'false', c: 'num' },
      ],
    ],
  },
  {
    id: 'sdk',
    filename: 'connect_vpc.py',
    raw: `from iceberg import Client\n\n# Point standard SDK to your private VPC endpoint\ndb = Client(\n    api_key="ibsk_vpc_YOUR_KEY",\n    base_url="https://iceberg.internal.vpc:8000"\n)\n\nhits = db.search("rbi_circulars", "UPI mandate limit", search_type="hybrid")`,
    lines: [
      [
        { t: 'from', c: 'kw' },
        { t: ' iceberg ' },
        { t: 'import', c: 'kw' },
        { t: ' Client', c: 'cls' },
      ],
      [],
      [{ t: '# Point standard SDK to your private VPC endpoint', c: 'cmt' }],
      [
        { t: 'db = ' },
        { t: 'Client', c: 'cls' },
        { t: '(' },
      ],
      [
        { t: '    api_key=' },
        { t: '"ibsk_vpc_YOUR_KEY"', c: 'str' },
        { t: ',' },
      ],
      [
        { t: '    base_url=' },
        { t: '"https://iceberg.internal.vpc:8000"', c: 'str' },
      ],
      [{ t: ')' }],
      [],
      [
        { t: 'hits = db.' },
        { t: 'search', c: 'fn' },
        { t: '(' },
        { t: '"rbi_circulars"', c: 'str' },
        { t: ', ' },
        { t: '"UPI mandate limit"', c: 'str' },
        { t: ', search_type=' },
        { t: '"hybrid"', c: 'str' },
        { t: ')' },
      ],
    ],
  },
]

const BYOC_FAQS = [
  {
    q: 'Does Iceberg have access to my cloud account or cluster?',
    a: 'No. Iceberg operates with a strict zero-inbound-access model. We never request IAM admin credentials, SSH keys, VPN tunnels, or inbound firewall openings into your AWS, GCP, Azure, or on-premise VPC.',
  },
  {
    q: 'What data leaves my cloud account?',
    a: 'Zero customer vectors, raw documents, embeddings, metadata payloads, or search queries ever leave your VPC. Only lightweight operational telemetry (CPU/RAM utilization, node health heartbeats, and aggregate latency histograms) is sent outbound over TLS 1.3 — and fully air-gapped offline mode disables even outbound telemetry.',
  },
  {
    q: 'In the split-plane architecture, what does the control plane do?',
    a: 'The Iceberg Control Plane manages organization billing, RBAC API key policy definitions, cluster version manifests, and queued maintenance specs. It never processes or stores vector data or search traffic.',
  },
  {
    q: 'In the split-plane architecture, what does the data plane do?',
    a: 'Running 100% inside your VPC, the Data Plane executes document chunking, in-process 384d ONNX CPU embedding, HNSW dense cosine indexing, Okapi BM25 sparse indexing, Hybrid RRF search, 4-Tier Agent Memory, and object-storage snapshots.',
  },
  {
    q: 'How do operations work without inbound access?',
    a: 'A lightweight reconciler inside your cluster initiates an outbound-only TLS 1.3 connection to poll signed operational specs (such as rolling upgrades or index scaling), verifies their cryptographic signature locally, and applies them inside your Kubernetes or Docker cluster.',
  },
  {
    q: 'How do my apps connect to the data plane?',
    a: 'Your applications connect directly to your VPC Data Plane endpoint over private VPC routing, AWS PrivateLink, GCP Private Service Connect, or Azure Private Link using any official Iceberg SDK (Python, JS/TS, Go, Rust, Java, .NET) by setting base_url to your internal endpoint.',
  },
  {
    q: "What's available in BYOC?",
    a: 'Full HNSW dense vector search, Okapi BM25 lexical search, Hybrid RRF fusion, in-process 384d ONNX CPU embeddings, 4-Tier Cognitive Agent Memory, RAG Assistants, namespace isolation, RBAC keys, and S3/GCS/Azure Blob snapshot backup & restore.',
  },
  {
    q: "What isn't supported in BYOC?",
    a: 'Multi-tenant shared free-tier hosting is exclusive to Iceberg Cloud. BYOC runs on dedicated single-tenant compute inside your own cloud account or bare-metal environment under an Enterprise or Scale BYOC license.',
  },
  {
    q: 'How does billing work?',
    a: 'You pay your cloud provider (AWS, GCP, or Azure) directly for your underlying VPC compute and storage, taking full advantage of your committed cloud discounts, plus a predictable annual or monthly Iceberg BYOC platform license based on node capacity.',
  },
]

/* ========================================================================== */
/* ICEBERG 8-HAIRLINE RETRACTING CROP-MARK BUTTON                             */
/* ========================================================================== */
function ByocCropButton({ href, to, variant = 'primary', dark, children }) {
  const cls = `ib-byoc-crop-btn ${
    variant === 'primary'
      ? dark
        ? 'ib-byoc-crop-primary-dark'
        : 'ib-byoc-crop-primary-light'
      : dark
      ? 'ib-byoc-crop-sec-dark'
      : 'ib-byoc-crop-sec-light'
  }`

  const inner = (
    <>
      <span className="ib-byoc-tick ib-byoc-tl-h" />
      <span className="ib-byoc-tick ib-byoc-tl-v" />
      <span className="ib-byoc-tick ib-byoc-tr-h" />
      <span className="ib-byoc-tick ib-byoc-tr-v" />
      <span className="ib-byoc-tick ib-byoc-bl-h" />
      <span className="ib-byoc-tick ib-byoc-bl-v" />
      <span className="ib-byoc-tick ib-byoc-br-h" />
      <span className="ib-byoc-tick ib-byoc-br-v" />
      <span className="ib-byoc-crop-box">{children}</span>
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

/* ========================================================================== */
/* SECTION 1 RIGHT: PURE WHITE MONOCHROME FLOATING SPLIT DIAGRAM              */
/* ========================================================================== */
function ByocHeroSplitDiagram({ dark }) {
  const [hoveredSide, setHoveredSide] = useState(null) // 'hq' | 'vpc' | null

  const strokeActive = dark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.65)'
  const strokeOuter = dark ? 'rgba(255, 255, 255, 0.42)' : 'rgba(15, 23, 42, 0.36)'
  const strokeInner = dark ? 'rgba(255, 255, 255, 0.26)' : 'rgba(15, 23, 42, 0.22)'
  const wireStroke = dark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.35)'
  const panelFill = dark ? '#0b0c0f' : '#f8fafc'
  const cardFill = dark ? '#0f1115' : '#ffffff'
  const badgeFill = dark ? '#ffffff' : '#0f172a'
  const badgeIcon = dark ? '#0a0b0d' : '#ffffff'
  const textMain = dark ? '#ffffff' : '#0f172a'
  const textSub = dark ? '#a1a1aa' : '#52525b'
  const pulseFill = dark ? '#ffffff' : '#0f172a'

  return (
    <div className="w-full select-none">
      <svg
        viewBox="0 0 568 252"
        className="w-full h-auto block overflow-visible"
        fill="none"
        role="img"
        aria-label="Iceberg BYOC zero-access architecture between Iceberg HQ ap-south-1 and Your Server or Cloud VPC"
      >
        {/* LEFT ENCLOSURE: Iceberg HQ (ap-south-1) */}
        <g
          onMouseEnter={() => setHoveredSide('hq')}
          onMouseLeave={() => setHoveredSide(null)}
          className="cursor-pointer"
        >
          <rect
            x="6"
            y="16"
            width="198"
            height="196"
            rx="8"
            fill={panelFill}
            stroke={hoveredSide === 'hq' ? strokeActive : strokeOuter}
            strokeWidth={hoveredSide === 'hq' ? '1.3' : '1.1'}
          />
          {/* Globe Icon + Header */}
          <circle cx="24" cy="36" r="6.2" stroke={textMain} strokeWidth="1.15" />
          <ellipse cx="24" cy="36" rx="3" ry="6.2" stroke={textMain} strokeWidth="1" />
          <line x1="17.8" y1="36" x2="30.2" y2="36" stroke={textMain} strokeWidth="1" />
          <text x="36" y="39.5" fill={textMain} fontSize="10.2" fontWeight="600">
            Iceberg HQ (ap-south-1)
          </text>

          {/* HQ Control Box (/v1/heartbeat) */}
          <rect
            x="18"
            y="54"
            width="174"
            height="62"
            rx="6"
            fill={cardFill}
            stroke={strokeInner}
            strokeWidth="1"
          />
          <path
            d="M33 80l7-4 7 4-7 4-7-4zm0 5l7 4 7-4m-14 5l7 4 7-4"
            stroke={textMain}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="54" y="82" fill={textMain} fontSize="10.3" fontWeight="500">
            HQ Control
          </text>
          <text x="54" y="95" fill={textSub} fontSize="8.8">
            (/v1/heartbeat · License)
          </text>

          {/* Telemetry & Tunnel Hub Box */}
          <rect
            x="18"
            y="128"
            width="174"
            height="68"
            rx="6"
            fill={cardFill}
            stroke={strokeInner}
            strokeWidth="1"
          />
          <path
            d="M31 162h4.5l2.5-6 3.5 12 2.8-8.5 2 2.5h4.2"
            stroke={textMain}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="54" y="158" fill={textMain} fontSize="10.2" fontWeight="500">
            Telemetry &amp; Support
          </text>
          <text x="54" y="171" fill={textSub} fontSize="8.8">
            (Scrubbed Logs · Tunnel)
          </text>
        </g>

        {/* CENTER OUTBOUND-ONLY WIRES + QUIET WHITE PULSES */}
        <path
          d="M 360 44 L 215 44 Q 210 44 210 49 L 210 73 Q 210 78 215 78 L 358 78"
          stroke={wireStroke}
          strokeWidth="1.1"
        />
        <path
          d="M 354 40.5 L 360 44 L 354 47.5"
          stroke={wireStroke}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 354 74.5 L 360 78 L 354 81.5"
          stroke={textMain}
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Live Outbound Heartbeat + Patch Pull Dot */}
        <circle r="2.4" fill={pulseFill}>
          <animateMotion
            path="M 360 44 L 210 44 L 210 78 L 360 78"
            dur="2.8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0.95;0.95;0"
            keyTimes="0;0.12;0.88;1"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Center Command Badge */}
        <circle cx="285" cy="78" r="12.5" fill={badgeFill} />
        <rect x="280" y="72.5" width="9" height="11" rx="1.2" stroke={badgeIcon} strokeWidth="1.2" />
        <circle cx="288.5" cy="82.5" r="2.3" fill={badgeFill} stroke={badgeIcon} strokeWidth="1.1" />

        <text x="285" y="102" textAnchor="middle" fill={textSub} fontSize="8.2">
          Outbound heartbeat pulls
        </text>
        <text x="285" y="112" textAnchor="middle" fill={textSub} fontSize="8.2">
          security patches &amp; updates
        </text>
        <text x="285" y="122" textAnchor="middle" fill={textSub} fontSize="8.2">
          from Iceberg HQ
        </text>

        {/* Bottom Scrubbed Telemetry Wire: VPC (360, 162) -> HQ (206, 162) */}
        <line x1="360" y1="162" x2="208" y2="162" stroke={wireStroke} strokeWidth="1.1" />
        <path
          d="M 213 158.5 L 207 162 L 213 165.5"
          stroke={wireStroke}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle r="2.4" fill={pulseFill}>
          <animateMotion path="M 360 162 L 207 162" dur="2.2s" repeatCount="indefinite" />
          <animate
            attributeName="opacity"
            values="0;0.95;0.95;0"
            keyTimes="0;0.15;0.85;1"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Center Metrics Badge */}
        <circle cx="285" cy="162" r="12.5" fill={badgeFill} />
        <path
          d="M279.5 166.5h11m-9.5-2.5l3-3 2.2 2 3.3-3.5"
          stroke={badgeIcon}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="285" y="186" textAnchor="middle" fill={textSub} fontSize="8.2">
          Usage metrics &amp; 4h tunnel
        </text>

        {/* RIGHT ENCLOSURE: Your Server / Cloud VPC */}
        <g
          onMouseEnter={() => setHoveredSide('vpc')}
          onMouseLeave={() => setHoveredSide(null)}
          className="cursor-pointer"
        >
          <rect
            x="362"
            y="16"
            width="200"
            height="196"
            rx="8"
            fill={panelFill}
            stroke={hoveredSide === 'vpc' ? strokeActive : strokeOuter}
            strokeWidth={hoveredSide === 'vpc' ? '1.35' : '1.15'}
          />
          {/* Cloud Icon + Header */}
          <path
            d="M376 39.5h10.5a3.2 3.2 0 0 0 .3-6.4 4.5 4.5 0 0 0-8.6-1.3 3.5 3.5 0 0 0-2.2 7.7z"
            stroke={textMain}
            strokeWidth="1.15"
            strokeLinejoin="round"
          />
          <text x="394" y="39.5" fill={textMain} fontSize="10.2" fontWeight="600">
            Your Server / Cloud VPC
          </text>

          {/* Data Plane Box */}
          <rect
            x="374"
            y="54"
            width="176"
            height="62"
            rx="6"
            fill={cardFill}
            stroke={strokeInner}
            strokeWidth="1"
          />
          <path
            d="M388 85.5h11a3.4 3.4 0 0 0 .3-6.8 4.8 4.8 0 0 0-9.1-1.4 3.7 3.7 0 0 0-2.2 8.2z"
            stroke={textMain}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <text x="408" y="82" fill={textMain} fontSize="10.3" fontWeight="500">
            Data Plane
          </text>
          <text x="408" y="95" fill={textSub} fontSize="8.8">
            384d ONNX · HNSW + BM25
          </text>

          {/* Docker Engine Box */}
          <rect
            x="374"
            y="128"
            width="176"
            height="68"
            rx="6"
            fill={cardFill}
            stroke={strokeInner}
            strokeWidth="1"
          />
          <rect x="387" y="155" width="12" height="12" rx="2" stroke={textMain} strokeWidth="1.2" />
          <line x1="393" y1="155" x2="393" y2="167" stroke={textMain} strokeWidth="1" />
          <line x1="387" y1="161" x2="399" y2="161" stroke={textMain} strokeWidth="1" />
          <text x="408" y="158" fill={textMain} fontSize="10.3" fontWeight="500">
            Docker Engine (:8000)
          </text>
          <text x="408" y="171" fill={textSub} fontSize="8.8">
            FastAPI · SQLite · R2 / Disk
          </text>
        </g>

        {/* Sovereignty Caption Under Right Box */}
        <text
          x="462"
          y="232"
          textAnchor="middle"
          fill={textMain}
          fontSize="9.6"
          fontStyle="italic"
          opacity="0.88"
        >
          No vectors or query text leave your server
        </text>
      </svg>
    </div>
  )
}

/* ========================================================================== */
/* SECTION 4: COMPACT PURE WHITE MONOCHROME SPLIT-PLANE BLUEPRINT             */
/* ========================================================================== */
function ByocSplitPlaneBlueprint({ dark }) {
  const [hoveredCard, setHoveredCard] = useState(null)

  const strokeActive = dark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.65)'
  const strokeOuter = dark ? 'rgba(255, 255, 255, 0.46)' : 'rgba(15, 23, 42, 0.4)'
  const strokeBox = dark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(15, 23, 42, 0.25)'
  const wire = dark ? 'rgba(255, 255, 255, 0.42)' : 'rgba(15, 23, 42, 0.36)'
  const bgCanvas = dark ? '#0d0e12' : '#f8fafc'
  const bgVpc = dark ? '#0a0b0e' : '#ffffff'
  const bgBox = dark ? '#101216' : '#f8fafc'
  const bgHover = dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)'
  const textMain = dark ? '#ffffff' : '#0f172a'
  const textSub = dark ? '#a1a1aa' : '#52525b'
  const pulseFill = dark ? '#ffffff' : '#0f172a'

  return (
    <div className="border border-[var(--border)] overflow-hidden select-none" style={{ background: bgCanvas }}>
      <div className="px-4 sm:px-8 py-5 sm:py-6">
        <svg
          viewBox="0 0 880 412"
          className="w-full max-w-[740px] mx-auto h-auto block"
          fill="none"
          role="img"
          aria-label="Iceberg BYOC split-plane architecture grounded in Iceberg HQ heartbeat, Cloudflare revocable tunnel, Docker FastAPI engine, 384d ONNX, SQLite metadata, and R2/Local backups"
        >
          {/* ============================================================== */}
          {/* LEFT COLUMN: ICEBERG HQ CONTROL & TELEMETRY                    */}
          {/* ============================================================== */}
          <g
            onMouseEnter={() => setHoveredCard('hq')}
            onMouseLeave={() => setHoveredCard(null)}
            className="cursor-pointer"
          >
            <rect
              x="24"
              y="60"
              width="132"
              height="138"
              rx="7"
              fill={hoveredCard === 'hq' ? bgHover : bgBox}
              stroke={hoveredCard === 'hq' ? strokeActive : strokeOuter}
              strokeWidth={hoveredCard === 'hq' ? '1.35' : '1.1'}
            />
            <circle cx="90" cy="102" r="11" stroke={textMain} strokeWidth="1.25" />
            <ellipse cx="90" cy="102" rx="5.2" ry="11" stroke={textMain} strokeWidth="1.1" />
            <line x1="79" y1="102" x2="101" y2="102" stroke={textMain} strokeWidth="1.1" />
            <text x="90" y="138" textAnchor="middle" fill={textMain} fontSize="13" fontWeight="600">
              Iceberg HQ
            </text>
            <text x="90" y="155" textAnchor="middle" fill={textMain} fontSize="13" fontWeight="600">
              Control Plane
            </text>
            <text x="90" y="173" textAnchor="middle" fill={textSub} fontSize="10.5">
              /v1/heartbeat
            </text>
          </g>

          <g
            onMouseEnter={() => setHoveredCard('tel')}
            onMouseLeave={() => setHoveredCard(null)}
            className="cursor-pointer"
          >
            <rect
              x="24"
              y="246"
              width="132"
              height="130"
              rx="7"
              fill={hoveredCard === 'tel' ? bgHover : bgBox}
              stroke={hoveredCard === 'tel' ? strokeActive : strokeOuter}
              strokeWidth={hoveredCard === 'tel' ? '1.35' : '1.1'}
            />
            <path
              d="M74 287s6.5-9.5 16-9.5 16 9.5 16 9.5-6.5 9.5-16 9.5-16-9.5-16-9.5z"
              stroke={textMain}
              strokeWidth="1.25"
            />
            <circle cx="90" cy="287" r="4" stroke={textMain} strokeWidth="1.25" />
            <text x="90" y="321" textAnchor="middle" fill={textMain} fontSize="12.5" fontWeight="600">
              Iceberg
            </text>
            <text x="90" y="338" textAnchor="middle" fill={textMain} fontSize="12.5" fontWeight="600">
              Telemetry Hub
            </text>
            <text x="90" y="355" textAnchor="middle" fill={textSub} fontSize="10.5">
              (Scrubbed Logs)
            </text>
          </g>

          {/* ============================================================== */}
          {/* CENTER OUTBOUND WIRES + SMOOTH WHITE LIVE PULSES               */}
          {/* ============================================================== */}
          {/* 1. Outbound Heartbeat & Command Pull U-Loop */}
          <path
            d="M 334 96 L 168 96 Q 160 96 160 88 L 160 76 Q 160 68 168 68 L 332 68"
            stroke={hoveredCard === 'hq' ? strokeActive : wire}
            strokeWidth="1.2"
          />
          <path
            d="M 326 63.5 L 333 68 L 326 72.5"
            stroke={textMain}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle r="2.6" fill={pulseFill}>
            <animateMotion
              path="M 334 96 L 160 96 L 160 68 L 333 68"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.1;0.9;1" dur="3s" repeatCount="indefinite" />
          </circle>

          <text x="247" y="120" textAnchor="middle" fill={textSub} fontSize="10.2">
            Heartbeat pulls commands
          </text>
          <text x="247" y="133" textAnchor="middle" fill={textSub} fontSize="10.2">
            (security patches, updates,
          </text>
          <text x="247" y="146" textAnchor="middle" fill={textSub} fontSize="10.2">
            feature flags) over TLS
          </text>

          {/* 2. Outbound Revocable Cloudflare Tunnel Wire */}
          <line x1="334" y1="176" x2="288" y2="176" stroke={wire} strokeWidth="1.15" />
          <line x1="204" y1="176" x2="158" y2="176" stroke={wire} strokeWidth="1.15" />
          <path
            d="M 164 172 L 157 176 L 164 180"
            stroke={wire}
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="246" y="179.5" textAnchor="middle" fill={textSub} fontSize="10.2">
            4h Support Tunnel
          </text>
          <circle r="2.4" fill={pulseFill}>
            <animateMotion path="M 334 176 L 157 176" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.15;0.85;1" dur="2.6s" repeatCount="indefinite" />
          </circle>

          {/* 3. Scrubbed Metrics & Error Logs Wire */}
          <line x1="334" y1="312" x2="296" y2="312" stroke={wire} strokeWidth="1.15" />
          <line x1="196" y1="312" x2="158" y2="312" stroke={wire} strokeWidth="1.15" />
          <path
            d="M 164 308 L 157 312 L 164 316"
            stroke={wire}
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="246" y="315.5" textAnchor="middle" fill={textSub} fontSize="10.2">
            Query counts &amp; latency
          </text>
          <circle r="2.4" fill={pulseFill}>
            <animateMotion path="M 334 312 L 157 312" dur="2.1s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.15;0.85;1" dur="2.1s" begin="0.5s" repeatCount="indefinite" />
          </circle>

          {/* ============================================================== */}
          {/* RIGHT ENCLOSURE: YOUR AWS / GCP / AZURE / LINUX SERVER (VPC)   */}
          {/* ============================================================== */}
          <rect
            x="336"
            y="22"
            width="520"
            height="354"
            rx="8"
            fill={bgVpc}
            stroke={strokeOuter}
            strokeWidth="1.25"
          />

          {/* Cloud Icon + VPC Header */}
          <path
            d="M360 54h15a4.5 4.5 0 0 0 .4-9 6.4 6.4 0 0 0-12.1-1.9 4.9 4.9 0 0 0-3.3 10.9z"
            stroke={textMain}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <text x="386" y="53" fill={textMain} fontSize="13.5" fontWeight="600">
            Your AWS / GCP / Azure / Bare-Metal Server (VPC)
          </text>

          {/* Top-Left Box 1: Heartbeat Scheduler */}
          <g
            onMouseEnter={() => setHoveredCard('hq')}
            onMouseLeave={() => setHoveredCard(null)}
            className="cursor-pointer"
          >
            <rect
              x="356"
              y="74"
              width="224"
              height="52"
              rx="6"
              fill={hoveredCard === 'hq' ? bgHover : bgBox}
              stroke={hoveredCard === 'hq' ? strokeActive : strokeBox}
              strokeWidth="1.1"
            />
            <path
              d="M375 96l8.5-4.5 8.5 4.5-8.5 4.5-8.5-4.5zm0 5.5l8.5 4.5 8.5-4.5m-17 5.5l8.5 4.5 8.5-4.5"
              stroke={textMain}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="403" y="103.5" fill={textMain} fontSize="12.8" fontWeight="500">
              Heartbeat Scheduler
            </text>
          </g>

          {/* Top-Left Box 2: Cloudflared Outbound Tunnel */}
          <g
            onMouseEnter={() => setHoveredCard('tunnel')}
            onMouseLeave={() => setHoveredCard(null)}
            className="cursor-pointer"
          >
            <rect
              x="356"
              y="138"
              width="224"
              height="52"
              rx="6"
              fill={hoveredCard === 'tunnel' ? bgHover : bgBox}
              stroke={hoveredCard === 'tunnel' ? strokeActive : strokeBox}
              strokeWidth="1.1"
            />
            <path
              d="M372 164h6l3.5-9 4.5 18 4-13 2.8 4h6.2"
              stroke={textMain}
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="408" y="162" fill={textMain} fontSize="12.5" fontWeight="500">
              Cloudflare Tunnel
            </text>
            <text x="408" y="176.5" fill={textSub} fontSize="10">
              Outbound · 1-Click Revoke
            </text>
          </g>

          {/* Top-Right Tall Box: Docker Engine (FastAPI + Read Nodes) */}
          <g
            onMouseEnter={() => setHoveredCard('docker')}
            onMouseLeave={() => setHoveredCard(null)}
            className="cursor-pointer"
          >
            <rect
              x="594"
              y="74"
              width="242"
              height="116"
              rx="6"
              fill={hoveredCard === 'docker' ? bgHover : bgBox}
              stroke={hoveredCard === 'docker' ? strokeActive : strokeBox}
              strokeWidth="1.1"
            />
            <rect x="615" y="122" width="18" height="18" rx="2.5" stroke={textMain} strokeWidth="1.35" />
            <line x1="624" y1="122" x2="624" y2="140" stroke={textMain} strokeWidth="1.1" />
            <line x1="615" y1="131" x2="633" y2="131" stroke={textMain} strokeWidth="1.1" />
            <text x="644" y="128" fill={textMain} fontSize="13.2" fontWeight="500">
              Docker Engine (:8000)
            </text>
            <text x="644" y="146" fill={textSub} fontSize="11">
              FastAPI + Read Nodes
            </text>
          </g>

          {/* Middle Full-Width Bar: Iceberg Data Plane */}
          <g
            onMouseEnter={() => setHoveredCard('data')}
            onMouseLeave={() => setHoveredCard(null)}
            className="cursor-pointer"
          >
            <rect
              x="356"
              y="206"
              width="480"
              height="54"
              rx="6"
              fill={hoveredCard === 'data' ? bgHover : bgBox}
              stroke={hoveredCard === 'data' ? strokeActive : strokeBox}
              strokeWidth={hoveredCard === 'data' ? '1.35' : '1.1'}
            />
            <path
              d="M376 238h16a4.6 4.6 0 0 0 .4-9.2 6.5 6.5 0 0 0-12.4-1.9 5 5 0 0 0-4 11.1z"
              stroke={textMain}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="406" y="237.5" fill={textMain} fontSize="13" fontWeight="500">
              Data Plane (384d ONNX CPU · HNSW + BM25 RRF · Memory · Assistant)
            </text>
          </g>

          {/* Bottom 3-Column Row: Real Iceberg Storage Stack */}
          <g
            onMouseEnter={() => setHoveredCard('storage')}
            onMouseLeave={() => setHoveredCard(null)}
            className="cursor-pointer"
          >
            {/* Box 1: Local Vector Store (/app/data) */}
            <rect
              x="356"
              y="276"
              width="150"
              height="78"
              rx="6"
              fill={hoveredCard === 'storage' ? bgHover : bgBox}
              stroke={hoveredCard === 'storage' ? strokeActive : strokeBox}
              strokeWidth="1.1"
            />
            <ellipse cx="382" cy="306" rx="8" ry="3.2" stroke={textMain} strokeWidth="1.2" />
            <path d="M374 306v16c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-16" stroke={textMain} strokeWidth="1.2" />
            <path d="M374 314c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2" stroke={textMain} strokeWidth="1.2" />
            <text x="402" y="312" fill={textMain} fontSize="12.2" fontWeight="500">
              Vector Store
            </text>
            <text x="402" y="328" fill={textSub} fontSize="10.5">
              /app/data HNSW
            </text>

            {/* Box 2: SQLite Metadata DB */}
            <rect
              x="521"
              y="276"
              width="150"
              height="78"
              rx="6"
              fill={hoveredCard === 'storage' ? bgHover : bgBox}
              stroke={hoveredCard === 'storage' ? strokeActive : strokeBox}
              strokeWidth="1.1"
            />
            <rect x="539" y="303" width="15" height="20" rx="2" stroke={textMain} strokeWidth="1.2" />
            <line x1="543" y1="309" x2="550" y2="309" stroke={textMain} strokeWidth="1.2" />
            <line x1="543" y1="314" x2="550" y2="314" stroke={textMain} strokeWidth="1.1" />
            <text x="565" y="312" fill={textMain} fontSize="12.2" fontWeight="500">
              SQLite Metadata
            </text>
            <text x="565" y="328" fill={textSub} fontSize="10.5">
              Keys &amp; Projects
            </text>

            {/* Box 3: Cloudflare R2 / Local Backups */}
            <rect
              x="686"
              y="276"
              width="150"
              height="78"
              rx="6"
              fill={hoveredCard === 'storage' ? bgHover : bgBox}
              stroke={hoveredCard === 'storage' ? strokeActive : strokeBox}
              strokeWidth="1.1"
            />
            <path
              d="M706 321h15a4.2 4.2 0 0 0 .3-8.4 6 6 0 0 0-11.4-1.8 4.6 4.6 0 0 0-3.9 10.2z"
              stroke={textMain}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <text x="733" y="312" fill={textMain} fontSize="12.2" fontWeight="500">
              R2 / Snapshots
            </text>
            <text x="733" y="328" fill={textSub} fontSize="10.5">
              /app/data/backups
            </text>
          </g>

          {/* Bottom-Right Sovereignty Guarantee */}
          <text
            x="836"
            y="398"
            textAnchor="end"
            fill={textMain}
            fontSize="12"
            fontStyle="italic"
            fontWeight="500"
          >
            No vectors, documents, or query text leave your server
          </text>
        </svg>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* MAIN BYOC PAGE COMPONENT                                                   */
/* ========================================================================== */
export default function ProductBYOC() {
  const [dark, setDark] = useSessionTheme()
  const [activeTabIdx, setActiveTabIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [openFaqIdx, setOpenFaqIdx] = useState(null)

  const themeQuery = !dark ? '?theme=light' : ''
  const activeTab = DEPLOY_TABS[activeTabIdx]

  const trackCardGlow = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeTab.raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <div
      className={`ib-byoc-page min-h-screen flex flex-col justify-between antialiased transition-colors duration-200 ${
        dark ? 'ib-byoc-dark' : 'ib-byoc-light'
      }`}
    >
      <style>{`
        .ib-byoc-page {
          --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background-color: var(--background);
          color: var(--text-primary);
        }
        .ib-byoc-dark {
          --background: #0a0b0d;
          --background-light: #0b0c0f;
          --background-sub: #0d0e12;
          --border: rgba(255, 255, 255, 0.12);
          --border-strong: rgba(255, 255, 255, 0.3);
          --text-primary: #ffffff;
          --text-secondary: #a1a1aa;
          --text-tertiary: #71717a;
          --ib-eyebrow: #3b82f6;
          --ib-royal: #1d6bf3;
          --ib-spotlight: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.045), transparent 75%);
        }
        .ib-byoc-light {
          --background: #ffffff;
          --background-light: #ffffff;
          --background-sub: #f8fafc;
          --border: rgba(0, 0, 0, 0.1);
          --border-strong: rgba(15, 23, 42, 0.3);
          --text-primary: #111827;
          --text-secondary: #52525b;
          --text-tertiary: #71717a;
          --ib-eyebrow: #1d6bf3;
          --ib-royal: #1d6bf3;
          --ib-spotlight: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(15, 23, 42, 0.035), transparent 75%);
        }

        /* Exact 1220px Outer Rail Alignment with Navbar & Footer */
        .ib-byoc-rail {
          width: 100%;
          max-width: 1220px;
          margin-inline: auto;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }
        /* Guaranteed Inner Separation From Outer Vertical Rail Lines */
        .ib-byoc-rail-pad {
          padding-left: 24px;
          padding-right: 24px;
        }
        @media (min-width: 640px) {
          .ib-byoc-rail-pad {
            padding-left: 40px;
            padding-right: 40px;
          }
        }
        @media (min-width: 1024px) {
          .ib-byoc-rail-pad {
            padding-left: 56px;
            padding-right: 56px;
          }
        }

        /* Standalone 1px 4-Column Key Benefits Framed Grid */
        .ib-byoc-framed-grid-4 {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          border: 1px solid var(--border);
        }
        .ib-byoc-framed-grid-4 > * {
          border-bottom: 1px solid var(--border);
        }
        .ib-byoc-framed-grid-4 > :last-child {
          border-bottom: none;
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .ib-byoc-framed-grid-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .ib-byoc-framed-grid-4 > :nth-child(odd) {
            border-right: 1px solid var(--border);
          }
          .ib-byoc-framed-grid-4 > :nth-child(3),
          .ib-byoc-framed-grid-4 > :nth-child(4) {
            border-bottom: none;
          }
        }
        @media (min-width: 1024px) {
          .ib-byoc-framed-grid-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          .ib-byoc-framed-grid-4 > * {
            border-bottom: none;
            border-right: 1px solid var(--border);
          }
          .ib-byoc-framed-grid-4 > :last-child {
            border-right: none;
          }
        }

        /* Iceberg 8-Hairline Retracting Crop-Mark Buttons */
        .ib-byoc-crop-btn {
          position: relative;
          display: inline-block;
          padding: 6px;
          text-decoration: none;
          cursor: pointer;
        }
        .ib-byoc-crop-box {
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
        .ib-byoc-tick {
          position: absolute;
          pointer-events: none;
          transition: transform 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-byoc-tl-h { left: 0; top: 5px; width: 6px; height: 1px; }
        .ib-byoc-tl-v { left: 5px; top: 0; width: 1px; height: 6px; }
        .ib-byoc-tr-h { right: 0; top: 5px; width: 6px; height: 1px; }
        .ib-byoc-tr-v { right: 5px; top: 0; width: 1px; height: 6px; }
        .ib-byoc-bl-h { left: 0; bottom: 5px; width: 6px; height: 1px; }
        .ib-byoc-bl-v { left: 5px; bottom: 0; width: 1px; height: 6px; }
        .ib-byoc-br-h { right: 0; bottom: 5px; width: 6px; height: 1px; }
        .ib-byoc-br-v { right: 5px; bottom: 0; width: 1px; height: 6px; }

        .ib-byoc-crop-btn:hover .ib-byoc-tl-h,
        .ib-byoc-crop-btn:hover .ib-byoc-bl-h { transform: translate3d(5px, 0, 0); }
        .ib-byoc-crop-btn:hover .ib-byoc-tr-h,
        .ib-byoc-crop-btn:hover .ib-byoc-br-h { transform: translate3d(-5px, 0, 0); }
        .ib-byoc-crop-btn:hover .ib-byoc-tl-v,
        .ib-byoc-crop-btn:hover .ib-byoc-tr-v { transform: translate3d(0, 5px, 0); }
        .ib-byoc-crop-btn:hover .ib-byoc-bl-v,
        .ib-byoc-crop-btn:hover .ib-byoc-br-v { transform: translate3d(0, -5px, 0); }

        .ib-byoc-crop-primary-dark .ib-byoc-crop-box {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-byoc-crop-primary-dark .ib-byoc-tick { background-color: #1d6bf3; }
        .ib-byoc-crop-primary-dark:hover .ib-byoc-crop-box {
          background-color: #ffffff;
          border-color: #ffffff;
          color: #0a0b0d !important;
        }
        .ib-byoc-crop-primary-dark:hover .ib-byoc-tick { background-color: #ffffff; }

        .ib-byoc-crop-primary-light .ib-byoc-crop-box {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-byoc-crop-primary-light .ib-byoc-tick { background-color: #1d6bf3; }
        .ib-byoc-crop-primary-light:hover .ib-byoc-crop-box {
          background-color: #0f172a;
          border-color: #0f172a;
          color: #ffffff !important;
        }
        .ib-byoc-crop-primary-light:hover .ib-byoc-tick { background-color: #0f172a; }

        .ib-byoc-crop-sec-dark .ib-byoc-crop-box {
          background-color: #0b0c0f;
          border-color: rgba(255, 255, 255, 0.18);
          color: #ffffff !important;
        }
        .ib-byoc-crop-sec-dark .ib-byoc-tick { background-color: #ffffff; }
        .ib-byoc-crop-sec-dark:hover .ib-byoc-crop-box { border-color: #ffffff; }

        .ib-byoc-crop-sec-light .ib-byoc-crop-box {
          background-color: #ffffff;
          border-color: rgba(15, 23, 42, 0.18);
          color: #111827 !important;
        }
        .ib-byoc-crop-sec-light .ib-byoc-tick { background-color: #111827; }
        .ib-byoc-crop-sec-light:hover .ib-byoc-crop-box { border-color: #0f172a; }

        /* Bottom Flush CTA Buttons */
        .ib-byoc-cta-blue {
          background-color: #1d6bf3;
          border: 1px solid #1d6bf3;
          color: #ffffff !important;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-byoc-cta-blue:hover {
          background-color: #ffffff;
          border-color: #ffffff;
          color: #0a0b0d !important;
        }
        .ib-byoc-light .ib-byoc-cta-blue:hover {
          background-color: #0f172a;
          border-color: #0f172a;
          color: #ffffff !important;
        }
        .ib-byoc-plain-btn-dark {
          background-color: #0a0b0d;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff !important;
          transition: border-color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-byoc-plain-btn-dark:hover { border-color: #ffffff; }
        .ib-byoc-plain-btn-light {
          background-color: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.16);
          color: #111827 !important;
          transition: border-color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-byoc-plain-btn-light:hover { border-color: #0f172a; }

        /* Restrained Human Syntax Highlighting */
        .ib-byoc-kw  { color: #60a5fa; font-weight: 500; }
        .ib-byoc-cls { color: var(--text-primary); font-weight: 600; }
        .ib-byoc-fn  { color: #93c5fd; }
        .ib-byoc-str { color: #d4d4d8; }
        .ib-byoc-num { color: #93c5fd; font-weight: 600; }
        .ib-byoc-cmt { color: var(--text-tertiary); font-style: italic; }
        .ib-byoc-light .ib-byoc-kw  { color: #1d6bf3; }
        .ib-byoc-light .ib-byoc-fn  { color: #1d4ed8; }
        .ib-byoc-light .ib-byoc-str { color: #334155; }
        .ib-byoc-light .ib-byoc-num { color: #1d6bf3; }
      `}</style>

      <Navbar dark={dark} setDark={setDark} />

      <main className="flex-1">
        {/* ================================================================== */}
        {/* SECTION 1: HERO (PURE WHITE HEADING + LIVE MONOCHROME DIAGRAM)     */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-byoc-rail ib-byoc-rail-pad py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-9">
              <div className="lg:col-span-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 text-[var(--ib-eyebrow)]">
                  ICEBERG BYOC
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[44px] font-semibold tracking-[-0.025em] leading-[1.09] mb-5 text-[var(--text-primary)]">
                  Managed AI infrastructure with a zero-access operating model
                </h1>

                <p className="text-[15px] leading-[1.62] max-w-[475px] mb-8 text-[var(--text-secondary)]">
                  Don&apos;t let security reviews block your path to production. Run Iceberg inside
                  your AWS, GCP, Azure, or on-premise VPC. Keep the managed service experience
                  without giving Iceberg SSH, VPN, or inbound network access to your environment.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <ByocCropButton to="/contact" variant="primary" dark={dark}>
                    Get Started
                  </ByocCropButton>
                  <ByocCropButton to="/docs" variant="secondary" dark={dark}>
                    View Docs
                  </ByocCropButton>
                </div>
              </div>

              <div className="lg:col-span-7 w-full">
                <ByocHeroSplitDiagram dark={dark} />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 2: KEY BENEFITS (4-COLUMN INSET FRAMED GRID)               */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-byoc-rail ib-byoc-rail-pad py-14 sm:py-20">
            <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.14] text-[var(--text-primary)] mb-9">
              Key Benefits
            </h2>

            <div className="ib-byoc-framed-grid-4 bg-[var(--background-light)]">
              {KEY_BENEFITS.map((item) => (
                <article
                  key={item.title}
                  onMouseMove={trackCardGlow}
                  className="group relative overflow-hidden p-6 sm:p-7 flex flex-col justify-between bg-[var(--background-light)]"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'var(--ib-spotlight)' }}
                  />
                  <div className="relative z-10">
                    <div className="w-10 h-10 border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[var(--text-primary)] group-hover:border-[var(--border-strong)] transition-colors mb-6">
                      {item.icon}
                    </div>
                    <h3 className="text-[17px] font-semibold tracking-tight text-[var(--text-primary)] mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)]">
                      <strong className="font-semibold text-[var(--text-primary)]">
                        {item.lead}
                      </strong>{' '}
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 3: ZERO-ACCESS SECURITY MODEL (2-COLUMN DIVIDED)           */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-byoc-rail ib-byoc-rail-pad py-14 sm:py-20">
            <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.14] text-[var(--text-primary)] mb-10">
              Zero-access security model
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0">
              <div className="md:pr-10">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2.5">
                  Zero-access means
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] mb-5">
                  Iceberg does not need interactive access to your infrastructure to operate BYOC.
                </p>
                <ul className="space-y-3 text-[13.8px] leading-[1.6] text-[var(--text-secondary)] list-disc pl-5 marker:text-[var(--text-primary)]">
                  {ZERO_ACCESS_MEANS.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="md:pl-10 md:border-l border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2.5">
                  Zero-access does not mean
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] mb-5">
                  You don&apos;t lose the managed Iceberg workflow and engineering support.
                </p>
                <ul className="space-y-3 text-[13.8px] leading-[1.6] text-[var(--text-secondary)] list-disc pl-5 marker:text-[var(--text-tertiary)]">
                  {ZERO_ACCESS_DOES_NOT_MEAN.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 4: HOW IT WORKS (COMPACT MONOCHROME SPLIT-PLANE BLUEPRINT) */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-byoc-rail ib-byoc-rail-pad py-14 sm:py-20">
            <div className="mb-9">
              <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.14] text-[var(--text-primary)] mb-3">
                How it works
              </h2>
              <h3 className="text-base sm:text-[17px] font-semibold text-[var(--text-primary)] mb-2">
                Split-plane architecture, applied to your security boundary
              </h3>
              <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] max-w-3xl">
                BYOC keeps the entire vector data plane inside your cloud account while preserving
                the managed Iceberg control plane experience your engineering teams already use.
              </p>
            </div>

            <ByocSplitPlaneBlueprint dark={dark} />
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 5: DEPLOY AND CONNECT (SELF-SERVE BOOTSTRAP + CODE TABS)   */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-byoc-rail ib-byoc-rail-pad py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-9 lg:gap-10">
              <div className="lg:col-span-5">
                <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.14] text-[var(--text-primary)] mb-4">
                  Deploy and connect
                </h2>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2.5">
                  Self-serve deployment
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] mb-8 max-w-md">
                  Run the setup wizard, deploy with Helm or the BYOC CLI into your VPC, then create
                  and manage collections through the standard Iceberg API, SDKs, and console.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <ByocCropButton to="/contact" variant="secondary" dark={dark}>
                    Request BYOC Access
                  </ByocCropButton>
                  <ByocCropButton to="/docs" variant="secondary" dark={dark}>
                    Read BYOC Docs
                  </ByocCropButton>
                </div>
              </div>

              <div className="lg:col-span-7 w-full">
                <div className="border border-[var(--border)] bg-[var(--background-light)] overflow-hidden">
                  {/* Top Bar: File Tabs + Copy + BYOC Docs */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--background-sub)]">
                    <div className="flex items-center overflow-x-auto">
                      {DEPLOY_TABS.map((tab, idx) => {
                        const selected = idx === activeTabIdx
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveTabIdx(idx)
                              setCopied(false)
                            }}
                            className={`px-4 py-3 font-mono text-xs border-r border-[var(--border)] whitespace-nowrap transition-colors cursor-pointer ${
                              selected
                                ? 'bg-[var(--background-light)] text-[var(--text-primary)] font-semibold'
                                : 'bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                            }`}
                          >
                            {tab.filename}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex items-center shrink-0">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 border-l border-[var(--border)] px-3.5 py-3 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.7}
                        >
                          <rect x="9" y="9" width="11" height="11" rx="1.5" />
                          <path strokeLinecap="round" d="M5 15V5a1 1 0 0 1 1-1h10" />
                        </svg>
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <Link
                        to="/docs"
                        className="hidden sm:inline-flex items-center gap-1.5 border-l border-[var(--border)] px-3.5 py-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.7}
                        >
                          <rect x="5" y="3" width="14" height="18" rx="1.5" />
                          <path strokeLinecap="round" d="M9 8h6M9 12h6M9 16h4" />
                        </svg>
                        <span>BYOC Docs</span>
                      </Link>
                    </div>
                  </div>

                  {/* Numbered Code Body */}
                  <div className="p-5 sm:p-6 bg-[var(--background)] overflow-x-auto font-mono text-[12.8px] leading-[1.72]">
                    {activeTab.lines.map((lineTokens, lIdx) => (
                      <div key={lIdx} className="flex">
                        <span className="w-7 select-none text-[var(--text-tertiary)] text-right pr-4 shrink-0 tabular-nums">
                          {lIdx + 1}
                        </span>
                        <span className="whitespace-pre text-[var(--text-primary)]">
                          {lineTokens.length === 0
                            ? ' '
                            : lineTokens.map((tok, tIdx) => (
                                <span
                                  key={tIdx}
                                  className={tok.c ? `ib-byoc-${tok.c}` : undefined}
                                >
                                  {tok.t}
                                </span>
                              ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 6: FAQS (9-ROW FRAMED ACCORDION WITH + / - GRID ICON)      */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-byoc-rail ib-byoc-rail-pad py-14 sm:py-20">
            <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.14] text-[var(--text-primary)] mb-9">
              FAQs
            </h2>

            <div className="border border-[var(--border)] bg-[var(--background-light)] divide-y divide-[var(--border)]">
              {BYOC_FAQS.map((item, idx) => {
                const isOpen = openFaqIdx === idx
                return (
                  <div key={item.q} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-6 sm:px-7 py-5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <span className="text-[15px] sm:text-[16px] font-semibold text-[var(--text-primary)] leading-snug">
                        {item.q}
                      </span>

                      {/* Signature 1px Framed Crosshair + / - Box */}
                      <span
                        aria-hidden="true"
                        className={`w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${
                          isOpen
                            ? 'border-[var(--border-strong)] text-[var(--text-primary)]'
                            : 'border-[var(--border)] text-[var(--text-tertiary)]'
                        }`}
                      >
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                          <line x1="2" y1="6" x2="10" y2="6" />
                          {!isOpen && <line x1="6" y1="2" x2="6" y2="10" />}
                        </svg>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 sm:px-7 pb-6 pt-0.5 text-[14.5px] leading-[1.65] text-[var(--text-secondary)] max-w-4xl">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 7: INSET FRAMED 3-COLUMN BOTTOM CTA BANNER                 */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-byoc-rail ib-byoc-rail-pad py-12 sm:py-16">
            <div className="border border-[var(--border)] bg-[var(--background-light)] grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 px-6 sm:px-8 py-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex items-center">
                <h2 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] leading-snug text-[var(--text-primary)]">
                  Start building
                  <br />
                  knowledgeable AI today
                </h2>
              </div>

              <div className="lg:col-span-4 px-6 sm:px-8 py-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex items-center">
                <p className="text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
                  Run Iceberg inside your AWS, GCP, Azure, or on-premise VPC with a zero-access
                  operating model using the same managed Iceberg workflow you&apos;re used to.
                </p>
              </div>

              <div className="lg:col-span-3 p-5 flex flex-col justify-center gap-2.5">
                <a
                  href={`${D}/signup${themeQuery}`}
                  className="ib-byoc-cta-blue w-full py-2.5 px-4 text-center text-[13.5px] font-medium no-underline"
                >
                  Start Building
                </a>
                <Link
                  to="/contact"
                  className={`w-full py-2.5 px-4 text-center text-[13.5px] font-medium no-underline ${
                    dark ? 'ib-byoc-plain-btn-dark' : 'ib-byoc-plain-btn-light'
                  }`}
                >
                  Get Enterprise Trial
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer dark={dark} />
    </div>
  )
}
