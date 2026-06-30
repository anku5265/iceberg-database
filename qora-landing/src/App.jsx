import { useState, useRef, useEffect } from 'react'

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
        <div className="absolute top-full left-0 mt-2 w-[520px] bg-[#111] border border-[#222] rounded-xl shadow-2xl shadow-black/50 p-5 z-50">
          {/* Products */}
          <div className="mb-5">
            <p className="text-xs text-[#555] uppercase tracking-widest mb-3 px-1">Products</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: <DBIcon/>, name: 'Qora Database', desc: 'Serverless, India-hosted vector DB' },
                { icon: <SDKIcon/>, name: 'Qora SDK', desc: 'Python, JS, Go, Java, .NET, Rust' },
                { icon: <DashIcon/>, name: 'Qora Dashboard', desc: 'Manage collections, search, and keys' },
                { icon: <BotIcon/>, name: 'Qora Assistant', desc: 'No-code RAG app builder', soon: true },
              ].map(p => (
                <a key={p.name} href={p.soon ? '#' : `${D}/signup`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition group">
                  <span className="text-[#555] group-hover:text-blue-400 transition mt-0.5 flex-shrink-0">{p.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{p.name}</span>
                      {p.soon && <span className="text-[10px] text-[#555] border border-[#333] px-1.5 py-0.5 rounded-full">Soon</span>}
                    </div>
                    <span className="text-xs text-[#666]">{p.desc}</span>
                  </div>
                </a>
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
                { icon: <SecIcon/>, name: 'Security', desc: 'DPDP compliant, India data residency' },
                { icon: <IntIcon/>, name: 'Integrations', desc: 'LangChain, LlamaIndex, REST API' },
              ].map(c => (
                <a key={c.name} href="#features"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition group"
                  onClick={() => setOpen(false)}>
                  <span className="text-[#555] group-hover:text-blue-400 transition mt-0.5 flex-shrink-0">{c.icon}</span>
                  <div>
                    <div className="text-sm text-white font-medium">{c.name}</div>
                    <div className="text-xs text-[#666]">{c.desc}</div>
                  </div>
                </a>
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

export default function App() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    try { await fetch(`${API}/waitlist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }) } catch (_) {}
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-md bg-[#0a0a0a]/90">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold">Qora</span>
            <div className="hidden md:flex items-center gap-1 text-sm">
              <ProductDropdown />
              {[['Developers','#code'],['Pricing','#pricing'],['Docs',`${D}/docs`],['Blog','#']].map(([l,h]) => (
                <a key={l} href={h} className="text-[#888] hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://github.com/qora-db" target="_blank" className="hidden md:flex items-center gap-2 text-[#888] hover:text-white text-sm border border-[#1f1f1f] hover:border-[#333] px-3 py-1.5 rounded-md transition">
              <GHIcon /> GitHub
            </a>
            <a href={`${D}/login`} className="text-sm text-[#888] hover:text-white px-3 py-1.5 transition">Sign in</a>
            <a href={`${D}/signup`} className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-white/90 transition">Start your project</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-28 pb-16 max-w-4xl text-center">
        <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
          Build in a weekend<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Scale to millions</span>
        </h1>
        <p className="text-lg text-[#777] max-w-xl mx-auto mb-10 leading-relaxed">
          Qora is the vector search platform for Indian AI teams.
          Semantic search and RAG pipelines — production-ready in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-md transition text-sm">Start your project</a>
          <a href="#demo" className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-7 py-3 rounded-md transition text-sm">Request a demo</a>
        </div>
        <p className="mt-5 text-xs text-[#555]">Free tier — no credit card required</p>
      </section>

      {/* Code */}
      <section id="code" className="py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Use your framework of choice</h2>
            <p className="text-[#666] text-sm">Python SDK, JavaScript SDK, or REST API</p>
          </div>
          <CodeBlock />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-[#111] py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need to ship AI features</h2>
            <p className="text-[#666] text-sm">No DevOps. No ML expertise. Just an API key.</p>
          </div>
          <div className="grid md:grid-cols-3 border border-[#111] divide-[#111]" style={{borderBottom:'none'}}>
            {FEATURES.map((f,i) => (
              <div key={i} className="p-8 border-b border-r border-[#111] hover:bg-white/[0.015] transition">
                <div className="text-blue-400 mb-4 w-7 h-7">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-[#111] py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Predictable pricing</h2>
            <p className="text-[#666] text-sm">Start free. No credit card required. Upgrade when you scale.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {PLANS.map((p,i) => (
              <div key={i} className={`rounded-xl p-6 flex flex-col relative border ${p.popular ? 'border-blue-500/40 bg-blue-500/5' : 'border-[#1a1a1a]'}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">Popular</div>}
                <div className="text-[#888] text-xs mb-3 uppercase tracking-wider">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-[#555] text-sm">{p.period}</span>
                </div>
                {p.yearly ? <div className="text-xs text-[#555] mb-5">{p.yearly} · 2 months free</div> : <div className="mb-5"/>}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {p.features.map((f,j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#aaa]">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={`${D}/signup`} className={`w-full py-2.5 rounded-md text-sm font-medium transition text-center ${p.popular ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border border-[#222] hover:border-[#444] text-[#aaa] hover:text-white'}`}>
                  {p.price === '₹0' ? 'Start for free' : 'Get started'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="waitlist" className="border-t border-[#111] py-24">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-4">Start building today</h2>
          <p className="text-[#666] mb-10">Join our beta. Free access for 3 months.</p>
          {submitted ? (
            <div className="inline-flex items-center gap-2 text-green-400 bg-green-950/30 border border-green-900/40 px-5 py-3 rounded-lg text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              You're on the list! We'll reach out soon.
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"
                className="flex-1 px-4 py-2.5 rounded-md bg-[#111] border border-[#222] focus:outline-none focus:border-blue-600 text-white placeholder-[#444] text-sm"/>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition whitespace-nowrap">Join beta</button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#111] py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#555]">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-lg">Qora</span>
            <span className="text-[#333]">·</span>
            <span>Vector search for India</span>
          </div>
          <div className="flex gap-6">
            {['Privacy','Terms','Docs','Status'].map(l=><a key={l} href="#" className="hover:text-white transition">{l}</a>)}
            <a href="mailto:hello@qora.in" className="hover:text-white transition">Contact</a>
          </div>
          <div>© 2026 Qora</div>
        </div>
      </footer>

    </div>
  )
}

function CodeBlock() {
  const [tab, setTab] = useState('python')
  const code = {
    python: `from qora import Client

client = Client(api_key="qr_your_key")

# Create a collection
client.create_collection("my_docs")

# Index — PDF or text files
client.upload("my_docs", "knowledge_base.pdf")
client.index_text("my_docs", "Our return policy allows 30 day returns.")

# Semantic search
results = client.search("my_docs", "can I return my order?")
for r in results:
    print(r.score, r.text)`,
    javascript: `import { Client } from 'qora'

const client = new Client({ apiKey: 'qr_your_key' })

await client.createCollection('my_docs')
await client.indexText('my_docs', 'Affordable phones India')

const results = await client.search('my_docs', 'budget phone')
results.forEach(r => console.log(r.score, r.text))`,
    java: `import in.qora.Client;
import in.qora.SearchResult;

Client client = new Client("qr_your_key");

// Create & index
client.createCollection("my_docs");
client.indexText("my_docs", "Our return policy allows 30 day returns.");
client.upload("my_docs", "knowledge_base.pdf");

// Search
List<SearchResult> results = client.search("my_docs", "return order", 5);
for (SearchResult r : results)
    System.out.println(r.getScore() + " " + r.getText());`,
    curl: `curl -X POST https://api.qora.in/search \\
  -H "X-API-Key: qr_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "collection": "my_docs",
    "query": "affordable phone",
    "top_k": 5
  }'`,
  }
  return (
    <div className="bg-[#0d1117] border border-[#1a1a1a] rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 px-4 py-2.5 bg-[#111] border-b border-[#1a1a1a]">
        {[['python','Python'],['javascript','JavaScript'],['java','Java'],['curl','cURL']].map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k)} className={`px-3 py-1 text-xs rounded-md transition font-medium ${tab===k?'bg-[#1a1a1a] text-white':'text-[#555] hover:text-white'}`}>{l}</button>
        ))}
      </div>
      <pre className="p-6 text-sm font-mono text-[#aaa] overflow-x-auto leading-7 whitespace-pre">{code[tab]}</pre>
    </div>
  )
}

function GHIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
}

const FEATURES = [
  { title: 'India Hosted', desc: 'Data stays within Indian borders. DPDP Act compliant. Low latency for Indian users.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg> },
  { title: 'Hybrid Search', desc: 'Semantic + BM25 keyword search combined via RRF. Better results than pure vector search. Configurable alpha per query.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg> },
  { title: 'Namespaces', desc: 'Logical separation within a collection. Search across all namespaces or filter to one — same collection, different contexts.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg> },
  { title: 'RBAC + Multiple Keys', desc: 'Create read-only, read-write, or admin API keys. Revoke any key instantly without affecting others.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z"/></svg> },
  { title: 'Backup & Restore', desc: 'Automatic backups to Cloudflare R2. Restore any collection to any point with one API call.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg> },
  { title: 'SDKs for Every Stack', desc: 'Python, JavaScript, Go, Java, .NET, Rust — pip install qora, npm install qora, Maven, NuGet, Cargo. Works with LangChain, LlamaIndex, Spring Boot.', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25z"/></svg> },
]

const PLANS = [
  { name:'Free', price:'₹0', period:'', yearly:null, features:['200K vectors','2,000 queries/day','512 MB storage','2 projects','Community support','Pauses after 1 week'] },
  { name:'Starter', price:'₹799', period:'/mo', yearly:'₹7,990/yr', features:['2M vectors','20K queries/day','5 GB storage','5 projects','Email support','Never pauses'] },
  { name:'Growth', price:'₹3,999', period:'/mo', yearly:'₹39,990/yr', popular:true, features:['15M vectors','100K queries/day','30 GB storage','15 projects','Priority support','Metadata filters','Never pauses'] },
  { name:'Scale', price:'₹12,999', period:'/mo', yearly:'₹1,29,990/yr', features:['100M vectors','1M queries/day','200 GB storage','Unlimited projects','Dedicated Slack','99.9% SLA'] },
]
