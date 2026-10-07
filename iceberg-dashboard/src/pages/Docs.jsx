import { useState } from 'react'
import { API_URL } from '../lib/config'

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
      {
        heading: '1. Sign up and get your API key',
        text: 'Create an account at dashboard.icebergdb.io. After signup, your API key is automatically generated and saved. Find it under API Keys in the sidebar.',
      },
      {
        heading: '2. Install the Python SDK',
        code: `pip install iceberg-db`,
        lang: 'bash',
      },
      {
        heading: '3. Create a collection and index text',
        code: `from iceberg import Client

client = Client(api_key="ib_your_api_key")

# Create a collection
client.create_collection("my_docs")

# Index some text
client.index_text("my_docs", "Iceberg is India's vector database for AI teams.")
client.index_text("my_docs", "Hybrid search combines semantic and keyword search.")

# Search
results = client.search("my_docs", "what is Iceberg?")
for r in results:
    print(f"{r.score:.2f} — {r.text}")`,
        lang: 'python',
      },
      {
        heading: "That's it",
        text: "You've indexed your first vectors and run a semantic search. Explore the sidebar to learn about collections, hybrid search, agent memory, and more.",
      }
    ]
  },

  authentication: {
    title: 'Authentication',
    desc: 'All API requests require an API key.',
    sections: [
      {
        heading: 'API Key header',
        text: 'Pass your API key in the X-API-Key header on every request.',
        code: `curl https://api.icebergdb.io/collections \\
  -H "X-API-Key: ib_your_api_key"`,
        lang: 'bash',
      },
      {
        heading: 'Key roles',
        text: 'Three permission levels are available:',
        list: [
          '**admin** — full access: create, delete, index, search',
          '**read_write** — can index and search, cannot delete collections',
          '**read_only** — search only, no write access',
        ]
      },
      {
        heading: 'Create additional keys',
        code: `# Via SDK
key = client.create_key(name="production", role="read_write")
print(key.api_key)  # ib_...

# Via REST
curl -X POST .../auth/keys \\
  -H "X-API-Key: ib_admin_key" \\
  -d '{"name": "prod", "role": "read_write"}'`,
        lang: 'bash',
      }
    ]
  },

  concepts: {
    title: 'Core Concepts',
    desc: 'Key terms and how Iceberg works under the hood.',
    sections: [
      {
        heading: 'Collections',
        text: 'A collection is a named container for your vectors — like a table in a database. Each collection stores chunks of text along with their vector embeddings.',
      },
      {
        heading: 'Chunks',
        text: 'When you index text or a file, Iceberg automatically splits it into smaller pieces (chunks), embeds each chunk, and stores them. This is what enables granular, accurate search.',
      },
      {
        heading: 'Hybrid Search',
        text: 'Iceberg combines two search methods: semantic (vector similarity) and keyword (BM25). The alpha parameter controls the blend — 0.0 = pure keyword, 1.0 = pure semantic, 0.5 = balanced.',
        code: `results = client.search(
    "my_docs",
    "return policy",
    search_type="hybrid",
    alpha=0.5  # 50% semantic, 50% keyword
)`,
        lang: 'python',
      },
      {
        heading: 'Embeddings',
        text: 'Iceberg uses multilingual-e5-large (1024 dimensions) to embed text. This model handles English, Hindi, and 90+ other languages.',
      }
    ]
  },

  collections: {
    title: 'Collections API',
    desc: 'Create, list, and delete collections.',
    sections: [
      {
        heading: 'Create collection',
        code: `# Python
client.create_collection("products")

# REST
POST /collections
{
  "name": "products",
  "description": "Product catalog"
}`,
        lang: 'python',
      },
      {
        heading: 'List collections',
        code: `# Python
collections = client.list_collections()
# → ['products', 'support_docs', 'faqs']

# REST
GET /collections`,
        lang: 'python',
      },
      {
        heading: 'Delete collection',
        code: `# Python
client.delete_collection("products")

# REST
DELETE /collections/{name}`,
        lang: 'python',
      }
    ]
  },

  indexing: {
    title: 'Indexing',
    desc: 'Add content to your collections.',
    sections: [
      {
        heading: 'Index plain text',
        code: `client.index_text(
    collection="my_docs",
    text="Your text content here.",
    source="manual"  # optional metadata
)`,
        lang: 'python',
      },
      {
        heading: 'Upload a file',
        code: `# Python — local file
client.upload("my_docs", "policy.pdf")

# Supported: PDF, TXT, MD
# Iceberg auto-chunks and embeds the file`,
        lang: 'python',
      },
      {
        heading: 'JavaScript',
        code: `import { Client } from 'iceberg-db'
const client = new Client({ apiKey: 'ib_your_key' })

// Index text
await client.indexText('my_docs', 'Content here')

// Upload file (browser)
const file = fileInput.files[0]
await client.uploadFile('my_docs', file)`,
        lang: 'javascript',
      },
      {
        heading: 'REST — index text',
        code: `curl -X POST .../documents/text \\
  -H "X-API-Key: ib_key" \\
  -F "collection=my_docs" \\
  -F "text=Your content here"`,
        lang: 'bash',
      }
    ]
  },

  search: {
    title: 'Search API',
    desc: 'Query your collections with semantic, keyword, or hybrid search.',
    sections: [
      {
        heading: 'Basic search',
        code: `results = client.search("my_docs", "return policy")

for r in results:
    print(f"{r.score:.2f}  {r.text[:80]}")`,
        lang: 'python',
      },
      {
        heading: 'Search modes',
        code: `# Hybrid (default) — best for most use cases
results = client.search("docs", "query", search_type="hybrid", alpha=0.5)

# Pure semantic — meaning-based
results = client.search("docs", "query", search_type="semantic")

# Pure keyword — exact term matching
results = client.search("docs", "query", search_type="keyword")`,
        lang: 'python',
      },
      {
        heading: 'Parameters',
        list: [
          '**top_k** (int, default 5) — number of results to return',
          '**search_type** (string) — "hybrid", "semantic", or "keyword"',
          '**alpha** (float, 0–1) — semantic weight in hybrid mode',
        ]
      },
      {
        heading: 'REST',
        code: `POST /search
{
  "collection": "my_docs",
  "query": "affordable laptop",
  "top_k": 5,
  "search_type": "hybrid",
  "alpha": 0.5
}`,
        lang: 'json',
      }
    ]
  },

  memory: {
    title: 'Agent Memory',
    desc: 'Persistent long-term memory for AI agents.',
    sections: [
      {
        heading: 'Store a memory',
        code: `client.remember(
    agent_id="user_123",
    content="User prefers formal tone. Works at a startup.",
    memory_type="long_term"  # long_term | short_term | episodic | semantic
)`,
        lang: 'python',
      },
      {
        heading: 'Recall memories',
        code: `memories = client.recall("user_123", "what tone does user prefer?", top_k=3)

for m in memories:
    print(f"{m.score:.2f}  {m.content}")`,
        lang: 'python',
      },
      {
        heading: 'Memory types',
        list: [
          '**long_term** — permanent, never expires',
          '**short_term** — expires in 1 hour',
          '**episodic** — expires in 30 days',
          '**semantic** — factual knowledge, permanent',
        ]
      },
      {
        heading: 'REST',
        code: `# Store
POST /memory/{agent_id}/remember
{ "content": "...", "memory_type": "long_term" }

# Recall
POST /memory/{agent_id}/recall
{ "query": "...", "top_k": 5 }

# Clear
DELETE /memory/{agent_id}`,
        lang: 'bash',
      }
    ]
  },

  assistants: {
    title: 'Assistants',
    desc: 'No-code RAG chatbots — upload docs, get a working chatbot.',
    sections: [
      {
        heading: 'Create an assistant',
        text: 'Go to Assistants in the sidebar → New assistant. Set a name, greeting message, and connect your LLM API key (OpenAI or Gemini).',
      },
      {
        heading: 'Upload training documents',
        text: 'Upload PDFs, text files, or markdown. Iceberg automatically chunks and indexes them into your assistant\'s knowledge base.',
      },
      {
        heading: 'Embed on your website',
        code: `<script src="https://api.icebergdb.io/assistant/{id}/widget.js"></script>`,
        lang: 'html',
      },
      {
        heading: 'WhatsApp integration',
        text: 'Point your WhatsApp Business webhook to the assistant\'s webhook URL. Users can then chat with your assistant directly on WhatsApp.',
        code: `Webhook URL:
https://api.icebergdb.io/assistant/{id}/whatsapp`,
        lang: 'text',
      }
    ]
  },

  python: {
    title: 'Python SDK',
    desc: 'Official Python client for Iceberg.',
    sections: [
      {
        heading: 'Install',
        code: `pip install iceberg-db`,
        lang: 'bash',
      },
      {
        heading: 'Initialize',
        code: `from iceberg import Client

client = Client(
    api_key="ib_your_key",
    base_url="https://api.icebergdb.io"  # optional
)`,
        lang: 'python',
      },
      {
        heading: 'Full example',
        code: `from iceberg import Client

client = Client(api_key="ib_your_key")

# Collections
client.create_collection("products")
collections = client.list_collections()

# Index
client.index_text("products", "Premium wireless headphones — Rs 2999")
client.upload("products", "catalog.pdf")

# Search
results = client.search("products", "budget headphones", top_k=5)

# Memory
client.remember("agent_001", "User is a developer", memory_type="long_term")
memories = client.recall("agent_001", "who is the user?")`,
        lang: 'python',
      }
    ]
  },

  javascript: {
    title: 'JavaScript SDK',
    desc: 'Official JS/TS client — works in Node.js, Next.js, Deno, Bun.',
    sections: [
      {
        heading: 'Install',
        code: `npm install iceberg-db
# or
yarn add iceberg-db`,
        lang: 'bash',
      },
      {
        heading: 'Initialize',
        code: `import { Client } from 'iceberg-db'

const client = new Client({
  apiKey: process.env.ICEBERG_API_KEY,
  // baseUrl: 'https://...' — optional
})`,
        lang: 'javascript',
      },
      {
        heading: 'Usage',
        code: `// Create collection
await client.createCollection('docs')

// Index
await client.indexText('docs', 'Your content here')
await client.uploadFile('docs', file)  // browser File object

// Search
const results = await client.search('docs', 'your query', {
  topK: 5,
  searchType: 'hybrid',
  alpha: 0.5
})

results.forEach(r => console.log(r.score, r.text))`,
        lang: 'javascript',
      }
    ]
  },

  rest: {
    title: 'REST API',
    desc: `Base URL: ${API_URL}`,
    sections: [
      {
        heading: 'Authentication',
        code: `X-API-Key: ib_your_api_key`,
        lang: 'text',
      },
      {
        heading: 'Endpoints',
        list: [
          'GET /health — API status',
          'POST /auth/signup — Create account',
          'POST /auth/login — Login',
          'GET /collections — List collections',
          'POST /collections — Create collection',
          'DELETE /collections/{name} — Delete collection',
          'POST /documents/text — Index text',
          'POST /documents/upload — Upload file',
          'POST /search — Search',
          'POST /memory/{id}/remember — Store memory',
          'POST /memory/{id}/recall — Recall memory',
          'GET /usage/logs — Activity logs',
          'GET /usage/stats — Usage stats',
        ]
      },
      {
        heading: 'Interactive docs',
        text: `Full OpenAPI documentation with live testing is available at:`,
        code: `${API_URL}/docs`,
        lang: 'text',
      }
    ]
  },
}

