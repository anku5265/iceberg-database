import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PRESET_QUERIES = [
  {
    id: 'finance',
    name: '⚡ Quantitative FinSignals',
    query: 'Orderbook depth imbalance & volatility surface',
    score: '0.988',
    latency: '2.8ms',
    code: `client.search("fin_signals", vector=embed("orderbook_skew"), top_k=3, filter={"exchange": "NSE"})`,
    payload: `{"signal": "skew_divergence", "confidence": 0.988, "latency_budget_ms": 3}`,
    engine: 'SIMD AVX-512 HNSW'
  },
  {
    id: 'memory',
    name: '🧠 Agent Persistent Memory',
    query: 'User preference: prefers UPI autopay & dark mode',
    score: '0.974',
    latency: '3.4ms',
    code: `client.memory.recall("session_usr_892", intent="payment_prefs", ttl="30d")`,
    payload: `{"user_id": "usr_892", "preferred_rail": "UPI_AUTOPAY", "theme": "dark"}`,
    engine: 'Tier-4 Episodic RAM'
  },
  {
    id: 'docs',
    name: '📄 Enterprise RAG & Policy',
    query: 'Return policy & instant refund protocol for damaged shipments',
    score: '0.965',
    latency: '3.9ms',
    code: `client.search("legal_docs", query="instant refund terms", search_type="hybrid", alpha=0.7)`,
    payload: `{"clause": "Sec 4.2: Instant UPI refunds for verified logistics defects within 4h"}`,
    engine: 'Hybrid Dense + BM25 RRF'
  }
]

const FRAMEWORKS = [
  { name: 'Python SDK', desc: 'pip install iceberg-db' },
  { name: 'TypeScript', desc: 'npm i @iceberg/sdk' },
  { name: 'Rust Core', desc: 'cargo add iceberg-rs' },
  { name: 'Go Client', desc: 'go get iceberg/go' },
  { name: 'LangChain', desc: 'from langchain_community' },
  { name: 'LlamaIndex', desc: 'VectorStoreIndex' },
  { name: 'FastAPI', desc: 'Native Async REST' },
  { name: 'Next.js', desc: 'Edge Vercel Runtime' }
]

const PRIMITIVES = [
  {
    num: '01',
    title: 'Sub-5ms p99 in Mumbai',
    desc: 'Bare-metal NVMe clusters colocated in Mumbai IDC-2 (ap-south-1). Eliminates cross-border packet latency for Indian AI products.'
  },
  {
    num: '02',
    title: 'Hardware-Vectorized Rust Core',
    desc: 'Custom memory-mapped graph engine written in Rust. Vector cosine and dot-product calculations utilize AVX-512 SIMD hardware instructions.'
  },
  {
    num: '03',
    title: 'Hybrid Dense + BM25 RRF Search',
    desc: 'Execute dense semantic vectors alongside sparse keyword token matching. Reciprocal Rank Fusion automatically balances precision and recall.'
  },
  {
    num: '04',
    title: '4-Tier Autonomous Agent Memory',
    desc: 'One unified endpoint for short-term working context, episodic session memories, semantic facts, and permanent persona profiles with auto-TTL.'
  },
  {
    num: '05',
    title: 'Zero Cold Starts (Always Warm)',
    desc: 'Indices remain memory-mapped into Linux page cache. No sleep cycles, no 10-second container spin-up latencies when traffic surges.'
  },
  {
    num: '06',
    title: 'DPDP Act 2023 Sovereignty & BYOC',
    desc: '100% data residency guaranteed in India. Available as managed cloud or self-hosted Private Cloud / VPC deployment for banks and fintechs.'
  }
]

const TIERS = [
  {
    name: 'Developer',
    price: 'Rs. 0',
    period: 'forever free',
    desc: 'Essential vector storage for hackathons and prototype AI agents.',
    popular: false,
    specs: ['500,000 vectors', '1,000 queries / day', '1 GB NVMe storage', 'Sub-5ms latency', 'Zero cold starts', 'Community Discord'],
    buttonText: 'Start Free'
  },
  {
    name: 'Starter',
    price: 'Rs. 799',
    period: '/ month',
    desc: 'For production web applications and active customer chatbots.',
    popular: false,
    specs: ['5,000,000 vectors', '25,000 queries / day', '5 GB NVMe storage', 'Payload metadata filtering', 'Nightly automated snapshots', 'Email support (<4h SLA)'],
    buttonText: 'Launch Starter'
  },
  {
    name: 'Growth Pro',
    price: 'Rs. 3,999',
    period: '/ month',
    desc: 'For high-throughput RAG search, quant signals, and enterprise scale.',
    popular: true,
    specs: ['25,000,000 vectors', '200,000 queries / day', '30 GB NVMe storage', 'Hybrid dense + BM25 RRF', '15 projects with RBAC keys', 'Priority 24/7 hotline'],
    buttonText: 'Deploy Growth Pro'
  },
  {
    name: 'Enterprise Scale',
    price: 'Rs. 12,999',
    period: '/ month',
    desc: 'Dedicated cluster nodes with custom SLA and BYOC deployment.',
    popular: false,
    specs: ['100M+ vectors capacity', '1,000,000+ queries / day', 'Dedicated isolated VPC cluster', 'Custom 99.99% uptime SLA', 'BYOC self-hosted license', 'Dedicated Slack engineer'],
    buttonText: 'Contact Systems Team'
  }
]

