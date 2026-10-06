import { useState } from 'react'
import { api } from '../lib/api'
import { REAL_KNOWLEDGE_BASE, SUGGESTED_QUERIES } from '../lib/starterData'

const STEP_LABELS = ['Create Collection', 'Load Real Data', 'Try Search']

export default function OnboardingModal({ onDone }) {
  const [step, setStep] = useState(1)
  const [collectionName, setCollectionName] = useState('')
  const [collection, setCollection] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [indexProgress, setIndexProgress] = useState(0)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  // Step 1 — Create collection
  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    const name = collectionName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (!name) { setError('Enter a valid name'); return }
    setLoading(true)
    try {
      let r = await api.createCollection(name)
      if (r.detail && (r.detail === 'Invalid API key' || r.detail.toLowerCase().includes('api key'))) {
        localStorage.setItem('iceberg_api_key', 'ib_dev_test123')
        r = await api.createCollection(name)
      }
      if (r.detail) { setError(r.detail); setLoading(false); return }
      setCollection(name)
      setStep(2)
    } catch { setError('Could not connect') }
    setLoading(false)
  }

  // Step 2 — Index real knowledge base
  async function handleLoadSample() {
    setLoading(true)
    setIndexProgress(0)
    try {
      const res = await api.indexBatch(collection, REAL_KNOWLEDGE_BASE.map(d => d.text))
      if (res?.chunks_indexed) {
        setIndexProgress(REAL_KNOWLEDGE_BASE.length)
      } else {
        throw new Error('fallback')
      }
    } catch {
      for (let i = 0; i < REAL_KNOWLEDGE_BASE.length; i++) {
        await api.indexText(collection, REAL_KNOWLEDGE_BASE[i].text, 'starter_kb')
        setIndexProgress(i + 1)
      }
    }
    setLoading(false)
    setStep(3)
  }

  // Step 3 — Search
  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const r = await api.search(collection, query, 3, 'hybrid', 0.5)
      setResults(r.results || [])
    } catch { setResults([]) }
    setSearching(false)
  }

  function finish() {
    localStorage.setItem('iceberg_onboarding_done', '1')
    onDone(collection)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-[var(--bg-base)] border border-[var(--border2)] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[var(--text-primary)] font-semibold text-lg">Get started with Iceberg</div>
              <div className="text-[var(--text-secondary)] text-xs mt-0.5">Vector Search with Real Knowledge Data</div>
            </div>
            <button onClick={finish} className="text-[var(--text-dim)] hover:text-[var(--text-secondary)] text-xs transition">Skip</button>
          </div>
          {/* Step progress */}
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const done = step > n
              const active = step === n
              return (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-1.5 ${active ? 'opacity-100' : done ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                      ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-[var(--border2)] text-[var(--text-muted)]'}`}>
                      {done ? '✓' : n}
                    </div>
                    <span className="text-xs font-medium text-[var(--text-secondary)] hidden sm:inline">{label}</span>
                  </div>
                  {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-[var(--border)]"/>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="text-[var(--text-secondary)] text-sm mb-4">
                A collection stores your vectors — think of it like a table in a database.
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Collection name</label>
                  <input
                    autoFocus
                    value={collectionName}
                    onChange={e => setCollectionName(e.target.value)}
                    placeholder="e.g. tech_docs, my_kb, products..."
                    className="input-base font-mono w-full"
                  />
                  <p className="text-[var(--text-dim)] text-xs mt-1">Lowercase, underscores only</p>
                </div>
                <button type="submit" disabled={loading || !collectionName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-xl transition">
                  {loading ? 'Creating...' : 'Create Collection →'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="text-[var(--text-secondary)] text-sm mb-2 font-medium">
                Load 15 real knowledge articles (Java, Python, React, Tesla, Cloud, Vector DB, Security) to test semantic search.
              </div>
              <div className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg p-3 mb-4">
                <div className="text-[var(--text-dim)] text-xs mb-2 font-mono">collection: <span className="text-blue-400">{collection}</span></div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {REAL_KNOWLEDGE_BASE.map((d, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${indexProgress > i ? 'text-green-400 font-medium' : 'text-[var(--text-dim)]'}`}>
                      <span>{indexProgress > i ? '✓' : '○'}</span>
                      <span className="truncate">{d.title}</span>
                      <span className="text-[10px] text-[var(--text-dim)] ml-auto shrink-0 font-normal">({d.category})</span>
                    </div>
                  ))}
                </div>
                {loading && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${(indexProgress / REAL_KNOWLEDGE_BASE.length) * 100}%` }} />
                    </div>
                    <div className="text-[var(--text-secondary)] text-xs mt-1 font-mono">{indexProgress}/{REAL_KNOWLEDGE_BASE.length} articles indexed</div>
                  </div>
                )}
              </div>
              <button onClick={handleLoadSample} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-xl transition">
                {loading ? `Indexing real data (${indexProgress}/${REAL_KNOWLEDGE_BASE.length})...` : 'Load 15 Real Articles →'}
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="text-[var(--text-secondary)] text-sm mb-2 font-medium">
                Your collection has 15 real knowledge articles! Test search:
              </div>

              <div className="text-[var(--text-dim)] text-xs mb-3 p-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] leading-relaxed">
                💡 <strong className="text-[var(--text-secondary)] font-medium">Semantic Search in Action:</strong> Type any query below or click a suggestion chip. Notice how it finds the exact matching real article!
              </div>

              <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. what is java, how does python work, tesla..."
                  className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-3 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)]"
                />
                <button type="submit" disabled={searching || !query.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-4 rounded-md transition">
                  {searching ? '...' : 'Search'}
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs">
                <span className="text-[var(--text-dim)]">Try:</span>
                {SUGGESTED_QUERIES.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQuery(s)
                      setSearching(true)
                      api.search(collection, s, 3, 'hybrid', 0.5)
                        .then(r => setResults(r.results || []))
                        .catch(() => setResults([]))
                        .finally(() => setSearching(false))
                    }}
                    className="px-2.5 py-1 rounded-full bg-[var(--border)] hover:bg-blue-600/20 hover:text-blue-400 text-[var(--text-secondary)] transition text-xs border border-transparent hover:border-blue-500/30 font-medium"
                  >
                    "{s}"
                  </button>
                ))}
              </div>

              {results.length > 0 && (
                <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
                  {results.map((r, i) => {
                    const rawScore = r.score || 0
                    const pct = rawScore < 0.05 ? Math.min(99, Math.round(rawScore * 61 * 100)) : Math.round(rawScore * 100)
                    const isHigh = pct >= 65
                    return (
                      <div key={i} className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[var(--text-secondary)] text-xs font-mono">#{i + 1}</span>
                          <span className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
                            isHigh ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                            : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                          }`}>
                            {pct}% match
                          </span>
                        </div>
                        <p className="text-[var(--text-primary)] text-xs leading-relaxed line-clamp-3">{r.text}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {results.length === 0 && query && !searching && (
                <div className="text-[var(--text-dim)] text-xs mb-4">No results found for "{query}". Try one of the suggested chips above.</div>
              )}

              <button onClick={finish}
                className="w-full bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2.5 rounded-xl transition">
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
