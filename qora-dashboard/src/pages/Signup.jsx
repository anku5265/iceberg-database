import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await r.json()
      if (!r.ok) { setError(data.detail || 'Signup failed'); setLoading(false); return }
      // Save session
      localStorage.setItem('qora_user', JSON.stringify(data))
      localStorage.setItem('qora_api_key', data.api_key)
      navigate('/')
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
          <div className="text-[#666] text-sm">Create your account</div>
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
              placeholder="Min 8 characters"
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p className="text-[#555] text-xs text-center pt-1">
            By signing up you agree to our Terms of Service
          </p>
        </form>
        <p className="text-center text-[#555] text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
