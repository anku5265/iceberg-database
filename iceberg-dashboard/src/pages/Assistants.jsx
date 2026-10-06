import { useEffect, useState, useRef } from 'react'
import { API_URL } from '../lib/config'
import ConfirmModal from '../components/ConfirmModal'

const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

export default function Assistants() {
  const [assistants, setAssistants] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'knowledge' | 'embed'

  // Create form state
  const [form, setForm] = useState({
    name: '',
    greeting: 'Hi! How can I help you today?',
    llm_provider: 'iceberg_fast', // iceberg_fast, openai, gemini
    llm_api_key: '',
    llm_model: 'gpt-3.5-turbo',
    color: '#3b82f6',
  })
  const [createLoading, setCreateLoading] = useState(false)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Copy feedback state
  const [copied, setCopied] = useState('')

  // Quick Demo Seeder state
  const [seedingDemo, setSeedingDemo] = useState(false)

  // Live Chat Simulator state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatScrollRef = useRef(null)

  // Load assistants from backend
  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`${API_URL}/assistant`, { headers: H() })
      if (res.ok) {
        const data = await res.json()
        const list = data.assistants || []
        setAssistants(list)

        // If nothing selected or selected was deleted, select first
        setSelected(prev => {
          if (!prev && list.length > 0) return list[0]
          if (prev && !list.find(a => a.id === prev.id)) return list[0] || null
          return prev
        })
      }
    } catch (err) {
      console.error('Failed to load assistants:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Auto-refresh every 4s
    const timer = setInterval(() => load(true), 4000)
    const onFocus = () => load(true)
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // When selected assistant changes, initialize chat simulator
  useEffect(() => {
    if (selected) {
      setChatMessages([
        {
          id: 'greeting',
          role: 'assistant',
          text: selected.greeting || 'Hi! How can I help you today?',
          sources: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } else {
      setChatMessages([])
    }
  }, [selected?.id])

  // Scroll chat simulator to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, chatLoading])

  // Create new assistant
  const create = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreateLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        greeting: form.greeting.trim() || 'Hi! How can I help you today?',
        llm_provider: form.llm_provider === 'iceberg_fast' ? 'openai' : form.llm_provider,
        llm_api_key: form.llm_api_key.trim(),
        llm_model: form.llm_model,
        color: form.color,
      }
      const res = await fetch(`${API_URL}/assistant`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.id) {
        setCreating(false)
        setForm({
          name: '',
          greeting: 'Hi! How can I help you today?',
          llm_provider: 'iceberg_fast',
          llm_api_key: '',
          llm_model: 'gpt-3.5-turbo',
          color: '#3b82f6',
        })
        await load()
        setSelected(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCreateLoading(false)
    }
  }

  // Quick Demo Seeder: creates a bot and pre-indexes an Iceberg knowledge guide
  const handleLaunchDemoBot = async () => {
    setSeedingDemo(true)
    try {
      // 1. Create assistant
      const demoConfig = {
        name: 'Iceberg Tech Support',
        greeting: 'Hello! I am your AI assistant trained on IcebergDB documentation. Ask me about vector search, indexing, or hybrid retrieval!',
        llm_provider: 'openai',
        llm_api_key: '',
        llm_model: 'gpt-3.5-turbo',
        color: '#3b82f6',
      }
      const res = await fetch(`${API_URL}/assistant`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify(demoConfig),
      })
      const asst = await res.json()

      if (asst?.id) {
        // 2. Upload sample knowledge document
        const sampleDoc = `IcebergDB Knowledge Base Guide:
1. Overview: IcebergDB is a high-performance vector database optimized for semantic search and Retrieval-Augmented Generation (RAG).
2. Embeddings: Uses 384-dimensional dense vectors with Cosine distance metric for deep semantic similarity.
3. Hybrid Search: Combines dense vector retrieval with BM25 keyword matching for maximum precision and recall.
4. Latency: Sub-15 millisecond vector query times with HNSW indexing.
5. Security: Data sovereignty guaranteed with zero third-party telemetry, hosted in Mumbai, India.`
        const file = new File([sampleDoc], 'iceberg_architecture_guide.txt', { type: 'text/plain' })
        const formData = new FormData()
        formData.append('file', file)
        await fetch(`${API_URL}/assistant/${asst.id}/upload`, {
          method: 'POST',
          headers: { 'X-API-Key': KEY() },
          body: formData,
        })

        await load()
        setSelected(asst)
        setActiveTab('chat')
      }
    } catch (err) {
      console.error('Failed to launch demo bot:', err)
    } finally {
      setSeedingDemo(false)
    }
  }

  // Delete assistant
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`${API_URL}/assistant/${deleteTarget.id}`, { method: 'DELETE', headers: H() })
      if (selected?.id === deleteTarget.id) setSelected(null)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  // Upload document
  const uploadDoc = async (id, file) => {
    if (!file) return
    setUploading(true)
    setUploadSuccess('')
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/assistant/${id}/upload`, {
        method: 'POST',
        headers: { 'X-API-Key': KEY() },
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setUploadSuccess(`Indexed "${file.name}" (${data.indexed || 'all'} chunks) into Qdrant collection!`)
        setTimeout(() => setUploadSuccess(''), 5000)
      } else {
        setUploadError(data.detail || 'Upload failed')
      }
    } catch (err) {
      setUploadError('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  // Live Chat Simulator send
  const sendChatMessage = async (presetText = null) => {
    const textToSend = (presetText || chatInput).trim()
    if (!textToSend || !selected || chatLoading) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch(`${API_URL}/assistant/${selected.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      })
      const data = await res.json()
      if (res.ok) {
        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            text: data.reply || "I couldn't find relevant information in the documents.",
            sources: data.sources || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            text: `Error: ${data.detail || 'Assistant request failed'}`,
            sources: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Unable to connect to assistant endpoint. Please check your network connection.',
          sources: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  // Copy helper
  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const filteredAssistants = assistants.filter(a =>
    a.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.trim().toLowerCase())
  )

  const chatUrl = selected ? `${API_URL}/assistant/${selected.id}/chat` : ''
  const widgetScript = selected ? `<script src="${API_URL}/assistant/${selected.id}/widget.js"></script>` : ''
  const waWebhookUrl = selected ? `${API_URL}/assistant/${selected.id}/whatsapp` : ''

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Assistants</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {assistants.length} active
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            No-code RAG chatbots — vector search across knowledge bases with embeddable widget &amp; WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => load()}
            className="px-3 py-2 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh assistants"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={loading ? 'animate-spin' : ''}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>New Assistant</span>
          </button>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Active Bots</span>
            <span className="text-blue-400">RAG</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{assistants.length}</div>
          <p className="text-[11px] text-[var(--text-dim)]">Live interactive endpoints</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Knowledge Engine</span>
            <span className="text-emerald-400">Vectors</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">Qdrant + 384d</div>
          <p className="text-[11px] text-[var(--text-dim)]">Dense Cosine embeddings</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Query Latency</span>
            <span className="text-purple-400">ANN</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">&lt; 18ms</div>
          <p className="text-[11px] text-[var(--text-dim)]">Sub-25ms hybrid context</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Channels</span>
            <span className="text-amber-400">Omni</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">Web, REST, WA</div>
          <p className="text-[11px] text-[var(--text-dim)]">Zero-code multi-channel</p>
        </div>
      </div>

      {/* ── 3. Create Assistant Drawer / Form ── */}
      {creating && (
        <form onSubmit={create} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 md:p-6 space-y-4 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Create New AI Assistant</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Configure your assistant identity, greeting message, and vector retrieval settings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-[var(--text-dim)] hover:text-[var(--text-primary)] text-sm transition"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[var(--text-secondary)] text-xs font-medium mb-1.5 block">Assistant Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Customer Support Bot, Documentation Guide"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3.5 py-2.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)]"
              />
            </div>

            <div>
              <label className="text-[var(--text-secondary)] text-xs font-medium mb-1.5 block">Greeting Message</label>
              <input
                value={form.greeting}
                onChange={e => setForm({ ...form, greeting: e.target.value })}
                placeholder="Hi! How can I help you today?"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3.5 py-2.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)]"
              />
            </div>

            <div>
              <label className="text-[var(--text-secondary)] text-xs font-medium mb-1.5 block">LLM Provider</label>
              <select
                value={form.llm_provider}
                onChange={e => setForm({ ...form, llm_provider: e.target.value })}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3.5 py-2.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-blue-600"
              >
                <option value="iceberg_fast">⚡ Fast Semantic RAG (Direct Vector Search - No LLM Key Required)</option>
                <option value="openai">OpenAI (GPT-3.5 / GPT-4)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div>
              <label className="text-[var(--text-secondary)] text-xs font-medium mb-1.5 flex items-center justify-between">
                <span>LLM API Key</span>
                <span className="text-[10px] text-[var(--text-dim)]">
                  {form.llm_provider === 'iceberg_fast' ? 'Optional for semantic fallback' : 'Required for external generation'}
                </span>
              </label>
              <input
                type="password"
                value={form.llm_api_key}
                onChange={e => setForm({ ...form, llm_api_key: e.target.value })}
                placeholder={form.llm_provider === 'iceberg_fast' ? 'Optional (leave blank for native vector RAG)' : 'sk-... or AIzaSy...'}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3.5 py-2.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-blue-600 placeholder-[var(--text-dim)]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[var(--text-secondary)] text-xs font-medium mb-1.5 block">Widget Theme Color</label>
              <div className="flex items-center gap-3">
                {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'}`}
                  />
                ))}
                <input
                  type="text"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="w-28 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)] font-mono text-center focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-lg transition shadow-sm flex items-center gap-2"
            >
              {createLoading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>{createLoading ? 'Deploying...' : 'Deploy Assistant'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── 4. Main Body: Hero Empty State OR Split Workspace ── */}
      {assistants.length === 0 && !creating ? (
        /* ── Full Width Hero Empty State ── */
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden shadow-sm">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl mx-auto space-y-5 relative z-10">
            {/* Glowing Bot Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 mx-auto shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0a0f1d] rounded-2xl flex items-center justify-center text-blue-400">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7zM9 14h.01M15 14h.01M10 18h4" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Deploy Production RAG Chatbots in Seconds
              </h2>
              <p className="text-xs md:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                Transform PDFs, documentation, and product guides into live AI assistants. Iceberg automatically handles semantic chunking, 384d vector embedding into Qdrant, and exposes ready-to-use Web, REST, and WhatsApp endpoints.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCreating(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition shadow-sm flex items-center gap-2"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>Create Custom Assistant</span>
              </button>

              <button
                onClick={handleLaunchDemoBot}
                disabled={seedingDemo}
                className="bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-blue-400 border border-blue-500/30 text-xs font-semibold px-5 py-2.5 rounded-lg transition flex items-center gap-2"
              >
                {seedingDemo ? (
                  <span className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                ) : (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                )}
                <span>{seedingDemo ? 'Spinning up Demo Bot...' : '⚡ Quick Demo: Launch Support Bot'}</span>
              </button>
            </div>

            {/* 3 Step Walkthrough Cards */}
            <div className="grid md:grid-cols-3 gap-3.5 pt-6 text-left border-t border-[var(--border)] mt-8">
              <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-1.5">
                <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-mono flex items-center justify-center font-bold">1</span>
                  <span>Instant Setup</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Name your assistant, choose an accent color, and configure the greeting message.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-1.5">
                <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono flex items-center justify-center font-bold">2</span>
                  <span>Train with Documents</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Upload PDF, Markdown, or text files. Chunks are automatically embedded with 384d vectors.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-1.5">
                <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-mono flex items-center justify-center font-bold">3</span>
                  <span>Deploy Everywhere</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Embed a floating widget on your website with one script tag, or link to WhatsApp Business.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Split Assistant Workspace ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Assistant Directory (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Search Filter */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search assistants..."
                className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl pl-8 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-blue-600 transition"
              />
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-2.5 top-2.5 text-[var(--text-dim)]">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredAssistants.length === 0 ? (
                <div className="p-6 text-center bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-dim)]">
                  No matching assistants found.
                </div>
              ) : (
                filteredAssistants.map(a => {
                  const isSelected = selected?.id === a.id
                  return (
                    <div
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between group ${
                        isSelected
                          ? 'bg-[var(--card-bg)] border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-[var(--card-bg)] border-[var(--border)] hover:border-[var(--border2)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: a.color || '#3b82f6' }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-blue-400 transition">
                            {a.name}
                          </div>
                          <div className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">
                            #{a.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(a)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-dim)] hover:text-red-400 hover:bg-red-500/10 rounded transition"
                          title="Delete assistant"
                        >
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <button
              onClick={() => setCreating(true)}
              className="w-full py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-dashed border-[var(--border2)] rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-blue-400 transition flex items-center justify-center gap-2"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Create Another Bot</span>
            </button>
          </div>

          {/* Right Column: Active Assistant Workspace (8 cols) */}
          {selected ? (
            <div className="lg:col-span-8 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[640px]">
              
              {/* Workspace Header */}
              <div className="p-4 md:p-5 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface)]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: selected.color || '#3b82f6' }}
                  />
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>{selected.name}</span>
                      <span className="font-mono text-[11px] font-normal text-[var(--text-dim)]">#{selected.id}</span>
                    </h2>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Qdrant vector collection: <span className="font-mono text-blue-400">_asst_{selected.id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition flex items-center gap-1.5"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-1 px-4 pt-3 border-b border-[var(--border)] bg-[var(--card-bg)]">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3.5 py-2 text-xs font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === 'chat'
                      ? 'border-blue-500 text-blue-400 font-semibold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>Chat Simulator</span>
                </button>

                <button
                  onClick={() => setActiveTab('knowledge')}
                  className={`px-3.5 py-2 text-xs font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === 'knowledge'
                      ? 'border-blue-500 text-blue-400 font-semibold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h10M6 10h10M6 14h6"/>
                  </svg>
                  <span>Document Training</span>
                </button>

                <button
                  onClick={() => setActiveTab('embed')}
                  className={`px-3.5 py-2 text-xs font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === 'embed'
                      ? 'border-blue-500 text-blue-400 font-semibold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                  </svg>
                  <span>Integrations &amp; Embed</span>
                </button>
              </div>

              {/* Tab 1: Live Interactive Chat Simulator */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col p-4 md:p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--border)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live RAG Playground — Top-4 context vectors injected
                    </span>
                    <button
                      onClick={() => setChatMessages([
                        {
                          id: 'greeting',
                          role: 'assistant',
                          text: selected.greeting || 'Hi! How can I help you today?',
                          sources: [],
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                      ])}
                      className="text-[11px] text-[var(--text-dim)] hover:text-[var(--text-primary)] transition"
                    >
                      Clear Chat
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3.5 min-h-[300px] max-h-[420px] p-2">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div
                            className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs mt-0.5"
                            style={{ backgroundColor: selected.color || '#3b82f6' }}
                          >
                            AI
                          </div>
                        )}

                        <div className={`space-y-1.5 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>

                            {/* Source Citations */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-[var(--border)]/60 text-[10px] text-blue-400 flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-[var(--text-dim)]">Retrieved from:</span>
                                {msg.sources.map((src, idx) => (
                                  <span key={idx} className="bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                                    {src}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`text-[10px] text-[var(--text-dim)] px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp}
                          </div>
                        </div>

                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-lg bg-[var(--border)] shrink-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)] mt-0.5">
                            You
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing Animation Indicator */}
                    {chatLoading && (
                      <div className="flex gap-3 justify-start items-center">
                        <div
                          className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs"
                          style={{ backgroundColor: selected.color || '#3b82f6' }}
                        >
                          AI
                        </div>
                        <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl rounded-tl-none flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample Query Prompt Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] text-[var(--text-dim)]">Try asking:</span>
                    {['What information do you have?', 'Summarize your key capabilities', 'How fast is vector search?'].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendChatMessage(prompt)}
                        className="text-[11px] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-blue-400 px-2.5 py-1 rounded-full transition truncate max-w-[220px]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Field */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      sendChatMessage()
                    }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder={`Ask ${selected.name} anything...`}
                      disabled={chatLoading}
                      className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-blue-600 transition disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Document Knowledge Base Upload */}
              {activeTab === 'knowledge' && (
                <div className="p-5 md:p-6 space-y-5 flex-1">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Knowledge Base Training</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Upload reference documents. The backend parses text, applies recursive semantic chunking, embeds each chunk with 384d MiniLM, and inserts into collection <code className="text-blue-400 font-mono">_asst_{selected.id}</code>.
                    </p>
                  </div>

                  {/* Drag & Drop Upload Card */}
                  <label className="block border-2 border-dashed border-[var(--border2)] hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] group">
                    <input
                      type="file"
                      accept=".pdf,.txt,.md"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && uploadDoc(selected.id, e.target.files[0])}
                    />
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          {uploading ? 'Parsing & Indexing into Vector DB...' : 'Click to select or drop documents here'}
                        </p>
                        <p className="text-[11px] text-[var(--text-dim)] mt-1">
                          Supported formats: PDF (.pdf), Text (.txt), Markdown (.md)
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Status Banner */}
                  {uploadSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{uploadSuccess}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Technical Pipeline Info Box */}
                  <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-2">
                    <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <span>How Knowledge Ingestion Works</span>
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      1. Document text is extracted in memory using PyPDF or UTF-8 decode.<br/>
                      2. Text is recursively segmented into overlapping 500-character windows.<br/>
                      3. Each chunk is transformed into a dense 384-dimensional mathematical vector using our all-MiniLM-L6-v2 transformer model.<br/>
                      4. Vectors are indexed into Qdrant HNSW graph with payload source citations for sub-18ms semantic retrieval.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Integrations & Embeds */}
              {activeTab === 'embed' && (
                <div className="p-5 md:p-6 space-y-6 flex-1">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Deployment &amp; Integrations</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Integrate {selected.name} across web applications, direct links, or WhatsApp Business.
                    </p>
                  </div>

                  {/* 1. Direct Public Chat Endpoint */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                      <span>1. Public Chat API Endpoint</span>
                      <span className="text-[10px] text-emerald-400 font-mono">POST /assistant/{selected.id}/chat</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[var(--text-secondary)] truncate select-all">
                        {chatUrl}
                      </code>
                      <button
                        onClick={() => copy(chatUrl, 'chat')}
                        className="px-3.5 py-2.5 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] transition shrink-0"
                      >
                        {copied === 'chat' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* 2. One-Line Website Embed Script */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                      <span>2. Website Embed Widget</span>
                      <span className="text-[10px] text-blue-400">Paste before &lt;/body&gt;</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-blue-400 truncate select-all">
                        {widgetScript}
                      </code>
                      <button
                        onClick={() => copy(widgetScript, 'widget')}
                        className="px-3.5 py-2.5 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] transition shrink-0"
                      >
                        {copied === 'widget' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--text-dim)]">
                      Renders a floating bottom-right chat bubble on any HTML site matching your assistant theme color ({selected.color || '#3b82f6'}).
                    </p>
                  </div>

                  {/* 3. WhatsApp Business Webhook */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                      <span>3. WhatsApp Business Webhook</span>
                      <span className="text-[10px] text-green-400">Meta Cloud API</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[var(--text-secondary)] truncate select-all">
                        {waWebhookUrl}
                      </code>
                      <button
                        onClick={() => copy(waWebhookUrl, 'wa')}
                        className="px-3.5 py-2.5 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] transition shrink-0"
                      >
                        {copied === 'wa' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--text-dim)]">
                      In Meta for Developers &gt; WhatsApp &gt; Configuration, set this URL as your Webhook callback. Verification token is your assistant ID: <span className="font-mono text-[var(--text-primary)]">{selected.id}</span>.
                    </p>
                  </div>

                  {/* 4. cURL REST Snippet */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                      <span>4. cURL Request Example</span>
                      <span className="text-[10px] text-[var(--text-dim)]">Terminal / Backend</span>
                    </label>
                    <div className="relative">
                      <pre className="p-3.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto">
{`curl -X POST "${chatUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, how does Iceberg vector search work?"}'`}
                      </pre>
                      <button
                        onClick={() => copy(`curl -X POST "${chatUrl}" -H "Content-Type: application/json" -d '{"message": "Hello, how does Iceberg vector search work?"}'`, 'curl')}
                        className="absolute right-2.5 top-2.5 px-2.5 py-1 text-[11px] font-medium bg-[var(--card-bg)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] transition"
                      >
                        {copied === 'curl' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : null}

        </div>
      )}

      {/* Modern In-App Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete AI Assistant?"
        message={
          <div>
            Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">{deleteTarget?.name}</span>?
            <br />
            The vector knowledge collection <code className="text-blue-400 font-mono">_asst_{deleteTarget?.id}</code> and all associated chat endpoints will be permanently removed.
          </div>
        }
        confirmText="Delete Assistant"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

    </div>
  )
}
