import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import IcebergLogo from './IcebergLogo'
import { trackFounderEvent, deriveAccountKey, setCrossDomainSessionCookie } from '../lib/api'

const BASE = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '964987445228-3uua959noudb4qqf3afj49m2g5k84m6n.apps.googleusercontent.com'
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ''
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || ''
const REDIRECT_URI = 'https://dashboard.icebergdb.in/login'

const processedOAuthCodes = new Set()

export default function GoogleAuthButton({ mode = 'signin', dark = false }) {
  const [loadingProvider, setLoadingProvider] = useState(() => {
    if (typeof window === 'undefined') return ''
    const hasCode =
      new URLSearchParams(window.location.search).has('code') ||
      window.location.hash.includes('access_token=')
    if (!hasCode) return ''
    const st = new URLSearchParams(window.location.search).get('state') || ''
    if (st.startsWith('github')) return 'github'
    if (st.startsWith('microsoft')) return 'microsoft'
    return 'google'
  })
  const [returningFromOAuth, setReturningFromOAuth] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      new URLSearchParams(window.location.search).has('code') ||
      window.location.hash.includes('access_token=')
    )
  })
  const [error, setError] = useState('')

  // Inline GitHub / Microsoft OAuth verification state when native Client ID is not yet configured
  const [activeModalProvider, setActiveModalProvider] = useState(null) // 'github' | 'microsoft' | null
  const [providerEmail, setProviderEmail] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [githubProfile, setGithubProfile] = useState(null)
  const [otpStep, setOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [modalBusy, setModalBusy] = useState(false)

  const navigate = useNavigate()

  const completeOAuthSession = async (data, viaProvider = 'google') => {
    const cleanEmail = (data.email || '').trim().toLowerCase()
    const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')
    let fullKey = data.api_key || savedMap[cleanEmail] || await deriveAccountKey(cleanEmail, 'google_oauth_v1')
    const synthPwd = `GAuth_${cleanEmail.slice(0, 6)}_Iceberg@1`

    // Provision or fetch real live API key from primary backend so SDKs & curl work 100% natively
    try {
      const sRes = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: synthPwd })
      })
      if (sRes.ok) {
        const sData = await sRes.json().catch(() => ({}))
        if (sData.api_key) {
          fullKey = sData.api_key
          data.api_key = fullKey
          if (sData.projects?.[0]?.id) data.project_id = sData.projects[0].id
        }
      }
    } catch {}

    savedMap[cleanEmail] = fullKey
    localStorage.setItem('iceberg_account_keys', JSON.stringify(savedMap))
    localStorage.setItem('iceberg_user', JSON.stringify(data))
    localStorage.setItem('iceberg_api_key', fullKey)
    localStorage.setItem('iceberg_api_key_prefix', fullKey.slice(0, 10))
    localStorage.setItem('iceberg_project_id', data.project_id || data.projects?.[0]?.id || '')
    setCrossDomainSessionCookie(cleanEmail)

    if (data.trusted_token) {
      try {
        const trustedMap = JSON.parse(localStorage.getItem('iceberg_oauth_trusted') || '{}')
        trustedMap[cleanEmail] = data.trusted_token
        localStorage.setItem('iceberg_oauth_trusted', JSON.stringify(trustedMap))
      } catch {}
    }

    // Sync real backend API key back to Cloud Auth Vault
    fetch('/api/auth-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_account',
        email: cleanEmail,
        api_key: fullKey,
        user_id: data.user_id,
        project_id: data.project_id || ''
      })
    }).catch(() => {})

    trackFounderEvent(mode === 'signup' ? 'signup' : 'login', {
      email: cleanEmail,
      name: data.name || '',
      via: `${viaProvider}_oauth`,
      plan: 'free'
    })

    navigate('/', { replace: true })
  }

  // Automatically handle OAuth return (?code=... or #access_token=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const oauthCode = searchParams.get('code')
    const oauthState = searchParams.get('state') || mode

    if (oauthCode) {
      if (processedOAuthCodes.has(oauthCode)) return
      processedOAuthCodes.add(oauthCode)

      window.history.replaceState(null, '', window.location.pathname)
      const isGithub = oauthState.startsWith('github')
      const isMicrosoft = oauthState.startsWith('microsoft')
      const providerName = isGithub ? 'github' : isMicrosoft ? 'microsoft' : 'google'

      setLoadingProvider(providerName)
      setReturningFromOAuth(true)
      setError('')

      const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')

      fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isGithub ? 'github_auth' : isMicrosoft ? 'microsoft_auth' : 'google_auth',
          provider: providerName,
          google_code: !isGithub && !isMicrosoft ? oauthCode : undefined,
          github_code: isGithub ? oauthCode : undefined,
          microsoft_code: isMicrosoft ? oauthCode : undefined,
          redirect_uri: REDIRECT_URI,
          mode: oauthState.replace(/^(github_|microsoft_)/, ''),
          known_emails: Object.keys(savedMap)
        })
      })
        .then(r => r.json().then(d => ({ ok: r.ok, d })))
        .then(async ({ ok, d }) => {
          if (ok) {
            await completeOAuthSession(d, providerName)
          } else {
            setLoadingProvider('')
            setReturningFromOAuth(false)
            setError(d.detail || 'Authentication failed. Please try again.')
          }
        })
        .catch(() => {
          setLoadingProvider('')
          setReturningFromOAuth(false)
          setError('Network error during sign-in.')
        })
      return
    }

    if (window.location.hash && window.location.hash.includes('access_token=')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      if (accessToken && !processedOAuthCodes.has(accessToken)) {
        processedOAuthCodes.add(accessToken)
        window.history.replaceState(null, '', window.location.pathname)
        setLoadingProvider('google')
        setReturningFromOAuth(true)
        fetch('/api/auth-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'google_auth',
            google_access_token: accessToken
          })
        })
          .then(r => r.json().then(d => ({ ok: r.ok, d })))
          .then(async ({ ok, d }) => {
            if (ok) {
              await completeOAuthSession(d, 'google')
            } else {
              setLoadingProvider('')
              setReturningFromOAuth(false)
              setError(d.detail || 'Google sign-in failed.')
            }
          })
          .catch(() => {
            setLoadingProvider('')
            setReturningFromOAuth(false)
          })
      }
    }
  }, [])

  const handleGoogleClick = () => {
    setError('')
    setLoadingProvider('google')

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&state=${encodeURIComponent(mode)}` +
      `&prompt=select_account`

    window.location.href = oauthUrl
  }

  const handleGitHubClick = () => {
    setError('')
    if (GITHUB_CLIENT_ID) {
      setLoadingProvider('github')
      const ghUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent('read:user user:email')}` +
        `&state=${encodeURIComponent(`github_${mode}`)}`
      window.location.href = ghUrl
      return
    }
    setActiveModalProvider('github')
    setOtpStep(false)
    setOtpCode('')
  }

  const handleMicrosoftClick = () => {
    setError('')
    if (MICROSOFT_CLIENT_ID) {
      setLoadingProvider('microsoft')
      const msUrl =
        `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
        `?client_id=${encodeURIComponent(MICROSOFT_CLIENT_ID)}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&state=${encodeURIComponent(`microsoft_${mode}`)}`
      window.location.href = msUrl
      return
    }
    setActiveModalProvider('microsoft')
    setOtpStep(false)
    setOtpCode('')
  }

  // Fetch live GitHub public profile avatar & display name when user types their GitHub username
  const lookupGithubProfile = async (uname) => {
    const clean = uname.trim().replace(/^@/, '')
    if (!clean || clean.includes('@')) return null
    try {
      const r = await fetch(`https://api.github.com/users/${encodeURIComponent(clean)}`)
      if (r.ok) {
        const d = await r.json()
        setGithubProfile({ login: d.login, name: d.name || d.login, avatar_url: d.avatar_url })
        return d
      }
    } catch {}
    return null
  }

  const startProviderVerification = async (e) => {
    e.preventDefault()
    setError('')
    const clean = providerEmail.trim().toLowerCase()
    if (!clean || !clean.includes('@')) {
      setError('Please enter your account email address.')
      return
    }
    setModalBusy(true)
    try {
      let prof = githubProfile
      if (activeModalProvider === 'github' && githubUsername.trim() && !prof) {
        prof = await lookupGithubProfile(githubUsername)
      }

      // Check if this email already has a 30-day trusted token on this browser for instant 1-click sign-in
      const trustedMap = JSON.parse(localStorage.getItem('iceberg_oauth_trusted') || '{}')
      const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')
      if (trustedMap[clean]) {
        const fastRes = await fetch('/api/auth-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: activeModalProvider === 'github' ? 'github_auth' : 'microsoft_auth',
            provider: activeModalProvider,
            email: clean,
            name: prof?.name || prof?.login || githubUsername.trim() || '',
            picture: prof?.avatar_url || '',
            trusted_token: trustedMap[clean],
            mode,
            known_emails: Object.keys(savedMap)
          })
        })
        if (fastRes.ok) {
          const fastData = await fastRes.json()
          await completeOAuthSession(fastData, activeModalProvider)
          return
        }
      }

      // Otherwise send a 6-digit instant verification code
      const r = await fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email: clean })
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setError(d.detail || 'Could not send verification code')
        setModalBusy(false)
        return
      }
      setOtpToken(d.otp_token)
      setOtpStep(true)
    } catch {
      setError('Network error while connecting')
    } finally {
      setModalBusy(false)
    }
  }

  const verifyProviderOtp = async (e) => {
    e.preventDefault()
    setError('')
    setModalBusy(true)
    const clean = providerEmail.trim().toLowerCase()
    const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')
    try {
      const r = await fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activeModalProvider === 'github' ? 'github_auth' : 'microsoft_auth',
          provider: activeModalProvider,
          email: clean,
          name: githubProfile?.name || githubProfile?.login || githubUsername.trim() || '',
          picture: githubProfile?.avatar_url || '',
          otp: otpCode.trim(),
          otp_token: otpToken,
          mode,
          known_emails: Object.keys(savedMap)
        })
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setError(d.detail || 'Invalid verification code')
        setModalBusy(false)
        return
      }
      await completeOAuthSession(d, activeModalProvider)
    } catch {
      setError('Network error verifying code')
      setModalBusy(false)
    }
  }

  const providerLabel =
    loadingProvider === 'github' ? 'GitHub' : loadingProvider === 'microsoft' ? 'Microsoft' : 'Google'

  return (
    <>
      {returningFromOAuth && (
        <div className="fixed inset-0 z-50 bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
          <IcebergLogo className="w-12 h-12 mb-4 animate-pulse" />
          <div className="text-[#09090B] font-semibold text-base mb-1">
            Signing in with {providerLabel}...
          </div>
          <div className="text-[#71717A] text-xs">Opening your Iceberg Cloud Console</div>
        </div>
      )}

      <div className="space-y-2.5">
        {/* 1. Continue with Google */}
        <button
          type="button"
          disabled={!!loadingProvider}
          onClick={handleGoogleClick}
          className={`w-full h-[42px] px-4 rounded-[6px] border text-[13px] font-semibold transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 ${
            dark
              ? 'bg-[#18181B] hover:bg-[#27272A] border-[#27272A] text-white'
              : 'bg-white hover:bg-[#FAFAFA] border-[#D4D4D8] text-[#18181B]'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          <span>{loadingProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* 2. Continue with GitHub */}
        <button
          type="button"
          disabled={!!loadingProvider}
          onClick={handleGitHubClick}
          className={`w-full h-[42px] px-4 rounded-[6px] border text-[13px] font-semibold transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 ${
            dark
              ? 'bg-[#202024] hover:bg-[#27272A] border-[#27272A] text-white'
              : 'bg-[#F4F4F5] hover:bg-[#E4E4E7]/70 border-[#D4D4D8] text-[#18181B]'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>{loadingProvider === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
        </button>

        {/* 3. Continue with Microsoft */}
        <button
          type="button"
          disabled={!!loadingProvider}
          onClick={handleMicrosoftClick}
          className={`w-full h-[42px] px-4 rounded-[6px] border text-[13px] font-semibold transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 ${
            dark
              ? 'bg-[#18181B] hover:bg-[#27272A] border-[#27272A] text-white'
              : 'bg-white hover:bg-[#FAFAFA] border-[#D4D4D8] text-[#18181B]'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 21 21" className="shrink-0">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          <span>{loadingProvider === 'microsoft' ? 'Connecting to Microsoft...' : 'Continue with Microsoft'}</span>
        </button>

        {/* Inline GitHub / Microsoft Verification Drawer (when OAuth Client ID is not yet set) */}
        {activeModalProvider && (
          <div
            className={`mt-2 p-3.5 rounded-[6px] border space-y-3 ${
              dark ? 'bg-[#121215] border-[#27272A]' : 'bg-[#FAFAFA] border-[#E4E4E7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${dark ? 'text-white' : 'text-[#09090B]'}`}>
                  {activeModalProvider === 'github' ? 'GitHub Account Sign-In' : 'Microsoft Account Sign-In'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModalProvider(null)
                  setOtpStep(false)
                  setError('')
                }}
                className="text-xs text-[#71717A] hover:text-[#09090B] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!otpStep ? (
              <div className="space-y-2.5">
                {activeModalProvider === 'github' && (
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={e => setGithubUsername(e.target.value)}
                    onBlur={e => lookupGithubProfile(e.target.value)}
                    placeholder="GitHub username (e.g. anku5265)"
                    className={`w-full h-[36px] px-3 rounded-[5px] border text-xs focus:outline-none focus:border-[#0037FF] ${
                      dark
                        ? 'bg-[#09090B] border-[#27272A] text-white placeholder-[#71717A]'
                        : 'bg-white border-[#D4D4D8] text-[#09090B] placeholder-[#A1A1AA]'
                    }`}
                  />
                )}
                {githubProfile && activeModalProvider === 'github' && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[#E4E4E7] bg-white text-xs">
                    <img src={githubProfile.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                    <span className="font-medium text-[#09090B]">{githubProfile.name}</span>
                    <span className="font-mono text-[10px] text-[#71717A]">@{githubProfile.login}</span>
                  </div>
                )}
                <input
                  type="email"
                  value={providerEmail}
                  onChange={e => setProviderEmail(e.target.value)}
                  placeholder={
                    activeModalProvider === 'github'
                      ? 'Your GitHub email address'
                      : 'Your Microsoft / Outlook / Work email'
                  }
                  className={`w-full h-[36px] px-3 rounded-[5px] border text-xs focus:outline-none focus:border-[#0037FF] ${
                    dark
                      ? 'bg-[#09090B] border-[#27272A] text-white placeholder-[#71717A]'
                      : 'bg-white border-[#D4D4D8] text-[#09090B] placeholder-[#A1A1AA]'
                  }`}
                />
                <button
                  type="button"
                  disabled={modalBusy}
                  onClick={startProviderVerification}
                  className="w-full h-[36px] rounded-[5px] bg-[#0037FF] hover:bg-[#002ed4] disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer"
                >
                  {modalBusy
                    ? 'Connecting...'
                    : `Continue with ${activeModalProvider === 'github' ? 'GitHub' : 'Microsoft'} ›`}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-[#71717A]">
                  Enter the 6-digit verification code sent to <strong className={dark ? 'text-white' : 'text-[#09090B]'}>{providerEmail}</strong>:
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className={`w-full h-[36px] px-3 rounded-[5px] border text-xs font-mono tracking-widest text-center focus:outline-none focus:border-[#0037FF] ${
                    dark
                      ? 'bg-[#09090B] border-[#27272A] text-white placeholder-[#71717A]'
                      : 'bg-white border-[#D4D4D8] text-[#09090B] placeholder-[#A1A1AA]'
                  }`}
                />
                <button
                  type="button"
                  disabled={modalBusy || otpCode.length !== 6}
                  onClick={verifyProviderOtp}
                  className="w-full h-[36px] rounded-[5px] bg-[#0037FF] hover:bg-[#002ed4] disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer"
                >
                  {modalBusy ? 'Verifying...' : 'Verify & Open Console ›'}
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-[6px] px-3 py-2 text-red-500 text-xs text-center">
            <span>{error}</span>
            {error.includes('No account found') && (
              <Link to="/signup" className="block mt-1 text-[#0037FF] hover:underline font-medium">
                Create an account first &rarr;
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
