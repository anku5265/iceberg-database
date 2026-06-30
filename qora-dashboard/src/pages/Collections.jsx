import { useEffect, useState } from 'react'
import { api } from '../lib/api'

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
    setLoading(true)
    setError('')
    const res = await api.createCollection(name.trim(), desc.trim())
    setLoading(false)
    if (res.message) {
      setName(''); setDesc(''); setShowCreate(false); load()
    } else {
      setError(res.detail || 'Failed')
    }
  }

  const del = async (n) => {
    if (!confirm(`Delete collection "${n}"? This cannot be undone.`)) return
    await api.deleteCollection(n)
    load()
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Collections</h1>
          <p className="text-[#666] text-sm">Manage your vector collections</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md transition"
        >
          New collection
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={create} className="bg-[#111] border border-[#222] rounded-lg p-5 mb-6">
          <h3 className="text-white font-medium mb-4">Create collection</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[#888] text-xs mb-1 block">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="my_collection"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]"
              />
            </div>
            <div>
              <label className="text-[#888] text-xs mb-1 block">Description (optional)</label>
              <input
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="What is this collection for?"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md transition">
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="text-[#666] hover:text-white text-sm px-4 py-2 transition">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Collections table */}
      {collections.length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-lg p-12 text-center">
          <p className="text-[#555] text-sm">No collections yet</p>
          <button onClick={() => setShowCreate(true)} className="mt-3 text-blue-400 text-sm hover:text-blue-300 transition">
            Create your first collection →
          </button>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 border-b border-[#1a1a1a] text-xs text-[#555] uppercase tracking-wider">
            <div className="col-span-5">Name</div>
            <div className="col-span-5">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {collections.map((name, i) => (
            <div key={name} className={`grid grid-cols-12 items-center px-4 py-3 ${i !== collections.length - 1 ? 'border-b border-[#1a1a1a]' : ''} hover:bg-[#151515] transition`}>
              <div className="col-span-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span className="text-white text-sm font-mono">{name}</span>
              </div>
              <div className="col-span-5">
                <span className="text-xs text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#222]">active</span>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button onClick={() => del(name)} className="text-xs text-[#555] hover:text-red-400 transition px-2 py-1">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
