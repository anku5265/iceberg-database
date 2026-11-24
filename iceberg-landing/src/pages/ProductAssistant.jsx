import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { Navbar, useSessionTheme } from '../components/Navbar'
import IcebergLogo from '../components/IcebergLogo'
import { CANONICAL_SPEC } from '../config/canonicalSpec'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

/* ========================================================================== */
/* CANONICAL ICEBERG ASSISTANT DATA (V1.0.0 · AP-SOUTH-1)                     */
/* ========================================================================== */
const ASSISTANT_PIPELINE_STAGES = [
  {
    id: 0,
    code: '01',
    shortLabel: 'INGEST',
    moduleTitle: 'CHUNKING',
    moduleBadge: 'PDF · MD',
    metric: 'Auto chunk_text() · PDF, Markdown & TXT',
    latency: 'STREAM IN',
  },
  {
    id: 1,
    code: '02',
    shortLabel: 'ONNX CPU',
    moduleTitle: '384D ONNX',
    moduleBadge: 'RS 0',
    metric: `In-process 384d ONNX embed (${CANONICAL_SPEC.latency.embedMin} min · Rs 0)`,
    latency: 'RS 0 EMBED',
  },
  {
    id: 2,
    code: '03',
    shortLabel: 'VECTOR DB',
    moduleTitle: 'VECTOR STORE',
    moduleBadge: '1.95MS',
    metric: `Isolated _asst_{id} cosine lookup (${CANONICAL_SPEC.latency.denseP50} p50)`,
    latency: '1.95 MS P50',
  },
  {
    id: 3,
    code: '04',
    shortLabel: '6-LLM + OUT',
    moduleTitle: '6-LLM ROUTER',
    moduleBadge: '6 LLMS',
    metric: 'Claude, Groq, GPT, Gemini, DeepSeek & Native -> API / Widget / WA',
    latency: '3 CHANNELS',
  },
]

const CORE_CAPABILITIES = [
  {
    title: 'Fast and easy to build',
    desc: 'Upload PDFs, Markdown, or text files, hit the REST API or official SDK, and ship a working RAG assistant on your website or WhatsApp in minutes.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.7 6.3a4.5 4.5 0 0 0-5.94 5.94L4.1 16.9a1.5 1.5 0 0 0 0 2.12l.88.88a1.5 1.5 0 0 0 2.12 0l4.66-4.66a4.5 4.5 0 0 0 5.94-5.94l-2.45 2.45-2.12-.53-.53-2.12 2.1-2.8z"
        />
      </svg>
    ),
  },
  {
    title: 'Higher accuracy, out of the box',
    desc: `Optimized Hybrid RRF retrieval (${CANONICAL_SPEC.latency.hybridP50} p50) fuses 384d semantic similarity with exact BM25 lexical matching for grounded, citation-backed answers.`,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.5c1.1-1.3 3-1.4 4.1-.2 1.1 1.1 1.1 3-.1 4.2L12 14.5l-4-4c-1.2-1.2-1.2-3.1-.1-4.2 1.1-1.2 3-1.1 4.1.2z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 18.5h11.5a2.5 2.5 0 0 0 2.5-2.5v-.5H9.5L7 17H4v1.5z" />
      </svg>
    ),
  },
  {
    title: 'Enterprise-grade control',
    desc: 'Hosted 100% in India (ap-south-1) for DPDP compliance. Swap OpenAI, Claude, Gemini, Groq, DeepSeek, or Iceberg Native AI anytime — files stay isolated per assistant.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <rect x="4" y="4" width="16" height="9" rx="1" />
        <circle cx="8" cy="18" r="1.5" />
        <circle cx="12" cy="18" r="1.5" />
        <circle cx="16" cy="18" r="1.5" />
        <path strokeLinecap="round" d="M8 13v3.5M12 13v3.5M16 13v3.5" />
      </svg>
    ),
  },
]

const NOCODE_CHANNELS = [
  {
    id: 'n8n',
    label: 'n8n Workflow',
    badge: 'HTTP / MCP Node',
    endpoint: 'POST https://api.icebergdb.in/assistant/{id}/chat',
  },
  {
    id: 'widget',
    label: 'Web Widget',
    badge: '1-Line JS Embed',
    endpoint: '<script src="https://api.icebergdb.in/assistant/{id}/widget.js"></script>',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp Bot',
    badge: 'Business Webhook',
    endpoint: 'https://api.icebergdb.in/assistant/{id}/whatsapp',
  },
  {
    id: 'mcp',
    label: 'Claude & Cursor',
    badge: 'Model Context Protocol',
    endpoint: 'npx -y iceberg-mcp',
  },
]

const ACCURACY_BENCHMARKS = [
  { domain: 'Question Answering', iceberg: 86.40, baseline: 82.39 },
  { domain: 'Financial Analysis', iceberg: 83.15, baseline: 71.62 },
  { domain: 'Legal Exploration', iceberg: 90.82, baseline: 82.04 },
  { domain: 'Average', iceberg: 86.79, baseline: 78.68 },
]

