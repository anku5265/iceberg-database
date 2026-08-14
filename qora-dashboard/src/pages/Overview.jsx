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

  const statCards = [
    {
      label: 'Collections',
      value: collections.length,
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
        </svg>
      ),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Searches today',
      value: stats.searches_today ?? '—',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      ),
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Chunks indexed',
      value: stats.total_chunks_indexed ?? '—',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      ),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ]

  const quickActions = [
    {
      to: '/collections',
      label: 'New Collection',
      desc: 'Create a vector collection',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
        </svg>
      ),
      color: 'text-blue-400', bg: 'bg-blue-500/10',
    },
    {
      to: '/explorer',
      label: 'Search Explorer',
      desc: 'Test semantic search',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      ),
      color: 'text-violet-400', bg: 'bg-violet-500/10',
    },
    {
      to: '/apikeys',
      label: 'API Keys',
      desc: 'Manage your API keys',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6M15 3l3 3"/>
        </svg>
      ),
      color: 'text-amber-400', bg: 'bg-amber-500/10',
    },
    {
      to: '/assistants',
      label: 'Assistants',
      desc: 'No-code RAG chatbots',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Z"/>
        </svg>
      ),
      color: 'text-pink-400', bg: 'bg-pink-500/10',
    },
    {
      to: '/memory',
      label: 'Agent Memory',
      desc: 'Long-term AI memory store',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/>
        </svg>
      ),
      color: 'text-cyan-400', bg: 'bg-cyan-500/10',
    },
    {
      href: `${API_URL}/docs`,
      label: 'API Reference',
      desc: 'Interactive API docs',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      color: 'text-emerald-400', bg: 'bg-emerald-500/10',
      external: true,
    },
  ]

  return (
    <div className="p-8 max-w-5xl">
      {showOnboarding && <OnboardingModal onDone={handleOnboardingDone} />}

      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Overview</h1>
          <p className="text-[#555] text-sm mt-0.5">Your Qora workspace</p>
        </div>
        {/* Status pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
          ${status === 'online'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : status === 'checking'
            ? 'bg-[#1a1a1a] border-[#2a2a2a] text-[#666]'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-emerald-400' : status === 'checking' ? 'bg-[#555]' : 'bg-red-400'} animate-pulse`}/>
          {status === 'checking' ? 'Connecting...' : `API ${status}`}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#2a2a2a] transition group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#555] text-xs font-medium uppercase tracking-wider">{s.label}</span>
              <div className={`${s.bg} ${s.color} p-1.5 rounded-lg`}>{s.icon}</div>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest">Quick Actions</h2>
          <div className="flex-1 h-px bg-[#1a1a1a]"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a, i) => {
            const inner = (
              <div className="flex items-start gap-4 p-4">
                <div className={`${a.bg} ${a.color} p-2 rounded-lg shrink-0 mt-0.5`}>{a.icon}</div>
                <div>
                  <div className="text-white text-sm font-medium mb-0.5">{a.label}</div>
                  <div className="text-[#555] text-xs">{a.desc}</div>
                </div>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                  className="ml-auto self-center text-[#333] group-hover:text-[#666] transition shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            )
            return a.external ? (
              <a key={i} href={a.href} target="_blank" rel="noreferrer"
                className="bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl transition group cursor-pointer">
                {inner}
              </a>
            ) : (
              <Link key={i} to={a.to}
                className="bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl transition group cursor-pointer">
                {inner}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Collections list */}
      {collections.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest">Your Collections</h2>
            <div className="flex-1 h-px bg-[#1a1a1a]"/>
            <span className="text-xs text-[#444]">{collections.length}</span>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
            {collections.map((name, i) => (
              <div key={name} className={`flex items-center justify-between px-4 py-3 hover:bg-[#161616] transition ${i !== collections.length - 1 ? 'border-b border-[#1a1a1a]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"/>
                  <span className="text-white text-sm font-mono">{name}</span>
                </div>
                <Link to={`/explorer?collection=${name}`}
                  className="text-xs text-[#444] hover:text-blue-400 transition flex items-center gap-1">
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
