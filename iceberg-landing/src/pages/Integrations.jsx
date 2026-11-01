import Footer from '../components/Footer'
import IcebergLogo from "../components/IcebergLogo"
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { CodeBlock } from '../components/CodeBlock'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

const INTEGRATIONS = [
  {
    name: 'LangChain',
    tag: 'RAG Framework',
    lang: 'python · langchain',
    desc: 'Use Iceberg as your high-speed hybrid retriever in LangChain pipelines, RetrievalQA chains, and conversational agents.',
    code: `from iceberg import Client
from langchain_core.documents import Document

ib = Client(api_key="ib_your_key")
ib.index_text("kb_docs", "Iceberg is hosted in India (ap-south-1) with hybrid RRF vector search.")

# Retrieve context for LangChain RAG pipeline
hits = ib.search("kb_docs", "vector search latency in India", top_k=5)
docs = [Document(page_content=h.text, metadata={"score": h.score}) for h in hits]`,
  },
  {
    name: 'LlamaIndex',
    tag: 'Data Framework',
    lang: 'python · llamaindex',
    desc: 'Connect LlamaIndex query engines and knowledge indices directly to Iceberg collections with built-in embeddings.',
    code: `from iceberg import Client
from llama_index.core.schema import NodeWithScore, TextNode

ib = Client(api_key="ib_your_key")

def iceberg_retrieve(query: str, top_k: int = 5):
    results = ib.search("my_docs", query, top_k=top_k, search_type="hybrid")
    return [
        NodeWithScore(node=TextNode(text=r.text), score=r.score)
        for r in results
    ]`,
  },
  {
    name: 'OpenClaw',
    tag: 'Autonomous Agents',
    lang: 'python · openclaw memory',
    desc: 'Give OpenClaw personal and autonomous agents persistent long-term, episodic, and semantic memory via Iceberg Memory.',
    code: `import requests

API = "https://api.icebergdb.in"
HEADERS = {"X-API-Key": "ib_your_key", "Content-Type": "application/json"}

# Store memory from an OpenClaw agent skill
requests.post(f"{API}/memory/openclaw_agent/remember", headers=HEADERS, json={
    "content": "User prefers concise TypeScript code and dark mode UI.",
    "memory_type": "long_term"
})

# Recall relevant context before executing an OpenClaw task
memories = requests.post(f"{API}/memory/openclaw_agent/recall", headers=HEADERS, json={
    "query": "user coding preferences", "top_k": 5
}).json()`,
  },
  {
    name: 'Hermes & Tool-Calling LLMs',
    tag: 'Function Calling',
    lang: 'python · hermes tools',
    desc: 'Wire Iceberg hybrid search and agent memory directly into Nous Hermes, OpenAI, or local tool-calling models.',
    code: `from iceberg import Client

ib = Client(api_key="ib_your_key")

TOOLS = [{
    "type": "function",
    "function": {
        "name": "iceberg_recall_memory",
        "description": "Search persistent agent memory and knowledge base in Iceberg DB",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"]
        }
    }
}]

def iceberg_recall_memory(query: str):
    return ib.recall("hermes_agent", query, top_k=5)`,
  },
  {
    name: 'CrewAI & LangGraph',
    tag: 'Multi-Agent Memory',
    lang: 'python · crewai / langgraph',
    desc: 'Share unified semantic and episodic memory across multi-agent crews and stateful LangGraph workflows.',
    code: `from iceberg import Client

ib = Client(api_key="ib_your_key")

# Agent A stores research findings into shared episodic memory (30d TTL)
ib.remember("crew_research", "RBI and DPDP Act compliance requires India (ap-south-1) data residency.", memory_type="episodic")

# Agent B recalls shared context during synthesis step
context = ib.recall("crew_research", "Indian data residency compliance", top_k=3)`,
  },
  {
    name: 'MCP (Cursor / Claude Code / Windsurf)',
    tag: 'Model Context Protocol',
    lang: 'json · mcp.json',
    desc: 'Expose your Iceberg collections and agent memory as native MCP tools inside Claude Code, Cursor, Copilot, and Windsurf via our official npm package (npx -y iceberg-mcp).',
    code: `// .cursor/mcp.json — Connect your AI IDE to Iceberg DB (v1.0.0)
{
  "mcpServers": {
    "icebergdb": {
      "command": "npx",
      "args": ["-y", "iceberg-mcp"],
      "env": {
        "ICEBERG_API_URL": "https://api.icebergdb.in",
        "ICEBERG_API_KEY": "ib_your_key"
      }
    }
  }
}`,
  },
]

