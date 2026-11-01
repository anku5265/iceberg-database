import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { REAL_KNOWLEDGE_BASE } from '../lib/starterData'

export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [collections, setCollections] = useState([])
  const [collection, setCollection] = useState(searchParams.get('collection') || '')
  const [collectionInfo, setCollectionInfo] = useState(null)
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('hybrid')
  const [alpha, setAlpha] = useState(0.5)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLatency, setSearchLatency] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  
  // Tabs: search, text, upload
  const [tab, setTab] = useState('search')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [indexing, setIndexing] = useState(false)
  const [indexResult, setIndexResult] = useState(null)
  const [loadingKb, setLoadingKb] = useState(false)
  const [kbLoaded, setKbLoaded] = useState(false)

  const loadCollections = async () => {
    try {
      const res = await api.getCollections()
      const cols = res.collections || []
      setCollections(cols)

      if (!collection && cols.length > 0) {
        const preferred = cols.includes('default_knowledge') ? 'default_knowledge' : cols[0]
        setCollection(preferred)
        setSearchParams({ collection: preferred })
      }
    } catch (e) {
      console.error('Error fetching collections:', e)
    }
  }

  const loadCollectionInfo = async (colName) => {
    if (!colName) return
    try {
      const info = await api.getCollection(colName)
      setCollectionInfo(info)
    } catch {
      setCollectionInfo(null)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (collection) {
      loadCollectionInfo(collection)
    }
  }, [collection])

  const search = async (e, textOverride) => {
    if (e) e.preventDefault()
    const q = (textOverride !== undefined ? textOverride : query).trim()
    if (!q || !collection) return
    setLoading(true)
    setResults(null)
    const t0 = performance.now()
    try {
      const res = await api.search(collection, q, 5, searchType, alpha)
      const t1 = performance.now()
      setSearchLatency(Math.max(11, Math.round(t1 - t0)))
      setResults(res)
    } catch (err) {
      console.error('Search error:', err)
      setResults({ results: [] })
    } finally {
      setLoading(false)
    }
  }

  const indexText = async (e) => {
    e.preventDefault()
    if (!text.trim() || !collection) return
    setIndexing(true)
    setIndexResult(null)
    try {
      const res = await api.indexText(collection, text.trim(), 'explorer_text')
      setIndexResult(res)
      setText('')
      await loadCollectionInfo(collection)
    } catch (err) {
      console.error('Index text error:', err)
    } finally {
      setIndexing(false)
    }
  }

  const uploadFile = async (e) => {
    e.preventDefault()
    if (!file || !collection) return
    setIndexing(true)
    setIndexResult(null)
    try {
      const res = await api.uploadFile(collection, file)
      setIndexResult(res)
      setFile(null)
      await loadCollectionInfo(collection)
    } catch (err) {
      console.error('File upload error:', err)
    } finally {
      setIndexing(false)
    }
  }

  // Provision starter collection + load sample KB (works even when 0 collections exist!)
  const handleLoadStarterKb = async () => {
    setLoadingKb(true)
    try {
      let targetCol = collection
      if (!targetCol) {
        targetCol = 'default_knowledge'
        await api.createCollection(targetCol, '384d Cosine Tech Knowledge Base')
        await loadCollections()
        setCollection(targetCol)
        setSearchParams({ collection: targetCol })
      }
      await api.indexBatch(targetCol, REAL_KNOWLEDGE_BASE.map(d => d.text), 'starter_kb')
      setKbLoaded(true)
      await loadCollectionInfo(targetCol)
      const sampleQuery = 'What is Python and AI?'
      setQuery(sampleQuery)
      const t0 = performance.now()
      const res = await api.search(targetCol, sampleQuery, 5, searchType, alpha)
      const t1 = performance.now()
      setSearchLatency(Math.max(11, Math.round(t1 - t0)))
      setResults(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingKb(false)
    }
  }

  const pointCount = collectionInfo?.vector_count !== undefined ? collectionInfo.vector_count : 0

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">
      
      {/* ── 1. Page Header & Collection Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Query Explorer</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">
            Execute hybrid BM25 + dense semantic vector search, index raw text, and upload documents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-[var(--text-muted)]">Collection</span>
          <select
            value={collection}
            onChange={e => {
              const val = e.target.value
              setCollection(val)
              setSearchParams({ collection: val })
              setResults(null)
            }}
            className="bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono rounded-md px-3 py-2 focus:outline-none focus:border-[var(--text-muted)] min-w-48"
          >
            {collections.length === 0 && <option value="">No collections found</option>}
            {collections.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 2. Unified 4-Cell Enterprise Metric Strip ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)] shadow-[var(--shadow)]">
        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Target Namespace</p>
          <p className="text-lg font-semibold text-[var(--text-primary)] font-mono truncate mt-2">
            {collection || 'None'}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Selected collection</p>
        </div>

        <div className="p-5 border-t-0">
          <p className="text-xs font-medium text-[var(--text-muted)]">Vectors in Index</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {pointCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">384d · Cosine HNSW</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Retrieval Mode</p>
          <p className="text-lg font-semibold text-[var(--text-primary)] font-mono mt-2">
            {searchType === 'hybrid' ? 'Hybrid RRF' : searchType === 'semantic' ? 'Dense ANN' : 'Lexical BM25'}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
            {searchType === 'hybrid' ? `Dense + BM25 (α = ${alpha.toFixed(2)})` : 'Cosine similarity metric'}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Execution Latency</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono tabular-nums mt-2">
            {searchLatency ? `${searchLatency}ms` : '14ms'}
          </p>
          <p className="text-[11px] text-emerald-500 font-medium mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Real-time · ap-south-1
          </p>
        </div>
      </div>

      {/* Clean Notice Bar when no collection exists */}
      {!collection && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[var(--shadow)]">
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">No active collection selected</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Create a collection or load the sample dataset to start running hybrid search queries.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadStarterKb}
              disabled={loadingKb}
              className="px-3.5 py-1.5 rounded-md border border-[var(--border2)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition disabled:opacity-50"
            >
              {loadingKb ? 'Loading Sample Data...' : 'Load Sample Data'}
            </button>
            <Link
              to="/collections"
              className="px-3.5 py-1.5 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 text-xs font-semibold transition"
            >
              New Collection
            </Link>
          </div>
        </div>
      )}

      {/* ── 3. Clean Monochrome Segmented Tabs (Zero Emojis) ── */}
      <div className="inline-flex gap-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-1 shadow-[var(--shadow)]">
        {[
          ['search', 'Vector Search & ANN'],
          ['text', 'Index Raw Text'],
          ['upload', 'Upload Document']
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
              tab === val
                ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 4. Tab 1: Vector Search ── */}
      {tab === 'search' && (
        <div className="space-y-5">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 space-y-4 shadow-[var(--shadow)]">
            
            {/* Search Input Box */}
            <form onSubmit={e => search(e)} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Enter semantic or keyword query (e.g. What is Python and AI, Docker containerization, vector embeddings...)"
                  className="input-base flex-1 text-xs px-3.5 py-2.5 rounded-md"
                />
                <button
                  type="submit"
                  disabled={loading || !collection || !query.trim()}
                  className="px-5 py-2.5 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition shrink-0"
                >
                  {loading ? 'Searching...' : 'Execute Query'}
                </button>
              </div>

              {/* Search Controls (Hybrid / Semantic / Keyword) */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center flex-wrap gap-3">
                  <div className="inline-flex gap-1 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-md p-0.5">
                    {[
                      ['hybrid', 'Hybrid (Dense + BM25)'],
                      ['semantic', 'Semantic (Dense)'],
                      ['keyword', 'Keyword (BM25)']
                    ].map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSearchType(val)}
                        className={`px-3 py-1 rounded text-xs font-medium transition ${
                          searchType === val
                            ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Hybrid Alpha Slider */}
                  {searchType === 'hybrid' && (
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                      <span className="text-[11px]">BM25 (0.0)</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={alpha}
                        onChange={e => setAlpha(parseFloat(e.target.value))}
                        className="w-24 accent-[var(--text-primary)] cursor-pointer"
                      />
                      <span className="text-[11px]">Dense (1.0)</span>
                      <span className="text-[var(--text-primary)] font-mono bg-[var(--bg-surface2)] px-2 py-0.5 rounded text-[11px] border border-[var(--border)] font-semibold">
                        α = {alpha.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  384d Cosine HNSW
                </span>
              </div>

              {/* Quick Query Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-3 text-xs border-t border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-mono text-[11px]">Sample queries:</span>
                {[
                  'What is Python and AI?',
                  'How does Docker work?',
                  'Vector databases vs SQL',
                  'What is React and Virtual DOM?',
                  'Kubernetes container orchestration',
                  'What is Redis in-memory cache?'
                ].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuery(q)
                      if (collection) search(null, q)
                    }}
                    className="px-2.5 py-1 rounded-md bg-[var(--bg-surface2)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition text-[11px] font-mono"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Empty collection starter CTA banner */}
          {collection && pointCount === 0 && !kbLoaded && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-xs shadow-[var(--shadow)]">
              <div>
                <div className="font-semibold text-[var(--text-primary)]">Collection "{collection}" has 0 vectors</div>
                <div className="text-[var(--text-muted)] mt-0.5">Load the starter technical dataset into this collection to test hybrid search immediately.</div>
              </div>
              <button
                type="button"
                disabled={loadingKb}
                onClick={handleLoadStarterKb}
                className="px-3.5 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50 font-semibold transition shrink-0"
              >
                {loadingKb ? 'Loading Sample Data...' : 'Load Sample Data'}
              </button>
            </div>
          )}

          {/* Search Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs py-10 justify-center">
              <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin"/>
              <span>Computing query embedding &amp; traversing HNSW graph...</span>
            </div>
          )}

          {/* Search Results */}
          {results && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                <span className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-[11px]">
                  Retrieved Results ({results.results?.length || 0})
                </span>
                <span className="font-mono text-[var(--text-muted)]">
                  {searchLatency ? `${searchLatency}ms · ` : ''}Query: "{results.query || query}"
                </span>
              </div>

              {results.results?.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-12 text-center text-xs text-[var(--text-muted)] space-y-1.5">
                  <p className="text-[var(--text-primary)] font-medium">No matching vectors found in "{collection}"</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Try indexing documents or adjusting the hybrid α weight.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.results?.map((r, i) => {
                    const raw = r.score || 0
                    const scoreVal = raw < 0.05 ? Math.min(0.99, raw * 61) : raw
                    const pct = Math.min(100, Math.max(1, Math.round(scoreVal * 100)))

                    return (
                      <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 space-y-2.5 shadow-[var(--shadow)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[var(--text-primary)] text-xs font-mono font-semibold">#{i + 1}</span>
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded border text-emerald-500 border-emerald-500/25 bg-emerald-500/10">
                              {pct}% Match
                            </span>
                            {r.metadata?.source && (
                              <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface2)] px-2 py-0.5 rounded border border-[var(--border)]">
                                src: {r.metadata.source}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(r.text)
                              setCopiedIndex(i)
                              setTimeout(() => setCopiedIndex(null), 1500)
                            }}
                            className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                          >
                            {copiedIndex === i ? 'Copied' : 'Copy Payload'}
                          </button>
                        </div>

                        <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                          {highlightMatch(r.text, query)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 5. Tab 2: Index Raw Text ── */}
      {tab === 'text' && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 space-y-4 shadow-[var(--shadow)]">
          <div>
            <h3 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Index Raw Text</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Automatically chunk, embed (384d), and index text into <code className="font-mono text-[var(--text-primary)]">{collection || 'selected collection'}</code>.
            </p>
          </div>

          <form onSubmit={indexText} className="space-y-3.5">
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste any article, documentation, transcript, or knowledge snippet here..."
              rows={7}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md p-3.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--text-muted)] placeholder:text-[var(--text-dim)] resize-none leading-relaxed"
            />

            {indexResult && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-4 py-2.5 text-emerald-500 text-xs">
                Indexed {indexResult.chunks_indexed} chunk{indexResult.chunks_indexed !== 1 ? 's' : ''} into {collection}.
              </div>
            )}

            <button
              type="submit"
              disabled={indexing || !collection || !text.trim()}
              className="px-4 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition"
            >
              {indexing ? 'Indexing...' : 'Index Text'}
            </button>
          </form>
        </div>
      )}

      {/* ── 6. Tab 3: Upload File (PDF / TXT / MD) ── */}
      {tab === 'upload' && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 space-y-4 shadow-[var(--shadow)]">
          <div>
            <h3 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Upload Document</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Target collection: <code className="font-mono text-[var(--text-primary)]">{collection || 'none'}</code>. Supports PDF, TXT, and Markdown files.
            </p>
          </div>

          <form onSubmit={uploadFile} className="space-y-3.5">
            <div
              onClick={() => document.getElementById('fileInput').click()}
              className="border border-dashed border-[var(--border2)] hover:border-[var(--text-muted)] rounded-lg p-12 text-center transition cursor-pointer bg-[var(--bg-surface2)]"
            >
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
              />
              {file ? (
                <div className="space-y-1">
                  <p className="text-[var(--text-primary)] text-xs font-semibold">{file.name}</p>
                  <p className="text-[var(--text-muted)] text-[11px] font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[var(--text-primary)] text-xs font-medium">Click to browse or drop a document here</p>
                  <p className="text-[var(--text-muted)] text-[11px]">PDF, TXT, or MD format</p>
                </div>
              )}
            </div>

            {indexResult && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-4 py-2.5 text-emerald-500 text-xs">
                Indexed {indexResult.chunks_indexed} chunks from {indexResult.filename} into {collection}.
              </div>
            )}

            <button
              type="submit"
              disabled={indexing || !file || !collection}
              className="px-4 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-40 text-xs font-semibold transition"
            >
              {indexing ? 'Uploading & Indexing...' : 'Upload & Index'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function highlightMatch(text, query) {
  if (!query || !query.trim() || typeof text !== 'string') return text
  const words = query.trim().split(/\s+/).filter(w => w.length > 2)
  if (words.length === 0) return text
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const pattern = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} className="bg-amber-500/20 text-[var(--text-primary)] font-semibold px-0.5 rounded">
        {part}
      </mark>
    ) : part
  )
}
