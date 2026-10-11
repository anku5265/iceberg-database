import { useState } from 'react'
import { Link } from 'react-router-dom'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CONSOLE_TABS = [
  { id: 'query', label: 'Vector Query Engine' },
  { id: 'memory', label: 'Agent Memory Store' },
  { id: 'compliance', label: 'DPDP Security & Audit' }
]

const SAMPLE_QUERIES = [
  {
    title: 'Quantitative Finance & Market Signals',
    query: 'Orderbook imbalance & statistical arbitrage vectors',
    topMatch: 'NSE_EQ_FUT_SKEW_094',
    similarity: '0.9892',
    latency: '2.8ms',
    metadata: { exchange: 'NSE', instrument: 'NIFTY50_OPT', confidence: 0.989, venue: 'Mumbai IDC' }
  },
  {
    title: 'Autonomous Agent User Profile Context',
    query: 'User preference: checkout via UPI autopay & dark theme',
    topMatch: 'SESSION_USR_CTX_8920',
    similarity: '0.9765',
    latency: '3.1ms',
    metadata: { user_id: 'usr_8920', payment_rail: 'UPI_2.0', retention_ttl: '30_DAYS', tier: 'EPISODIC' }
  },
  {
    title: 'Enterprise Document & Policy RAG',
    query: 'Return window & instant refund protocol for damaged shipments',
    topMatch: 'POLICY_LOGISTICS_CLAUSE_4',
    similarity: '0.9680',
    latency: '3.6ms',
    metadata: { category: 'LOGISTICS', compliance: 'DPDP_2023', policy_ver: '2026.4', auto_refund: true }
  }
]

const COMPARISON = [
  {
    metric: 'Average End-to-End Query Latency',
    iceberg: '3.2 ms (Mumbai Bare-Metal)',
    usProviders: '185.0 ms (US-East trans-Atlantic)',
    selfHosted: '15.0 - 45.0 ms (Variable)'
  },
  {
    metric: 'Data Residency & DPDP Act 2023',
    iceberg: '100% Guaranteed Domestic (Mumbai)',
    usProviders: 'Cross-Border Cloud Egress Risk',
    selfHosted: 'Manual VPC Configuration'
  },
  {
    metric: 'Cold-Start Latency',
    iceberg: '0 ms (mmap NVMe Always Warm)',
    usProviders: '15s - 30s Serverless Spin-up',
    selfHosted: 'High Idle Cloud Server Costs'
  },
  {
    metric: 'Currency & Enterprise Invoicing',
    iceberg: 'Flat INR + GST Input Tax Credit',
    usProviders: 'USD Pricing + 3.5% Forex Markups',
    selfHosted: 'Complex Cloud Infrastructure Bills'
  },
  {
    metric: 'Hybrid Search (Dense + BM25 RRF)',
    iceberg: 'Native Hardware-Vectorized Core',
    usProviders: 'Requires Separate Add-on Engine',
    selfHosted: 'Requires Multi-Database Ops'
  }
]

const WORKLOADS = [
  {
    badge: 'CAPITAL MARKETS & FINTECH',
    title: 'Low-Latency Quantitative Alpha',
    desc: 'Execute real-time vector embeddings over high-frequency tick data, orderbook depth imbalance, and volatility surfaces with guaranteed sub-5ms execution.'
  },
  {
    badge: 'AUTONOMOUS AI AGENTS',
    title: 'Persistent 4-Tier Memory Core',
    desc: 'Equip LLM agents with episodic event logs, user preference context, and semantic facts that persist across sessions with automated background TTL pruning.'
  },
  {
    badge: 'ENTERPRISE RAG & LEGAL',
    title: 'High-Precision Knowledge Retrieval',
    desc: 'Index millions of contracts, medical filings, and enterprise policies. Combines 384-dimensional dense vectors with BM25 keyword matching for zero hallucination.'
  }
]

