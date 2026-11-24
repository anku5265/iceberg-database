import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSessionTheme } from '../components/Navbar'
import IcebergLogo from '../components/IcebergLogo'
import IntegrationLogo from '../components/IntegrationLogos'
import { ALL_INTEGRATIONS, INTEGRATION_CATEGORIES, SLUG_ALIASES } from '../data/integrationsInfraModelsObs'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'
const GH_ISSUES = 'https://github.com/anku5265/iceberg-database/issues/new'

// Rich inline parser supporting:
// - [`code`](url) linked code pills
// - [label](/internal) & [label](https://external) underlined links
// - `inline code` dark pills
// - **bold** spans
const INLINE_TOKEN_RE = /(\[`[^`]+`\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g

function renderRichInline(text, dark = true, calloutVariant = null) {
  if (!text) return null
  const parts = String(text).split(INLINE_TOKEN_RE)
  const inCallout = !!calloutVariant
  const linkCls = inCallout
    ? calloutVariant === 'warning'
      ? 'text-amber-100 underline decoration-amber-300/80 underline-offset-4 hover:text-white'
      : 'text-[#e2e8f0] underline decoration-[#94a3b8] underline-offset-4 hover:text-white'
    : dark
    ? 'text-[#60a5fa] underline decoration-[#3b82f6] underline-offset-4 hover:text-[#93c5fd]'
    : 'text-blue-600 underline decoration-blue-500 underline-offset-4 hover:text-blue-800'

  const codePillCls = dark
    ? 'px-1.5 py-[1px] rounded-[5px] bg-[#262626] border border-[#343434] text-[#ececec] font-mono text-[13px]'
    : 'px-1.5 py-[1px] rounded-[5px] bg-slate-100 text-slate-800 font-mono text-[13px] border border-slate-200'

  return parts.map((part, idx) => {
    if (!part) return null

    // Linked inline code pill: [`envFile`](https://...)
    const linkedCode = part.match(/^\[`([^`]+)`\]\(([^)]+)\)$/)
    if (linkedCode) {
      const [, label, href] = linkedCode
      const cls = `${codePillCls} underline ${
        calloutVariant === 'warning' ? 'decoration-amber-300' : 'decoration-[#3b82f6]'
      } underline-offset-4`
      if (href.startsWith('#')) {
        return (
          <a
            key={idx}
            href={href}
            onClick={e => {
              e.preventDefault()
              document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={cls}
          >
            {label}
          </a>
        )
      }
      if (href.startsWith('/')) {
        return (
          <Link key={idx} to={href} className={cls}>
            {label}
          </Link>
        )
      }
      return (
        <a key={idx} href={href} target="_blank" rel="noreferrer" className={cls}>
          {label}
        </a>
      )
    }

    // Standard markdown link: [label](href) (supports inline `code` pills inside label)
    const stdLink = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (stdLink) {
      const [, label, href] = stdLink
      const renderedLabel = label.split(/(`[^`]+`)/g).map((seg, sIdx) =>
        seg.startsWith('`') && seg.endsWith('`') ? (
          <code key={sIdx} className={codePillCls}>
            {seg.slice(1, -1)}
          </code>
        ) : (
          seg
        )
      )
      if (href.startsWith('#')) {
        return (
          <a
            key={idx}
            href={href}
            onClick={e => {
              e.preventDefault()
              if (href === '#partner-application-form') {
                window.dispatchEvent(new Event('open-partner-application-modal'))
                return
              }
              document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={linkCls}
          >
            {renderedLabel}
          </a>
        )
      }
      if (href.startsWith('/')) {
        if (/\.(ipynb|json|pdf|zip)$/i.test(href)) {
          return (
            <a key={idx} href={href} download className={linkCls}>
              {renderedLabel}
            </a>
          )
        }
        return (
          <Link key={idx} to={href} className={linkCls}>
            {renderedLabel}
          </Link>
        )
      }
      return (
        <a key={idx} href={href} target="_blank" rel="noreferrer" className={linkCls}>
          {renderedLabel}
        </a>
      )
    }

    // Inline code pill: `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className={codePillCls}>
          {part.slice(1, -1)}
        </code>
      )
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className={dark ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>
          {part.slice(2, -2)}
        </strong>
      )
    }

    return part
  })
}

// Convert any integration page (or overview) into clean LLM-ready Markdown
function buildMarkdownForPage(activeItem) {
  if (!activeItem) {
    const lines = [
      '# Iceberg DB -- Integrations Overview (v1.0.0)',
      '',
      'Browse Iceberg integrations across vector embedding providers, data ingestion tools, frameworks, and infrastructure to ship AI apps faster.',
      '',
    ]
    for (const cat of INTEGRATION_CATEGORIES.filter(c => c.section === 'connect')) {
      lines.push(`## ${cat.label}`)
      lines.push('')
      const items = ALL_INTEGRATIONS.filter(x => x.category === cat.id && !x.hideFromOverviewGrid)
      for (const it of items) {
        lines.push(`- **${it.cardTitle || it.name}** (\`/integrations/${it.slug}\`): ${it.shortDesc}`)
      }
      lines.push('')
    }
    return lines.join('\n')
  }

  const lines = [
    `# ${activeItem.pageTitle || activeItem.name} -- Iceberg DB Integration`,
    '',
    activeItem.summary,
    '',
  ]
  for (const p of activeItem.intro || []) {
    lines.push(p)
    lines.push('')
  }
  for (const b of activeItem.topBullets || []) {
    lines.push(`- ${b}`)
  }
  if (activeItem.topBullets?.length) lines.push('')
  for (const p of activeItem.introAfterBullets || []) {
    lines.push(p)
    lines.push('')
  }

  const serializeBlocks = (blocks = []) => {
    for (const blk of blocks) {
      if (blk.type === 'p') {
        lines.push(blk.text)
        lines.push('')
      } else if (blk.type === 'h3') {
        lines.push(`### ${blk.title}`)
        lines.push('')
      } else if (blk.type === 'h4') {
        lines.push(`#### ${blk.title}`)
        lines.push('')
      } else if (blk.type === 'bullets') {
        for (const it of blk.items || []) {
          if (typeof it === 'string') {
            lines.push(`- ${it}`)
          } else {
            lines.push(`- ${it.text}`)
            for (const sub of it.subItems || []) lines.push(`  - ${sub}`)
          }
        }
        lines.push('')
      } else if (blk.type === 'codeTabs') {
        for (const tab of blk.tabs || []) {
          lines.push(`**${tab.label}:**`)
          lines.push(`\`\`\`${tab.lang || 'javascript'}`)
          lines.push(tab.code)
          lines.push('```')
          lines.push('')
        }
      } else if (blk.type === 'orderedList') {
        ;(blk.items || []).forEach((it, idx) => {
          if (typeof it === 'string') {
            lines.push(`${idx + 1}. ${it}`)
          } else {
            lines.push(`${idx + 1}. ${it.text}`)
            if (it.code) {
              lines.push(`\`\`\`${it.code.lang || 'python'}`)
              lines.push(it.code.code)
              lines.push('```')
            }
            if (it.response) {
              lines.push('```text')
              lines.push(it.response)
              lines.push('```')
            }
          }
        })
        lines.push('')
      } else if (blk.type === 'code') {
        lines.push(`\`\`\`${blk.lang || 'bash'}`)
        lines.push(blk.code)
        lines.push('```')
        lines.push('')
      } else if (blk.type === 'response') {
        lines.push('**Response:**')
        lines.push('```text')
        lines.push(blk.code)
        lines.push('```')
        lines.push('')
      } else if (blk.type === 'callout') {
        lines.push(`> **${(blk.variant || 'info').toUpperCase()}:** ${blk.text}`)
        for (const b of blk.bullets || []) lines.push(`> - ${b}`)
        lines.push('')
      } else if (blk.type === 'table') {
        lines.push(`| ${blk.headers.join(' | ')} |`)
        lines.push(`| ${blk.headers.map(() => '---').join(' | ')} |`)
        for (const r of blk.rows) lines.push(`| ${r.join(' | ')} |`)
        lines.push('')
      } else if (blk.type === 'tabs') {
        for (const tab of blk.tabs || []) {
          lines.push(`#### ${tab.label}`)
          serializeBlocks(tab.blocks)
        }
      } else if (blk.type === 'steps') {
        ;(blk.items || []).forEach((st, idx) => {
          lines.push(`### ${idx + 1}. ${st.title}`)
          lines.push('')
          serializeBlocks(st.blocks)
        })
      }
    }
  }

  for (const sec of activeItem.sections || []) {
    if (sec.title) {
      lines.push(`## ${sec.title}`)
      lines.push('')
    }
    serializeBlocks(sec.blocks)
  }

  return lines.join('\n')
}

