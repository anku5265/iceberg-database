import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function ProductNamespaces() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Namespaces</div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          One collection.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Many contexts.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Namespaces let you logically partition data within a single collection. Isolate tenants, agents, users, or topics — without creating separate collections.
        </p>
      </section>

      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Use cases</p>
          <h2 className="text-3xl font-bold mb-12">When to use namespaces</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Multi-tenant SaaS',
                desc: 'One collection per product. Each customer gets their own namespace. Search is always scoped — customer A never sees customer B data.',
                example: 'namespace: "tenant_acme_corp"',
              },
              {
                title: 'Per-agent memory',
                desc: 'Isolate each AI agent\'s knowledge. Agent A searches only its namespace. Scale to thousands of agents without extra collections.',
                example: 'namespace: "agent_007"',
              },
              {
                title: 'Language separation',
                desc: 'Store English, Hindi, Tamil documents in the same collection. Namespace per language. Query specific language or all at once.',
                example: 'namespace: "lang_hindi"',
              },
            ].map((u, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <h3 className="font-semibold mb-2">{u.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed mb-4">{u.desc}</p>
                <code className="text-xs text-blue-400 font-mono">{u.example}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">API</p>
          <h2 className="text-3xl font-bold mb-12">One parameter to rule them all</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#555] mb-2">Index with namespace</p>
                <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 text-xs font-mono text-[#aaa]">{`POST /documents/text
{
  "collection": "my_docs",
  "text": "Customer A's contract terms",
  "namespace": "tenant_acme"
}`}</pre>
              </div>
              <div>
                <p className="text-xs text-[#555] mb-2">Search within namespace</p>
                <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 text-xs font-mono text-[#aaa]">{`POST /search
{
  "collection": "my_docs",
  "query": "contract renewal terms",
  "namespace": "tenant_acme",
  "top_k": 5
}`}</pre>
              </div>
              <div>
                <p className="text-xs text-[#555] mb-2">Search across all namespaces</p>
                <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 text-xs font-mono text-[#aaa]">{`POST /search
{
  "collection": "my_docs",
  "query": "contract renewal terms"
  // no namespace = searches all
}`}</pre>
              </div>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] p-6 h-fit">
              <h3 className="font-semibold mb-4">How it works internally</h3>
              <ol className="space-y-3 text-sm text-[#666]">
                {[
                  'Namespace stored as _namespace metadata field on each vector',
                  'When namespace specified in search, a metadata filter is applied automatically',
                  'No separate index — same fast search, just filtered',
                  'Unlimited namespaces per collection, even on free tier',
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-blue-500 font-mono text-xs mt-0.5 flex-shrink-0">0{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Start using namespaces</h2>
          <p className="text-[#666] mb-8">Available on all plans including free.</p>
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">Get started</a>
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
        <div className="flex gap-6">{['Privacy','Terms','Docs','Status'].map(l=><a key={l} href="#" className="hover:text-white transition">{l}</a>)}</div>
        <div>© 2026 Qora</div>
      </div>
    </footer>
  )
}
