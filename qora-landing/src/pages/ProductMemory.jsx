import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function ProductMemory() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">
          Qora Memory
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
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
      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Memory types</p>
          <h2 className="text-3xl font-bold mb-4">Four types. One API.</h2>
          <p className="text-[#666] mb-12 max-w-2xl">Different information has different lifespans. Qora handles TTL automatically — you just choose the type.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                type: 'short_term',
                title: 'Short-term',
                ttl: 'Expires in 1 hour',
                desc: 'Current session context. What the user said in this conversation. Auto-deleted after the session ends.',
                example: '"User just asked about return policy"',
                color: 'text-yellow-400',
              },
              {
                type: 'long_term',
                title: 'Long-term',
                ttl: 'Never expires',
                desc: 'Permanent facts about the user. Preferences, past decisions, profile data. Stays forever until explicitly deleted.',
                example: '"User prefers dark mode, lives in Bangalore"',
                color: 'text-green-400',
              },
              {
                type: 'episodic',
                title: 'Episodic',
                ttl: 'Expires in 30 days',
                desc: 'Specific events and interactions. "User bought X on Y date." Useful for recent context without cluttering forever.',
                example: '"User purchased iPhone 15 on Jan 5, 2026"',
                color: 'text-blue-400',
              },
              {
                type: 'semantic',
                title: 'Semantic',
                ttl: 'Never expires',
                desc: 'World knowledge and facts. Things the agent has learned — not about the user, but about the domain.',
                example: '"Apple products have 1 year warranty in India"',
                color: 'text-purple-400',
              },
            ].map((m, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <div className="flex items-center justify-between mb-3">
                  <code className={`text-xs font-mono ${m.color}`}>{m.type}</code>
                  <span className="text-xs text-[#555] border border-[#222] px-2 py-0.5 rounded-full">{m.ttl}</span>
                </div>
                <h3 className="font-semibold mb-2">{m.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed mb-3">{m.desc}</p>
                <div className="text-xs text-[#444] font-mono bg-[#111] border border-[#1a1a1a] rounded px-3 py-2">{m.example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API example */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">API</p>
          <h2 className="text-3xl font-bold mb-12">Simple. Powerful. Pluggable.</h2>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              {[
                { label: 'Store a memory', code: `POST /memory/{agent_id}/remember\n{\n  "content": "User prefers dark mode",\n  "memory_type": "long_term"\n}` },
                { label: 'Recall relevant memories', code: `POST /memory/{agent_id}/recall\n{\n  "query": "what does the user prefer?",\n  "top_k": 5\n}` },
                { label: 'Clear all memories', code: `DELETE /memory/{agent_id}` },
              ].map((a, i) => (
                <div key={i}>
                  <p className="text-xs text-[#555] mb-2">{a.label}</p>
                  <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 text-xs font-mono text-[#aaa] overflow-x-auto">{a.code}</pre>
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
                    'Works with any LLM — OpenAI, Gemini, or your own model',
                    'No separate infra — memory lives in the same Qora instance',
                    'Scale to thousands of agents — one collection, many namespaces',
                    'Full REST API — plug into any language or framework',
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