export default function Integrations() {
  const [dark] = useState(true)
  const [copiedEndpoint, setCopiedEndpoint] = useState('')

  const copyEndpoint = (path) => {
    navigator.clipboard.writeText(`https://api.icebergdb.in${path}`)
    setCopiedEndpoint(path)
    setTimeout(() => setCopiedEndpoint(''), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-12 pb-10 md:pt-24 md:pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Integrations</div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Plug into your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">existing stack.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Iceberg works seamlessly with the AI frameworks and agent runners you already use — LangChain, LlamaIndex, OpenClaw, Hermes, CrewAI, MCP, and standard REST API.
        </p>
      </section>

      {/* Frameworks & Agent Runners */}
      <section className="border-y border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">AI Frameworks &amp; Agent Runners</p>
          <h2 className="text-3xl font-bold mb-12">Works with what you build on</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {INTEGRATIONS.map((f, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white text-base">{f.name}</h3>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      {f.tag}
                    </span>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed mb-4">{f.desc}</p>
                </div>
                <CodeBlock code={f.code} label={f.lang} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REST API */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">REST API</p>
          <h2 className="text-3xl font-bold mb-4">Works with any language or agent</h2>
          <p className="text-[#666] mb-12 max-w-2xl">No SDK? No problem. Every Iceberg feature is available via our low-latency REST API at <code className="text-blue-400">https://api.icebergdb.in</code>. One header (<code className="text-[#aaa]">X-API-Key</code>), simple JSON payloads.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
            {[
              { method: 'POST', path: '/collections', desc: 'Create a collection' },
              { method: 'POST', path: '/documents/text', desc: 'Index raw text (auto-embedded)' },
              { method: 'POST', path: '/documents/upload', desc: 'Upload a PDF or file' },
              { method: 'POST', path: '/search', desc: 'Search (semantic / keyword / hybrid)' },
              { method: 'POST', path: '/memory/{agent_id}/remember', desc: 'Store agent memory (4 TTL tiers)' },
              { method: 'POST', path: '/memory/{agent_id}/recall', desc: 'Recall agent memory semantically' },
              { method: 'POST', path: '/assistant', desc: 'Create a RAG assistant' },
              { method: 'POST', path: '/backup/{collection}', desc: '1-click JSON backup export' },
            ].map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-blue-400 border border-blue-900/40 bg-blue-950/30 px-2 py-0.5 rounded flex-shrink-0">{e.method}</span>
                  <div className="min-w-0">
                    <code className="text-xs font-mono text-white block truncate">{e.path}</code>
                    <span className="text-xs text-[#555]">{e.desc}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyEndpoint(e.path)}
                  className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition cursor-pointer ${
                    copiedEndpoint === e.path
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.04] hover:bg-blue-500/15 text-[#aaa] hover:text-blue-400 border border-white/[0.08]'
                  }`}
                >
                  {copiedEndpoint === e.path ? '✓ Copied' : 'Copy URL'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Start integrating in minutes</h2>
          <p className="text-[#666] mb-8">Full API docs at api.icebergdb.in/docs — interactive, try every endpoint in the browser.</p>
          <div className="flex gap-3 justify-center">
            <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">Get API key</a>
            <a href="https://api.icebergdb.in/docs" target="_blank" rel="noreferrer" className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">API reference ↗</a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
