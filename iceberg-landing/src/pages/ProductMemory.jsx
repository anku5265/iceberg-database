import Footer from '../components/Footer'
import IcebergLogo from "../components/IcebergLogo"
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { CodeBlock } from '../components/CodeBlock'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

const MEMORY_SNIPPETS = {
  python: [
    {
      label: '1. Store a memory (Python SDK)',
      lang: 'python · remember.py',
      code: `from iceberg import Client

client = Client(api_key="ib_your_key")

# Store persistent user preference in long-term memory
client.remember(
    agent_id="agent_001",
    content="User prefers dark mode and concise TypeScript code",
    memory_type="long_term"
)`,
    },
    {
      label: '2. Recall relevant memories semantically',
      lang: 'python · recall.py',
      code: `memories = client.recall(
    agent_id="agent_001",
    query="what are the user's UI and coding preferences?",
    top_k=5
)
for m in memories:
    print(f"{m.score:.2f} | {m.content}")`,
    },
    {
      label: '3. Clear all memories for an agent',
      lang: 'python · clear.py',
      code: `client.clear_memory(agent_id="agent_001")`,
    },
  ],
  curl: [
    {
      label: '1. Store a memory (cURL REST API)',
      lang: 'bash · POST /memory/{agent_id}/remember',
      code: `curl -X POST https://api.icebergdb.in/memory/agent_001/remember \\
  -H "X-API-Key: ib_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "User prefers dark mode and concise TypeScript code",
    "memory_type": "long_term"
  }'`,
    },
    {
      label: '2. Recall relevant memories (cURL REST API)',
      lang: 'bash · POST /memory/{agent_id}/recall',
      code: `curl -X POST https://api.icebergdb.in/memory/agent_001/recall \\
  -H "X-API-Key: ib_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "what does the user prefer?",
    "top_k": 5
  }'`,
    },
    {
      label: '3. Clear all memories (cURL REST API)',
      lang: 'bash · DELETE /memory/{agent_id}',
      code: `curl -X DELETE https://api.icebergdb.in/memory/agent_001 \\
  -H "X-API-Key: ib_your_key"`,
    },
  ],
}

export default function ProductMemory() {
  const [dark] = useState(true)
  const [mode, setMode] = useState('python')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-12 pb-10 md:pt-24 md:pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">
          Iceberg Memory
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Agents that remember.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Persistently.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Give every AI agent long-term memory. Short-term context, episodic events, semantic facts — all stored, searched, and auto-expired via a single API.
        </p>
        <div className="flex gap-3">
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">Get started</a>
          <a href={`${D}/docs`} className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">API reference</a>
        </div>
      </section>

      {/* 4 memory types */}
      <section className="border-y border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Memory types</p>
          <h2 className="text-3xl font-bold mb-4">Four types. One API.</h2>
          <p className="text-[#666] mb-12 max-w-2xl">Different information has different lifespans. Iceberg handles TTL automatically — you just choose the type.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {[
              {
                type: 'short_term',
                title: 'Short-term',
                ttl: 'Expires in 1 hour',
                desc: 'Current session context. What the user said in this conversation. Auto-deleted after the session ends.',
                example: `client.remember("agent_1", "User asked about return policy", memory_type="short_term")`,
                color: 'text-yellow-400',
              },
              {
                type: 'long_term',
                title: 'Long-term',
                ttl: 'Never expires',
                desc: 'Permanent facts about the user. Preferences, past decisions, profile data. Stays forever until explicitly deleted.',
                example: `client.remember("agent_1", "User prefers dark mode, lives in Bangalore", memory_type="long_term")`,
                color: 'text-green-400',
              },
              {
                type: 'episodic',
                title: 'Episodic',
                ttl: 'Expires in 30 days',
                desc: 'Specific events and interactions. "User bought X on Y date." Useful for recent context without cluttering forever.',
                example: `client.remember("agent_1", "User purchased Starter Plan on Oct 24", memory_type="episodic")`,
                color: 'text-blue-400',
              },
              {
                type: 'semantic',
                title: 'Semantic',
                ttl: 'Never expires',
                desc: 'World knowledge and facts. Things the agent has learned — not about the user, but about the domain.',
                example: `client.remember("agent_1", "RBI and DPDP Act require India (ap-south-1) data residency", memory_type="semantic")`,
                color: 'text-purple-400',
              },
            ].map((m, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <code className={`text-xs font-mono ${m.color}`}>{m.type}</code>
                    <span className="text-xs text-[#555] border border-[#222] px-2 py-0.5 rounded-full">{m.ttl}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{m.title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed mb-4">{m.desc}</p>
                </div>
                <CodeBlock code={m.example} label={`python · ${m.type}`} showLineNumbers={false} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API example */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-[#555] uppercase tracking-widest mb-3">API</p>
              <h2 className="text-3xl font-bold">Simple. Powerful. Pluggable.</h2>
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

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              {MEMORY_SNIPPETS[mode].map((a, i) => (
                <div key={i}>
                  <p className="text-xs text-[#777] font-medium mb-2">{a.label}</p>
                  <CodeBlock code={a.code} label={a.lang} />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-[#1a1a1a] p-6">
                <h3 className="font-semibold mb-4">How recall works</h3>
                <ol className="space-y-3 text-sm text-[#666]">
                  {[
                    'Query is embedded into a vector',
                    'Similarity search across all stored memories',
                    'Expired memories are filtered out automatically',
                    'Top-k most relevant memories returned with scores',
                  ].map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-blue-500 font-mono text-xs mt-0.5 flex-shrink-0">0{i+1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-xl border border-[#1a1a1a] p-6">
                <h3 className="font-semibold mb-4">Built for production agents</h3>
                <div className="space-y-3 text-sm text-[#666]">
                  {[
                    'Works with any LLM — OpenAI, Gemini, Hermes, OpenClaw, or local models',
                    'No separate infra — memory lives in the same Iceberg instance',
                    'Scale to thousands of agents — one collection, many namespaces',
                    'Full REST API & SDKs — plug into any language or framework',
                  ].map((s, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Give your agents memory</h2>
          <p className="text-[#666] mb-8">Free tier includes full memory API access.</p>
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">Start building</a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
