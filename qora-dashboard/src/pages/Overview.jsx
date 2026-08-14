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

  function handleOnboardingDone(newCollection) {
    setShowOnboarding(false)
    api.getCollections().then(d => setCollections(d.collections || []))
  }

  return (
    <div className="p-8 max-w-5xl">
      {showOnboarding && <OnboardingModal onDone={handleOnboardingDone} />}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Overview</h1>
        <p className="text-[#666] text-sm">Your Qora workspace</p>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-400' : 'bg-red-400'}`}></span>
        <span className={status === 'online' ? 'text-green-400' : 'text-red-400'}>
          API {status}
        </span>
        <span className="text-[#555]">· {API_URL.replace('https://', '').replace('http://', '')}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Collections', value: collections.length },
          { label: 'Searches today', value: stats.searches_today ?? '—' },
          { label: 'Chunks indexed', value: stats.total_chunks_indexed ?? '—' },
        ].map((s, i) => (
          <div key={i} className="bg-[#111] border border-[#222] rounded-lg p-5">
            <div className="text-[#666] text-xs mb-2">{s.label}</div>
            <div className="text-white font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-[#888] mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/collections" className="bg-[#111] border border-[#222] hover:border-[#333] rounded-lg p-4 transition group">
            <div className="text-white text-sm font-medium mb-1 group-hover:text-blue-400 transition">New Collection</div>
            <div className="text-[#555] text-xs">Create a vector collection</div>
          </Link>
          <Link to="/explorer" className="bg-[#111] border border-[#222] hover:border-[#333] rounded-lg p-4 transition group">
            <div className="text-white text-sm font-medium mb-1 group-hover:text-blue-400 transition">Search Explorer</div>
            <div className="text-[#555] text-xs">Test semantic search</div>
          </Link>
          <Link to="/apikeys" className="bg-[#111] border border-[#222] hover:border-[#333] rounded-lg p-4 transition group">
            <div className="text-white text-sm font-medium mb-1 group-hover:text-blue-400 transition">API Keys</div>
            <div className="text-[#555] text-xs">Manage your API keys</div>
          </Link>
          <Link to="/assistants" className="bg-[#111] border border-[#222] hover:border-[#333] rounded-lg p-4 transition group">
            <div className="text-white text-sm font-medium mb-1 group-hover:text-blue-400 transition">Assistants</div>
            <div className="text-[#555] text-xs">No-code RAG chatbots</div>
          </Link>
          <Link to="/memory" className="bg-[#111] border border-[#222] hover:border-[#333] rounded-lg p-4 transition group">
            <div className="text-white text-sm font-medium mb-1 group-hover:text-blue-400 transition">Agent Memory</div>
            <div className="text-[#555] text-xs">Long-term AI memory store</div>
          </Link>
          <a href={`${API_URL}/docs`} target="_blank" className="bg-[#111] border border-[#222] hover:border-[#333] rounded-lg p-4 transition group">
            <div className="text-white text-sm font-medium mb-1 group-hover:text-blue-400 transition">API Reference</div>
            <div className="text-[#555] text-xs">Interactive API docs ↗</div>
          </a>
        </div>
      </div>

      {/* Collections list */}
      {collections.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#888] mb-3 uppercase tracking-wider">Your Collections</h2>
          <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
            {collections.map((name, i) => (
              <div key={name} className={`flex items-center justify-between px-4 py-3 ${i !== collections.length - 1 ? 'border-b border-[#1a1a1a]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-white text-sm">{name}</span>
                </div>
                <Link to={`/explorer?collection=${name}`} className="text-xs text-[#555] hover:text-blue-400 transition">
                  Explore →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
