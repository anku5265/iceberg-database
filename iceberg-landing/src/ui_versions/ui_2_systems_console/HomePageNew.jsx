import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DEMO_QUERIES = [
  { text: 'return policy for damaged items', key: 'return' },
  { text: 'pricing plans and vector limits', key: 'pricing' },
  { text: 'agent memory for user sessions', key: 'memory' },
]

const DEMO_RESULTS = {
  'return': [
    { text: 'Our return policy allows 30-day hassle-free returns for all verified orders.', score: 0.98, source: 'policy_v2.pdf' },
    { text: 'Items must be unused with original seals intact to qualify for instant refund.', score: 0.92, source: 'faq.md' },
    { text: 'Refund payouts initiate via UPI/IMPS within 4 hours of pickup verification.', score: 0.87, source: 'handbook.pdf' },
  ],
  'pricing': [
    { text: 'Developer tier: 500K vectors free forever with zero idle timeouts.', score: 0.99, source: 'pricing.json' },
    { text: 'Starter at Rs.799/mo: 5M vectors, 25K queries/day, NVMe mmap persistence.', score: 0.94, source: 'pricing.json' },
    { text: 'Growth Pro: 25M vectors, hybrid RRF search, and dedicated read replicas.', score: 0.89, source: 'pricing.json' },
  ],
  'memory': [
    { text: 'Persistent agent memory stores profile attributes and conversational intent.', score: 0.97, source: 'agent_specs.md' },
    { text: 'Short-term session memory auto-expires after 1-hour inactivity TTL.', score: 0.91, source: 'agent_specs.md' },
    { text: 'Episodic event memory preserves critical interaction snapshots for 30 days.', score: 0.86, source: 'agent_specs.md' },
  ],
}

const STACK = [
  { name: 'Python', role: 'pip install iceberg-db' },
  { name: 'Rust', role: 'cargo add iceberg-rs' },
  { name: 'Go', role: 'go get github.com/iceberg/go' },
  { name: 'LangChain', role: 'Native VectorStore' },
  { name: 'LlamaIndex', role: 'Index Provider' },
  { name: 'TypeScript', role: '@iceberg/sdk' },
  { name: 'FastAPI', role: 'REST Client' },
  { name: 'Next.js', role: 'Edge Compatible' },
]

const FEATURES = [
  {
    tag: 'PERFORMANCE',
    title: 'Sub-5ms p99 Mumbai Latency',
    desc: 'Hosted directly inside Mumbai IDC-2 (ap-south-1). Eliminates 180ms+ round-trip penalties across trans-Atlantic cables.',
  },
  {
    tag: 'CORE ENGINE',
    title: 'Rust & SIMD AVX-512 Graph Engine',
    desc: 'Custom memory-mapped HNSW graph execution built in Rust. Vector cosine calculations vectorised via native AVX-512 instructions.',
  },
  {
    tag: 'SEARCH PRIMITIVE',
    title: 'Hybrid Dense + BM25 RRF',
    desc: 'Combines 384-dimensional dense semantic vectors with sparse BM25 keyword matching using reciprocal rank fusion for superior recall.',
  },
  {
    tag: 'AUTONOMOUS AGENTS',
    title: 'Persistent 4-Tier Agent Memory',
    desc: 'Short-term context, episodic event logs, semantic knowledge, and user profiles with automatic background TTL expiry.',
  },
  {
    tag: 'RELIABILITY',
    title: 'Zero Cold Starts & Always Warm',
    desc: 'Memory-mapped indices remain warm in kernel page cache. No sleep cycles, no 15-second spin-up penalties.',
  },
  {
    tag: 'COMPLIANCE',
    title: 'DPDP Act 2023 & Enterprise BYOC',
    desc: '100% data sovereignty on Indian soil. Deploy in our managed cloud or self-host in your own AWS/GCP VPC.',
  },
]

