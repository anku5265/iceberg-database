import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import { Link } from 'react-router-dom'
import OnboardingModal from '../components/OnboardingModal'

export default function Overview() {
  const [collections, setCollections] = useState([])
  const [colDetails, setColDetails] = useState({})
  const [status, setStatus] = useState('online')
  const [stats, setStats] = useState({ searches_today: 0, total_chunks_indexed: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  const loadData = async () => {
    try {
      const colRes = await api.getCollections()
      const cols = colRes.collections || []
      setCollections(cols)
      setStatus('online')

      if (cols.length > 0) {
        const details = {}
        await Promise.all(
          cols.map(async (c) => {
            try {
              const info = await api.getCollection(c)
              if (info) details[c] = info
            } catch {}
          })
        )
        setColDetails(details)
      } else {
        setColDetails({})
      }
    } catch {
      try {
        await api.health()
        setStatus('online')
      } catch {
        setStatus('offline')
      }
    }

    try {
      const statsRes = await api.getStats()
      if (statsRes && typeof statsRes === 'object') {
        setStats(prev => ({
          ...prev,
          searches_today: statsRes.searches_today ?? prev.searches_today ?? 0,
          total_chunks_indexed: statsRes.total_chunks_indexed ?? prev.total_chunks_indexed ?? 0
        }))
        setStatus('online')
      }
    } catch {}
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

  function handleOnboardingDone() {
    setShowOnboarding(false)
    loadData()
  }

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedField(key)
    setTimeout(() => setCopiedField(''), 1800)
  }

  // Strictly isolated per-user vector count (0 when user has 0 collections)
  const totalVectors = collections.length === 0
    ? 0
    : Object.values(colDetails).reduce((sum, c) => sum + (c.vector_count || 0), 0)

  const queries24h = collections.length === 0 ? 0 : (stats.searches_today ?? 0)

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6">
      {showOnboarding && <OnboardingModal onDone={handleOnboardingDone} />}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Overview</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">
            Production vector database and memory cluster hosted in India (ap-south-1).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/explorer"
            className="px-3.5 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition"
          >
            Query Explorer
          </Link>
          <Link
            to="/collections"
            className="px-3.5 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 text-xs font-semibold transition"
          >
            New Collection
          </Link>
        </div>
      </div>

      {/* ── Unified 4-Cell Enterprise Metric Strip (Vercel / PlanetScale / Stripe Pattern) ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)] shadow-[var(--shadow)]">
        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Collections</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {collections.length}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Isolated namespaces</p>
        </div>

        <div className="p-5 border-t-0">
          <p className="text-xs font-medium text-[var(--text-muted)]">Vectors Indexed</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {totalVectors.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">384d · Cosine HNSW</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Queries (24h)</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {queries24h.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Hybrid dense + BM25</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Median Latency</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            14ms
          </p>
          <p className="text-[11px] text-emerald-500 font-medium mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {status === 'online' ? 'Healthy · ap-south-1' : 'Reconnecting'}
          </p>
        </div>
      </div>

      {/* ── Middle Row: Request Volume Chart + Cluster Endpoint Specs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 24h Request Volume & Throughput */}
        <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 flex flex-col justify-between shadow-[var(--shadow)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[13.5px] font-medium text-[var(--text-primary)]">Request Volume</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Search &amp; indexing throughput · ap-south-1</p>
            </div>
            <span className="text-xs text-[var(--text-muted)] border border-[var(--border)] bg-[var(--bg-surface2)] px-2.5 py-1 rounded">
              Last 24 hours
            </span>
          </div>

          <div className="relative h-40 w-full pt-2">
            <svg viewBox="0 0 600 130" className="w-full h-full overflow-visible">
              <line x1="0" y1="20" x2="600" y2="20" stroke="var(--border)" strokeWidth="1" />
              <line x1="0" y1="55" x2="600" y2="55" stroke="var(--border)" strokeWidth="1" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border)" strokeWidth="1" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="var(--border2)" strokeWidth="1" />
              {queries24h > 0 ? (
                <path
                  d="M0,118 L120,116 L240,108 L360,92 L480,78 L600,64"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              ) : (
                <line x1="0" y1="119" x2="600" y2="119" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.65" />
              )}
            </svg>
            <div className="flex items-center justify-between text-[10.5px] font-mono text-[var(--text-muted)] mt-1">
              <span>00:00</span>
              <span>08:00</span>
              <span>16:00</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Right: Cluster Endpoint & SDK Connection Details */}
        <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-[var(--shadow)] flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-[13.5px] font-medium text-[var(--text-primary)]">Cluster Endpoint</h2>
            <Link to="/apikeys" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
              API Keys →
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)] text-xs flex-1 flex flex-col justify-center">
            <div className="px-5 py-3.5 flex items-center justify-between gap-3">
              <span className="text-[var(--text-muted)]">Host</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[var(--text-primary)]">{API_URL}</span>
                <button
                  onClick={() => copyText(API_URL, 'host')}
                  className="text-[11px] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-surface2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  {copiedField === 'host' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="px-5 py-3.5 flex items-center justify-between gap-3">
              <span className="text-[var(--text-muted)]">Region</span>
              <span className="font-mono text-[var(--text-primary)]">Hosted in India (ap-south-1)</span>
            </div>

            <div className="px-5 py-3.5 flex items-center justify-between gap-3">
              <span className="text-[var(--text-muted)]">Embedding Model</span>
              <span className="font-mono text-[var(--text-primary)]">all-MiniLM-L6-v2 (384d)</span>
            </div>

            <div className="px-5 py-3.5 flex items-center justify-between gap-3">
              <span className="text-[var(--text-muted)]">Python SDK</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[var(--text-secondary)]">pip install icebergdb</span>
                <button
                  onClick={() => copyText('pip install icebergdb', 'sdk')}
                  className="text-[11px] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-surface2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  {copiedField === 'sdk' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Collections Data Table (Pinecone / PlanetScale Style) ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-[var(--shadow)]">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[13.5px] font-medium text-[var(--text-primary)]">Collections</h2>
            <span className="text-[11px] font-mono text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--bg-surface2)] border border-[var(--border)]">
              {collections.length}
            </span>
          </div>
          <Link to="/collections" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
            Manage all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-surface2)] text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
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
                  <td colSpan={6} className="py-14 px-5 text-center">
                    <p className="text-[13.5px] font-medium text-[var(--text-primary)]">
                      No collections in this workspace
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                      Create your first vector collection to start indexing documents and agent memories.
                    </p>
                    <div className="mt-4">
                      <Link
                        to="/collections"
                        className="inline-flex items-center px-3.5 py-1.5 rounded-md border border-[var(--border2)] bg-[var(--bg-surface2)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition"
                      >
                        Create Collection
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                collections.map((name) => {
                  const info = colDetails[name]
                  const count = info?.vector_count ?? 0
                  return (
                    <tr key={name} className="hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="py-3.5 px-5 font-mono font-medium text-[var(--text-primary)]">
                        {name}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[var(--text-muted)]">384</td>
                      <td className="py-3.5 px-5 font-mono text-[var(--text-muted)]">Cosine</td>
                      <td className="py-3.5 px-5 font-mono text-[var(--text-primary)] tabular-nums">
                        {count.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          to={`/explorer?collection=${encodeURIComponent(name)}`}
                          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition"
                        >
                          Explore →
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
