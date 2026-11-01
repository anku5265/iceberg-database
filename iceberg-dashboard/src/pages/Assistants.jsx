import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import { Link } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import { CodeBlock } from '../components/CodeBlock'

const LLM_PROVIDERS = [
  {
    id: 'iceberg_fast',
    name: 'Iceberg Native AI (FastEmbed India ap-south-1 — Zero API Key Needed)',
    shortName: 'Iceberg Native AI',
    defaultModel: 'all-MiniLM-L6-v2',
    models: ['all-MiniLM-L6-v2'],
    placeholder: 'Not required for Iceberg Native RAG',
    needsKey: false,
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o / GPT-4o-mini / o3-mini)',
    shortName: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'gpt-3.5-turbo'],
    placeholder: 'sk-proj-...',
    needsKey: true,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude (Claude 3.7 Sonnet / 3.5 Sonnet / Haiku)',
    shortName: 'Anthropic Claude',
    defaultModel: 'claude-3-5-sonnet-latest',
    models: ['claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
    placeholder: 'sk-ant-api03-...',
    needsKey: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini (Gemini 2.0 Flash / Gemini 1.5 Pro)',
    shortName: 'Google Gemini',
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro'],
    placeholder: 'AIzaSy...',
    needsKey: true,
  },
  {
    id: 'groq',
    name: 'Groq LPU (Meta Llama 3.3 70B / Mixtral — Sub-100ms)',
    shortName: 'Groq (Llama 3.3)',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    placeholder: 'gsk_...',
    needsKey: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek & OpenRouter (DeepSeek-V3 / DeepSeek-R1)',
    shortName: 'DeepSeek / OpenRouter',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner', 'qwen/qwen-2.5-72b-instruct'],
    placeholder: 'sk-... or sk-or-v1-...',
    needsKey: true,
  },
]

const getProviderMeta = (id) => LLM_PROVIDERS.find(p => p.id === id) || LLM_PROVIDERS[0]

// Synthesizes a clean, accurate RAG response from real Qdrant vector search hits when using Iceberg Native AI
function synthesizeNativeRagAnswer(question, hits, assistantName) {
  const q = question.trim().toLowerCase()
  if (/^(hi|hello|hey|namaste|hola|yo)\b/.test(q) && q.split(/\s+/).length <= 3) {
    return `Hello! I am ${assistantName}. Ask me any question about the documents indexed in my vector collection, and I will retrieve the relevant passages using Hybrid RRF search.`
  }
  if (!hits || hits.length === 0) {
    return `No matching context was found in the vector collection for "${question}". Try uploading a document or indexing text in the Knowledge Base tab.`
  }
  const top = hits[0]
  if (hits.length === 1 || (top.score && top.score > 0.62)) {
    const extra = hits[1] && hits[1].text !== top.text ? `\n\nAdditional context: ${hits[1].text}` : ''
    return `${top.text}${extra}`
  }
  return hits
    .slice(0, 3)
    .map((h, idx) => `${idx + 1}. ${h.text}`)
    .join('\n\n')
}

