import { useEffect, useState } from 'react'
import { API_URL } from '../lib/config'

const KEY = () => localStorage.getItem('qora_api_key') || ''
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

export default function Assistants() {
  const [assistants, setAssistants] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', greeting: 'Hi! How can I help you?', llm_provider: 'openai', llm_api_key: '', llm_model: 'gpt-3.5-turbo', color: '#2563eb' })
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState('')

  const load = () =>
    fetch(`${API_URL}/assistant`, { headers: H() }).then(r => r.json()).then(d => setAssistants(d.assistants || []))

  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    const r = await fetch(`${API_URL}/assistant`, { method: 'POST', headers: H(), body: JSON.stringify(form) })
    const data = await r.json()
    setCreating(false)
    setSelected(data)
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete this assistant?')) return
    await fetch(`${API_URL}/assistant/${id}`, { method: 'DELETE', headers: H() })
    setSelected(null)
    load()
  }

  const upload = async (id, file) => {
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    await fetch(`${API_URL}/assistant/${id}/upload`, { method: 'POST', headers: { 'X-API-Key': KEY() }, body: form })
    setUploading(false)
    alert('Document indexed!')
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Assistants</h1>
          <p className="text-[#666] text-sm">No-code RAG chatbots — upload docs, get a chatbot</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md transition">
          New assistant
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <form onSubmit={create} className="bg-[#111] border border-[#222] rounded-lg p-5 mb-6 space-y-3">
          <h3 className="text-white font-medium">Create assistant</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[#888] text-xs mb-1 block">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="My Support Bot"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]" />
            </div>
            <div>
              <label className="text-[#888] text-xs mb-1 block">Greeting message</label>
              <input value={form.greeting} onChange={e => setForm({...form, greeting: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="text-[#888] text-xs mb-1 block">LLM Provider</label>
              <select value={form.llm_provider} onChange={e => setForm({...form, llm_provider: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600">
                <option value="openai">OpenAI (GPT)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>
            <div>
              <label className="text-[#888] text-xs mb-1 block">LLM API Key</label>
              <input type="password" value={form.llm_api_key} onChange={e => setForm({...form, llm_api_key: e.target.value})} placeholder="sk-..."
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md transition">Create</button>
            <button type="button" onClick={() => setCreating(false)} className="text-[#666] hover:text-white text-sm px-4 py-2 transition">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* List */}
        <div className="space-y-2">
          {assistants.length === 0 && !creating && (
            <div className="bg-[#111] border border-[#222] rounded-lg p-8 text-center">
              <p className="text-[#555] text-sm mb-3">No assistants yet</p>
              <button onClick={() => setCreating(true)} className="text-blue-400 text-sm hover:text-blue-300 transition">Create your first →</button>
            </div>
          )}
          {assistants.map(a => (
            <div key={a.id} onClick={() => setSelected(a)}
              className={`bg-[#111] border rounded-lg p-4 cursor-pointer transition ${selected?.id === a.id ? 'border-blue-600' : 'border-[#222] hover:border-[#333]'}`}>
              <div className="flex items-center justify-between">
                <div className="text-white text-sm font-medium">{a.name}</div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <div className="text-[#555] text-xs mt-1 font-mono">#{a.id}</div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div className="md:col-span-2 bg-[#111] border border-[#222] rounded-lg p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-white font-medium">{selected.name}</div>
              <button onClick={() => del(selected.id)} className="text-xs text-[#555] hover:text-red-400 transition">Delete</button>
            </div>

            {/* Upload */}
            <div>
              <div className="text-[#888] text-xs mb-2">Upload document to train</div>
              <label className="cursor-pointer">
                <input type="file" accept=".pdf,.txt,.md" className="hidden"
                  onChange={e => e.target.files[0] && upload(selected.id, e.target.files[0])} />
                <div className="border border-dashed border-[#333] hover:border-blue-600 rounded-lg p-4 text-center text-sm text-[#555] hover:text-white transition">
                  {uploading ? 'Uploading...' : 'Click to upload PDF, TXT, or MD'}
                </div>
              </label>
            </div>

            {/* Chat URL */}
            <div>
              <div className="text-[#888] text-xs mb-2">Chat URL — share with users</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-2 text-xs text-[#aaa] truncate">
                  {selected.chat_url || `${API_URL}/assistant/${selected.id}/chat`}
                </code>
                <button onClick={() => copy(selected.chat_url || `${API_URL}/assistant/${selected.id}/chat`, 'chat')}
                  className="text-xs text-[#666] hover:text-white px-2 py-1 border border-[#222] rounded transition">
                  {copied === 'chat' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Embed */}
            <div>
              <div className="text-[#888] text-xs mb-2">Website embed — paste in your HTML</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-2 text-xs text-[#aaa] truncate">
                  {selected.embed_code || `<script src="${API_URL}/assistant/${selected.id}/widget.js"></script>`}
                </code>
                <button onClick={() => copy(selected.embed_code || '', 'embed')}
                  className="text-xs text-[#666] hover:text-white px-2 py-1 border border-[#222] rounded transition">
                  {copied === 'embed' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <div className="text-[#888] text-xs mb-2">WhatsApp webhook URL</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-2 text-xs text-[#aaa] truncate">
                  {selected.whatsapp_webhook || `${API_URL}/assistant/${selected.id}/whatsapp`}
                </code>
                <button onClick={() => copy(selected.whatsapp_webhook || '', 'wa')}
                  className="text-xs text-[#666] hover:text-white px-2 py-1 border border-[#222] rounded transition">
                  {copied === 'wa' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-[#444] mt-1">Point your WhatsApp Business webhook here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
