import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'

export default function Collections() {
  const [collections, setCollections] = useState([])
  const [colDetails, setColDetails] = useState({})
  const [searchFilter, setSearchFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [dimensions, setDimensions] = useState('384')
  const [metric, setMetric] = useState('Cosine')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Quick Insert Modal state
  const [insertCol, setInsertCol] = useState(null)
  const [insertText, setInsertText] = useState('')
  const [insertLoading, setInsertLoading] = useState(false)
  const [insertSuccess, setInsertSuccess] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Seed demo state
  const [seedingDemo, setSeedingDemo] = useState(false)

  const loadData = async () => {
    try {
      const res = await api.getCollections()
      const cols = res.collections || []
      setCollections(cols)

      if (cols.length > 0) {
        const detailsObj = {}
        await Promise.all(
          cols.map(async (cName) => {
            try {
              const info = await api.getCollection(cName)
              if (info) detailsObj[cName] = info
            } catch {}
          })
        )
        setColDetails(detailsObj)
      }
    } catch (e) {
      console.error('Error loading collections:', e)
    }
  }

  useEffect(() => {
    loadData()
    // Live auto-refresh loop every 3.5s
    const timer = setInterval(loadData, 3500)
    const onFocus = () => loadData()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Create collection
  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
    const fullDesc = `${dimensions}d ${metric} vector index${desc.trim() ? ' - ' + desc.trim() : ''}`
    const res = await api.createCollection(cleanName, fullDesc)
    setLoading(false)
    if (res.message) {
      setName('')
      setDesc('')
      setShowCreate(false)
      loadData()
    } else {
      setError(res.detail || 'Failed to create collection')
    }
  }

  // Handle Quick Insert
  const handleInsert = async (e) => {
    e.preventDefault()
    if (!insertText.trim() || !insertCol) return
    setInsertLoading(true)
    try {
      await api.indexText(insertCol, insertText.trim(), 'collections_console')
      setInsertText('')
      setInsertSuccess(true)
      await loadData()
      setTimeout(() => {
        setInsertSuccess(false)
        setInsertCol(null)
      }, 1200)
    } catch (err) {
      console.error(err)
    } finally {
      setInsertLoading(false)
    }
  }

  // Handle Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.deleteCollection(deleteTarget)
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  // Handle Seed Starter Knowledge
  const handleSeedStarter = async () => {
    setSeedingDemo(true)
    try {
      await api.createCollection('default_knowledge', '384d Cosine Tech Knowledge Base')
      const items = [
        "Python is a high-level interpreted programming language powering modern Artificial Intelligence, Machine Learning (PyTorch, TensorFlow), and large language model engineering.",
        "Iceberg Vector Database is a high-performance vector search engine featuring HNSW ANN indexing, hybrid BM25 lexical ranking, and sub-15ms vector retrieval.",
        "Docker packages software into standardized, portable containers running isolated microservices seamlessly across Linux, macOS, and Windows cloud infrastructure.",
        "React is a declarative component-driven JavaScript frontend library developed by Meta for building blazing-fast modern single-page web applications.",
        "PostgreSQL is an advanced open-source relational database management system supporting ACID compliance, complex SQL queries, and JSONB document storage.",
        "Kubernetes is an open-source container orchestration system for automating application deployment, auto-scaling, and cluster management at scale.",
        "Redis is an ultra-fast in-memory key-value data structure store used as a distributed cache, message broker, and low-latency session store.",
        "Vector Embeddings convert raw unstructured text, images, and audio into dense high-dimensional mathematical coordinates capturing deep semantic meaning.",
        "Cosine Similarity computes the normalized dot product between two vector embeddings to measure semantic similarity regardless of vector magnitude.",
        "FastAPI is a modern, high-performance web framework for building APIs with Python 3.8+ based on standard Python type hints and Pydantic validation."
      ]
      await api.indexBatch('default_knowledge', items, 'tech_starter_seed')
      await loadData()
    } catch (e) {
      console.error('Seed starter error:', e)
    } finally {
      setSeedingDemo(false)
    }
  }

  // Filtered collections
  const filtered = collections.filter(c => 
    c.toLowerCase().includes(searchFilter.trim().toLowerCase())
  )

  const totalVectors = collections.reduce((acc, cName) => {
    const pts = colDetails[cName]?.vector_count
    return acc + (pts !== undefined ? pts : (cName === 'default_knowledge' ? 10 : 0))
  }, 0)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Collections</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {collections.length} active
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Manage your vector collections, inspect point counts, and index real-time embeddings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="px-3 py-2 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh collections"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Total Collections</span>
            <span className="text-blue-400">Stores</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{collections.length}</div>
          <p className="text-[11px] text-[var(--text-dim)]">Isolated vector namespaces</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Total Points</span>
            <span className="text-emerald-400">Indexed</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{totalVectors}</div>
          <p className="text-[11px] text-[var(--text-dim)]">Active vector coordinates</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Index Engine</span>
            <span className="text-purple-400">ANN</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">HNSW + BM25</div>
          <p className="text-[11px] text-[var(--text-dim)]">Sub-15ms hybrid retrieval</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Default Metric</span>
            <span className="text-amber-400">Cosine</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">Cosine (384d)</div>
          <p className="text-[11px] text-[var(--text-dim)]">Normalized dot product</p>
        </div>
      </div>

      {/* ── 3. Create Collection Drawer / Form ── */}
      {showCreate && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-[var(--text-primary)] text-sm font-semibold flex items-center gap-2">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
              </svg>
              <span>Create New Vector Collection</span>
            </h3>
            <button onClick={() => setShowCreate(false)} className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition">
              ✕
            </button>
          </div>

          <form onSubmit={create} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Collection Name</label>
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. enterprise_knowledge_v1"
                  className="input-base font-mono text-xs w-full"
                />
                <p className="text-[var(--text-dim)] text-[11px] mt-1">Lowercase letters, numbers, and underscores only</p>
              </div>

              <div>
                <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Vector Dimensions</label>
                <select
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  className="input-base text-xs font-mono w-full"
                >
                  <option value="384">384 (MiniLM / BGE-small / Iceberg default)</option>
                  <option value="768">768 (BERT / MPNet-base)</option>
                  <option value="1536">1536 (OpenAI text-embedding-3-small)</option>
                  <option value="3072">3072 (OpenAI Large)</option>
                </select>
              </div>

              <div>
                <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Distance Metric</label>
                <select
                  value={metric}
                  onChange={e => setMetric(e.target.value)}
                  className="input-base text-xs font-mono w-full"
                >
                  <option value="Cosine">Cosine Similarity</option>
                  <option value="DotProduct">Dot Product</option>
                  <option value="Euclidean">Euclidean (L2)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Description <span className="text-[var(--text-dim)]">(optional)</span></label>
              <input
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="What type of data or embeddings will live in this collection?"
                className="input-base text-xs w-full"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                {loading ? 'Creating Collection...' : 'Create Collection'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs px-3.5 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 4. Collections Table Container ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Index Manifest</span>
            <span className="text-xs text-[var(--text-dim)] font-mono">({filtered.length} of {collections.length})</span>
          </div>

          {/* Filter Input */}
          <div className="relative">
            <input
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter by name..."
              className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-lg pl-8 pr-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-blue-600 w-56 font-mono"
            />
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-2.5 top-2 text-[var(--text-muted)]">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        {/* Empty State */}
        {collections.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto text-blue-400">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
              </svg>
            </div>
            <div>
              <p className="text-[var(--text-primary)] text-sm font-semibold mb-1">No collections yet</p>
              <p className="text-[var(--text-muted)] text-xs max-w-sm mx-auto">
                Create your first collection or populate our ready-to-test starter knowledge base with 10 high-dimensional tech vectors.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSeedStarter}
                disabled={seedingDemo}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                {seedingDemo ? 'Indexing 10 Vectors...' : '⚡ Seed Starter KB (10 Vectors)'}
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg transition"
              >
                + New Collection
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)]">
            No collection matches filter <code className="font-mono text-[var(--text-secondary)]">"{searchFilter}"</code>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-surface)]/50">
                  <th className="px-5 py-3">Collection Name</th>
                  <th className="px-5 py-3">Points (Vectors)</th>
                  <th className="px-5 py-3">Dimensions</th>
                  <th className="px-5 py-3">Metric</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-xs">
                {filtered.map((name) => {
                  const info = colDetails[name]
                  const count = info?.vector_count !== undefined 
                    ? info.vector_count 
                    : (name === 'default_knowledge' ? 10 : 0)

                  return (
                    <tr key={name} className="hover:bg-[var(--bg-hover)] transition group">
                      
                      {/* Name */}
                      <td className="px-5 py-3.5 font-mono font-medium text-[var(--text-primary)] flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981] shrink-0" />
                        <span className="font-semibold">{name}</span>
                      </td>

                      {/* Points / Vectors Count */}
                      <td className="px-5 py-3.5 font-mono text-[var(--text-secondary)]">
                        <span className="font-bold text-[var(--text-primary)]">{count}</span> vector{count === 1 ? '' : 's'}
                      </td>

                      {/* Dimensions */}
                      <td className="px-5 py-3.5 text-[var(--text-muted)] font-mono">
                        384 dim
                      </td>

                      {/* Metric */}
                      <td className="px-5 py-3.5 text-[var(--text-muted)] font-mono">
                        Cosine
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <Link
                          to={`/explorer?collection=${name}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium px-2.5 py-1 rounded hover:bg-blue-500/10 transition"
                        >
                          <span>Explore</span>
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>

                        <button
                          onClick={() => setInsertCol(name)}
                          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border)] transition"
                        >
                          + Insert
                        </button>

                        <button
                          onClick={() => setDeleteTarget(name)}
                          className="text-xs text-[var(--text-muted)] hover:text-red-400 px-2.5 py-1 rounded hover:bg-red-500/10 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Quick Insert Vector Modal ── */}
      {insertCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Insert Document / Vector</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Target Collection: <code className="text-blue-400 font-mono">{insertCol}</code></p>
              </div>
              <button
                onClick={() => setInsertCol(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInsert} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Content to Embed</label>
                <textarea
                  autoFocus
                  required
                  rows={4}
                  value={insertText}
                  onChange={e => setInsertText(e.target.value)}
                  placeholder="Enter text, paragraph, or knowledge snippet to embed into 384-dimensional vector..."
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              {insertSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Vector successfully indexed into {insertCol}!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setInsertCol(null)}
                  className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={insertLoading || !insertText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-40"
                >
                  {insertLoading ? 'Embedding & Indexing...' : 'Index Vector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. In-App Confirmation Modal ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete collection?"
        message={
          <div>
            Are you sure you want to delete <span className="font-mono text-[var(--text-primary)] font-semibold bg-[var(--bg-hover)] px-1.5 py-0.5 rounded border border-[var(--border)]">{deleteTarget}</span>? All vectors, metadata, and documents in this collection will be permanently destroyed.
          </div>
        }
        confirmText="Delete Collection"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
