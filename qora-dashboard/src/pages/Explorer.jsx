import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function Explorer() {
  const [searchParams] = useSearchParams()
  const [collections, setCollections] = useState([])
  const [collection, setCollection] = useState(searchParams.get('collection') || '')
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('hybrid')
  const [alpha, setAlpha] = useState(0.5)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('search')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [indexing, setIndexing] = useState(false)
  const [indexResult, setIndexResult] = useState(null)

  useEffect(() => { api.getCollections().then(d => setCollections(d.collections || [])) }, [])

  const search = async (e) => {
    e.preventDefault()
    if (!query.trim() || !collection) return
    setLoading(true); setResults(null)
    const res = await api.search(collection, query, 5, searchType, alpha)
    setResults(res); setLoading(false)
  }

  const indexText = async (e) => {
    e.preventDefault()
    if (!text.trim() || !collection) return
    setIndexing(true); setIndexResult(null)
    const res = await api.indexText(collection, text)
    setIndexResult(res); setIndexing(false); setText('')
  }

  const uploadFile = async (e) => {
    e.preventDefault()
    if (!file || !collection) return
    setIndexing(true); setIndexResult(null)
    const res = await api.uploadFile(collection, file)
    setIndexResult(res); setIndexing(false); setFile(null)
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Explorer</h1>
          <p className="text-[#555] text-sm mt-0.5">Search, index, and explore your vectors</p>
        </div>
        {/* Collection selector */}
        <div className="flex items-center gap-2">
          <label className="text-[#444] text-xs font-medium">Collection</label>
          <select value={collection} onChange={e => setCollection(e.target.value)}
            className="bg-[#111] border border-[#1e1e1e] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 min-w-44">
            <option value="">Select collection</option>
            {collections.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {!collection && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-amber-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
          </svg>
          <p className="text-amber-400 text-sm">Select a collection to get started</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111] border border-[#1e1e1e] rounded-xl p-1 w-fit">
        {[['search','Search'],['text','Index Text'],['upload','Upload File']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === val ? 'bg-[#1e1e1e] text-white shadow-sm' : 'text-[#555] hover:text-[#aaa]'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Search tab */}
      {tab === 'search' && (
        <div>
          <form onSubmit={search} className="space-y-3 mb-6">
            <div className="flex gap-3">
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Type your search query..."
                className="flex-1 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#333]" />
              <button type="submit" disabled={loading || !collection || !query.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-6 py-3 rounded-xl transition">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search type + alpha */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-lg p-1">
                {[['hybrid','Hybrid'],['semantic','Semantic'],['keyword','Keyword']].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setSearchType(val)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${searchType === val ? 'bg-[#1e1e1e] text-white' : 'text-[#555] hover:text-[#aaa]'}`}>
                    {label}
                  </button>
                ))}
              </div>
              {searchType === 'hybrid' && (
                <div className="flex items-center gap-3 text-xs text-[#444]">
                  <span>Keyword</span>
                  <input type="range" min="0" max="1" step="0.1" value={alpha}
                    onChange={e => setAlpha(parseFloat(e.target.value))}
                    className="w-24 accent-blue-500" />
                  <span>Semantic</span>
                  <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{alpha}</span>
                </div>
              )}
            </div>
          </form>

          {loading && (
            <div className="flex items-center gap-3 text-[#555] text-sm py-8 justify-center">
              <div className="w-4 h-4 border-2 border-[#333] border-t-blue-500 rounded-full animate-spin"/>
              Searching...
            </div>
          )}

          {results && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-[#444] font-semibold uppercase tracking-wider">{results.results?.length || 0} results</span>
                <div className="flex-1 h-px bg-[#1a1a1a]"/>
                <span className="text-xs text-[#333]">"{results.query}"</span>
              </div>
              {results.results?.length === 0 ? (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-12 text-center">
                  <p className="text-[#555] text-sm">No results — try indexing some content first</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.results?.map((r, i) => (
                    <div key={i} className="bg-[#111] border border-[#1e1e1e] hover:border-[#272727] rounded-xl p-4 transition">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[#333] text-xs font-mono">#{i + 1}</span>
                        <div className="flex items-center gap-2">
                          {r.metadata?.source && (
                            <span className="text-xs text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded-full border border-[#252525]">{r.metadata.source}</span>
                          )}
                          <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border
                            ${r.score > 0.7 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                            : r.score > 0.5 ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                            : 'text-[#555] border-[#252525] bg-[#1a1a1a]'}`}>
                            {(r.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-[#bbb] text-sm leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Index text tab */}
      {tab === 'text' && (
        <form onSubmit={indexText}>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste your text here to index it into the selected collection..."
            rows={8}
            className="w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#333] resize-none mb-3 leading-relaxed" />
          {indexResult && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm mb-3">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Indexed {indexResult.chunks_indexed} chunk{indexResult.chunks_indexed !== 1 ? 's' : ''}
            </div>
          )}
          <button type="submit" disabled={indexing || !collection || !text.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition">
            {indexing ? 'Indexing...' : 'Index Text'}
          </button>
        </form>
      )}

      {/* Upload file tab */}
      {tab === 'upload' && (
        <form onSubmit={uploadFile}>
          <div onClick={() => document.getElementById('fileInput').click()}
            className="border-2 border-dashed border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl p-16 text-center mb-3 transition cursor-pointer group">
            <input id="fileInput" type="file" accept=".pdf,.txt,.md" className="hidden"
              onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-blue-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                  </svg>
                </div>
                <p className="text-white text-sm font-medium">{file.name}</p>
                <p className="text-[#444] text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#222] transition">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-[#555]">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="text-[#666] text-sm">Drop a file or click to browse</p>
                <p className="text-[#333] text-xs mt-1">PDF, TXT, MD</p>
              </div>
            )}
          </div>
          {indexResult && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm mb-3">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Indexed {indexResult.chunks_indexed} chunks from {indexResult.filename}
            </div>
          )}
          <button type="submit" disabled={indexing || !file || !collection}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition">
            {indexing ? 'Uploading...' : 'Upload & Index'}
          </button>
        </form>
      )}
    </div>
  )
}
