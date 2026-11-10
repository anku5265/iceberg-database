import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

export default function About() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <Navbar dark={true} />

      <main className="container mx-auto px-6 py-20 max-w-5xl flex-1">
        {/* Hero */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border border-blue-500/20 text-blue-400 bg-blue-500/10 mb-6 font-medium">
            About Iceberg DB • Infrastructure for AI Builders
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Built in India to eliminate 200ms AI latency.
          </h1>
          <p className="text-lg text-[#999] leading-relaxed">
            Iceberg Database Technologies builds low-latency vector search, hybrid retrieval, and persistent 4-tier cognitive memory hosted directly in India (<code className="text-[#ccc] bg-white/5 px-1.5 py-0.5 rounded">ap-south-1</code>) — so Indian developers and enterprises can ship production AI apps without US/EU network round-trips or USD billing friction.
          </p>
        </div>

        {/* Key Telemetry & Architecture Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: '1.95 ms', label: 'Dense Vector Search (p50)', sub: '384d Cosine HNSW in ap-south-1' },
            { val: '8.73 ms', label: 'Hybrid Search (p50)', sub: 'Dense + Okapi BM25 + RRF Fusion' },
            { val: 'v1.0.0', label: '6 Official SDKs + MCP', sub: 'Python, JS/TS, Go, Rust, .NET, Java' },
            { val: '100%', label: 'India Data Residency', sub: 'DPDP Act 2023 Ready Architecture' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-5"
            >
              <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.val}</div>
              <div className="text-xs font-semibold text-blue-400 mb-1">{stat.label}</div>
              <div className="text-[11px] text-[#777]">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Section 1: Why We Built Iceberg DB */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-7 md:p-9 mb-10">
          <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">
            01 • Why We Built Iceberg DB
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            The Problem with Cross-Border Vector Databases
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-[#aaa] leading-relaxed">
            <p>
              Every RAG pipeline, AI copilot, and autonomous agent executes vector and keyword retrieval before the LLM even starts generating tokens. When Indian engineering teams connect to US-East (<code className="text-[#ddd]">us-east-1</code>) or European vector clusters, every single query pays a <strong className="text-white">180ms to 250ms network round-trip penalty</strong>.
            </p>
            <p>
              Iceberg DB solves this at the infrastructure layer by running high-performance Qdrant HNSW indices, BM25 lexical engines, and CPU ONNX embedding workers (<code className="text-[#ddd]">all-MiniLM-L6-v2</code>) directly inside India (<code className="text-[#ddd]">ap-south-1</code>), alongside transparent INR (<strong className="text-white">₹0 to ₹14,999/mo</strong>) and USD pricing.
            </p>
          </div>
        </section>

        {/* Section 2: Engineering Stack */}
        <section className="mb-10">
          <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">
            02 • Core Engineering Stack
          </div>
          <h2 className="text-2xl font-bold text-white mb-6">
            What Runs Under the Hood
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                title: 'Hybrid Retrieval (Dense HNSW + Sparse BM25 + RRF)',
                desc: 'Combines 384-dimensional Cosine semantic vectors with exact Okapi BM25 keyword matching (`k1=1.5, b=0.75`), fused via Reciprocal Rank Fusion (`k=60`) so exact SKU codes, legal sections, and semantic queries both rank accurately.',
                link: '/product/database',
                linkText: 'Explore Vector Database →',
              },
              {
                title: '4-Tier Cognitive Memory Engine',
                desc: 'Built-in Working, Episodic, Semantic, and Procedural memory tiers for AI agents with automatic Ebbinghaus exponential decay (`S(t) = S0 · e^(-λ·Δt)`), reinforcement on recall, and namespace isolation.',
                link: '/product/memory',
                linkText: 'Explore 4-Tier Memory →',
              },
              {
                title: 'Zero-Cost Built-In CPU Embeddings',
                desc: 'Send raw text directly to `/index-text` or `/search`. Iceberg automatically generates normalized 384d embeddings via in-cluster ONNX Runtime (`all-MiniLM-L6-v2`) with zero external OpenAI embedding bill.',
                link: '/benchmarks',
                linkText: 'View Reproducible Benchmarks →',
              },
              {
                title: '6 Official SDKs (v1.0.0) & Universal MCP Server',
                desc: 'First-class packages published across PyPI (`icebergdb`), npm (`icebergdb`), Crates.io (`icebergdb`), NuGet (`IcebergDb`), Go, Maven, and `iceberg-mcp` for Claude Code, Cursor, Copilot, and Gemini.',
                link: '/product/sdk',
                linkText: 'View Official SDK Registry →',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-[#999] leading-relaxed mb-4">{item.desc}</p>
                </div>
                <Link
                  to={item.link}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-1"
                >
                  {item.linkText}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Data Sovereignty & Zero Lock-In */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-7 md:p-9 mb-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
                03 • Data Sovereignty &amp; Compliance
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                DPDP Act 2023 Ready &amp; Zero Vendor Lock-In
              </h3>
              <p className="text-xs text-[#999] leading-relaxed mb-4">
                Your data belongs to you. Iceberg DB stores all primary collections, vector indices, and backups in India (<code className="text-[#ccc]">ap-south-1</code>), never trains foundation models on customer payloads, and gives you full self-service export (<code className="text-[#ccc]">GET /documents/&#123;col&#125;/scroll</code>) or BYOC self-hosted deployment via Docker and Terraform.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/security"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition"
                >
                  Security &amp; DPDP Architecture →
                </Link>
                <Link
                  to="/product/byoc"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition"
                >
                  BYOC Self-Hosted →
                </Link>
              </div>
            </div>

            {/* Section 4: Founder & Direct Engineering */}
            <div className="border-t md:border-t-0 md:border-l border-white/[0.08] pt-6 md:pt-0 md:pl-8">
              <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">
                04 • Founder &amp; Direct Engineering
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Ankush — Founder &amp; Lead Systems Engineer
              </h3>
              <p className="text-xs text-[#999] leading-relaxed mb-4">
                Headquartered in Himachal Pradesh, India, Iceberg DB is built with direct founder-led engineering support and open benchmark transparency. Have architecture questions or enterprise requirements? Reach out directly:
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-mono mb-4">
                <a
                  href="https://github.com/anku5265/iceberg-database"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 transition"
                >
                  GitHub @anku5265
                </a>
                <a
                  href="https://www.linkedin.com/in/ankush-a-96518a39b/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 transition"
                >
                  LinkedIn
                </a>
                <a
                  href="https://x.com/igankush33"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 transition"
                >
                  X @igankush33
                </a>
                <a
                  href="mailto:contact@icebergdb.in"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
                >
                  contact@icebergdb.in
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-transparent p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Start building on Iceberg DB in 30 seconds
          </h2>
          <p className="text-sm text-[#999] mb-6">
            100,000 vectors free forever. Instant API key. No credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={D}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
            >
              Get Free API Key →
            </a>
            <Link
              to="/docs"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition"
            >
              Read Documentation
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition"
            >
              Contact Engineering
            </Link>
          </div>
        </section>
      </main>

      <Footer dark={true} />
    </div>
  )
}
