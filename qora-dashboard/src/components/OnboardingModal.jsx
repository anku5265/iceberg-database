import { useState } from 'react'
import { api } from '../lib/api'

const SAMPLE_DATA = [
  { text: "Inception (2010) — A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.", label: "Inception" },
  { text: "Interstellar (2014) — A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", label: "Interstellar" },
  { text: "The Dark Knight (2008) — Batman raises the stakes in his war on crime with the Joker wreaking havoc and chaos.", label: "The Dark Knight" },
  { text: "Avatar (2009) — A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following orders and protecting the alien civilization.", label: "Avatar" },
  { text: "Avengers: Endgame (2019) — After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos's actions.", label: "Avengers: Endgame" },
]

const STEP_LABELS = ['Create Collection', 'Load Sample Data', 'Try Search']

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
      const r = await api.createCollection(name)
      if (r.detail) { setError(r.detail); setLoading(false); return }
      setCollection(name)
      setStep(2)
    } catch { setError('Could not connect') }
    setLoading(false)
  }

  // Step 2 — Index sample data one by one
  async function handleLoadSample() {
    setLoading(true)
    setIndexProgress(0)
    for (let i = 0; i < SAMPLE_DATA.length; i++) {
      await api.indexText(collection, SAMPLE_DATA[i].text, 'onboarding')
      setIndexProgress(i + 1)
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
    localStorage.setItem('qora_onboarding_done', '1')
    onDone(collection)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white font-semibold text-lg">Get started with Qora</div>
              <div className="text-[#555] text-xs mt-0.5">Takes less than 2 minutes</div>
            </div>
            <button onClick={finish} className="text-[#444] hover:text-[#888] text-xs transition">Skip</button>
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
                      ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-[#222] text-[#666]'}`}>
                      {done ? '✓' : n}
                    </div>
                    <span className={`text-xs ${active ? 'text-white' : done ? 'text-green-400' : 'text-[#555]'}`}>{label}</span>
                  </div>
                  {i < STEP_LABELS.length - 1 && <div className={`h-px flex-1 ${step > n ? 'bg-green-500/40' : 'bg-[#222]'}`} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="text-[#888] text-sm mb-4">
                A collection stores your vectors — think of it like a table in a database.
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-[#666] text-xs mb-1.5 block">Collection name</label>
                  <input
                    autoFocus
                    value={collectionName}
                    onChange={e => setCollectionName(e.target.value)}
                    placeholder="e.g. my_products"
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#333] font-mono"
                  />
                  <p className="text-[#444] text-xs mt-1">Lowercase, underscores only</p>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button type="submit" disabled={loading || !collectionName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-md transition">
                  {loading ? 'Creating...' : 'Create Collection →'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="text-[#888] text-sm mb-2">
                Load 5 sample movie descriptions to see hybrid search in action.
              </div>
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 mb-4">
                <div className="text-[#444] text-xs mb-2 font-mono">collection: <span className="text-blue-400">{collection}</span></div>
                <div className="space-y-1">
                  {SAMPLE_DATA.map((d, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${indexProgress > i ? 'text-green-400' : 'text-[#333]'}`}>
                      <span>{indexProgress > i ? '✓' : '○'}</span>
                      <span>{d.label}</span>
                    </div>
                  ))}
                </div>
                {loading && (
                  <div className="mt-3">
                    <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${(indexProgress / SAMPLE_DATA.length) * 100}%` }} />
                    </div>
                    <div className="text-[#555] text-xs mt-1">{indexProgress}/{SAMPLE_DATA.length} indexed</div>
                  </div>
                )}
              </div>
              <button onClick={handleLoadSample} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-md transition">
                {loading ? `Indexing... ${indexProgress}/${SAMPLE_DATA.length}` : 'Load Sample Data →'}
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="text-[#888] text-sm mb-4">
                Your collection is ready. Try a search — type anything, Qora uses hybrid search automatically.
              </div>
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. space travel, superhero, dream..."
                  className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#333]"
                />
                <button type="submit" disabled={searching || !query.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-4 rounded-md transition">
                  {searching ? '...' : 'Search'}
                </button>
              </form>

              {results.length > 0 && (
                <div className="space-y-2 mb-4">
                  {results.map((r, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#555] text-xs">#{i + 1}</span>
                        <span className="text-blue-400 text-xs font-mono">{(r.score * 100).toFixed(0)}% match</span>
                      </div>
                      <p className="text-white text-xs leading-relaxed line-clamp-2">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {results.length === 0 && query && !searching && (
                <div className="text-[#444] text-xs mb-4">No results — try "space" or "hero"</div>
              )}

              <button onClick={finish}
                className="w-full bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2.5 rounded-md transition">
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
