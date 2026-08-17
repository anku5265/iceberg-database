import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function ProductDashboard() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Iceberg Dashboard</div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Your vector DB.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Fully visible.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          A clean, fast dashboard to manage collections, upload documents, run searches, monitor usage, and manage API keys — all in one place.
        </p>
        <div className="flex gap-3">
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">Open dashboard</a>
          <a href={`${D}/login`} className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">Sign in</a>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">What's inside</p>
          <h2 className="text-3xl font-bold mb-12">Everything you need, one place</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Collections',
                desc: 'Create, manage, and delete collections. See vector count, storage used, and last updated timestamp. Click into any collection to explore its data.',
                tag: '/collections',
              },
              {
                title: 'Explorer',
                desc: 'Run live searches from the browser. Test semantic, keyword, or hybrid queries. Tune alpha and top-k in real time — no code needed.',
                tag: '/explorer',
              },
              {
                title: 'API Keys',
                desc: 'Generate admin, read-write, or read-only keys. Set expiry, add labels. Revoke any key with one click without affecting others.',
                tag: '/apikeys',
              },
              {
                title: 'Usage & Logs',
                desc: 'Every search query logged with latency, collection, and timestamp. Monitor your usage against plan limits. Export logs anytime.',
                tag: '/logs',
              },
              {
                title: 'Memory',
                desc: "View and manage agent memories. See what each agent remembers, what's expired, and clear memory per agent.",
                tag: '/memory',
              },
              {
                title: 'Assistants',
                desc: 'Create and manage RAG assistants. Upload documents, get embed codes and WhatsApp webhook URLs — no terminal needed.',
                tag: '/assistants',
              },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] p-6 hover:border-[#2a2a2a] transition">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{f.title}</h3>
                  <code className="text-xs text-[#444] font-mono">{f.tag}</code>
                </div>
                <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* vs terminal */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Philosophy</p>
          <h2 className="text-3xl font-bold mb-4">Dashboard or terminal — your call</h2>
          <p className="text-[#666] mb-12 max-w-2xl">Some developers prefer code. Others prefer UI. Iceberg supports both — full REST API and SDKs for code, dashboard for everything else.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#1a1a1a] p-6">
              <p className="text-xs text-[#555] mb-4">For developers</p>
              <pre className="text-xs font-mono text-[#aaa] leading-6">{`# Create collection
curl -X POST https://api.icebergdb.io/collections \\
  -H "X-API-Key: qr_your_key" \\
  -d '{"name": "my_docs"}'

# Search
curl -X POST https://api.icebergdb.io/search \\
  -H "X-API-Key: qr_your_key" \\
  -d '{"collection":"my_docs","query":"returns"}'`}</pre>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] p-6">
              <p className="text-xs text-[#555] mb-4">For everyone else</p>
              <div className="space-y-3">
                {['Click "New Collection" → type name → done', 'Upload PDF via drag and drop', 'Type query in Explorer → see results instantly', 'Click "New Key" → choose role → copy key'].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-[#666]">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Try the dashboard</h2>
          <p className="text-[#666] mb-8">Free account — no credit card. Dashboard included.</p>
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
        <Link to="/" className="text-white font-bold text-lg">Iceberg</Link>
        <div className="flex gap-6">{['Privacy','Terms','Docs','Status'].map(l=><a key={l} href="#" className="hover:text-white transition">{l}</a>)}</div>
        <div>© 2026 Iceberg</div>
      </div>
    </footer>
  )
}
