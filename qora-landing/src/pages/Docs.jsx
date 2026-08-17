import { useState } from 'react'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const NAV = [
  {
    group: 'Getting Started',
    items: [
      { id: 'quickstart', title: 'Quickstart' },
      { id: 'authentication', title: 'Authentication' },
      { id: 'concepts', title: 'Core Concepts' },
    ]
  },
  {
    group: 'API Reference',
    items: [
      { id: 'collections', title: 'Collections' },
      { id: 'indexing', title: 'Indexing' },
      { id: 'search', title: 'Search' },
      { id: 'memory', title: 'Agent Memory' },
      { id: 'assistants', title: 'Assistants' },
    ]
  },
  {
    group: 'SDKs',
    items: [
      { id: 'python', title: 'Python' },
      { id: 'javascript', title: 'JavaScript' },
      { id: 'rest', title: 'REST API' },
    ]
  },
]

const CONTENT = {
  quickstart: {
    title: 'Quickstart',
    desc: 'Get up and running in under 5 minutes.',
    sections: [
      { heading: '1. Sign up', text: `Create a free account at ${D}/signup. Your API key is generated automatically after signup.` },
      { heading: '2. Install SDK', code: `pip install iceberg`, lang: 'bash' },
      { heading: '3. Index and search', code: `from qora import Client

client = Client(api_key="qr_your_key")

client.create_collection("my_docs")
client.index_text("my_docs", "Iceberg is India's vector database.")
client.index_text("my_docs", "Hybrid search combines semantic and keyword.")

results = client.search("my_docs", "what is Iceberg?")
for r in results:
    print(f"{r.score:.2f} — {r.text}")`, lang: 'python' },
      { heading: "That's it", text: "You've indexed vectors and run a semantic search. Explore the sections below to learn more." }
    ]
  },
  authentication: {
    title: 'Authentication',
    desc: 'All API requests require an API key passed in the X-API-Key header.',
    sections: [
      { heading: 'Header', code: `curl ${API}/collections \\\n  -H "X-API-Key: qr_your_key"`, lang: 'bash' },
      { heading: 'Key roles', list: ['**admin** — full access: create, delete, index, search', '**read_write** — index and search only', '**read_only** — search only'] },
      { heading: 'Create additional keys', code: `# Via SDK\nkey = client.create_key(name="prod", role="read_write")\n\n# Via REST\ncurl -X POST ${API}/auth/keys \\\n  -H "X-API-Key: qr_admin_key" \\\n  -d '{"name":"prod","role":"read_write"}'`, lang: 'bash' },
    ]
  },
  concepts: {
    title: 'Core Concepts',
    desc: 'Key terms and how Iceberg works.',
    sections: [
      { heading: 'Collections', text: 'A collection is a named container for your vectors — like a table in a database. Create one per use case (e.g. "products", "support_docs").' },
      { heading: 'Chunks', text: 'When you index text or a file, Iceberg splits it into smaller pieces, embeds each, and stores them. This enables granular, accurate search.' },
      { heading: 'Hybrid Search', text: 'Combines semantic (vector) + keyword (BM25) search. The alpha parameter controls the blend — 0.0 = pure keyword, 1.0 = pure semantic.', code: `results = client.search("docs", "query", search_type="hybrid", alpha=0.5)`, lang: 'python' },
      { heading: 'Embeddings', text: 'Iceberg uses multilingual-e5-large (1024 dimensions). Supports English, Hindi, and 90+ languages.' },
    ]
  },
  collections: {
    title: 'Collections',
    desc: 'Create, list, and delete collections.',
    sections: [
      { heading: 'Create', code: `client.create_collection("products")\n\n# REST\ncurl -X POST ${API}/collections \\\n  -H "X-API-Key: qr_key" \\\n  -d '{"name":"products"}'`, lang: 'bash' },
      { heading: 'List', code: `collections = client.list_collections()\n# → ['products', 'docs']\n\n# REST: GET ${API}/collections`, lang: 'python' },
      { heading: 'Delete', code: `client.delete_collection("products")\n\n# REST: DELETE ${API}/collections/{name}`, lang: 'python' },
    ]
  },
  indexing: {
    title: 'Indexing',
    desc: 'Add content to your collections.',
    sections: [
      { heading: 'Index text', code: `client.index_text("my_docs", "Your content here.", source="optional_tag")`, lang: 'python' },
      { heading: 'Upload file', code: `client.upload("my_docs", "policy.pdf")  # PDF, TXT, MD supported`, lang: 'python' },
      { heading: 'JavaScript', code: `await client.indexText('docs', 'Content here')\nawait client.uploadFile('docs', file)  // browser File`, lang: 'javascript' },
      { heading: 'REST', code: `curl -X POST ${API}/documents/text \\\n  -H "X-API-Key: qr_key" \\\n  -F "collection=my_docs" \\\n  -F "text=Your content"`, lang: 'bash' },
    ]
  },
  search: {
    title: 'Search',
    desc: 'Query your collections semantically.',
    sections: [
      { heading: 'Basic', code: `results = client.search("my_docs", "return policy")\nfor r in results:\n    print(f"{r.score:.2f}  {r.text[:80]}")`, lang: 'python' },
      { heading: 'Search modes', code: `# Hybrid (default)\nclient.search("docs", "query", search_type="hybrid", alpha=0.5)\n\n# Semantic only\nclient.search("docs", "query", search_type="semantic")\n\n# Keyword only\nclient.search("docs", "query", search_type="keyword")`, lang: 'python' },
      { heading: 'Parameters', list: ['**top_k** (int, default 5) — results to return', '**search_type** — "hybrid", "semantic", "keyword"', '**alpha** (0–1) — semantic weight in hybrid mode'] },
      { heading: 'REST', code: `curl -X POST ${API}/search \\\n  -H "X-API-Key: qr_key" \\\n  -d '{"collection":"docs","query":"your query","top_k":5,"search_type":"hybrid","alpha":0.5}'`, lang: 'bash' },
    ]
  },
  memory: {
    title: 'Agent Memory',
    desc: 'Persistent long-term memory for AI agents.',
    sections: [
      { heading: 'Store', code: `client.remember("user_123", "Prefers dark mode. Works at a startup.", memory_type="long_term")`, lang: 'python' },
      { heading: 'Recall', code: `memories = client.recall("user_123", "what tone does user prefer?", top_k=3)\nfor m in memories:\n    print(f"{m.score:.2f}  {m.content}")`, lang: 'python' },
      { heading: 'Memory types', list: ['**long_term** — permanent', '**short_term** — expires in 1 hour', '**episodic** — expires in 30 days', '**semantic** — factual knowledge'] },
    ]
  },
  assistants: {
    title: 'Assistants',
    desc: 'No-code RAG chatbots — upload docs, get a chatbot.',
    sections: [
      { heading: 'Create', text: `Go to ${D} → Assistants → New assistant. Add name, greeting, and your LLM API key.` },
      { heading: 'Embed on website', code: `<script src="${API}/assistant/{id}/widget.js"></script>`, lang: 'html' },
      { heading: 'WhatsApp', text: 'Point your WhatsApp Business webhook to the assistant webhook URL. Users can chat directly on WhatsApp.', code: `Webhook: ${API}/assistant/{id}/whatsapp`, lang: 'text' },
    ]
  },
  python: {
    title: 'Python SDK',
    desc: 'pip install iceberg',
    sections: [
      { heading: 'Install', code: `pip Install Iceberg`, lang: 'bash' },
      { heading: 'Full example', code: `from qora import Client\n\nclient = Client(api_key="qr_key")\n\nclient.create_collection("products")\nclient.index_text("products", "Wireless headphones — Rs 2999")\nclient.upload("products", "catalog.pdf")\n\nresults = client.search("products", "budget headphones")\n\nclient.remember("agent_1", "User is a developer", memory_type="long_term")\nmemories = client.recall("agent_1", "who is the user?")`, lang: 'python' },
    ]
  },
  javascript: {
    title: 'JavaScript SDK',
    desc: 'npm install iceberg — works in Node.js, Next.js, Deno, Bun.',
    sections: [
      { heading: 'Install', code: `npm Install Iceberg`, lang: 'bash' },
      { heading: 'Usage', code: `import { Client } from 'Iceberg'\n\nconst client = new Client({ apiKey: process.env.QORA_API_KEY })\n\nawait client.createCollection('docs')\nawait client.indexText('docs', 'Your content')\n\nconst results = await client.search('docs', 'query', { topK: 5, searchType: 'hybrid' })\nresults.forEach(r => console.log(r.score, r.text))`, lang: 'javascript' },
    ]
  },
  rest: {
    title: 'REST API',
    desc: `Base URL: ${API}`,
    sections: [
      { heading: 'Auth header', code: `X-API-Key: qr_your_key`, lang: 'text' },
      { heading: 'Endpoints', list: ['GET /health', 'POST /auth/signup', 'POST /auth/login', 'GET /collections', 'POST /collections', 'DELETE /collections/{name}', 'POST /documents/text', 'POST /documents/upload', 'POST /search', 'POST /memory/{id}/remember', 'POST /memory/{id}/recall', 'GET /usage/logs', 'GET /usage/stats'] },
      { heading: 'Interactive API explorer', text: 'Full OpenAPI docs with live testing:', code: `${API}/docs`, lang: 'text' },
    ]
  },
}

