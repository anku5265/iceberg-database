import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const TYPE_STYLE = {
  search: 'text-blue-400 bg-blue-900/20 border-blue-900/40',
  index:  'text-purple-400 bg-purple-900/20 border-purple-900/40',
  create: 'text-green-400 bg-green-900/20 border-green-900/40',
  delete: 'text-red-400 bg-red-900/20 border-red-900/40',
}

function formatTime(ts) {
  return new Date(ts * 1000).toLocaleString('en-IN', { hour12: false })
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getLogs().then(d => {
      setLogs(d.logs || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action === filter)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Logs</h1>
          <p className="text-[#666] text-sm">Recent API activity</p>
        </div>
        <div className="flex gap-1 bg-[#111] border border-[#222] rounded-lg p-1">
          {['all', 'search', 'index', 'create'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition capitalize ${filter === f ? 'bg-[#1e1e1e] text-white' : 'text-[#666] hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 border-b border-[#1a1a1a] text-xs text-[#555] uppercase tracking-wider">
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Collection</div>
          <div className="col-span-4">Detail</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2 text-right">Time</div>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-[#555] text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#555] text-sm">No logs yet. Start using the API.</div>
        ) : (
          filtered.map((log, i) => (
            <div key={log.id}
              className={`grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-[#151515] transition ${i !== filtered.length - 1 ? 'border-b border-[#1a1a1a]' : ''}`}>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-0.5 rounded border capitalize ${TYPE_STYLE[log.action] || 'text-[#666] border-[#222]'}`}>
                  {log.action}
                </span>
              </div>
              <div className="col-span-2 text-[#888] font-mono text-xs">{log.collection || '—'}</div>
              <div className="col-span-4 text-[#aaa] text-xs truncate pr-4">{log.detail || '—'}</div>
              <div className="col-span-2 text-xs text-[#666]">
                {log.duration_ms ? `${log.duration_ms}ms` : '—'}
              </div>
              <div className="col-span-2 text-right text-xs text-[#555]">{formatTime(log.created_at)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
