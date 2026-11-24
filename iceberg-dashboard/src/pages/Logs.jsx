import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'

const OPERATION_META = {
  search: {
    label: 'Search',
    endpoint: 'POST /search',
    dotColor: '#388bfd',
  },
  index: {
    label: 'Upsert',
    endpoint: 'POST /documents',
    dotColor: '#a371f7',
  },
  memory_read: {
    label: 'Memory read',
    endpoint: 'POST /memory/recall',
    dotColor: '#2ea043',
  },
  memory_write: {
    label: 'Memory write',
    endpoint: 'POST /memory/remember',
    dotColor: '#d29922',
  },
  create: {
    label: 'Create index',
    endpoint: 'POST /collections',
    dotColor: '#2ea043',
  },
  delete: {
    label: 'Delete index',
    endpoint: 'DELETE /collections',
    dotColor: '#f85149',
  },
}

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'search', label: 'Search' },
  { id: 'index', label: 'Upsert' },
  { id: 'memory', label: 'Memory' },
  { id: 'create', label: 'Create' },
  { id: 'delete', label: 'Delete' },
]

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250]

function formatPineconeDate(ts) {
  if (!ts) return '—'
  try {
    const d = new Date(ts * 1000)
    const datePart = d.toLocaleDateString('en-US')
    const timePart = d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return `${datePart}, ${timePart}`
  } catch {
    return '—'
  }
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [pageSize, setPageSize] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  const [openActionRowId, setOpenActionRowId] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [inspectTarget, setInspectTarget] = useState(null)
  const [copiedId, setCopiedId] = useState('')
  const actionMenuRef = useRef(null)
  const exportMenuRef = useRef(null)

  const loadLogs = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const d = await api.getLogs(1000)
      setLogs(d.logs || [])
    } catch {
      // Keep existing logs
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

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchQuery, pageSize])

  useEffect(() => {
    const onDocClick = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionRowId(null)
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const toStructuredLog = (log) => {
    const meta = OPERATION_META[log.action] || {
      label: log.action || 'Request',
      endpoint: 'POST /api',
    }
    return {
      id: log.id,
      operation: log.action,
      operation_label: meta.label,
      endpoint: meta.endpoint,
      index_or_namespace: log.collection || 'default',
      details: log.detail || '',
      latency_ms: log.duration_ms || 12,
      status: 200,
      timestamp: log.created_at
        ? new Date(log.created_at * 1000).toISOString()
        : new Date().toISOString(),
    }
  }

  const copyLogJson = (log, rowKey) => {
    const payload = toStructuredLog(log)
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopiedId(rowKey)
    setTimeout(() => setCopiedId(''), 1800)
  }

  const filtered = logs.filter((l) => {
    const matchesFilter =
      filter === 'all' ||
      l.action === filter ||
      (filter === 'memory' && (l.action === 'memory_read' || l.action === 'memory_write'))
    const q = searchQuery.trim().toLowerCase()
    const meta = OPERATION_META[l.action]
    const matchesSearch =
      !q ||
      (l.collection && l.collection.toLowerCase().includes(q)) ||
      (l.detail && l.detail.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (meta?.label && meta.label.toLowerCase().includes(q))
    return matchesFilter && matchesSearch
  })

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedRows = filtered.slice(startIndex, endIndex)

  const handleExport = (format = 'json') => {
    setShowExportMenu(false)
    const exportList = filtered.map(toStructuredLog)
    const dateStamp = new Date().toISOString().slice(0, 10)

    if (format === 'csv') {
      const headers = ['id', 'operation', 'endpoint', 'index_or_namespace', 'details', 'latency_ms', 'status', 'timestamp']
      const csvRows = [
        headers.join(','),
        ...exportList.map((row) =>
          headers
            .map((h) => {
              const val = String(row[h] ?? '').replace(/"/g, '""')
              return `"${val}"`
            })
            .join(',')
        ),
      ]
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `iceberg-audit-logs-${dateStamp}.csv`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    const blob = new Blob([JSON.stringify(exportList, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `iceberg-audit-logs-${dateStamp}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pt-[50px] pb-12 px-6 sm:px-[49px] max-w-[1090px] text-[var(--text-primary)]">
      {/* ── Top Header Row: "Logs" (24px bold Inter) + Live Tail, Export & Refresh Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
          Logs
        </h1>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="h-[37px] px-3.5 rounded-[2px] border border-[#343434] bg-[#1c1c1c] hover:bg-[#242424] text-[13px] font-semibold text-white inline-flex items-center gap-2 cursor-pointer transition"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? 'bg-[#2ea043]' : 'bg-[#6e6e6e]'
              }`}
            />
            <span>{autoRefresh ? 'Live tail: On' : 'Live tail: Off'}</span>
          </button>

          {/* Export Dropdown (JSON / CSV) */}
          <div ref={exportMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-[37px] px-3.5 rounded-[2px] border border-[#343434] bg-[#1c1c1c] hover:bg-[#242424] text-[13px] font-semibold text-white inline-flex items-center gap-2 cursor-pointer transition"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="text-[#a6a6a6]">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-[42px] w-[168px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.8)] py-1.5 z-[115] text-left">
                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left text-[13px] font-bold text-white hover:bg-[#2a2a2a] flex items-center justify-between cursor-pointer"
                >
                  <span>Export JSON</span>
                  <span className="text-[11px] font-normal text-[#8c8c8c]">.json</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-[13px] font-bold text-white hover:bg-[#2a2a2a] flex items-center justify-between cursor-pointer"
                >
                  <span>Export CSV</span>
                  <span className="text-[11px] font-normal text-[#8c8c8c]">.csv</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => loadLogs()}
            className="h-[37px] px-3.5 rounded-[2px] border border-[#343434] bg-[#1c1c1c] hover:bg-[#242424] text-[13px] font-semibold text-white inline-flex items-center gap-2 cursor-pointer transition"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Pinecone Filter & Search Bar ── */}
      <div className="mt-[25px] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-[330px]">
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c8c] pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by index, query, or operation..."
            className="w-full h-[37px] bg-[#1c1c1c] border border-[#343434] rounded-[2px] pl-9 pr-8 text-[13px] text-white placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#388bfd] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-white text-[12px] cursor-pointer"
              title="Clear filter"
            >
              ✕
            </button>
          )}
        </div>

        <div className="inline-flex flex-wrap items-center bg-[#1c1c1c] border border-[#343434] rounded-[2px] p-1 gap-0.5">
          {FILTER_TABS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`h-[27px] px-3 rounded-[2px] text-[13px] transition cursor-pointer ${
                  active
                    ? 'bg-[#2b2b2b] text-white font-semibold'
                    : 'text-[#a6a6a6] hover:text-white font-medium'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Exact 6-Column Pinecone Bordered Table (#1c1c1c surface on #171717 canvas, #343434 borders, 55px header, 64px rows, 13px Inter) ── */}
      <div
        ref={actionMenuRef}
        className="mt-3 border border-[#343434] rounded-[2px] bg-[#1c1c1c] relative"
      >
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="h-[55px] border-b border-[#343434] bg-[#1c1c1c] text-[#cccccc] text-[13px] font-semibold">
              <th className="pl-[18px] pr-3 w-[16.5%]">Operation</th>
              <th className="px-3 w-[22.5%]">Index / Namespace</th>
              <th className="px-3 w-[29.5%]">Details</th>
              <th className="px-3 w-[10.5%]">Latency</th>
              <th className="px-3 w-[13.5%]">Timestamp</th>
              <th className="px-3 w-[7.5%] text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#343434]">
            {loading ? (
              <tr className="h-[120px] bg-[#1c1c1c]">
                <td colSpan={6} className="text-center text-[13px] text-[#a6a6a6]">
                  Loading activity logs...
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr className="h-[140px] bg-[#1c1c1c]">
                <td colSpan={6} className="text-center text-[13px] text-[#a6a6a6]">
                  No matching activity logs found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((log, i) => {
                const rowKey = String(log.id || `row_${startIndex + i}`)
                const meta = OPERATION_META[log.action] || {
                  label: log.action || 'Request',
                  endpoint: 'POST /api',
                  dotColor: '#388bfd',
                }
                const menuOpen = openActionRowId === rowKey
                const isCopied = copiedId === rowKey

                return (
                  <tr
                    key={rowKey}
                    onClick={() => setInspectTarget(log)}
                    className="h-[64px] bg-[#1c1c1c] hover:bg-[#222222] transition text-[13px] text-white cursor-pointer"
                  >
                    {/* Operation */}
                    <td className="pl-[18px] pr-3 font-bold text-white truncate">
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: meta.dotColor }}
                        />
                        <span className="truncate">{meta.label}</span>
                      </div>
                    </td>

                    {/* Index / Namespace */}
                    <td className="px-3 font-normal text-white truncate" title={log.collection || 'default'}>
                      {log.collection || 'default'}
                    </td>

                    {/* Details */}
                    <td className="px-3 font-normal text-[#d4d4d4] truncate" title={log.detail || ''}>
                      {log.detail || '—'}
                    </td>

                    {/* Latency */}
                    <td className="px-3 font-normal text-white">
                      {log.duration_ms ? `${log.duration_ms} ms` : '< 15 ms'}
                    </td>

                    {/* Timestamp */}
                    <td className="px-3 font-normal text-white truncate">
                      {formatPineconeDate(log.created_at)}
                    </td>

                    {/* Actions (•••) */}
                    <td
                      className="px-3 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenActionRowId(menuOpen ? null : rowKey)}
                        className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-white cursor-pointer transition ${
                          menuOpen ? 'bg-[#2b2b2b]' : 'hover:bg-[#2a2a2a]'
                        }`}
                        title="Actions"
                      >
                        <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>

                      {isCopied && (
                        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[11.5px] font-semibold text-emerald-400 bg-[#1c1c1c] px-1.5 py-0.5 rounded-[2px]">
                          Copied
                        </span>
                      )}

                      {menuOpen && (
                        <div className="absolute right-3 top-[52px] w-[156px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.8)] py-2 z-[110] text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenActionRowId(null)
                              setInspectTarget(log)
                            }}
                            className="w-full px-4 py-2 text-left text-[13.5px] font-bold text-white hover:bg-[#2a2a2a] flex items-center gap-3 cursor-pointer"
                          >
                            <svg
                              width="15"
                              height="15"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.9"
                              viewBox="0 0 24 24"
                              className="text-white shrink-0"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>View details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenActionRowId(null)
                              copyLogJson(log, rowKey)
                            }}
                            className="w-full px-4 py-2 text-left text-[13.5px] font-bold text-[#cccccc] hover:text-white hover:bg-[#2a2a2a] flex items-center gap-3 cursor-pointer"
                          >
                            <svg
                              width="15"
                              height="15"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.9"
                              viewBox="0 0 24 24"
                              className="shrink-0"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>Copy JSON</span>
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

        {/* ── Pinecone Table Pagination & History Footer (Access 100% of logs beyond 100) ── */}
        {!loading && totalItems > 0 && (
          <div className="h-[54px] border-t border-[#343434] bg-[#1c1c1c] px-[18px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[#cccccc]">
            <div className="flex items-center gap-3">
              <span>
                Showing <span className="font-semibold text-white">{startIndex + 1}</span>–
                <span className="font-semibold text-white">{endIndex}</span> of{' '}
                <span className="font-semibold text-white">{totalItems}</span> logs
              </span>

              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[#8c8c8c]">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-[28px] bg-[#242424] border border-[#3a3a3a] rounded-[2px] px-2 text-[12.5px] font-semibold text-white focus:outline-none focus:border-[#388bfd] cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#8c8c8c] mr-1">
                Page <span className="text-white font-semibold">{safePage}</span> of{' '}
                <span className="text-white font-semibold">{totalPages}</span>
              </span>

              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`h-[30px] px-3 rounded-[2px] border text-[12.5px] font-semibold transition ${
                  safePage <= 1
                    ? 'border-[#2c2c2c] bg-[#1a1a1a] text-[#5c5c5c] cursor-not-allowed'
                    : 'border-[#3a3a3a] bg-[#242424] hover:bg-[#2c2c2c] text-white cursor-pointer'
                }`}
              >
                Previous
              </button>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`h-[30px] px-3 rounded-[2px] border text-[12.5px] font-semibold transition ${
                  safePage >= totalPages
                    ? 'border-[#2c2c2c] bg-[#1a1a1a] text-[#5c5c5c] cursor-not-allowed'
                    : 'border-[#3a3a3a] bg-[#242424] hover:bg-[#2c2c2c] text-white cursor-pointer'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Centered Pinecone "Log details" Modal (562px width, 32px padding, #1c1c1c surface) ── */}
      {inspectTarget && (() => {
        const meta = OPERATION_META[inspectTarget.action] || {
          label: inspectTarget.action || 'Request',
          endpoint: 'POST /api',
          dotColor: '#388bfd',
        }
        const rowKey = String(inspectTarget.id || 'modal_copy')
        return (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setInspectTarget(null)
            }}
          >
            <div className="w-full max-w-[562px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_24px_64px_rgba(0,0,0,0.75)] p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-white tracking-tight leading-snug">
                    Log details
                  </h2>
                  <p className="text-[13px] text-[#a6a6a6] mt-1">
                    {meta.endpoint} · Status 200 OK
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectTarget(null)}
                  className="text-[#8c8c8c] hover:text-white transition p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-[13px]">
                <div className="grid grid-cols-2 gap-4 bg-[#242424] border border-[#343434] rounded-[2px] p-4">
                  <div>
                    <div className="text-[#a6a6a6] text-[12px] font-medium mb-1">Operation</div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: meta.dotColor }}
                      />
                      <span>{meta.label}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[#a6a6a6] text-[12px] font-medium mb-1">Latency</div>
                    <div className="font-bold text-white">
                      {inspectTarget.duration_ms ? `${inspectTarget.duration_ms} ms` : '< 15 ms'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#a6a6a6] text-[12px] font-medium mb-1">Index / Namespace</div>
                    <div className="font-semibold text-white break-all">
                      {inspectTarget.collection || 'default'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#a6a6a6] text-[12px] font-medium mb-1">Timestamp</div>
                    <div className="font-normal text-white">
                      {formatPineconeDate(inspectTarget.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-white text-[13.5px] font-semibold mb-2">
                    Query / Payload details
                  </div>
                  <div className="w-full min-h-[76px] max-h-[180px] overflow-y-auto bg-[#282828] border border-[#3a3a3a] rounded-[2px] p-3.5 text-[13px] text-white font-mono whitespace-pre-wrap break-words">
                    {inspectTarget.detail || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-7">
                <button
                  type="button"
                  onClick={() => copyLogJson(inspectTarget, rowKey)}
                  className="h-[37px] px-4 rounded-[2px] border border-[#454545] bg-[#1c1c1c] hover:bg-[#262626] text-[13.5px] font-semibold text-white transition cursor-pointer"
                >
                  {copiedId === rowKey ? 'Copied JSON' : 'Copy JSON'}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectTarget(null)}
                  className="pc-btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