function renderBold(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
  )
}

export default function Docs() {
  const [dark] = useState(true)
  const [active, setActive] = useState('quickstart')
  const [copied, setCopied] = useState('')
  const doc = CONTENT[active]

  const copy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar dark={dark} />

      <div className="flex" style={{ height: 'calc(100vh - 49px)' }}>
        {/* Sidebar */}
        <div className="w-60 border-r border-[#1a1a1a] flex-shrink-0 overflow-y-auto bg-[#0a0a0a]">
          <div className="p-5">
            <p className="text-xs font-bold text-[#666] uppercase tracking-widest mb-5">Documentation</p>
            {NAV.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-6' : ''}>
                <p className="text-[10px] font-semibold text-[#444] uppercase tracking-widest px-2 mb-2">{group.group}</p>
                <div className="space-y-px">
                  {group.items.map(item => (
                    <button key={item.id} onClick={() => setActive(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        active === item.id
                          ? 'bg-blue-600/15 text-blue-400 font-medium'
                          : 'text-[#666] hover:text-[#aaa] hover:bg-[#141414]'
                      }`}>
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-8 pt-5 border-t border-[#1a1a1a]">
              <a href={`${API}/docs`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition px-2">
                Interactive API Docs
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-10 py-10">
            {doc && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-white tracking-tight mb-2">{doc.title}</h1>
                  <p className="text-[#555] text-sm font-mono">{doc.desc}</p>
                  <div className="mt-5 h-px bg-[#1a1a1a]"/>
                </div>

                <div className="space-y-8">
                  {doc.sections.map((sec, si) => (
                    <div key={si}>
                      {sec.heading && (
                        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <span className="text-[#333] text-xs font-mono">{String(si + 1).padStart(2, '0')}</span>
                          {sec.heading}
                        </h2>
                      )}
                      {sec.text && <p className="text-[#777] text-sm leading-relaxed mb-3">{renderBold(sec.text)}</p>}
                      {sec.list && (
                        <ul className="space-y-2 mb-3">
                          {sec.list.map((item, li) => (
                            <li key={li} className="flex items-start gap-2 text-sm text-[#777]">
                              <span className="text-[#333] mt-1 shrink-0">·</span>
                              <span>{renderBold(item)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {sec.code && (
                        <div className="relative group rounded-xl overflow-hidden border border-[#1a1a1a]">
                          <div className="flex items-center justify-between bg-[#0f0f0f] px-4 py-2 border-b border-[#1a1a1a]">
                            <span className="text-[10px] font-mono text-[#444] uppercase tracking-wider">{sec.lang}</span>
                            <button onClick={() => copy(sec.code, `${si}`)}
                              className="text-[10px] text-[#444] hover:text-[#888] transition opacity-0 group-hover:opacity-100">
                              {copied === `${si}` ? '✓ Copied' : 'Copy'}
                            </button>
                          </div>
                          <pre className="bg-[#080808] p-5 text-xs text-[#aaa] font-mono overflow-x-auto leading-relaxed whitespace-pre">{sec.code}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
