import { useState, useEffect } from 'react'
import { API_URL } from '../lib/config'

const KEY = () => localStorage.getItem('qora_api_key') || ''
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

const ROLE_LABELS = {
  admin: { label: 'Admin', color: 'text-red-400 border-red-900/40 bg-red-900/10' },
  read_write: { label: 'Read & Write', color: 'text-blue-400 border-blue-900/40 bg-blue-900/10' },
  read_only: { label: 'Read Only', color: 'text-green-400 border-green-900/40 bg-green-900/10' },
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
      const r = await fetch('/api/auth/keys', { headers: H() })
      const data = await r.json()
      if (data.keys) setKeys(data.keys)
    } catch {}
  }

  useEffect(() => { loadKeys() }, [])

  const createKey = async (e) => {
    e.preventDefault()
    setLoading(true)
    const r = await fetch('/api/auth/keys', {
      method: 'POST', headers: H(),
      body: JSON.stringify({ name: newKeyName, role: newKeyRole })
    })
    const data = await r.json()
    setLoading(false)
    if (data.api_key) {
      setCreatedKey(data)
      setShowCreate(false)
      setNewKeyName('')
      loadKeys()
    }
  }

  const revokeKey = async (prefix) => {
    if (!confirm(`Revoke key ${prefix}...?`)) return
    await fetch(`/api/auth/keys/${prefix}`, { method: 'DELETE', headers: H() })
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
          <h1 className="text-2xl font-semibold text-white mb-1">API Keys</h1>
          <p className="text-[#666] text-sm">Manage keys with role-based access control</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md transition">
          Create key
        </button>
      </div>

      {/* New key created banner */}
      {createdKey && (
        <div className="bg-green-950/20 border border-green-900/40 rounded-lg p-4 mb-6">
          <div className="text-green-400 text-sm font-medium mb-2">✓ New key created — copy it now, it won't be shown again</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-2 text-xs text-green-300 font-mono break-all">{createdKey.api_key}</code>
            <button onClick={() => copy(createdKey.api_key, 'new')}
              className="text-xs text-[#666] hover:text-white px-3 py-2 border border-[#222] rounded transition flex-shrink-0">
              {copied === 'new' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button onClick={() => setCreatedKey(null)} className="text-xs text-[#555] mt-2 hover:text-white transition">Dismiss</button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <form onSubmit={createKey} className="bg-[#111] border border-[#222] rounded-lg p-5 mb-6 space-y-3">
          <h3 className="text-white font-medium">Create API key</h3>
          <div>
            <label className="text-[#888] text-xs mb-1 block">Key name</label>
            <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} required placeholder="e.g. Production API, Read-only bot"
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]" />
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1 block">Role</label>
            <select value={newKeyRole} onChange={e => setNewKeyRole(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600">
              <option value="read_write">Read & Write — can index and search</option>
              <option value="read_only">Read Only — can only search</option>
              <option value="admin">Admin — full access including delete</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md transition">
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="text-[#666] hover:text-white text-sm px-4 py-2 transition">Cancel</button>
          </div>
        </form>
      )}

      {/* Current active key */}
      <div className="bg-[#111] border border-[#222] rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-white text-sm font-medium">Active key (this session)</div>
            <div className="text-[#555] text-xs mt-0.5">Used by the dashboard</div>
          </div>
          <span className="text-xs text-green-400 bg-green-900/20 border border-green-900/40 px-2 py-0.5 rounded">active</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-2 text-xs text-[#aaa] font-mono truncate">{activeKey}</code>
          <button onClick={() => copy(activeKey, 'active')}
            className="text-xs text-[#666] hover:text-white px-3 py-2 border border-[#222] rounded transition flex-shrink-0">
            {copied === 'active' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* All keys from API */}
      {keys.length > 0 && (
        <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden mb-6">
          <div className="grid grid-cols-12 px-4 py-2 border-b border-[#1a1a1a] text-xs text-[#555] uppercase tracking-wider">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-3">Prefix</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {keys.map((k, i) => {
            const role = ROLE_LABELS[k.role] || ROLE_LABELS.read_write
            return (
              <div key={k.id} className={`grid grid-cols-12 items-center px-4 py-3 ${i !== keys.length - 1 ? 'border-b border-[#1a1a1a]' : ''} hover:bg-[#151515] transition`}>
                <div className="col-span-4 text-white text-sm truncate">{k.name}</div>
                <div className="col-span-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${role.color}`}>{role.label}</span>
                </div>
                <div className="col-span-3 font-mono text-xs text-[#666]">{k.key_prefix}...</div>
                <div className="col-span-2 text-right">
                  <button onClick={() => revokeKey(k.key_prefix)}
                    className="text-xs text-[#555] hover:text-red-400 transition px-2 py-1">Revoke</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Usage examples */}
      <div className="bg-[#111] border border-[#222] rounded-lg p-5">
        <div className="text-white text-sm font-medium mb-4">Usage examples</div>
        <div className="space-y-4">
          {[
            { label: 'Python', code: `from qora import Client\nclient = Client(api_key="${activeKey || 'qr_your_key'}")\nresults = client.search("my_docs", "your query")` },
            { label: 'cURL', code: `curl -X POST ${API_URL}/search \\\n  -H "X-API-Key: ${activeKey || 'qr_your_key'}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"collection":"my_docs","query":"your query"}'` },
          ].map(ex => (
            <div key={ex.label}>
              <div className="text-xs text-[#555] mb-2">{ex.label}</div>
              <div className="relative">
                <pre className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-md p-3 text-xs text-[#aaa] font-mono overflow-x-auto whitespace-pre-wrap">{ex.code}</pre>
                <button onClick={() => copy(ex.code, ex.label)}
                  className="absolute top-2 right-2 text-[#555] hover:text-white text-xs px-2 py-1 bg-[#1a1a1a] rounded border border-[#2a2a2a] transition">
                  {copied === ex.label ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
