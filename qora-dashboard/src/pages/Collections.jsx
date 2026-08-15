import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'

export default function Collections() {
  const [collections, setCollections] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.getCollections().then(d => setCollections(d.collections || []))
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')
    const res = await api.createCollection(name.trim(), desc.trim())
    setLoading(false)
    if (res.message) { setName(''); setDesc(''); setShowCreate(false); load() }
    else setError(res.detail || 'Failed')
  }

  const del = async (n) => {
    if (!confirm(`Delete "${n}"? This cannot be undone.`)) return
    await api.deleteCollection(n); load()
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Collections</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Manage your vector collections</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New collection
        </button>
      </div>

      {showCreate && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">Create collection</h3>
            <button onClick={() => setShowCreate(false)} className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form onSubmit={create} className="space-y-3">
            <div>
              <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Name</label>
              <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="my_collection"
                className="input-base font-mono" />
              <p className="text-[var(--text-dim)] text-xs mt-1">Lowercase, underscores only</p>
            </div>
            <div>
              <label className="text-[var(--text-muted)] text-xs mb-1.5 block font-medium">Description <span className="text-[var(--text-dim)]">(optional)</span></label>
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this collection for?"
                className="input-base" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading || !name.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                {loading ? 'Creating...' : 'Create collection'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-4 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {collections.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-16 text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-blue-400">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
            </svg>
          </div>
          <p className="text-[var(--text-primary)] text-sm font-medium mb-1">No collections yet</p>
          <p className="text-[var(--text-muted)] text-xs mb-4">Create your first collection to start indexing vectors</p>
          <button onClick={() => setShowCreate(true)} className="text-blue-400 hover:text-blue-300 text-sm transition">
            Create collection →
          </button>
        </div>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-[var(--border)]">
            <div className="col-span-5 text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider">Name</div>
            <div className="col-span-4 text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider">Status</div>
            <div className="col-span-3 text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider text-right">Actions</div>
          </div>
          {collections.map((n, i) => (
            <div key={n} className={`grid grid-cols-12 items-center px-5 py-3.5 hover:bg-[var(--bg-hover)] transition group ${i !== collections.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
                <span className="text-[var(--text-primary)] text-sm font-mono">{n}</span>
              </div>
              <div className="col-span-4">
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">active</span>
              </div>
              <div className="col-span-3 flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <Link to={`/explorer?collection=${n}`}
                  className="text-xs text-[var(--text-muted)] hover:text-blue-400 px-2.5 py-1.5 rounded-md hover:bg-[var(--bg-hover)] transition">Explore</Link>
                <button onClick={() => del(n)}
                  className="text-xs text-[var(--text-muted)] hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-[var(--bg-hover)] transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