const PRICING = [
  {
    tier: 'Developer',
    price: 'Rs. 0',
    term: 'forever free',
    desc: 'For testing, indie developers, and prototype AI agent builds.',
    popular: false,
    items: ['500,000 vectors', '1,000 queries / day', '1 GB NVMe persistent storage', 'Sub-5ms query latency', 'Zero cold starts (never sleeps)', 'Community engineering forum'],
    cta: 'Deploy Free Cluster'
  },
  {
    tier: 'Starter',
    price: 'Rs. 799',
    term: '/ month',
    desc: 'For production microservices and active customer applications.',
    popular: false,
    items: ['5,000,000 vectors', '25,000 queries / day', '5 GB NVMe persistent storage', 'Payload metadata filtering', 'Nightly automated snapshots', 'Email support (<4h response)'],
    cta: 'Launch Starter'
  },
  {
    tier: 'Growth Pro',
    price: 'Rs. 3,999',
    term: '/ month',
    desc: 'For high-scale RAG systems, quant desks, and scaling startups.',
    popular: true,
    items: ['25,000,000 vectors', '200,000 queries / day', '30 GB NVMe persistent storage', 'Hybrid dense + BM25 RRF search', '15 projects with scoped RBAC keys', 'Priority 24/7 technical desk', 'Dedicated read replica'],
    cta: 'Deploy Growth Pro'
  },
  {
    tier: 'Enterprise Scale',
    price: 'Rs. 12,999',
    term: '/ month',
    desc: 'Dedicated VPC instances, custom SLAs, and on-premise BYOC.',
    popular: false,
    items: ['100M+ vector headroom', '1,000,000+ queries / day', 'Dedicated isolated VPC cluster', 'Custom 99.99% uptime SLA', 'BYOC on-premise deployment option', 'DPDP Act compliance audit pack', 'Dedicated Slack systems architect'],
    cta: 'Contact Architecture Team'
  }
]

