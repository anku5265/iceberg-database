import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import { Link, useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'

export default function Collections() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState(() => api.getCachedCollections())
  const [colDetails, setColDetails] = useState(() => api.getCachedCollectionDetails())
  const [initialLoading, setInitialLoading] = useState(() => !api.hasLoadedCollectionsCache())

  // Create Index Modal state
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [dimensions, setDimensions] = useState('384')
  const [metric, setMetric] = useState('Cosine')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Actions Menu & Host Copy state
  const [actionMenuCol, setActionMenuCol] = useState(null)
  const [copiedHostCol, setCopiedHostCol] = useState(null)

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
      setInitialLoading(false)

      if (cols.length > 0) {
        const detailsObj = { ...api.getCachedCollectionDetails() }
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
      setInitialLoading(false)
      console.error('Error loading collections:', e)
    }
  }

  useEffect(() => {
    loadData()
    const onColsUpdated = () => {
      setCollections(api.getCachedCollections())
      setColDetails(api.getCachedCollectionDetails())
    }
    window.addEventListener('iceberg-collections-updated', onColsUpdated)
    const timer = setInterval(loadData, 4000)
    const onFocus = () => loadData()
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('iceberg-collections-updated', onColsUpdated)
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Close row actions menu on outside click
  useEffect(() => {
    if (!actionMenuCol) return
    const handleClickOutside = () => setActionMenuCol(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [actionMenuCol])

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
    const fullDesc = `${dimensions}d ${metric} vector index${desc.trim() ? ' - ' + desc.trim() : ''}`
    const res = await api.createCollection(cleanName, fullDesc)
    setLoading(false)
    if (res.message || res.name || res.status === 'created') {
      setName('')
      setDesc('')
      setShowCreate(false)
      loadData()
    } else {
      setError(res.detail || 'Failed to create index')
    }
  }

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

  const copyHostUrl = (cName) => {
    const hostUrl = `${API_URL}/collections/${cName}`
    navigator.clipboard.writeText(hostUrl).catch(() => {})
    setCopiedHostCol(cName)
    setTimeout(() => setCopiedHostCol(null), 1800)
  }

  return (
    <div
      className="pt-[46px] pb-12 px-6 sm:px-[49px] max-w-[1090px] text-white"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ── Top Header Row: "Indexes" on Left, "Create index" Blue Button on Right (Exact Pinecone Console Match) ── */}
      <div className="flex items-center justify-between gap-4 mb-[24px]">
        <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
          Indexes
        </h1>

        <button
          type="button"
          onClick={() => {
            setError('')
            setShowCreate(true)
          }}
          className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold inline-flex items-center justify-center transition cursor-pointer"
        >
          Create index
        </button>
      </div>

      {/* ── Pinecone Indexes Table (#1c1c1c surface, #343434 border, 55px header, 64px rows) ── */}
      <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-[55px] border-b border-[#343434] text-[13px] font-bold text-white">
              <th className="pl-[16px] pr-4 font-bold">Name</th>
              <th className="px-4 font-bold w-[110px]">Metric</th>
              <th className="px-4 font-bold w-[115px]">Dimensions</th>
              <th className="px-4 font-bold w-[105px]">Vectors</th>
              <th className="px-4 font-bold w-[155px]">Cloud / Region</th>
              <th className="px-4 font-bold w-[220px]">Host</th>
              <th className="pl-4 pr-[16px] font-bold w-[86px] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#343434] text-[13px]">
            {collections.length === 0 ? (
              initialLoading ? (
                <tr className="h-[64px]">
                  <td colSpan={7} className="px-4 text-center text-[#909090] text-[13px]">
                    Loading indexes...
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className="py-14 px-6 text-center">
                    <p className="text-[16px] font-semibold text-white">
                      No indexes in this project
                    </p>
                    <p className="text-[13.5px] text-[#a0a0a0] mt-1.5 max-w-md mx-auto">
                      Create a new vector index or load the sample dataset to start running hybrid dense + BM25 search.
                    </p>
                    <div className="flex items-center justify-center gap-2.5 mt-5">
                      <button
                        type="button"
                        onClick={handleSeedStarter}
                        disabled={seedingDemo}
                        className="h-[35px] px-[15px] rounded-[2px] border border-[#3a3a3a] bg-[#242424] hover:bg-[#2e2e2e] text-white text-[13px] font-semibold transition cursor-pointer"
                      >
                        {seedingDemo ? 'Loading sample data...' : 'Load sample data'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold transition cursor-pointer"
                      >
                        Create index
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ) : (
              collections.map((cName) => {
                const info = colDetails[cName]
                const count = info?.vector_count !== undefined ? info.vector_count : 0
                const hostUrl = `${API_URL}/collections/${cName}`
                const isMenuOpen = actionMenuCol === cName

                return (
                  <tr
                    key={cName}
                    className="h-[64px] hover:bg-[#222222] transition-colors"
                  >
                    {/* Name (Blue link + green status dot — Exact Pinecone Match) */}
                    <td className="pl-[16px] pr-4">
                      <div className="inline-flex items-center gap-[9px]">
                        <Link
                          to={`/explorer?collection=${encodeURIComponent(cName)}`}
                          className="text-[#58a6ff] hover:underline font-normal text-[13.5px]"
                        >
                          {cName}
                        </Link>
                        <span
                          className="w-[8px] h-[8px] rounded-full bg-[#3fb950] shrink-0"
                          title="Ready"
                        />
                      </div>
                    </td>

                    {/* Metric */}
                    <td className="px-4 text-white">cosine</td>

                    {/* Dimensions */}
                    <td className="px-4 text-white tabular-nums">384</td>

                    {/* Vectors */}
                    <td className="px-4 text-white tabular-nums">{count.toLocaleString()}</td>

                    {/* Cloud / Region */}
                    <td className="px-4 text-white whitespace-nowrap">AWS / ap-south-1</td>

                    {/* Host */}
                    <td className="px-4 text-white max-w-[220px] truncate" title={hostUrl}>
                      {copiedHostCol === cName ? (
                        <span className="text-[#3fb950] font-medium">Copied host URL</span>
                      ) : (
                        hostUrl
                      )}
                    </td>

                    {/* Actions (•••) */}
                    <td className="pl-4 pr-[16px] text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActionMenuCol((prev) => (prev === cName ? null : cName))
                        }}
                        className="w-[30px] h-[30px] rounded-[2px] hover:bg-[#2d2d2d] text-white inline-flex items-center justify-center transition cursor-pointer"
                        title="Actions"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>

                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-[16px] top-[52px] z-30 w-[176px] rounded-[2px] border border-[#383838] bg-[#242424] shadow-xl py-1 text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuCol(null)
                              navigate(`/explorer?collection=${encodeURIComponent(cName)}`)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-white hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>Query index</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuCol(null)
                              setInsertCol(cName)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-white hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>Insert document</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuCol(null)
                              copyHostUrl(cName)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-white hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>Copy host URL</span>
                          </button>

                          <div className="my-1 border-t border-[#343434]" />

                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuCol(null)
                              setDeleteTarget(cName)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-[#f85149] hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>Delete index</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Index Modal (Pinecone Dark Modal Style) ── */}
      {showCreate && (
        <div
          onClick={() => setShowCreate(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-[2px] border border-[#343434] bg-[#1c1c1c] p-[32px] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-white tracking-tight">
                Create a vector index
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-white hover:text-[#cccccc] transition p-1 cursor-pointer"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={create} className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-white mb-2">
                  Name your index
                </label>
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. prod_knowledge_base"
                  className="w-full h-[38px] px-3 rounded-[2px] border border-[#383838] bg-[#212121] text-[13.5px] text-white placeholder:text-[#787878] focus:outline-none focus:border-[#388bfd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[13px] font-bold text-white mb-2">
                    Dimensions
                  </label>
                  <select
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[2px] border border-[#383838] bg-[#212121] text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                  >
                    <option value="384">384 (MiniLM-L6)</option>
                    <option value="768">768 (MPNet)</option>
                    <option value="1536">1536 (OpenAI Small)</option>
                    <option value="3072">3072 (OpenAI Large)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-white mb-2">
                    Metric
                  </label>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[2px] border border-[#383838] bg-[#212121] text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                  >
                    <option value="Cosine">cosine</option>
                    <option value="DotProduct">dotproduct</option>
                    <option value="Euclidean">euclidean</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-white mb-2">
                  Region
                </label>
                <input
                  disabled
                  value="AWS / India (ap-south-1)"
                  className="w-full h-[38px] px-3 rounded-[2px] border border-[#383838] bg-[#212121] text-[13.5px] text-[#9a9a9a] cursor-not-allowed"
                />
              </div>

              {error && <p className="text-[#f85149] text-[13px]">{error}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className={`w-full h-[38px] rounded-[2px] text-[13.5px] font-semibold transition cursor-pointer ${
                    name.trim()
                      ? 'bg-white hover:bg-[#e8e8e8] text-[#141414]'
                      : 'bg-[#2a2a2a] text-[#707070] cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Creating index...' : 'Create index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Quick Insert Vector Modal ── */}
      {insertCol && (
        <div
          onClick={() => setInsertCol(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[2px] border border-[#343434] bg-[#1c1c1c] shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#343434]">
              <div>
                <h3 className="text-[16.5px] font-bold text-white">Insert document</h3>
                <p className="text-[13px] text-[#a0a0a0] mt-0.5">
                  Index: <code className="font-mono text-white">{insertCol}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInsertCol(null)}
                className="text-[#a0a0a0] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInsert} className="space-y-3.5">
              <div>
                <label className="text-[13px] font-bold text-white mb-1.5 block">
                  Content to embed (384d)
                </label>
                <textarea
                  autoFocus
                  required
                  rows={4}
                  value={insertText}
                  onChange={(e) => setInsertText(e.target.value)}
                  placeholder="Paste text or document chunk to embed and index..."
                  className="w-full bg-[#212121] border border-[#383838] text-[13.5px] rounded-[2px] p-3 text-white focus:outline-none focus:border-[#388bfd] resize-none"
                />
              </div>

              {insertSuccess && (
                <div className="p-2.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px]">
                  Vector indexed into {insertCol}.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#343434]">
                <button
                  type="button"
                  onClick={() => setInsertCol(null)}
                  className="pc-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={insertLoading || !insertText.trim()}
                  className="pc-btn-primary"
                >
                  {insertLoading ? 'Indexing...' : 'Index vector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete index?"
        message={
          <div>
            Are you sure you want to delete{' '}
            <span className="font-mono text-white font-semibold bg-[#282828] px-1.5 py-0.5 rounded border border-[#383838]">
              {deleteTarget}
            </span>
            ? All vectors, metadata, and documents in this index will be permanently removed.
          </div>
        }
        confirmText="Delete index"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