export default function Assistants() {
  const [assistants, setAssistants] = useState([])
  const [collections, setCollections] = useState([])
  const [colDetails, setColDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'knowledge' | 'embed'
  const [lastLatency, setLastLatency] = useState(null)

  // Live chunks inside the selected assistant's collection
  const [indexedChunks, setIndexedChunks] = useState([])
  const [loadingChunks, setLoadingChunks] = useState(false)

  // Create form state
  const [form, setForm] = useState({
    name: '',
    collectionMode: '__auto__', // '__auto__' or existing collection name
    greeting: 'Hi! How can I help you today?',
    llm_provider: 'iceberg_fast',
    llm_api_key: '',
    llm_model: 'all-MiniLM-L6-v2',
    color: '#0a0a0b',
  })
  const [createLoading, setCreateLoading] = useState(false)

  // Upload & Direct Text Ingest state
  const [uploading, setUploading] = useState(false)
  const [manualText, setManualText] = useState('')
  const [manualSource, setManualSource] = useState('manual_knowledge.txt')
  const [indexingText, setIndexingText] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Sample Assistant Seeder state
  const [seedingDemo, setSeedingDemo] = useState(false)

  // Live Chat Playground state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatScrollRef = useRef(null)

  const getTargetCollection = (asst) => {
    if (!asst) return ''
    return asst.collection || `_asst_${asst.id}`
  }

  // Load real assistants and real Qdrant collection vector counts
  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [asstRes, colRes] = await Promise.all([
        api.getAssistants(),
        api.getCollections().catch(() => ({ collections: [] })),
      ])

      const allCols = colRes?.collections || []
      setCollections(allCols)

      const list = (asstRes?.assistants || []).map(a => ({
        ...a,
        collection: a.collection || `_asst_${a.id}`,
        llm_provider: a.llm_provider || 'iceberg_fast',
        llm_model: a.llm_model || 'all-MiniLM-L6-v2',
        color: a.color || '#0a0a0b',
        greeting: a.greeting || 'Hi! How can I help you today?',
      }))

      setAssistants(list)

      // Fetch real vector counts for all collections + assistant collections
      const colsToFetch = Array.from(new Set([...allCols, ...list.map(a => a.collection)]))
      if (colsToFetch.length > 0) {
        const detailsObj = {}
        await Promise.all(
          colsToFetch.map(async (cName) => {
            try {
              const info = await api.getCollection(cName)
              if (info && info.vector_count !== undefined) {
                detailsObj[cName] = info
              }
            } catch {}
          })
        )
        setColDetails(detailsObj)
      }

      setSelected(prev => {
        if (!prev && list.length > 0) return list[0]
        if (prev) {
          const match = list.find(a => a.id === prev.id)
          return match || list[0] || null
        }
        return prev
      })
    } catch (err) {
      console.error('Failed to load assistants:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Fetch sample of real indexed chunks from the selected assistant's Qdrant collection
  const loadIndexedChunks = async (asst) => {
    if (!asst) {
      setIndexedChunks([])
      return
    }
    const col = getTargetCollection(asst)
    setLoadingChunks(true)
    try {
      const res = await api.search(col, 'overview guide documentation information system', 8, 'hybrid', 0.5)
      if (res && Array.isArray(res.results)) {
        setIndexedChunks(res.results)
      } else {
        setIndexedChunks([])
      }
    } catch {
      setIndexedChunks([])
    } finally {
      setLoadingChunks(false)
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(() => load(true), 4500)
    const onFocus = () => load(true)
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // When selected assistant changes, initialize chat playground and load its real indexed chunks
  useEffect(() => {
    if (selected) {
      setChatMessages([
        {
          id: 'greeting',
          role: 'assistant',
          text: selected.greeting || 'Hi! How can I help you today?',
          sources: [],
          latencyMs: null,
          topScore: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      loadIndexedChunks(selected)
    } else {
      setChatMessages([])
      setIndexedChunks([])
    }
  }, [selected?.id, selected?.collection])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, chatLoading])

  const handleProviderChange = (providerId) => {
    const meta = getProviderMeta(providerId)
    setForm({
      ...form,
      llm_provider: providerId,
      llm_model: meta.defaultModel,
    })
  }

  // Create new assistant connected to a real Qdrant collection
  const create = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreateLoading(true)
    try {
      const chosenCol =
        form.collectionMode && form.collectionMode !== '__auto__'
          ? form.collectionMode
          : `asst_${form.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20)}`

      const created = await api.createAssistant({
        name: form.name.trim(),
        collection: chosenCol,
        description: `${getProviderMeta(form.llm_provider).shortName} (${form.llm_model})`,
        greeting: form.greeting.trim() || 'Hi! How can I help you today?',
        llm_provider: form.llm_provider,
        llm_api_key: form.llm_api_key.trim(),
        llm_model: form.llm_model,
        color: form.color,
      })

      setCreating(false)
      setForm({
        name: '',
        collectionMode: '__auto__',
        greeting: 'Hi! How can I help you today?',
        llm_provider: 'iceberg_fast',
        llm_api_key: '',
        llm_model: 'all-MiniLM-L6-v2',
        color: '#0a0a0b',
      })
      await load()
      setSelected(created)
      setActiveTab('chat')
    } catch (err) {
      console.error(err)
    } finally {
      setCreateLoading(false)
    }
  }

  // 1-Click Sample Assistant Seeder (Creates real Qdrant collection + indexes 6 real documentation chunks)
  const handleLaunchDemoBot = async () => {
    setSeedingDemo(true)
    try {
      const targetCol = 'asst_iceberg_support'
      const created = await api.createAssistant({
        name: 'Iceberg Tech Support',
        collection: targetCol,
        description: 'Iceberg Native AI (all-MiniLM-L6-v2)',
        greeting: 'Hello! I am your AI assistant grounded on the Iceberg DB documentation collection. Ask me about vector search latency, hybrid RRF ranking, embeddings, or agent memory.',
        llm_provider: 'iceberg_fast',
        llm_api_key: '',
        llm_model: 'all-MiniLM-L6-v2',
        color: '#0a0a0b',
      })

      const realDocs = [
        'Iceberg DB delivers sub-15ms vector query latency (~1.95ms pure dense HNSW lookup and ~8.73ms Hybrid RRF search) hosted in India (ap-south-1).',
        'Hybrid Search in Iceberg DB combines 384-dimensional dense semantic embeddings (all-MiniLM-L6-v2 Cosine similarity) with sparse BM25 keyword matching using Reciprocal Rank Fusion (RRF).',
        'Server-side CPU embeddings are built directly into Iceberg DB at zero extra cost — developers can send raw text or PDFs without needing an external OpenAI embedding API key.',
        'Iceberg Agent Memory provides 4 cognitive persistence tiers: short_term (30m TTL), episodic (7d TTL), long_term (permanent), and semantic memory via /remember and /recall endpoints.',
        'Iceberg DB provides official open-source SDKs for Python (pip install icebergdb), JavaScript/TypeScript (npm install icebergdb), Rust (Crates.io), .NET (NuGet), Go, and Model Context Protocol (MCP).',
        'Every workspace in Iceberg DB enforces strict multi-tenant namespace isolation with 100% India data residency for DPDP Act compliance, and the free tier includes 100,000 vectors that never pause.'
      ]

      await api.indexBatch(targetCol, realDocs, 'iceberg_architecture_guide.md')

      // Also sync sample doc to /assistant/{id}/upload if backend route is active
      try {
        const file = new File([realDocs.join('\n\n')], 'iceberg_architecture_guide.md', { type: 'text/plain' })
        const formData = new FormData()
        formData.append('file', file)
        await fetch(`${API_URL}/assistant/${created.id}/upload`, {
          method: 'POST',
          headers: { 'X-API-Key': localStorage.getItem('iceberg_api_key') || '' },
          body: formData,
        })
      } catch {}

      await load()
      setSelected(created)
      await loadIndexedChunks(created)
      setActiveTab('chat')
    } catch (err) {
      console.error('Failed to launch sample assistant:', err)
    } finally {
      setSeedingDemo(false)
    }
  }

  // Delete assistant
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const targetCol = getTargetCollection(deleteTarget)
      await api.deleteAssistant(deleteTarget.id, true, targetCol)
      if (selected?.id === deleteTarget.id) setSelected(null)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  // Upload real document (.pdf, .txt, .md) into the assistant's Qdrant collection
  const uploadDoc = async (asst, file) => {
    if (!file || !asst) return
    setUploading(true)
    setUploadSuccess('')
    setUploadError('')
    const targetCol = getTargetCollection(asst)
    try {
      // Ensure collection exists first
      await api.createCollection(targetCol, `RAG Knowledge Base for ${asst.name}`).catch(() => {})
      const data = await api.uploadFile(targetCol, file)
      const chunksCount = data?.chunks_indexed ?? data?.indexed ?? 'all'
      if (data && (data.chunks_indexed !== undefined || data.indexed !== undefined || data.filename)) {
        setUploadSuccess(`Indexed "${file.name}" (${chunksCount} vector chunks) into collection "${targetCol}".`)
        await load(true)
        await loadIndexedChunks(asst)
        setTimeout(() => setUploadSuccess(''), 6000)
      } else {
        setUploadError(data?.detail || 'Document upload failed')
      }
    } catch (err) {
      setUploadError('Failed to upload and index document')
    } finally {
      setUploading(false)
    }
  }

  // Direct text ingestion into the assistant's Qdrant collection
  const handleManualTextIngest = async (e) => {
    e.preventDefault()
    if (!manualText.trim() || !selected) return
    setIndexingText(true)
    setUploadSuccess('')
    setUploadError('')
    const targetCol = getTargetCollection(selected)
    try {
      await api.createCollection(targetCol, `RAG Knowledge Base for ${selected.name}`).catch(() => {})
      const res = await api.indexText(targetCol, manualText.trim(), manualSource.trim() || 'manual_entry.txt')
      const count = res?.chunks_indexed ?? 1
      setManualText('')
      setUploadSuccess(`Embedded and indexed ${count} chunk(s) into "${targetCol}".`)
      await load(true)
      await loadIndexedChunks(selected)
      setTimeout(() => setUploadSuccess(''), 5000)
    } catch {
      setUploadError('Failed to index text into collection')
    } finally {
      setIndexingText(false)
    }
  }

  // Live RAG Chat Playground — performs REAL Qdrant Hybrid Search + LLM generation
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

    const targetCol = getTargetCollection(selected)
    const t0 = performance.now()

    try {
      // 1. Execute REAL Hybrid Vector + BM25 Search against the assistant's Qdrant collection
      const searchRes = await api.search(targetCol, textToSend, 4, 'hybrid', 0.5)
      const measuredMs = Math.max(1, Math.round((performance.now() - t0) * 10) / 10)
      const hits = Array.isArray(searchRes?.results) ? searchRes.results : []
      const serverMs = searchRes?.latency_ms || searchRes?.took_ms || measuredMs
      setLastLatency(serverMs)

      const sources = Array.from(
        new Set(
          hits
            .map(h => h.metadata?.source || h.source || targetCol)
            .filter(Boolean)
        )
      )
      const topScore = hits.length > 0 && hits[0].score !== undefined ? hits[0].score : null
      const contextText = hits.map(h => h.text).join('\n\n')

      // 2. Route to configured LLM Provider if API key is provided, else use Native RAG Synthesizer
      const provider = selected.llm_provider || 'iceberg_fast'
      const apiKey = (selected.llm_api_key || '').trim()
      const model = selected.llm_model || 'all-MiniLM-L6-v2'

      let replyText = ''

      if (apiKey && contextText && (provider === 'openai' || provider === 'groq' || provider === 'deepseek')) {
        const endpoint =
          provider === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : provider === 'deepseek'
            ? apiKey.startsWith('sk-or-')
              ? 'https://openrouter.ai/api/v1/chat/completions'
              : 'https://api.deepseek.com/chat/completions'
            : 'https://api.openai.com/v1/chat/completions'
        try {
          const llmRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: 'system',
                  content: `You are ${selected.name}, an enterprise AI assistant powered by Iceberg DB. Answer the user's question accurately and concisely using ONLY the retrieved vector context below:\n\n${contextText}`,
                },
                { role: 'user', content: textToSend },
              ],
            }),
          })
          if (llmRes.ok) {
            const llmJson = await llmRes.json()
            replyText = llmJson?.choices?.[0]?.message?.content || ''
          }
        } catch {}
      } else if (apiKey && contextText && provider === 'gemini') {
        try {
          const geminiModel = model.startsWith('gemini') ? model : 'gemini-2.0-flash'
          const llmRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are ${selected.name}. Answer using ONLY this retrieved vector context:\n\n${contextText}\n\nQuestion: ${textToSend}`,
                      },
                    ],
                  },
                ],
              }),
            }
          )
          if (llmRes.ok) {
            const llmJson = await llmRes.json()
            replyText = llmJson?.candidates?.[0]?.content?.parts?.[0]?.text || ''
          }
        } catch {}
      }

      if (!replyText) {
        replyText = synthesizeNativeRagAnswer(textToSend, hits, selected.name)
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: replyText,
          sources,
          latencyMs: serverMs,
          topScore,
          hitsCount: hits.length,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Unable to query vector collection. Please verify your collection has indexed documents.',
          sources: [],
          latencyMs: null,
          topScore: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const filteredAssistants = assistants.filter(a =>
    a.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    (a.collection || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
  )

  // Total real vectors across all assistants' collections
  const totalAssistantVectors = assistants.reduce((sum, a) => {
    const cName = getTargetCollection(a)
    const count = colDetails[cName]?.vector_count
    return sum + (typeof count === 'number' ? count : 0)
  }, 0)

  const selectedCollection = getTargetCollection(selected)
  const selectedVectorCount = colDetails[selectedCollection]?.vector_count ?? indexedChunks.length

  const chatUrl = selected ? `${API_URL}/assistant/${selected.id}/chat` : ''
  const widgetScript = selected ? `<script src="${API_URL}/assistant/${selected.id}/widget.js"></script>` : ''
  const waWebhookUrl = selected ? `${API_URL}/assistant/${selected.id}/whatsapp` : ''
  const currentProviderMeta = getProviderMeta(form.llm_provider)

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">
      
      {/* ── 1. Clean Enterprise Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Assistants</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">
            Provision managed RAG assistants grounded on your real vector collections with configurable LLM routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              load()
              if (selected) loadIndexedChunks(selected)
            }}
            className="px-3.5 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition"
          >
            {loading ? 'Syncing...' : 'Refresh'}
          </button>

          <button
            onClick={() => setCreating(true)}
            className="px-3.5 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 text-xs font-semibold transition"
          >
            New Assistant
          </button>
        </div>
      </div>

      {/* ── 2. Unified 4-Cell Enterprise Metric Strip (Live Backend Telemetry) ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)] shadow-[var(--shadow)]">
        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Active Assistants</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {assistants.length}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Provisioned RAG endpoints</p>
        </div>

        <div className="p-5 border-t-0">
          <p className="text-xs font-medium text-[var(--text-muted)]">Indexed Knowledge</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {totalAssistantVectors.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">384d vectors across bots</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Retrieval Architecture</p>
          <p className="text-xl font-semibold text-[var(--text-primary)] font-mono mt-2">
            {lastLatency ? `${lastLatency}ms · RRF` : 'HNSW + BM25'}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
            {lastLatency ? 'Last live vector retrieval' : 'Top-4 hybrid context injection'}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Supported Models</p>
          <p className="text-xl font-semibold text-[var(--text-primary)] font-mono mt-2">
            6 Providers
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">OpenAI, Claude, Gemini, Groq, DeepSeek, Native</p>
        </div>
      </div>

      {/* ── 3. Create Assistant Form Panel (Connects to Real Collections!) ── */}
      {creating && (
        <form onSubmit={create} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 space-y-4 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                Create RAG Assistant
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Connect your assistant to an existing vector collection or provision a new knowledge base.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[var(--text-muted)] text-xs font-medium mb-1.5 block">Assistant Name</label>
              <input
                autoFocus
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Iceberg Tech Support"
                className="input-base text-xs w-full"
              />
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-xs font-medium mb-1.5 block">Knowledge Base Collection</label>
              <select
                value={form.collectionMode}
                onChange={e => setForm({ ...form, collectionMode: e.target.value })}
                className="input-base text-xs font-mono w-full"
              >
                <option value="__auto__">+ Auto-create dedicated collection</option>
                {collections.map(c => (
                  <option key={c} value={c}>
                    {c} ({colDetails[c]?.vector_count ?? 0} vectors)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-xs font-medium mb-1.5 block">LLM Provider</label>
              <select
                value={form.llm_provider}
                onChange={e => handleProviderChange(e.target.value)}
                className="input-base text-xs w-full"
              >
                {LLM_PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-xs font-medium mb-1.5 block">Model</label>
              <select
                value={form.llm_model}
                onChange={e => setForm({ ...form, llm_model: e.target.value })}
                className="input-base text-xs font-mono w-full"
              >
                {currentProviderMeta.models.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-xs font-medium mb-1.5 flex items-center justify-between">
                <span>{currentProviderMeta.shortName} API Key</span>
                <span className="text-[11px] text-[var(--text-dim)]">
                  {!currentProviderMeta.needsKey ? 'Not required' : 'Encrypted'}
                </span>
              </label>
              <input
                type="password"
                value={form.llm_api_key}
                onChange={e => setForm({ ...form, llm_api_key: e.target.value })}
                placeholder={currentProviderMeta.placeholder}
                disabled={!currentProviderMeta.needsKey}
                className="input-base text-xs w-full disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-xs font-medium mb-1.5 block">Greeting Message</label>
              <input
                value={form.greeting}
                onChange={e => setForm({ ...form, greeting: e.target.value })}
                placeholder="Hi! How can I help you today?"
                className="input-base text-xs w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="submit"
              disabled={createLoading || !form.name.trim()}
              className="px-4 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition"
            >
              {createLoading ? 'Provisioning...' : 'Create Assistant'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-3.5 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── 4. Split-Pane Enterprise Assistant Workbench (Directory + Playground/Knowledge/API) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (4 cols): Assistant Directory Card */}
        <div className="lg:col-span-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-[var(--shadow)] flex flex-col min-h-[560px]">
          <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">Directory</h2>
              <span className="text-[11px] font-mono text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg-surface2)] border border-[var(--border)]">
                {assistants.length}
              </span>
            </div>
            <button
              onClick={() => setCreating(true)}
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              + New
            </button>
          </div>

          {assistants.length > 0 && (
            <div className="p-3 border-b border-[var(--border)]">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter assistants or collections..."
                className="w-full bg-[var(--bg-surface2)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--text-muted)]"
              />
            </div>
          )}

          <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[460px]">
            {assistants.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <p className="text-xs font-semibold text-[var(--text-primary)]">No assistants provisioned</p>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Create a custom assistant connected to your collections, or load the pre-indexed sample support assistant.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setCreating(true)}
                    className="w-full py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 text-xs font-semibold transition"
                  >
                    Create Assistant
                  </button>
                  <button
                    onClick={handleLaunchDemoBot}
                    disabled={seedingDemo}
                    className="w-full py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition disabled:opacity-50"
                  >
                    {seedingDemo ? 'Indexing Sample Knowledge...' : 'Load Sample Assistant'}
                  </button>
                </div>
              </div>
            ) : filteredAssistants.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                No assistants match "{searchQuery}"
              </div>
            ) : (
              filteredAssistants.map(a => {
                const isSelected = selected?.id === a.id
                const colName = getTargetCollection(a)
                const vecCount = colDetails[colName]?.vector_count ?? 0
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={`p-3.5 rounded-md border cursor-pointer transition flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-[var(--bg-surface2)] border-[var(--text-primary)]'
                        : 'bg-[var(--card-bg)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                          {a.name}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)] mt-1 pl-4 truncate">
                        #{a.id} · {a.llm_model || 'all-MiniLM-L6-v2'}
                      </div>
                      <div className="text-[10.5px] font-mono text-[var(--text-dim)] mt-0.5 pl-4 truncate">
                        {colName} ({vecCount} vectors)
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-emerald-500 shrink-0">
                      Ready
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column (8 cols): Active Assistant Inspector & Playground */}
        <div className="lg:col-span-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-[var(--shadow)] flex flex-col min-h-[560px]">
          {selected ? (
            <>
              {/* Workspace Header */}
              <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-surface2)] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                      {selected.name}
                    </h2>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      #{selected.id}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {selectedVectorCount} vectors
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                    Collection:{' '}
                    <Link
                      to={`/explorer?collection=${encodeURIComponent(selectedCollection)}`}
                      className="font-mono text-[var(--text-primary)] underline decoration-[var(--border2)] hover:opacity-80"
                    >
                      {selectedCollection}
                    </Link>{' '}
                    · Model: <span className="font-mono text-[var(--text-primary)]">{selected.llm_model || 'all-MiniLM-L6-v2'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                  >
                    + Add Knowledge
                  </button>
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    className="text-xs font-medium text-red-500 hover:text-red-400 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Clean Monochrome Tab Bar */}
              <div className="flex items-center gap-6 px-5 border-b border-[var(--border)] bg-[var(--card-bg)]">
                {[
                  { id: 'chat', label: 'Playground' },
                  { id: 'knowledge', label: `Knowledge Base (${selectedVectorCount})` },
                  { id: 'embed', label: 'API & Embed' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`py-3 text-xs border-b-2 transition -mb-px ${
                      activeTab === t.id
                        ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-semibold'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Live RAG Playground */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col p-5 space-y-4">
                  {selectedVectorCount === 0 && (
                    <div className="p-3 rounded-md bg-[var(--bg-surface2)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs">
                      <span className="text-[var(--text-muted)]">
                        Collection <code className="font-mono text-[var(--text-primary)]">{selectedCollection}</code> has 0 indexed vectors. Add documents to ground responses.
                      </span>
                      <button
                        onClick={() => setActiveTab('knowledge')}
                        className="px-3 py-1.5 rounded bg-[var(--text-primary)] text-[var(--bg-base)] text-[11px] font-semibold shrink-0"
                      >
                        Upload Docs
                      </button>
                    </div>
                  )}

                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[380px] pr-1">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[84%] rounded-lg px-4 py-3 text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-[var(--text-primary)] text-[var(--bg-base)]'
                              : 'bg-[var(--bg-surface2)] border border-[var(--border)] text-[var(--text-primary)]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          {(msg.sources?.length > 0 || msg.latencyMs) && (
                            <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] font-mono text-[var(--text-muted)]">
                              {msg.sources?.length > 0 && (
                                <span>Source: {msg.sources.join(', ')}</span>
                              )}
                              {typeof msg.topScore === 'number' && (
                                <span>Match: {(msg.topScore * 100).toFixed(1)}%</span>
                              )}
                              {msg.latencyMs && (
                                <span>Retrieval: {msg.latencyMs}ms</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="px-4 py-2.5 rounded-lg bg-[var(--bg-surface2)] border border-[var(--border)] text-xs text-[var(--text-muted)] font-mono">
                          Searching {selectedCollection} (Hybrid RRF) &amp; generating answer...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Prompt Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-[var(--text-muted)]">Test query:</span>
                    {[
                      'How fast is Iceberg hybrid search?',
                      'How does Agent Memory work?',
                      'Which SDKs are supported?',
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendChatMessage(prompt)}
                        className="text-[11px] bg-[var(--bg-surface2)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded-md transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Input Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      sendChatMessage()
                    }}
                    className="flex items-center gap-2.5 pt-1"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder={`Ask ${selected.name} a question...`}
                      disabled={chatLoading}
                      className="flex-1 input-base text-xs py-2.5"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="px-5 py-2.5 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Knowledge Base Document & Text Ingestion + Live Indexed Chunks */}
              {activeTab === 'knowledge' && (
                <div className="p-5 space-y-5 flex-1 overflow-y-auto max-h-[480px]">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Option A: File Upload */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                        1. Upload Document (.pdf, .txt, .md)
                      </h3>
                      <label className="block border border-dashed border-[var(--border2)] hover:border-[var(--text-primary)] rounded-lg p-6 text-center cursor-pointer transition bg-[var(--bg-surface2)]">
                        <input
                          type="file"
                          accept=".pdf,.txt,.md"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && uploadDoc(selected, e.target.files[0])}
                        />
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          {uploading ? 'Embedding & Indexing into Qdrant...' : 'Click to upload file (.pdf, .txt, .md)'}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">
                          Auto-chunks &amp; embeds into <code className="font-mono">{selectedCollection}</code>
                        </p>
                      </label>
                    </div>

                    {/* Option B: Direct Text / FAQ Ingestion */}
                    <form onSubmit={handleManualTextIngest} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                          2. Paste Knowledge Text Directly
                        </h3>
                        <input
                          type="text"
                          value={manualSource}
                          onChange={e => setManualSource(e.target.value)}
                          placeholder="source_name.txt"
                          className="bg-[var(--bg-surface2)] border border-[var(--border)] rounded px-2 py-0.5 text-[10.5px] font-mono text-[var(--text-secondary)] w-36"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={manualText}
                        onChange={e => setManualText(e.target.value)}
                        placeholder="Paste product documentation, FAQ answers, or pricing rules to embed into this assistant..."
                        className="w-full input-base text-xs resize-none"
                      />
                      <button
                        type="submit"
                        disabled={indexingText || !manualText.trim()}
                        className="w-full py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition"
                      >
                        {indexingText ? 'Embedding (384d)...' : 'Embed & Index Text'}
                      </button>
                    </form>
                  </div>

                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md text-xs">
                      {uploadSuccess}
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-xs">
                      {uploadError}
                    </div>
                  )}

                  {/* Live Indexed Chunks Table */}
                  <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-[var(--bg-surface2)] border-b border-[var(--border)] flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        Indexed Vector Chunks in <code className="font-mono">{selectedCollection}</code>
                      </span>
                      <button
                        type="button"
                        onClick={() => loadIndexedChunks(selected)}
                        className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {loadingChunks ? 'Loading...' : 'Refresh Chunks'}
                      </button>
                    </div>

                    {indexedChunks.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                        No chunks indexed in <code className="font-mono">{selectedCollection}</code> yet. Upload a file or paste text above.
                      </div>
                    ) : (
                      <div className="divide-y divide-[var(--border)] max-h-[210px] overflow-y-auto">
                        {indexedChunks.map((chunk, i) => (
                          <div key={i} className="p-3 text-xs space-y-1 hover:bg-[var(--bg-hover)]">
                            <div className="flex items-center justify-between text-[10.5px] font-mono text-[var(--text-muted)]">
                              <span>Source: {chunk.metadata?.source || chunk.source || 'document'}</span>
                              <span>384d · Cosine</span>
                            </div>
                            <p className="text-[var(--text-primary)] line-clamp-2 leading-relaxed">
                              {chunk.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: API & Embed */}
              {activeTab === 'embed' && (
                <div className="p-5 space-y-5 flex-1 overflow-y-auto max-h-[480px]">
                  <div>
                    <h3 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Endpoints &amp; Embeds</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Connect <span className="font-semibold text-[var(--text-primary)]">{selected.name}</span> (grounded on <code className="font-mono text-[var(--text-primary)]">{selectedCollection}</code>) to your app via REST API, HTML widget, or WhatsApp Webhook.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-primary)]">1. REST Chat Endpoint</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">POST /assistant/{selected.id}/chat</span>
                    </div>
                    <CodeBlock code={chatUrl} label="Endpoint" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-primary)]">2. Website Widget Script</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">Paste before &lt;/body&gt;</span>
                    </div>
                    <CodeBlock code={widgetScript} label="HTML" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-primary)]">3. WhatsApp Business Webhook</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">Verify Token: {selected.id}</span>
                    </div>
                    <CodeBlock code={waWebhookUrl} label="Webhook" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-primary)]">4. Python SDK RAG Retrieval</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">pip install icebergdb</span>
                    </div>
                    <CodeBlock
                      code={`from iceberg import IcebergClient\n\nclient = IcebergClient(api_key="YOUR_API_KEY")\nresults = client.search("${selectedCollection}", query="How fast is Iceberg hybrid search?", top_k=4)`}
                      label="Python"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty Inspector State inside Right Pane */
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-6 px-5 border-b border-[var(--border)] bg-[var(--bg-surface2)]">
                <span className="py-3 text-xs border-b-2 border-[var(--text-primary)] text-[var(--text-primary)] font-semibold -mb-px">
                  Playground
                </span>
                <span className="py-3 text-xs text-[var(--text-muted)] font-medium">
                  Knowledge Base
                </span>
                <span className="py-3 text-xs text-[var(--text-muted)] font-medium">
                  API &amp; Embed
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                  No assistant selected
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-md leading-relaxed">
                  Create a new RAG assistant connected to any of your vector collections, or load the pre-indexed sample support assistant to test live Qdrant retrieval.
                </p>
                <div className="flex items-center gap-2.5 mt-5">
                  <button
                    onClick={handleLaunchDemoBot}
                    disabled={seedingDemo}
                    className="px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition disabled:opacity-50"
                  >
                    {seedingDemo ? 'Indexing Sample Knowledge...' : 'Load Sample Assistant'}
                  </button>
                  <button
                    onClick={() => setCreating(true)}
                    className="px-4 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 text-xs font-semibold transition"
                  >
                    New Assistant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete assistant?"
        message={
          <div>
            Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">{deleteTarget?.name}</span>?
            {getTargetCollection(deleteTarget).startsWith('asst_') && (
              <>
                {' '}The dedicated vector collection <code className="font-mono text-[var(--text-primary)]">{getTargetCollection(deleteTarget)}</code> will also be removed.
              </>
            )}
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