// Syntax highlighting matching dark technical docs palette across Python, JS/TS, Java, Go, Rust, C#/.NET, HCL, and Bash
const DOC_TOKEN_RE = /(\/\*[\s\S]*?\*\/|#.*$|\/\/.*$|--.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(<\/?[a-zA-Z][a-zA-Z0-9-]*)|(\b(?:from|import|export|default|async|await|for|foreach|in|if|else|with|as|return|try|except|catch|yield|package|public|private|static|void|func|type|struct|use|pub|fn|mut|impl|match|using|namespace|resource|variable|data|module|provider|output)\b)|((?:^|\s)-[a-zA-Z0-9-]+|\b(?:def|class|const|let|var|function|new|string|int|double|bool|Some|Ok|Err|True|False|None|true|false|null|undefined|\d+(?:\.\d+)?)\b)/gm

function renderHighlightedCode(code, dark) {
  const lines = String(code || '').split('\n')
  return lines.map((line, lineIdx) => {
    if (!line) return <div key={lineIdx} className="min-h-[1.45rem]">&nbsp;</div>
    const trimmed = line.trim()
    if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('-- ')) {
      return (
        <div key={lineIdx} className={dark ? 'text-[#6a8f6a]' : 'text-slate-400'}>
          {line}
        </div>
      )
    }
    const nodes = []
    let last = 0
    const re = new RegExp(DOC_TOKEN_RE.source, 'gm')
    let m
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) {
        nodes.push(
          <span key={`p-${last}`} className={dark ? 'text-[#e4e4e7]' : 'text-slate-800'}>
            {line.slice(last, m.index)}
          </span>
        )
      }
      const [full, comment, str, htmlTag, kwPurple, kwBlue] = m
      if (comment) {
        nodes.push(<span key={`m-${m.index}`} className={dark ? 'text-[#6a8f6a]' : 'text-slate-400'}>{full}</span>)
      } else if (str) {
        nodes.push(<span key={`m-${m.index}`} className={dark ? 'text-[#fca5a5]' : 'text-rose-700'}>{full}</span>)
      } else if (htmlTag) {
        nodes.push(<span key={`m-${m.index}`} className={dark ? 'text-[#7dd3fc]' : 'text-sky-700'}>{full}</span>)
      } else if (kwPurple) {
        nodes.push(<span key={`m-${m.index}`} className={dark ? 'text-[#c084fc]' : 'text-purple-700'}>{full}</span>)
      } else if (kwBlue) {
        nodes.push(<span key={`m-${m.index}`} className={dark ? 'text-[#7dd3fc]' : 'text-sky-700'}>{full}</span>)
      } else {
        nodes.push(<span key={`m-${m.index}`} className={dark ? 'text-[#e4e4e7]' : 'text-slate-800'}>{full}</span>)
      }
      last = re.lastIndex
    }
    if (last < line.length) {
      nodes.push(
        <span key="end" className={dark ? 'text-[#e4e4e7]' : 'text-slate-800'}>
          {line.slice(last)}
        </span>
      )
    }
    return <div key={lineIdx}>{nodes}</div>
  })
}

