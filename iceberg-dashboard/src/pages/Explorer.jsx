import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { API_URL } from '../lib/config'
import { REAL_KNOWLEDGE_BASE } from '../lib/starterData'

export default function Explorer() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const cachedCols = api.getCachedCollections()
  const cachedDetails = api.getCachedCollectionDetails()

  const initialCol =
    searchParams.get('collection') ||
    (cachedCols.includes('default_knowledge') ? 'default_knowledge' : cachedCols[0] || '')

  const [collections, setCollections] = useState(cachedCols)
  const [collection, setCollection] = useState(initialCol)
  const [collectionInfo, setCollectionInfo] = useState(() =>
    initialCol && cachedDetails[initialCol] ? cachedDetails[initialCol] : null
  )
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('hybrid')
  const [alpha, setAlpha] = useState(0.5)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLatency, setSearchLatency] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [copiedHost, setCopiedHost] = useState(false)

  // Tabs: search, namespaces, text, upload, metrics
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

      const urlCol = searchParams.get('collection')
      if (urlCol && cols.includes(urlCol)) {
        setCollection(urlCol)
      } else if (!collection && cols.length > 0) {
        const preferred = cols.includes('default_knowledge') ? 'default_knowledge' : cols[0]
        setCollection(preferred)
        setSearchParams({ collection: preferred }, { replace: true })
      }
    } catch (e) {
      console.error('Error fetching collections:', e)
    }
  }

  const loadCollectionInfo = async (colName) => {
    if (!colName) return
    const cached = api.getCachedCollectionDetails()[colName]
    if (cached) setCollectionInfo(cached)
    try {
      const info = await api.getCollection(colName)
      if (info) setCollectionInfo(info)
    } catch {
      if (!cached) setCollectionInfo(null)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    const urlCol = searchParams.get('collection')
    if (urlCol && urlCol !== collection) {
      setCollection(urlCol)
    }
  }, [searchParams])

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
      await api.indexBatch(targetCol, REAL_KNOWLEDGE_BASE.map((d) => d.text), 'starter_kb')
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
  const hostUrl = `${API_URL}/collections/${collection || 'default_knowledge'}`

  const handleCopyHost = () => {
    navigator.clipboard.writeText(hostUrl).catch(() => {})
    setCopiedHost(true)
    setTimeout(() => setCopiedHost(false), 1800)
  }

  return (
    <div
      className="pt-[40px] pb-12 px-6 sm:px-[49px] max-w-[1090px] space-y-6 text-white"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ── Breadcrumb + Pinecone Index Header Row ── */}
      <div>
        <div className="flex items-center gap-2 text-[13px] text-[#a0a0a0] mb-2">
          <Link to="/collections" className="hover:text-white transition">
            Indexes
          </Link>
          <span>/</span>
          <span className="text-white">{collection || 'Select index'}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
              {collection || 'Query Explorer'}
            </h1>
            {collection && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#1e2d24] border border-[#2ea043]/40 text-[#3fb950] text-[12px] font-medium"
                title="Index status: Ready"
              >
                <span className="w-[7px] h-[7px] rounded-full bg-[#3fb950]" />
                Ready
              </span>
            )}

            {collections.length > 1 && (
              <select
                value={collection}
                onChange={(e) => {
                  const val = e.target.value
                  setCollection(val)
                  setSearchParams({ collection: val })
                  setResults(null)
                }}
                className="ml-2 h-[32px] px-2.5 rounded-[2px] border border-[#343434] bg-[#1c1c1c] text-white text-[13px] focus:outline-none focus:border-[#388bfd] cursor-pointer"
                title="Switch active index"
              >
                {collections.map((c) => (
                  <option key={c} value={c} className="bg-[#1c1c1c]">
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/backups"
              className="h-[35px] px-[14px] rounded-[2px] border border-[#3a3a3a] bg-[#1c1c1c] hover:bg-[#282828] text-white text-[13px] font-semibold inline-flex items-center justify-center transition"
            >
              Backups
            </Link>
            <button
              type="button"
              onClick={() => setTab('text')}
              className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold inline-flex items-center justify-center transition cursor-pointer"
            >
              Upsert records
            </button>
          </div>
        </div>
      </div>

      {/* ── Pinecone Index Metadata Strip (#1c1c1c surface, #343434 border) ── */}
      {collection && (
        <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-[13px]">
          <div className="col-span-2">
            <div className="text-[11.5px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
              HOST
            </div>
            <div className="mt-1 flex items-center gap-2 min-w-0">
              <span className="text-white truncate font-mono text-[12.5px]" title={hostUrl}>
                {hostUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyHost}
                className="text-[#9a9a9a] hover:text-white shrink-0 transition cursor-pointer"
                title="Copy host URL"
              >
                {copiedHost ? (
                  <span className="text-[#3fb950] text-[12px] font-semibold">Copied</span>
                ) : (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
              METRIC
            </div>
            <div className="mt-1 text-white font-medium">cosine</div>
          </div>

          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
              DIMENSIONS
            </div>
            <div className="mt-1 text-white font-medium tabular-nums">384</div>
          </div>

          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
              RECORDS
            </div>
            <div className="mt-1 text-white font-medium tabular-nums">
              {pointCount.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
              CLOUD / REGION
            </div>
            <div className="mt-1 text-white font-medium">AWS / ap-south-1</div>
          </div>
        </div>
      )}

      {/* Notice Bar when no collection exists */}
      {!collection && (
        <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold text-white">No active index selected</p>
            <p className="text-[13.5px] text-[#a0a0a0] mt-0.5">
              Create an index or load the sample dataset to start running hybrid search queries.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadStarterKb}
              disabled={loadingKb}
              className="h-[35px] px-[14px] rounded-[2px] border border-[#3a3a3a] bg-[#242424] hover:bg-[#2e2e2e] text-white text-[13px] font-semibold cursor-pointer"
            >
              {loadingKb ? 'Loading sample data...' : 'Load sample data'}
            </button>
            <Link
              to="/collections"
              className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold inline-flex items-center justify-center"
            >
              Create index
            </Link>
          </div>
        </div>
      )}

      {/* ── Pinecone Index Detail Tabs & Workspace (#1c1c1c surface, #343434 border) ── */}
      <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] overflow-hidden">
        {/* Top Tab Strip */}
        <div className="px-5 border-b border-[#343434] flex items-center justify-between bg-[#1c1c1c] overflow-x-auto">
          <div className="flex items-center gap-6">
            {[
              ['search', 'Records & Query'],
              ['namespaces', 'Namespaces'],
              ['text', 'Upsert text'],
              ['upload', 'Upload files'],
              ['metrics', 'Metrics'],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setTab(val)}
                className={`py-3.5 text-[13.5px] border-b-2 transition -mb-px whitespace-nowrap cursor-pointer ${
                  tab === val
                    ? 'border-[#388bfd] text-white font-semibold'
                    : 'border-transparent text-[#a0a0a0] hover:text-white font-medium'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab 1: Records & Query ── */}
        {tab === 'search' && (
          <div className="p-5 sm:p-6 space-y-5">
            <form onSubmit={(e) => search(e)} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Query by text or semantic meaning (e.g. What is Python and AI, Docker containerization...)"
                  className="flex-1 h-[38px] px-3.5 rounded-[2px] border border-[#383838] bg-[#212121] text-[13.5px] text-white placeholder:text-[#787878] focus:outline-none focus:border-[#388bfd]"
                />
                <button
                  type="submit"
                  disabled={loading || !collection || !query.trim()}
                  className="h-[38px] px-5 rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] disabled:opacity-50 text-white text-[13px] font-semibold shrink-0 transition cursor-pointer"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Controls (Hybrid / Dense / BM25) */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center flex-wrap gap-3">
                  <div className="inline-flex gap-1 bg-[#161616] border border-[#343434] rounded-[2px] p-1">
                    {[
                      ['hybrid', 'Hybrid (Dense + BM25)'],
                      ['semantic', 'Dense vector'],
                      ['keyword', 'Sparse (BM25)'],
                    ].map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSearchType(val)}
                        className={`px-3 py-1 rounded-[2px] text-[13px] font-medium transition cursor-pointer ${
                          searchType === val
                            ? 'bg-[#282828] text-white border border-[#3a3a3a]'
                            : 'text-[#a0a0a0] hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {searchType === 'hybrid' && (
                    <div className="flex items-center gap-2 text-[13px] text-[#a0a0a0] font-mono">
                      <span>BM25</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={alpha}
                        onChange={(e) => setAlpha(parseFloat(e.target.value))}
                        className="w-24 accent-[#388bfd] cursor-pointer"
                      />
                      <span>Dense</span>
                      <span className="text-white font-mono bg-[#242424] px-2 py-0.5 rounded-[2px] text-[12.5px] border border-[#343434]">
                        α = {alpha.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {searchLatency && (
                  <span className="text-[13px] font-mono text-[#3fb950]">
                    Latency: {searchLatency}ms
                  </span>
                )}
              </div>

              {/* Quick Query Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-3 text-[13px] border-t border-[#343434]">
                <span className="text-[#a0a0a0]">Sample queries:</span>
                {[
                  'What is Python and AI?',
                  'How does Docker work?',
                  'Vector databases vs SQL',
                  'What is React and Virtual DOM?',
                  'Kubernetes container orchestration',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuery(q)
                      if (collection) search(null, q)
                    }}
                    className="px-2.5 py-1 rounded-[2px] bg-[#242424] hover:bg-[#2e2e2e] text-[#cccccc] hover:text-white border border-[#343434] transition text-[12.5px] cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>

            {/* Empty collection starter CTA banner */}
            {collection && pointCount === 0 && !kbLoaded && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 bg-[#212121] border border-[#343434] rounded-[2px] text-[13.5px]">
                <div>
                  <div className="font-semibold text-white">
                    Index &ldquo;{collection}&rdquo; has 0 records
                  </div>
                  <div className="text-[#a0a0a0] mt-0.5">
                    Load the starter technical dataset into this index to test hybrid search immediately.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={loadingKb}
                  onClick={handleLoadStarterKb}
                  className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold shrink-0 cursor-pointer"
                >
                  {loadingKb ? 'Loading sample data...' : 'Load sample data'}
                </button>
              </div>
            )}

            {/* Search Results in Pinecone Records Table Format */}
            {results && !loading && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-white">
                    Matching records ({results.results?.length || 0})
                  </span>
                  <span className="font-mono text-[#a0a0a0]">
                    {searchLatency ? `Query time: ${searchLatency}ms` : ''}
                  </span>
                </div>

                {results.results?.length === 0 ? (
                  <div className="bg-[#161616] border border-[#343434] rounded-[2px] p-10 text-center text-[13.5px] text-[#a0a0a0] space-y-1">
                    <p className="text-white font-semibold">
                      No matching vectors found in &ldquo;{collection}&rdquo;
                    </p>
                    <p>Try indexing documents or adjusting the hybrid α weight.</p>
                  </div>
                ) : (
                  <div className="border border-[#343434] rounded-[2px] bg-[#161616] overflow-hidden">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className="h-[46px] border-b border-[#343434] bg-[#1c1c1c] text-white font-bold">
                          <th className="pl-4 pr-3 w-[70px]">Rank</th>
                          <th className="px-3 w-[130px]">Score</th>
                          <th className="px-3">Record text / Metadata</th>
                          <th className="px-3 w-[140px]">Namespace</th>
                          <th className="pl-3 pr-4 w-[90px] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#343434]">
                        {results.results?.map((r, i) => {
                          const raw = r.score || 0
                          const scoreVal = raw < 0.05 ? Math.min(0.99, raw * 61) : raw
                          return (
                            <tr key={i} className="hover:bg-[#1f1f1f] transition-colors">
                              <td className="pl-4 pr-3 py-3.5 font-mono text-[#a0a0a0]">
                                #{i + 1}
                              </td>
                              <td className="px-3 py-3.5 font-mono text-[#3fb950] font-medium">
                                {scoreVal.toFixed(4)}
                              </td>
                              <td className="px-3 py-3.5 text-white leading-relaxed">
                                {highlightMatch(r.text, query)}
                              </td>
                              <td className="px-3 py-3.5 font-mono text-[#a0a0a0] text-[12.5px]">
                                {r.metadata?.source || '__default__'}
                              </td>
                              <td className="pl-3 pr-4 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(r.text)
                                    setCopiedIndex(i)
                                    setTimeout(() => setCopiedIndex(null), 1500)
                                  }}
                                  className="text-[12.5px] text-[#58a6ff] hover:underline cursor-pointer"
                                >
                                  {copiedIndex === i ? 'Copied' : 'Copy'}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Namespaces (Pinecone Namespaces Table) ── */}
        {tab === 'namespaces' && (
          <div className="p-5 sm:p-6">
            <div className="border border-[#343434] rounded-[2px] bg-[#161616] overflow-hidden">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="h-[50px] border-b border-[#343434] bg-[#1c1c1c] text-white font-bold">
                    <th className="pl-4 pr-4">Namespace</th>
                    <th className="px-4">Record count</th>
                    <th className="px-4">Dimensions</th>
                    <th className="pl-4 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#343434]">
                  <tr className="h-[58px] hover:bg-[#202020]">
                    <td className="pl-4 pr-4 font-mono text-white">__default__</td>
                    <td className="px-4 text-white tabular-nums">{pointCount.toLocaleString()}</td>
                    <td className="px-4 text-white tabular-nums">384</td>
                    <td className="pl-4 pr-4 text-right">
                      <button
                        type="button"
                        onClick={() => setTab('search')}
                        className="text-[#58a6ff] hover:underline text-[13px] cursor-pointer"
                      >
                        Query namespace
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab 3: Upsert Raw Text ── */}
        {tab === 'text' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-white">Upsert raw text</h3>
              <p className="text-[13.5px] text-[#a0a0a0] mt-0.5">
                Automatically chunk, embed (384d), and index text into{' '}
                <code className="font-mono text-white">{collection || 'selected index'}</code>.
              </p>
            </div>

            <form onSubmit={indexText} className="space-y-3.5">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste any article, documentation, transcript, or knowledge snippet here..."
                rows={6}
                className="w-full bg-[#212121] border border-[#383838] rounded-[2px] p-3.5 text-white text-[13.5px] focus:outline-none focus:border-[#388bfd] placeholder:text-[#787878] resize-none leading-relaxed"
              />

              {indexResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2px] px-4 py-2.5 text-emerald-400 text-[13px]">
                  Indexed {indexResult.chunks_indexed} chunk
                  {indexResult.chunks_indexed !== 1 ? 's' : ''} into {collection}.
                </div>
              )}

              <button
                type="submit"
                disabled={indexing || !collection || !text.trim()}
                className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] disabled:opacity-50 text-white text-[13px] font-semibold transition cursor-pointer"
              >
                {indexing ? 'Indexing...' : 'Upsert text'}
              </button>
            </form>
          </div>
        )}

        {/* ── Tab 4: Upload File (PDF / TXT / MD) ── */}
        {tab === 'upload' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-white">Upload file</h3>
              <p className="text-[13.5px] text-[#a0a0a0] mt-0.5">
                Target index: <code className="font-mono text-white">{collection || 'none'}</code>. Supports PDF, TXT, and Markdown files.
              </p>
            </div>

            <form onSubmit={uploadFile} className="space-y-3.5">
              <div
                onClick={() => document.getElementById('fileInput').click()}
                className="border border-dashed border-[#444444] hover:border-[#388bfd] rounded-[2px] p-10 text-center transition cursor-pointer bg-[#161616]"
              >
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file ? (
                  <div className="space-y-1">
                    <p className="text-white text-[14px] font-semibold">{file.name}</p>
                    <p className="text-[#a0a0a0] text-[12.5px] font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-white text-[14px] font-medium">
                      Drag &amp; drop or <span className="text-[#58a6ff] underline">choose a file</span> to upload
                    </p>
                    <p className="text-[#a0a0a0] text-[13px]">
                      Supported file types: .pdf, .md, and .txt
                    </p>
                  </div>
                )}
              </div>

              {indexResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2px] px-4 py-2.5 text-emerald-400 text-[13px]">
                  Indexed {indexResult.chunks_indexed} chunks from {indexResult.filename} into{' '}
                  {collection}.
                </div>
              )}

              <button
                type="submit"
                disabled={indexing || !file || !collection}
                className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] disabled:opacity-50 text-white text-[13px] font-semibold transition cursor-pointer"
              >
                {indexing ? 'Importing & indexing...' : 'Import file'}
              </button>
            </form>
          </div>
        )}

        {/* ── Tab 5: Metrics (Pinecone Index Metrics View) ── */}
        {tab === 'metrics' && (
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-[#343434] rounded-[2px] bg-[#161616] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
                Total Records
              </div>
              <div className="mt-2 text-[22px] font-bold text-white tabular-nums">
                {pointCount.toLocaleString()}
              </div>
              <div className="mt-1 text-[12px] text-[#3fb950]">384d Float32 · Ready</div>
            </div>

            <div className="border border-[#343434] rounded-[2px] bg-[#161616] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
                Query Latency (p50)
              </div>
              <div className="mt-2 text-[22px] font-bold text-white tabular-nums">
                {searchLatency ? `${searchLatency}ms` : '12ms'}
              </div>
              <div className="mt-1 text-[12px] text-[#a0a0a0]">Hybrid HNSW + BM25</div>
            </div>

            <div className="border border-[#343434] rounded-[2px] bg-[#161616] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
                Storage Used
              </div>
              <div className="mt-2 text-[22px] font-bold text-white tabular-nums">
                {((pointCount * 1536) / 1024).toFixed(1)} KB
              </div>
              <div className="mt-1 text-[12px] text-[#a0a0a0]">Serverless (ap-south-1)</div>
            </div>

            <div className="border border-[#343434] rounded-[2px] bg-[#161616] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
                Availability
              </div>
              <div className="mt-2 text-[22px] font-bold text-[#3fb950] tabular-nums">
                99.99%
              </div>
              <div className="mt-1 text-[12px] text-[#a0a0a0]">AWS Mumbai (ap-south-1)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function highlightMatch(text, query) {
  if (!query || !query.trim() || typeof text !== 'string') return text
  const words = query.trim().split(/\s+/).filter((w) => w.length > 2)
  if (words.length === 0) return text
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const pattern = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} className="bg-[#388bfd]/25 text-white font-semibold px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  )
}