export default function HomePage({ ProductDropdown }) {
  const [activeTab, setActiveTab] = useState('query')
  const [activeQueryIndex, setActiveQueryIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const activeQuery = SAMPLE_QUERIES[activeQueryIndex]

  const copyCode = (text = 'pip install iceberg-db') => {
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
    <div className="min-h-screen bg-[#090a0e] text-[#f1f1f4] font-sans antialiased selection:bg-blue-600/30 selection:text-white">

      {/* ── Enterprise Header ── */}
      <header className="sticky top-0 z-50 border-b border-[#1b1c24] bg-[#090a0e]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-600/20">
                <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-bold text-base tracking-tight text-white">Iceberg</span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#73758a] px-2 py-0.5 rounded bg-[#13151f] border border-[#212330]">
                ENTERPRISE
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#8c8e9f]">
              <ProductDropdown dark={true} />
              <a href="#console" className="hover:text-white transition">Console Overview</a>
              <a href="#comparison" className="hover:text-white transition">Why Iceberg</a>
              <a href="#workloads" className="hover:text-white transition">Workloads</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <a href={`${D}/docs`} className="hover:text-white transition">Documentation</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a href={`${D}/login`} className="text-xs font-medium text-[#8c8e9f] hover:text-white px-3 py-1.5 transition">
              Console Sign In
            </a>
            <a
              href={`${D}/signup`}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition duration-150 shadow-md shadow-blue-600/25"
            >
              Deploy Free Cluster
            </a>
          </div>
        </div>
      </header>

      {/* ── Enterprise Hero Section ── */}
      <section className="pt-24 pb-20 px-6 border-b border-[#1b1c24] relative">
        <div className="max-w-5xl mx-auto text-center">

          {/* Operational Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono text-[#a1a3b8] bg-[#10121b] border border-[#232638] mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Region: ap-south-1 (Mumbai IDC-2) &bull; 99.99% Uptime SLA</span>
            <span className="text-[#55586d]">&rarr;</span>
          </div>

          {/* Authoritative Corporate Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[4.5rem] font-bold tracking-tight text-white leading-[1.07] max-w-4xl mx-auto mb-6">
            The Vector Database <br />
            for Enterprise AI.
          </h1>

          {/* Technical Value Proposition */}
          <p className="text-base sm:text-lg text-[#8f92a6] max-w-2xl mx-auto leading-relaxed mb-10">
            Iceberg is the serverless vector database engineered for low latency, scale, and compliance. Query billions of vectors with sub-5ms latency and guaranteed data sovereignty on Indian soil.
          </p>

          {/* Action CTAs & CLI Install */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href={`${D}/signup`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30"
            >
              Deploy Free Cluster &rarr;
            </a>

            <div
              onClick={() => copyCode('pip install iceberg-db')}
              className="w-full sm:w-auto inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#0e1017] border border-[#232638] text-xs font-mono text-[#8c8e9f] hover:border-[#383d58] transition cursor-pointer"
            >
              <span>$ pip install iceberg-db</span>
              <span className="text-[11px] text-cyan-400 font-semibold">{copied ? 'copied' : 'copy'}</span>
            </div>

            <a
              href={`${D}/docs`}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-lg text-xs font-medium text-[#8c8e9f] bg-transparent border border-[#212330] hover:text-white hover:border-[#35394d] transition"
            >
              Schedule Architecture Call
            </a>
          </div>

          {/* ── Enterprise Cloud Console (Hero Centerpiece) ── */}
          <div id="console" className="rounded-xl border border-[#212330] bg-[#0c0e14] text-left overflow-hidden shadow-2xl shadow-black/80">

            {/* Console Global Status Ribbon */}
            <div className="px-5 py-3.5 border-b border-[#1b1c26] bg-[#10121a] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold font-mono text-white">cluster-mumbai-01</span>
                <span className="text-[11px] font-mono text-[#717388]">&bull; AWS ap-south-1</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-[#7e8198]">
                <span>Vectors: <strong className="text-white">1,420,890</strong></span>
                <span>p99 Latency: <strong className="text-emerald-400">3.2ms</strong></span>
                <span>Active Nodes: <strong className="text-white">3 Replicas</strong></span>
              </div>
            </div>

            {/* Console Functional Tabs */}
            <div className="flex border-b border-[#1b1c26] bg-[#0e1017] px-4">
              {CONSOLE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 text-xs font-semibold transition border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-white bg-[#13151f]/50'
                      : 'border-transparent text-[#717388] hover:text-[#a5a7be]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab 1: Vector Query Engine ── */}
            {activeTab === 'query' && (
              <div className="p-6">
                <div className="mb-4">
                  <div className="text-xs font-medium text-[#7c7f94] mb-2">Select Production Query Preset:</div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_QUERIES.map((q, idx) => (
                      <button
                        key={q.title}
                        onClick={() => setActiveQueryIndex(idx)}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium border transition ${
                          activeQueryIndex === idx
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-[#12141d] text-[#8c8e9f] border-[#212330] hover:text-white'
                        }`}
                      >
                        {q.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Query Execution Box */}
                  <div className="md:col-span-7 rounded-lg p-4 bg-[#07080b] border border-[#1b1c26] font-mono text-xs leading-6">
                    <div className="text-[11px] text-[#55586d] mb-1">// Active Semantic Search Request</div>
                    <div className="text-white">&gt; "{activeQuery.query}"</div>
                    <div className="mt-3 text-[11px] text-[#717388]">Execution Profile:</div>
                    <div className="text-cyan-400">Index Type: HNSW Graph (M=16, ef=128) + FastEmbed ONNX</div>
                    <div className="text-emerald-400">Calculated Latency: {activeQuery.latency} &bull; Cosine: {activeQuery.similarity}</div>
                  </div>

                  {/* Extracted Metadata Payload */}
                  <div className="md:col-span-5 rounded-lg p-4 bg-[#07080b] border border-[#1b1c26] font-mono text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-[#1b1c26] text-[11px] text-[#717388]">
                        <span>Top Match Payload</span>
                        <span className="text-emerald-400 font-bold">200 OK</span>
                      </div>
                      <pre className="mt-2 text-amber-300 text-[11px] leading-5 overflow-x-auto">
                        {JSON.stringify(activeQuery.metadata, null, 2)}
                      </pre>
                    </div>
                    <div className="pt-2 text-[10px] text-[#55586d]">
                      Stored on Encrypted NVMe Tier (ap-south-1)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 2: Agent Memory Store ── */}
            {activeTab === 'memory' && (
              <div className="p-6 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-lg bg-[#07080b] border border-[#1b1c26]">
                    <div className="text-[#717388] text-[11px]">Short-Term Session TTL</div>
                    <div className="text-white font-bold text-lg mt-1">1 Hour</div>
                    <div className="text-emerald-400 text-[11px] mt-1">Active Memory Pool</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#07080b] border border-[#1b1c26]">
                    <div className="text-[#717388] text-[11px]">Episodic Interaction Cache</div>
                    <div className="text-white font-bold text-lg mt-1">30 Days</div>
                    <div className="text-cyan-400 text-[11px] mt-1">Snapshot Preserved</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#07080b] border border-[#1b1c26]">
                    <div className="text-[#717388] text-[11px]">Long-Term Semantic Store</div>
                    <div className="text-white font-bold text-lg mt-1">Permanent</div>
                    <div className="text-purple-400 text-[11px] mt-1">User Profile Vector</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#12141e] border border-[#212332] text-[#8f92a6] text-xs">
                  Agent memory endpoints execute via unified REST API with zero manual database partitioning.
                </div>
              </div>
            )}

            {/* ── Tab 3: DPDP Security & Audit ── */}
            {activeTab === 'compliance' && (
              <div className="p-6 font-mono text-xs">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#07080b] border border-[#1b1c26]">
                    <span className="text-white font-semibold">Indian Data Protection Act (DPDP Act 2023)</span>
                    <span className="text-emerald-400 font-bold">&check; Fully Compliant (Mumbai Ground Truth)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#07080b] border border-[#1b1c26]">
                    <span className="text-white font-semibold">Data Encryption at Rest &amp; in Transit</span>
                    <span className="text-emerald-400 font-bold">&check; AES-256 GCM + TLS 1.3 Strict</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#07080b] border border-[#1b1c26]">
                    <span className="text-white font-semibold">VPC Peering &amp; Private Link</span>
                    <span className="text-emerald-400 font-bold">&check; AWS ap-south-1 Private Subnet Available</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── Trust & Governance Strip ── */}
      <section className="py-10 border-b border-[#1b1c24] bg-[#07080b]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] uppercase font-mono tracking-widest text-[#6c6e80] mb-6">
            Institutional Data Governance &bull; Enterprise Compliance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xs font-semibold text-[#8c8e9f]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              DPDP Act 2023 Compliant
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              100% Domestic Mumbai Residency
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              AES-256 At-Rest Encryption
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              99.99% High Availability SLA
            </span>
          </div>
        </div>
      </section>

      {/* ── Why Iceberg: Enterprise Comparison Matrix ── */}
      <section id="comparison" className="py-24 px-6 border-b border-[#1b1c24] bg-[#0c0e14]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold">Architectural Comparison</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-3">
              Why Indian AI Companies Are Choosing Iceberg.
            </h2>
            <p className="text-sm text-[#7c7f94] max-w-xl mx-auto">
              How domestic bare-metal infrastructure compares to US-hosted vector offerings.
            </p>
          </div>

          <div className="rounded-xl border border-[#212330] overflow-hidden bg-[#07080b] shadow-xl">
            <div className="grid grid-cols-12 bg-[#10121a] p-4 text-xs font-bold text-[#8c8e9f] border-b border-[#1b1c26]">
              <div className="col-span-5">CRITICAL REQUIREMENT</div>
              <div className="col-span-4 text-blue-400 font-bold">ICEBERG DATABASE</div>
              <div className="col-span-3 text-[#616375]">US CLOUD PROVIDERS</div>
            </div>

            {COMPARISON.map((row, i) => (
              <div
                key={row.metric}
                className={`grid grid-cols-12 p-4 text-xs font-mono items-center border-b border-[#151720] ${
                  i % 2 === 0 ? 'bg-[#090a0e]' : 'bg-[#07080b]'
                }`}
              >
                <div className="col-span-5 font-sans font-semibold text-white">{row.metric}</div>
                <div className="col-span-4 text-emerald-400 font-bold">{row.iceberg}</div>
                <div className="col-span-3 text-[#717388]">{row.usProviders}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workload Pillars ── */}
      <section id="workloads" className="py-24 px-6 border-b border-[#1b1c24]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold">Mission-Critical Workloads</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-4">
              Built for high-stakes production systems.
            </h2>
            <p className="text-sm text-[#7c7f94] leading-relaxed">
              From millisecond orderbook matching to persistent conversational memory across millions of customer interactions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {WORKLOADS.map((w) => (
              <div
                key={w.title}
                className="p-8 rounded-xl border border-[#212330] bg-[#0c0e14] hover:border-blue-600/50 transition duration-200"
              >
                <div className="text-[10px] font-mono font-semibold tracking-wider text-cyan-400 mb-3">
                  {w.badge}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{w.title}</h3>
                <p className="text-xs text-[#8c8e9f] leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Predictable Enterprise Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-b border-[#1b1c24] bg-[#07080b]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold">Transparent Billing</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-3">
              Fixed Pricing in INR. GST Invoices Provided.
            </h2>
            <p className="text-sm text-[#7c7f94]">
              Start free forever. No foreign exchange fees or unpredictable compute charges.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {PRICING.map((p) => (
              <div
                key={p.tier}
                className={`rounded-xl p-6 flex flex-col justify-between border transition duration-200 ${
                  p.popular
                    ? 'border-blue-500 bg-[#0f111a] shadow-xl shadow-blue-600/10'
                    : 'border-[#212330] bg-[#0c0e14]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#8c8e9f]">{p.tier}</span>
                    {p.popular && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">
                        RECOMMENDED
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight">{p.price}</span>
                    <span className="text-xs text-[#717388] ml-1">{p.term}</span>
                  </div>

                  <p className="text-xs text-[#8c8e9f] mb-6 leading-relaxed">{p.desc}</p>
                  <div className="h-px bg-[#1b1c26] mb-6" />

                  <ul className="space-y-2.5 text-xs text-[#a5a7be] mb-8 font-mono">
                    {p.items.map((it, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">&check;</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`${D}/signup`}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold text-center transition ${
                    p.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#141620] hover:bg-[#1b1e2c] text-white border border-[#262838]'
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Provision Cluster Call to Action ── */}
      <section className="py-24 px-6 border-b border-[#1b1c24] bg-[#0c0e14]">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold">Instant Cloud Provisioning</span>
          <h2 className="text-3xl font-bold text-white mt-2 mb-3">Deploy your vector cluster today.</h2>
          <p className="text-sm text-[#7c7f94] mb-8">
            Create an API key, connect with 3 lines of Python or TypeScript, and index up to 500,000 vectors for free forever.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
              &check; Priority provisioning invite sent to your inbox!
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineering@company.com"
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#07080b] border border-[#232638] text-xs font-mono text-white placeholder-[#585a6d] outline-none focus:border-blue-500 transition"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition whitespace-nowrap shadow-md shadow-blue-600/20"
              >
                Deploy Cluster
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Corporate Footer ── */}
      <footer className="py-14 px-6 bg-[#07080b] text-xs text-[#525466] font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-semibold text-white">Iceberg Data Systems Pvt Ltd</span>
            <span>&bull;</span>
            <span>Mumbai IDC-2 (ap-south-1)</span>
          </div>

          <div className="flex items-center gap-6">
            <a href={`${D}/docs`} className="hover:text-white transition">Documentation</a>
            <a href="#comparison" className="hover:text-white transition">Benchmarks</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="mailto:security@icebergdb.io" className="hover:text-white transition">Security &amp; DPDP</a>
            <span className="text-[#3c3e4e]">&copy; 2026 Iceberg</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
