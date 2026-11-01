import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import ConfirmModal from '../components/ConfirmModal'
import { CodeBlock } from '../components/CodeBlock'

const MEMORY_TIERS = [
  { id: 'semantic', name: 'Semantic', ttl: 'No TTL', desc: 'Permanent user facts & traits' },
  { id: 'long_term', name: 'Long-term', ttl: 'No TTL', desc: 'Core domain knowledge' },
  { id: 'episodic', name: 'Episodic', ttl: '30d TTL', desc: 'Past interactions & events' },
  { id: 'short_term', name: 'Short-term', ttl: '1h TTL', desc: 'Active session scratchpad' },
]

export default function Memory() {
  const defaultAgentName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
      const base = (u.email || '').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')
      return base ? `agent_${base}` : 'support_bot_01'
    } catch {
      return 'support_bot_01'
    }
  })()

  const [agentId, setAgentId] = useState(defaultAgentName)
  const [content, setContent] = useState('')
  const [memType, setMemType] = useState('semantic')
  const [query, setQuery] = useState('')
  const [activeRightTab, setActiveRightTab] = useState('memories') // 'memories' | 'sdk'
  const [tierFilter, setTierFilter] = useState('all')

  const [storedItems, setStoredItems] = useState([])
  const [recallResults, setRecallResults] = useState(null) // null = showing stored stream; array = showing recall search hits
  const [lastRecallQuery, setLastRecallQuery] = useState('')
  const [lastLatency, setLastLatency] = useState(null)

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

  // Load real memory count + fetch live stored vectors from Qdrant for current agentId
  const loadAgentData = async (id = agentId, silent = false) => {
    const cleanId = (id || '').trim()
    if (!cleanId) {
      setTotalMemories(0)
      setStoredItems([])
      return
    }
    if (!silent) setLoadingStats(true)
    try {
      const statsData = await api.getMemoryStats(cleanId)
      const count = statsData?.total_memories || 0
      setTotalMemories(count)

      if (count > 0) {
        // Probe Qdrant via recall to list live stored memory vectors for this agent
        const probeRes = await api.recallMemory(
          cleanId,
          'user prefers agent memory fact knowledge system startup database',
          20
        )
        if (probeRes && Array.isArray(probeRes.memories)) {
          setStoredItems(probeRes.memories)
        }
      } else {
        setStoredItems([])
      }
    } catch {
      if (!silent) setTotalMemories(0)
    } finally {
      if (!silent) setLoadingStats(false)
    }
  }

  useEffect(() => {
    setRecallResults(null)
    setLastRecallQuery('')
    loadAgentData(agentId)
    const interval = setInterval(() => {
      if (agentId) loadAgentData(agentId, true)
    }, 5000)
    return () => clearInterval(interval)
  }, [agentId])

  // Store memory (/remember)
  const remember = async (e) => {
    e?.preventDefault()
    if (!agentId.trim() || !content.trim()) return
    setStoring(true)
    const textToStore = content.trim()
    try {
      const res = await api.rememberMemory(agentId.trim(), textToStore, memType)
      if (res && res.stored) {
        setContent('')
        setStoredNotice(true)
        setTimeout(() => setStoredNotice(false), 3000)

        // Optimistically prepend to live stored items and refresh from Qdrant
        const newEntry = {
          content: textToStore,
          type: memType,
          created_at: Math.floor(Date.now() / 1000),
          score: null,
        }
        setStoredItems(prev => [newEntry, ...prev.filter(x => x.content !== textToStore)])
        setTotalMemories(prev => prev + 1)
        await loadAgentData(agentId, true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStoring(false)
    }
  }

  // Recall memory (/recall) with real latency measurement
  const recall = async (searchQuery = query) => {
    const q = (searchQuery !== undefined ? searchQuery : query).trim()
    if (!agentId.trim() || !q) return
    setRecalling(true)
    setActiveRightTab('memories')
    const t0 = performance.now()
    try {
      const data = await api.recallMemory(agentId.trim(), q, 10)
      const measuredMs = Math.max(1, Math.round((performance.now() - t0) * 10) / 10)
      setLastLatency(measuredMs)
      if (data && Array.isArray(data.memories)) {
        setRecallResults(data.memories)
        setLastRecallQuery(q)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRecalling(false)
    }
  }

  // 1-Click Load Sample Memories into current Agent
  const handlePreloadDemo = async () => {
    setPreloading(true)
    const targetAgent = agentId.trim() || defaultAgentName
    setAgentId(targetAgent)

    const demoMemories = [
      { content: 'IcebergDB is a production serverless vector database and 4-tier AI agent memory engine hosted in India (ap-south-1).', type: 'semantic' },
      { content: 'User prefers clean enterprise console UI and sub-15ms real-time hybrid RRF vector queries.', type: 'long_term' },
      { content: 'Agent deployed hybrid search combining 384d Cosine similarity with sparse BM25 lexical matching (30d TTL).', type: 'episodic' },
      { content: 'Built-in 384d FastEmbed CPU embeddings require $0 external OpenAI API keys.', type: 'semantic' },
    ]

    try {
      for (const m of demoMemories) {
        await api.rememberMemory(targetAgent, m.content, m.type)
      }
      await loadAgentData(targetAgent)
      const sampleQ = 'What startup is Ankush building?'
      setQuery(sampleQ)
      await recall(sampleQ)
    } catch (err) {
      console.error('Failed to preload sample memories:', err)
    } finally {
      setPreloading(false)
    }
  }

  // Clear all memories for current Agent
  const confirmClear = async () => {
    if (!agentId) return
    setClearing(true)
    try {
      await api.clearMemory(agentId.trim())
      setRecallResults(null)
      setStoredItems([])
      setTotalMemories(0)
      setLastRecallQuery('')
      setShowClearModal(false)
      setClearedNotice(true)
      await loadAgentData(agentId)
      setTimeout(() => setClearedNotice(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setClearing(false)
    }
  }

  const agentPresets = Array.from(new Set([defaultAgentName, 'support_bot_01', 'analytics_agent', 'client_portfolio']))

  const activeList = recallResults !== null ? recallResults : storedItems
  const filteredMemories = activeList.filter(m =>
    tierFilter === 'all' ? true : (m.type || 'semantic') === tierFilter
  )

  const pythonSnippet = `from iceberg import IcebergClient

client = IcebergClient(api_key="YOUR_API_KEY")

# 1. Store memory (/remember)
client.memory.remember(
    agent_id="${agentId || 'agent_01'}",
    content="User lives in Kullu and builds Iceberg DB.",
    memory_type="${memType}"
)

# 2. Semantic recall (/recall)
memories = client.memory.recall(
    agent_id="${agentId || 'agent_01'}",
    query="Where does the user live?",
    top_k=5
)`

  const curlSnippet = `curl -X POST "${API_URL}/memory/${agentId || 'agent_01'}/remember" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "User prefers dark mode UI.", "memory_type": "${memType}"}'`

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">
      
      {/* ── 1. Clean Enterprise Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Agent Memory</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">
            Persistent 4-tier cognitive memory store (/remember &amp; /recall) with automatic TTL expiration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadAgentData(agentId)}
            className="px-3.5 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition"
          >
            {loadingStats ? 'Syncing...' : 'Refresh'}
          </button>

          <button
            onClick={handlePreloadDemo}
            disabled={preloading}
            className="px-3.5 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50 text-xs font-semibold transition"
          >
            {preloading ? 'Loading Sample...' : 'Load Sample Memories'}
          </button>
        </div>
      </div>

      {/* ── 2. Unified 4-Cell Enterprise Metric Strip ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)] shadow-[var(--shadow)]">
        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Target Agent Namespace</p>
          <p className="text-base font-semibold text-[var(--text-primary)] font-mono truncate mt-2" title={agentId}>
            {agentId || 'None'}
          </p>
          <p className="text-[11px] font-mono text-[var(--text-muted)] truncate mt-1.5">
            _memory_{agentId || 'id'}
          </p>
        </div>

        <div className="p-5 border-t-0">
          <p className="text-xs font-medium text-[var(--text-muted)]">Stored Memories</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {totalMemories.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Indexed 384d memory vectors</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Cognitive Tiers</p>
          <p className="text-xl font-semibold text-[var(--text-primary)] font-mono mt-2">
            4 Tiers · TTL
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Semantic, Long-term, Episodic, Short-term</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Recall Latency</p>
          <p className="text-xl font-semibold text-[var(--text-primary)] font-mono mt-2">
            {lastLatency ? `${lastLatency}ms · Cosine` : '< 15ms · Cosine'}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">all-MiniLM-L6-v2 HNSW lookup</p>
        </div>
      </div>

      {/* ── 3. Clean Agent Namespace Selector Bar ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[var(--shadow)]">
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          <label className="text-xs font-medium text-[var(--text-muted)] shrink-0">
            Agent ID:
          </label>
          <input
            value={agentId}
            onChange={e => setAgentId(e.target.value)}
            placeholder="e.g. agent_ankush, support_bot_01"
            className="input-base font-mono text-xs py-1.5 flex-1"
          />
          {agentId && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-red-500 text-xs font-medium transition shrink-0"
            >
              Clear Memory
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {agentPresets.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setAgentId(preset)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition border ${
                agentId === preset
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)] font-semibold'
                  : 'bg-[var(--bg-surface2)] hover:bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {clearedNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md text-xs">
          Cleared all stored memories for agent "{agentId}".
        </div>
      )}

      {/* ── 4. Split-Pane Memory Workbench (Left: Write Memory, Right: Recall & Live Stored Memories Table) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (5 cols): Store Memory (/remember) */}
        <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-[var(--shadow)]">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Store Memory (Write)</h2>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">POST /memory/:id/remember</span>
          </div>

          <form onSubmit={remember} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-2 block">
                Memory Tier &amp; TTL Policy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MEMORY_TIERS.map(t => {
                  const active = memType === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMemType(t.id)}
                      className={`p-3 rounded-md border text-left transition ${
                        active
                          ? 'bg-[var(--bg-surface2)] border-[var(--text-primary)]'
                          : 'bg-[var(--card-bg)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{t.name}</span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{t.ttl}</span>
                      </div>
                      <p className="text-[10.5px] text-[var(--text-muted)] mt-1 leading-snug">{t.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)]">Memory Fact / Observation</label>
                <span className="text-[10.5px] font-mono text-[var(--text-dim)]">384d Cosine</span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Enter a user fact, preference, or session event to vectorize and store..."
                rows={4}
                className="w-full input-base text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] text-[var(--text-muted)]">Quick templates:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'User lives in Kullu and builds Iceberg DB.',
                  'Prefers dark mode UI and sub-15ms hybrid search.',
                  'Client requested quarterly billing via invoice.',
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setContent(sample)}
                    className="text-[11px] bg-[var(--bg-surface2)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded-md transition text-left"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={storing || !agentId.trim() || !content.trim()}
              className="w-full py-2.5 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition"
            >
              {storedNotice ? 'Memory Stored in Vector DB' : storing ? 'Embedding & Indexing...' : 'Store Memory'}
            </button>
          </form>
        </div>

        {/* Right Column (7 cols): Semantic Recall & Live Stored Memories Table + SDK */}
        <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-[var(--shadow)] flex flex-col min-h-[515px]">
          {/* Monochrome Tab Bar */}
          <div className="px-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card-bg)]">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveRightTab('memories')}
                className={`py-3.5 text-xs border-b-2 transition -mb-px ${
                  activeRightTab === 'memories'
                    ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                Recall &amp; Stored Memories ({totalMemories})
              </button>
              <button
                type="button"
                onClick={() => setActiveRightTab('sdk')}
                className={`py-3.5 text-xs border-b-2 transition -mb-px ${
                  activeRightTab === 'sdk'
                    ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                Python &amp; REST SDK
              </button>
            </div>

            <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">
              POST /memory/:id/recall
            </span>
          </div>

          {activeRightTab === 'memories' ? (
            <div className="p-5 space-y-4 flex-1 flex flex-col">
              {/* Semantic Recall Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  recall()
                }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search agent memory semantically (e.g. Where does the user live?)..."
                    className="input-base text-xs py-2 flex-1"
                  />
                  {recallResults !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setRecallResults(null)
                        setLastRecallQuery('')
                        setQuery('')
                      }}
                      className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={recalling || !agentId.trim() || !query.trim()}
                    className="px-4 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition shrink-0"
                  >
                    {recalling ? 'Searching...' : 'Recall'}
                  </button>
                </div>

                {/* Clean Query Pills (Zero Emojis) */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-[var(--text-muted)]">Test query:</span>
                    {[
                      'Where does the user live?',
                      'What startup is he building?',
                      'UI & latency preferences',
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setQuery(prompt)
                          recall(prompt)
                        }}
                        className="text-[11px] bg-[var(--bg-surface2)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-0.5 rounded transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Tier Filter */}
                  <select
                    value={tierFilter}
                    onChange={e => setTierFilter(e.target.value)}
                    className="bg-[var(--bg-surface2)] border border-[var(--border)] rounded px-2 py-0.5 text-[11px] font-mono text-[var(--text-secondary)]"
                  >
                    <option value="all">All Tiers</option>
                    <option value="semantic">semantic</option>
                    <option value="long_term">long_term</option>
                    <option value="episodic">episodic</option>
                    <option value="short_term">short_term</option>
                  </select>
                </div>
              </form>

              {/* Live Stored / Recalled Memories Table */}
              <div className="border border-[var(--border)] rounded-lg overflow-hidden flex-1 flex flex-col">
                <div className="grid grid-cols-12 bg-[var(--bg-surface2)] border-b border-[var(--border)] px-4 py-2 text-[10.5px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <div className="col-span-3 sm:col-span-2">Tier</div>
                  <div className="col-span-7 sm:col-span-8">
                    {lastRecallQuery ? `Recalled Matches for "${lastRecallQuery}"` : 'Memory Content'}
                  </div>
                  <div className="col-span-2 text-right">
                    {recallResults !== null ? 'Relevance' : 'Stored'}
                  </div>
                </div>

                {filteredMemories.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {totalMemories === 0
                        ? `No memories stored for ${agentId}`
                        : 'No matching memories found'}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-sm">
                      {totalMemories === 0
                        ? 'Write a memory on the left or load the sample memory dataset to test sub-15ms semantic recall.'
                        : 'Try another semantic query or reset the tier filter.'}
                    </p>
                    {totalMemories === 0 && (
                      <button
                        type="button"
                        onClick={handlePreloadDemo}
                        disabled={preloading}
                        className="mt-4 px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-primary)] transition"
                      >
                        {preloading ? 'Loading Sample...' : 'Load Sample Memories'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)] overflow-y-auto max-h-[340px]">
                    {filteredMemories.map((m, i) => {
                      const scorePct = typeof m.score === 'number' ? `${Math.min(100, Math.max(0, m.score * 100)).toFixed(1)}%` : null
                      const timeStr = m.created_at
                        ? new Date(m.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Live'
                      return (
                        <div key={i} className="grid grid-cols-12 items-start px-4 py-3 text-xs hover:bg-[var(--bg-hover)] transition gap-2">
                          <div className="col-span-3 sm:col-span-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-surface2)] border border-[var(--border)] text-[var(--text-primary)]">
                              {m.type || 'semantic'}
                            </span>
                          </div>
                          <div className="col-span-7 sm:col-span-8 text-[var(--text-primary)] leading-relaxed">
                            {m.content}
                          </div>
                          <div className="col-span-2 text-right font-mono text-[11px]">
                            {recallResults !== null && scorePct ? (
                              <span className={m.score > 0.6 ? 'text-emerald-500 font-semibold' : 'text-[var(--text-muted)]'}>
                                {scorePct}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">{timeStr}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Python & REST SDK Integration */
            <div className="p-5 space-y-5 flex-1">
              <div>
                <h3 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Programmatic Memory Integration</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Integrate persistent 4-tier cognitive memory for agent <code className="font-mono text-[var(--text-primary)]">{agentId}</code> into LangChain, CrewAI, AutoGen, or custom Python backends.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">1. Python SDK (/remember &amp; /recall)</span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">pip install icebergdb</span>
                </div>
                <CodeBlock code={pythonSnippet} label="Python" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">2. REST API cURL</span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">POST /memory/{agentId}/remember</span>
                </div>
                <CodeBlock code={curlSnippet} label="cURL" />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        open={showClearModal}
        title="Clear agent memories?"
        message={
          <div>
            Are you sure you want to permanently clear all stored vector memories for agent <span className="font-mono text-[var(--text-primary)] font-semibold">{agentId}</span>?
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
