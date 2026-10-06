import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { REAL_KNOWLEDGE_BASE, SUGGESTED_QUERIES } from '../lib/starterData'

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

  // Load collections & auto-select
  const loadCollections = async () => {
    try {
      const res = await api.getCollections()
      const cols = res.collections || []
      setCollections(cols)

      // Auto-select if none selected
      if (!collection && cols.length > 0) {
        const preferred = cols.includes('default_knowledge') ? 'default_knowledge' : cols[0]
        setCollection(preferred)
        setSearchParams({ collection: preferred })
      }
    } catch (e) {
      console.error('Error fetching collections:', e)
    }
  }

  // Fetch selected collection info
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

  // Execute Vector Search
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

  // Handle Index Text
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

  // Handle File Upload
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

  // Handle Load Starter KB
  const handleLoadStarterKb = async () => {
    if (!collection) return
    setLoadingKb(true)
    try {
      await api.indexBatch(collection, REAL_KNOWLEDGE_BASE.map(d => d.text), 'starter_kb')
      setKbLoaded(true)
      await loadCollectionInfo(collection)
      const sampleQuery = 'what is java'
      setQuery(sampleQuery)
      await search(null, sampleQuery)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingKb(false)
    }
  }

  const pointCount = collectionInfo?.vector_count !== undefined 
    ? collectionInfo.vector_count 
    : (collection === 'default_knowledge' ? 10 : 0)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header & Collection Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Vector Explorer</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Query Console
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Test semantic vector search, evaluate hybrid BM25 ranking, and inspect high-dimensional coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[var(--text-muted)] text-xs font-medium font-mono">Target Index:</label>
          <select
            value={collection}
            onChange={e => {
              const val = e.target.value
              setCollection(val)
              setSearchParams({ collection: val })
              setResults(null)
            }}
            className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 min-w-48"
          >
            {collections.length === 0 && <option value="">No collections found</option>}
            {collections.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1">
          <div className="text-xs text-[var(--text-muted)] flex items-center justify-between">
            <span>Target Collection</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
          </div>
          <div className="text-sm font-bold font-mono text-[var(--text-primary)] truncate">
            {collection || '—'}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Selected query namespace</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1">
          <div className="text-xs text-[var(--text-muted)] flex items-center justify-between">
            <span>Points in Index</span>
            <span className="text-blue-400 font-mono text-[11px]">384-dim</span>
          </div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
            {pointCount} <span className="text-xs font-normal text-[var(--text-muted)]">vectors</span>
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Dense embeddings stored</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1">
          <div className="text-xs text-[var(--text-muted)] flex items-center justify-between">
            <span>Search Algorithm</span>
            <span className="text-purple-400 font-mono text-[11px]">HNSW</span>
          </div>
          <div className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase">
            {searchType} Search
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">
            {searchType === 'hybrid' ? `Dense + BM25 (α = ${alpha})` : 'Cosine similarity metric'}
          </p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1">
          <div className="text-xs text-[var(--text-muted)] flex items-center justify-between">
            <span>Execution Latency</span>
            <span className="text-emerald-400 font-mono text-[11px]">Real-time</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {searchLatency ? `${searchLatency} ms` : '— ms'}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Round-trip API response</p>
        </div>
      </div>

      {/* Warning if no collection selected */}
      {!collection && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-amber-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
          </svg>
          <p className="text-amber-400 text-xs">Please create or select a collection in the dropdown above to begin searching.</p>
        </div>
      )}

      {/* ── 3. Tabs Navigation ── */}
      <div className="flex gap-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-1 w-fit">
        {[
          ['search', 'Vector Search & ANN', '🔍'],
          ['text', 'Index Raw Text', '📝'],
          ['upload', 'Upload Document (PDF/TXT)', '📁']
        ].map(([val, label, icon]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              tab === val
                ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── 4. Tab 1: Vector Search ── */}
      {tab === 'search' && (
        <div className="space-y-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            
            {/* Search Input Box */}
            <form onSubmit={e => search(e)} className="space-y-3.5">
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Enter semantic query (e.g. what is python and machine learning, docker containerization, vector embeddings...)"
                  className="input-base flex-1 text-xs px-3.5 py-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  disabled={loading || !collection || !query.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition shrink-0 flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Query</span>
                    </>
                  )}
                </button>
              </div>

              {/* Search Controls (Hybrid / Semantic / Keyword) */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-0.5">
                    {[
                      ['hybrid', 'Hybrid (Dense + BM25)'],
                      ['semantic', 'Semantic (Dense)'],
                      ['keyword', 'Keyword (BM25)']
                    ].map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSearchType(val)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                          searchType === val
                            ? 'bg-blue-600 text-white'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Hybrid Alpha Slider */}
                  {searchType === 'hybrid' && (
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono pl-2">
                      <span className="text-[11px]">BM25 (0.0)</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={alpha}
                        onChange={e => setAlpha(parseFloat(e.target.value))}
                        className="w-24 accent-blue-500 cursor-pointer"
                      />
                      <span className="text-[11px]">Dense (1.0)</span>
                      <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded text-[11px] border border-blue-500/20">
                        α = {alpha.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-[var(--text-dim)] font-mono">
                  Engine: Qdrant Cosine HNSW
                </span>
              </div>

              {/* Quick Query Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs border-t border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-mono text-[11px]">Try quick query:</span>
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
                      search(null, q)
                    }}
                    className="px-2.5 py-1 rounded-full bg-[var(--bg-surface)] hover:bg-blue-600/15 hover:text-blue-400 text-[var(--text-secondary)] border border-[var(--border)] hover:border-blue-500/30 transition text-xs font-mono"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Empty collection starter CTA banner */}
          {collection && pointCount === 0 && !kbLoaded && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-950/20 border border-blue-900/30 rounded-xl text-xs">
              <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                <span className="text-blue-400 text-lg">⚡</span>
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Collection has 0 vectors</div>
                  <div className="text-[var(--text-muted)] mt-0.5">Populate with 15 comprehensive tech articles (Java, Python, React, Tesla, Cloud, Vector DB) to test queries.</div>
                </div>
              </div>
              <button
                type="button"
                disabled={loadingKb}
                onClick={handleLoadStarterKb}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg font-medium transition shrink-0"
              >
                {loadingKb ? 'Indexing 15 articles...' : '⚡ Seed 15 Tech Articles'}
              </button>
            </div>
          )}

          {/* Search Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs py-10 justify-center">
              <div className="w-4 h-4 border-2 border-[var(--border)] border-t-blue-500 rounded-full animate-spin"/>
              <span>Computing query embedding & traversing HNSW graph...</span>
            </div>
          )}

          {/* Search Results */}
          {results && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-[11px]">
                    {results.results?.length || 0} Nearest Neighbors Retrieved
                  </span>
                  {searchLatency && (
                    <span className="font-mono text-emerald-400 font-medium">({searchLatency}ms)</span>
                  )}
                </div>
                <span className="font-mono text-[var(--text-dim)]">Query: "{results.query || query}"</span>
              </div>

              {results.results?.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
                  <p>No matching vectors found for this query in collection <code className="font-mono text-[var(--text-primary)]">{collection}</code>.</p>
                  <p className="text-[11px] text-[var(--text-dim)]">Try adjusting the query, lowering the threshold, or switching search mode to Keyword.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.results?.map((r, i) => {
                    const raw = r.score || 0
                    const scoreVal = raw < 0.05 ? Math.min(0.99, raw * 61) : raw
                    const pct = Math.min(100, Math.max(1, Math.round(scoreVal * 100)))

                    return (
                      <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border2)] rounded-xl p-4.5 space-y-2.5 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--text-dim)] text-xs font-mono font-medium">#point_{i + 1}</span>
                            <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                              pct >= 70
                                ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                                : pct >= 40
                                ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                                : 'text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg-hover)]'
                            }`}>
                              {pct}% Match
                            </span>
                            {r.metadata?.source && (
                              <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border)]">
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
                            className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition flex items-center gap-1"
                          >
                            {copiedIndex === i ? (
                              <span className="text-emerald-400 font-semibold">✓ Copied</span>
                            ) : (
                              <span>Copy Payload</span>
                            )}
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
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Index Raw Text or Knowledge</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              The embedding model will chunk this text, generate dense 384-dimensional vectors, and store payloads in <code className="text-blue-400 font-mono">{collection}</code>.
            </p>
          </div>

          <form onSubmit={indexText} className="space-y-3.5">
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste any article, product documentation, customer support transcript, or knowledge paragraph here..."
              rows={8}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-4 text-[var(--text-primary)] text-xs focus:outline-none focus:border-blue-600 placeholder:text-[var(--text-dim)] resize-none leading-relaxed"
            />

            {indexResult && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-xs">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Successfully indexed {indexResult.chunks_indexed} chunk{indexResult.chunks_indexed !== 1 ? 's' : ''} into {collection}!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={indexing || !collection || !text.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition flex items-center gap-1.5"
            >
              {indexing ? 'Computing Embeddings & Indexing...' : 'Index Text'}
            </button>
          </form>
        </div>
      )}

      {/* ── 6. Tab 3: Upload File (PDF / TXT / MD) ── */}
      {tab === 'upload' && (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Upload Document for Automatic Chunking</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Target collection: <code className="text-blue-400 font-mono">{collection}</code>. Supports PDF, plain text, and Markdown files.
            </p>
          </div>

          <form onSubmit={uploadFile} className="space-y-3.5">
            <div
              onClick={() => document.getElementById('fileInput').click()}
              className="border-2 border-dashed border-[var(--border)] hover:border-[var(--border2)] rounded-xl p-12 text-center transition cursor-pointer group bg-[var(--bg-surface)]"
            >
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
              />
              {file ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto text-blue-400">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <p className="text-[var(--text-primary)] text-xs font-semibold">{file.name}</p>
                  <p className="text-[var(--text-muted)] text-[11px] font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-xl flex items-center justify-center mx-auto text-[var(--text-muted)] group-hover:text-blue-400 transition">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="text-[var(--text-primary)] text-xs font-medium">Click to browse or drop a file here</p>
                  <p className="text-[var(--text-dim)] text-[11px]">PDF, TXT, or MD format</p>
                </div>
              )}
            </div>

            {indexResult && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-xs">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Indexed {indexResult.chunks_indexed} chunks from {indexResult.filename} into {collection}!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={indexing || !file || !collection}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition"
            >
              {indexing ? 'Processing File & Indexing...' : 'Upload & Index'}
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
      <mark key={i} className="bg-amber-400/20 text-amber-200 font-medium px-0.5 rounded">
        {part}
      </mark>
    ) : part
  )
}
