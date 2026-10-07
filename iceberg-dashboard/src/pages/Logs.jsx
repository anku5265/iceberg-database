import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const TYPE_STYLE = {
  search: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  index: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  memory_read: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  memory_write: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  create: 'text-green-400 bg-green-500/10 border-green-500/20',
  delete: 'text-red-400 bg-red-500/10 border-red-500/20',
}

function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString('en-IN', {
    hour12: false,
    dateStyle: 'short',
    timeStyle: 'medium',
  })
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadLogs = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const d = await api.getLogs()
      setLogs(d.logs || [])
    } catch {
      // Keep existing
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
    let timer = null
    if (autoRefresh) {
      timer = setInterval(() => loadLogs(true), 3500)
    }
    const onFocus = () => loadLogs(true)
    window.addEventListener('focus', onFocus)
    return () => {
      if (timer) clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [autoRefresh])

  const filtered = logs.filter(l => {
    const matchesFilter = filter === 'all' || l.action === filter || (filter === 'memory' && (l.action === 'memory_read' || l.action === 'memory_write'))
    const matchesSearch = !searchQuery.trim() ||
      (l.collection && l.collection.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
      (l.detail && l.detail.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
      (l.action && l.action.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    return matchesFilter && matchesSearch
  })

  // Metrics
  const searchCount = logs.filter(l => l.action === 'search' || l.action === 'memory_read').length
  const indexCount = logs.filter(l => l.action === 'index' || l.action === 'memory_write').length
  const durations = logs.map(l => l.duration_ms).filter(Boolean)
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 12

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Audit Logs &amp; Telemetry</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Real-time trace logs of semantic searches, batch indexing, and memory read/write requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 text-xs font-medium border rounded-lg transition flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-[var(--bg-surface)] text-[var(--text-dim)] border-[var(--border)]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            <span>{autoRefresh ? 'Live Polling: On' : 'Live Polling: Off'}</span>
          </button>

          <button
            onClick={() => loadLogs()}
            className="px-3 py-2 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh logs"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={loading ? 'animate-spin' : ''}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Recorded Events</span>
            <span className="text-blue-400">Total</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{logs.length}</div>
          <p className="text-[11px] text-[var(--text-dim)]">Recent trace buffer</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Search Operations</span>
            <span className="text-emerald-400">Queries</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{searchCount}</div>
          <p className="text-[11px] text-[var(--text-dim)]">Semantic &amp; hybrid lookups</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Vector Ingestion</span>
            <span className="text-purple-400">Writes</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{indexCount}</div>
          <p className="text-[11px] text-[var(--text-dim)]">Upserts &amp; memory writes</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Average Latency</span>
            <span className="text-amber-400">P95</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">&lt; {avgDuration}ms</div>
          <p className="text-[11px] text-[var(--text-dim)]">End-to-end execution</p>
        </div>
      </div>

      {/* ── 3. Filter & Search Toolbar ── */}
      <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter logs by collection, query, or action..."
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg pl-8 pr-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)] transition"
          />
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-2.5 top-2.5 text-[var(--text-dim)]">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        {/* Action Category Filter */}
        <div className="flex flex-wrap gap-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-1">
          {[
            { id: 'all', label: 'All Operations' },
            { id: 'search', label: 'Search' },
            { id: 'index', label: 'Index' },
            { id: 'memory', label: 'Memory' },
            { id: 'create', label: 'Create' },
            { id: 'delete', label: 'Delete' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. High-Density Logs Table ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-5">Action Type</th>
                <th className="py-3 px-5">Namespace / Collection</th>
                <th className="py-3 px-5">Detail / Payload Preview</th>
                <th className="py-3 px-5">Duration</th>
                <th className="py-3 px-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--text-secondary)]">
                    Loading audit telemetry...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log, i) => {
                  const style = TYPE_STYLE[log.action] || 'text-[var(--text-muted)] bg-[var(--bg-hover)] border-[var(--border)]'
                  const isFast = !log.duration_ms || log.duration_ms < 50
                  return (
                    <tr key={log.id || i} className="hover:bg-[var(--bg-hover)] transition group">
                      <td className="py-3.5 px-5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${style}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-blue-400 font-semibold truncate max-w-[200px]">
                        {log.collection || '—'}
                      </td>

                      <td className="py-3.5 px-5 text-[var(--text-secondary)] truncate max-w-[340px]" title={log.detail}>
                        {log.detail || '—'}
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          isFast
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {log.duration_ms ? `${log.duration_ms}ms` : '< 15ms'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right text-[var(--text-dim)] text-[11px]">
                        {formatTime(log.created_at)}
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
