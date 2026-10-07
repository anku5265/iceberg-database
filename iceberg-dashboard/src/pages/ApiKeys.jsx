import { useState, useEffect } from 'react'
import { API_URL } from '../lib/config'
import ConfirmModal from '../components/ConfirmModal'

const BASE = API_URL
const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

const ROLES = {
  admin: {
    label: 'Admin',
    color: 'text-red-400 border-red-500/20 bg-red-500/10',
    desc: 'Full access: create, delete, index, search, and manage cluster.',
  },
  read_write: {
    label: 'Read & Write',
    color: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
    desc: 'Data plane: index vectors and query search, cannot delete collections.',
  },
  read_only: {
    label: 'Read Only',
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    desc: 'Search plane: query and retrieve vectors only, zero write access.',
  },
}

export default function ApiKeys() {
  const [keys, setKeys] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyRole, setNewKeyRole] = useState('read_write')
  const [createdKey, setCreatedKey] = useState(null)
  const [copied, setCopied] = useState('')
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [revokeTarget, setRevokeTarget] = useState(null)
  const [revoking, setRevoking] = useState(false)
  const activeKey = KEY()

  const loadKeys = async (silent = false) => {
    if (!silent) setListLoading(true)
    try {
      const r = await fetch(`${BASE}/auth/keys`, { headers: H() })
      const data = await r.json()
      if (data.keys) setKeys(data.keys)
    } catch (err) {
      console.error('Failed to load keys:', err)
    } finally {
      if (!silent) setListLoading(false)
    }
  }

  useEffect(() => {
    loadKeys()
    const timer = setInterval(() => loadKeys(true), 5000)
    const onFocus = () => loadKeys(true)
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const createKey = async (e) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    setLoading(true)
    try {
      const r = await fetch(`${BASE}/auth/keys`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({ name: newKeyName.trim(), role: newKeyRole }),
      })
      const data = await r.json()
      if (data.api_key) {
        setCreatedKey(data)
        setShowCreate(false)
        setNewKeyName('')
        await loadKeys()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const confirmRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    try {
      await fetch(`${BASE}/auth/keys/${revokeTarget.key_prefix}`, { method: 'DELETE', headers: H() })
      setKeys(keys.filter(k => k.key_prefix !== revokeTarget.key_prefix))
      setRevokeTarget(null)
    } catch (err) {
      console.error(err)
    } finally {
      setRevoking(false)
    }
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">API Keys</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {keys.length} active
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Role-based access tokens to authenticate applications, SDKs, and pipelines with your vector database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadKeys()}
            className="px-3 py-2 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh keys"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={listLoading ? 'animate-spin' : ''}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Create Key</span>
          </button>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Total Keys</span>
            <span className="text-blue-400">Tokens</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{keys.length}</div>
          <p className="text-[11px] text-[var(--text-dim)]">Issued access credentials</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Auth Header</span>
            <span className="text-emerald-400">HTTP</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">X-API-Key</div>
          <p className="text-[11px] text-[var(--text-dim)]">Standardized header schema</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Storage Security</span>
            <span className="text-purple-400">Crypto</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">SHA-256 Hashed</div>
          <p className="text-[11px] text-[var(--text-dim)]">Never stored in plaintext</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Current Session</span>
            <span className="text-amber-400">Active</span>
          </div>
          <div className="text-xs font-bold font-mono text-[var(--text-primary)] truncate" title={activeKey}>
            {activeKey ? `${activeKey.slice(0, 10)}...${activeKey.slice(-4)}` : 'None'}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Client bearer token</p>
        </div>
      </div>

      {/* ── 3. Newly Created Key Success Banner ── */}
      {createdKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3 animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>New API Key Created — Copy it now. For security, it will never be displayed again!</span>
            </div>
            <button
              onClick={() => setCreatedKey(null)}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] transition"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs text-emerald-300 font-mono break-all select-all">
              {createdKey.api_key}
            </code>
            <button
              onClick={() => copy(createdKey.api_key, 'new')}
              className="px-4 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-primary)] transition shrink-0 flex items-center gap-1.5"
            >
              {copied === 'new' ? '✓ Copied' : 'Copy Key'}
            </button>
          </div>
        </div>
      )}

      {/* ── 4. Create Key Drawer / Form ── */}
      {showCreate && (
        <form onSubmit={createKey} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 md:p-6 space-y-4 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Generate New API Key</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Assign a friendly identifier and permission scope for this token.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-[var(--text-dim)] hover:text-[var(--text-primary)] text-sm transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[var(--text-secondary)] text-xs font-medium mb-1.5 block">Key Description / Name *</label>
              <input
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                required
                placeholder="e.g. production_backend, ingestion_worker, frontend_chat_bot"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)] transition"
              />
            </div>

            <div>
              <label className="text-[var(--text-secondary)] text-xs font-medium mb-2 block">Permission Role</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(ROLES).map(([roleKey, roleInfo]) => (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setNewKeyRole(roleKey)}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      newKeyRole === roleKey
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/20'
                        : 'border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                        {newKeyRole === roleKey && (
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-2 leading-relaxed">
                        {roleInfo.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newKeyName.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-xl transition shadow-sm flex items-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>{loading ? 'Generating...' : 'Generate Key'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── 5. Keys Directory Table ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Active Tokens</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Revoking a key immediately cuts off API access for all services using it.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-dim)]">{keys.length} keys total</span>
        </div>

        {listLoading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">Loading API keys...</div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
            <p>No API keys found for this project.</p>
            <button onClick={() => setShowCreate(true)} className="text-blue-400 hover:text-blue-300 font-medium">
              Create your first key →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Key Prefix</th>
                  <th className="py-3 px-5">Role Scope</th>
                  <th className="py-3 px-5">Created</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {keys.map(k => {
                  const role = ROLES[k.role] || ROLES.read_write
                  const isCurrent = activeKey.startsWith(k.key_prefix)
                  return (
                    <tr key={k.id || k.key_prefix} className="hover:bg-[var(--bg-hover)] transition group">
                      <td className="py-3.5 px-5 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <span>{k.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                              Current Key
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-[var(--text-secondary)]">
                        <span className="bg-[var(--bg-surface)] border border-[var(--border)] px-2 py-0.5 rounded text-[11px]">
                          {k.key_prefix}...••••••••
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${role.color}`}>
                          {role.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-[var(--text-dim)] font-mono text-[11px]">
                        {k.created_at ? new Date(k.created_at * 1000).toLocaleDateString([], { dateStyle: 'medium' }) : '—'}
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setRevokeTarget(k)}
                          className="px-2.5 py-1 text-xs text-[var(--text-dim)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 6. SDK / Terminal Integration Examples ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* cURL Request */}
        <div className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Terminal / cURL Usage</span>
            <button
              onClick={() => copy(`curl "${BASE}/collections" \\\n  -H "X-API-Key: ${activeKey || 'ib_your_api_key'}"`, 'curl')}
              className="text-[11px] text-blue-400 hover:text-blue-300 transition"
            >
              {copied === 'curl' ? '✓ Copied' : 'Copy cURL'}
            </button>
          </div>
          <pre className="p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto select-all">
{`curl "${BASE}/collections" \\
  -H "X-API-Key: ${activeKey || 'ib_your_api_key'}"`}
          </pre>
        </div>

        {/* Python Client */}
        <div className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Python SDK Initialization</span>
            <button
              onClick={() => copy(`from iceberg import IcebergClient\n\nclient = IcebergClient(api_key="${activeKey || 'ib_your_api_key'}")\nprint(client.collections.list())`, 'python')}
              className="text-[11px] text-blue-400 hover:text-blue-300 transition"
            >
              {copied === 'python' ? '✓ Copied' : 'Copy Python'}
            </button>
          </div>
          <pre className="p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto select-all">
{`from iceberg import IcebergClient

client = IcebergClient(api_key="${activeKey || 'ib_your_api_key'}")
print(client.collections.list())`}
          </pre>
        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!revokeTarget}
        title="Revoke API Key?"
        message={
          <div>
            Are you sure you want to revoke <span className="font-semibold text-[var(--text-primary)]">{revokeTarget?.name}</span> (prefix: <code className="text-red-400 font-mono">{revokeTarget?.key_prefix}</code>)?
            <br />
            Any application or worker service using this token will instantly lose authorization.
          </div>
        }
        confirmText="Revoke Key"
        loading={revoking}
        onConfirm={confirmRevoke}
        onClose={() => setRevokeTarget(null)}
      />

    </div>
  )
}
