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
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 border-r border-[var(--border)] bg-[var(--bg-surface)] flex-shrink-0 overflow-y-auto">
        <div className="p-4">
          {NAV.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
              <p className="section-label px-2 mb-2">{group.group}</p>
              <div className="space-y-px">
                {group.items.map(item => (
                  <button key={item.id} onClick={() => setActive(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      active === item.id
                        ? 'bg-blue-600/10 text-blue-400 font-medium'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}>
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition px-2">
              Interactive API Docs
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {doc && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-2">{doc.title}</h1>
                <p className="text-[var(--text-muted)] text-sm font-mono">{doc.desc}</p>
                <div className="mt-4 h-px bg-[var(--border)]"/>
              </div>

              <div className="space-y-8">
                {doc.sections.map((sec, si) => (
                  <div key={si}>
                    {sec.heading && (
                      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <span className="text-[var(--text-dim)] text-xs font-mono">{String(si + 1).padStart(2, '0')}</span>
                        {sec.heading}
                      </h2>
                    )}
                    {sec.text && (
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
                        {renderBold(sec.text)}
                      </p>
                    )}
                    {sec.list && (
                      <ul className="space-y-1.5 mb-3">
                        {sec.list.map((item, li) => (
                          <li key={li} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <span className="text-[var(--text-dim)] mt-1">·</span>
                            <span>{renderBold(item)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {sec.code && (
                      <div className="relative group">
                        <div className="flex items-center justify-between bg-[var(--bg-surface2)] border border-[var(--border)] rounded-t-lg px-4 py-2">
                          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider">{sec.lang}</span>
                          <button onClick={() => copy(sec.code, `${si}`)}
                            className="text-[10px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition opacity-0 group-hover:opacity-100">
                            {copied === `${si}` ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="bg-[var(--bg-base)] border border-t-0 border-[var(--border)] rounded-b-lg p-4 text-xs text-[var(--text-secondary)] font-mono overflow-x-auto leading-relaxed whitespace-pre">
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
