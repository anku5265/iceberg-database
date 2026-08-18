import { useEffect, useState } from 'react'
import { API_URL } from '../lib/config'

const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY() })

export default function Admin() {
  const [status, setStatus] = useState(null)
  const [billing, setBilling] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [tunnelLoading, setTunnelLoading] = useState(false)

  useEffect(() => {
    const headers = H()
    Promise.all([
      fetch(`${API_URL}/admin/status`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/admin/billing`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/admin/analytics`, { headers }).then(r => r.json()),
    ]).then(([s, b, a]) => {
      setStatus(s)
      setBilling(b)
      setAnalytics(a)
    })
  }, [])

  const openTunnel = async () => {
    setTunnelLoading(true)
    await fetch(`${API_URL}/admin/tunnel/open`, { method: 'POST', headers: H() })
    setTunnelLoading(false)
    window.location.reload()
  }

  const closeTunnel = async () => {
    await fetch(`${API_URL}/admin/tunnel`, { method: 'DELETE', headers: H() })
    window.location.reload()
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Admin</h1>
        <p className="text-[var(--text-muted)] text-sm">Instance management, billing, and remote access</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Instance Status */}
        <div className="bg-[var(--card-bg)] border border-[var(--border2)] rounded-lg p-5">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-4">Instance</div>
          {status ? (
            <div className="space-y-2 text-sm">
              <Row label="Instance ID" value={<span className="font-mono text-xs">{status.instance_id}</span>} />
              <Row label="Version" value={status.version} />
              <Row label="Platform" value={status.platform} />
              <Row label="Storage" value={<Badge color={status.storage === 'r2' ? 'blue' : 'gray'}>{status.storage}</Badge>} />
              <Row label="Read nodes" value={`${status.nodes?.total_slots || 0} slots`} />
            </div>
          ) : <Skeleton />}
        </div>

        {/* Billing */}
        <div className="bg-[var(--card-bg)] border border-[var(--border2)] rounded-lg p-5">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-4">Billing</div>
          {billing ? (
            <div className="space-y-2 text-sm">
              <Row label="Plan" value={<Badge color="blue">{billing.plan}</Badge>} />
              <Row label="Searches today" value={`${billing.search?.remaining ?? '—'} remaining`} />
              <Row label="Index remaining" value={`${billing.index?.remaining ?? '—'} remaining`} />
              <a href="https://dashboard.icebergdb.io/pricing"
                className="mt-3 block text-xs text-blue-400 hover:text-blue-300 transition">
                Upgrade plan →
              </a>
            </div>
          ) : <Skeleton />}
        </div>

        {/* Remote Access (Tunnel) */}
        <div className="bg-[var(--card-bg)] border border-[var(--border2)] rounded-lg p-5">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Remote Access</div>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Allow Iceberg support team to access this instance for debugging</p>
          {status ? (
            <div className="space-y-3">
              <Row label="Tunnel status" value={
                <Badge color={status.tunnel_open ? 'green' : 'gray'}>
                  {status.tunnel_open ? 'Open' : 'Closed'}
                </Badge>
              } />
              {status.tunnel_open ? (
                <button onClick={closeTunnel}
                  className="w-full py-2 rounded-md border border-red-900/50 text-red-400 hover:bg-red-900/10 text-sm transition">
                  Close tunnel — revoke access
                </button>
              ) : (
                <button onClick={openTunnel} disabled={tunnelLoading}
                  className="w-full py-2 rounded-md border border-[var(--border2)] hover:border-[#444] text-[#aaa] hover:text-[var(--text-primary)] text-sm transition disabled:opacity-50">
                  {tunnelLoading ? 'Opening...' : 'Open tunnel for support (4 hours)'}
                </button>
              )}
              <p className="text-xs text-[var(--text-dim)]">Auto-closes after 4 hours. All access is logged.</p>
            </div>
          ) : <Skeleton />}
        </div>

        {/* Search Analytics */}
        <div className="bg-[var(--card-bg)] border border-[var(--border2)] rounded-lg p-5">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-4">Searches — last 7 days</div>
          {analytics ? (
            <div>
              <div className="flex items-end gap-1 h-16 mb-2">
                {analytics.searches_last_7_days?.map((d, i) => {
                  const max = Math.max(...analytics.searches_last_7_days.map(x => x.searches), 1)
                  const h = Math.max((d.searches / max) * 100, 4)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-blue-600/60 rounded-sm" style={{ height: `${h}%` }} title={`${d.searches} searches`} />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>7d ago</span><span>Today</span>
              </div>
              <div className="mt-3 text-sm text-[var(--text-primary)] font-medium">
                {analytics.total_chunks_indexed?.toLocaleString()} total chunks indexed
              </div>
            </div>
          ) : <Skeleton />}
        </div>

      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-[var(--text-primary)]">{value}</span>
    </div>
  )
}

function Badge({ children, color = 'gray' }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-900/20 border-blue-900/40',
    green: 'text-green-400 bg-green-900/20 border-green-900/40',
    gray: 'text-[var(--text-muted)] bg-[var(--bg-hover)] border-[var(--border2)]',
  }
  return <span className={`text-xs px-2 py-0.5 rounded border ${colors[color]}`}>{children}</span>
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[1,2,3].map(i => <div key={i} className="h-4 bg-[var(--bg-hover)] rounded animate-pulse" />)}
    </div>
  )
}