function renderBold(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-[var(--text-primary)] font-semibold">{part}</strong>
      : part
  )
}

export default function Docs() {
  const [active, setActive] = useState('quickstart')
  const [copied, setCopied] = useState('')
  const doc = CONTENT[active]

  const copy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Documentation &amp; API Reference</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {doc?.title || 'Guides'}
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Complete architectural guides, SDK references, and interactive API documentation for Iceberg.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`${API_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            <span>Open Interactive Swagger Docs</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>API Version</span>
            <span className="text-blue-400">Spec</span>
          </div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">v1.0.0</div>
          <p className="text-[11px] text-[var(--text-dim)]">FastAPI OpenAPI 3.1</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Backend Host</span>
            <span className="text-emerald-400">Live</span>
          </div>
          <div className="text-xs font-bold font-mono text-[var(--text-primary)] truncate" title={API_URL}>
            {API_URL.replace('https://', '')}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Render cloud cluster</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Vector Engine</span>
            <span className="text-purple-400">Core</span>
          </div>
          <div className="text-base font-bold font-mono text-[var(--text-primary)]">384d Cosine</div>
          <p className="text-[11px] text-[var(--text-dim)]">MiniLM-L6 embeddings</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Hybrid Pipeline</span>
            <span className="text-amber-400">RRF</span>
          </div>
          <div className="text-base font-bold font-mono text-[var(--text-primary)]">ANN + BM25</div>
          <p className="text-[11px] text-[var(--text-dim)]">Dense + Sparse fusion</p>
        </div>
      </div>

      {/* ── 3. Split Docs Navigation & Content Hub ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 space-y-5 sticky top-6 shadow-sm">
          {NAV.map((group, gi) => (
            <div key={gi} className="space-y-1.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-dim)] px-2 font-semibold">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                      active === item.id
                        ? 'bg-blue-600/10 text-blue-400 font-semibold border border-blue-500/20'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <span>{item.title}</span>
                    {active === item.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-[var(--border)]">
            <a
              href={`${API_URL}/docs`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 text-xs text-blue-400 hover:text-blue-300 font-medium transition rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20"
            >
              <span>Swagger UI Playground</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right Content Area (9 cols) */}
        <div className="lg:col-span-9 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          {doc && (
            <>
              <div className="pb-4 border-b border-[var(--border)]">
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {doc.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {doc.desc}
                </p>
              </div>

              <div className="space-y-8">
                {doc.sections.map((sec, si) => (
                  <div key={si} className="space-y-3">
                    {sec.heading && (
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                          {String(si + 1).padStart(2, '0')}
                        </span>
                        <span>{sec.heading}</span>
                      </h3>
                    )}

                    {sec.text && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {renderBold(sec.text)}
                      </p>
                    )}

                    {sec.list && (
                      <ul className="space-y-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
                        {sec.list.map((item, li) => (
                          <li key={li} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                            <span className="text-blue-400 font-bold mt-0.5">›</span>
                            <span>{renderBold(item)}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {sec.code && (
                      <div className="relative group rounded-xl overflow-hidden border border-[var(--border)] shadow-xs">
                        <div className="flex items-center justify-between bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 py-2">
                          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider font-semibold">
                            {sec.lang}
                          </span>
                          <button
                            onClick={() => copy(sec.code, `${si}`)}
                            className="text-[11px] text-blue-400 hover:text-blue-300 transition font-medium"
                          >
                            {copied === `${si}` ? '✓ Copied' : 'Copy Code'}
                          </button>
                        </div>
                        <pre className="p-4 bg-[var(--input-bg)] text-xs text-[var(--text-secondary)] font-mono overflow-x-auto leading-relaxed select-all">
                          {sec.code}
                        </pre>
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
  )
}
