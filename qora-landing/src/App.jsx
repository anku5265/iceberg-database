import { useState, useRef, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import HomePageComponent from './HomePageNew'
import ProductDatabase from './pages/ProductDatabase'
import ProductMemory from './pages/ProductMemory'
import ProductAssistant from './pages/ProductAssistant'
import ProductBYOC from './pages/ProductBYOC'
import ProductSDK from './pages/ProductSDK'
import ProductDashboard from './pages/ProductDashboard'
import Security from './pages/Security'
import Integrations from './pages/Integrations'
import ProductBackup from './pages/ProductBackup'
import ProductNamespaces from './pages/ProductNamespaces'
import Docs from './pages/Docs'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function ProductDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition text-sm ${open ? 'text-white bg-white/5' : 'text-[#888] hover:text-white hover:bg-white/5'}`}
      >
        Product
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[560px] bg-[#111] border border-[#222] rounded-xl shadow-2xl shadow-black/50 p-5 z-50">
          {/* Products */}
          <div className="mb-5">
            <p className="text-xs text-[#555] uppercase tracking-widest mb-3 px-1">Products</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: <DBIcon/>,   name: 'Iceberg Database',  desc: 'Serverless, India-hosted vector DB',   to: '/product/database' },
                { icon: <MemIcon/>,  name: 'Iceberg Memory',    desc: 'Persistent memory for AI agents',      to: '/product/memory' },
                { icon: <BotIcon/>,  name: 'Iceberg Assistant', desc: 'No-code RAG chatbot + WhatsApp',       to: '/product/assistant' },
                { icon: <ByocIcon/>, name: 'Iceberg BYOC',      desc: 'Deploy on your own server',            to: '/product/byoc' },
                { icon: <SDKIcon/>,  name: 'Iceberg SDK',       desc: 'Python, JS, Go, Java, .NET, Rust',    to: '/product/sdk' },
                { icon: <DashIcon/>, name: 'Iceberg Dashboard', desc: 'Manage collections, search, and keys', to: '/product/dashboard' },
              ].map(p => (
                <Link key={p.name} to={p.to}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition group">
                  <span className="text-[#555] group-hover:text-blue-400 transition mt-0.5 flex-shrink-0">{p.icon}</span>
                  <div>
                    <span className="text-sm text-white font-medium block">{p.name}</span>
                    <span className="text-xs text-[#666]">{p.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#1a1a1a] mb-4"/>

          {/* Capabilities */}
          <div>
            <p className="text-xs text-[#555] uppercase tracking-widest mb-3 px-1">Capabilities</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: <SecIcon/>,    name: 'Security',         desc: 'DPDP compliant, India data residency', to: '/security' },
                { icon: <IntIcon/>,    name: 'Integrations',     desc: 'LangChain, LlamaIndex, REST API',       to: '/integrations' },
                { icon: <BackupIcon/>, name: 'Backup & Restore', desc: 'One-click backup, restore anytime',     to: '/product/backup' },
                { icon: <NsIcon/>,     name: 'Namespaces',       desc: 'Logical separation within collections', to: '/product/namespaces' },
              ].map(c => (
                <Link key={c.name} to={c.to}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition group">
                  <span className="text-[#555] group-hover:text-blue-400 transition mt-0.5 flex-shrink-0">{c.icon}</span>
                  <div>
                    <div className="text-sm text-white font-medium">{c.name}</div>
                    <div className="text-xs text-[#666]">{c.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DBIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/></svg> }
function SDKIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25z"/></svg> }
function DashIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function BotIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Zm3-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm3.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3.75 4.5a3 3 0 0 1 3 0"/></svg> }
function SecIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg> }
function IntIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"/></svg> }
function MemIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/></svg> }
function ByocIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 6 0m-6 0H3m16.5 0a3 3 0 0 0 3-3m-3 3a3 3 0 1 1-6 0m6 0h1.5m-1.5-6a3 3 0 0 0-3-3m0 0a3 3 0 0 0-3 3m3-3V3m0 18v-1.5"/></svg> }
function BackupIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg> }
function NsIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg> }

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePageComponent ProductDropdown={ProductDropdown} />} />
      <Route path="/product/database" element={<ProductDatabase />} />
      <Route path="/product/memory" element={<ProductMemory />} />
      <Route path="/product/assistant" element={<ProductAssistant />} />
      <Route path="/product/byoc" element={<ProductBYOC />} />
      <Route path="/product/sdk" element={<ProductSDK />} />
      <Route path="/product/dashboard" element={<ProductDashboard />} />
      <Route path="/product/backup" element={<ProductBackup />} />
      <Route path="/product/namespaces" element={<ProductNamespaces />} />
      <Route path="/security" element={<Security />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/docs" element={<Docs />} />
    </Routes>
  )
}

const DEMO_RESULTS = {
  'return policy': [
    { text: 'Our return policy allows 30 day returns for all products purchased online.', score: 0.97, source: 'handbook.pdf' },
    { text: 'Items must be unused and in original packaging to qualify for a return.', score: 0.91, source: 'faq.pdf' },
    { text: 'Refunds are processed within 5-7 business days after receiving the item.', score: 0.86, source: 'handbook.pdf' },
  ],
  'pricing plans': [
    { text: 'Free tier includes 500K vectors, unlimited collections, and never pauses.', score: 0.98, source: 'pricing.pdf' },
    { text: 'Starter plan at ₹799/mo gives 5M vectors and 10K queries per day.', score: 0.93, source: 'pricing.pdf' },
    { text: 'Growth plan includes metadata filters and priority at ₹3,999/mo.', score: 0.88, source: 'pricing.pdf' },
  ],
  'agent memory': [
    { text: 'Long-term memory persists forever — ideal for user preferences and facts.', score: 0.96, source: 'memory-docs.pdf' },
    { text: 'Short-term memory expires after 1 hour — perfect for session context.', score: 0.90, source: 'memory-docs.pdf' },
    { text: 'Episodic memory stores specific events and expires after 30 days.', score: 0.85, source: 'memory-docs.pdf' },
  ],
}

const STACK_ITEMS = [
  { icon: '🐍', name: 'Python' }, { icon: '⚡', name: 'LangChain' }, { icon: '🦙', name: 'LlamaIndex' },
  { icon: '☕', name: 'Java' }, { icon: '🟢', name: 'Node.js' }, { icon: '🦀', name: 'Rust' },
  { icon: '🐹', name: 'Go' }, { icon: '🔷', name: '.NET' }, { icon: '🌿', name: 'Spring Boot' },
  { icon: '⚛️', name: 'React' }, { icon: '🚀', name: 'FastAPI' }, { icon: '🌊', name: 'Next.js' },
]

function VectorNodes() {
  const nodes = [
    { x: 15, y: 20, delay: 0 }, { x: 80, y: 15, delay: 0.5 }, { x: 90, y: 70, delay: 1 },
    { x: 10, y: 75, delay: 1.5 }, { x: 50, y: 10, delay: 0.3 }, { x: 85, y: 45, delay: 0.8 },
  ]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{zIndex:0}}>
      <defs>
        <radialGradient id="ng" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </radialGradient>
      </defs>
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={`${n.x}%`} cy={`${n.y}%`} r="3"
            fill="#2563eb"
            style={{ animation: `breathe ${4 + n.delay}s ease-in-out infinite`, animationDelay: `${n.delay}s` }}
          />
          {nodes.slice(i + 1, i + 3).map((m, j) => (
            <line key={j}
              x1={`${n.x}%`} y1={`${n.y}%`}
              x2={`${m.x}%`} y2={`${m.y}%`}
              stroke="#2563eb" strokeWidth="0.5" strokeOpacity="0.3"
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

function HomePage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const submit = async (e) => {
    e.preventDefault()
    try { await fetch(`${API}/waitlist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }) } catch (_) {}
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.04] backdrop-blur-xl bg-[#080808]/80">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight">Iceberg</span>
            <div className="hidden md:flex items-center gap-1 text-sm">
              <ProductDropdown />
              {[['Developers','#code'],['Pricing','#pricing'],['Docs',`${D}/docs`],['Blog','#']].map(([l,h]) => (
                <a key={l} href={h} className="text-[#666] hover:text-white px-3 py-1.5 rounded-md hover:bg-white/[0.06] transition text-sm">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${D}/login`} className="text-sm text-[#666] hover:text-white px-3 py-1.5 transition">Sign in</a>
            <a href={`${D}/signup`} className="btn-glow bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-white/90 transition">Start for free</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-orb" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative container mx-auto px-6 pt-28 pb-20 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[#888] mb-8 fade-up fade-up-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            Beta · 500K vectors free · never pauses · India hosted
          </div>
          <h1 className="text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 fade-up fade-up-2">
            Vector search<br />
            <span className="gradient-text">built for India.</span>
          </h1>
          <p className="text-lg text-[#555] max-w-xl mx-auto mb-10 leading-relaxed fade-up fade-up-3">
            Semantic search, agent memory, and RAG pipelines. Production-ready in minutes. Hosted in Mumbai with &lt;20ms latency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center fade-up fade-up-4">
            <a href={`${D}/signup`} className="btn-glow relative bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition text-sm shadow-lg shadow-blue-600/25">
              Start building free
              <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
            </a>
            <a href="#code" className="border border-white/[0.08] hover:border-white/20 text-[#888] hover:text-white font-medium px-8 py-3 rounded-lg transition text-sm backdrop-blur-sm">
              View docs
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="line-gradient" />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '<20ms', l: 'p50 latency, Mumbai' },
              { v: '500K', l: 'free vectors, forever' },
              { v: '6', l: 'SDK languages' },
              { v: '∞', l: 'free collections' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-black text-white mb-1 gradient-text">{s.v}</div>
                <div className="text-xs text-[#444] tracking-wide">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="line-gradient" />

      {/* Code */}
      <section id="code" className="py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs text-[#444] uppercase tracking-widest mb-3">Developer first</p>
            <h2 className="text-4xl font-black mb-3">Your stack. Your way.</h2>
            <p className="text-[#555] text-sm">Python, JavaScript, Go, Java, .NET, Rust — or plain REST</p>
          </div>
          <CodeBlock />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs text-[#444] uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="text-4xl font-black mb-4">Everything to ship AI features</h2>
            <p className="text-[#555] text-sm max-w-md mx-auto">No DevOps. No ML expertise. One API key and you're live.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-shimmer glow-border group relative rounded-xl p-6 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:bg-blue-600/20 transition">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm">{f.title}</h3>
                <p className="text-[#555] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs text-[#444] uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-black mb-4">Simple, Indian pricing</h2>
            <p className="text-[#555] text-sm">Start free. No credit card. Upgrade when you scale.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {PLANS.map((p, i) => (
              <div key={i} className={`card-shimmer glow-border relative rounded-xl p-6 flex flex-col border transition-all duration-300 ${p.popular ? 'border-blue-500/40 bg-blue-500/[0.04] shadow-lg shadow-blue-500/10' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-lg shadow-blue-500/30">Most Popular</div>
                )}
                <div className="text-[#555] text-xs mb-3 uppercase tracking-widest font-medium">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className="text-[#444] text-sm">{p.period}</span>
                </div>
                {p.yearly ? <div className="text-xs text-[#444] mb-6">{p.yearly} · 2 months free</div> : <div className="mb-6"/>}
                <ul className="space-y-3 flex-1 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-[#666]">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={`${D}/signup`} className={`w-full py-2.5 rounded-lg text-sm font-semibold transition text-center ${p.popular ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30' : 'border border-white/[0.08] hover:border-white/20 text-[#666] hover:text-white'}`}>
                  {p.price === '₹0' ? 'Start for free' : 'Get started'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="waitlist" className="py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-14 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-violet-600/10 pointer-events-none" />
            <h2 className="relative text-4xl font-black mb-4">Start building today</h2>
            <p className="relative text-[#555] mb-10">Join our beta. Free for 3 months. No credit card.</p>
            {submitted ? (
              <div className="inline-flex items-center gap-2 text-green-400 bg-green-950/30 border border-green-900/40 px-5 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                You're on the list! We'll reach out soon.
              </div>
            ) : (
              <form onSubmit={submit} className="relative flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-blue-500/60 text-white placeholder-[#333] text-sm transition"/>
                <button type="submit" className="btn-glow bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-3 rounded-lg transition whitespace-nowrap shadow-lg shadow-blue-600/25">Join beta</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#444]">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-lg tracking-tight">Iceberg</span>
            <span className="text-[#222]">·</span>
            <span>Vector search for India</span>
          </div>
          <div className="flex gap-6">
            {['Privacy','Terms','Docs','Status'].map(l=><a key={l} href="#" className="hover:text-white transition">{l}</a>)}
            <a href="mailto:hello@icebergdb.io" className="hover:text-white transition">Contact</a>
          </div>
          <div>© 2026 Iceberg</div>
        </div>
      </footer>

    </div>
  )
}

function CodeBlock() {
  const [tab, setTab] = useState('python')

  const highlighted = {
    python: (
      <code>
        <span className="token-keyword">from</span> <span className="token-plain"> qora </span><span className="token-keyword">import</span> <span className="token-fn">Client</span>{'\n\n'}
        <span className="token-var">client</span><span className="token-plain"> = </span><span className="token-fn">Client</span><span className="token-plain">(</span><span className="token-key">api_key</span><span className="token-plain">=</span><span className="token-string">"qr_your_key"</span><span className="token-plain">)</span>{'\n\n'}
        <span className="token-comment"># Create a collection</span>{'\n'}
        <span className="token-var">client</span><span className="token-plain">.</span><span className="token-fn">create_collection</span><span className="token-plain">(</span><span className="token-string">"my_docs"</span><span className="token-plain">)</span>{'\n\n'}
        <span className="token-comment"># Index text or upload PDF</span>{'\n'}
        <span className="token-var">client</span><span className="token-plain">.</span><span className="token-fn">upload</span><span className="token-plain">(</span><span className="token-string">"my_docs"</span><span className="token-plain">, </span><span className="token-string">"handbook.pdf"</span><span className="token-plain">)</span>{'\n'}
        <span className="token-var">client</span><span className="token-plain">.</span><span className="token-fn">index_text</span><span className="token-plain">(</span><span className="token-string">"my_docs"</span><span className="token-plain">, </span><span className="token-string">"Return policy: 30 days."</span><span className="token-plain">)</span>{'\n\n'}
        <span className="token-comment"># Hybrid search</span>{'\n'}
        <span className="token-var">results</span><span className="token-plain"> = </span><span className="token-var">client</span><span className="token-plain">.</span><span className="token-fn">search</span><span className="token-plain">(</span><span className="token-string">"my_docs"</span><span className="token-plain">, </span><span className="token-string">"can I return my order?"</span><span className="token-plain">)</span>{'\n'}
        <span className="token-keyword">for</span><span className="token-plain"> r </span><span className="token-keyword">in</span><span className="token-plain"> results:</span>{'\n'}
        {'    '}<span className="token-fn">print</span><span className="token-plain">(r.</span><span className="token-key">score</span><span className="token-plain">, r.</span><span className="token-key">text</span><span className="token-plain">)</span>
      </code>
    ),
    javascript: (
      <code>
        <span className="token-keyword">import</span><span className="token-plain"> {'{ Client }'} </span><span className="token-keyword">from</span><span className="token-string"> 'Iceberg'</span>{'\n\n'}
        <span className="token-keyword">const</span><span className="token-plain"> client = </span><span className="token-keyword">new</span><span className="token-fn"> Client</span><span className="token-plain">({'{ '}</span><span className="token-key">apiKey</span><span className="token-plain">: </span><span className="token-string">'qr_your_key'</span><span className="token-plain">{' }'})</span>{'\n\n'}
        <span className="token-keyword">await</span><span className="token-plain"> client.</span><span className="token-fn">createCollection</span><span className="token-plain">(</span><span className="token-string">'my_docs'</span><span className="token-plain">)</span>{'\n'}
        <span className="token-keyword">await</span><span className="token-plain"> client.</span><span className="token-fn">indexText</span><span className="token-plain">(</span><span className="token-string">'my_docs'</span><span className="token-plain">, </span><span className="token-string">'Return policy: 30 days.'</span><span className="token-plain">)</span>{'\n\n'}
        <span className="token-keyword">const</span><span className="token-plain"> results = </span><span className="token-keyword">await</span><span className="token-plain"> client.</span><span className="token-fn">search</span><span className="token-plain">(</span><span className="token-string">'my_docs'</span><span className="token-plain">, </span><span className="token-string">'return order'</span><span className="token-plain">)</span>{'\n'}
        <span className="token-plain">results.</span><span className="token-fn">forEach</span><span className="token-plain">(r {'=>'} console.</span><span className="token-fn">log</span><span className="token-plain">(r.</span><span className="token-key">score</span><span className="token-plain">, r.</span><span className="token-key">text</span><span className="token-plain">))</span>
      </code>
    ),
    go: (
      <code>
        <span className="token-keyword">package</span><span className="token-plain"> main</span>{'\n\n'}
        <span className="token-keyword">import</span><span className="token-string"> "github.com/qora-db/qora-go"</span>{'\n\n'}
        <span className="token-keyword">func</span><span className="token-fn"> main</span><span className="token-plain">() {'{'}</span>{'\n'}
        {'    '}<span className="token-var">client</span><span className="token-plain"> := qora.</span><span className="token-fn">NewClient</span><span className="token-plain">(</span><span className="token-string">"qr_your_key"</span><span className="token-plain">)</span>{'\n'}
        {'    '}<span className="token-var">client</span><span className="token-plain">.</span><span className="token-fn">CreateCollection</span><span className="token-plain">(</span><span className="token-string">"my_docs"</span><span className="token-plain">)</span>{'\n'}
        {'    '}<span className="token-var">results</span><span className="token-plain">, _ := client.</span><span className="token-fn">Search</span><span className="token-plain">(</span><span className="token-string">"my_docs"</span><span className="token-plain">, </span><span className="token-string">"return"</span><span className="token-plain">, </span><span className="token-num">5</span><span className="token-plain">)</span>{'\n'}
        {'    '}<span className="token-keyword">for</span><span className="token-plain"> _, r := </span><span className="token-keyword">range</span><span className="token-plain"> results {'{'}</span>{'\n'}
        {'        '}<span className="token-plain">fmt.</span><span className="token-fn">Println</span><span className="token-plain">(r.</span><span className="token-key">Score</span><span className="token-plain">, r.</span><span className="token-key">Text</span><span className="token-plain">)</span>{'\n'}
        {'    '}<span className="token-plain">{'}'}</span>{'\n'}
        <span className="token-plain">{'}'}</span>
      </code>
    ),
    curl: (
      <code>
        <span className="token-fn">curl</span><span className="token-plain"> -X POST https://api.icebergdb.io/search \</span>{'\n'}
        <span className="token-plain">  -H </span><span className="token-string">"X-API-Key: qr_your_key"</span><span className="token-plain"> \</span>{'\n'}
        <span className="token-plain">  -H </span><span className="token-string">"Content-Type: application/json"</span><span className="token-plain"> \</span>{'\n'}
        <span className="token-plain">  -d </span><span className="token-string">{"'{"}</span>{'\n'}
        <span className="token-plain">    </span><span className="token-key">"collection"</span><span className="token-plain">: </span><span className="token-string">"my_docs"</span><span className="token-plain">,</span>{'\n'}
        <span className="token-plain">    </span><span className="token-key">"query"</span><span className="token-plain">: </span><span className="token-string">"can I return my order?"</span><span className="token-plain">,</span>{'\n'}
        <span className="token-plain">    </span><span className="token-key">"top_k"</span><span className="token-plain">: </span><span className="token-num">5</span>{'\n'}
        <span className="token-string">{"  }'"}</span>
      </code>
    ),
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0c10] shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex gap-1.5 mr-3">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {[['python','Python'],['javascript','JS'],['go','Go'],['curl','cURL']].map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k)} className={`px-3 py-1 text-xs rounded-md transition font-medium ${tab===k ? 'bg-white/[0.08] text-white' : 'text-[#444] hover:text-[#888]'}`}>{l}</button>
        ))}
      </div>
      <pre className="p-6 text-sm font-mono overflow-x-auto leading-7 whitespace-pre">
        {highlighted[tab]}
      </pre>
    </div>
  )
}


function GHIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
}

const FEATURES = [
  { title: 'India Hosted', desc: 'All data in Mumbai. DPDP Act compliant. <20ms latency for Indian users. No data leaves India.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg> },
  { title: 'Hybrid Search', desc: 'Dense vectors + BM25 keyword combined via RRF. Better recall. Configurable alpha per query.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg> },
  { title: 'Agent Memory', desc: '4 types — short-term, long-term, episodic, semantic. TTL auto-expire. One API for all memory.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/></svg> },
  { title: 'RAG Assistant', desc: 'Upload docs, get a chatbot. Website widget + WhatsApp. Works with OpenAI and Gemini.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Zm3-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm3.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3.75 4.5a3 3 0 0 1 3 0"/></svg> },
  { title: 'Never Pauses', desc: 'Free tier stays active forever. No idle timeouts. Your dev environment is always ready.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg> },
  { title: 'Backup & Restore', desc: 'One-click collection backup. Restore to any point. Full vector export — zero lock-in.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg> },
  { title: 'RBAC + API Keys', desc: 'Admin, read-write, read-only keys. Revoke any key instantly. Per-project scoping.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z"/></svg> },
  { title: 'BYOC', desc: 'Deploy on your own server — cloud or on-premise. Banks, hospitals, enterprises.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 6 0m-6 0H3m16.5 0a3 3 0 0 0 3-3m-3 3a3 3 0 1 1-6 0m6 0h1.5m-1.5-6a3 3 0 0 0-3-3m0 0a3 3 0 0 0-3 3m3-3V3m0 18v-1.5"/></svg> },
  { title: '6 SDKs', desc: 'Python, JS, Go, Java, .NET, Rust. LangChain and LlamaIndex support built in.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25z"/></svg> },
]

const PLANS = [
  { name:'Free', price:'₹0', period:'', yearly:null, features:['500K vectors','1,000 queries/day','1 GB storage','Unlimited collections','2 projects','Community support','Never pauses'] },
  { name:'Starter', price:'₹799', period:'/mo', yearly:'₹7,990/yr', features:['5M vectors','10K queries/day','5 GB storage','Unlimited collections','5 projects','Email support','Never pauses'] },
  { name:'Growth', price:'₹3,999', period:'/mo', yearly:'₹39,990/yr', popular:true, features:['25M vectors','100K queries/day','30 GB storage','Unlimited collections','15 projects','Priority support','Metadata filters'] },
  { name:'Scale', price:'₹12,999', period:'/mo', yearly:'₹1,29,990/yr', features:['100M vectors','500K queries/day','100 GB storage','Unlimited projects','Dedicated Slack','99.9% SLA'] },
]
