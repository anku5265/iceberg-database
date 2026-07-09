import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await r.json()
      if (!r.ok) { setError(data.detail || 'Login failed'); setLoading(false); return }

      // Auto-pick the first admin key, fallback to first available key
      const adminKey = data.api_keys?.find(k => k.role === 'admin') || data.api_keys?.[0]
      if (!adminKey) { setError('No API key found for this account'); setLoading(false); return }

      localStorage.setItem('qora_user', JSON.stringify(data))
      localStorage.setItem('qora_api_key_prefix', adminKey.key_prefix)
      localStorage.setItem('qora_project_id', adminKey.project_id || '')
      // Note: full key not stored (only prefix returned on login — user must use their saved key)
      // If no full key in storage yet, redirect to key-entry once
      const storedKey = localStorage.getItem('qora_api_key')
      if (storedKey) {
        navigate('/')
      } else {
        // First time login after signup on different device — ask for key
        navigate('/login/key', { state: { userData: data } })
      }
    } catch {
      setError('Could not connect to server')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold text-white mb-1">Qora</div>
          <div className="text-[#666] text-sm">Sign in to your account</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <div>
            <label className="text-[#888] text-xs mb-1.5 block">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]"
            />
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1.5 block">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[#555] text-sm mt-4">
          No account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
