import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [step, setStep] = useState('credentials') // credentials | apikey
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCredentials = async (e) => {
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
      setUserData(data)
      setStep('apikey')
      setLoading(false)
    } catch {
      setError('Could not connect to server')
      setLoading(false)
    }
  }

  const handleApiKey = (e) => {
    e.preventDefault()
    if (!apiKey.startsWith('qr_')) { setError('API key must start with qr_'); return }
    localStorage.setItem('qora_user', JSON.stringify(userData))
    localStorage.setItem('qora_api_key', apiKey)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold text-white mb-1">Qora</div>
          <div className="text-[#666] text-sm">
            {step === 'credentials' ? 'Sign in to your account' : 'Enter your API key'}
          </div>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleCredentials} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
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
        ) : (
          <form onSubmit={handleApiKey} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
            <div className="bg-blue-900/20 border border-blue-900/40 rounded-lg p-3 text-xs text-blue-300">
              Logged in as <span className="font-medium">{userData?.email}</span>. Enter your API key to access the dashboard.
            </div>
            <div>
              <label className="text-[#888] text-xs mb-1.5 block">API Key</label>
              <input
                type="text" required value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="qr_..."
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444] font-mono"
              />
              <p className="text-[#555] text-xs mt-1.5">You received this when you created your account</p>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-md transition">
              Continue
            </button>
            <button type="button" onClick={() => { setStep('credentials'); setError('') }}
              className="w-full text-[#555] hover:text-white text-sm py-1 transition">
              ← Back
            </button>
          </form>
        )}

        <p className="text-center text-[#555] text-sm mt-4">
          No account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
