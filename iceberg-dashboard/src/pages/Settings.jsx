import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { API_URL } from '../lib/config'
import Docs from './Docs'

const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY() })

export default function Settings({ initialTab = 'general' }) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search)
    return params.get('tab') || initialTab
  })

  const [status, setStatus] = useState(null)
  const [billing, setBilling] = useState(null)
  const [tunnelLoading, setTunnelLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState('')

  const loadData = async (silent = false) => {
    if (!silent) setRefreshing(true)
    const headers = H()
    try {
      const [s, b] = await Promise.all([
        fetch(`${API_URL}/admin/status`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_URL}/admin/billing`, { headers }).then(r => r.json()).catch(() => null),
      ])
      if (s) setStatus(s)
      if (b) setBilling(b)
    } catch (err) {
      console.error('Failed to load settings data:', err)
    } finally {
      if (!silent) setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(() => loadData(true), 4000)
    const onFocus = () => loadData(true)
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const openTunnel = async () => {
    setTunnelLoading(true)
    try {
      await fetch(`${API_URL}/admin/tunnel/open`, { method: 'POST', headers: H() })
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setTunnelLoading(false)
    }
  }

  const closeTunnel = async () => {
    setTunnelLoading(true)
    try {
      await fetch(`${API_URL}/admin/tunnel`, { method: 'DELETE', headers: H() })
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setTunnelLoading(false)
    }
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const searchRemaining = billing?.search?.remaining ?? 2000
  const searchUsed = Math.max(0, 2000 - searchRemaining)
  const searchPct = Math.min(100, Math.round((searchUsed / 2000) * 100))

  const indexRemaining = billing?.index?.remaining ?? 500
  const indexUsed = Math.max(0, 500 - indexRemaining)
  const indexPct = Math.min(100, Math.round((indexUsed / 500) * 100))

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Settings &amp; Infrastructure</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cluster Active
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Manage your vector cluster infrastructure, browse API documentation, and inspect tier quotas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="px-3 py-2 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh status"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={refreshing ? 'animate-spin' : ''}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Tab Navigation Bar ── */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Cluster &amp; Infrastructure</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'docs'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>API Documentation</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Plan &amp; Quotas</span>
        </button>
      </div>

      {/* ── Tab 1: General & Cluster Infrastructure ── */}
      {activeTab === 'general' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Telemetry Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Cluster Health</span>
                <span className="text-emerald-400">Health</span>
              </div>
              <div className="text-xl font-bold font-mono text-[var(--text-primary)]">Healthy (100%)</div>
              <p className="text-[11px] text-[var(--text-dim)]">Primary node active</p>
            </div>

            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Read Replica Nodes</span>
                <span className="text-blue-400">Nodes</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {status?.nodes?.total_slots || 3} Slots
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">1 Dedicated + 2 Shared</p>
            </div>

            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Storage Driver</span>
                <span className="text-purple-400">Engine</span>
              </div>
              <div className="text-lg font-bold font-mono text-[var(--text-primary)]">
                {status?.storage === 'r2' ? 'Cloudflare R2' : 'Qdrant Cloud'}
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">HNSW on AWS EU-Central</p>
            </div>

            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Current Tier</span>
                <span className="text-amber-400">Plan</span>
              </div>
              <div className="text-xl font-bold font-mono text-[var(--text-primary)] uppercase">
                {billing?.plan || 'Free'} Tier
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">2,000 queries/day quota</p>
            </div>
          </div>

          {/* 3 Infrastructure Management Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Instance & Platform Info */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                  </svg>
                  <span>Instance &amp; Compute Telemetry</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Online
                </span>
              </div>

              <div className="divide-y divide-[var(--border)] text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Instance Identifier</span>
                  <div className="flex items-center gap-2 font-mono text-[var(--text-primary)]">
                    <span>{status?.instance_id || '—'}</span>
                    {status?.instance_id && (
                      <button onClick={() => copy(status.instance_id, 'inst')} className="text-[11px] text-blue-400 hover:text-blue-300">
                        {copied === 'inst' ? '✓' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Core Engine Version</span>
                  <span className="font-mono text-[var(--text-primary)]">v{status?.version || '0.1.0'}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Host Platform</span>
                  <span className="font-mono text-[var(--text-primary)]">{status?.platform || 'Linux'} (Render Cloud)</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Storage Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-semibold">
                    {status?.storage === 'r2' ? 'Cloudflare R2' : 'Qdrant Cloud + SQLite'}
                  </span>
                </div>
              </div>
            </div>

            {/* Read Node Connection Pool */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-purple-400">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                    </svg>
                    <span>Read Node Connection Pool</span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Least-recently-used load balanced read slots.</p>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded font-semibold">
                  3 Slots
                </span>
              </div>

              <div className="space-y-2.5">
                {(status?.nodes?.slots || [
                  { slot_id: 0, type: 'dedicated', queries_served: 0, avg_latency_ms: 0.0 },
                  { slot_id: 1, type: 'shared', queries_served: 0, avg_latency_ms: 0.0 },
                  { slot_id: 2, type: 'shared', queries_served: 0, avg_latency_ms: 0.0 },
                ]).map(slot => (
                  <div key={slot.slot_id} className="p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${slot.type === 'dedicated' ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">Slot #{slot.slot_id}</span>
                        <span className="text-[10px] text-[var(--text-dim)] ml-2 uppercase font-mono">({slot.type})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                      <span className="text-[var(--text-muted)]">Queries: <span className="text-[var(--text-primary)]">{slot.queries_served}</span></span>
                      <span className="text-[var(--text-muted)]">P95: <span className="text-emerald-400">&lt; 15ms</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remote Support Tunnel */}
            <div className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Remote Support Tunnel</span>
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    status?.tunnel_open ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 bg-gray-500/10 border border-gray-500/20'
                  }`}>
                    {status?.tunnel_open ? '● Tunnel Open' : '○ Tunnel Closed'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Enables temporary point-to-point encrypted debugging access for Iceberg support engineers. Automatically terminates after 4 hours.
                </p>
              </div>

              <div>
                {status?.tunnel_open ? (
                  <button
                    onClick={closeTunnel}
                    disabled={tunnelLoading}
                    className="px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition"
                  >
                    {tunnelLoading ? 'Closing...' : 'Close Tunnel'}
                  </button>
                ) : (
                  <button
                    onClick={openTunnel}
                    disabled={tunnelLoading}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-semibold transition"
                  >
                    {tunnelLoading ? 'Opening...' : 'Open Tunnel for Support'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Documentation (Embedded Full Docs) ── */}
      {activeTab === 'docs' && (
        <div className="animate-fadeIn">
          <Docs />
        </div>
      )}

      {/* ── Tab 3: Billing & Quotas ── */}
      {activeTab === 'billing' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Plan Quotas &amp; Rate Limits</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Track your daily vector search executions and document chunk ingestion quotas.</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                {billing?.plan || 'Free'} Plan Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Daily Vector Searches</span>
                  <span className="font-mono text-blue-400 font-semibold">{searchRemaining} remaining / 2,000 max</span>
                </div>
                <div className="w-full bg-[var(--bg-base)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.max(5, searchPct)}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-dim)]">Resets every 24 hours at 00:00 UTC.</p>
              </div>

              <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Document Ingestion Chunks</span>
                  <span className="font-mono text-purple-400 font-semibold">{indexRemaining} remaining / 500 chunks</span>
                </div>
                <div className="w-full bg-[var(--bg-base)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${Math.max(5, indexPct)}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-dim)]">Monthly persistent vector allocation.</p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-transparent border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Scale Tier Available</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Need unlimited vector collections, dedicated read node replicas, and sub-10ms enterprise SLA?
                </p>
              </div>
              <a
                href="https://dashboard.icebergdb.io/pricing"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <span>Upgrade to Scale</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
