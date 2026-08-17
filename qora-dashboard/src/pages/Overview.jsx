import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import { Link } from 'react-router-dom'
import OnboardingModal from '../components/OnboardingModal'

export default function Overview() {
  const [collections, setCollections] = useState([])
  const [status, setStatus] = useState('checking')
  const [stats, setStats] = useState({})
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem('qora_onboarding_done')
  )

  useEffect(() => {
    api.health().then(() => setStatus('online')).catch(() => setStatus('offline'))
    api.getCollections().then(d => setCollections(d.collections || []))
    api.getStats().then(d => setStats(d)).catch(() => {})
  }, [])

  function handleOnboardingDone() {
    setShowOnboarding(false)
    api.getCollections().then(d => setCollections(d.collections || []))
  }

  const user = JSON.parse(localStorage.getItem('qora_user') || '{}')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user.email?.split('@')[0] || 'there'

  const statCards = [
    {
      label: 'Collections',
      value: collections.length,
      desc: 'Vector stores',
      icon: <DbIcon />,
      accent: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
    },
    {
      label: 'Searches Today',
      value: stats.searches_today ?? '—',
      desc: 'API queries',
      icon: <SearchIcon />,
      accent: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
    },
    {
      label: 'Chunks Indexed',
      value: stats.total_chunks_indexed ?? '—',
      desc: 'Total vectors',
      icon: <CubeIcon />,
      accent: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
  ]

  const quickActions = [
    { to: '/collections', label: 'New Collection', desc: 'Create a vector store', icon: <DbIcon />, accent: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { to: '/explorer', label: 'Search Explorer', desc: 'Test semantic search', icon: <SearchIcon />, accent: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { to: '/apikeys', label: 'API Keys', desc: 'Manage access keys', icon: <KeyIcon />, accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { to: '/assistants', label: 'Assistants', desc: 'No-code RAG chatbots', icon: <BotIcon />, accent: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
    { to: '/memory', label: 'Agent Memory', desc: 'Long-term AI memory', icon: <MemIcon />, accent: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { href: `${API_URL}/docs`, label: 'API Reference', desc: 'Interactive docs', icon: <DocIcon />, accent: '#10b981', bg: 'rgba(16,185,129,0.1)', external: true },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {showOnboarding && <OnboardingModal onDone={handleOnboardingDone} />}

      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-[var(--text-muted)] text-xs font-medium mb-1">{greeting}, {firstName}</p>
          <h1 className="page-title">Overview</h1>
          <p className="page-desc">Your Iceberg workspace at a glance</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
          status === 'online'
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : status === 'checking'
            ? 'bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-muted)]'
            : 'bg-red-500/10 border-red-500/25 text-red-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'online' ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
            : status === 'checking' ? 'bg-[var(--text-dim)]'
            : 'bg-red-400'} animate-pulse`}/>
          {status === 'checking' ? 'Connecting' : `API ${status}`}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card card p-5 cursor-default">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="section-label mb-1">{s.label}</p>
                <p className="text-[var(--text-muted)] text-xs">{s.desc}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: s.bg, color: s.accent }}>
                {s.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="section-label">Quick Actions</span>
          <div className="flex-1 h-px bg-[var(--border)]"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a, i) => {
            const inner = (
              <div className="flex items-center gap-4 p-4">
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: a.bg, color: a.accent }}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-primary)] text-sm font-semibold leading-tight">{a.label}</p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{a.desc}</p>
                </div>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                  className="text-[var(--text-dim)] group-hover:text-[var(--text-muted)] group-hover:translate-x-0.5 transition-all shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            )
            return a.external ? (
              <a key={i} href={a.href} target="_blank" rel="noreferrer"
                className="action-card card group block">
                {inner}
              </a>
            ) : (
              <Link key={i} to={a.to} className="action-card card group block">
                {inner}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-label">Collections</span>
            <div className="flex-1 h-px bg-[var(--border)]"/>
            <span className="text-xs text-[var(--text-dim)] tabular-nums">{collections.length}</span>
          </div>
          <div className="card overflow-hidden">
            {collections.map((name, i) => (
              <div key={name}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-hover)] transition-colors group ${
                  i !== collections.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"/>
                  <span className="text-[var(--text-primary)] text-sm font-medium font-mono">{name}</span>
                </div>
                <Link to={`/explorer?collection=${name}`}
                  className="text-xs text-[var(--text-muted)] hover:text-blue-400 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  Explore
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DbIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/></svg> }
function SearchIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> }
function CubeIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> }
function KeyIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6M15 3l3 3"/></svg> }
function BotIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg> }
function MemIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26A7 7 0 0 1 12 2z"/><path d="M9 21h6"/></svg> }
function DocIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
