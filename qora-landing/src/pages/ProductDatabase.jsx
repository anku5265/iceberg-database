import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function ProductDatabase() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">
          Qora Database
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Vector search.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Built for India.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          A fully managed vector database hosted in Mumbai. Store embeddings, run semantic search, and build RAG pipelines — without managing any infrastructure.
        </p>
        <div className="flex gap-3">
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">Start for free</a>
          <a href={`${D}/docs`} className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">View docs</a>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#111] py-10">
        <div className="container mx-auto px-6 max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '<20ms', l: 'p50 query latency' },
            { v: '500K', l: 'vectors free forever' },
            { v: '∞', l: 'collections on free tier' },
            { v: '3 modes', l: 'semantic · keyword · hybrid' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-white mb-1">{s.v}</div>
              <div className="text-sm text-[#555]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl font-bold mb-12">Three steps. Zero DevOps.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create a collection', desc: 'One API call to create a collection. No schema, no config, no cluster sizing. Qora handles everything.', code: `client.create_collection("my_docs")` },
              { step: '02', title: 'Index your data', desc: 'Upload PDFs, paste text, or stream data. Qora chunks, embeds using MiniLM, and stores — automatically.', code: `client.upload("my_docs", "handbook.pdf")\nclient.index_text("my_docs", "Return policy...")` },
              { step: '03', title: 'Search', desc: 'Hybrid search — dense vectors + BM25 combined. Configurable alpha per query. Filter by metadata or namespace.', code: `results = client.search("my_docs",\n  "can I return my order?")` },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <div className="text-xs font-mono text-[#444] mb-3">{s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed mb-4">{s.desc}</p>
                <pre className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3 text-xs font-mono text-[#aaa] overflow-x-auto">{s.code}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search types */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Search modes</p>
          <h2 className="text-3xl font-bold mb-4">Hybrid search — better recall</h2>
          <p className="text-[#666] mb-12 max-w-2xl">Pure vector search misses exact keyword matches. Pure keyword search misses semantically similar results. Qora combines both via RRF (Reciprocal Rank Fusion).</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { mode: 'Semantic', alpha: '1.0', desc: 'Pure dense vector search. Best for conceptual queries — "affordable phones" matches "budget smartphones".', tag: 'alpha=1.0' },
              { mode: 'Hybrid', alpha: '0.5', desc: 'Dense + BM25 combined. Best for most use cases — captures both meaning and exact keywords.', tag: 'alpha=0.5 (default)', best: true },
              { mode: 'Keyword', alpha: '0.0', desc: 'Pure BM25 keyword search. Best for exact term matching — product codes, names, IDs.', tag: 'alpha=0.0' },
            ].map((m, i) => (
              <div key={i} className={`rounded-xl p-6 border ${m.best ? 'border-blue-500/40 bg-blue-500/5' : 'border-[#1a1a1a]'}`}>
                {m.best && <div className="text-[10px] text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full inline-block mb-3">Recommended</div>}
                <h3 className="font-semibold mb-2">{m.mode}</h3>
                <p className="text-sm text-[#666] leading-relaxed mb-4">{m.desc}</p>
                <code className="text-xs text-blue-400 font-mono">{m.tag}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl font-bold mb-12">Everything included</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Unlimited collections', desc: 'No artificial index limits. Create as many collections as you need — even on the free tier.' },
              { title: 'Namespaces', desc: 'Logical partitions within a collection. Search all namespaces or scope to one — one agent per namespace, one tenant per namespace.' },
              { title: 'Metadata filters', desc: 'Store arbitrary JSON metadata with each vector. Filter search results by any field — source, date, user_id, category.' },
              { title: 'Never pauses', desc: 'Free tier stays active forever. Your dev environment is always ready — no cold starts, no idle timeouts.' },
              { title: 'India hosted', desc: 'All data stored in Mumbai. <20ms latency for Indian users. DPDP Act compliant — no data leaves India.' },
              { title: 'Instant writes', desc: 'Writes are acknowledged in <100ms and searchable within seconds. No manual index rebuilds.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-[#1a1a1a]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"/>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Start building in minutes</h2>
          <p className="text-[#666] mb-8">Free tier — 500K vectors, unlimited collections, never pauses.</p>
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">Create free account</a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#111] py-10">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#555]">
        <Link to="/" className="text-white font-bold text-lg">Qora</Link>
        <div className="flex gap-6">
          {['Privacy','Terms','Docs','Status'].map(l=><a key={l} href="#" className="hover:text-white transition">{l}</a>)}
        </div>
        <div>© 2026 Qora</div>
      </div>
    </footer>
  )
}
