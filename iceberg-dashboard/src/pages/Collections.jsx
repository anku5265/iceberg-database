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
      } else {
        setColDetails({})
      }
    } catch (e) {
      console.error('Error loading collections:', e)
    }
  }

  useEffect(() => {
    loadData()
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

  // Handle Load Sample Data
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

  const filtered = collections.filter(c =>
    c.toLowerCase().includes(searchFilter.trim().toLowerCase())
  )

  const totalVectors = collections.reduce((acc, cName) => {
    const pts = colDetails[cName]?.vector_count
    return acc + (pts !== undefined ? pts : 0)
  }, 0)

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">

      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Collections</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">
            Provision and manage isolated vector namespaces and HNSW indexes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="px-3.5 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition"
          >
            Refresh
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="px-3.5 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 text-xs font-semibold transition"
          >
            New Collection
          </button>
        </div>
      </div>

      {/* ── 2. Unified 4-Cell Enterprise Metric Strip ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)] shadow-[var(--shadow)]">
        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Active Collections</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {collections.length}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Isolated namespaces</p>
        </div>

        <div className="p-5 border-t-0">
          <p className="text-xs font-medium text-[var(--text-muted)]">Total Vectors</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {totalVectors.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Indexed coordinates</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Index Architecture</p>
          <p className="text-xl font-semibold text-[var(--text-primary)] font-mono mt-2">
            HNSW + BM25
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Sub-15ms hybrid RRF</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Default Specification</p>
          <p className="text-xl font-semibold text-[var(--text-primary)] font-mono mt-2">
            384d · Cosine
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">all-MiniLM-L6-v2</p>
        </div>
      </div>

      {/* ── 3. Create Collection Form Panel ── */}
      {showCreate && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <h3 className="text-[var(--text-primary)] text-[13.5px] font-semibold">
              Create Vector Collection
            </h3>
            <button
              onClick={() => setShowCreate(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              ✕
            </button>
          </div>

          <form onSubmit={create} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Collection Name</label>
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. prod_knowledge_base"
                  className="input-base font-mono text-xs w-full"
                />
                <p className="text-[var(--text-dim)] text-[11px] mt-1">Lowercase letters, numbers, and underscores</p>
              </div>

              <div>
                <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Vector Dimensions</label>
                <select
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  className="input-base text-xs font-mono w-full"
                >
                  <option value="384">384 (all-MiniLM-L6-v2 default)</option>
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
              <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">
                Description <span className="text-[var(--text-dim)]">(optional)</span>
              </label>
              <input
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe the documents or embeddings stored in this namespace"
                className="input-base text-xs w-full"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex items-center gap-2.5 pt-2 border-t border-[var(--border)]">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition"
              >
                {loading ? 'Creating...' : 'Create Collection'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3.5 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 4. Enterprise Indexes Table Card ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-[var(--shadow)]">
        {/* Card Top Toolbar */}
        <div className="px-5 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Indexes</h2>
            <span className="text-[11px] font-mono text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--bg-surface2)] border border-[var(--border)]">
              {collections.length}
            </span>
          </div>

          <input
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filter by collection name..."
            className="bg-[var(--bg-surface2)] border border-[var(--border)] text-xs rounded-md px-3 py-1.5 text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--text-muted)] w-full sm:w-60"
          />
        </div>

        {/* Table Header + Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-surface2)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-2.5 px-5">Name</th>
                <th className="py-2.5 px-5">Dimensions</th>
                <th className="py-2.5 px-5">Metric</th>
                <th className="py-2.5 px-5">Vectors</th>
                <th className="py-2.5 px-5">Status</th>
                <th className="py-2.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs">
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 px-5 text-center">
                    <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                      No collections in this workspace
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-md mx-auto">
                      Create a new vector collection or load the starter dataset to test hybrid search.
                    </p>
                    <div className="flex items-center justify-center gap-2.5 mt-5">
                      <button
                        onClick={handleSeedStarter}
                        disabled={seedingDemo}
                        className="px-4 py-2 rounded-md border border-[var(--border2)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition disabled:opacity-50"
                      >
                        {seedingDemo ? 'Loading Sample Data...' : 'Load Sample Data'}
                      </button>
                      <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 text-xs font-semibold transition"
                      >
                        Create Collection
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-5 text-center text-xs text-[var(--text-muted)]">
                    No collections match <span className="font-mono text-[var(--text-primary)]">"{searchFilter}"</span>
                  </td>
                </tr>
              ) : (
                filtered.map((cName) => {
                  const info = colDetails[cName]
                  const count = info?.vector_count !== undefined ? info.vector_count : 0
                  return (
                    <tr key={cName} className="hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-[var(--text-primary)]">
                        {cName}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[var(--text-muted)]">
                        384
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[var(--text-muted)]">
                        Cosine
                      </td>
                      <td className="py-3.5 px-5 font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                        {count.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-emerald-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInsertCol(cName)}
                          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition"
                        >
                          Insert
                        </button>
                        <span className="mx-2 text-[var(--text-dim)]">·</span>
                        <Link
                          to={`/explorer?collection=${encodeURIComponent(cName)}`}
                          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition"
                        >
                          Explore →
                        </Link>
                        <span className="mx-2 text-[var(--text-dim)]">·</span>
                        <button
                          onClick={() => setDeleteTarget(cName)}
                          className="text-xs text-[var(--text-muted)] hover:text-red-500 font-medium transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Quick Insert Vector Modal ── */}
      {insertCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Insert Document</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Collection: <code className="font-mono text-[var(--text-primary)]">{insertCol}</code>
                </p>
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
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Content to Embed (384d)
                </label>
                <textarea
                  autoFocus
                  required
                  rows={4}
                  value={insertText}
                  onChange={e => setInsertText(e.target.value)}
                  placeholder="Paste text or document chunk to embed and index..."
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-md p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-muted)] resize-none"
                />
              </div>

              {insertSuccess && (
                <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
                  Vector indexed into {insertCol}.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setInsertCol(null)}
                  className="px-3.5 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={insertLoading || !insertText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-[var(--text-primary)] text-[var(--bg-base)] rounded-md transition disabled:opacity-40"
                >
                  {insertLoading ? 'Indexing...' : 'Index Vector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. Delete Confirmation Modal ── */}
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