const PLANS = [
  {
    name: 'Developer',
    price: 'Rs. 0',
    period: 'forever',
    desc: 'Full vector capabilities for prototyping and indie projects.',
    popular: false,
    features: [
      '500,000 vectors',
      '1,000 queries / day',
      '1 GB NVMe storage',
      'Unlimited collections',
      'Sub-5ms query latency',
      'Zero cold starts (never pauses)',
      'Community Discord'
    ],
    cta: 'Start Free'
  },
  {
    name: 'Starter',
    price: 'Rs. 799',
    period: '/ month',
    desc: 'For production microservices and customer-facing AI agents.',
    popular: false,
    features: [
      '5,000,000 vectors',
      '25,000 queries / day',
      '5 GB NVMe storage',
      'Metadata filtering',
      'Unlimited collections',
      'Email support (<4h SLA)',
      'Snapshot backups'
    ],
    cta: 'Deploy Starter'
  },
  {
    name: 'Growth Pro',
    price: 'Rs. 3,999',
    period: '/ month',
    desc: 'For high-throughput RAG search and quantitative workflows.',
    popular: true,
    features: [
      '25,000,000 vectors',
      '200,000 queries / day',
      '30 GB NVMe storage',
      'Hybrid dense + BM25 search',
      '15 team projects with RBAC',
      'Priority 24/7 technical hotline',
      'Dedicated read replica'
    ],
    cta: 'Deploy Growth'
  },
  {
    name: 'Enterprise Scale',
    price: 'Rs. 12,999',
    period: '/ month',
    desc: 'Dedicated cluster instances with custom SLA and BYOC option.',
    popular: false,
    features: [
      '100M+ vector headroom',
      '1M+ queries / day',
      'Dedicated isolated VPC nodes',
      'Custom 99.99% uptime SLA',
      'BYOC on-premise license',
      'DPDP audit compliance pack',
      'Dedicated Slack engineer'
    ],
    cta: 'Contact Engineering'
  },
]

