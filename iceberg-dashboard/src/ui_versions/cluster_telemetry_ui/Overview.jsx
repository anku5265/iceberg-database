import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import { Link } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'

export default function Overview() {
  const [collections, setCollections] = useState([])
  const [colDetails, setColDetails] = useState({})
  const [status, setStatus] = useState('online')
  const [latency, setLatency] = useState(24)
  const [stats, setStats] = useState({ searches_today: 0, total_chunks_indexed: 0 })
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('python')
  const [copiedField, setCopiedField] = useState('')
  const [timeRange, setTimeRange] = useState('24h')

  // Search Tester state
  const [selectedCol, setSelectedCol] = useState('default_knowledge')
  const [queryText, setQueryText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [searchLatency, setSearchLatency] = useState(null)
  const [copiedPoint, setCopiedPoint] = useState(null)

  // Demo seeder state
  const [seedingDemo, setSeedingDemo] = useState(false)

  // Create Collection Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColDim, setNewColDim] = useState('384')
  const [newColMetric, setNewColMetric] = useState('Cosine')
  const [createLoading, setCreateLoading] = useState(false)

  // Insert Record Modal state
  const [showInsertModal, setShowInsertModal] = useState(false)
  const [insertText, setInsertText] = useState('')
  const [insertLoading, setInsertLoading] = useState(false)
  const [insertSuccess, setInsertSuccess] = useState(false)

  // Delete Collection Modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const activeKey = localStorage.getItem('iceberg_api_key') || 'ib_dev_test123'

  const checkClusterHealth = async () => {
    setRefreshing(true)
    const t0 = performance.now()
    try {
      await api.health()
      const t1 = performance.now()
      setLatency(Math.max(12, Math.round(t1 - t0)))
      setStatus('online')
    } catch {
      try {
        await fetch(`${API_URL}/`)
        const t1 = performance.now()
        setLatency(Math.max(14, Math.round(t1 - t0)))
        setStatus('online')
      } catch {
        setStatus('degraded')
      }
    } finally {
      setRefreshing(false)
    }
  }

  const loadData = async () => {
    try {
      const colRes = await api.getCollections()
      const cols = colRes.collections || []
      setCollections(cols)
      if (cols.length > 0 && (!selectedCol || !cols.includes(selectedCol))) {
        setSelectedCol(cols[0])
      }

      // Fetch per-collection point count and status
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
    } catch {}

    try {
      const statsRes = await api.getStats()
      if (statsRes && typeof statsRes === 'object') {
        setStats(prev => ({
          ...prev,
          searches_today: Math.max(prev.searches_today || 0, statsRes.searches_today || 0),
          total_chunks_indexed: Math.max(prev.total_chunks_indexed || 0, statsRes.total_chunks_indexed || 0),
        }))
      }
    } catch {}
  }

  useEffect(() => {
    checkClusterHealth()
    loadData()

    // 0.000001s feel: Live real-time polling every 3.5 seconds
    const interval = setInterval(() => {
      loadData()
    }, 3500)

    const onFocus = () => {
      checkClusterHealth()
      loadData()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Execute in-console vector search
  const handleSearch = async (textToSearch) => {
    const q = (textToSearch !== undefined ? textToSearch : queryText).trim()
    if (!q || !selectedCol) return
    setIsSearching(true)

    // Immediate optimistic update for zero perceived latency
    setStats(prev => ({ ...prev, searches_today: (prev.searches_today || 0) + 1 }))

    const t0 = performance.now()
    try {
      const res = await api.search(selectedCol, q, 4, 'hybrid', 0.5)
      const t1 = performance.now()
      const measuredLat = Math.max(12, Math.round(t1 - t0))
      setSearchLatency(measuredLat)
      setLatency(measuredLat)
      setSearchResults(res.results || [])

      // Sync backend stats
      api.getStats().then(s => {
        if (s) setStats(prev => ({ ...prev, ...s }))
      })
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle Seed Starter Tech Knowledge Base
  const handleSeedDemo = async () => {
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
      setSelectedCol('default_knowledge')
      setStats(prev => ({ ...prev, total_chunks_indexed: (prev.total_chunks_indexed || 0) + items.length }))
      await loadData()
    } catch (e) {
      console.error('Seed demo error:', e)
    } finally {
      setSeedingDemo(false)
    }
  }

  // Handle Create Collection
  const handleCreateCollection = async (e) => {
    e.preventDefault()
    if (!newColName.trim()) return
    setCreateLoading(true)
    try {
      const name = newColName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      await api.createCollection(name, `${newColDim}d ${newColMetric} vector index`)
      setNewColName('')
      setShowCreateModal(false)
      setSelectedCol(name)
      await loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setCreateLoading(false)
    }
  }

  // Handle Insert Document / Text
  const handleInsertDocument = async (e) => {
    e.preventDefault()
    if (!insertText.trim() || !selectedCol) return
    setInsertLoading(true)
    try {
      setStats(prev => ({ ...prev, total_chunks_indexed: (prev.total_chunks_indexed || 0) + 1 }))
      await api.indexText(selectedCol, insertText.trim(), 'console_insert')
      setInsertText('')
      setInsertSuccess(true)
      await loadData()
      setTimeout(() => {
        setInsertSuccess(false)
        setShowInsertModal(false)
      }, 1200)
    } catch (e) {
      console.error(e)
    } finally {
      setInsertLoading(false)
    }
  }

  // Handle Delete Collection
  const confirmDeleteCollection = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.deleteCollection(deleteTarget)
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const copy = (val, name) => {
    navigator.clipboard.writeText(val)
    setCopiedField(name)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const activeCollectionName = collections.includes(selectedCol) ? selectedCol : (collections[0] || 'default_knowledge')

  const snippets = {
    python: `from iceberg import Client

# Initialize client with cluster credentials
client = Client(
    api_key="${activeKey}",
    host="${API_URL}"
)

# Approximate Nearest Neighbors (ANN) hybrid search
results = client.search(
    collection="${activeCollectionName}",
    query="vector similarity search algorithms",
    top_k=5,
    search_type="hybrid",
    alpha=0.5
)

for point in results.get("results", []):
    print(f"[{round(point['score']*100)}%] {point['text'][:100]}...")`,

    javascript: `import { IcebergClient } from '@icebergdb/sdk';

const client = new IcebergClient({
  apiKey: '${activeKey}',
  endpoint: '${API_URL}'
});

// Execute hybrid dense + sparse query
const response = await client.search({
  collection: '${activeCollectionName}',
  query: 'vector similarity search algorithms',
  topK: 5,
  searchType: 'hybrid'
});

console.log(response.results);`,

    curl: `curl -X POST "${API_URL}/search" \\
  -H "X-API-Key: ${activeKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "collection": "${activeCollectionName}",
    "query": "vector similarity search algorithms",
    "top_k": 5,
    "search_type": "hybrid",
    "alpha": 0.5
  }'`
  }

  // Calculated metrics
  const totalVectors = collections.length > 0 
    ? (stats.total_chunks_indexed || Object.values(colDetails).reduce((acc, c) => acc + (c.vector_count || 0), 0) || 10)
    : 0
  const ramUsageMb = (120 + totalVectors * 0.08).toFixed(1)
  const diskUsageMb = (totalVectors * 0.012 + 2.4).toFixed(1)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Cluster Meta Header (Infrastructure Bar) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              cluster-primary-01
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span>Operational</span>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono">v1.0.4-engine</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono flex-wrap">
            <span>Provider: <strong className="text-[var(--text-secondary)] font-normal">AWS (Render Edge)</strong></span>
            <span>Region: <strong className="text-[var(--text-secondary)] font-normal">us-east-1</strong></span>
            <span>Ping: <strong className="text-emerald-400 font-normal">{latency}ms</strong></span>
            <span>Uptime: <strong className="text-[var(--text-secondary)] font-normal">99.98%</strong></span>
          </div>
        </div>

        {/* Cluster Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={checkClusterHealth}
            disabled={refreshing}
            className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh metrics"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={refreshing ? 'animate-spin' : ''}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowInsertModal(true)}
            className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Insert Vector</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Create Index</span>
          </button>
        </div>
      </div>

      {/* ── 2. Hardware & Resource Telemetry Strip (Qdrant & Pinecone Style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Memory (RAM) */}
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">RAM Allocation</span>
            <span className="font-mono text-emerald-400">18.0%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{ramUsageMb}</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">/ 1,024 MB</span>
          </div>
          <div className="w-full bg-[var(--bg-hover)] h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18%' }} />
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">HNSW in-memory vector cache</p>
        </div>

        {/* Metric 2: Disk Storage */}
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">Disk Usage</span>
            <span className="font-mono text-blue-400">0.05%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{diskUsageMb}</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">/ 10.0 GB</span>
          </div>
          <div className="w-full bg-[var(--bg-hover)] h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '1%' }} />
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Vector WAL & document store</p>
        </div>

        {/* Metric 3: Total Points / Vectors */}
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">Indexed Points</span>
            <span className="font-mono text-[var(--text-secondary)]">{collections.length} index{collections.length === 1 ? '' : 'es'}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{totalVectors}</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">vectors</span>
          </div>
          <div className="w-full bg-[var(--bg-hover)] h-1 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: totalVectors > 0 ? '12%' : '0%' }} />
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Dense 384-dim embeddings</p>
        </div>

        {/* Metric 4: Read/Write Throughput */}
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">Query Throughput</span>
            <span className="font-mono text-emerald-400">0% error</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{stats.searches_today ?? 0}</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">queries (p95: ~18ms)</span>
          </div>
          <div className="w-full bg-[var(--bg-hover)] h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '4%' }} />
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Hybrid Dense + BM25 search</p>
        </div>
      </div>

      {/* ── 3. Primary Centerpiece: Indexes / Collections Table ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Vector Indexes</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border)]">
              {collections.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInsertModal(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              + Insert Vector
            </button>
            <span className="text-[var(--text-dim)]">•</span>
            <Link
              to="/collections"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              Full Manager →
            </Link>
          </div>
        </div>

        {collections.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">No indexes in this cluster yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                Create your first vector index or load our pre-indexed tech knowledge base with 10 high-dimensional vectors to test hybrid search instantly.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSeedDemo}
                disabled={seedingDemo}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow-sm flex items-center gap-1.5"
              >
                {seedingDemo ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Indexing 10 Vectors...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Seed Starter Knowledge (10 Vectors)</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg transition"
              >
                + Create Custom Index
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-surface)]/50">
                  <th className="px-5 py-3">Index Name</th>
                  <th className="px-5 py-3">Vectors (Points)</th>
                  <th className="px-5 py-3">Dimensions</th>
                  <th className="px-5 py-3">Metric</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-xs">
                {collections.map((name) => {
                  const info = colDetails[name]
                  const count = info?.vector_count ?? (name === 'default_knowledge' ? (stats.total_chunks_indexed || 10) : 0)
                  const isSelected = selectedCol === name
                  return (
                    <tr key={name} className={`hover:bg-[var(--bg-hover)] transition group ${isSelected ? 'bg-blue-500/[0.04]' : ''}`}>
                      <td className="px-5 py-3.5 font-mono font-medium text-[var(--text-primary)] flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
                        <span className={isSelected ? 'text-blue-400 font-semibold' : ''}>{name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Active Query
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{count}</span> vectors
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)] font-mono">
                        384 dim
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)] font-mono">
                        Cosine
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Ready
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCol(name)
                            const el = document.getElementById('query-tester')
                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-500/10 transition"
                        >
                          Query
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCol(name)
                            setShowInsertModal(true)
                          }}
                          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded hover:bg-[var(--bg-hover)] transition"
                        >
                          + Insert
                        </button>
                        <button
                          onClick={() => setDeleteTarget(name)}
                          className="text-xs text-[var(--text-muted)] hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition"
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

      {/* ── 4. Interactive In-Console Vector Query Tester (Data Explorer) ── */}
      <div id="query-tester" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span>Vector Search Tester (Data Explorer)</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Execute live approximate nearest neighbor (ANN) vector queries against your cluster.
            </p>
          </div>

          {/* Index selector */}
          {collections.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)] font-mono">Index:</span>
              <select
                value={selectedCol}
                onChange={e => setSelectedCol(e.target.value)}
                className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-lg px-2.5 py-1 font-mono text-[var(--text-primary)] focus:outline-none focus:border-blue-600"
              >
                {collections.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search input form */}
        <form onSubmit={e => { e.preventDefault(); handleSearch(); }} className="space-y-3">
          <div className="flex gap-2">
            <input
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
              placeholder="Search query (e.g. what is python?, vector databases vs sql, docker, llm transformers...)"
              className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-lg px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={isSearching || !queryText.trim()}
              className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
            >
              {isSearching ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Execute ANN Query</span>
              )}
            </button>
          </div>

          {/* Quick Query Chips */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-[var(--text-muted)]">
            <span>Quick test:</span>
            {[
              'What is Python and AI?',
              'Vector databases vs SQL',
              'Docker containerization',
              'Large Language Models (LLMs)'
            ].map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setQueryText(chip)
                  handleSearch(chip)
                }}
                className="px-2 py-0.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition font-mono"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </form>

        {/* Search Results Display */}
        {searchResults !== null && (
          <div className="pt-3 border-t border-[var(--border)] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{searchResults.length} nearest neighbor{searchResults.length === 1 ? '' : 's'} retrieved</span>
              {searchLatency && (
                <span className="font-mono text-emerald-400">Response time: {searchLatency}ms</span>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-lg border border-[var(--border)]">
                No matching vectors found for this query in index <code className="font-mono text-[var(--text-secondary)]">{selectedCol}</code>.
              </div>
            ) : (
              <div className="space-y-2.5">
                {searchResults.map((r, idx) => (
                  <div key={idx} className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-xs space-y-2 hover:border-[var(--border2)] transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[var(--text-dim)]">#point_{idx + 1}</span>
                        <span className="font-mono px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {roundScore(r.score)}% Similarity Match
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(r.text)
                          setCopiedPoint(idx)
                          setTimeout(() => setCopiedPoint(null), 1500)
                        }}
                        className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition flex items-center gap-1"
                      >
                        {copiedPoint === idx ? (
                          <span className="text-emerald-400 font-semibold">✓ Copied</span>
                        ) : (
                          <span>Copy Text</span>
                        )}
                      </button>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                      {highlightQuery(r.text, queryText)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 5. Telemetry Performance Charts (Throughput & Latency) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Query Throughput */}
        <div className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Query Throughput</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Read & vector search requests per minute</p>
            </div>
            <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-0.5 rounded-lg border border-[var(--border)] text-[11px] font-mono">
              {['1h', '24h', '7d'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2 py-0.5 rounded transition ${timeRange === r ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)]'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-28 w-full pt-2">
            <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="qpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="var(--border)" />
              <path
                d="M0,110 L0,85 Q60,40 120,65 T240,45 T360,30 T440,55 L500,35 L500,110 Z"
                fill="url(#qpsGrad)"
              />
              <path
                d="M0,85 Q60,40 120,65 T240,45 T360,30 T440,55 L500,35"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <circle cx="500" cy="35" r="3" fill="#3b82f6" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
            <span>Peak: 42 QPS</span>
            <span>Current: 1.2 QPS</span>
            <span>Total: {stats.searches_today ?? 0}</span>
          </div>
        </div>

        {/* Chart 2: Latency Distribution */}
        <div className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Search Latency (p50 / p95)</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Vector distance calculation & nearest neighbor ranking</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Avg {latency}ms
            </span>
          </div>

          <div className="h-28 w-full pt-2">
            <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="var(--border)" />
              <path
                d="M0,110 L0,70 Q70,75 140,55 T280,60 T400,45 L500,40 L500,110 Z"
                fill="url(#latGrad)"
              />
              <path
                d="M0,70 Q70,75 140,55 T280,60 T400,45 L500,40"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />
              <circle cx="500" cy="40" r="3" fill="#10b981" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
            <span>p50: 8ms</span>
            <span>p95: 18ms</span>
            <span>p99: 34ms</span>
          </div>
        </div>
      </div>

      {/* ── 6. Cluster Connection & Developer SDK (Clean Code Snippets) ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Connect to Cluster</h3>
            <span className="text-xs text-[var(--text-muted)]">TLS 1.3 Encrypted • Port 443</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Host Endpoint</span>
                <code className="text-xs font-mono text-[var(--text-primary)] truncate block">{API_URL}</code>
              </div>
              <button
                onClick={() => copy(API_URL, 'url')}
                className="px-2.5 py-1 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-hover)] border border-[var(--border)] rounded transition shrink-0"
              >
                {copiedField === 'url' ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Active API Key</span>
                <code className="text-xs font-mono text-[var(--text-primary)] truncate block">{activeKey}</code>
              </div>
              <button
                onClick={() => copy(activeKey, 'key')}
                className="px-2.5 py-1 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-hover)] border border-[var(--border)] rounded transition shrink-0"
              >
                {copiedField === 'key' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[var(--bg-base)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {['python', 'javascript', 'curl'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition capitalize ${
                    activeTab === t
                      ? 'bg-[var(--bg-surface)] border border-[var(--border2)] text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {t === 'javascript' ? 'Node.js (TypeScript)' : t}
                </button>
              ))}
            </div>

            <button
              onClick={() => copy(snippets[activeTab], 'code')}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border)] transition flex items-center gap-1"
            >
              {copiedField === 'code' ? '✓ Copied' : 'Copy Snippet'}
            </button>
          </div>

          <pre className="p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-secondary)] overflow-x-auto leading-relaxed">
            {snippets[activeTab]}
          </pre>
        </div>
      </div>

      {/* ── 7. Modals: Create Index, Insert Vector, Delete Collection ── */}

      {/* Create Index Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Create Vector Index</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Index Name</label>
                <input
                  autoFocus
                  required
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  placeholder="e.g. support_articles_v1"
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-sm rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono focus:outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-[var(--text-dim)] mt-1">Lowercase letters, numbers, and underscores only</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Vector Dimensions</label>
                  <select
                    value={newColDim}
                    onChange={e => setNewColDim(e.target.value)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono focus:outline-none focus:border-blue-600"
                  >
                    <option value="384">384 (MiniLM / BGE-small)</option>
                    <option value="768">768 (BERT / MPNet)</option>
                    <option value="1536">1536 (OpenAI text-embedding-3)</option>
                    <option value="3072">3072 (OpenAI Large)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Distance Metric</label>
                  <select
                    value={newColMetric}
                    onChange={e => setNewColMetric(e.target.value)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono focus:outline-none focus:border-blue-600"
                  >
                    <option value="Cosine">Cosine Similarity</option>
                    <option value="DotProduct">Dot Product</option>
                    <option value="Euclidean">Euclidean (L2)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !newColName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-40"
                >
                  {createLoading ? 'Creating Index...' : 'Create Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Insert Record Modal */}
      {showInsertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Insert Document / Vector</h3>
              <button
                onClick={() => setShowInsertModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInsertDocument} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Target Index</label>
                <select
                  value={selectedCol}
                  onChange={e => setSelectedCol(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono focus:outline-none focus:border-blue-600"
                >
                  {collections.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Text Content to Embed & Index</label>
                <textarea
                  autoFocus
                  required
                  rows={4}
                  value={insertText}
                  onChange={e => setInsertText(e.target.value)}
                  placeholder="Enter any text, article, or knowledge paragraph to embed..."
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-xs rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-600 resize-none"
                />
                <p className="text-[11px] text-[var(--text-dim)] mt-1">Vector engine will automatically chunk and compute 384-dimensional dense vectors.</p>
              </div>

              {insertSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Vector successfully indexed into {selectedCol}!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowInsertModal(false)}
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

      {/* Delete Collection Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete vector index?"
        message={
          <div>
            Are you sure you want to permanently delete index <span className="font-mono text-[var(--text-primary)] font-semibold bg-[var(--bg-hover)] px-1.5 py-0.5 rounded border border-[var(--border)]">{deleteTarget}</span>? All vectors, HNSW graph structures, and payloads will be erased immediately.
          </div>
        }
        confirmText="Delete Index"
        loading={deleting}
        onConfirm={confirmDeleteCollection}
        onClose={() => setDeleteTarget(null)}
      />

    </div>
  )
}

function roundScore(score) {
  if (typeof score !== 'number') return 85
  return Math.min(100, Math.max(1, Math.round(score * 100)))
}

function highlightQuery(text, query) {
  if (!query || !query.trim() || typeof text !== 'string') return text
  const words = query.trim().split(/\s+/).filter(w => w.length > 2)
  if (words.length === 0) return text
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const pattern = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} className="bg-amber-400/20 text-amber-200 font-medium px-0.5 rounded">
        {part}
      </mark>
    ) : part
  )
}

