import { useState, useEffect } from 'react'
import { API_URL } from '../lib/config'
import ConfirmModal from '../components/ConfirmModal'

const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

export default function Memory() {
  const [agentId, setAgentId] = useState('user_ankush')
  const [content, setContent] = useState('')
  const [memType, setMemType] = useState('semantic')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [storing, setStoring] = useState(false)
  const [recalling, setRecalling] = useState(false)
  const [storedNotice, setStoredNotice] = useState(false)
  const [totalMemories, setTotalMemories] = useState(0)
  const [loadingStats, setLoadingStats] = useState(false)

  // Clear modal state
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearedNotice, setClearedNotice] = useState(false)

  // Preload / Seed Demo state
  const [preloading, setPreloading] = useState(false)
  const [copied, setCopied] = useState('')

  // Load memory stats for current agentId
  const loadAgentStats = async (id = agentId) => {
    if (!id.trim()) {
      setTotalMemories(0)
      return
    }
    setLoadingStats(true)
    try {
      const res = await fetch(`${API_URL}/memory/${id.trim()}`, { headers: H() })
      if (res.ok) {
        const data = await res.json()
        setTotalMemories(data.total_memories || 0)
      } else {
        setTotalMemories(0)
      }
    } catch {
      setTotalMemories(0)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    loadAgentStats(agentId)
    const interval = setInterval(() => {
      if (agentId) loadAgentStats(agentId)
    }, 4000)
    return () => clearInterval(interval)
  }, [agentId])

  // Store memory
  const remember = async (e) => {
    e?.preventDefault()
    if (!agentId.trim() || !content.trim()) return
    setStoring(true)
    try {
      const res = await fetch(`${API_URL}/memory/${agentId.trim()}/remember`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({ content: content.trim(), memory_type: memType })
      })
      if (res.ok) {
        setContent('')
        setStoredNotice(true)
        setTimeout(() => setStoredNotice(false), 3000)
        await loadAgentStats(agentId)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStoring(false)
    }
  }

  // Recall memory
  const recall = async (searchQuery = query) => {
    const q = (searchQuery || query).trim()
    if (!agentId.trim() || !q) return
    setRecalling(true)
    try {
      const res = await fetch(`${API_URL}/memory/${agentId.trim()}/recall`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({ query: q, top_k: 5 })
      })
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRecalling(false)
    }
  }

  // Preload Demo Memories (1-click wow factor)
  const handlePreloadDemo = async () => {
    setPreloading(true)
    const targetAgent = 'user_ankush'
    setAgentId(targetAgent)

    const demoMemories = [
      { content: 'Ankush is the founder of IcebergDB, building an ultra-fast vector database in India.', type: 'semantic' },
      { content: 'User prefers dark mode UI with high-contrast text and sub-20ms real-time queries.', type: 'long_term' },
      { content: 'Ankush deployed the Iceberg Assistants and Collections engine on Render and Vercel.', type: 'episodic' },
      { content: 'User requested hybrid search combining dense Cosine similarity with sparse BM25 keyword matching.', type: 'semantic' }
    ]

    try {
      for (const m of demoMemories) {
        await fetch(`${API_URL}/memory/${targetAgent}/remember`, {
          method: 'POST',
          headers: H(),
          body: JSON.stringify({ content: m.content, memory_type: m.type })
        })
      }
      await loadAgentStats(targetAgent)
      setQuery('What startup is Ankush building?')
      await recall('What startup is Ankush building?')
    } catch (err) {
      console.error('Failed to preload demo:', err)
    } finally {
      setPreloading(false)
    }
  }

  // Clear memory
  const confirmClear = async () => {
    if (!agentId) return
    setClearing(true)
    try {
      await fetch(`${API_URL}/memory/${agentId.trim()}`, { method: 'DELETE', headers: H() })
      setResults(null)
      setShowClearModal(false)
      setClearedNotice(true)
      await loadAgentStats(agentId)
      setTimeout(() => setClearedNotice(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setClearing(false)
    }
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const agentPresets = ['user_ankush', 'support_bot_01', 'analytics_agent', 'client_portfolio']

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Agent Memory</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {agentId ? agentId : 'No Agent'}
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Store and recall persistent semantic, episodic, and long-term memory for AI agents with sub-15ms vector retrieval.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadAgentStats(agentId)}
            className="px-3 py-2 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh memory stats"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={loadingStats ? 'animate-spin' : ''}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePreloadDemo}
            disabled={preloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm disabled:opacity-50"
          >
            {preloading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            )}
            <span>{preloading ? 'Indexing Facts...' : '⚡ Quick Demo: Preload Agent'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Target Agent</span>
            <span className="text-blue-400">Namespace</span>
          </div>
          <div className="text-base font-bold font-mono text-[var(--text-primary)] truncate" title={agentId}>
            {agentId || 'None'}
          </div>
          <p className="text-[11px] text-[var(--text-dim)] font-mono">_memory_{agentId || 'id'}</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Active Memories</span>
            <span className="text-emerald-400">Points</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{totalMemories}</div>
          <p className="text-[11px] text-[var(--text-dim)]">Stored vector coordinates</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Memory Engine</span>
            <span className="text-purple-400">HNSW</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">384d Cosine</div>
          <p className="text-[11px] text-[var(--text-dim)]">Dense MiniLM-L6 vectors</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Query Latency</span>
            <span className="text-amber-400">Speed</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">&lt; 15ms</div>
          <p className="text-[11px] text-[var(--text-dim)]">Sub-20ms semantic search</p>
        </div>
      </div>

      {/* ── 3. Agent Selector & Presets ── */}
      <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <label className="text-[var(--text-secondary)] text-xs font-semibold mb-1.5 block">
            Target Agent Identifier
          </label>
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <input
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                placeholder="e.g. user_ankush, my_agent, support_bot"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-blue-600 transition"
              />
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-2.5 top-2.5 text-[var(--text-dim)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            {agentId && (
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition shrink-0"
              >
                Clear Memory
              </button>
            )}
          </div>
        </div>

        {/* Quick Agent Presets */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-[var(--text-dim)] font-medium">Quick Select Agents:</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {agentPresets.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAgentId(preset)
                  loadAgentStats(preset)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  agentId === preset
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Main Two-Column Operations: Store Memory & Recall Memory ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Column: Store Memory */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Store Memory (Write)</span>
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-dim)]">POST /memory/:id/remember</span>
            </div>

            <form onSubmit={remember} className="space-y-4">
              <div>
                <label className="text-[var(--text-secondary)] text-xs font-medium mb-1.5 block">Memory Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'semantic', name: 'Semantic', desc: 'Permanent user facts & preferences' },
                    { id: 'long_term', name: 'Long-term', desc: 'Critical permanent knowledge' },
                    { id: 'episodic', name: 'Episodic', desc: 'Events & interactions (30d TTL)' },
                    { id: 'short_term', name: 'Short-term', desc: 'Session working memory (1h TTL)' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMemType(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        memType === t.id
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                          : 'border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="text-xs font-semibold">{t.name}</div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5 leading-tight">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[var(--text-secondary)] text-xs font-medium">Memory Content</label>
                  <span className="text-[10px] text-[var(--text-dim)]">Will be vectorized into 384d</span>
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="e.g. User prefers dark mode. Lives in Delhi. Works at TCS. Building a vector DB."
                  rows={4}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)] resize-none transition"
                />
              </div>

              {/* Sample Quick Insertion Pills */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-[var(--text-dim)]">Sample memory templates:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'User lives in Delhi and prefers dark mode.',
                    'User is building IcebergDB vector database startup.',
                    'Client requested quarterly billing via Stripe invoice.',
                  ].map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setContent(sample)}
                      className="text-[11px] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-blue-400 px-2 py-0.5 rounded-lg transition text-left truncate max-w-full"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={storing || !agentId.trim() || !content.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold transition shadow-sm flex items-center justify-center gap-2"
              >
                {storing && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{storedNotice ? '✓ Memory Stored in Vector DB!' : storing ? 'Embedding & Indexing...' : 'Remember Memory'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Recall Memory */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Recall Memory (Semantic Search)</span>
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-dim)]">POST /memory/:id/recall</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                recall()
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[var(--text-secondary)] text-xs font-medium mb-1.5 block">Search Query</label>
                <div className="relative">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g. Where does the user live? or What startup is he building?"
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)] transition"
                  />
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-3 top-3 text-[var(--text-dim)]">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
              </div>

              {/* Sample Search Query Pills */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-[var(--text-dim)]">Click to search instantly:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Where does the user live?',
                    'What startup is Ankush building?',
                    'Billing preferences and Stripe invoice',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setQuery(prompt)
                        recall(prompt)
                      }}
                      className="text-[11px] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-emerald-400 px-2.5 py-1 rounded-lg transition"
                    >
                      🔍 {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={recalling || !agentId.trim() || !query.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold transition shadow-sm flex items-center justify-center gap-2"
              >
                {recalling && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{recalling ? 'Searching Vector Space...' : 'Recall Relevant Memories'}</span>
              </button>
            </form>
          </div>

          {clearedNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-fadeIn mt-3">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <span>All stored memories for agent "{agentId}" successfully cleared.</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Results Section OR Educational Architecture Feed ── */}
      {results ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span>Recall Results for:</span>
                <span className="text-blue-400 font-mono">"{results.query}"</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Found {results.memories?.length || 0} matching vectors above score threshold (0.20).
              </p>
            </div>
            <button
              onClick={() => setResults(null)}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] transition self-start sm:self-auto"
            >
              Clear Results ✕
            </button>
          </div>

          {results.memories?.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-2">
              <p>No matching memories found for "{results.query}".</p>
              <button
                onClick={handlePreloadDemo}
                className="text-blue-400 hover:text-blue-300 font-medium transition underline"
              >
                Preload sample memories to test now →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {results.memories.map((m, i) => {
                const scorePercent = Math.min(100, Math.max(0, (m.score * 100))).toFixed(1)
                const isHighMatch = m.score > 0.65
                return (
                  <div
                    key={i}
                    className="p-4 bg-[var(--bg-surface)] border border-[var(--border)] hover:border-blue-500/40 rounded-xl transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {m.type || 'memory'}
                        </span>
                        {m.created_at && (
                          <span className="text-[11px] text-[var(--text-dim)]">
                            {new Date(m.created_at * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[var(--border)] h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${isHighMatch ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                          isHighMatch
                            ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                            : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                        }`}>
                          {scorePercent}% match
                        </span>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-[var(--text-primary)] leading-relaxed">
                      {m.content}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Explanatory Architecture & SDK Integration Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Memory Architecture Diagram */}
          <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-purple-400">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span>4-Tier Autonomous Agent Memory Architecture</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-1">
                <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>1. Semantic Layer (Facts)</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Persistent facts, preferences, user traits, and identity. Stored indefinitely in Qdrant with zero TTL.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-1">
                <div className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>2. Episodic Layer (Events)</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Time-stamped autobiographical interactions and action histories with automatic 30-day expiration.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-1">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>3. Short-Term Context</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Working memory for active dialogues and scratchpads, automatically pruned after 1 hour TTL.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-1">
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>4. Long-Term Knowledge</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Enterprise ground truth, company policies, and permanent reference embeddings.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Python SDK Snippet */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <h4 className="text-xs font-semibold text-[var(--text-primary)]">Python SDK Example</h4>
                <button
                  onClick={() => copy(`from iceberg import IcebergClient\n\nclient = IcebergClient(api_key="your_api_key")\n\n# Remember fact\nclient.memory.remember(\n    agent_id="${agentId || 'user_123'}",\n    content="User prefers dark mode and lives in Delhi.",\n    memory_type="semantic"\n)\n\n# Recall\nmemories = client.memory.recall(\n    agent_id="${agentId || 'user_123'}",\n    query="Where does user live?"\n)`, 'sdk')}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition"
                >
                  {copied === 'sdk' ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <pre className="p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[10px] font-mono text-[var(--text-secondary)] mt-3 overflow-x-auto leading-relaxed">
{`from iceberg import IcebergClient

client = IcebergClient(api_key="...")

# Store memory
client.memory.remember(
  agent_id="${agentId || 'user_123'}",
  content="User lives in Delhi.",
  memory_type="semantic"
)

# Recall memory (< 15ms)
res = client.memory.recall(
  agent_id="${agentId || 'user_123'}",
  query="Where does user live?"
)`}
              </pre>
            </div>

            <p className="text-[10px] text-[var(--text-dim)]">
              Drop into any LangChain, AutoGen, CrewAI, or LlamaIndex agent workflow.
            </p>
          </div>

        </div>
      )}

      {/* Modern In-App Confirmation Modal */}
      <ConfirmModal
        open={showClearModal}
        title="Clear Agent Memories?"
        message={
          <div>
            Are you sure you want to permanently clear all stored vector memories for agent <span className="font-mono text-[var(--text-primary)] font-semibold bg-[var(--bg-hover)] px-1.5 py-0.5 rounded border border-[var(--border)]">{agentId}</span>?
            <br />
            This will drop and recreate the collection <code className="text-blue-400 font-mono">_memory_{agentId}</code>.
          </div>
        }
        confirmText="Clear Memories"
        loading={clearing}
        onConfirm={confirmClear}
        onClose={() => setShowClearModal(false)}
      />

    </div>
  )
}
