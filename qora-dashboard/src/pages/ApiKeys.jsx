import { useState, useEffect } from 'react'
import { API_URL } from '../lib/config'

const BASE = import.meta.env.VITE_API_URL || '/api'
const KEY = () => localStorage.getItem('qora_api_key') || ''
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

const ROLES = {
  admin: { label: 'Admin', color: 'text-red-400 border-red-500/20 bg-red-500/10' },
  read_write: { label: 'Read & Write', color: 'text-blue-400 border-blue-500/20 bg-blue-500/10' },
  read_only: { label: 'Read Only', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
}

export default function ApiKeys() {
  const [keys, setKeys] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyRole, setNewKeyRole] = useState('read_write')
  const [createdKey, setCreatedKey] = useState(null)
  const [copied, setCopied] = useState('')
  const [loading, setLoading] = useState(false)
  const activeKey = KEY()

  const loadKeys = async () => {
    try {
      const r = await fetch(`${BASE}/auth/keys`, { headers: H() })
      const data = await r.json()
      if (data.keys) setKeys(data.keys)
    } catch {}
  }
  useEffect(() => { loadKeys() }, [])

  const createKey = async (e) => {
    e.preventDefault()
    setLoading(true)
    const r = await fetch(`${BASE}/auth/keys`, {
      method: 'POST', headers: H(),
      body: JSON.stringify({ name: newKeyName, role: newKeyRole })
    })
    const data = await r.json()
    setLoading(false)
    if (data.api_key) { setCreatedKey(data); setShowCreate(false); setNewKeyName(''); loadKeys() }
  }

  const revokeKey = async (prefix) => {
    if (!confirm(`Revoke key ${prefix}...?`)) return
    await fetch(`${BASE}/auth/keys/${prefix}`, { method: 'DELETE', headers: H() })
    setKeys(keys.filter(k => k.key_prefix !== prefix))
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">API Keys</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Role-based access control for your project</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create key
        </button>
      </div>

      {createdKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Key created — copy it now, it won't be shown again
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono break-all">{createdKey.api_key}</code>
            <button onClick={() => copy(createdKey.api_key, 'new')}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-2 border border-[var(--border2)] rounded-lg hover:bg-[var(--bg-hover)] transition shrink-0">
              {copied === 'new' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <button onClick={() => setCreatedKey(null)} className="text-xs text-[var(--text-dim)] mt-2 hover:text-[var(--text-muted)] transition">Dismiss</button>
        </div>
      )}

      {showCreate && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">New API key</h3>
            <button onClick={() => setShowCreate(false)} className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form onSubmit={createKey} className="space-y-3">
            <div>
              <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Key name</label>
              <input autoFocus value={newKeyName} onChange={e => setNewKeyName(e.target.value)} required
                placeholder="e.g. Production, Read-only bot" className="input-base" />
            </div>
            <div>
              <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Role</label>
              <select value={newKeyRole} onChange={e => setNewKeyRole(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-600">
                <option value="read_write">Read & Write — index and search</option>
                <option value="read_only">Read Only — search only</option>
                <option value="admin">Admin — full access</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading || !newKeyName.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                {loading ? 'Creating...' : 'Create key'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-4 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Active key */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[var(--text-primary)] text-sm font-medium">Active session key</div>
            <div className="text-[var(--text-dim)] text-xs mt-0.5">Currently used by the dashboard</div>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">active</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] font-mono truncate">{activeKey}</code>
          <button onClick={() => copy(activeKey, 'active')}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-2 border border-[var(--border2)] rounded-lg hover:bg-[var(--bg-hover)] transition shrink-0">
            {copied === 'active' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {keys.length > 0 && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden mb-6">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-[var(--border)]">
            <div className="col-span-4 text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider">Name</div>
            <div className="col-span-3 text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider">Role</div>
            <div className="col-span-3 text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider">Prefix</div>
            <div className="col-span-2 text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider text-right">Actions</div>
          </div>
          {keys.map((k, i) => {
            const role = ROLES[k.role] || ROLES.read_write
            return (
              <div key={k.id} className={`grid grid-cols-12 items-center px-5 py-3.5 hover:bg-[var(--bg-hover)] transition group ${i !== keys.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                <div className="col-span-4 text-[var(--text-primary)] text-sm font-medium truncate">{k.name}</div>
                <div className="col-span-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${role.color}`}>{role.label}</span>
                </div>
                <div className="col-span-3 font-mono text-xs text-[var(--text-muted)]">{k.key_prefix}...</div>
                <div className="col-span-2 text-right opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => revokeKey(k.key_prefix)}
                    className="text-xs text-[var(--text-muted)] hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-[var(--bg-hover)] transition">Revoke</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Code examples */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Usage Examples</h2>
          <div className="flex-1 h-px bg-[var(--border)]"/>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Python', code: `from qora import Client\nclient = Client(api_key="${activeKey || 'qr_your_key'}")\nresults = client.search("my_docs", "your query")` },
            { label: 'cURL', code: `curl -X POST ${API_URL}/search \\\n  -H "X-API-Key: ${activeKey || 'qr_your_key'}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"collection":"my_docs","query":"your query"}'` },
          ].map(ex => (
            <div key={ex.label}>
              <div className="text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider mb-2">{ex.label}</div>
              <div className="relative group">
                <pre className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--text-secondary)] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">{ex.code}</pre>
                <button onClick={() => copy(ex.code, ex.label)}
                  className="absolute top-2.5 right-2.5 text-[var(--text-dim)] hover:text-[var(--text-primary)] text-xs px-2 py-1 bg-[var(--card-bg)] rounded-md border border-[var(--border2)] transition opacity-0 group-hover:opacity-100">
                  {copied === ex.label ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
