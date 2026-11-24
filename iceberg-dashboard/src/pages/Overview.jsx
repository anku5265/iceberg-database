import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

function InfoCircleIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.85" />
      <rect x="9" y="5.4" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="9" y="9" width="2" height="5.6" rx="0.4" fill="currentColor" />
    </svg>
  )
}

export default function Overview() {
  const [assistants, setAssistants] = useState(() => api.getCachedAssistants())
  const [collections, setCollections] = useState(() => api.getCachedCollections())
  const [vectorCount, setVectorCount] = useState(() => {
    const details = api.getCachedCollectionDetails()
    return Object.values(details).reduce((sum, info) => sum + (info?.vector_count || 0), 0)
  })
  const [queryCount, setQueryCount] = useState(0)

  useEffect(() => {
    let mounted = true

    const syncOverviewData = async () => {
      try {
        const [asstRes, colRes, statsRes] = await Promise.all([
          api.getAssistants().catch(() => ({ assistants: api.getCachedAssistants() })),
          api.getCollections().catch(() => ({ collections: api.getCachedCollections() })),
          api.getStats().catch(() => null),
        ])
        if (!mounted) return
        if (Array.isArray(asstRes?.assistants)) {
          setAssistants(asstRes.assistants)
        }
        const cols = colRes?.collections || []
        setCollections(cols)
        if (statsRes) {
          setQueryCount(statsRes.searches_today ?? 0)
        }
        if (cols.length > 0) {
          let totalVecs = 0
          await Promise.all(
            cols.map(async (c) => {
              try {
                const info = await api.getCollection(c)
                totalVecs += info?.vector_count || 0
              } catch {}
            })
          )
          if (mounted) setVectorCount(totalVecs)
        } else {
          setVectorCount(0)
        }
      } catch {}
    }

    syncOverviewData()
    const onAsstUpdate = () => {
      setAssistants(api.getCachedAssistants())
      syncOverviewData()
    }
    const onColsUpdate = () => {
      setCollections(api.getCachedCollections())
    }
    window.addEventListener('iceberg-assistants-updated', onAsstUpdate)
    window.addEventListener('iceberg-collections-updated', onColsUpdate)
    const timer = setInterval(syncOverviewData, 5000)
    return () => {
      mounted = false
      window.removeEventListener('iceberg-assistants-updated', onAsstUpdate)
      window.removeEventListener('iceberg-collections-updated', onColsUpdate)
      clearInterval(timer)
    }
  }, [])

  const rawStorageGb = (vectorCount * 1536) / (1024 * 1024 * 1024)
  const displayStorage = rawStorageGb < 0.01 ? '0GB' : `${rawStorageGb.toFixed(2)}GB`
  const vecPct = Math.min(100, Math.round((vectorCount / 100000) * 100))
  const storagePct = Math.min(100, Math.round((rawStorageGb / 2) * 100))
  const queryPct = Math.min(100, Math.round((queryCount / 2000) * 100))

  const dbUsageRows = [
    { label: 'RUs', value: `${queryCount.toLocaleString()} / 1M`, pct: queryPct },
    { label: 'Storage', value: `${displayStorage} / 2GB`, pct: storagePct },
    { label: 'WUs', value: `${vectorCount.toLocaleString()} / 2M`, pct: vecPct },
  ]

  const assistantUsageRows = [
    { label: 'Storage', value: '0GB / 1GB', pct: 0 },
    { label: 'Input Tokens', value: '0 / 1M', pct: 0 },
    { label: 'Output Tokens', value: '0 / 300K', pct: 0 },
    { label: 'Context Tokens', value: '0 / 500K', pct: 0 },
    { label: 'Ingestion Units', value: '0 / 1K', pct: 0 },
  ]

  return (
    <div className="pt-[46px] pb-12 px-6 sm:px-[49px] max-w-[1090px] space-y-8">
      {/* ── Top Header Row: "Project overview" + borderless "+ API key" button ── */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
          Project overview
        </h1>

        <Link
          to="/apikeys"
          className="px-3 py-1.5 rounded-[2px] hover:bg-[#242424] text-white text-[13.5px] font-semibold inline-flex items-center gap-2 transition"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>API key</span>
        </Link>
      </div>

      {/* ── 2 Main Cards: Database & Assistant (Exact Dynamic State Matching Pinecone Screenshots 1 & 5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Card 1: Database */}
        {collections.length === 0 ? (
          <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-7 flex flex-col justify-between min-h-[238px]">
            <div>
              <div className="flex items-center gap-3 text-white">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-white shrink-0">
                  <rect x="3" y="4" width="18" height="7" rx="1.5" />
                  <rect x="3" y="13" width="18" height="7" rx="1.5" />
                  <line x1="7" y1="7.5" x2="7.01" y2="7.5" strokeWidth="2.4" strokeLinecap="round" />
                  <line x1="7" y1="16.5" x2="7.01" y2="16.5" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                <h2 className="text-[17px] font-bold tracking-tight">Database</h2>
              </div>

              <p className="text-[14px] text-white leading-[1.6] mt-4">
                Store and search vector embeddings at scale. Best for building your own custom search, RAG, or recommendation logic.
              </p>
            </div>

            <div className="mt-6">
              <Link to="/database/quickstart" className="pc-btn-primary">
                Load data
              </Link>
            </div>
          </div>
        ) : (
          <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-7">
            {/* Header with ↗ button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-white">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-white shrink-0">
                  <rect x="3" y="4" width="18" height="7" rx="1.5" />
                  <rect x="3" y="13" width="18" height="7" rx="1.5" />
                  <line x1="7" y1="7.5" x2="7.01" y2="7.5" strokeWidth="2.4" strokeLinecap="round" />
                  <line x1="7" y1="16.5" x2="7.01" y2="16.5" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                <h2 className="text-[17px] font-bold tracking-tight">Database</h2>
              </div>

              <Link
                to="/collections"
                className="w-[34px] h-[34px] rounded-[2px] border border-[#3a3a3a] bg-[#1c1c1c] hover:bg-[#2a2a2a] flex items-center justify-center text-white transition"
                title="View indexes"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </Link>
            </div>

            {/* Active Indexes List */}
            <div className="mt-4 divide-y divide-[#343434] border-b border-[#343434]">
              {collections.slice(0, 4).map((colName) => (
                <Link
                  key={colName}
                  to={`/explorer?collection=${encodeURIComponent(colName)}`}
                  className="py-3 flex items-center justify-between text-[14.5px] font-normal text-white hover:text-[#58a6ff] transition group"
                >
                  <span className="truncate pr-3">{colName}</span>
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                    className="text-white group-hover:text-[#58a6ff] shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Database Usage Quota Bars */}
            <div className="mt-5 space-y-4">
              {dbUsageRows.map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-2 text-[13.5px]">
                    <span className="text-white font-bold inline-flex items-center gap-1.5">
                      <span>{row.label}</span>
                      <span className="text-[#cccccc]">
                        <InfoCircleIcon size={14} />
                      </span>
                    </span>
                    <span className="font-bold text-white tabular-nums">{row.value}</span>
                  </div>
                  <div className="h-[4px] w-full rounded-[1px] bg-[#282828] overflow-hidden">
                    <div className="h-full bg-[#388bfd]" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card 2: Assistant (Exact Match to Screenshot 1 when empty & Screenshot 5 when assistant exists!) */}
        {assistants.length === 0 ? (
          <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-7 flex flex-col justify-between min-h-[238px]">
            <div>
              <div className="flex items-center gap-3 text-white">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-white shrink-0">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-4 12.75c.6.45 1 1.15 1 1.9V18h6v-1.35c0-.75.4-1.45 1-1.9A7 7 0 0 0 12 2z" />
                </svg>
                <h2 className="text-[17px] font-bold tracking-tight">Assistant</h2>
              </div>

              <p className="text-[14px] text-white leading-[1.6] mt-4">
                Upload files, get a working Q&amp;A chatbot in minutes. Best for grounded answers without building retrieval yourself.
              </p>
            </div>

            <div className="mt-6">
              <Link to="/assistants/quickstart" className="pc-btn-primary">
                Create assistant
              </Link>
            </div>
          </div>
        ) : (
          <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-7">
            {/* Header Row: Lightbulb + "Assistant" on left, square ↗ button on right (Exact Match to Screenshot 5) */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-white">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-white shrink-0">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-4 12.75c.6.45 1 1.15 1 1.9V18h6v-1.35c0-.75.4-1.45 1-1.9A7 7 0 0 0 12 2z" />
                </svg>
                <h2 className="text-[17px] font-bold tracking-tight">Assistant</h2>
              </div>

              <Link
                to="/assistants"
                className="w-[34px] h-[34px] rounded-[2px] border border-[#3a3a3a] bg-[#1c1c1c] hover:bg-[#2a2a2a] flex items-center justify-center text-white transition"
                title="View assistants"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </Link>
            </div>

            {/* Created Assistants List (e.g. "ankush >" with bottom border) */}
            <div className="mt-4 divide-y divide-[#343434] border-b border-[#343434]">
              {assistants.map((asst) => (
                <Link
                  key={asst.id || asst.name}
                  to={`/assistants?assistant=${encodeURIComponent(asst.name)}`}
                  className="py-3 flex items-center justify-between text-[14.5px] font-normal text-white hover:text-[#58a6ff] transition group"
                >
                  <span className="truncate pr-3">{asst.name}</span>
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                    className="text-white group-hover:text-[#58a6ff] shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* 5 Assistant Usage Quota Bars (Exact Match to Screenshot 5) */}
            <div className="mt-5 space-y-4">
              {assistantUsageRows.map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-2 text-[13.5px]">
                    <span className="text-white font-bold inline-flex items-center gap-1.5">
                      <span>{row.label}</span>
                      <span className="text-[#cccccc]">
                        <InfoCircleIcon size={14} />
                      </span>
                    </span>
                    <span className="font-bold text-white tabular-nums">{row.value}</span>
                  </div>
                  <div className="h-[4px] w-full rounded-[1px] bg-[#282828] overflow-hidden">
                    <div className="h-full bg-[#388bfd]" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Resources Section (48x48 Icon Box + Text on Right) ── */}
      <div className="pt-2">
        <h2 className="text-[17px] font-bold tracking-tight text-white mb-5">
          Resources
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {/* Resource 1: API reference */}
          <Link to="/docs" className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-[4px] border border-[#343434] bg-[#1c1c1c] group-hover:border-[#4a4a4a] flex items-center justify-center text-[#58a6ff] shrink-0">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-white group-hover:text-[#58a6ff]">
                API reference
              </div>
              <p className="text-[13px] text-[#cccccc] mt-1 leading-relaxed">
                Get detailed info on API endpoints, examples and best practices.
              </p>
            </div>
          </Link>

          {/* Resource 2: Support Center */}
          <Link to="/settings" className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-[4px] border border-[#343434] bg-[#1c1c1c] group-hover:border-[#4a4a4a] flex items-center justify-center text-[#58a6ff] shrink-0">
              <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.95" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-white group-hover:text-[#58a6ff]">
                Support Center
              </div>
              <p className="text-[13px] text-[#cccccc] mt-1 leading-relaxed">
                Find answers and troubleshoot ideas.
              </p>
            </div>
          </Link>

          {/* Resource 3: Community Discord / Agent Memory */}
          <Link to="/memory" className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-[4px] border border-[#343434] bg-[#1c1c1c] group-hover:border-[#4a4a4a] flex items-center justify-center text-[#58a6ff] shrink-0">
              <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.95" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-white group-hover:text-[#58a6ff]">
                Community Discord
              </div>
              <p className="text-[13px] text-[#cccccc] mt-1 leading-relaxed">
                Join to ask questions, share insights, and collaborate with others.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
