import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Sidebar({ open = true, onCloseMobile }) {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const isDbRoute =
    path.startsWith('/database') ||
    path.startsWith('/collections') ||
    path.startsWith('/explorer') ||
    path.startsWith('/backups')

  const isAsstRoute = path.startsWith('/assistants')
  const isSettingsRoute = path.startsWith('/settings')

  const [dbExpanded, setDbExpanded] = useState(isDbRoute)
  const [asstExpanded, setAsstExpanded] = useState(isAsstRoute)
  const [settingsExpanded, setSettingsExpanded] = useState(isSettingsRoute)

  const currentSettingsTab = (() => {
    const t = new URLSearchParams(location.search).get('tab') || 'configuration'
    if (t === 'general') return 'configuration'
    return t
  })()

  // Live usage telemetry for the bottom USAGE box + assistant & index counts
  const [vectorCount, setVectorCount] = useState(() => {
    const details = api.getCachedCollectionDetails()
    return Object.values(details).reduce((sum, info) => sum + (info?.vector_count || 0), 0)
  })
  const [queryCount, setQueryCount] = useState(0)
  const [assistantCount, setAssistantCount] = useState(() => api.getCachedAssistants().length)
  const [indexCount, setIndexCount] = useState(() => api.getCachedCollections().length)
  const [partnerIntegrationCount, setPartnerIntegrationCount] = useState(() => {
    try {
      return Number(localStorage.getItem('ib_partner_integrations_count') || '0')
    } catch {
      return 0
    }
  })

  useEffect(() => {
    setDbExpanded(isDbRoute)
    setAsstExpanded(isAsstRoute)
    setSettingsExpanded(isSettingsRoute)
  }, [isDbRoute, isAsstRoute, isSettingsRoute])

  useEffect(() => {
    const syncCachedCount = () => {
      setAssistantCount(api.getCachedAssistants().length)
    }
    const syncCachedIndexes = () => {
      setIndexCount(api.getCachedCollections().length)
    }
    const syncPartnerIntegrations = async () => {
      try {
        const key = localStorage.getItem('iceberg_api_key') || ''
        if (!key) return
        const base = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'
        const res = await fetch(`${base}/partner-integrations`, { headers: { 'X-API-Key': key } })
        if (res.ok) {
          const data = await res.json()
          const c = Array.isArray(data?.integrations) ? data.integrations.length : 0
          localStorage.setItem('ib_partner_integrations_count', String(c))
          setPartnerIntegrationCount(c)
        }
      } catch {}
    }
    syncPartnerIntegrations()
    window.addEventListener('iceberg-assistants-updated', syncCachedCount)
    window.addEventListener('iceberg-collections-updated', syncCachedIndexes)
    window.addEventListener('iceberg-partner-integrations-updated', syncPartnerIntegrations)
    return () => {
      window.removeEventListener('iceberg-assistants-updated', syncCachedCount)
      window.removeEventListener('iceberg-collections-updated', syncCachedIndexes)
      window.removeEventListener('iceberg-partner-integrations-updated', syncPartnerIntegrations)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const fetchUsage = async () => {
      try {
        api.getAssistants().then((res) => {
          if (mounted && Array.isArray(res?.assistants)) {
            setAssistantCount(res.assistants.length)
          }
        }).catch(() => {})

        const colRes = await api.getCollections()
        const cols = colRes?.collections || []
        if (!mounted) return
        setIndexCount(cols.length)
        if (cols.length === 0) {
          setVectorCount(0)
          setQueryCount(0)
          return
        }
        let totalVecs = 0
        await Promise.all(
          cols.map(async (c) => {
            try {
              const info = await api.getCollection(c)
              totalVecs += info?.vector_count || 0
            } catch {}
          })
        )
        if (mounted) setVectorCount(totalVecs)

        const statsRes = await api.getStats().catch(() => null)
        if (mounted && statsRes) {
          setQueryCount(statsRes.searches_today ?? 0)
        }
      } catch {}
    }

    fetchUsage()
    const timer = setInterval(fetchUsage, 6000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const rawStorageGb = (vectorCount * 1536) / (1024 * 1024 * 1024)
  const displayStorage = rawStorageGb < 0.01 ? '0GB' : `${rawStorageGb.toFixed(2)}GB`
  const vecPct = Math.min(100, Math.round((vectorCount / 100000) * 100))
  const storagePct = Math.min(100, Math.round((rawStorageGb / 2) * 100))
  const queryPct = Math.min(100, Math.round((queryCount / 2000) * 100))

  const usageRows = isAsstRoute
    ? [
        { label: 'Storage', value: '0GB / 1GB', pct: 0, truncateLabel: false },
        { label: 'Input Tokens', value: '0 / 1M', pct: 0, truncateLabel: false },
        { label: 'Output Tokens', value: '0 / 300K', pct: 0, truncateLabel: false },
        { label: 'Context Tokens', value: '0 / 500K', pct: 0, truncateLabel: true },
        { label: 'Ingestion Units', value: '0 / 1K', pct: 0, truncateLabel: false },
      ]
    : [
        { label: 'RUs', value: `${queryCount.toLocaleString()} / 1M`, pct: queryPct, truncateLabel: false },
        { label: 'Storage', value: `${displayStorage} / 2GB`, pct: storagePct, truncateLabel: false },
        { label: 'WUs', value: `${vectorCount.toLocaleString()} / 2M`, pct: vecPct, truncateLabel: false },
      ]

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile()
  }

  const topItemClass = (active) =>
    `w-[212px] h-[33px] flex items-center gap-[13px] pl-[8px] pr-3 rounded-[2px] text-[13.5px] ${
      active
        ? 'bg-[var(--nav-active-bg)] text-[var(--accent)] font-semibold'
        : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-normal'
    }`

  const subItemClass = (active) =>
    `w-[212px] h-[32px] flex items-center pl-[39px] pr-3 rounded-[2px] text-[13.5px] ${
      active
        ? 'bg-[var(--nav-active-bg)] text-[var(--accent)] font-semibold'
        : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-normal'
    }`

  return (
    <aside
      className={`${
        open ? 'flex w-[244px]' : 'hidden'
      } fixed md:static inset-y-0 left-0 z-30 md:z-auto bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex-col justify-between shrink-0 select-none overflow-y-auto no-scrollbar`}
    >
      {/* ── Top Navigation Sections ── */}
      <div className="pl-4 pr-3 pt-4 pb-2 space-y-4">
        {/* PROJECT Section */}
        <div>
          <div className="mb-1.5 text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)]">
            PROJECT
          </div>

          <nav className="space-y-0.5">
            {/* Overview */}
            <NavLink
              to="/"
              end
              onClick={handleNavClick}
              className={({ isActive }) => topItemClass(isActive)}
            >
              <HomeIcon />
              <span>Overview</span>
            </NavLink>

            {/* Database */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (!isDbRoute) {
                    setDbExpanded(true)
                    navigate('/database/quickstart')
                    handleNavClick()
                  } else {
                    setDbExpanded((v) => !v)
                  }
                }}
                className={topItemClass(false)}
              >
                <ServerStackIcon />
                <span>Database</span>
              </button>

              {dbExpanded && (
                <div className="relative mt-0.5 space-y-0.5">
                  <div className="pointer-events-none absolute left-[15px] top-0 bottom-0 w-px bg-[var(--border)] z-10" />
                  <NavLink
                    to="/database/quickstart"
                    onClick={handleNavClick}
                    className={({ isActive }) => subItemClass(isActive)}
                  >
                    Quickstart
                  </NavLink>
                  <NavLink
                    to="/collections"
                    onClick={handleNavClick}
                    className={({ isActive }) => subItemClass(isActive)}
                  >
                    {indexCount > 0 ? `Indexes (${indexCount})` : 'Indexes'}
                  </NavLink>
                  <NavLink
                    to="/explorer"
                    onClick={handleNavClick}
                    className={({ isActive }) => subItemClass(isActive)}
                  >
                    Query Explorer
                  </NavLink>
                  <NavLink
                    to="/backups"
                    onClick={handleNavClick}
                    className={({ isActive }) => subItemClass(isActive)}
                  >
                    Backups
                  </NavLink>
                </div>
              )}
            </div>

            {/* Assistant */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (!isAsstRoute) {
                    setAsstExpanded(true)
                    navigate('/assistants/quickstart')
                    handleNavClick()
                  } else {
                    setAsstExpanded((v) => !v)
                  }
                }}
                className={topItemClass(false)}
              >
                <LightbulbIcon />
                <span>Assistant</span>
              </button>

              {asstExpanded && (
                <div className="relative mt-0.5 space-y-0.5">
                  <div className="pointer-events-none absolute left-[15px] top-0 bottom-0 w-px bg-[var(--border)] z-10" />
                  <NavLink
                    to="/assistants/quickstart"
                    onClick={handleNavClick}
                    className={({ isActive }) => subItemClass(isActive)}
                  >
                    Quickstart
                  </NavLink>
                  <NavLink
                    to="/assistants"
                    end
                    onClick={handleNavClick}
                    className={({ isActive }) => subItemClass(isActive)}
                  >
                    {assistantCount > 0 ? `Assistants (${assistantCount})` : 'Assistants'}
                  </NavLink>
                </div>
              )}
            </div>

            {/* Memory */}
            <NavLink
              to="/memory"
              onClick={handleNavClick}
              className={({ isActive }) => topItemClass(isActive)}
            >
              <MemoryIcon />
              <span>Memory</span>
            </NavLink>
          </nav>
        </div>

        {/* MANAGE Section */}
        <div>
          <div className="mb-1.5 text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)]">
            MANAGE
          </div>

          <nav className="space-y-0.5">
            <NavLink
              to="/apikeys"
              onClick={handleNavClick}
              className={({ isActive }) => topItemClass(isActive)}
            >
              <LockIcon />
              <span>API keys</span>
            </NavLink>

            {(partnerIntegrationCount > 0 || path.startsWith('/integrations')) && (
              <NavLink
                to="/integrations"
                onClick={handleNavClick}
                className={({ isActive }) => topItemClass(isActive)}
              >
                <PlugIcon />
                <span>Integrations</span>
              </NavLink>
            )}

            <NavLink
              to="/logs"
              onClick={handleNavClick}
              className={({ isActive }) => topItemClass(isActive)}
            >
              <LogsIcon />
              <span>Logs</span>
            </NavLink>

            {/* Settings (expandable sub-menu) */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (!isSettingsRoute) {
                    setSettingsExpanded(true)
                    navigate('/settings?tab=configuration')
                    handleNavClick()
                  } else {
                    setSettingsExpanded((v) => !v)
                  }
                }}
                className={topItemClass(false)}
              >
                <SettingsIcon />
                <span>Settings</span>
              </button>

              {settingsExpanded && (
                <div className="relative mt-0.5 space-y-0.5">
                  <div className="pointer-events-none absolute left-[15px] top-0 bottom-0 w-px bg-[var(--border)] z-10" />
                  {[
                    { id: 'configuration', label: 'Configuration' },
                    { id: 'access', label: 'Access' },
                    { id: 'cmek', label: 'CMEK' },
                    { id: 'storage', label: 'Storage integrations' },
                    { id: 'network', label: 'Network' },
                    { id: 'billing', label: 'Plans & billing' },
                  ].map((item) => {
                    const active = isSettingsRoute && currentSettingsTab === item.id
                    return (
                      <Link
                        key={item.id}
                        to={`/settings?tab=${item.id}`}
                        onClick={handleNavClick}
                        className={subItemClass(active)}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom Usage Card (212px width) */}
      <div className="pl-4 pr-3 pb-3.5 pt-1 mt-auto shrink-0">
        <div className="w-[212px] rounded-[2px] border border-[var(--border)] bg-[var(--card-bg)] p-3.5">
          {/* Header Row */}
          <div className="flex items-center justify-between h-[24px] mb-[12px]">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[var(--text-primary)] leading-none">
              {isAsstRoute ? 'ASSISTANT USAGE' : 'DATABASE USAGE'}
            </span>
            <button
              type="button"
              className="w-7 h-7 -mr-1 rounded-[4px] hover:bg-[var(--bg-hover)] inline-flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
              title="Free Starter Plan quota (ap-south-1)"
            >
              <InfoCircleIcon size={17} />
            </button>
          </div>

          {/* Metric Rows */}
          <div className="space-y-[12px]">
            {usageRows.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-[6px] text-[13px] leading-[17px]">
                  <span className="text-[var(--text-primary)] font-semibold inline-flex items-center gap-1.5 min-w-0">
                    <span className={row.truncateLabel ? 'max-w-[86px] truncate' : ''}>
                      {row.label}
                    </span>
                    <span className="text-[var(--text-primary)] shrink-0">
                      <InfoCircleIcon size={14} />
                    </span>
                  </span>
                  <span className="font-semibold text-[var(--text-primary)] tabular-nums shrink-0 ml-1.5">
                    {row.value}
                  </span>
                </div>
                <div className="h-[4px] w-full rounded-[1px] bg-[var(--bar-track)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  )
}

function ServerStackIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
      <rect x="3" y="4" width="18" height="7" rx="1.5" />
      <rect x="3" y="13" width="18" height="7" rx="1.5" />
      <line x1="7" y1="7.5" x2="7.01" y2="7.5" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="7" y1="16.5" x2="7.01" y2="16.5" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function LightbulbIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.75c.6.45 1 1.15 1 1.9V18h6v-1.35c0-.75.4-1.45 1-1.9A7 7 0 0 0 12 2z" />
    </svg>
  )
}

function MemoryIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function PlugIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4m6-4v4M7 7h10v4a5 5 0 0 1-5 5v5m-5-9h10" />
    </svg>
  )
}

function LogsIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function InfoCircleIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.85" />
      <rect x="9" y="5.4" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="9" y="9" width="2" height="5.6" rx="0.4" fill="currentColor" />
    </svg>
  )
}