const DEPLOY_SNIPPETS = [
  {
    id: 'python',
    filename: 'assistant/iceberg.py',
    raw: `from iceberg import Iceberg\n\nic = Iceberg(api_key="YOUR_API_KEY")\n\nassistant = ic.assistant.create_assistant(\n    assistant_name="support-assistant",\n    instructions="Answer concisely using uploaded policy docs.",\n    llm_provider="claude",\n    region="ap-south-1",\n    timeout=30\n)`,
    lines: [
      [
        { t: 'from', c: 'kw' },
        { t: ' iceberg ' },
        { t: 'import', c: 'kw' },
        { t: ' Iceberg', c: 'cls' },
      ],
      [],
      [
        { t: 'ic = ' },
        { t: 'Iceberg', c: 'cls' },
        { t: '(api_key=' },
        { t: '"YOUR_API_KEY"', c: 'str' },
        { t: ')' },
      ],
      [],
      [
        { t: 'assistant = ic.assistant.' },
        { t: 'create_assistant', c: 'fn' },
        { t: '(' },
      ],
      [
        { t: '    assistant_name=' },
        { t: '"support-assistant"', c: 'str' },
        { t: ',' },
      ],
      [
        { t: '    instructions=' },
        { t: '"Answer concisely using uploaded policy docs."', c: 'str' },
        { t: ',' },
      ],
      [
        { t: '    llm_provider=' },
        { t: '"claude"', c: 'str' },
        { t: ',' },
      ],
      [
        { t: '    region=' },
        { t: '"ap-south-1"', c: 'str' },
        { t: ',' },
      ],
      [
        { t: '    timeout=' },
        { t: '30', c: 'num' },
      ],
      [{ t: ')' }],
    ],
  },
  {
    id: 'widget',
    filename: 'embed/widget.html',
    raw: `<!-- Paste before </body> on any site -->\n<script\n  src="https://api.icebergdb.in/assistant/YOUR_ID/widget.js"\n  data-theme="dark"\n  data-region="ap-south-1"\n  defer\n></script>`,
    lines: [
      [{ t: '<!-- Paste before </body> on any site -->', c: 'cmt' }],
      [{ t: '<script', c: 'kw' }],
      [
        { t: '  src=' },
        { t: '"https://api.icebergdb.in/assistant/YOUR_ID/widget.js"', c: 'str' },
      ],
      [
        { t: '  data-theme=' },
        { t: '"dark"', c: 'str' },
      ],
      [
        { t: '  data-region=' },
        { t: '"ap-south-1"', c: 'str' },
      ],
      [{ t: '  defer', c: 'num' }],
      [{ t: '></script>', c: 'kw' }],
    ],
  },
  {
    id: 'whatsapp',
    filename: 'webhook/whatsapp.sh',
    raw: `# Point Meta WhatsApp Business Webhook URL to Iceberg\ncurl -X POST https://api.icebergdb.in/assistant \\\\\n  -H "x-api-key: YOUR_API_KEY" \\\\\n  -H "Content-Type: application/json" \\\\\n  -d '{\n    "name": "whatsapp-support",\n    "llm_provider": "gemini",\n    "greeting": "Namaste! Ask anything about your order."\n  }'\n# Webhook -> https://api.icebergdb.in/assistant/{id}/whatsapp`,
    lines: [
      [{ t: '# Point Meta WhatsApp Business Webhook URL to Iceberg', c: 'cmt' }],
      [
        { t: 'curl', c: 'kw' },
        { t: ' -X POST https://api.icebergdb.in/assistant \\' },
      ],
      [
        { t: '  -H ' },
        { t: '"x-api-key: YOUR_API_KEY"', c: 'str' },
        { t: ' \\' },
      ],
      [
        { t: '  -H ' },
        { t: '"Content-Type: application/json"', c: 'str' },
        { t: ' \\' },
      ],
      [{ t: "  -d '{" }],
      [
        { t: '    "name": ' },
        { t: '"whatsapp-support"', c: 'str' },
        { t: ',' },
      ],
      [
        { t: '    "llm_provider": ' },
        { t: '"gemini"', c: 'str' },
        { t: ',' },
      ],
      [
        { t: '    "greeting": ' },
        { t: '"Namaste! Ask anything about your order."', c: 'str' },
      ],
      [{ t: "  }'" }],
      [{ t: '# Webhook -> https://api.icebergdb.in/assistant/{id}/whatsapp', c: 'cmt' }],
    ],
  },
]

