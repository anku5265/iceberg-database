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
  const [tab, setTab] = useState('search') // search | upload | text
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [indexing, setIndexing] = useState(false)
  const [indexResult, setIndexResult] = useState(null)

  useEffect(() => {
    api.getCollections().then(d => setCollections(d.collections || []))
  }, [])

  const search = async (e) => {
    e.preventDefault()
    if (!query.trim() || !collection) return
    setLoading(true)
    setResults(null)
    const res = await api.search(collection, query, 5, searchType, alpha)
    setResults(res)
    setLoading(false)
  }

  const indexText = async (e) => {
    e.preventDefault()
    if (!text.trim() || !collection) return
    setIndexing(true)
    setIndexResult(null)
    const res = await api.indexText(collection, text)
    setIndexResult(res)
    setIndexing(false)
    setText('')
  }

  const uploadFile = async (e) => {
    e.preventDefault()
    if (!file || !collection) return
    setIndexing(true)
    setIndexResult(null)
    const res = await api.uploadFile(collection, file)
    setIndexResult(res)
    setIndexing(false)
    setFile(null)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Explorer</h1>
        <p className="text-[#666] text-sm">Search, upload, and explore your vectors</p>
      </div>

      {/* Collection selector */}
      <div className="mb-6">
        <label className="text-[#888] text-xs mb-2 block">Collection</label>
        <select
          value={collection}
          onChange={e => setCollection(e.target.value)}
          className="bg-[#111] border border-[#222] text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-blue-600 min-w-48"
        >
          <option value="">Select collection</option>
          {collections.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111] border border-[#222] rounded-lg p-1 w-fit">
        {['search', 'text', 'upload'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition capitalize ${tab === t ? 'bg-[#1e1e1e] text-white' : 'text-[#666] hover:text-white'}`}>
            {t === 'search' ? 'Search' : t === 'text' ? 'Index Text' : 'Upload File'}
          </button>
        ))}
      </div>

      {/* Search tab */}
      {tab === 'search' && (
        <div>
          <form onSubmit={search} className="space-y-3 mb-6">
            <div className="flex gap-3">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search semantically..."
                className="flex-1 bg-[#111] border border-[#222] rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]"
              />
              <button type="submit" disabled={loading || !collection}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-md transition">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1 bg-[#111] border border-[#222] rounded-lg p-1">
                {[['hybrid','Hybrid'],['semantic','Semantic'],['keyword','Keyword']].map(([val,label]) => (
                  <button key={val} type="button" onClick={() => setSearchType(val)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${searchType === val ? 'bg-[#1e1e1e] text-white' : 'text-[#666] hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>
              {searchType === 'hybrid' && (
                <div className="flex items-center gap-2 text-xs text-[#666]">
                  <span>Keyword</span>
                  <input type="range" min="0" max="1" step="0.1" value={alpha}
                    onChange={e => setAlpha(parseFloat(e.target.value))}
                    className="w-24 accent-blue-500" />
                  <span>Semantic</span>
                  <span className="text-blue-400 font-mono ml-1">{alpha}</span>
                </div>
              )}
            </div>
          </form>

          {results && (
            <div>
              <div className="text-xs text-[#555] mb-3">{results.results?.length || 0} results for "{results.query}"</div>
              {results.results?.length === 0 ? (
                <div className="bg-[#111] border border-[#222] rounded-lg p-8 text-center text-[#555] text-sm">
                  No results found. Try indexing some content first.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.results?.map((r, i) => (
                    <div key={i} className="bg-[#111] border border-[#222] rounded-lg p-4 hover:border-[#333] transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-[#555] font-mono">#{i + 1}</span>
                        <div className="flex items-center gap-2">
                          {r.metadata?.source && (
                            <span className="text-xs text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#222]">
                              {r.metadata.source}
                            </span>
                          )}
                          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${r.score > 0.7 ? 'text-green-400 border-green-900 bg-green-900/20' : r.score > 0.5 ? 'text-yellow-400 border-yellow-900 bg-yellow-900/20' : 'text-[#666] border-[#222]'}`}>
                            {(r.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-[#ccc] text-sm leading-relaxed">{r.text}</p>
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
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your text here to index it."
            rows={8}
            className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444] resize-none mb-3"
          />
          {indexResult && (
            <div className="bg-green-900/20 border border-green-900 rounded-md px-4 py-2 text-green-400 text-sm mb-3">
              ✓ Indexed {indexResult.chunks_indexed} chunk{indexResult.chunks_indexed !== 1 ? 's' : ''}
            </div>
          )}
          <button type="submit" disabled={indexing || !collection}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-md transition">
            {indexing ? 'Indexing...' : 'Index Text'}
          </button>
        </form>
      )}

      {/* Upload file tab */}
      {tab === 'upload' && (
        <form onSubmit={uploadFile}>
          <div
            className="border-2 border-dashed border-[#222] hover:border-[#333] rounded-lg p-12 text-center mb-3 transition cursor-pointer"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input id="fileInput" type="file" accept=".pdf,.txt,.md" className="hidden"
              onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div>
                <p className="text-white text-sm font-medium">{file.name}</p>
                <p className="text-[#555] text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-[#666] text-sm">Drop a file or click to browse</p>
                <p className="text-[#444] text-xs mt-1">PDF, TXT, MD supported</p>
              </div>
            )}
          </div>
          {indexResult && (
            <div className="bg-green-900/20 border border-green-900 rounded-md px-4 py-2 text-green-400 text-sm mb-3">
              ✓ Indexed {indexResult.chunks_indexed} chunks from {indexResult.filename}
            </div>
          )}
          <button type="submit" disabled={indexing || !file || !collection}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-md transition">
            {indexing ? 'Uploading...' : 'Upload & Index'}
          </button>
        </form>
      )}
    </div>
  )
}