// Shared right-side action buttons (`(!)` Report Issue + `[Copy]` Two-Squares) on ALL code & Response blocks
function CodeActionButtons({ code, dark }) {
  const [copied, setCopied] = useState(false)
  const iconCls = dark
    ? 'text-[#71717a] hover:text-[#e4e4e7] transition cursor-pointer p-1 rounded hover:bg-white/[0.06]'
    : 'text-slate-400 hover:text-slate-800 transition cursor-pointer p-1 rounded hover:bg-slate-200/70'

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0">
      <a
        href={GH_ISSUES}
        target="_blank"
        rel="noreferrer"
        title="Report an issue with this code"
        aria-label="Report code issue"
        className={iconCls}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 8v4.5M12 16h.01" />
        </svg>
      </a>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(code || '')
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        }}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
        aria-label="Copy code"
        className={iconCls}
      >
        {copied ? (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}

// Renders Variant A (Headerless command/prompt box), Variant B (Titled code block), and Variant C (Response block)
function DocCodeCard({ label, code, noHeader = false, plainOutput = false, dark = true }) {
  if (noHeader) {
    return (
      <div
        className={`relative rounded-[12px] border px-4 py-3.5 my-3.5 flex items-start justify-between gap-3 ${
          dark ? 'border-[#2e2e2e] bg-[#0a0a0c]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="overflow-x-auto font-mono text-[13px] leading-[1.65] whitespace-pre flex-1 min-w-0 pr-2">
          {renderHighlightedCode(code, dark)}
        </div>
        <CodeActionButtons code={code} dark={dark} />
      </div>
    )
  }

  return (
    <div
      className={`rounded-[12px] border overflow-hidden my-4 ${
        dark ? 'border-[#2e2e2e] bg-[#0a0a0c]' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div
        className={`flex items-center justify-between gap-2 px-4 py-2 border-b ${
          dark ? 'border-[#2e2e2e] bg-[#222222]' : 'border-slate-200 bg-slate-100'
        }`}
      >
        <span className={`text-[12.5px] font-medium ${dark ? 'text-[#d4d4d8]' : 'text-slate-600'}`}>
          {label || 'Python'}
        </span>
        <CodeActionButtons code={code} dark={dark} />
      </div>
      <div className="px-5 py-4 overflow-x-auto font-mono text-[13px] leading-[1.65] whitespace-pre">
        {plainOutput ? (
          <span className={dark ? 'text-[#e4e4e7]' : 'text-slate-800'}>{code}</span>
        ) : (
          renderHighlightedCode(code, dark)
        )}
      </div>
    </div>
  )
}

// Variant D: Tabbed Header Code Card (`Python | JavaScript | Java | Go | Rust | .NET | curl` & `JavaScript library | JavaScript script`)
function DocCodeTabsCard({ tabs = [], dark = true }) {
  const [activeIdx, setActiveIdx] = useState(0)
  if (!tabs.length) return null
  const activeTab = tabs[Math.min(activeIdx, tabs.length - 1)] || tabs[0]

  return (
    <div
      className={`rounded-[12px] border overflow-hidden my-4 ${
        dark ? 'border-[#2e2e2e] bg-[#0a0a0c]' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 px-4 border-b ${
          dark ? 'border-[#2e2e2e] bg-[#222222]' : 'border-slate-200 bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-5 flex-wrap">
          {tabs.map((t, idx) => {
            const isActive = idx === activeIdx
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`py-2.5 text-[12.5px] font-medium whitespace-nowrap border-b-2 -mb-px transition cursor-pointer ${
                  isActive
                    ? 'border-[#3b82f6] text-[#60a5fa]'
                    : dark
                    ? 'border-transparent text-[#a3a3a3] hover:text-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
        <CodeActionButtons code={activeTab.code} dark={dark} />
      </div>
      <div className="px-5 py-4 overflow-x-auto font-mono text-[13px] leading-[1.65] whitespace-pre">
        {renderHighlightedCode(activeTab.code, dark)}
      </div>
    </div>
  )
}

// Semantic Callout Box (`tip` green lightbulb, `info` blue circle-i, `warning` amber triangle)
function DocCallout({ variant = 'info', text, bullets, dark = true }) {
  const styles =
    variant === 'tip'
      ? dark
        ? 'bg-[#14532d]/35 border-[#22c55e]/30 text-[#ecfdf5]'
        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
      : variant === 'warning'
      ? dark
        ? 'bg-[#451a03]/45 border-[#d97706]/35 text-[#fef3c7]'
        : 'bg-amber-50 border-amber-300 text-amber-950'
      : dark
      ? 'bg-[#162444] border-[#2c3b63] text-[#dbeafe]'
      : 'bg-blue-50 border-blue-200 text-slate-900'

  return (
    <div className={`rounded-[12px] border px-4 py-3.5 my-5 flex items-start gap-3 ${styles}`}>
      <div className="shrink-0 mt-0.5">
        {variant === 'tip' ? (
          <svg width="17" height="17" fill="none" stroke="#4ade80" strokeWidth="1.9" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6m-5 3h4M12 2a7 7 0 00-4 12.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26A7 7 0 0012 2z" />
          </svg>
        ) : variant === 'warning' ? (
          <svg width="17" height="17" fill="none" stroke="#fbbf24" strokeWidth="1.9" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        ) : (
          <svg width="17" height="17" fill="none" stroke="#93c5fd" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 8v4.5M12 16h.01" />
          </svg>
        )}
      </div>
      <div className="text-[13.5px] leading-[1.6] flex-1 min-w-0">
        <div>{renderRichInline(text, dark, variant)}</div>
        {bullets?.length > 0 && (
          <ul className="list-disc pl-5 mt-2.5 space-y-1.5">
            {bullets.map((b, i) => (
              <li key={i}>{renderRichInline(b, dark, variant)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Strictly Borderless Horizontal-Rule Table (exact measured ~38px row height)
function BorderlessTable({ headers = [], rows = [], dark = true }) {
  return (
    <div className="overflow-x-auto my-5">
      <table className="w-full text-left border-collapse text-[14px]">
        <thead>
          <tr className={dark ? 'border-b border-[#292929]' : 'border-b border-slate-200'}>
            {headers.map((h, i) => (
              <th
                key={i}
                className={`py-2.5 pr-6 font-semibold text-[13px] ${
                  dark ? 'text-[#e5e5e5]' : 'text-slate-900'
                }`}
              >
                {renderRichInline(h, dark)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={dark ? 'border-b border-[#222222]' : 'border-b border-slate-100'}
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`py-2 pr-6 align-top leading-[1.55] ${
                    dark ? 'text-[#d4d4d8]' : 'text-slate-700'
                  }`}
                >
                  {renderRichInline(cell, dark)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Clean Architectural Workflow SVG Diagrams (for Cohere & Amazon Bedrock)
function ArchitectureDiagram({ variant }) {
  if (variant === 'cohere') {
    return (
      <div className="my-6 rounded-xl bg-white border border-slate-200 p-6 overflow-x-auto">
        <svg viewBox="0 0 720 190" className="w-full min-w-[560px] h-auto">
          <rect x="16" y="24" width="140" height="52" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="86" y="47" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700" fontFamily="sans-serif">Document Corpus</text>
          <text x="86" y="64" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">TREC / Enterprise Text</text>

          <rect x="16" y="114" width="140" height="52" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="86" y="137" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700" fontFamily="sans-serif">User Application</text>
          <text x="86" y="154" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">Search Query</text>

          <path d="M156 50 H248" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr)" />
          <text x="202" y="43" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="sans-serif">Embed docs</text>

          <path d="M156 140 H248" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr)" />
          <text x="202" y="133" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="sans-serif">Embed query</text>

          <rect x="252" y="55" width="175" height="80" rx="10" fill="#eef2ff" stroke="#6366f1" strokeWidth="1.8" />
          <text x="339" y="88" textAnchor="middle" fill="#312e81" fontSize="12.5" fontWeight="700" fontFamily="sans-serif">Cohere Embed v3 API</text>
          <text x="339" y="107" textAnchor="middle" fill="#4338ca" fontSize="10.5" fontFamily="monospace">1024-dim float32</text>

          <path d="M427 80 H518" stroke="#2563eb" strokeWidth="1.8" markerEnd="url(#arrBlue)" />
          <text x="472" y="72" textAnchor="middle" fill="#1d4ed8" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">/vectors/upsert</text>

          <path d="M427 112 H518" stroke="#2563eb" strokeWidth="1.8" markerEnd="url(#arrBlue)" />
          <text x="472" y="105" textAnchor="middle" fill="#1d4ed8" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">/vectors/query</text>

          <rect x="522" y="45" width="182" height="100" rx="10" fill="#eff6ff" stroke="#1d6bf3" strokeWidth="2" />
          <text x="613" y="82" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700" fontFamily="sans-serif">Iceberg Vector DB</text>
          <text x="613" y="101" textAnchor="middle" fill="#1d4ed8" fontSize="10.5" fontFamily="monospace">HNSW Cosine (1024d)</text>
          <text x="613" y="119" textAnchor="middle" fill="#475569" fontSize="10" fontFamily="sans-serif">ap-south-1 • Sub-2ms</text>

          <path d="M613 145 V174 H86 V166" stroke="#0f172a" strokeWidth="1.4" strokeDasharray="4 3" fill="none" />
          <text x="355" y="185" textAnchor="middle" fill="#334155" fontSize="9.5" fontFamily="sans-serif">Top-K Semantic Matches + Scores</text>

          <defs>
            <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill="#64748b" />
            </marker>
            <marker id="arrBlue" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill="#2563eb" />
            </marker>
          </defs>
        </svg>
      </div>
    )
  }

  return (
    <div className="my-6 rounded-xl bg-white border border-slate-200 p-6 overflow-x-auto">
      <svg viewBox="0 0 720 205" className="w-full min-w-[560px] h-auto">
        <rect x="20" y="26" width="160" height="58" rx="8" fill="#f8fafc" stroke="#2563eb" strokeWidth="1.6" />
        <text x="100" y="52" textAnchor="middle" fill="#0f172a" fontSize="12.5" fontWeight="700" fontFamily="sans-serif">Amazon S3</text>
        <text x="100" y="69" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">Enterprise Docs (ap-south-1)</text>

        <path d="M180 55 H268" stroke="#2563eb" strokeWidth="1.8" markerEnd="url(#bArr)" />
        <text x="224" y="47" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="sans-serif">text chunks</text>

        <rect x="272" y="22" width="176" height="66" rx="9" fill="#eff6ff" stroke="#1d6bf3" strokeWidth="2" />
        <text x="360" y="51" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700" fontFamily="sans-serif">Amazon Bedrock</text>
        <text x="360" y="69" textAnchor="middle" fill="#1d4ed8" fontSize="10.5" fontFamily="monospace">Titan v2 + Claude</text>

        <path d="M540 55 H452" stroke="#2563eb" strokeWidth="1.8" markerEnd="url(#bArr)" />
        <text x="496" y="47" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="sans-serif">user query</text>

        <rect x="542" y="26" width="158" height="58" rx="8" fill="#f8fafc" stroke="#2563eb" strokeWidth="1.6" />
        <text x="621" y="51" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700" fontFamily="sans-serif">Bedrock Agents</text>
        <text x="621" y="68" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">Action Orchestration</text>

        <path d="M342 88 V126" stroke="#2563eb" strokeWidth="1.8" markerEnd="url(#bArr)" />
        <text x="278" y="111" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="sans-serif">1024d embeddings</text>

        <path d="M378 126 V88" stroke="#2563eb" strokeWidth="1.8" markerEnd="url(#bArr)" />
        <text x="438" y="111" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="sans-serif">grounded retrieval</text>

        <rect x="255" y="130" width="210" height="58" rx="9" fill="#0f172a" stroke="#1d6bf3" strokeWidth="2" />
        <text x="360" y="156" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="700" fontFamily="sans-serif">Iceberg Vector Database</text>
        <text x="360" y="173" textAnchor="middle" fill="#93c5fd" fontSize="10" fontFamily="monospace">ap-south-1 • DPDP Resident</text>

        <defs>
          <marker id="bArr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#2563eb" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}

// 2x3 Tool Cards Grid with #3b82f6 Blue Outline Icons (for AI coding tools -> Overview)
function ToolCardsGrid({ items = [], dark = true }) {
  const renderIcon = icon => {
    switch (icon) {
      case 'layers':
        return (
          <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 18l10 5 10-5" />
          </svg>
        )
      case 'server':
        return (
          <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="6" rx="1.5" />
            <rect x="3" y="14" width="18" height="6" rx="1.5" />
            <circle cx="7" cy="7" r="1" fill="#3b82f6" />
            <circle cx="7" cy="17" r="1" fill="#3b82f6" />
          </svg>
        )
      case 'terminal':
        return (
          <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
          </svg>
        )
      default:
        return (
          <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4m6-4v4M7 7h10v4a5 5 0 01-5 5v5m-5-9h10" />
          </svg>
        )
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
      {items.map(card => {
        const cls = `rounded-xl border p-5 flex flex-col justify-start no-underline transition-colors ${
          dark
            ? 'bg-[#161618] border-[#27272a] hover:border-[#3b82f6]'
            : 'bg-white border-slate-200 hover:border-blue-600'
        }`
        const inner = (
          <>
            <div className="mb-3">{renderIcon(card.icon)}</div>
            <h3 className={`text-[16px] font-bold mb-1.5 ${dark ? 'text-white' : 'text-slate-900'}`}>
              {card.title}
            </h3>
            <p className={`text-[13.5px] leading-[1.58] ${dark ? 'text-[#a1a1aa]' : 'text-slate-600'}`}>
              {renderRichInline(card.desc, dark)}
            </p>
          </>
        )
        return card.to ? (
          <Link key={card.title} to={card.to} className={cls}>
            {inner}
          </Link>
        ) : (
          <a key={card.title} href={card.href} target="_blank" rel="noreferrer" className={cls}>
            {inner}
          </a>
        )
      })}
    </div>
  )
}

// Horizontal Underline Tabs (for Codex OS tabs, Databricks tabs, Attribute usage tabs)
function DocUnderlineTabs({ tabs = [], dark = true }) {
  const [activeIdx, setActiveIdx] = useState(0)
  if (!tabs.length) return null
  const current = tabs[Math.min(activeIdx, tabs.length - 1)] || tabs[0]

  return (
    <div className="my-4">
      <div className={`flex items-center gap-5 overflow-x-auto border-b ${dark ? 'border-[#27272a]' : 'border-slate-200'}`}>
        {tabs.map((tab, i) => {
          const active = i === activeIdx
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`pb-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                active
                  ? 'border-[#3b82f6] text-[#3b82f6]'
                  : dark
                  ? 'border-transparent text-[#d4d4d8] hover:text-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="pt-4">
        <BlockList blocks={current.blocks || []} dark={dark} />
      </div>
    </div>
  )
}

// Unified Bordered Accordion Group (`▶` solid right triangle on Troubleshooting)
function UnifiedAccordion({ items = [], dark = true }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <div
      className={`rounded-xl border divide-y my-5 overflow-hidden ${
        dark ? 'border-[#27272a] bg-[#111113] divide-[#27272a]' : 'border-slate-200 bg-white divide-slate-200'
      }`}
    >
      {items.map((item, idx) => {
        const isOpen = openIdx === idx
        return (
          <div key={idx}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left text-[14px] font-semibold transition cursor-pointer ${
                dark ? 'text-white hover:bg-white/[0.02]' : 'text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 10 10"
                fill="currentColor"
                className={`shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''} ${
                  dark ? 'text-[#a1a1aa]' : 'text-slate-500'
                }`}
              >
                <polygon points="2,1 9,5 2,9" />
              </svg>
              <span>{item.q}</span>
            </button>
            {isOpen && (
              <div className={`px-8 pb-4 text-[13.5px] leading-[1.65] ${dark ? 'text-[#b4b4bc]' : 'text-slate-600'}`}>
                {renderRichInline(item.a, dark)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Vertical Numbered Stepper (`1`, `2`, `3`... with hover blue chain-link anchor icon!)
function VerticalSteps({ items = [], dark = true }) {
  return (
    <div className="mt-6">
      {items.map((step, idx) => {
        const isLast = idx === items.length - 1
        return (
          <div key={step.id} id={step.id} className="relative pl-9 pb-7 scroll-mt-32">
            {!isLast && (
              <div
                className={`absolute left-[11.5px] top-7 bottom-0 w-px ${
                  dark ? 'bg-[#2a2a2a]' : 'bg-slate-200'
                }`}
              />
            )}

            <a
              href={`#${step.id}`}
              aria-label={`Link to step ${idx + 1}`}
              className={`group/badge absolute left-0 top-0 w-6 h-6 rounded-full text-[11.5px] font-semibold flex items-center justify-center no-underline transition ${
                dark
                  ? 'bg-[#262626] text-[#d4d4d8] hover:bg-[#3b82f6]/20'
                  : 'bg-slate-200 text-slate-800 hover:bg-blue-100'
              }`}
            >
              <span className="group-hover/badge:hidden">{idx + 1}</span>
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.1"
                viewBox="0 0 24 24"
                className="hidden group-hover/badge:block"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.758-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </a>

            <h3 className={`text-[15.5px] font-semibold leading-snug mb-2.5 ${dark ? 'text-white' : 'text-slate-900'}`}>
              {step.title}
            </h3>

            <BlockList blocks={step.blocks || []} dark={dark} />
          </div>
        )
      })}
    </div>
  )
}

// Recursive Content Block Renderer
function BlockList({ blocks = [], dark = true }) {
  const bodyCls = dark ? 'text-[#d7d7d7]' : 'text-slate-700'

  return blocks.map((blk, i) => {
    switch (blk.type) {
      case 'p':
        return (
          <p key={i} className={`text-[15px] leading-[1.68] mb-3.5 ${bodyCls}`}>
            {renderRichInline(blk.text, dark)}
          </p>
        )
      case 'h3':
        return (
          <h3
            key={blk.id || i}
            id={blk.id}
            className={`text-[18px] font-bold tracking-tight mt-8 mb-3 scroll-mt-32 ${
              dark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {blk.title}
          </h3>
        )
      case 'h4':
        return (
          <h4
            key={blk.id || i}
            id={blk.id}
            className={`text-[16px] font-bold mt-6 mb-2.5 scroll-mt-32 ${
              dark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {blk.title}
          </h4>
        )
      case 'bullets':
        return (
          <ul key={i} className={`list-disc pl-5 space-y-2.5 text-[14.5px] leading-[1.65] my-3.5 ${bodyCls}`}>
            {(blk.items || []).map((it, j) => {
              if (typeof it === 'string') {
                return <li key={j}>{renderRichInline(it, dark)}</li>
              }
              return (
                <li key={j}>
                  <div>{renderRichInline(it.text, dark)}</div>
                  {it.subItems?.length > 0 && (
                    <ul className="list-[circle] pl-5 mt-2 space-y-2">
                      {it.subItems.map((sub, k) => (
                        <li key={k}>{renderRichInline(sub, dark)}</li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )
      case 'nestedBullets':
        return (
          <ul key={i} className={`list-disc pl-5 space-y-3 text-[14.5px] leading-[1.65] my-4 ${bodyCls}`}>
            {(blk.items || []).map((group, j) => (
              <li key={j}>
                <span className={dark ? 'text-white font-medium' : 'text-slate-900 font-medium'}>
                  {group.label}
                </span>
                <ul className="list-[circle] pl-5 mt-1.5 space-y-1.5">
                  {(group.children || []).map((ch, k) => (
                    <li key={k}>{renderRichInline(ch, dark)}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )
      case 'orderedList':
        return (
          <ol key={i} className={`list-decimal pl-5 space-y-3.5 text-[14.5px] leading-[1.68] my-4 ${bodyCls}`}>
            {(blk.items || []).map((it, j) => {
              if (typeof it === 'string') {
                return <li key={j}>{renderRichInline(it, dark)}</li>
              }
              return (
                <li key={j}>
                  <div>{renderRichInline(it.text, dark)}</div>
                  {it.code && (
                    <DocCodeCard
                      label={it.code.label || it.code.lang || 'Python'}
                      code={it.code.code}
                      noHeader={!!it.code.noHeader}
                      dark={dark}
                    />
                  )}
                  {it.response && (
                    <DocCodeCard label="Response" code={it.response} plainOutput dark={dark} />
                  )}
                </li>
              )
            })}
          </ol>
        )
      case 'code':
        return (
          <DocCodeCard
            key={i}
            label={blk.label || blk.lang || 'Python'}
            code={blk.code}
            noHeader={!!blk.noHeader}
            dark={dark}
          />
        )
      case 'codeTabs':
        return <DocCodeTabsCard key={i} tabs={blk.tabs} dark={dark} />
      case 'response':
        return <DocCodeCard key={i} label="Response" code={blk.code} plainOutput dark={dark} />
      case 'callout':
        return (
          <DocCallout
            key={i}
            variant={blk.variant || 'info'}
            text={blk.text}
            bullets={blk.bullets}
            dark={dark}
          />
        )
      case 'table':
        return <BorderlessTable key={i} headers={blk.headers} rows={blk.rows} dark={dark} />
      case 'toolCards':
        return <ToolCardsGrid key={i} items={blk.items} dark={dark} />
      case 'tabs':
        return <DocUnderlineTabs key={i} tabs={blk.tabs} dark={dark} />
      case 'steps':
        return <VerticalSteps key={i} items={blk.items} dark={dark} />
      case 'accordion':
        return <UnifiedAccordion key={i} items={blk.items} dark={dark} />
      case 'diagram':
        return <ArchitectureDiagram key={i} variant={blk.variant} />
      case 'inlineCta':
        return (
          <div key={i} className="my-5">
            <Link
              to={blk.to}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold bg-[#1d6bf3] hover:bg-[#2563eb] text-white no-underline transition"
            >
              <span>{blk.label}</span>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        )
      default:
        return null
    }
  })
}

// 4-Option `[ Copy page | v ]` Split Dropdown Menu (Copy page, View as Markdown, Open in ChatGPT, Open in Claude)
function CopyPageDropdown({ activeItem, dark }) {
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onDocClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const markdown = useMemo(() => buildMarkdownForPage(activeItem), [activeItem])

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setMenuOpen(false)
    setTimeout(() => setCopied(false), 2000)
  }

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://icebergdb.in/integrations'
  const aiPrompt = encodeURIComponent(
    `Read this Iceberg DB documentation page (${pageUrl}) and help me implement it:\n\n${markdown.slice(0, 1800)}`
  )

  const borderCls = dark ? 'border-[#27272a] bg-[#141416] text-[#e4e4e7]' : 'border-slate-200 bg-white text-slate-700'
  const iconBoxCls = dark
    ? 'w-7 h-7 rounded-md border border-[#27272a] bg-[#1c1c20] flex items-center justify-center shrink-0 text-[#d4d4d8]'
    : 'w-7 h-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-600'

  return (
    <>
      <div ref={menuRef} className="relative inline-flex items-center shrink-0">
        <div className={`inline-flex items-center rounded-lg border divide-x ${borderCls} ${dark ? 'divide-[#27272a]' : 'divide-slate-200'}`}>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-[12.5px] font-medium transition cursor-pointer rounded-l-lg ${
              dark ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-50'
            }`}
          >
            {copied ? (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy page</span>
              </>
            )}
          </button>
          <button
            type="button"
            aria-label="Copy page options"
            onClick={() => setMenuOpen(v => !v)}
            className={`px-2 py-1.5 transition cursor-pointer rounded-r-lg ${
              dark ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-50'
            }`}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div
            className={`absolute right-0 top-[calc(100%+6px)] z-40 w-72 rounded-xl border p-1.5 shadow-2xl ${
              dark ? 'border-[#27272a] bg-[#161618] text-[#e4e4e7]' : 'border-slate-200 bg-white text-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className={`w-full flex items-center gap-3 text-left px-2.5 py-2 rounded-lg transition cursor-pointer ${
                dark ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
              }`}
            >
              <span className={iconBoxCls}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </span>
              <div>
                <div className="text-[13px] font-semibold">Copy page</div>
                <div className={`text-[11.5px] ${dark ? 'text-[#8e8e98]' : 'text-slate-500'}`}>Copy page as Markdown for LLMs</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                setPreviewOpen(true)
              }}
              className={`w-full flex items-center gap-3 text-left px-2.5 py-2 rounded-lg transition cursor-pointer ${
                dark ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
              }`}
            >
              <span className={iconBoxCls}>
                <span className="font-mono text-[10px] font-bold">M</span>
              </span>
              <div>
                <div className="text-[13px] font-semibold">View as Markdown</div>
                <div className={`text-[11.5px] ${dark ? 'text-[#8e8e98]' : 'text-slate-500'}`}>View this page as plain text</div>
              </div>
            </button>

            <a
              href={`https://chatgpt.com/?q=${aiPrompt}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className={`w-full flex items-center gap-3 text-left px-2.5 py-2 rounded-lg no-underline transition ${
                dark ? 'text-[#e4e4e7] hover:bg-white/[0.05]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span className={iconBoxCls}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" />
                  <polygon points="12,7 16.5,9.6 16.5,14.4 12,17 7.5,14.4 7.5,9.6" />
                </svg>
              </span>
              <div>
                <div className="text-[13px] font-semibold">Open in ChatGPT</div>
                <div className={`text-[11.5px] ${dark ? 'text-[#8e8e98]' : 'text-slate-500'}`}>Ask questions about this page</div>
              </div>
            </a>

            <a
              href={`https://claude.ai/new?q=${aiPrompt}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className={`w-full flex items-center gap-3 text-left px-2.5 py-2 rounded-lg no-underline transition ${
                dark ? 'text-[#e4e4e7] hover:bg-white/[0.05]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span className={iconBoxCls}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                </svg>
              </span>
              <div>
                <div className="text-[13px] font-semibold">Open in Claude</div>
                <div className={`text-[11.5px] ${dark ? 'text-[#8e8e98]' : 'text-slate-500'}`}>Ask questions about this page</div>
              </div>
            </a>
          </div>
        )}
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className={`w-full max-w-3xl max-h-[82vh] rounded-2xl border flex flex-col overflow-hidden ${
              dark ? 'border-[#27272a] bg-[#0e0e11] text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-[#27272a]' : 'border-slate-200'}`}>
              <span className="text-sm font-semibold">Plain Text Markdown</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1 rounded-md text-xs font-medium bg-[#1d6bf3] hover:bg-[#2563eb] text-white cursor-pointer"
                >
                  Copy all
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer ${
                    dark ? 'border-white/15 text-[#a1a1aa] hover:text-white' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
            <pre className="p-5 overflow-auto text-xs font-mono leading-relaxed whitespace-pre-wrap m-0">
              {markdown}
            </pre>
          </div>
        </div>
      )}
    </>
  )
}

// Shared Page Bottom Footer (`Was this page helpful?` + `< Prev | Next >` + 4 Social Icons)
function DocPageFooter({ prevItem, nextItem, isOverview, helpfulVote, setHelpfulVote, dark, navigate }) {
  const borderCls = dark ? 'border-[#27272a]' : 'border-slate-200'
  const mutedText = dark ? 'text-[#a1a1aa]' : 'text-slate-600'

  return (
    <div className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className={`text-[13.5px] ${mutedText}`}>Was this page helpful?</span>
        {helpfulVote ? (
          <span className="text-[13px] text-emerald-400 font-medium">Thanks for your feedback!</span>
        ) : (
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHelpfulVote('yes')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-[12.5px] font-medium transition cursor-pointer ${
                dark
                  ? 'border-[#27272a] bg-[#141416] text-[#e4e4e7] hover:bg-white/[0.05]'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
              <span>Yes</span>
            </button>
            <button
              type="button"
              onClick={() => setHelpfulVote('no')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-[12.5px] font-medium transition cursor-pointer ${
                dark
                  ? 'border-[#27272a] bg-[#141416] text-[#e4e4e7] hover:bg-white/[0.05]'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
              </svg>
              <span>No</span>
            </button>
          </div>
        )}
      </div>

      {/* Prev / Next Links */}
      <div className={`mt-8 pb-8 border-b flex items-center justify-between gap-4 ${borderCls}`}>
        {!isOverview ? (
          prevItem ? (
            <button
              type="button"
              onClick={() => navigate(`/integrations/${prevItem.slug}`)}
              className={`inline-flex items-center gap-2 text-[14px] font-semibold transition cursor-pointer ${
                dark ? 'text-[#e4e4e7] hover:text-white' : 'text-slate-800 hover:text-black'
              }`}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
              </svg>
              <span>{prevItem.name}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/integrations')}
              className={`inline-flex items-center gap-2 text-[14px] font-semibold transition cursor-pointer ${
                dark ? 'text-[#e4e4e7] hover:text-white' : 'text-slate-800 hover:text-black'
              }`}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
              </svg>
              <span>All integrations</span>
            </button>
          )
        ) : (
          <div />
        )}

        {nextItem && (
          <button
            type="button"
            onClick={() => navigate(`/integrations/${nextItem.slug}`)}
            className={`inline-flex items-center gap-2 text-[14px] font-semibold transition cursor-pointer ml-auto ${
              dark ? 'text-[#e4e4e7] hover:text-white' : 'text-slate-800 hover:text-black'
            }`}
          >
            <span>{nextItem.name}</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      {/* 4 Monochrome Social Icons (X, LinkedIn, YouTube, GitHub) */}
      <div className="pt-7 flex items-center gap-5">
        <a href="https://x.com/igankush33" target="_blank" rel="noreferrer" aria-label="X" className={dark ? 'text-[#71717a] hover:text-white' : 'text-slate-400 hover:text-slate-800'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a href="https://www.linkedin.com/in/ankush-a-96518a39b/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className={dark ? 'text-[#71717a] hover:text-white' : 'text-slate-400 hover:text-slate-800'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
        <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className={dark ? 'text-[#71717a] hover:text-white' : 'text-slate-400 hover:text-slate-800'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>
        <a href="https://github.com/anku5265/iceberg-database" target="_blank" rel="noreferrer" aria-label="GitHub" className={dark ? 'text-[#71717a] hover:text-white' : 'text-slate-400 hover:text-slate-800'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
          </svg>
        </a>
      </div>
    </div>
  )
}

export default function Integrations() {
  const [dark, setDark] = useSessionTheme()
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const searchInputRef = useRef(null)
  const productMenuRef = useRef(null)

  const [filterQuery, setFilterQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [productMenuOpen, setProductMenuOpen] = useState(false)
  const [helpfulVote, setHelpfulVote] = useState(null)
  const [activeTocId, setActiveTocId] = useState('')
  const [partnerModalOpen, setPartnerModalOpen] = useState(false)
  const [partnerForm, setPartnerForm] = useState({ name: '', email: '', repo_or_url: '', source_tag: '', description: '' })
  const [partnerSubmitting, setPartnerSubmitting] = useState(false)
  const [partnerSubmitted, setPartnerSubmitted] = useState(false)
  const [partnerError, setPartnerError] = useState('')

  useEffect(() => {
    const openModal = () => {
      setPartnerSubmitted(false)
      setPartnerError('')
      setPartnerModalOpen(true)
    }
    window.addEventListener('open-partner-application-modal', openModal)
    return () => window.removeEventListener('open-partner-application-modal', openModal)
  }, [])

  const resolvedSlug = slug ? SLUG_ALIASES[slug] || slug : null

  const activeItem = useMemo(() => {
    if (!resolvedSlug || resolvedSlug === 'overview') return null
    return ALL_INTEGRATIONS.find(x => x.slug === resolvedSlug) || null
  }, [resolvedSlug])

  const [expandedGroups, setExpandedGroups] = useState(() => ({
    'ai-coding-tools': false,
    'data-sources': false,
    frameworks: false,
    infrastructure: false,
    models: false,
    observability: false,
  }))

  useEffect(() => {
    const onKeyDown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    const onOutside = e => {
      if (productMenuRef.current && !productMenuRef.current.contains(e.target)) {
        setProductMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onOutside)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [])

  useEffect(() => {
    setHelpfulVote(null)
    setMobileDrawerOpen(false)
    if (activeItem && activeItem.category !== 'build-an-integration') {
      setExpandedGroups(prev => ({ ...prev, [activeItem.category]: true }))
    }
    if (location.hash) {
      const targetId = location.hash.slice(1)
      const timer = window.setTimeout(() => {
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 60)
      return () => window.clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [resolvedSlug, activeItem, location.hash])

  useEffect(() => {
    document.title = activeItem
      ? `${activeItem.pageTitle || activeItem.name} -- Iceberg DB`
      : 'Integrations Overview -- Iceberg DB'
  }, [activeItem])

  const normalizedFilter = filterQuery.trim().toLowerCase()
  const filteredIntegrations = useMemo(() => {
    if (!normalizedFilter) return ALL_INTEGRATIONS
    return ALL_INTEGRATIONS.filter(
      item =>
        item.name.toLowerCase().includes(normalizedFilter) ||
        (item.cardTitle || '').toLowerCase().includes(normalizedFilter) ||
        item.shortDesc.toLowerCase().includes(normalizedFilter) ||
        item.category.toLowerCase().includes(normalizedFilter)
    )
  }, [normalizedFilter])

  const connectCategories = useMemo(
    () => INTEGRATION_CATEGORIES.filter(c => c.section === 'connect'),
    []
  )
  const buildItems = useMemo(
    () => filteredIntegrations.filter(x => x.category === 'build-an-integration'),
    [filteredIntegrations]
  )

  // Build Right TOC (`On this page`) for BOTH Overview (`/integrations` -> 6 category anchors)
  // AND Subpages (`/integrations/:slug` -> 3-level nested `H2` -> `H3` -> `H4`)!
  const { tocGroups, flatTocIds } = useMemo(() => {
    if (!activeItem) {
      const ovGroups = connectCategories.map(c => ({
        id: `cat-${c.id}`,
        label: c.label,
        children: [],
      }))
      return { tocGroups: ovGroups, flatTocIds: ovGroups.map(g => g.id) }
    }
    const groups = []
    const ids = []

    for (const sec of activeItem.sections || []) {
      if (sec.noToc || !sec.title) continue
      const children = []
      ids.push(sec.id)
      let currentH3 = null

      for (const blk of sec.blocks || []) {
        if (blk.type === 'h3' && blk.id) {
          currentH3 = { id: blk.id, label: blk.title, subChildren: [] }
          children.push(currentH3)
          ids.push(blk.id)
        } else if (blk.type === 'h4' && blk.id) {
          if (currentH3) {
            currentH3.subChildren.push({ id: blk.id, label: blk.title })
          } else {
            children.push({ id: blk.id, label: blk.title, subChildren: [] })
          }
          ids.push(blk.id)
        } else if (blk.type === 'steps' && !blk.noToc) {
          for (const st of blk.items || []) {
            const stepNode = { id: st.id, label: st.title, subChildren: [] }
            ids.push(st.id)
            for (const sb of st.blocks || []) {
              if (sb.type === 'h4' && sb.id) {
                stepNode.subChildren.push({ id: sb.id, label: sb.title })
                ids.push(sb.id)
              }
            }
            children.push(stepNode)
            currentH3 = stepNode
          }
        }
      }

      groups.push({ id: sec.id, label: sec.title, children })
    }

    return { tocGroups: groups, flatTocIds: ids }
  }, [activeItem, connectCategories])

  // Scroll-spy for Right TOC (with dual-active highlighting for parent H2 + active child H3/H4)
  useEffect(() => {
    if (!flatTocIds.length) {
      setActiveTocId('')
      return
    }
    setActiveTocId(activeItem ? flatTocIds[0] : '')
    const onScroll = () => {
      let current = activeItem ? flatTocIds[0] : ''
      for (const id of flatTocIds) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 240) {
          current = id
        }
      }
      setActiveTocId(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [flatTocIds, activeItem])

  const visibleNavItems = useMemo(
    () => ALL_INTEGRATIONS.filter(x => !x.hideFromSidebar),
    []
  )

  const { prevItem, nextItem } = useMemo(() => {
    if (!activeItem) return { prevItem: null, nextItem: visibleNavItems[0] || null }
    const idx = visibleNavItems.findIndex(x => x.slug === activeItem.slug)
    if (idx === -1) return { prevItem: null, nextItem: null }
    return {
      prevItem: idx > 0 ? visibleNavItems[idx - 1] : null,
      nextItem: idx >= 0 && idx < visibleNavItems.length - 1 ? visibleNavItems[idx + 1] : null,
    }
  }, [activeItem, visibleNavItems])

  const gridBorder = dark ? 'border-[#292929]' : 'border-slate-200'
  const pageBg = dark ? 'bg-[#171717] text-white' : 'bg-white text-slate-900'

  const isBuildActive = activeItem?.category === 'build-an-integration'

  const PRODUCT_SWITCHER_ITEMS = [
    {
      label: 'Iceberg Database',
      desc: 'Search engine for AI agents and applications',
      to: '/integrations',
      active: true,
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
          <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
        </svg>
      ),
    },
    {
      label: 'Iceberg Assistant',
      desc: 'Managed RAG for chat and agent applications',
      to: '/product/assistant',
      active: false,
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-7 6l-3 1 1-3.5A8.5 8.5 0 1112 20.5a8.7 8.7 0 01-6-.5z" />
        </svg>
      ),
    },
    {
      label: 'Iceberg Memory',
      desc: '4-tier cognitive memory engine for AI agents',
      to: '/product/memory',
      active: false,
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <circle cx="5" cy="7" r="2" />
          <circle cx="19" cy="7" r="2" />
          <circle cx="5" cy="17" r="2" />
          <circle cx="19" cy="17" r="2" />
          <path strokeLinecap="round" d="M7 8l2.5 2M17 8l-2.5 2M7 16l2.5-2M17 16l-2.5-2" />
        </svg>
      ),
    },
    {
      label: 'Iceberg BYOC',
      desc: 'Self-hosted Docker & VPC vector deployment',
      to: '/product/byoc',
      active: false,
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
          <circle cx="7" cy="7" r="1" fill="currentColor" />
          <circle cx="7" cy="17" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'Iceberg SDKs & MCP',
      desc: 'Python, JS, Java, Go, Rust, .NET & 16 MCP tools',
      to: '/product/sdk',
      active: false,
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3m8-6l4 3-4 3M13.5 6l-3 12" />
        </svg>
      ),
    },
    {
      label: 'Changelog & Status',
      desc: 'Every Iceberg release and live ap-south-1 status',
      to: '/status',
      active: false,
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01" />
        </svg>
      ),
    },
  ]

  const renderSidebarNav = ({ isMobile = false } = {}) => (
    <div className="flex flex-col h-full">
      {/* Top Pinned Product Switcher + `|<-` Collapse Button (Outside overflow-y-auto so w-[336px] popover floats cleanly across sidebar border!) */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2" ref={isMobile ? undefined : productMenuRef}>
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setProductMenuOpen(v => !v)}
              className={`w-full h-[40px] flex items-center justify-between gap-2 px-3 rounded-[10px] border text-[13.5px] font-medium transition cursor-pointer ${
                dark
                  ? 'border-[#2e2e2e] bg-[#1c1c1c] hover:border-[#3f3f46] text-[#f4f4f5]'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="text-[#3b82f6] flex items-center justify-center shrink-0">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="5" rx="8" ry="3" />
                    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
                  </svg>
                </span>
                <span className="truncate">Iceberg Database</span>
              </span>
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className={`shrink-0 transition-transform duration-150 ${productMenuOpen ? 'rotate-180' : ''} ${
                  dark ? 'text-[#8e8e98]' : 'text-slate-400'
                }`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {productMenuOpen && (
              <div
                className={`absolute left-0 top-[calc(100%+8px)] z-50 w-[300px] sm:w-[376px] rounded-[14px] border p-2 shadow-2xl ${
                  dark
                    ? 'border-[#2f2f2f] bg-[#1c1c1c] text-white shadow-black/80'
                    : 'border-slate-200 bg-white text-slate-900 shadow-slate-900/15'
                }`}
              >
                {PRODUCT_SWITCHER_ITEMS.map(opt => (
                  <Link
                    key={opt.label}
                    to={opt.to}
                    onClick={() => setProductMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-3 py-2 rounded-[10px] no-underline transition ${
                      dark ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[#3b82f6] shrink-0">{opt.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-[13.5px] font-semibold leading-snug ${
                          opt.active
                            ? 'text-[#60a5fa]'
                            : dark
                            ? 'text-[#f4f4f5]'
                            : 'text-slate-900'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span
                        className={`block text-[12px] leading-[1.35] mt-0.5 truncate ${
                          dark ? 'text-[#a1a1aa]' : 'text-slate-500'
                        }`}
                      >
                        {opt.desc}
                      </span>
                    </span>
                    {opt.active && (
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.3"
                        viewBox="0 0 24 24"
                        className="shrink-0"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              type="button"
              onClick={() => {
                setProductMenuOpen(false)
                setSidebarCollapsed(true)
              }}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className={`hidden lg:flex w-8 h-8 shrink-0 items-center justify-center rounded-[8px] transition cursor-pointer ${
                dark ? 'text-[#9a9aa4] hover:text-white hover:bg-white/[0.05]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6v12M19 12H10m0 0l3.8-3.8M10 12l3.8 3.8" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <div>
          <div
            className={`px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.05em] ${
              dark
                ? !isBuildActive
                  ? 'text-white'
                  : 'text-[#a1a1aa]'
                : 'text-slate-800'
            }`}
          >
            Connect an integration
          </div>

          <Link
            to="/integrations"
            className={`flex items-center px-3 py-[7px] rounded-[10px] text-[13.5px] no-underline focus:outline-none transition mb-0.5 ${
              !activeItem
                ? dark
                  ? 'bg-[#192231] text-white font-semibold'
                  : 'bg-blue-50 text-blue-700 font-semibold'
                : dark
                ? 'text-[#d4d4d8] hover:text-white hover:bg-white/[0.04]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All integrations
          </Link>

          <div className="space-y-0.5">
            {connectCategories.map(cat => {
              const items = filteredIntegrations.filter(x => x.category === cat.id && !x.hideFromSidebar)
              if (normalizedFilter && items.length === 0) return null
              const isOpen = normalizedFilter ? true : !!expandedGroups[cat.id]

              return (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedGroups(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                    className={`w-full flex items-center gap-1.5 px-2.5 py-[7px] rounded-[10px] text-[13.5px] text-left transition cursor-pointer ${
                      dark
                        ? 'text-[#e4e4e7] hover:text-white hover:bg-white/[0.04]'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <svg
                      width="11"
                      height="11"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.1"
                      viewBox="0 0 24 24"
                      className={`shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''} ${
                        dark ? 'text-[#8e8e98]' : 'text-slate-400'
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                    </svg>
                    <span className="truncate font-medium">{cat.label}</span>
                  </button>

                  {isOpen && (
                    <div className="ml-3 pl-3 space-y-0.5 my-0.5">
                      {items.map(item => {
                        const isSelected = activeItem?.slug === item.slug
                        return (
                          <Link
                            key={item.slug}
                            to={`/integrations/${item.slug}`}
                            className={`block px-3 py-1.5 rounded-[10px] text-[13.5px] leading-snug no-underline focus:outline-none transition ${
                              isSelected
                                ? dark
                                  ? 'bg-[#192231] text-white font-semibold'
                                  : 'bg-blue-50 text-blue-700 font-semibold'
                                : dark
                                ? 'text-[#c4c4cc] hover:text-white hover:bg-white/[0.04]'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Section: BUILD AN INTEGRATION (Edge-to-edge divider across sidebar) */}
        {buildItems.length > 0 && (
          <div className={`mt-4 pt-4 -mx-3 px-3 border-t ${gridBorder}`}>
            <div
              className={`px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.05em] ${
                dark
                  ? isBuildActive
                    ? 'text-white'
                    : 'text-[#a1a1aa]'
                  : 'text-slate-800'
              }`}
            >
              Build an integration
            </div>
            <div className="space-y-0.5">
              {buildItems.map(item => {
                const isSelected = activeItem?.slug === item.slug
                return (
                  <Link
                    key={item.slug}
                    to={`/integrations/${item.slug}`}
                    className={`block px-3 py-[7px] rounded-[10px] text-[13.5px] leading-[1.35] no-underline focus:outline-none transition ${
                      isSelected
                        ? dark
                          ? 'bg-[#192231] text-white font-semibold'
                          : 'bg-blue-50 text-blue-700 font-semibold'
                        : dark
                        ? 'text-[#d4d4d8] hover:text-white hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen flex flex-col ${pageBg}`}>
      {/* Row 1: Dedicated Docs Top Header Bar (`Logo` | `Search... Ctrl K` | `Docs Status Support Log in [Sign up free >] [Theme]`) */}
      <header
        className={`sticky top-0 z-40 h-[64px] border-b ${
          dark ? 'bg-[#171717] border-[#212121]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-7 h-full flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0">
            <Link to="/" className="inline-flex items-center gap-2.5 no-underline shrink-0">
              <IcebergLogo className="w-[27px] h-[27px]" />
              <span className={`font-semibold text-[21.5px] tracking-[-0.02em] ${dark ? 'text-white' : 'text-slate-900'}`}>
                Iceberg
              </span>
            </Link>

            <div className="relative w-[260px] lg:w-[338px] hidden sm:block sm:ml-10 lg:ml-[216px]">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                viewBox="0 0 24 24"
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${dark ? 'text-[#9a9aa4]' : 'text-slate-400'}`}
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-4-4" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={filterQuery}
                onChange={e => {
                  setFilterQuery(e.target.value)
                  if (activeItem && e.target.value.trim()) {
                    navigate('/integrations')
                  }
                }}
                placeholder="Search..."
                className={`w-full h-[38px] pl-9 pr-14 rounded-[10px] border text-[13.5px] focus:outline-none transition ${
                  dark
                    ? 'bg-[#1a1a1a] border-[#2c2c2c] focus:border-[#3b82f6] text-white placeholder-[#9a9aa4]'
                    : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder-slate-400'
                }`}
              />
              {filterQuery ? (
                <button
                  type="button"
                  onClick={() => setFilterQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer ${
                    dark ? 'text-[#888] hover:text-white' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Clear
                </button>
              ) : (
                <span
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[11.5px] font-semibold pointer-events-none ${
                    dark ? 'text-[#d4d4d8]' : 'text-slate-500'
                  }`}
                >
                  Ctrl K
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 lg:gap-9 xl:gap-11 shrink-0 text-[13.5px]">
            <Link
              to="/docs"
              className={`hidden md:inline no-underline font-medium transition ${
                dark ? 'text-[#e4e4e7] hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Docs
            </Link>
            <Link
              to="/status"
              className={`hidden md:inline no-underline font-medium transition ${
                dark ? 'text-[#e4e4e7] hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Status
            </Link>
            <Link
              to="/contact"
              className={`hidden md:inline no-underline font-medium transition ${
                dark ? 'text-[#e4e4e7] hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Support
            </Link>
            <a
              href={`${D}/login`}
              className={`no-underline font-medium transition ${
                dark ? 'text-[#e4e4e7] hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Log in
            </a>
            <a
              href={`${D}/signup`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1d6bf3] hover:bg-[#2563eb] text-white text-[13px] font-semibold no-underline transition"
            >
              <span>Sign up free</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
              </svg>
            </a>
            <button
              type="button"
              onClick={() => setDark(d => !d)}
              aria-label="Toggle theme"
              title="Toggle light/dark theme"
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                dark
                  ? 'border-[#27272a] bg-[#141417] text-[#a1a1aa] hover:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              {dark ? (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Row 2: Secondary Docs Section Tabs Bar (`Guides | Reference | Examples | Models | Integrations | Admin`) */}
      <div
        className={`sticky top-[64px] z-30 border-b ${
          dark ? 'bg-[#171717] border-[#292929]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-7 h-[48px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-7 text-[13.5px]">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className={`lg:hidden inline-flex items-center gap-1.5 font-medium shrink-0 cursor-pointer ${
                dark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
              </svg>
              <span>Menu</span>
            </button>

            <Link to="/docs" className={`no-underline whitespace-nowrap font-medium transition ${dark ? 'text-[#a1a1aa] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              Guides
            </Link>
            <a href="https://api.icebergdb.in/docs" target="_blank" rel="noreferrer" className={`no-underline whitespace-nowrap font-medium transition ${dark ? 'text-[#a1a1aa] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              Reference
            </a>
            <Link to="/living-code" className={`hidden sm:inline no-underline whitespace-nowrap font-medium transition ${dark ? 'text-[#a1a1aa] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              Examples
            </Link>
            <a
              href="/integrations#cat-models"
              onClick={e => {
                if (!activeItem) {
                  e.preventDefault()
                  document.getElementById('cat-models')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className={`hidden sm:inline no-underline whitespace-nowrap font-medium transition ${dark ? 'text-[#a1a1aa] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Models
            </a>
            <Link
              to="/integrations"
              className={`no-underline whitespace-nowrap font-semibold inline-flex items-center ${
                dark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Integrations
            </Link>
            <a href={`${D}/settings`} className={`hidden md:inline no-underline whitespace-nowrap font-medium transition ${dark ? 'text-[#a1a1aa] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              Admin
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/65" onClick={() => setMobileDrawerOpen(false)} />
          <div className={`relative z-10 w-[290px] max-w-[85vw] h-full border-r ${
            dark ? 'bg-[#0f0f11] border-[#27272a]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${gridBorder}`}>
              <span className="text-xs font-semibold uppercase tracking-wider">Integrations</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className={`text-xs px-2 py-1 rounded border cursor-pointer ${
                  dark ? 'border-white/15 text-[#a1a1aa]' : 'border-slate-200 text-slate-600'
                }`}
              >
                Close
              </button>
            </div>
            <div className="h-[calc(100%-49px)]">{renderSidebarNav({ isMobile: true })}</div>
          </div>
        </div>
      )}

      {/* Workspace Body: Exact 3-Column Measured Geometry (`280px` Sidebar | `pl-[52px] max-w-[632px]` Center | `ml-[36px] w-[228px]` Right TOC) */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex items-start">
        {/* Column 1: Left Sticky Collapsible Sidebar (`280px`, `z-20` so wide product popover floats over <main>) */}
        {!sidebarCollapsed ? (
          <aside
            className={`hidden lg:block relative z-20 w-[280px] shrink-0 sticky top-[112px] h-[calc(100vh-112px)] border-r ${gridBorder}`}
          >
            {renderSidebarNav()}
          </aside>
        ) : (
          <div
            className={`hidden lg:flex flex-col items-center pt-4 w-12 shrink-0 sticky top-[112px] h-[calc(100vh-112px)] border-r ${gridBorder}`}
          >
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className={`w-8 h-8 flex items-center justify-center rounded-[8px] transition cursor-pointer ${
                dark
                  ? 'text-[#9a9aa4] hover:text-white hover:bg-white/[0.05]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6v12M5 12h9m0 0l-3.8-3.8M14 12l-3.8 3.8" />
              </svg>
            </button>
          </div>
        )}

        {/* Column 2: Main Center Panel (`632px` content width starting at `x=332px`) */}
        <main className="flex-1 min-w-0 xl:flex-none xl:w-[736px] px-5 sm:px-9 lg:pl-[52px] lg:pr-[52px] pt-9 pb-20 lg:pt-9 lg:pb-24">
          {!activeItem ? (
            /* ================================================================
               MODE A: 3-COLUMN DIRECTORY GRID (`/integrations`) + RIGHT TOC
               ================================================================ */
            <div className="max-w-[632px]">
              <div className={`text-[11px] font-bold uppercase tracking-[0.06em] mb-2 ${dark ? 'text-[#f4f4f5]' : 'text-slate-600'}`}>
                Connect an integration
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3.5">
                <h1 className={`text-[30px] sm:text-[32px] font-bold tracking-[-0.02em] leading-[1.18] ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Integrations overview
                </h1>
                <CopyPageDropdown activeItem={null} dark={dark} />
              </div>

              <p className={`text-[16.5px] leading-[1.6] mb-10 ${dark ? 'text-[#b8b8b8]' : 'text-slate-600'}`}>
                Browse Iceberg integrations across vector embedding providers, data ingestion tools, frameworks, and infrastructure to ship AI apps faster.
              </p>

              {resolvedSlug && resolvedSlug !== 'overview' && (
                <div className={`mb-8 p-4 rounded-xl border text-sm ${
                  dark ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-amber-300 bg-amber-50 text-amber-900'
                }`}>
                  Integration <code>{resolvedSlug}</code> was not found. Showing all available integrations below.
                </div>
              )}

              {filteredIntegrations.filter(x => !x.hideFromOverviewGrid && x.category !== 'build-an-integration').length === 0 ? (
                <div className={`rounded-xl border p-8 text-center ${gridBorder}`}>
                  <p className={`text-sm mb-3 ${dark ? 'text-[#a1a1aa]' : 'text-slate-600'}`}>
                    No integrations matched "{filterQuery}".
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilterQuery('')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#1d6bf3] text-white cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  {connectCategories.map(cat => {
                    const cards = filteredIntegrations.filter(
                      x => x.category === cat.id && !x.hideFromOverviewGrid
                    )
                    if (!cards.length) return null

                    return (
                      <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
                        <h2 className={`text-[22px] font-bold tracking-[-0.015em] mb-2.5 ${dark ? 'text-white' : 'text-slate-900'}`}>
                          {cat.label}
                        </h2>
                        {cat.helperText && cat.helperLink ? (
                          <p className={`text-[14.5px] mb-5 ${dark ? 'text-[#b8b8b8]' : 'text-slate-600'}`}>
                            {cat.helperText}{' '}
                            <Link
                              to={`/integrations/${cat.helperLink.slug}`}
                              className="text-[#60a5fa] underline decoration-[#3b82f6] underline-offset-4 font-medium"
                            >
                              {cat.helperLink.label}
                            </Link>
                            .
                          </p>
                        ) : (
                          <div className="mb-5" />
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cards.map(card => (
                            <Link
                              key={card.slug}
                              to={`/integrations/${card.slug}`}
                              className={`group min-w-0 overflow-hidden rounded-[12px] border p-5 flex flex-col justify-start no-underline transition-colors duration-150 ${
                                dark
                                  ? 'bg-[#1c1c1c] border-[#2b2b2b] hover:border-[#3f3f46]'
                                  : 'bg-white border-slate-200 hover:border-[#2563eb]'
                              }`}
                            >
                              {card.category !== 'ai-coding-tools' && (
                                <IntegrationLogo slug={card.slug} category={card.category} dark={dark} />
                              )}
                              <h3 className={`text-[16px] font-bold tracking-[-0.01em] leading-[1.35] mb-2 break-words ${dark ? 'text-white' : 'text-slate-900'}`}>
                                {card.cardTitle || card.name}
                              </h3>
                              <p className={`text-[13.5px] leading-[1.55] break-words ${dark ? 'text-[#b4b4b4]' : 'text-slate-600'}`}>
                                {card.shortDesc}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}

              <DocPageFooter
                prevItem={null}
                nextItem={visibleNavItems[0] || null}
                isOverview={true}
                helpfulVote={helpfulVote}
                setHelpfulVote={setHelpfulVote}
                dark={dark}
                navigate={navigate}
              />
            </div>
          ) : (
            /* ================================================================
               MODE B: SUBPAGE VIEW (NATIVE PLUGIN / PARTNER LANDING / FULL GUIDE)
               ================================================================ */
            <div className="max-w-[632px]">
              <Link
                to="/integrations"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-medium no-underline mb-6 group"
              >
                <svg width="13" height="13" fill="none" stroke="#3b82f6" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
                <span className={dark ? 'text-white group-hover:opacity-85' : 'text-slate-800 group-hover:text-black'}>
                  Back to Integrations
                </span>
              </Link>

              <div className={`text-[11px] font-bold uppercase tracking-[0.06em] mb-2 ${dark ? 'text-[#f4f4f5]' : 'text-slate-600'}`}>
                {INTEGRATION_CATEGORIES.find(c => c.id === activeItem.category)?.label || 'Integration'}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3.5">
                <h1 className={`text-[30px] sm:text-[32px] font-bold tracking-[-0.02em] leading-[1.18] ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {activeItem.pageTitle || activeItem.name}
                </h1>
                <div className="sm:mt-1 shrink-0">
                  <CopyPageDropdown activeItem={activeItem} dark={dark} />
                </div>
              </div>

              <p className={`text-[16.5px] leading-[1.6] mb-7 ${dark ? 'text-[#b8b8b8]' : 'text-slate-600'}`}>
                {renderRichInline(activeItem.summary, dark)}
              </p>

              {(activeItem.intro || []).map((para, idx) => (
                <p key={idx} className={`text-[15px] leading-[1.68] mb-4 ${dark ? 'text-[#d8d8d8]' : 'text-slate-700'}`}>
                  {renderRichInline(para, dark)}
                </p>
              ))}

              {activeItem.topBullets?.length > 0 && (
                <ul className={`list-disc pl-5 space-y-2 text-[14.5px] leading-[1.65] my-4 ${dark ? 'text-[#d4d4d8]' : 'text-slate-700'}`}>
                  {activeItem.topBullets.map((b, i) => (
                    <li key={i}>{renderRichInline(b, dark)}</li>
                  ))}
                </ul>
              )}

              {(activeItem.introAfterBullets || []).map((para, idx) => (
                <p key={`after-${idx}`} className={`text-[15px] leading-[1.7] mb-4 ${dark ? 'text-[#d4d4d8]' : 'text-slate-700'}`}>
                  {renderRichInline(para, dark)}
                </p>
              ))}

              {/* Exact Page-Specific CTA Row (`View on GitHub >`, `Get started >`, `Try free... >`, + optional secondary blue link) */}
              {activeItem.cta && (
                <div className="flex flex-wrap items-center gap-6 mt-6 mb-8">
                  <a
                    href={activeItem.cta.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold bg-[#1d6bf3] hover:bg-[#2563eb] text-white no-underline transition"
                  >
                    <span>{activeItem.cta.label}</span>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                    </svg>
                  </a>

                  {activeItem.cta.secondaryLabel && (
                    activeItem.cta.secondaryTo ? (
                      <Link
                        to={activeItem.cta.secondaryTo}
                        className="text-[14px] font-medium text-[#3b82f6] hover:text-[#60a5fa] no-underline transition"
                      >
                        {activeItem.cta.secondaryLabel}
                      </Link>
                    ) : (
                      <a
                        href={activeItem.cta.secondaryHref}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[14px] font-medium text-[#3b82f6] hover:text-[#60a5fa] no-underline transition"
                      >
                        {activeItem.cta.secondaryLabel}
                      </a>
                    )
                  )}
                </div>
              )}

              {/* Render All Rich Sections */}
              {(activeItem.sections || []).map(sec => (
                <section key={sec.id} id={sec.id} className="my-9 scroll-mt-32">
                  {sec.title && (
                    <h2 className={`text-[22px] font-bold tracking-[-0.015em] mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {sec.title}
                    </h2>
                  )}
                  <BlockList blocks={sec.blocks || []} dark={dark} />
                </section>
              ))}

              <DocPageFooter
                prevItem={prevItem}
                nextItem={nextItem}
                isOverview={false}
                helpfulVote={helpfulVote}
                setHelpfulVote={setHelpfulVote}
                dark={dark}
                navigate={navigate}
              />
            </div>
          )}
        </main>

        {/* Column 3: Right Sticky TOC (`x = 1052px` on 1366px viewport -- exact 1:1 match to reference) */}
        <aside className="hidden xl:block w-[228px] xl:ml-[36px] shrink-0 sticky top-[112px] max-h-[calc(100vh-112px)] overflow-y-auto py-9 pr-4">
          {tocGroups.length > 0 && (
            <>
              <div className={`flex items-center gap-2 text-[13px] font-semibold mb-3.5 ${dark ? 'text-[#e5e5e5]' : 'text-slate-900'}`}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M4 7h16M4 12h11M4 17h14" />
                </svg>
                <span>On this page</span>
              </div>

              <ul className="space-y-2.5 text-[13px] leading-[1.45]">
                  {tocGroups.map(group => {
                    const childActive = group.children.some(
                      ch =>
                        ch.id === activeTocId ||
                        ch.subChildren?.some(sub => sub.id === activeTocId)
                    )
                    const groupActive = activeTocId === group.id || childActive

                    const scrollToAnchor = (e, id) => {
                      e.preventDefault()
                      const el = document.getElementById(id)
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        setActiveTocId(id)
                      }
                    }

                    return (
                      <li key={group.id}>
                        <a
                          href={`#${group.id}`}
                          onClick={e => scrollToAnchor(e, group.id)}
                          className={`block no-underline transition ${
                            groupActive
                              ? 'text-[#3b82f6] font-medium'
                              : dark
                              ? 'text-[#a1a1aa] hover:text-white'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {group.label}
                        </a>

                        {group.children.length > 0 && (
                          <ul className={`mt-2 ml-1 pl-3.5 border-l space-y-2 ${gridBorder}`}>
                            {group.children.map(ch => {
                              const subActive = ch.subChildren?.some(s => s.id === activeTocId)
                              const isChActive = activeTocId === ch.id || subActive
                              return (
                                <li key={ch.id}>
                                  <a
                                    href={`#${ch.id}`}
                                    onClick={e => scrollToAnchor(e, ch.id)}
                                    className={`block no-underline transition ${
                                      isChActive
                                        ? 'text-[#3b82f6] font-medium'
                                        : dark
                                        ? 'text-[#a1a1aa] hover:text-white'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                  >
                                    {ch.label}
                                  </a>

                                  {ch.subChildren?.length > 0 && (
                                    <ul className="mt-1.5 pl-3.5 space-y-1.5">
                                      {ch.subChildren.map(sub => {
                                        const isSubActive = activeTocId === sub.id
                                        return (
                                          <li key={sub.id}>
                                            <a
                                              href={`#${sub.id}`}
                                              onClick={e => scrollToAnchor(e, sub.id)}
                                              className={`block no-underline transition ${
                                                isSubActive
                                                  ? 'text-[#3b82f6] font-medium'
                                                  : dark
                                                  ? 'text-[#8e8e98] hover:text-white'
                                                  : 'text-slate-500 hover:text-slate-900'
                                              }`}
                                            >
                                              {sub.label}
                                            </a>
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
        </aside>
      </div>

      {/* Official Partner Integration Listing Application Modal (Backed by POST /partner-integrations/apply) */}
      {partnerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setPartnerModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              dark ? 'border-[#2e2e2e] bg-[#1a1a1c] text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[19px] font-bold">Apply for Official Partner Listing</h2>
              <button
                type="button"
                onClick={() => setPartnerModalOpen(false)}
                className="text-sm text-[#a1a1aa] hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            {partnerSubmitted ? (
              <div className="py-4">
                <div className="text-emerald-400 font-semibold text-[15px] mb-2">Application received!</div>
                <p className="text-[13.5px] text-[#b4b4b4] leading-relaxed mb-5">
                  Thank you for applying to list your integration on the Iceberg integrations directory. Our engineering team reviews active integrations and will follow up at <strong>{partnerForm.email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setPartnerModalOpen(false)}
                  className="w-full py-2.5 rounded-lg bg-[#1d6bf3] hover:bg-[#2563eb] text-white text-[13.5px] font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  setPartnerError('')
                  setPartnerSubmitting(true)
                  try {
                    const res = await fetch(`${API_BASE}/partner-integrations/apply`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(partnerForm),
                    })
                    const data = await res.json().catch(() => ({}))
                    if (!res.ok) {
                      throw new Error(data.detail || 'Unable to submit application.')
                    }
                    setPartnerSubmitted(true)
                  } catch (err) {
                    setPartnerError(err.message || 'Submission failed.')
                  } finally {
                    setPartnerSubmitting(false)
                  }
                }}
                className="space-y-3.5"
              >
                <p className="text-[13px] text-[#a1a1aa]">
                  Submit your native Iceberg integration to be curated on the Integrations overview page.
                </p>
                {partnerError && (
                  <div className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-[12.5px]">
                    {partnerError}
                  </div>
                )}
                <div>
                  <label className="block text-[12.5px] font-medium mb-1">Integration name *</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.name}
                    onChange={e => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Acme RAG Studio"
                    className="w-full px-3 py-2 rounded-lg border border-[#2e2e2e] bg-[#111113] text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12.5px] font-medium mb-1">Contact email *</label>
                    <input
                      type="email"
                      required
                      value={partnerForm.email}
                      onChange={e => setPartnerForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="founders@acme.ai"
                      className="w-full px-3 py-2 rounded-lg border border-[#2e2e2e] bg-[#111113] text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-medium mb-1">Source tag / integrationId</label>
                    <input
                      type="text"
                      value={partnerForm.source_tag}
                      onChange={e => setPartnerForm(prev => ({ ...prev, source_tag: e.target.value }))}
                      placeholder="acme_studio"
                      className="w-full px-3 py-2 rounded-lg border border-[#2e2e2e] bg-[#111113] font-mono text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium mb-1">GitHub repository or documentation URL *</label>
                  <input
                    type="url"
                    required
                    value={partnerForm.repo_or_url}
                    onChange={e => setPartnerForm(prev => ({ ...prev, repo_or_url: e.target.value }))}
                    placeholder="https://github.com/acme/iceberg-connector"
                    className="w-full px-3 py-2 rounded-lg border border-[#2e2e2e] bg-[#111113] text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium mb-1">How mutual customers use your integration *</label>
                  <textarea
                    rows={3}
                    required
                    value={partnerForm.description}
                    onChange={e => setPartnerForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your integration, supported workflows, and active usage..."
                    className="w-full px-3 py-2 rounded-lg border border-[#2e2e2e] bg-[#111113] text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPartnerModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#2e2e2e] text-[13px] text-[#d4d4d8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={partnerSubmitting}
                    className="px-5 py-2 rounded-lg bg-[#1d6bf3] hover:bg-[#2563eb] disabled:opacity-50 text-white text-[13px] font-semibold cursor-pointer"
                  >
                    {partnerSubmitting ? 'Submitting...' : 'Submit application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
