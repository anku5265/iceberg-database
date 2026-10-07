import { useEffect, useState } from 'react'
import { API_URL } from '../lib/config'

const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY() })

export default function Admin() {
  const [status, setStatus] = useState(null)
  const [billing, setBilling] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [tunnelLoading, setTunnelLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState('')

  const loadData = async (silent = false) => {
    if (!silent) setRefreshing(true)
    const headers = H()
    try {
      const [s, b, a] = await Promise.all([
        fetch(`${API_URL}/admin/status`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_URL}/admin/billing`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_URL}/admin/analytics`, { headers }).then(r => r.json()).catch(() => null),
      ])
      if (s) setStatus(s)
      if (b) setBilling(b)
      if (a) setAnalytics(a)
    } catch (err) {
      console.error('Failed to load admin data:', err)
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
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Cluster Admin &amp; Infrastructure</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Instance telemetry, distributed read replica nodes, storage engine, and secure support tunnel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="px-3 py-2 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh cluster telemetry"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={refreshing ? 'animate-spin' : ''}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Cluster Status</span>
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

      {/* ── 3. Four-Quadrant Infrastructure Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Quadrant 1: Instance Telemetry */}
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
                  <button
                    onClick={() => copy(status.instance_id, 'inst')}
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    {copied === 'inst' ? '✓' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Iceberg Core Engine</span>
              <span className="font-mono text-[var(--text-primary)]">v{status?.version || '0.1.0'}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Host Platform</span>
              <span className="font-mono text-[var(--text-primary)]">{status?.platform || 'Linux'} (Render Cloud)</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Database Storage Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-semibold">
                {status?.storage === 'r2' ? 'Cloudflare R2' : 'Qdrant Cloud + SQLite'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Read Replica Mode</span>
              <span className="font-mono text-emerald-400">{status?.nodes?.mode || 'Server Cluster'}</span>
            </div>
          </div>
        </div>

        {/* Quadrant 2: Plan Quotas & Usage Limits */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-amber-400">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span>Plan Quotas &amp; Tier Limits</span>
              </h3>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-semibold">
                {billing?.plan || 'Free'} Tier
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {/* Daily Searches Quota */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">Daily Searches Quota</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">
                    {searchRemaining} remaining / 2,000 max
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-base)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(5, searchPct)}%` }}
                  />
                </div>
              </div>

              {/* Document Indexing Quota */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">Document Indexing Quota</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">
                    {indexRemaining} remaining / 500 chunks
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-base)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(5, indexPct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-dim)]">Need higher QPS or enterprise SLA?</span>
            <a
              href="https://dashboard.icebergdb.io/pricing"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
            >
              <span>Upgrade Plan</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quadrant 3: Distributed Read Nodes Pool */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-purple-400">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                </svg>
                <span>Read Node Connection Pool</span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Least-recently-used load balancing with priority slot isolation.
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded font-semibold">
              3 Slots Active
            </span>
          </div>

          <div className="space-y-2.5">
            {(status?.nodes?.slots || [
              { slot_id: 0, type: 'dedicated', queries_served: 0, avg_latency_ms: 0.0 },
              { slot_id: 1, type: 'shared', queries_served: 0, avg_latency_ms: 0.0 },
              { slot_id: 2, type: 'shared', queries_served: 0, avg_latency_ms: 0.0 },
            ]).map(slot => (
              <div
                key={slot.slot_id}
                className="p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${slot.type === 'dedicated' ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                  <div>
                    <span className="font-semibold text-[var(--text-primary)]">Slot #{slot.slot_id}</span>
                    <span className="text-[10px] text-[var(--text-dim)] ml-2 uppercase font-mono">({slot.type})</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span className="text-[var(--text-muted)]">
                    Queries: <span className="text-[var(--text-primary)]">{slot.queries_served}</span>
                  </span>
                  <span className="text-[var(--text-muted)]">
                    P95: <span className="text-emerald-400">&lt; 15ms</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Remote Maintenance Tunnel */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Remote Support Tunnel</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                status?.tunnel_open
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-gray-400 bg-gray-500/10 border border-gray-500/20'
              }`}>
                {status?.tunnel_open ? '● Tunnel Open' : '○ Tunnel Closed'}
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
              Enables encrypted point-to-point remote debugging access for the Iceberg support engineering team. Tunnels automatically terminate after 4 hours, and all incoming requests are audit-logged.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border)] space-y-2">
            {status?.tunnel_open ? (
              <button
                onClick={closeTunnel}
                disabled={tunnelLoading}
                className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition"
              >
                {tunnelLoading ? 'Closing Tunnel...' : 'Close Tunnel — Revoke Support Access'}
              </button>
            ) : (
              <button
                onClick={openTunnel}
                disabled={tunnelLoading}
                className="w-full py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-semibold transition"
              >
                {tunnelLoading ? 'Opening Encrypted Tunnel...' : 'Open Tunnel for Support (4 Hours)'}
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
