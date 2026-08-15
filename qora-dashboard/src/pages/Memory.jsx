import { useState } from 'react'

const KEY = () => localStorage.getItem('qora_api_key') || 'qr_dev_test123'
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

export default function Memory() {
  const [agentId, setAgentId] = useState('')
  const [content, setContent] = useState('')
  const [memType, setMemType] = useState('long_term')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [storing, setStoring] = useState(false)
  const [recalling, setRecalling] = useState(false)
  const [stored, setStored] = useState(false)

  const remember = async (e) => {
    e.preventDefault()
    if (!agentId || !content) return
    setStoring(true)
    await fetch(`/api/memory/${agentId}/remember`, {
      method: 'POST', headers: H(),
      body: JSON.stringify({ content, memory_type: memType })
    })
    setStoring(false)
    setStored(true)
    setContent('')
    setTimeout(() => setStored(false), 2000)
  }

  const recall = async (e) => {
    e.preventDefault()
    if (!agentId || !query) return
    setRecalling(true)
    const r = await fetch(`/api/memory/${agentId}/recall`, {
      method: 'POST', headers: H(),
      body: JSON.stringify({ query, top_k: 5 })
    })
    const data = await r.json()
    setResults(data)
    setRecalling(false)
  }

  const clear = async () => {
    if (!agentId || !confirm(`Clear all memories for agent "${agentId}"?`)) return
    await fetch(`/api/memory/${agentId}`, { method: 'DELETE', headers: H() })
    setResults(null)
    alert('Cleared.')
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Agent Memory</h1>
        <p className="text-[var(--text-muted)] text-sm">Store and recall long-term memory for AI agents</p>
      </div>

      {/* Agent ID */}
      <div className="mb-6">
        <label className="text-[var(--text-secondary)] text-xs mb-2 block">Agent ID</label>
        <input value={agentId} onChange={e => setAgentId(e.target.value)}
          placeholder="e.g. user_123 or my_agent"
          className="w-full max-w-xs bg-[var(--card-bg)] border border-[var(--border2)] rounded-md px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)]" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Store memory */}
        <div className="bg-[var(--card-bg)] border border-[var(--border2)] rounded-lg p-5">
          <h3 className="text-[var(--text-primary)] font-medium mb-4">Store Memory</h3>
          <form onSubmit={remember} className="space-y-3">
            <div>
              <label className="text-[var(--text-secondary)] text-xs mb-1 block">Memory type</label>
              <select value={memType} onChange={e => setMemType(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-600">
                <option value="long_term">Long-term — permanent</option>
                <option value="short_term">Short-term — 1 hour</option>
                <option value="episodic">Episodic — 30 days</option>
                <option value="semantic">Semantic — facts</option>
              </select>
            </div>
            <div>
              <label className="text-[var(--text-secondary)] text-xs mb-1 block">Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="User prefers dark mode. Lives in Delhi. Works at TCS."
                rows={4}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)] resize-none" />
            </div>
            <button type="submit" disabled={storing || !agentId}
              className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-[var(--text-primary)] text-sm font-medium transition">
              {stored ? '✓ Stored' : storing ? 'Storing...' : 'Remember'}
            </button>
          </form>
        </div>

        {/* Recall */}
        <div className="bg-[var(--card-bg)] border border-[var(--border2)] rounded-lg p-5">
          <h3 className="text-[var(--text-primary)] font-medium mb-4">Recall Memory</h3>
          <form onSubmit={recall} className="space-y-3">
            <div>
              <label className="text-[var(--text-secondary)] text-xs mb-1 block">Search query</label>
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Where does the user live?"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)]" />
            </div>
            <button type="submit" disabled={recalling || !agentId}
              className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-[var(--text-primary)] text-sm font-medium transition">
              {recalling ? 'Searching...' : 'Recall'}
            </button>
            {agentId && (
              <button type="button" onClick={clear}
                className="w-full py-2.5 rounded-md border border-[var(--border2)] hover:border-red-900/50 text-[var(--text-muted)] hover:text-red-400 text-sm transition">
                Clear all memories
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-6">
          <div className="text-xs text-[var(--text-secondary)] mb-3">{results.memories?.length || 0} memories found for "{results.query}"</div>
          {results.memories?.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border2)] rounded-lg p-8 text-center text-[var(--text-secondary)] text-sm">
              No memories found. Store some first.
            </div>
          ) : (
            <div className="space-y-3">
              {results.memories?.map((m, i) => (
                <div key={i} className="bg-[var(--card-bg)] border border-[var(--border2)] rounded-lg p-4 hover:border-[#333] transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-hover)] border border-[var(--border2)] px-2 py-0.5 rounded capitalize">{m.type}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${m.score > 0.7 ? 'text-green-400 border-green-900 bg-green-900/20' : 'text-yellow-400 border-yellow-900 bg-yellow-900/20'}`}>
                      {(m.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm">{m.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
