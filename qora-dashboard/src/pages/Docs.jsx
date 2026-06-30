import { useState } from 'react'
import { API_URL } from '../lib/config'

const SECTIONS = [
  {
    id: 'quickstart',
    title: 'Quickstart',
    content: `# Quickstart

Get up and running in under 5 minutes.

## 1. Get your API key

Go to **API Keys** in the sidebar to find your key.

## 2. Install the SDK

\`\`\`bash
pip install qora
\`\`\`

## 3. Index your first document

\`\`\`python
from qora import Client

client = Client(api_key="your_api_key")

# Create a collection
client.create_collection("my_docs")

# Index text
client.index_text("my_docs", "Qora is a vector database for Indian AI teams.")

# Search
results = client.search("my_docs", "Indian AI")
for r in results:
    print(r.score, r.text)
\`\`\`
`
  },
  {
    id: 'collections',
    title: 'Collections',
    content: `# Collections

Collections are containers for your vectors — like tables in SQL.

## Create a collection

\`\`\`python
client.create_collection("products")
\`\`\`

## List collections

\`\`\`python
collections = client.list_collections()
print(collections)  # ['products', 'docs']
\`\`\`

## Delete a collection

\`\`\`python
client.delete_collection("products")
\`\`\`

## REST API

\`\`\`bash
# Create
curl -X POST https://api.qora.in/collections \\
  -H "X-API-Key: your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my_collection"}'

# List
curl https://api.qora.in/collections \\
  -H "X-API-Key: your_key"
\`\`\`
`
  },
  {
    id: 'indexing',
    title: 'Indexing',
    content: `# Indexing Documents

Qora automatically chunks, embeds, and stores your content.

## Index plain text

\`\`\`python
client.index_text("my_docs", "Our return policy allows 30 day returns.", source="policy")
client.index_text("my_docs", "Free shipping on orders above Rs 500.", source="faq")
\`\`\`

## Upload a file

\`\`\`python
# PDF, TXT, MD supported
client.upload("my_docs", "company_policy.pdf")
client.upload("my_docs", "readme.md")
\`\`\`

## JavaScript

\`\`\`javascript
import { Client } from 'qora'
const client = new Client({ apiKey: 'your_key' })

await client.indexText('my_docs', 'Your content here')
await client.uploadFile('my_docs', file) // Browser File object
\`\`\`
`
  },
  {
    id: 'search',
    title: 'Search',
    content: `# Semantic Search

Search by meaning — not just exact keywords.

## Basic search

\`\`\`python
results = client.search("my_docs", "can I return my order?")
# Also finds: "return policy", "refund process", "exchange items"

for r in results:
    print(f"Score: {r.score:.2f}")
    print(f"Text: {r.text}")
    print(f"Source: {r.metadata.get('source')}")
\`\`\`

## Search with filters

\`\`\`python
# Only search within a specific source
results = client.search(
    "my_docs",
    "return policy",
    filters={"source": "policy.pdf"}
)
\`\`\`

## Tune results

\`\`\`python
results = client.search(
    "my_docs",
    "your query",
    top_k=10,           # Return top 10 results
    score_threshold=0.5 # Only high-confidence results
)
\`\`\`

## REST API

\`\`\`bash
curl -X POST https://api.qora.in/search \\
  -H "X-API-Key: your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "collection": "my_docs",
    "query": "affordable phone",
    "top_k": 5,
    "filters": {"source": "catalog.pdf"}
  }'
\`\`\`
`
  },
  {
    id: 'sdks',
    title: 'SDKs',
    content: `# SDKs & Libraries

## Python

\`\`\`bash
pip install qora
\`\`\`

Compatible with LangChain and LlamaIndex:

\`\`\`python
# LangChain integration
from langchain.vectorstores import Qdrant  # Use via REST API
\`\`\`

## JavaScript / TypeScript

\`\`\`bash
npm install qora
\`\`\`

\`\`\`typescript
import { Client } from 'qora'

const client = new Client({ apiKey: process.env.QORA_API_KEY })

const results = await client.search('docs', 'your query')
\`\`\`

## REST API

Any language that can make HTTP requests works directly.

Base URL: \`https://api.qora.in\`

Authentication: \`X-API-Key: your_key\` header on all requests
`
  },
]

export default function Docs() {
  const [active, setActive] = useState('quickstart')
  const section = SECTIONS.find(s => s.id === active)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Docs sidebar */}
      <div className="w-52 border-r border-[#1a1a1a] p-4 flex-shrink-0 overflow-y-auto">
        <div className="text-xs text-[#555] uppercase tracking-wider mb-3">Documentation</div>
        <nav className="space-y-0.5">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${active === s.id ? 'bg-[#1a1a1a] text-white' : 'text-[#666] hover:text-white'}`}>
              {s.title}
            </button>
          ))}
        </nav>
        <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
          <a href={`${API_URL}/docs`} target="_blank"
            className="text-xs text-blue-400 hover:text-blue-300 transition block">
            Interactive API Docs ↗
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
        <div className="prose prose-invert prose-sm max-w-none">
          {section?.content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-white mb-4 mt-0">{line.slice(2)}</h1>
            if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-white mt-8 mb-3">{line.slice(3)}</h2>
            if (line.startsWith('```')) return null
            if (line === '') return <div key={i} className="h-2" />
            return <p key={i} className="text-[#aaa] text-sm leading-relaxed">{line}</p>
          })}

          {/* Code blocks */}
          {section?.content.match(/```[\s\S]*?```/g)?.map((block, i) => {
            const lines = block.replace(/```\w*\n?/, '').replace(/```$/, '')
            return (
              <div key={i} className="bg-[#0d1117] border border-[#1a1a1a] rounded-lg p-4 my-3 font-mono text-xs text-[#aaa] overflow-x-auto whitespace-pre">
                {lines}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
