import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import IcebergLogo from '../components/IcebergLogo'
import { API_URL } from '../lib/config'
import { deriveAccountKey, setCrossDomainSessionCookie, trackFounderEvent } from '../lib/api'

export default function ConnectIntegration() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const integrationId = (params.get('integration') || params.get('connect_integration') || '').trim()
  const isEmbed = params.get('embed') === '1'

  const [partnerMeta, setPartnerMeta] = useState({
    name: integrationId || 'Partner Integration',
    slug: integrationId,
    logo_url: '',
    return_mechanism: 'web_message',
    allowed_origins: [],
  })

  const [activeKey, setActiveKey] = useState(() => localStorage.getItem('iceberg_api_key') || '')
  const [userEmail, setUserEmail] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iceberg_user') || '{}').email || ''
    } catch {
      return ''
    }
  })

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('read_write')
  const [projects, setProjects] = useState([{ id: 'default', name: 'Default' }])
  const [selectedProjectId, setSelectedProjectId] = useState('default')
  const [creatingProject, setCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectedKey, setConnectedKey] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!activeKey) return
    fetch(`${API_URL}/projects`, { headers: { 'X-API-Key': activeKey } })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (Array.isArray(data?.projects) && data.projects.length > 0) {
          setProjects([{ id: 'default', name: 'Default' }, ...data.projects])
        }
      })
      .catch(() => {})
  }, [activeKey])

  useEffect(() => {
    if (!integrationId) return
    fetch(`${API_URL}/partner-integrations/public/${encodeURIComponent(integrationId)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) setPartnerMeta(data)
      })
      .catch(() => {})
  }, [integrationId])

  if (!integrationId) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-4">
        <div className="max-w-md rounded-xl border border-[#27272a] bg-[#121318] p-6 text-center">
          <div className="text-[16px] font-bold mb-2">Missing integrationId</div>
          <p className="text-[13px] text-[#a1a1aa]">
            Pass a valid <code className="font-mono">integrationId</code> query parameter to open the Connect to Iceberg flow.
          </p>
        </div>
      </div>
    )
  }

  const displayName = partnerMeta.name || integrationId

  const handleAuth = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cleanEmail = email.trim().toLowerCase()
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login'
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed. Check your email and password.')
      }

      const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')
      let fullKey = data.api_key || savedMap[cleanEmail]
      if (!fullKey) {
        fullKey = await deriveAccountKey(cleanEmail, password)
      }

      savedMap[cleanEmail] = fullKey
      localStorage.setItem('iceberg_account_keys', JSON.stringify(savedMap))
      localStorage.setItem('iceberg_user', JSON.stringify(data))
      localStorage.setItem('iceberg_api_key', fullKey)
      setCrossDomainSessionCookie(data.email || cleanEmail)
      setActiveKey(fullKey)
      setUserEmail(data.email || cleanEmail)
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  const broadcastWebMessage = payload => {
    const allowed = Array.isArray(partnerMeta.allowed_origins) && partnerMeta.allowed_origins.length > 0
      ? partnerMeta.allowed_origins
      : ['*']

    const sendToTarget = targetWin => {
      if (!targetWin) return
      for (const origin of allowed) {
        try {
          targetWin.postMessage(payload, origin)
        } catch {}
      }
    }

    if (window.opener && !window.opener.closed) {
      sendToTarget(window.opener)
    }
    if (window.parent && window.parent !== window) {
      sendToTarget(window.parent)
    }
  }

  const handleCreateProject = async () => {
    const trimmed = newProjectName.trim()
    if (!trimmed || !activeKey) return
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': activeKey,
        },
        body: JSON.stringify({ name: trimmed, description: `Created via ${integrationId}` }),
      })
      if (res.ok) {
        const created = await res.json()
        setProjects(prev => [...prev, { id: created.id, name: created.name }])
        setSelectedProjectId(created.id)
        setNewProjectName('')
        setCreatingProject(false)
      }
    } catch {}
  }

  const handleAuthorize = async () => {
    setError('')
    setLoading(true)
    try {
      let issuedKey = activeKey
      const chosenProj = projects.find(p => p.id === selectedProjectId) || { id: 'default', name: 'Default' }
      try {
        const res = await fetch(`${API_URL}/auth/keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': activeKey,
            'X-Iceberg-Integration': integrationId,
          },
          body: JSON.stringify({
            name: `[Integration: ${integrationId}] (${chosenProj.name})`,
            role,
            project_id: selectedProjectId === 'default' ? null : selectedProjectId,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.api_key) issuedKey = data.api_key
        }
      } catch {
        // Fallback to active project key if key limit is reached
      }

      const projectId = selectedProjectId || localStorage.getItem('iceberg_project_id') || 'default'
      trackFounderEvent('integration_connected', {
        email: userEmail || 'authenticated_user',
        integration: integrationId,
        role,
      })

      if (partnerMeta.return_mechanism !== 'copy_paste') {
        broadcastWebMessage({
          type: 'ICEBERG_API_KEY_CONNECTED',
          apiKey: issuedKey,
          projectId,
          integrationId,
        })
      }
      setConnectedKey(issuedKey)
    } catch (err) {
      setError(err.message || 'Authorization failed.')
    } finally {
      setLoading(false)
    }
  }

  const wrapperCls = isEmbed
    ? 'min-h-full bg-[#0b0c10] text-white p-3'
    : 'min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-4'

  const cardCls = isEmbed
    ? 'w-full rounded-xl bg-[#121318] p-5'
    : 'w-full max-w-[460px] rounded-2xl border border-[#24262d] bg-[#121318] p-7 shadow-2xl'

  return (
    <div className={wrapperCls}>
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-[#24262d]">
          <div className="flex items-center gap-2.5">
            {partnerMeta.logo_url ? (
              <img src={partnerMeta.logo_url} alt="" className="w-6 h-6 rounded object-contain bg-white/10" />
            ) : (
              <IcebergLogo className="w-6 h-6" />
            )}
            <span className="font-semibold text-[16px] tracking-tight">Connect to Iceberg</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1d6bf3]/15 text-[#60a5fa] border border-[#1d6bf3]/30">
            ap-south-1
          </span>
        </div>

        {connectedKey ? (
          <div>
            <div className="mb-2.5 text-[17px] font-bold text-emerald-400">
              Connected to {displayName}
            </div>
            <p className="text-[13px] text-[#a1a1aa] leading-relaxed mb-4">
              {partnerMeta.return_mechanism !== 'copy_paste' && (window.opener || window.parent !== window)
                ? 'Your API key has been sent directly to the integration. You can also copy it below:'
                : 'Copy your generated Iceberg API key below and paste it into your application:'}
            </p>
            <div className="rounded-xl border border-[#27272a] bg-[#0b0b0d] p-3 font-mono text-[12px] text-[#e4e4e7] break-all mb-4">
              {connectedKey}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(connectedKey)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1800)
                }}
                className="flex-1 py-2 rounded-lg text-[13px] font-semibold bg-[#1d6bf3] hover:bg-[#2563eb] text-white cursor-pointer transition"
              >
                {copied ? 'Copied!' : 'Copy API key'}
              </button>
              {window.opener && !isEmbed && (
                <button
                  type="button"
                  onClick={() => window.close()}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#27272a] text-[#d4d4d8] hover:bg-white/[0.05] cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ) : !activeKey ? (
          <div>
            <h1 className="text-[18.5px] font-bold mb-1">
              Sign in to connect <span className="text-[#60a5fa]">{displayName}</span>
            </h1>
            <p className="text-[13px] text-[#a1a1aa] mb-4">
              {mode === 'login'
                ? 'Sign in to choose your project and generate an API key.'
                : 'Create a free Iceberg account (100,000 vectors included).'}
            </p>

            {error && (
              <div className="mb-3.5 p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-[12px]">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3">
              <div>
                <label className="block text-[12px] text-[#a1a1aa] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#27272a] bg-[#0b0b0d] text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#a1a1aa] mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 rounded-lg border border-[#27272a] bg-[#0b0b0d] text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#1d6bf3] hover:bg-[#2563eb] disabled:opacity-50 text-white cursor-pointer transition"
              >
                {loading ? 'Verifying...' : mode === 'login' ? 'Sign in & Continue' : 'Sign up free'}
              </button>
            </form>

            <div className="mt-3.5 text-center text-[12px] text-[#a1a1aa]">
              {mode === 'login' ? (
                <>
                  No account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setMode('signup')
                    }}
                    className="text-[#60a5fa] underline cursor-pointer"
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setMode('login')
                    }}
                    className="text-[#60a5fa] underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-[18.5px] font-bold mb-1">
              Authorize <span className="text-[#60a5fa]">{displayName}</span>
            </h1>
            <p className="text-[13px] text-[#a1a1aa] mb-3.5">
              Signed in{userEmail ? ` as ${userEmail}` : ''}. Select or create a project and choose API key permissions:
            </p>

            {error && (
              <div className="mb-3.5 p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-[12px]">
                {error}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium text-[#d4d4d8]">Project</label>
                <button
                  type="button"
                  onClick={() => setCreatingProject(v => !v)}
                  className="text-[11.5px] text-[#60a5fa] hover:underline cursor-pointer"
                >
                  {creatingProject ? 'Cancel' : '+ Create project'}
                </button>
              </div>
              {creatingProject ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="New project name"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#27272a] bg-[#0b0b0d] text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                  />
                  <button
                    type="button"
                    onClick={handleCreateProject}
                    className="px-3 py-2 rounded-lg bg-[#1d6bf3] hover:bg-[#2563eb] text-white text-[12.5px] font-semibold cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#27272a] bg-[#0b0b0d] text-white text-[13px] focus:outline-none focus:border-[#3b82f6]"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2 mb-5">
              {[
                {
                  id: 'read_write',
                  title: 'Read & Write (Recommended)',
                  desc: 'Create collections, upsert vectors/documents, search, and 4-tier memory.',
                },
                {
                  id: 'read_only',
                  title: 'Read Only',
                  desc: 'Query vectors, hybrid search, and read collection stats only.',
                },
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`block rounded-xl border p-3 cursor-pointer transition ${
                    role === opt.id
                      ? 'border-[#3b82f6] bg-[#172554]/35'
                      : 'border-[#27272a] bg-[#0b0b0d] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="rbac_role"
                      checked={role === opt.id}
                      onChange={() => setRole(opt.id)}
                      className="accent-[#3b82f6]"
                    />
                    <span className="text-[13px] font-semibold text-white">{opt.title}</span>
                  </div>
                  <p className="text-[11.5px] text-[#a1a1aa] mt-0.5 pl-5">{opt.desc}</p>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleAuthorize}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold bg-[#1d6bf3] hover:bg-[#2563eb] disabled:opacity-50 text-white cursor-pointer transition"
              >
                {loading ? 'Generating key...' : 'Generate API key'}
              </button>
              {!isEmbed && (
                <Link
                  to="/apikeys"
                  className="px-3 py-2.5 rounded-lg text-[12px] font-medium border border-[#27272a] text-[#a1a1aa] hover:text-white no-underline"
                >
                  Manage keys
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
