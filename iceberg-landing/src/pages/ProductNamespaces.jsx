import Footer from '../components/Footer'
import IcebergLogo from "../components/IcebergLogo"
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { CodeBlock } from '../components/CodeBlock'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

const NS_SNIPPETS = {
  python: [
    {
      label: '1. Index with a namespace',
      lang: 'python · index_namespace.py',
      code: `from iceberg import Client

client = Client(api_key="ib_your_key")

client.index_text(
    collection="my_docs",
    text="Customer A enterprise contract renewal terms.",
    namespace="tenant_acme"
)`,
    },
    {
      label: '2. Search scoped to a single namespace',
      lang: 'python · search_scoped.py',
      code: `results = client.search(
    collection="my_docs",
    query="contract renewal terms",
    namespace="tenant_acme",
    top_k=5
)`,
    },
    {
      label: '3. Search across all namespaces',
      lang: 'python · search_all.py',
      code: `# Omit namespace to search the entire collection
results = client.search(
    collection="my_docs",
    query="contract renewal terms",
    top_k=5
)`,
    },
  ],
  curl: [
    {
      label: '1. Index with a namespace (cURL)',
      lang: 'bash · POST /documents/text',
      code: `curl -X POST https://api.icebergdb.in/documents/text \\
  -H "X-API-Key: ib_your_key" \\
  -F "collection=my_docs" \\
  -F "text=Customer A enterprise contract renewal terms." \\
  -F "namespace=tenant_acme"`,
    },
    {
      label: '2. Search within a namespace (cURL)',
      lang: 'bash · POST /search',
      code: `curl -X POST https://api.icebergdb.in/search \\
  -H "X-API-Key: ib_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "collection": "my_docs",
    "query": "contract renewal terms",
    "namespace": "tenant_acme",
    "top_k": 5
  }'`,
    },
    {
      label: '3. Search across all namespaces (cURL)',
      lang: 'bash · POST /search',
      code: `curl -X POST https://api.icebergdb.in/search \\
  -H "X-API-Key: ib_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "collection": "my_docs",
    "query": "contract renewal terms",
    "top_k": 5
  }'`,
    },
  ],
}

export default function ProductNamespaces() {
  const [dark] = useState(true)
  const [mode, setMode] = useState('python')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-12 pb-10 md:pt-24 md:pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Namespaces</div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          One collection.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Many contexts.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Namespaces let you logically partition data within a single collection. Isolate tenants, agents, users, or topics — without creating separate collections.
        </p>
      </section>

      <section className="border-y border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Use cases</p>
          <h2 className="text-3xl font-bold mb-12">When to use namespaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: 'Multi-tenant SaaS',
                desc: 'One collection per product. Each customer gets their own namespace. Search is always scoped — customer A never sees customer B data.',
                example: `client.search("docs", query, namespace="tenant_acme")`,
              },
              {
                title: 'Per-agent memory',
                desc: "Isolate each AI agent's knowledge. Agent A searches only its namespace. Scale to thousands of agents without extra collections.",
                example: `client.search("kb", query, namespace="agent_007")`,
              },
              {
                title: 'Language separation',
                desc: 'Store English, Hindi, Tamil documents in the same collection. Namespace per language. Query specific language or all at once.',
                example: `client.search("docs", query, namespace="lang_hindi")`,
              },
            ].map((u, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold mb-2">{u.title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed mb-4">{u.desc}</p>
                </div>
                <CodeBlock code={u.example} label="python" showLineNumbers={false} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-[#555] uppercase tracking-widest mb-3">API</p>
              <h2 className="text-3xl font-bold">One parameter to rule them all</h2>
            </div>
            <div className="inline-flex rounded-lg border border-[#222] bg-[#111] p-1 self-start">
              <button
                type="button"
                onClick={() => setMode('python')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  mode === 'python' ? 'bg-blue-600 text-white' : 'text-[#888] hover:text-white'
                }`}
              >
                Python SDK
              </button>
              <button
                type="button"
                onClick={() => setMode('curl')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  mode === 'curl' ? 'bg-blue-600 text-white' : 'text-[#888] hover:text-white'
                }`}
              >
                cURL (REST API)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-5">
              {NS_SNIPPETS[mode].map((item, idx) => (
                <div key={idx}>
                  <p className="text-xs text-[#777] font-medium mb-2">{item.label}</p>
                  <CodeBlock label={item.lang} code={item.code} />
                </div>
              ))}
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
