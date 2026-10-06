import { useState } from 'react'
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom'

export default function LoginKey() {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const { state } = useLocation()
  const navigate = useNavigate()
  const userData = state?.userData

  // If no userData (direct URL access), redirect to login
  if (!userData) return <Navigate to="/login" replace />

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!apiKey.startsWith('ib_')) { setError('API key must start with ib_'); return }
    localStorage.setItem('iceberg_api_key', apiKey)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold text-white mb-1">Iceberg</div>
          <div className="text-[#666] text-sm">Enter your API key</div>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <div className="bg-blue-900/20 border border-blue-900/40 rounded-lg p-3 text-xs text-blue-300">
            Signed in as <span className="font-medium">{userData?.email}</span>. Paste your API key to continue.
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1.5 block">API Key</label>
            <input
              type="text" required value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="ib_..."
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444] font-mono"
            />
            <p className="text-[#555] text-xs mt-1.5">Find this in your API Keys page or from when you signed up</p>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-md transition">
            Continue to Dashboard
          </button>
          <Link to="/login" className="block text-center text-[#555] hover:text-white text-sm py-1 transition">
            ← Back to login
          </Link>
        </form>
      </div>
    </div>
  )
}