export default function HomePage({ ProductDropdown }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [copied, setCopied] = useState(false)
  const [langTab, setLangTab] = useState('rust')
  const [activeTelemetryTab, setActiveTelemetryTab] = useState('metrics')

  const copyCommand = (cmd = 'curl -fsSL https://get.icebergdb.io | sh') => {
    navigator.clipboard?.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const runSearch = (q) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    setResults([])
    setTimeout(() => {
      const key = Object.keys(DEMO_RESULTS).find(k => q.toLowerCase().includes(k)) || 'return'
      setResults(DEMO_RESULTS[key])
      setSearching(false)
    }, 400)
  }

  const submit = async (e) => {
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
    <div className="min-h-screen bg-[#000000] text-[#ededed] font-sans antialiased selection:bg-[#27272a] selection:text-white">

      {/* ── Precision Minimalist Header ── */}
      <header className="sticky top-0 z-50 border-b border-[#1c1c1f] bg-[#000000]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition">
              {/* Minimalist Geometric Monolith Logo */}
              <div className="w-5 h-5 bg-white flex items-center justify-center rounded-[3px]">
                <div className="w-2.5 h-2.5 bg-black rotate-45" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">Iceberg</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1c1c1f] text-[#888888] border border-[#2c2c30]">
                db
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#888888]">
              <ProductDropdown dark={true} />
              <a href="#benchmarks" className="hover:text-white transition">Benchmarks</a>
              <a href="#code" className="hover:text-white transition">Architecture</a>
              <a href="#features" className="hover:text-white transition">Primitives</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <a href={`${D}/docs`} className="hover:text-white transition">Docs</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-white px-2.5 py-1 rounded-md border border-[#1f1f23] bg-[#0a0a0c] transition"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
              <span className="text-[#555]">&bull;</span>
              <span className="font-mono text-[11px] text-[#aaa]">2.8k</span>
            </a>

            <a href={`${D}/login`} className="text-xs text-[#888888] hover:text-white px-3 py-1.5 transition">
              Sign In
            </a>

            <a
              href={`${D}/signup`}
              className="text-xs font-medium text-black bg-white hover:bg-[#e4e4e7] px-3.5 py-1.5 rounded-md transition duration-150 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
            >
              Start Free
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Silicon Valley Minimalist & Authoritative) ── */}
      <section className="relative pt-20 pb-16 px-6 border-b border-[#1c1c1f]">
        {/* Subtle Engineering Grid Line */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Release Version Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-[#a1a1aa] bg-[#0c0c0e] border border-[#232328] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>v1.4.0 &mdash; Zero-latency mmap HNSW indexes on NVMe</span>
            <span className="text-[#52525b]">&rarr;</span>
          </div>

          {/* Clean, Massive, Confident Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[4.4rem] font-bold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto mb-6">
            The serverless vector database <br className="hidden sm:inline" />
            for real-time AI.
          </h1>

          {/* Authoritative Technical Subtitle */}
          <p className="text-base sm:text-lg text-[#8f8f96] max-w-2xl mx-auto leading-relaxed mb-8">
            Query millions of high-dimensional vectors with sub-5ms p99 latency. Built in Rust with SIMD AVX-512 acceleration, hosted natively in Mumbai with guaranteed data residency.
          </p>

          {/* Single-Line Shell Command */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div
              onClick={() => copyCommand('$ curl -fsSL https://get.icebergdb.io | sh')}
              className="group inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0a0a0c] border border-[#232328] font-mono text-xs text-[#a1a1aa] hover:border-[#383842] transition cursor-pointer select-all shadow-sm"
              title="Click to copy install command"
            >
              <span className="text-[#52525b]">$</span>
              <span className="text-[#ededed]">curl -fsSL https://get.icebergdb.io | sh</span>
              <span className="text-[11px] text-[#71717a] pl-2 border-l border-[#27272a] group-hover:text-white transition">
                {copied ? <span className="text-emerald-400">copied</span> : 'copy'}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <a
              href={`${D}/signup`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-black bg-white hover:bg-[#e4e4e7] transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Start building free
              <span className="text-black">&rarr;</span>
            </a>
            <a
              href={`${D}/docs`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium text-[#a1a1aa] bg-[#0c0c0e] border border-[#222226] hover:text-white hover:border-[#333338] transition"
            >
              Read technical documentation
            </a>
          </div>

          {/* ── The Systems Console: Real Zed / VS Code Split Terminal ── */}
          <div className="rounded-xl border border-[#222226] bg-[#09090b] text-left overflow-hidden shadow-2xl shadow-black/80 max-w-4xl mx-auto">
            {/* Title Bar */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-[#1c1c20] bg-[#0d0d10]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <div className="h-3 w-px bg-[#27272a] mx-2" />
                {/* Code Tabs */}
                <div className="flex items-center gap-1">
                  {[
                    ['rust', 'main.rs'],
                    ['python', 'query.py'],
                    ['curl', 'request.sh'],
                  ].map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => setLangTab(k)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                        langTab === k
                          ? 'bg-[#18181b] text-white border border-[#27272a]'
                          : 'text-[#71717a] hover:text-[#a1a1aa]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#71717a]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ap-south-1 IDC-2</span>
              </div>
            </div>

            {/* Split Editor Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1c1c20]">

              {/* Left Code Editor Pane */}
              <div className="lg:col-span-7 p-5 font-mono text-xs leading-6 overflow-x-auto bg-[#070709]">
                {langTab === 'rust' && (
                  <pre className="text-[#a1a1aa]">
                    <code>
                      <span className="text-[#e4e4e7]">// High-throughput SIMD vector similarity search</span>{'\n'}
                      <span className="text-purple-400">use</span> iceberg_rs::&#123;Client, Query&#125;;{'\n\n'}
                      <span className="text-purple-400">let</span> client = Client::<span className="text-blue-400">connect</span>(<span className="text-emerald-300">"ap-south-1.icebergdb.io"</span>).<span className="text-purple-400">await</span>?;{'\n'}
                      <span className="text-purple-400">let</span> matches = client.<span className="text-blue-400">search</span>(<span className="text-emerald-300">"orderbook_signals"</span>){'\n'}
                      {'    '}.<span className="text-blue-400">vector</span>(&amp;query_embedding){'\n'}
                      {'    '}.<span className="text-blue-400">filter</span>(doc! &#123; <span className="text-emerald-300">"symbol"</span>: <span className="text-emerald-300">"NIFTY"</span> &#125;){'\n'}
                      {'    '}.<span className="text-blue-400">limit</span>(<span className="text-amber-400">5</span>){'\n'}
                      {'    '}.<span className="text-blue-400">execute</span>().<span className="text-purple-400">await</span>?;{'\n\n'}
                      <span className="text-purple-400">for</span> hit <span className="text-purple-400">in</span> matches &#123;{'\n'}
                      {'    '}println!(<span className="text-emerald-300">"cosine: &#123;&#125;, latency: &#123;&#125;ms"</span>, hit.score, hit.latency_ms);{'\n'}
                      &#125;
                    </code>
                  </pre>
                )}

                {langTab === 'python' && (
                  <pre className="text-[#a1a1aa]">
                    <code>
                      <span className="text-[#e4e4e7]"># Sub-5ms Python client with FastEmbed ONNX</span>{'\n'}
                      <span className="text-purple-400">import</span> iceberg_db <span className="text-purple-400">as</span> idb{'\n\n'}
                      client = idb.<span className="text-blue-400">Client</span>(api_key=<span className="text-emerald-300">"ib_live_secret"</span>){'\n'}
                      results = client.<span className="text-blue-400">query</span>({'\n'}
                      {'    '}collection=<span className="text-emerald-300">"agent_memory"</span>,{'\n'}
                      {'    '}query=<span className="text-emerald-300">"user preference return policy"</span>,{'\n'}
                      {'    '}top_k=<span className="text-amber-400">3</span>,{'\n'}
                      {'    '}search_type=<span className="text-emerald-300">"hybrid"</span>  <span className="text-[#71717a]"># Dense + BM25 RRF</span>{'\n'}
                      ){'\n\n'}
                      <span className="text-purple-400">print</span>(f<span className="text-emerald-300">"p99: &#123;results.latency_ms&#125;ms | hits: &#123;len(results)&#125;"</span>)
                    </code>
                  </pre>
                )}

                {langTab === 'curl' && (
                  <pre className="text-[#a1a1aa]">
                    <code>
                      <span className="text-[#e4e4e7]"># Edge HTTP REST API Endpoint</span>{'\n'}
                      curl -X POST https://api.icebergdb.io/v1/search \{'\n'}
                      {'  '}-H <span className="text-emerald-300">"Authorization: Bearer ib_live_secret"</span> \{'\n'}
                      {'  '}-H <span className="text-emerald-300">"Content-Type: application/json"</span> \{'\n'}
                      {'  '}-d <span className="text-emerald-300">'&#123;{'\n'}
                      {'    '}"collection": "agent_memory",{'\n'}
                      {'    '}"query": "damaged order policy",{'\n'}
                      {'    '}"top_k": 3{'\n'}
                      {'  '}&#125;'</span>
                    </code>
                  </pre>
                )}
              </div>

              {/* Right Telemetry & Benchmark Pane */}
              <div className="lg:col-span-5 p-5 bg-[#09090b] flex flex-col justify-between text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#1c1c20] mb-4">
                    <span className="text-[11px] uppercase tracking-wider text-[#71717a]">Server Telemetry</span>
                    <span className="text-emerald-400 font-semibold">200 OK &bull; 3.2ms</span>
                  </div>

                  {/* Real benchmark breakdown */}
                  <div className="space-y-2.5 text-[#a1a1aa] mb-5">
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Query p50 / p95 / p99:</span>
                      <span className="text-white">1.8ms / 2.7ms / 3.2ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Engine Core:</span>
                      <span className="text-white">Rust 1.80 (mmap NVMe)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">SIMD Kernel:</span>
                      <span className="text-emerald-400">&bull; AVX-512 active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Top Cosine Match:</span>
                      <span className="text-white">0.9842</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Data Sovereignty:</span>
                      <span className="text-white">Mumbai, India (DPDP)</span>
                    </div>
                  </div>

                  {/* Result payload snapshot */}
                  <div className="p-3 rounded-lg bg-[#040405] border border-[#1c1c20] text-[11px] leading-5 text-[#888888]">
                    <span className="text-[#555]">// Top Payload Hit</span><br />
                    <span className="text-white">"Our return policy allows 30-day returns for all products..."</span><br />
                    <span className="text-[#71717a]">&#123; score: 0.984, ttl: "session", source: "policy.pdf" &#125;</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1c1c20] text-[10px] text-[#555] flex justify-between items-center">
                  <span>Engine: HNSW M=16, ef=128</span>
                  <span className="text-emerald-400">Zero Cold Start</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── Honest Benchmark Section (Concept B) ── */}
      <section id="benchmarks" className="py-20 px-6 border-b border-[#1c1c1f] bg-[#050507]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717a]">Hardware Benchmarks</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-3">
              Millisecond vector search. Zero cold starts.
            </h2>
            <p className="text-sm text-[#71717a] max-w-lg mx-auto">
              Real p99 response times measured across 1,000,000 embedded documents from Indian client endpoints.
            </p>
          </div>

          <div className="rounded-xl border border-[#222226] bg-[#09090b] p-6 font-mono text-xs">
            <div className="flex justify-between items-center pb-4 border-b border-[#1c1c20] text-[#71717a] text-[11px]">
              <span>PROVIDER &amp; REGION</span>
              <span>p99 END-TO-END LATENCY</span>
            </div>

            {/* Iceberg Bar */}
            <div className="py-5 border-b border-[#18181b]">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Iceberg Database (Mumbai, ap-south-1)
                </span>
                <span className="text-emerald-400 font-bold">3.2 ms</span>
              </div>
              <div className="h-3 rounded-full bg-[#18181b] overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '3.5%' }} />
              </div>
            </div>

            {/* US Database 1 */}
            <div className="py-5 border-b border-[#18181b] opacity-60">
              <div className="flex justify-between text-xs mb-2 text-[#a1a1aa]">
                <span>Pinecone Serverless (US-East-1, N. Virginia)</span>
                <span>185.0 ms</span>
              </div>
              <div className="h-3 rounded-full bg-[#18181b] overflow-hidden">
                <div className="h-full bg-[#52525b] rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            {/* US Database 2 */}
            <div className="py-5 border-b border-[#18181b] opacity-60">
              <div className="flex justify-between text-xs mb-2 text-[#a1a1aa]">
                <span>Weaviate Cloud (US-Central)</span>
                <span>198.0 ms</span>
              </div>
              <div className="h-3 rounded-full bg-[#18181b] overflow-hidden">
                <div className="h-full bg-[#3f3f46] rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div className="pt-4 text-[11px] text-[#71717a] flex flex-wrap justify-between gap-2">
              <span>* Includes network transit + HNSW traversal + SIMD score calculation</span>
              <span className="text-white font-semibold">58x faster for Indian traffic</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Native SDK & Framework Ecosystem ── */}
      <section className="py-12 border-b border-[#1c1c1f]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] uppercase font-mono tracking-widest text-[#71717a] mb-6">
            Native Production SDKs &bull; Zero External Dependencies
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {STACK.map((s) => (
              <div
                key={s.name}
                className="p-3 rounded-lg border border-[#1f1f23] bg-[#09090b] text-center hover:border-[#2f2f35] transition"
              >
                <div className="text-xs font-semibold text-white">{s.name}</div>
                <div className="text-[10px] font-mono text-[#71717a] mt-0.5 truncate">{s.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture Primitives Grid ── */}
      <section id="features" className="py-24 px-6 border-b border-[#1c1c1f]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717a]">Engine Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-4">
              Engineered for systems reliability.
            </h2>
            <p className="text-sm text-[#71717a] leading-relaxed">
              No fragile distributed consensus overhead. No Kubernetes clusters to restart. A lean, high-velocity storage engine built for predictability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-[#1f1f23] bg-[#09090b] hover:border-[#2f2f36] transition duration-200"
              >
                <div className="text-[10px] font-mono font-semibold tracking-wider text-emerald-400 mb-3">
                  {f.tag}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-[#888888] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Secondary Developer Search Playground ── */}
      <section id="demo" className="py-20 px-6 border-b border-[#1c1c1f] bg-[#050507]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717a]">Interactive Sandbox</span>
            <h3 className="text-xl font-bold text-white mt-1">Try Live Semantic Search</h3>
          </div>

          <div className="rounded-xl border border-[#222226] bg-[#09090b] p-5 shadow-xl">
            {/* Input Row */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#040405] border border-[#1f1f23] mb-4">
              <span className="font-mono text-xs text-[#52525b]">&gt;</span>
              <input
                type="text"
                value={query}
                onChange={(e) => runSearch(e.target.value)}
                placeholder="Try 'return policy', 'pricing plans', or 'agent memory'..."
                className="flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder-[#52525b]"
              />
              {searching && <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />}
            </div>

            {/* Quick Query Pills */}
            <div className="flex gap-2 mb-4">
              {['return policy', 'pricing plans', 'agent memory'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => runSearch(chip)}
                  className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#131316] text-[#888888] hover:text-white border border-[#232328] transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-2">
              {results.length === 0 && !searching && (
                <div className="py-8 text-center text-xs font-mono text-[#52525b]">
                  Execute a query to inspect live semantic scores and JSON payloads.
                </div>
              )}
              {results.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#040405] border border-[#1c1c20] text-xs font-mono">
                  <div className="flex justify-between items-center mb-1 text-[11px]">
                    <span className="text-emerald-400 font-semibold">Similarity: {(r.score * 100).toFixed(1)}%</span>
                    <span className="text-[#555]">{r.source}</span>
                  </div>
                  <p className="text-[#aaa] leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Transparent Flat Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-b border-[#1c1c1f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717a]">Predictable Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-3">
              No hidden egress. No cold start surprises.
            </h2>
            <p className="text-sm text-[#71717a]">
              Start free forever. Upgrade transparently in INR without foreign card markup.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-xl p-6 flex flex-col justify-between border transition duration-200 ${
                  p.popular
                    ? 'border-white bg-[#0e0e12] shadow-xl'
                    : 'border-[#1f1f23] bg-[#09090b]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#888888]">{p.name}</span>
                    {p.popular && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-white tracking-tight">{p.price}</span>
                    <span className="text-xs text-[#71717a] ml-1">{p.period}</span>
                  </div>
                  <p className="text-xs text-[#888888] mb-6 leading-relaxed">{p.desc}</p>
                  <div className="h-px bg-[#1c1c20] mb-6" />

                  <ul className="space-y-2.5 text-xs text-[#a1a1aa] mb-8 font-mono">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">&check;</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`${D}/signup`}
                  className={`w-full py-2 rounded-lg text-xs font-semibold text-center transition ${
                    p.popular
                      ? 'bg-white text-black hover:bg-[#e4e4e7]'
                      : 'bg-[#18181b] text-white hover:bg-[#27272a] border border-[#27272a]'
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist / CTA ── */}
      <section className="py-24 px-6 border-b border-[#1c1c1f] bg-[#050507]">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717a]">Instant Provisioning</span>
          <h2 className="text-3xl font-bold text-white mt-2 mb-3">Deploy your first index in seconds.</h2>
          <p className="text-sm text-[#71717a] mb-8">
            Create an API key, connect with 3 lines of code, and store up to 500,000 vectors free forever.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
              &check; You're on the priority deployment list!
            </div>
          ) : (
            <form onSubmit={submit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0c0c0e] border border-[#232328] text-xs font-mono text-white placeholder-[#52525b] outline-none focus:border-white transition"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-[#e4e4e7] transition whitespace-nowrap"
              >
                Join Private Beta
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Minimalist Engineering Footer ── */}
      <footer className="py-12 px-6 bg-[#000000] text-xs text-[#52525b] font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-white flex items-center justify-center rounded-[2px]">
              <div className="w-2 h-2 bg-black rotate-45" />
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
            <span className="text-[#3f3f46]">&copy; 2026 Iceberg</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