/* ========================================================================== */
/* ICEBERG 8-HAIRLINE RETRACTING CROP-MARK BUTTON                             */
/* ========================================================================== */
function AssistantCropButton({ href, to, variant = 'primary', dark, children }) {
  const cls = `ib-asst-crop-btn ${
    variant === 'primary'
      ? dark
        ? 'ib-asst-crop-primary-dark'
        : 'ib-asst-crop-primary-light'
      : dark
      ? 'ib-asst-crop-sec-dark'
      : 'ib-asst-crop-sec-light'
  }`

  const inner = (
    <>
      <span className="ib-asst-tick ib-asst-tl-h" />
      <span className="ib-asst-tick ib-asst-tl-v" />
      <span className="ib-asst-tick ib-asst-tr-h" />
      <span className="ib-asst-tick ib-asst-tr-v" />
      <span className="ib-asst-tick ib-asst-bl-h" />
      <span className="ib-asst-tick ib-asst-bl-v" />
      <span className="ib-asst-tick ib-asst-br-h" />
      <span className="ib-asst-tick ib-asst-br-v" />
      <span className="ib-asst-crop-box">{children}</span>
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
/* HERO ORIGINAL LIVE ARCHITECTURAL SVG DIAGRAM (CLEAN · NATURAL · LIVE)      */
/* ========================================================================== */
function IcebergAssistantBlueprint({ dark, activeStage, setActiveStage, setPaused }) {
  const cyan = dark ? '#00d2ff' : '#0284c7'
  const strokeMain = dark ? 'rgba(255, 255, 255, 0.56)' : 'rgba(15, 23, 42, 0.5)'
  const strokeSub = dark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(15, 23, 42, 0.26)'
  const strokeFaint = dark ? 'rgba(255, 255, 255, 0.11)' : 'rgba(15, 23, 42, 0.1)'
  const boxFill = dark ? '#0d0f14' : '#f8fafc'
  const depthFill = dark ? '#08090c' : '#e2e8f0'
  const activeFill = dark ? '#091822' : '#e0f2fe'
  const activeDepth = dark ? 'rgba(0, 210, 255, 0.18)' : 'rgba(2, 132, 199, 0.16)'
  const textPrimary = dark ? '#f4f4f5' : '#0f172a'
  const textMuted = dark ? 'rgba(255, 255, 255, 0.62)' : '#475569'
  const textDim = dark ? '#71717a' : '#64748b'

  const stage = ASSISTANT_PIPELINE_STAGES[activeStage]
  const moduleY = [54, 114, 174, 234]

  const inputDocs = [
    { label: 'PDF', y: 60 },
    { label: 'MD / TXT', y: 120 },
    { label: 'QUERY', y: 236 },
  ]

  const outputChannels = [
    { label: 'REST API', sub: '/chat', y: 66 },
    { label: 'WIDGET.JS', sub: 'website', y: 144 },
    { label: 'WHATSAPP', sub: '/whatsapp', y: 222 },
  ]

  return (
    <div
      className="border border-[var(--border)] bg-[var(--background-light)] overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Clean Minimal Top Telemetry Strip */}
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em]">
        <span className="text-[var(--text-tertiary)] truncate">
          ICEBERG // ASSISTANT ENGINE · AP-SOUTH-1
        </span>
        <span className="inline-flex items-center gap-1.5 shrink-0 text-[var(--ib-cyan)] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ib-cyan)] animate-pulse" />
          {stage.latency}
        </span>
      </div>

      {/* Pure Architectural Wireframe SVG Canvas */}
      <svg
        viewBox="0 0 480 318"
        className="w-full h-auto block"
        fill="none"
        role="img"
        aria-label="Iceberg Assistant live pipeline from PDF and Markdown documents through 384d ONNX, Vector Store, and 6-LLM Router to REST API, Website Widget, and WhatsApp"
      >
        {/* Subtle Vertical Blueprint Guide Rails */}
        <line x1="118" y1="22" x2="118" y2="298" stroke={strokeFaint} strokeWidth="0.9" strokeDasharray="2 4" />
        <line x1="352" y1="22" x2="352" y2="298" stroke={strokeFaint} strokeWidth="0.9" strokeDasharray="2 4" />

        {/* Section Header Micro-Labels */}
        <text x="18" y="34" fill={textDim} fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="1.5">
          INPUT
        </text>
        <text x="236" y="34" textAnchor="middle" fill={cyan} fontFamily="var(--font-mono)" fontSize="8.8" fontWeight="700" letterSpacing="1.8">
          ASSISTANT CORE
        </text>
        <text x="462" y="34" textAnchor="end" fill={textDim} fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="1.5">
          CHANNELS
        </text>

        {/* Dashed Core Enclosure */}
        <rect
          x="136"
          y="42"
          width="200"
          height="252"
          stroke={strokeSub}
          strokeWidth="0.95"
          strokeDasharray="3 3"
        />

        {/* LEFT INGRESS: PDF, MD/TXT -> Stage 01 & QUERY -> Stage 03 */}
        <path
          d="M 94 77 L 118 77 M 94 137 L 118 137 L 118 77 L 148 77"
          stroke={activeStage === 0 ? cyan : strokeSub}
          strokeWidth={activeStage === 0 ? '1.25' : '1'}
          strokeDasharray="2.5 2.5"
        />
        <line
          x1="94"
          y1="253"
          x2="148"
          y2="253"
          stroke={activeStage >= 2 ? cyan : strokeSub}
          strokeWidth={activeStage >= 2 ? '1.25' : '1'}
          strokeDasharray="2.5 2.5"
        />

        {/* Live Animated Ingress Signal Dots */}
        <circle r="2.4" fill={cyan}>
          <animateMotion path="M 94 77 L 148 77" dur="1.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.9s" repeatCount="indefinite" />
        </circle>
        <circle r="2.4" fill={cyan}>
          <animateMotion path="M 94 137 L 118 137 L 118 77 L 148 77" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle r="2.4" fill={cyan}>
          <animateMotion path="M 94 253 L 148 253" dur="2.1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="2.1s" repeatCount="indefinite" />
        </circle>

        {inputDocs.map((doc, idx) => {
          const lit = (idx < 2 && activeStage === 0) || (idx === 2 && activeStage >= 2)
          return (
            <g
              key={doc.label}
              onClick={() => setActiveStage(idx < 2 ? 0 : 2)}
              className="cursor-pointer"
            >
              <rect
                x="20"
                y={doc.y + 3}
                width="76"
                height="34"
                fill={depthFill}
                stroke={lit ? cyan : strokeFaint}
                strokeWidth="0.9"
              />
              <rect
                x="18"
                y={doc.y}
                width="76"
                height="34"
                fill={lit ? activeFill : boxFill}
                stroke={lit ? cyan : strokeMain}
                strokeWidth={lit ? '1.25' : '1'}
              />
              <text
                x="56"
                y={doc.y + 20.5}
                textAnchor="middle"
                fill={lit ? textPrimary : textMuted}
                fontFamily="var(--font-mono)"
                fontSize="9.5"
                fontWeight="600"
                letterSpacing="1.2"
              >
                {doc.label}
              </text>
            </g>
          )
        })}

        {/* CENTER VERTICAL SPINE + LIVE CONTINUOUS STREAM */}
        <line
          x1="236"
          y1="76"
          x2="236"
          y2="256"
          stroke={cyan}
          strokeWidth="1.4"
          strokeOpacity="0.28"
        />
        <circle cx="236" cy="76" r="2.8" fill={cyan}>
          <animate attributeName="cy" values="76;256" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="2.4s" repeatCount="indefinite" />
        </circle>

        {/* CENTER 4 ARCHITECTURAL MODULES (CHUNKING -> 384D ONNX -> VECTOR STORE -> 6-LLM ROUTER) */}
        {ASSISTANT_PIPELINE_STAGES.map((item, idx) => {
          const y = moduleY[idx]
          const isActive = activeStage === idx
          return (
            <g
              key={item.id}
              onClick={() => setActiveStage(idx)}
              className="cursor-pointer"
            >
              {/* Subtle 3D Architectural Offset Plate */}
              <rect
                x="152"
                y={y + 4}
                width="172"
                height="44"
                fill={isActive ? activeDepth : depthFill}
                stroke={isActive ? cyan : strokeSub}
                strokeWidth="0.95"
              />

              {/* Main Module Face */}
              <rect
                x="148"
                y={y}
                width="172"
                height="44"
                fill={isActive ? activeFill : boxFill}
                stroke={isActive ? cyan : strokeMain}
                strokeWidth={isActive ? '1.4' : '1'}
              />

              {/* Left Active Indicator Node */}
              <circle
                cx="162"
                cy={y + 22}
                r={isActive ? '3' : '2.2'}
                fill={isActive ? cyan : strokeSub}
              />

              {/* Module Title */}
              <text
                x="173"
                y={y + 25.5}
                fill={isActive ? textPrimary : textMuted}
                fontFamily="var(--font-mono)"
                fontSize="10"
                fontWeight={isActive ? '700' : '600'}
                letterSpacing="1.15"
              >
                {item.moduleTitle}
              </text>

              {/* Right Precision Tag */}
              <text
                x="309"
                y={y + 25}
                textAnchor="end"
                fill={isActive ? cyan : textDim}
                fontFamily="var(--font-mono)"
                fontSize="8.6"
                fontWeight="600"
                letterSpacing="0.9"
              >
                {item.moduleBadge}
              </text>
            </g>
          )
        })}

        {/* RIGHT MULTI-CHANNEL FAN-OUT BUS (CORE -> REST API / WIDGET.JS / WHATSAPP) */}
        <path
          d="M 324 256 L 352 256 L 352 86 L 374 86 M 352 164 L 374 164 M 352 242 L 374 242"
          stroke={activeStage === 3 ? cyan : strokeSub}
          strokeWidth={activeStage === 3 ? '1.25' : '1'}
          strokeDasharray="2.5 2.5"
        />

        {/* 3 Live Simultaneous Output Signal Dots */}
        <circle r="2.4" fill={cyan}>
          <animateMotion path="M 324 256 L 352 256 L 352 86 L 374 86" dur="2.3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="2.3s" repeatCount="indefinite" />
        </circle>
        <circle r="2.4" fill={cyan}>
          <animateMotion path="M 324 256 L 352 256 L 352 164 L 374 164" dur="2.0s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="2.0s" begin="0.4s" repeatCount="indefinite" />
        </circle>
        <circle r="2.4" fill={cyan}>
          <animateMotion path="M 324 256 L 352 256 L 352 242 L 374 242" dur="1.7s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="1.7s" begin="0.8s" repeatCount="indefinite" />
        </circle>

        {outputChannels.map((ch) => {
          const lit = activeStage === 3
          return (
            <g
              key={ch.label}
              onClick={() => setActiveStage(3)}
              className="cursor-pointer"
            >
              <rect
                x="377"
                y={ch.y + 3}
                width="86"
                height="40"
                fill={depthFill}
                stroke={lit ? cyan : strokeFaint}
                strokeWidth="0.9"
              />
              <rect
                x="374"
                y={ch.y}
                width="86"
                height="40"
                fill={lit ? activeFill : boxFill}
                stroke={lit ? cyan : strokeMain}
                strokeWidth={lit ? '1.25' : '1'}
              />
              <text
                x="417"
                y={ch.y + 18}
                textAnchor="middle"
                fill={lit ? textPrimary : textMuted}
                fontFamily="var(--font-mono)"
                fontSize="9.2"
                fontWeight="600"
                letterSpacing="1.05"
              >
                {ch.label}
              </text>
              <text
                x="417"
                y={ch.y + 30.5}
                textAnchor="middle"
                fill={lit ? cyan : textDim}
                fontFamily="var(--font-mono)"
                fontSize="8.2"
                letterSpacing="0.8"
              >
                {ch.sub}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Clean Minimal 4-Cell Stage Selector Strip */}
      <div className="border-t border-[var(--border)]">
        <div className="grid grid-cols-4 divide-x divide-[var(--border)]">
          {ASSISTANT_PIPELINE_STAGES.map((s, idx) => {
            const active = activeStage === idx
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={`px-3 py-2.5 text-left font-mono transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--ib-cyan-soft)] text-[var(--text-primary)]'
                    : 'bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div
                  className={`text-[9.5px] font-semibold tracking-[0.12em] ${
                    active ? 'text-[var(--ib-cyan)]' : ''
                  }`}
                >
                  {s.code} · {s.shortLabel}
                </div>
              </button>
            )
          })}
        </div>
        <div className="px-4 py-2 border-t border-[var(--border-faint)] bg-[var(--background)] flex items-center justify-between gap-2 font-mono text-[11px]">
          <span className="text-[var(--text-secondary)] truncate">{stage.metric}</span>
          <span className="text-[var(--ib-cyan)] shrink-0 font-semibold">ap-south-1</span>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* NO-CODE WORKFLOW CANVAS (N8N · WHATSAPP · WIDGET · MCP)                    */
/* ========================================================================== */
function NoCodeWorkflowShowcase({ dark }) {
  const [activeChan, setActiveChan] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => {
      setActiveChan((c) => (c + 1) % NOCODE_CHANNELS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [paused])

  const chan = NOCODE_CHANNELS[activeChan]

  return (
    <div
      className="border border-[var(--border)] bg-[var(--background-light)] overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Dot-Matrix Canvas Area */}
      <div
        className="relative px-5 sm:px-7 pt-5 pb-7"
        style={{
          backgroundImage: dark
            ? 'radial-gradient(rgba(255, 255, 255, 0.085) 1px, transparent 1px)'
            : 'radial-gradient(rgba(15, 23, 42, 0.11) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      >
        {/* Top-Left Co-Badge (n8n / MCP | Iceberg) */}
        <div className="flex items-center justify-between gap-3 mb-7">
          <div className="inline-flex items-center gap-2.5 text-xs font-medium text-[var(--text-primary)]">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="inline-flex items-center">
                <span className="h-2 w-2 rounded-full border border-[#f43f5e] bg-[#f43f5e]/20" />
                <span className="h-px w-2 bg-[#f43f5e]" />
                <span className="h-2 w-2 rounded-full border border-[#f43f5e] bg-[#f43f5e]/20" />
              </span>
              <span>n8n</span>
            </span>
            <span className="h-3.5 w-px bg-[var(--border)]" />
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <IcebergLogo className="w-4 h-4" />
              <span>Iceberg</span>
            </span>
          </div>

          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--ib-cyan)]">
            {chan.badge}
          </span>
        </div>

        {/* Center Interactive Node Graph */}
        <div className="flex items-center justify-center py-3">
          {/* Input Wire */}
          <div className="relative w-12 sm:w-16 h-px bg-[var(--border)] flex items-center">
            <span className="ib-asst-wire-pulse" />
            <svg
              className="w-2.5 h-2.5 text-[var(--text-tertiary)] absolute -right-1"
              viewBox="0 0 10 10"
              fill="currentColor"
            >
              <path d="M0 1 L8 5 L0 9 Z" />
            </svg>
          </div>

          {/* Left Input Port */}
          <div className="w-4 h-4 rounded-full border border-[var(--border)] bg-[var(--background)] -mr-2 z-10 shrink-0" />

          {/* Central Iceberg Assistant Node Square */}
          <div
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl border border-[var(--ib-cyan-border)] bg-[var(--background)] flex flex-col items-center justify-center gap-2 transition-shadow duration-300"
            style={{ boxShadow: 'var(--ib-cyan-glow)' }}
          >
            {/* Multi-Vector Radiant Arrow Cluster (Inspired by Workflow Node Iconography, Styled for Iceberg) */}
            <svg
              className="w-12 h-12 text-[var(--text-primary)]"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="24" cy="39" r="1.8" fill="var(--ib-cyan)" stroke="none" />
              <path d="M24 31V19M19.5 23.5L24 19l4.5 4.5" stroke="var(--ib-cyan)" />
              <path d="M24 13V6M20 10l4-4 4 4" />
              <path d="M15 24l-5-5M10 24v-5h5" />
              <path d="M33 24l5-5M33 19h5v5" />
              <path d="M16 34l-5-4M11 35l0-5 5 0" />
              <path d="M32 34l5-4M37 35l0-5-5 0" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Assistant
            </span>
          </div>

          {/* Right Output Port */}
          <div className="w-4 h-4 rounded-full border border-[var(--border)] bg-[var(--background)] -ml-2 z-10 shrink-0" />

          {/* Output Wire + Add Channel Trigger */}
          <div className="w-8 sm:w-12 h-px bg-[var(--border)]" />
          <button
            type="button"
            onClick={() => setActiveChan((c) => (c + 1) % NOCODE_CHANNELS.length)}
            title="Cycle deployment channel"
            className="w-8 h-8 rounded-md border border-[var(--border)] bg-[var(--background)] hover:border-[var(--ib-cyan-border)] text-[var(--text-primary)] hover:text-[var(--ib-cyan)] flex items-center justify-center text-base font-medium transition-colors cursor-pointer shrink-0"
          >
            +
          </button>
        </div>

        {/* Channel Selector Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {NOCODE_CHANNELS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveChan(idx)}
              className={`px-2.5 py-1 border font-mono text-[11px] transition-colors cursor-pointer ${
                idx === activeChan
                  ? 'border-[var(--ib-cyan-border)] bg-[var(--ib-cyan-soft)] text-[var(--text-primary)] font-semibold'
                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Endpoint Footer Strip */}
      <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 font-mono text-[11.5px]">
        <span className="text-[var(--text-secondary)] truncate">{chan.endpoint}</span>
        <span className="text-[var(--ib-cyan)] shrink-0 font-semibold">ap-south-1</span>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* LIVE RECHARTS-GRADE MULTI-DOMAIN ACCURACY BENCHMARK CHART                  */
/* ========================================================================== */
function DomainAccuracyChart({ dark }) {
  const containerRef = useRef(null)
  const plotAreaRef = useRef(null)
  const [animTime, setAnimTime] = useState(0)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [focusedSeries, setFocusedSeries] = useState(null) // 'iceberg' | 'baseline' | null
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const axisMin = 45
  const axisSpan = 57 // [45 .. 102] aligns 50..100 gridlines cleanly inside plot bounds
  const majorTicks = [50, 60, 70, 80, 90, 100]
  const minorTicks = [55, 65, 75, 85, 95]
  const toPct = (val) => Math.max(0, Math.min(100, ((val - axisMin) / axisSpan) * 100))

  // Smooth rAF bar sweep + live score counter whenever chart enters viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    let rafId = null
    const runSweep = () => {
      if (rafId) cancelAnimationFrame(rafId)
      const start = performance.now()
      const totalMs = 1250
      const step = (now) => {
        const elapsed = now - start
        setAnimTime(Math.min(totalMs, elapsed))
        if (elapsed < totalMs) {
          rafId = requestAnimationFrame(step)
        }
      }
      rafId = requestAnimationFrame(step)
    }

    if (typeof IntersectionObserver === 'undefined') {
      setAnimTime(1250)
      return undefined
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          runSweep()
        } else {
          if (rafId) cancelAnimationFrame(rafId)
          setAnimTime(0)
        }
      },
      { threshold: 0.25 }
    )

    obs.observe(el)
    return () => {
      obs.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)
  const getRowProgress = (rIdx, offsetMs = 0) => {
    const raw = (animTime - (rIdx * 95 + offsetMs)) / 860
    return easeOutQuint(Math.max(0, Math.min(1, raw)))
  }

  const handlePlotMouseMove = (e) => {
    const rect = plotAreaRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const activeData = hoveredRow !== null ? ACCURACY_BENCHMARKS[hoveredRow] : null

  return (
    <div ref={containerRef} className="mt-8 pt-2 sm:px-2 select-none">
      {/* Stacked Top-Right Interactive Legend (Matches Reference Layout) */}
      <div className="flex justify-end mb-7 sm:pr-6">
        <div className="flex flex-col items-start gap-2 text-[13px] font-medium">
          <button
            type="button"
            onMouseEnter={() => setFocusedSeries('iceberg')}
            onMouseLeave={() => setFocusedSeries(null)}
            onClick={() => setFocusedSeries((s) => (s === 'iceberg' ? null : 'iceberg'))}
            className={`inline-flex items-center gap-2.5 transition-opacity cursor-pointer ${
              focusedSeries === 'baseline' ? 'opacity-45' : 'opacity-100'
            }`}
          >
            <span className="h-[10px] w-[14px] bg-[var(--ib-bar-primary)] inline-block shrink-0" />
            <span className="text-[var(--text-primary)]">Iceberg Assistants</span>
          </button>

          <button
            type="button"
            onMouseEnter={() => setFocusedSeries('baseline')}
            onMouseLeave={() => setFocusedSeries(null)}
            onClick={() => setFocusedSeries((s) => (s === 'baseline' ? null : 'baseline'))}
            className={`inline-flex items-center gap-2.5 transition-opacity cursor-pointer ${
              focusedSeries === 'iceberg' ? 'opacity-45' : 'opacity-100'
            }`}
          >
            <span className="h-[10px] w-[14px] bg-[var(--ib-bar-baseline)] inline-block shrink-0" />
            <span className="text-[var(--text-primary)]">Standard Assistants</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Chart Grid: Left Labels + Continuous Unbroken Right Plot Canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-[156px_1fr] gap-x-5">
        {/* Left Y-Axis Domain Labels (Desktop) */}
        <div className="hidden sm:flex flex-col justify-between py-3">
          {ACCURACY_BENCHMARKS.map((row, rIdx) => (
            <div
              key={row.domain}
              onMouseEnter={() => setHoveredRow(rIdx)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`h-[84px] flex items-center justify-end text-right text-[13.5px] transition-colors ${
                hoveredRow === rIdx
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-primary)] font-normal'
              }`}
            >
              {row.domain}
            </div>
          ))}
        </div>

        {/* Continuous Right Plot Canvas with Full-Height Gridlines */}
        <div
          ref={plotAreaRef}
          onMouseMove={handlePlotMouseMove}
          onMouseLeave={() => setHoveredRow(null)}
          className={`relative border-l py-3 ${
            dark ? 'border-white/[0.2]' : 'border-slate-900/[0.18]'
          }`}
        >
          {/* Full-Height Minor Vertical Gridlines (55, 65, 75, 85, 95) */}
          {minorTicks.map((tick) => (
            <div
              key={`minor-${tick}`}
              aria-hidden="true"
              className={`pointer-events-none absolute top-0 bottom-0 w-px ${
                dark ? 'bg-white/[0.04]' : 'bg-slate-900/[0.04]'
              }`}
              style={{ left: `${toPct(tick)}%` }}
            />
          ))}

          {/* Full-Height Major Vertical Gridlines (50, 60, 70, 80, 90, 100) */}
          {majorTicks.map((tick) => (
            <div
              key={`major-${tick}`}
              aria-hidden="true"
              className={`pointer-events-none absolute top-0 bottom-0 w-px ${
                dark ? 'bg-white/[0.085]' : 'bg-slate-900/[0.08]'
              }`}
              style={{ left: `${toPct(tick)}%` }}
            />
          ))}

          {/* 4 Domain Bar Pairs */}
          <div className="relative z-10 flex flex-col justify-between gap-5 sm:gap-4">
            {ACCURACY_BENCHMARKS.map((row, rIdx) => {
              const pPrimary = getRowProgress(rIdx, 0)
              const pBase = getRowProgress(rIdx, 55)
              const ibWidth = toPct(row.iceberg) * pPrimary
              const baseWidth = toPct(row.baseline) * pBase
              const ibVal = axisMin + (row.iceberg - axisMin) * pPrimary
              const baseVal = axisMin + (row.baseline - axisMin) * pBase
              const isRowHovered = hoveredRow === rIdx
              const dimRow = hoveredRow !== null && !isRowHovered

              return (
                <div
                  key={row.domain}
                  onMouseEnter={() => setHoveredRow(rIdx)}
                  className={`relative sm:h-[84px] flex flex-col justify-center px-0 py-1.5 transition-colors duration-150 ${
                    isRowHovered
                      ? dark
                        ? 'bg-white/[0.035]'
                        : 'bg-slate-900/[0.035]'
                      : 'bg-transparent'
                  } ${dimRow ? 'opacity-80' : 'opacity-100'}`}
                >
                  {/* Mobile Domain Label */}
                  <div className="sm:hidden text-[12.5px] font-medium text-[var(--text-primary)] pl-2.5 mb-1.5">
                    {row.domain}
                  </div>

                  <div className="space-y-[5px]">
                    {/* Primary Iceberg Bar */}
                    <div
                      className={`flex items-center transition-opacity duration-200 ${
                        focusedSeries === 'baseline' ? 'opacity-30' : 'opacity-100'
                      }`}
                    >
                      <div
                        className="h-[26px] sm:h-[29px] bg-[var(--ib-bar-primary)] shrink-0 transition-shadow duration-200"
                        style={{
                          width: `${ibWidth}%`,
                          boxShadow: isRowHovered
                            ? '0 0 18px rgba(29, 107, 243, 0.38)'
                            : 'none',
                        }}
                      />
                      <span className="ml-2.5 text-[13px] sm:text-[13.5px] font-medium tabular-nums text-[var(--text-primary)] whitespace-nowrap">
                        {ibVal.toFixed(2)}
                      </span>
                    </div>

                    {/* Baseline Standard Bar */}
                    <div
                      className={`flex items-center transition-opacity duration-200 ${
                        focusedSeries === 'iceberg' ? 'opacity-30' : 'opacity-100'
                      }`}
                    >
                      <div
                        className="h-[26px] sm:h-[29px] bg-[var(--ib-bar-baseline)] shrink-0"
                        style={{ width: `${baseWidth}%` }}
                      />
                      <span className="ml-2.5 text-[13px] sm:text-[13.5px] font-medium tabular-nums text-[var(--text-primary)] opacity-90 whitespace-nowrap">
                        {baseVal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live Floating Recharts-Style Cursor Tooltip */}
          {activeData && (
            <div
              className="pointer-events-none hidden sm:block absolute z-30 border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 shadow-2xl min-w-[215px]"
              style={{
                left: `${Math.min(Math.max(tooltipPos.x + 16, 12), 460)}px`,
                top: `${Math.max(tooltipPos.y - 36, 6)}px`,
              }}
            >
              <div className="text-[12px] font-semibold text-[var(--text-primary)] mb-1.5 pb-1.5 border-b border-[var(--border-faint)]">
                {activeData.domain}
              </div>
              <div className="space-y-1 text-[12px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span className="h-2 w-2.5 bg-[var(--ib-bar-primary)] inline-block" />
                    Iceberg Assistants
                  </span>
                  <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                    {activeData.iceberg.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span className="h-2 w-2.5 bg-[var(--ib-bar-baseline)] inline-block" />
                    Standard Assistants
                  </span>
                  <span className="font-mono text-[var(--text-secondary)] tabular-nums">
                    {activeData.baseline.toFixed(2)}
                  </span>
                </div>
                <div className="pt-1 mt-1 border-t border-[var(--border-faint)] flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[var(--text-tertiary)]">Gain</span>
                  <span className="text-[var(--ib-cyan)] font-semibold">
                    +{(activeData.iceberg - activeData.baseline).toFixed(2)} pts
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom X-Axis Ticks (50..100) + Centered Axis Title */}
      <div className="grid grid-cols-1 sm:grid-cols-[156px_1fr] gap-x-5 pt-2.5">
        <div className="hidden sm:block" />
        <div>
          <div className="relative h-5">
            {majorTicks.map((tick) => (
              <span
                key={`label-${tick}`}
                className="absolute top-0.5 -translate-x-1/2 text-[12px] tabular-nums text-[var(--text-secondary)]"
                style={{ left: `${toPct(tick)}%` }}
              >
                {tick}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-[13.5px] font-normal text-[var(--text-primary)]">
            Answer Alignment Score
          </p>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* MAIN PAGE COMPONENT                                                        */
/* ========================================================================== */
export default function ProductAssistant() {
  const [dark, setDark] = useSessionTheme()
  const [activeStage, setActiveStage] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  const themeQuery = !dark ? '?theme=light' : ''

  // Auto-cycle live Hero architectural stages
  useEffect(() => {
    if (heroPaused) return undefined
    const id = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % ASSISTANT_PIPELINE_STAGES.length)
    }, 2400)
    return () => clearInterval(id)
  }, [heroPaused])

  const trackCardGlow = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const activeSnippet = DEPLOY_SNIPPETS[activeSnippetIdx]

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet.raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <div
      className={`ib-asst-page min-h-screen flex flex-col justify-between antialiased transition-colors duration-200 ${
        dark ? 'ib-asst-dark' : 'ib-asst-light'
      }`}
    >
      <style>{`
        .ib-asst-page {
          --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background-color: var(--background);
          color: var(--text-primary);
        }
        .ib-asst-dark {
          --background: #0a0b0d;
          --background-light: #0b0c0f;
          --background-sub: #0d0e12;
          --border: rgba(255, 255, 255, 0.12);
          --border-faint: rgba(255, 255, 255, 0.07);
          --text-primary: #ffffff;
          --text-secondary: #a1a1aa;
          --text-tertiary: #71717a;
          --ib-cyan: #00d2ff;
          --ib-cyan-border: rgba(0, 210, 255, 0.45);
          --ib-cyan-soft: rgba(0, 210, 255, 0.095);
          --ib-cyan-glow: 0 0 28px rgba(0, 210, 255, 0.06);
          --ib-royal: #1d6bf3;
          --ib-bar-primary: #1d6bf3;
          --ib-bar-baseline: #52525b;
          --ib-spotlight: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(0, 210, 255, 0.075), transparent 75%);
        }
        .ib-asst-light {
          --background: #ffffff;
          --background-light: #ffffff;
          --background-sub: #f8fafc;
          --border: rgba(0, 0, 0, 0.1);
          --border-faint: rgba(0, 0, 0, 0.06);
          --text-primary: #111827;
          --text-secondary: #52525b;
          --text-tertiary: #71717a;
          --ib-cyan: #0284c7;
          --ib-cyan-border: rgba(2, 132, 199, 0.42);
          --ib-cyan-soft: rgba(2, 132, 199, 0.085);
          --ib-cyan-glow: none;
          --ib-royal: #1d6bf3;
          --ib-bar-primary: #1d6bf3;
          --ib-bar-baseline: #94a3b8;
          --ib-spotlight: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(2, 132, 199, 0.055), transparent 75%);
        }

        /* Exact 1220px Outer Rail Alignment with Navbar & Footer */
        .ib-asst-rail {
          width: 100%;
          max-width: 1220px;
          margin-inline: auto;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }
        /* Guaranteed Inner Separation From Outer Vertical Rail Lines */
        .ib-asst-rail-pad {
          padding-left: 24px;
          padding-right: 24px;
        }
        @media (min-width: 640px) {
          .ib-asst-rail-pad {
            padding-left: 40px;
            padding-right: 40px;
          }
        }
        @media (min-width: 1024px) {
          .ib-asst-rail-pad {
            padding-left: 56px;
            padding-right: 56px;
          }
        }

        /* Standalone 1px 3-Column Framed Grid (Detached From Outer Rail) */
        .ib-asst-framed-grid-3 {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          border: 1px solid var(--border);
        }
        .ib-asst-framed-grid-3 > * {
          border-bottom: 1px solid var(--border);
        }
        .ib-asst-framed-grid-3 > :last-child {
          border-bottom: none;
        }
        @media (min-width: 768px) {
          .ib-asst-framed-grid-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .ib-asst-framed-grid-3 > * {
            border-bottom: none;
            border-right: 1px solid var(--border);
          }
          .ib-asst-framed-grid-3 > :last-child {
            border-right: none;
          }
        }

        /* Iceberg 8-Hairline Retracting Crop-Mark Buttons */
        .ib-asst-crop-btn {
          position: relative;
          display: inline-block;
          padding: 6px;
          text-decoration: none;
          cursor: pointer;
        }
        .ib-asst-crop-box {
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
        .ib-asst-tick {
          position: absolute;
          pointer-events: none;
          transition: transform 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-asst-tl-h { left: 0; top: 5px; width: 6px; height: 1px; }
        .ib-asst-tl-v { left: 5px; top: 0; width: 1px; height: 6px; }
        .ib-asst-tr-h { right: 0; top: 5px; width: 6px; height: 1px; }
        .ib-asst-tr-v { right: 5px; top: 0; width: 1px; height: 6px; }
        .ib-asst-bl-h { left: 0; bottom: 5px; width: 6px; height: 1px; }
        .ib-asst-bl-v { left: 5px; bottom: 0; width: 1px; height: 6px; }
        .ib-asst-br-h { right: 0; bottom: 5px; width: 6px; height: 1px; }
        .ib-asst-br-v { right: 5px; bottom: 0; width: 1px; height: 6px; }

        .ib-asst-crop-btn:hover .ib-asst-tl-h,
        .ib-asst-crop-btn:hover .ib-asst-bl-h { transform: translate3d(5px, 0, 0); }
        .ib-asst-crop-btn:hover .ib-asst-tr-h,
        .ib-asst-crop-btn:hover .ib-asst-br-h { transform: translate3d(-5px, 0, 0); }
        .ib-asst-crop-btn:hover .ib-asst-tl-v,
        .ib-asst-crop-btn:hover .ib-asst-tr-v { transform: translate3d(0, 5px, 0); }
        .ib-asst-crop-btn:hover .ib-asst-bl-v,
        .ib-asst-crop-btn:hover .ib-asst-br-v { transform: translate3d(0, -5px, 0); }

        .ib-asst-crop-primary-dark .ib-asst-crop-box {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-asst-crop-primary-dark .ib-asst-tick { background-color: #1d6bf3; }
        .ib-asst-crop-primary-dark:hover .ib-asst-crop-box {
          background-color: #ffffff;
          border-color: #ffffff;
          color: #0a0b0d !important;
        }
        .ib-asst-crop-primary-dark:hover .ib-asst-tick { background-color: #ffffff; }

        .ib-asst-crop-primary-light .ib-asst-crop-box {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-asst-crop-primary-light .ib-asst-tick { background-color: #1d6bf3; }
        .ib-asst-crop-primary-light:hover .ib-asst-crop-box {
          background-color: #0f172a;
          border-color: #0f172a;
          color: #ffffff !important;
        }
        .ib-asst-crop-primary-light:hover .ib-asst-tick { background-color: #0f172a; }

        .ib-asst-crop-sec-dark .ib-asst-crop-box {
          background-color: #0b0c0f;
          border-color: rgba(255, 255, 255, 0.18);
          color: #ffffff !important;
        }
        .ib-asst-crop-sec-dark .ib-asst-tick { background-color: #ffffff; }
        .ib-asst-crop-sec-dark:hover .ib-asst-crop-box {
          border-color: #ffffff;
        }

        .ib-asst-crop-sec-light .ib-asst-crop-box {
          background-color: #ffffff;
          border-color: rgba(15, 23, 42, 0.18);
          color: #111827 !important;
        }
        .ib-asst-crop-sec-light .ib-asst-tick { background-color: #111827; }
        .ib-asst-crop-sec-light:hover .ib-asst-crop-box {
          border-color: #0f172a;
        }

        /* Bottom Flush CTA Buttons */
        .ib-asst-cta-solid-dark {
          background-color: #ffffff;
          border: 1px solid #ffffff;
          color: #0a0b0d !important;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-asst-cta-solid-dark:hover {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-asst-cta-solid-light {
          background-color: #0f172a;
          border: 1px solid #0f172a;
          color: #ffffff !important;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-asst-cta-solid-light:hover {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-asst-plain-btn-dark {
          background-color: #0a0b0d;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff !important;
          transition: border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-asst-plain-btn-dark:hover { border-color: #ffffff; }
        .ib-asst-plain-btn-light {
          background-color: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.16);
          color: #111827 !important;
          transition: border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-asst-plain-btn-light:hover { border-color: #0f172a; }

        /* Live Gliding Pulse on No-Code Input Wire */
        .ib-asst-wire-pulse {
          position: absolute;
          top: 50%;
          left: 0;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background-color: var(--ib-cyan);
          box-shadow: 0 0 8px var(--ib-cyan);
          transform: translate(-50%, -50%);
          animation: ib-asst-wire-glide 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes ib-asst-wire-glide {
          0%   { left: 6%; opacity: 0.2; }
          50%  { left: 55%; opacity: 1; }
          100% { left: 94%; opacity: 0.2; }
        }

        /* Code Syntax Colors (Clean Iceberg Monochrome + Glacial Cyan / Amber) */
        .ib-syn-kw  { color: var(--ib-cyan); font-weight: 500; }
        .ib-syn-cls { color: var(--text-primary); font-weight: 600; }
        .ib-syn-fn  { color: #60a5fa; }
        .ib-syn-str { color: #f59e0b; }
        .ib-syn-num { color: var(--ib-cyan); font-weight: 600; }
        .ib-syn-cmt { color: var(--text-tertiary); }
        .ib-asst-light .ib-syn-fn  { color: #1d6bf3; }
        .ib-asst-light .ib-syn-str { color: #b45309; }
      `}</style>

      <Navbar dark={dark} setDark={setDark} />

      <main className="flex-1">
        {/* ================================================================== */}
        {/* SECTION 1: HERO (2-COLUMN + LIVE ARCHITECTURAL BLUEPRINT)          */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-asst-rail ib-asst-rail-pad py-12 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">
              <div className="lg:col-span-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 text-[var(--ib-cyan)]">
                  ICEBERG ASSISTANT
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-semibold tracking-[-0.025em] leading-[1.09] mb-5 text-[var(--text-primary)]">
                  Build production-grade chat and{' '}
                  <span className="text-[var(--ib-cyan)]">agent-based</span> applications in minutes
                </h1>

                <p className="text-[15.5px] leading-[1.6] max-w-[495px] mb-8 text-[var(--text-secondary)]">
                  Upload PDFs, Markdown, or text docs — Iceberg automatically chunks, embeds via
                  free 384d ONNX CPU inference, and serves grounded answers across API, Website
                  Widget, and WhatsApp in India (
                  <span className="text-[var(--text-primary)] font-medium">ap-south-1</span>).
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <AssistantCropButton
                    href={`${D}/signup${themeQuery}`}
                    variant="primary"
                    dark={dark}
                  >
                    Get started
                  </AssistantCropButton>

                  <AssistantCropButton href="#capabilities" variant="secondary" dark={dark}>
                    Learn more
                  </AssistantCropButton>
                </div>
              </div>

              <div className="lg:col-span-6 w-full">
                <IcebergAssistantBlueprint
                  dark={dark}
                  activeStage={activeStage}
                  setActiveStage={setActiveStage}
                  setPaused={setHeroPaused}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 2: 3-COLUMN CAPABILITIES ROW (INSET STANDALONE GRID)       */}
        {/* ================================================================== */}
        <section id="capabilities" className="border-b border-[var(--border)] scroll-mt-20">
          <div className="ib-asst-rail ib-asst-rail-pad py-12 sm:py-16">
            <div className="ib-asst-framed-grid-3 bg-[var(--background-light)]">
              {CORE_CAPABILITIES.map((item) => (
                <article
                  key={item.title}
                  onMouseMove={trackCardGlow}
                  className="group relative overflow-hidden p-7 sm:p-8 flex flex-col justify-between bg-[var(--background-light)]"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'var(--ib-spotlight)' }}
                  />
                  <div className="relative z-10">
                    <div className="w-10 h-10 border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[var(--text-primary)] group-hover:border-[var(--ib-cyan-border)] group-hover:text-[var(--ib-cyan)] transition-colors mb-6">
                      {item.icon}
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] mb-2.5">
                      {item.title}
                    </h2>
                    <p className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)]">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 3: BUILD WITH NO-CODE (N8N · WHATSAPP · WIDGET · MCP)      */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-asst-rail ib-asst-rail-pad py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">
              <div className="lg:col-span-5">
                <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--text-primary)] mb-4">
                  Build with <span className="text-[var(--ib-cyan)]">no-code</span>
                </h2>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] mb-8 max-w-md">
                  Add Iceberg Assistant to n8n workflows, embed a 1-line chat bubble on any website,
                  connect a WhatsApp Business webhook, or plug into Claude and Cursor via MCP.
                  Automatic chunking, 384d CPU embedding, and hybrid retrieval included.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <AssistantCropButton to="/integrations" variant="primary" dark={dark}>
                    Learn more
                  </AssistantCropButton>
                  <AssistantCropButton to="/docs" variant="secondary" dark={dark}>
                    Quickstart
                  </AssistantCropButton>
                </div>
              </div>

              <div className="lg:col-span-7 w-full">
                <NoCodeWorkflowShowcase dark={dark} />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 4: MULTI-DOMAIN ACCURACY BENCHMARK CHART (SEAMLESS LIVE)   */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-asst-rail ib-asst-rail-pad py-16 sm:py-24">
            <div>
              <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.16] text-[var(--text-primary)] mb-4">
                Most accurate results in multiple domains
              </h2>
              <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] max-w-2xl mb-8">
                Iceberg Assistant combines dense 384d semantic vectors with exact Okapi BM25
                lexical fusion at every step to deliver grounded, accurate answers — outperforming
                standard single-vector assistants across technical, financial, and legal workloads.
              </p>

              <Link
                to="/benchmarks"
                className={`inline-block px-5 py-2.5 text-[14.5px] leading-[1.4] font-normal no-underline ${
                  dark ? 'ib-asst-plain-btn-dark' : 'ib-asst-plain-btn-light'
                }`}
              >
                Learn more
              </Link>
            </div>

            <DomainAccuracyChart dark={dark} />
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 5: DEPLOY IN SECONDS (PYTHON SDK + WIDGET + WHATSAPP)      */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-asst-rail ib-asst-rail-pad py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">
              <div className="lg:col-span-5">
                <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--text-primary)] mb-2.5">
                  Deploy in seconds
                </h2>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] mb-8 max-w-sm">
                  Scale seamlessly in ap-south-1 — swap OpenAI, Claude, Gemini, Groq, DeepSeek, or
                  Iceberg Native AI anytime without re-indexing.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <AssistantCropButton
                    href={`${D}/signup${themeQuery}`}
                    variant="secondary"
                    dark={dark}
                  >
                    Get an API Key
                  </AssistantCropButton>
                  <AssistantCropButton to="/docs" variant="secondary" dark={dark}>
                    Quickstart Guide
                  </AssistantCropButton>
                </div>
              </div>

              {/* Standalone 1px Framed Code Window */}
              <div className="lg:col-span-7 w-full">
                <div className="border border-[var(--border)] bg-[var(--background-light)] overflow-hidden">
                  {/* Code Header Bar with Channel Tabs + Copy Button */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--background-sub)]">
                    <div className="flex items-center overflow-x-auto">
                      {DEPLOY_SNIPPETS.map((snip, idx) => {
                        const isSelected = idx === activeSnippetIdx
                        return (
                          <button
                            key={snip.id}
                            type="button"
                            onClick={() => {
                              setActiveSnippetIdx(idx)
                              setCopied(false)
                            }}
                            className={`px-4 py-3 font-mono text-xs border-r border-[var(--border)] whitespace-nowrap transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[var(--background-light)] text-[var(--text-primary)] font-semibold'
                                : 'bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                            }`}
                          >
                            {snip.filename}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 border-l border-[var(--border)] px-4 py-3 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
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
                  </div>

                  {/* Numbered Code Body */}
                  <div className="p-5 sm:p-6 bg-[var(--background)] overflow-x-auto font-mono text-[12.8px] leading-[1.7]">
                    {activeSnippet.lines.map((lineTokens, lineIdx) => (
                      <div key={lineIdx} className="flex">
                        <span className="w-7 select-none text-[var(--text-tertiary)] text-right pr-4 shrink-0 tabular-nums">
                          {lineIdx + 1}
                        </span>
                        <span className="whitespace-pre text-[var(--text-primary)]">
                          {lineTokens.length === 0
                            ? ' '
                            : lineTokens.map((tok, tIdx) => (
                                <span
                                  key={tIdx}
                                  className={tok.c ? `ib-syn-${tok.c}` : undefined}
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
        {/* SECTION 6: INSET FRAMED 3-COLUMN BOTTOM CTA                        */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-asst-rail ib-asst-rail-pad py-12 sm:py-16">
            <div className="border border-[var(--border)] bg-[var(--background-light)] grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 px-6 sm:px-8 py-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex items-center">
                <h2 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] leading-snug text-[var(--text-primary)]">
                  Start building
                  <br />
                  <span className="text-[var(--ib-cyan)]">knowledgeable AI</span> today
                </h2>
              </div>

              <div className="lg:col-span-5 px-6 sm:px-8 py-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex items-center">
                <p className="text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
                  Create your first Assistant for free with 100,000 vectors and ₹0 CPU embeddings
                  in India (ap-south-1), then pay as you go when you are ready to scale.
                </p>
              </div>

              <div className="lg:col-span-2 p-5 flex flex-col justify-center gap-2.5">
                <a
                  href={`${D}/signup${themeQuery}`}
                  className={`w-full py-2.5 px-4 text-center text-[13.5px] font-medium no-underline ${
                    dark ? 'ib-asst-cta-solid-dark' : 'ib-asst-cta-solid-light'
                  }`}
                >
                  Start Building
                </a>
                <Link
                  to="/contact"
                  className={`w-full py-2.5 px-4 text-center text-[13.5px] font-medium no-underline ${
                    dark ? 'ib-asst-plain-btn-dark' : 'ib-asst-plain-btn-light'
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
