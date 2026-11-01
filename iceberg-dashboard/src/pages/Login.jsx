import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import GoogleAuthButton from '../components/GoogleAuthButton'
import LegalModal from '../components/LegalModal'
import { trackFounderEvent, deriveAccountKey } from '../lib/api'
import { useTheme } from '../lib/theme'

const BASE = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [legalTab, setLegalTab] = useState(null)
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('theme')
      if (p === 'dark') {
        try { sessionStorage.setItem('iceberg_auth_theme', 'dark') } catch {}
        return true
      }
      if (p === 'light') {
        try { sessionStorage.setItem('iceberg_auth_theme', 'light') } catch {}
        return false
      }
      try {
        if (sessionStorage.getItem('iceberg_auth_theme') === 'dark') return true
      } catch {}
    }
    return false
  })
  const { setTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    try { sessionStorage.setItem('iceberg_auth_theme', dark ? 'dark' : 'light') } catch {}
    setTheme(dark ? 'dark' : 'light')
  }, [dark])

  const finalizeSession = async (cleanEmail, pwd, data) => {
    const adminKey = data.api_keys?.find(k => k.role === 'admin') || data.api_keys?.[0]
    const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')
    let fullKey = data.api_key || savedMap[cleanEmail] || localStorage.getItem('iceberg_api_key')
    if (!fullKey || (adminKey?.key_prefix && !fullKey.startsWith(adminKey?.key_prefix))) {
      fullKey = await deriveAccountKey(cleanEmail, pwd)
    }

    savedMap[cleanEmail] = fullKey
    localStorage.setItem('iceberg_account_keys', JSON.stringify(savedMap))
    localStorage.setItem('iceberg_user', JSON.stringify(data))
    localStorage.setItem('iceberg_api_key', fullKey)
    localStorage.setItem('iceberg_api_key_prefix', adminKey?.key_prefix || fullKey.slice(0, 10))
    localStorage.setItem('iceberg_project_id', adminKey?.project_id || data.projects?.[0]?.id || data.project_id || '')

    fetch('/api/auth-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_account',
        email: cleanEmail,
        password: pwd,
        api_key: fullKey,
        user_id: data.user_id,
        project_id: adminKey?.project_id || data.projects?.[0]?.id || data.project_id || ''
      })
    }).catch(() => {})

    trackFounderEvent('login', {
      email: data.email || cleanEmail,
      user_id: data.user_id || '',
      key_prefix: adminKey?.key_prefix || fullKey.slice(0, 10)
    })

    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const cleanEmail = email.trim().toLowerCase()

    try {
      let vaultStatus = null
      try {
        const vr = await fetch('/api/auth-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cloud_login', email: cleanEmail, password })
        })
        vaultStatus = vr.status
        const vData = await vr.json().catch(() => ({}))
        if (vr.ok) {
          await finalizeSession(cleanEmail, password, vData)
          return
        }
        if (vr.status === 401) {
          setError(vData.detail || 'Incorrect password. Please try again.')
          setLoading(false)
          return
        }
      } catch {}

      const r = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')
        if (vaultStatus === 404 && !savedMap[cleanEmail]) {
          setError('No account found with this email. Please create an account first.')
        } else {
          setError(data.detail || 'Incorrect password. Please try again.')
        }
        setLoading(false)
        return
      }

      await finalizeSession(cleanEmail, password, data)
    } catch {
      setError('Could not connect to server')
      setLoading(false)
    }
  }

  const gridLineColor = dark ? '#1F1F23' : '#E4E4E7'
  const crosshairColor = dark ? '#52525B' : '#A1A1AA'

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between relative overflow-hidden transition-colors font-sans ${
        dark ? 'bg-[#09090B] text-white' : 'bg-[#FAFAFA] text-[#09090B]'
      }`}
    >
      {/* Theme Toggle Top Right */}
      <button
        type="button"
        onClick={() => setDark(!dark)}
        title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
        className={`fixed top-4 right-4 z-30 p-2 rounded-[6px] border transition cursor-pointer ${
          dark
            ? 'border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-white'
            : 'border-[#E4E4E7] bg-white text-[#71717A] hover:text-[#09090B]'
        }`}
      >
        {dark ? (
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        ) : (
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>

      {/* Top Architectural Grid Margin */}
      <div className="w-full h-12 sm:h-16 shrink-0 relative" style={{ borderBottom: `1px solid ${gridLineColor}` }}>
        <div
          className="h-full w-full max-w-[440px] mx-auto"
          style={{ borderLeft: `1px solid ${gridLineColor}`, borderRight: `1px solid ${gridLineColor}` }}
        />
      </div>

      {/* Main Middle Row with Full-Width Architectural Grid & Centered 440px Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-0 relative">
        <div
          className={`w-full max-w-[440px] relative px-7 sm:px-12 py-9 sm:py-10 ${
            dark ? 'bg-[#0E0E11]' : 'bg-white'
          }`}
          style={{
            borderLeft: `1px solid ${gridLineColor}`,
            borderRight: `1px solid ${gridLineColor}`,
          }}
        >
          {/* 4 Corner Crosshair (+) Intersections */}
          <svg width="11" height="11" viewBox="0 0 11 11" className="hidden sm:block absolute -top-[6px] -left-[6px] pointer-events-none z-20">
            <line x1="0" y1="5.5" x2="11" y2="5.5" stroke={crosshairColor} strokeWidth="1.2" />
            <line x1="5.5" y1="0" x2="5.5" y2="11" stroke={crosshairColor} strokeWidth="1.2" />
          </svg>
          <svg width="11" height="11" viewBox="0 0 11 11" className="hidden sm:block absolute -top-[6px] -right-[6px] pointer-events-none z-20">
            <line x1="0" y1="5.5" x2="11" y2="5.5" stroke={crosshairColor} strokeWidth="1.2" />
            <line x1="5.5" y1="0" x2="5.5" y2="11" stroke={crosshairColor} strokeWidth="1.2" />
          </svg>
          <svg width="11" height="11" viewBox="0 0 11 11" className="hidden sm:block absolute -bottom-[6px] -left-[6px] pointer-events-none z-20">
            <line x1="0" y1="5.5" x2="11" y2="5.5" stroke={crosshairColor} strokeWidth="1.2" />
            <line x1="5.5" y1="0" x2="5.5" y2="11" stroke={crosshairColor} strokeWidth="1.2" />
          </svg>
          <svg width="11" height="11" viewBox="0 0 11 11" className="hidden sm:block absolute -bottom-[6px] -right-[6px] pointer-events-none z-20">
            <line x1="0" y1="5.5" x2="11" y2="5.5" stroke={crosshairColor} strokeWidth="1.2" />
            <line x1="5.5" y1="0" x2="5.5" y2="11" stroke={crosshairColor} strokeWidth="1.2" />
          </svg>

          {/* 1. Brand Logo Header */}
          <div className="flex items-center justify-center gap-2.5 mb-7">
            <div className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center ${dark ? 'bg-white' : 'bg-[#09090B]'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polygon
                  points="12,4 21,20 3,20"
                  stroke={dark ? '#09090B' : '#FFFFFF'}
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className={`text-[22px] font-bold tracking-tight ${dark ? 'text-white' : 'text-[#09090B]'}`}>
              Iceberg
            </span>
          </div>

          {/* 2. OAuth Buttons Stack (Google, GitHub, Microsoft) */}
          <GoogleAuthButton mode="signin" dark={dark} />

          {/* 3. Divider Text */}
          <div className="my-5 text-center">
            <p className="text-[12px] leading-relaxed text-[#71717A]">
              Otherwise, enter your email to sign in
              <br />
              or create an account
            </p>
          </div>

          {/* 4. Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field with Left Icon Box */}
            <div
              className={`flex items-center h-[42px] rounded-[6px] border overflow-hidden transition focus-within:border-[#0037FF] ${
                dark ? 'bg-[#121215] border-[#27272A]' : 'bg-white border-[#D4D4D8]'
              }`}
            >
              <div
                className={`w-[42px] h-full flex items-center justify-center shrink-0 border-r ${
                  dark ? 'bg-[#18181B] border-[#27272A] text-[#71717A]' : 'bg-[#F4F4F5] border-[#D4D4D8] text-[#71717A]'
                }`}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3,7 12,13 21,7" />
                </svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="yours@company.com"
                className={`flex-1 h-full px-3 text-[13px] focus:outline-none bg-transparent ${
                  dark ? 'text-white placeholder-[#52525B]' : 'text-[#09090B] placeholder-[#A1A1AA]'
                }`}
              />
            </div>

            {/* Password Field with Left Icon Box + Forgot Link */}
            <div
              className={`flex items-center h-[42px] rounded-[6px] border overflow-hidden transition focus-within:border-[#0037FF] ${
                dark ? 'bg-[#121215] border-[#27272A]' : 'bg-white border-[#D4D4D8]'
              }`}
            >
              <div
                className={`w-[42px] h-full flex items-center justify-center shrink-0 border-r ${
                  dark ? 'bg-[#18181B] border-[#27272A] text-[#71717A]' : 'bg-[#F4F4F5] border-[#D4D4D8] text-[#71717A]'
                }`}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`flex-1 h-full px-3 text-[13px] focus:outline-none bg-transparent ${
                  dark ? 'text-white placeholder-[#52525B]' : 'text-[#09090B] placeholder-[#A1A1AA]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-2 text-[11px] text-[#71717A] hover:text-[#09090B] cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <Link
                to={email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : '/forgot-password'}
                className="pr-3 text-[11px] font-medium text-[#2563EB] hover:underline shrink-0"
              >
                Forgot?
              </Link>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-[6px] px-3 py-2 text-red-500 text-xs">
                <span>{error}</span>
                {error.includes('No account found') && (
                  <Link to="/signup" className="block mt-1 text-[#0037FF] hover:underline font-medium">
                    Create an account first &rarr;
                  </Link>
                )}
              </div>
            )}

            {/* Legal Notice */}
            <p className="text-[11px] text-[#71717A] text-center pt-1">
              By submitting, you accept the{' '}
              <button
                type="button"
                onClick={() => setLegalTab('terms')}
                className={`underline underline-offset-2 cursor-pointer ${dark ? 'text-[#E4E4E7]' : 'text-[#18181B]'}`}
              >
                Terms of Service
              </button>{' '}
              &amp;{' '}
              <button
                type="button"
                onClick={() => setLegalTab('privacy')}
                className={`underline underline-offset-2 cursor-pointer ${dark ? 'text-[#E4E4E7]' : 'text-[#18181B]'}`}
              >
                Privacy Policy
              </button>
              .
            </p>

            {/* Primary Cobalt Blue Continue Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] bg-[#0037FF] hover:bg-[#002ed4] disabled:opacity-50 text-white text-[14px] font-semibold rounded-[6px] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Signing in...' : 'Continue'}</span>
              {!loading && <span className="text-base leading-none">&rsaquo;</span>}
            </button>
          </form>

          {/* 5. Bottom Switcher & India (ap-south-1) Status */}
          <div className="mt-6 pt-4 text-center space-y-2.5">
            <p className="text-[12px] text-[#71717A]">
              New to Iceberg DB?{' '}
              <Link to="/signup" className="text-[#0037FF] font-semibold hover:underline">
                Create a free account &rarr;
              </Link>
            </p>
            <div className="inline-flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="font-mono text-[10px] font-semibold text-[#52525B]">
                Hosted in India (ap-south-1) &middot; DPDP Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Architectural Grid Margin */}
      <div className="w-full h-12 sm:h-16 shrink-0 relative" style={{ borderTop: `1px solid ${gridLineColor}` }}>
        <div
          className="h-full w-full max-w-[440px] mx-auto"
          style={{ borderLeft: `1px solid ${gridLineColor}`, borderRight: `1px solid ${gridLineColor}` }}
        />
      </div>

      {legalTab && <LegalModal initialTab={legalTab} onClose={() => setLegalTab(null)} />}
    </div>
  )
}