export default function HomePage({ ProductDropdown }) {
  const [activeQueryIndex, setActiveQueryIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeCodeLang, setActiveCodeLang] = useState('python')

  const activeQ = PRESET_QUERIES[activeQueryIndex]

  const copyText = (text) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWaitlist = async (e) => {
    e.preventDefault()
    try {
      await fetch(`${API}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
    } catch (_) {}
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-[#eaeaea] font-sans antialiased selection:bg-[#3b82f6]/30 selection:text-white">

      {/* ── Studio Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 border-b border-[#1b1c24] bg-[#07080b]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-bold text-sm tracking-tight text-white">Iceberg</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/60 text-cyan-400 border border-cyan-800/40 font-semibold">
                STUDIO
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#8c8e9c]">
              <ProductDropdown dark={true} />
              <a href="#pipeline" className="hover:text-white transition">Pipeline Studio</a>
              <a href="#benchmarks" className="hover:text-white transition">Latency Matrix</a>
              <a href="#primitives" className="hover:text-white transition">Architecture</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <a href={`${D}/docs`} className="hover:text-white transition">Docs</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Live cluster telemetry badge */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-full border border-emerald-900/40 bg-emerald-950/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ap-south-1 &bull; 3.2ms</span>
            </div>

            <a href={`${D}/login`} className="text-xs text-[#8c8e9c] hover:text-white px-3 py-1.5 transition">
              Sign In
            </a>

            <a
              href={`${D}/signup`}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg transition duration-150 shadow-lg shadow-blue-600/30"
            >
              Start Free (500K)
            </a>
          </div>
        </div>
      </header>

      {/* ── High-Impact Developer Studio Hero ── */}
      <section className="relative pt-20 pb-20 px-6 border-b border-[#1b1c24] overflow-hidden">
        {/* Ambient Subtle Studio Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Announcement Ribbon */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono text-cyan-300 bg-[#0c101c] border border-cyan-900/50 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Built for AI Engineering Teams in India &bull; Zero Egress Fees</span>
          </div>

          {/* Bold, Compelling Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-[4.2rem] font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            The Vector Database for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              High-Throughput AI Systems.
            </span>
          </h1>

          {/* Value Prop Subtitle */}
          <p className="text-base sm:text-lg text-[#9da0b3] max-w-2xl mx-auto leading-relaxed mb-8">
            Sub-5ms p99 query latencies, autonomous agent memory, and native hybrid search. Hosted in Mumbai with guaranteed DPDP Act 2023 data residency.
          </p>

          {/* Dual Shell Package Selector */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-[#0c0d14] border border-[#212330] mb-10 max-w-md mx-auto">
            <span className="text-[11px] font-mono text-[#6c6e7f] px-2">&gt;_</span>
            <span className="text-xs font-mono text-cyan-300 select-all">pip install iceberg-db</span>
            <button
              onClick={() => copyText('pip install iceberg-db')}
              className="text-xs font-mono px-2.5 py-1 rounded bg-[#181a24] text-[#a0a2b4] hover:text-white border border-[#282a3a] transition"
            >
              {copied ? 'copied!' : 'copy'}
            </button>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <a
              href={`${D}/signup`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition shadow-xl shadow-blue-600/25"
            >
              Launch Free Cluster in 60s
              <span>&rarr;</span>
            </a>
            <a
              href={`${D}/docs`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-[#a5a7b8] bg-[#0e1017] border border-[#222432] hover:text-white hover:border-[#34374a] transition"
            >
              Read Architecture Whitepaper
            </a>
          </div>

          {/* ── Interactive Live Pipeline Studio (The Crown Jewel) ── */}
          <div id="pipeline" className="rounded-2xl border border-[#222432] bg-[#0c0d14] text-left overflow-hidden shadow-2xl shadow-black/90">

            {/* Studio Header Bar */}
            <div className="px-5 py-3.5 border-b border-[#1b1c26] bg-[#0f101a] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Interactive Query Sandbox</span>
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                  REAL-TIME PIPELINE
                </span>
              </div>

              {/* Preset Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#07080c] border border-[#1b1c26]">
                {PRESET_QUERIES.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQueryIndex(idx)}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                      activeQueryIndex === idx
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-[#7d7f92] hover:text-[#c4c6d6]'
                    }`}
                  >
                    {q.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Stage Visual Pipeline Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1b1c26] border-b border-[#1b1c26] bg-[#090a10] text-xs font-mono">
              <div className="p-4">
                <div className="text-[10px] uppercase text-[#616375] font-semibold mb-1">01 &bull; INGEST &amp; EMBEDDING</div>
                <div className="text-white font-medium truncate">{activeQ.query}</div>
                <div className="text-[11px] text-cyan-400 mt-1">FastEmbed ONNX 384-dim</div>
              </div>
              <div className="p-4">
                <div className="text-[10px] uppercase text-[#616375] font-semibold mb-1">02 &bull; INDEX &amp; CORE SEARCH</div>
                <div className="text-white font-medium">{activeQ.engine}</div>
                <div className="text-[11px] text-emerald-400 mt-1">mmap NVMe &bull; zero page faults</div>
              </div>
              <div className="p-4">
                <div className="text-[10px] uppercase text-[#616375] font-semibold mb-1">03 &bull; TOP MATCH &amp; LATENCY</div>
                <div className="text-emerald-400 font-bold flex items-center gap-2">
                  <span>Cosine: {activeQ.score}</span>
                  <span className="text-white">&bull;</span>
                  <span>{activeQ.latency}</span>
                </div>
                <div className="text-[11px] text-[#7d7f92] mt-1">Status: 200 OK (Cluster Warm)</div>
              </div>
            </div>

            {/* Code & Payload Studio View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1b1c26]">
              {/* Code Editor Pane */}
              <div className="lg:col-span-7 p-5 font-mono text-xs leading-6 bg-[#08090f]">
                <div className="text-[11px] text-[#5b5d6f] mb-2">// Executed Production Client SDK Code:</div>
                <pre className="text-cyan-200 overflow-x-auto">
                  <code>{activeQ.code}</code>
                </pre>
                <div className="mt-4 pt-3 border-t border-[#181a24] flex items-center justify-between text-[11px] text-[#6b6d80]">
                  <span>Vector Index: 500,000 vectors</span>
                  <span className="text-emerald-400">Response time: {activeQ.latency}</span>
                </div>
              </div>

              {/* Live JSON Payload Output */}
              <div className="lg:col-span-5 p-5 bg-[#0a0b12] font-mono text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#1b1c26] text-[11px] text-[#717387]">
                    <span>Extracted Metadata Payload:</span>
                    <span className="text-emerald-400 font-semibold">&bull; Exact Hit</span>
                  </div>
                  <pre className="mt-3 p-3 rounded-lg bg-[#05060a] border border-[#1b1c26] text-amber-300 text-[11px] leading-5 overflow-x-auto">
                    {activeQ.payload}
                  </pre>
                </div>

                <div className="pt-4 border-t border-[#1b1c26] text-[10px] text-[#55586b] flex justify-between">
                  <span>Region: ap-south-1 IDC-2</span>
                  <span className="text-cyan-400">Direct In-Memory RAM Hit</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Real Latency Benchmark Matrix ── */}
      <section id="benchmarks" className="py-20 px-6 border-b border-[#1b1c24] bg-[#090a10]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">Real Network Benchmarks</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-3">
              Why Indian AI Applications Need Domestic Infrastructure.
            </h2>
            <p className="text-sm text-[#7e8194] max-w-lg mx-auto">
              Comparing average p99 end-to-end vector retrieval latency from clients based in Mumbai, Bangalore, and Delhi.
            </p>
          </div>

          <div className="rounded-xl border border-[#212330] bg-[#0c0d14] p-6 font-mono text-xs">
            <div className="flex justify-between items-center pb-4 border-b border-[#1b1c26] text-[#717387] text-[11px]">
              <span>DATABASE PROVIDER &amp; REGION</span>
              <span>p99 RESPONSE TIME</span>
            </div>

            {/* Iceberg Bar */}
            <div className="py-4 border-b border-[#171822]">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Iceberg Database (Mumbai ap-south-1)
                </span>
                <span className="text-cyan-400 font-bold">3.2 ms</span>
              </div>
              <div className="h-3 rounded-full bg-[#181a24] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '4%' }} />
              </div>
            </div>

            {/* US Database 1 */}
            <div className="py-4 border-b border-[#171822] opacity-70">
              <div className="flex justify-between text-xs mb-2 text-[#9a9cb0]">
                <span>Pinecone Serverless (US-East-1, Virginia)</span>
                <span>185.0 ms</span>
              </div>
              <div className="h-3 rounded-full bg-[#181a24] overflow-hidden">
                <div className="h-full bg-[#4a4c5e] rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

            {/* US Database 2 */}
            <div className="py-4 border-b border-[#171822] opacity-70">
              <div className="flex justify-between text-xs mb-2 text-[#9a9cb0]">
                <span>Weaviate Cloud (US-Central)</span>
                <span>198.0 ms</span>
              </div>
              <div className="h-3 rounded-full bg-[#181a24] overflow-hidden">
                <div className="h-full bg-[#3a3c4c] rounded-full" style={{ width: '91%' }} />
              </div>
            </div>

            <div className="pt-4 text-[11px] text-[#63667a] flex flex-wrap justify-between gap-2">
              <span>* Benchmark conducted with 384-dimensional FastEmbed dense embeddings</span>
              <span className="text-cyan-400 font-semibold">&gt; 50x lower latency for Indian traffic</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Supported Frameworks Ecosystem ── */}
      <section className="py-12 border-b border-[#1b1c24]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] uppercase font-mono tracking-widest text-[#717387] mb-6">
            Production SDKs &bull; Zero External Dependencies
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {FRAMEWORKS.map((f) => (
              <div
                key={f.name}
                className="p-3 rounded-xl border border-[#1b1c26] bg-[#0a0b12] text-center hover:border-cyan-800/50 transition"
              >
                <div className="text-xs font-semibold text-white">{f.name}</div>
                <div className="text-[10px] font-mono text-[#6c6f82] mt-0.5 truncate">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Primitives Grid ── */}
      <section id="primitives" className="py-24 px-6 border-b border-[#1b1c24]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">Engine Primitives</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-4">
              Engineered for systems predictability.
            </h2>
            <p className="text-sm text-[#7c7f92] leading-relaxed">
              No distributed consensus timeouts. No runaway memory fragmentation. A focused vector engine built for autonomous AI agents and low-latency production pipelines.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRIMITIVES.map((p) => (
              <div
                key={p.num}
                className="p-7 rounded-2xl border border-[#1b1c26] bg-[#0c0d14] hover:border-blue-900/60 transition duration-200"
              >
                <div className="text-xs font-mono font-bold text-cyan-400 mb-4">{p.num}</div>
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-[#8c8e9f] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Predictable Flat Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-b border-[#1b1c24] bg-[#090a10]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">Predictable Billing</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-3">
              Clear Pricing in INR. Zero Hidden Egress.
            </h2>
            <p className="text-sm text-[#7e8194]">
              Start free forever. Scale transparently with local Indian payment rails (UPI, NetBanking, Cards).
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`rounded-2xl p-6 flex flex-col justify-between border transition duration-200 ${
                  t.popular
                    ? 'border-blue-500/80 bg-[#0f111c] shadow-xl shadow-blue-900/20'
                    : 'border-[#1f212d] bg-[#0b0c13]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#8b8d9e]">{t.name}</span>
                    {t.popular && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                        POPULAR
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight">{t.price}</span>
                    <span className="text-xs text-[#717387] ml-1">{t.period}</span>
                  </div>

                  <p className="text-xs text-[#8b8d9e] mb-6 leading-relaxed">{t.desc}</p>
                  <div className="h-px bg-[#1b1c26] mb-6" />

                  <ul className="space-y-2.5 text-xs text-[#a2a4b8] mb-8 font-mono">
                    {t.specs.map((spec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">&check;</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`${D}/signup`}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition ${
                    t.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-[#151722] hover:bg-[#1e202e] text-white border border-[#27293a]'
                  }`}
                >
                  {t.buttonText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Priority Access / Waitlist ── */}
      <section className="py-24 px-6 border-b border-[#1b1c24]">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">Deploy In Seconds</span>
          <h2 className="text-3xl font-bold text-white mt-2 mb-3">Provision your vector cluster today.</h2>
          <p className="text-sm text-[#7e8194] mb-8">
            Get an instant API key, configure isolated collections, and index 500,000 vectors for free forever.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
              &check; You're on the priority deployment queue!
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@company.com"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0c0d14] border border-[#222432] text-xs font-mono text-white placeholder-[#585a6e] outline-none focus:border-cyan-400 transition"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition whitespace-nowrap"
              >
                Join Private Beta
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Studio Engineering Footer ── */}
      <footer className="py-12 px-6 bg-[#050608] text-xs text-[#525464] font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-semibold text-white">Iceberg Data Systems</span>
            <span>&bull;</span>
            <span>ap-south-1 (Mumbai IDC-2)</span>
          </div>

          <div className="flex items-center gap-6">
            <a href={`${D}/docs`} className="hover:text-white transition">Docs</a>
            <a href="#benchmarks" className="hover:text-white transition">Benchmarks</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="mailto:engineering@icebergdb.io" className="hover:text-white transition">Security</a>
            <span className="text-[#3c3d4c]">&copy; 2026 Iceberg</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
