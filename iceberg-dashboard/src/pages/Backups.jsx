import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import ConfirmModal from '../components/ConfirmModal'

export default function Backups() {
  const navigate = useNavigate()
  const [backups, setBackups] = useState([])
  const [collections, setCollections] = useState(() => api.getCachedCollections())
  const [showCreate, setShowCreate] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(() => api.getCachedCollections()[0] || '')
  const [backupLabel, setBackupLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [restoringId, setRestoringId] = useState(null)
  const [statusBanner, setStatusBanner] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [actionMenuId, setActionMenuId] = useState(null)

  const loadData = async () => {
    try {
      const [colRes, bkRes] = await Promise.all([
        api.getCollections().catch(() => ({ collections: api.getCachedCollections() })),
        api.getBackups().catch(() => ({ backups: [] })),
      ])
      const cols = colRes?.collections || []
      setCollections(cols)
      if (!selectedCollection && cols.length > 0) {
        setSelectedCollection(cols[0])
      }
      setBackups(bkRes?.backups || [])
    } catch (e) {
      console.error('Error loading backups:', e)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(loadData, 4500)
    const onFocus = () => loadData()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Close row actions menu on outside click
  useEffect(() => {
    if (!actionMenuId) return
    const handleClickOutside = () => setActionMenuId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [actionMenuId])

  const handleCreateBackup = async (e) => {
    e.preventDefault()
    const targetCol = selectedCollection || collections[0]
    if (!targetCol) return
    setLoading(true)
    setStatusBanner(null)
    try {
      const created = await api.createBackup(targetCol, backupLabel)
      setBackupLabel('')
      setShowCreate(false)
      setStatusBanner({
        type: 'success',
        text: `Snapshot backup "${created.label || created.backup_id}" created for index "${targetCol}" (${created.points_backed_up} vectors).`,
      })
      await loadData()
      setTimeout(() => setStatusBanner(null), 5000)
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err?.message || 'Failed to create snapshot backup.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (bk) => {
    if (!bk || restoringId) return
    setRestoringId(bk.backup_id)
    setStatusBanner(null)
    try {
      const res = await api.restoreBackup(bk.collection, bk)
      if (res?.restored) {
        setStatusBanner({
          type: 'success',
          text: `Restored index "${bk.collection}" (${res.points_restored ?? bk.points_backed_up} vectors) from snapshot "${bk.label || bk.backup_id}".`,
        })
      } else {
        setStatusBanner({
          type: 'error',
          text: res?.detail || 'Failed to restore snapshot backup.',
        })
      }
      await loadData()
      setTimeout(() => setStatusBanner(null), 5000)
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err?.message || 'Failed to restore snapshot backup.',
      })
    } finally {
      setRestoringId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.deleteBackup(deleteTarget.backup_id)
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (ts) => {
    if (!ts) return 'Just now'
    try {
      const d = new Date(ts * 1000)
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
    } catch {
      return 'Recently'
    }
  }

  return (
    <div
      className="pt-[46px] pb-12 px-6 sm:px-[49px] max-w-[1090px] text-white"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ── Top Header Row: "Backups" on Left, "Create backup" Blue Button on Right (Exact Pinecone Match) ── */}
      <div className="flex items-center justify-between gap-4 mb-[24px]">
        <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
          Backups
        </h1>

        <button
          type="button"
          onClick={() => {
            if (!selectedCollection && collections.length > 0) {
              setSelectedCollection(collections[0])
            }
            setShowCreate(true)
          }}
          className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold inline-flex items-center justify-center transition cursor-pointer"
        >
          Create backup
        </button>
      </div>

      {/* ── Status Feedback Banner ── */}
      {statusBanner && (
        <div
          className={`mb-5 px-4 py-3 rounded-[2px] border text-[13px] font-medium flex items-center justify-between ${
            statusBanner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-red-500/10 border-red-500/25 text-red-400'
          }`}
        >
          <span>{statusBanner.text}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-[13px] opacity-75 hover:opacity-100 ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Pinecone Backups Table (#1c1c1c surface, #343434 border, 55px header, 64px rows) ── */}
      <div className="border border-[#343434] rounded-[2px] bg-[#1c1c1c] overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-[55px] border-b border-[#343434] text-[13px] font-bold text-white">
              <th className="pl-[16px] pr-4 font-bold">Name</th>
              <th className="px-4 font-bold w-[190px]">Source index</th>
              <th className="px-4 font-bold w-[115px]">Records</th>
              <th className="px-4 font-bold w-[160px]">Cloud / Region</th>
              <th className="px-4 font-bold w-[130px]">Created</th>
              <th className="pl-4 pr-[16px] font-bold w-[86px] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#343434] text-[13px]">
            {backups.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 px-6 text-center">
                  <p className="text-[16px] font-semibold text-white">
                    No backups in this project
                  </p>
                  <p className="text-[13.5px] text-[#a0a0a0] mt-1.5 max-w-md mx-auto">
                    Create a point-in-time snapshot backup of any index to protect against accidental deletion or restore data anytime.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedCollection && collections.length > 0) {
                          setSelectedCollection(collections[0])
                        }
                        setShowCreate(true)
                      }}
                      className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold transition cursor-pointer"
                    >
                      Create backup
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              backups.map((bk) => {
                const isMenuOpen = actionMenuId === bk.backup_id
                return (
                  <tr
                    key={bk.backup_id}
                    className="h-[64px] hover:bg-[#222222] transition-colors"
                  >
                    {/* Name + Green Status Dot */}
                    <td className="pl-[16px] pr-4">
                      <div className="inline-flex items-center gap-[9px]">
                        <span className="text-white font-normal text-[13.5px]">
                          {bk.label || bk.backup_id}
                        </span>
                        <span
                          className="w-[8px] h-[8px] rounded-full bg-[#3fb950] shrink-0"
                          title="Ready"
                        />
                      </div>
                    </td>

                    {/* Source index */}
                    <td className="px-4">
                      <Link
                        to={`/explorer?collection=${encodeURIComponent(bk.collection)}`}
                        className="text-[#58a6ff] hover:underline"
                      >
                        {bk.collection}
                      </Link>
                    </td>

                    {/* Records */}
                    <td className="px-4 text-white tabular-nums">
                      {typeof bk.points_backed_up === 'number'
                        ? bk.points_backed_up.toLocaleString()
                        : bk.points_backed_up}
                    </td>

                    {/* Cloud / Region */}
                    <td className="px-4 text-white whitespace-nowrap">AWS / ap-south-1</td>

                    {/* Created */}
                    <td className="px-4 text-white tabular-nums">
                      {formatDate(bk.created_at)}
                    </td>

                    {/* Actions (•••) */}
                    <td className="pl-4 pr-[16px] text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActionMenuId((prev) => (prev === bk.backup_id ? null : bk.backup_id))
                        }}
                        className="w-[30px] h-[30px] rounded-[2px] hover:bg-[#2d2d2d] text-white inline-flex items-center justify-center transition cursor-pointer"
                        title="Actions"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>

                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-[16px] top-[52px] z-30 w-[180px] rounded-[2px] border border-[#383838] bg-[#242424] shadow-xl py-1 text-left"
                        >
                          <button
                            type="button"
                            disabled={restoringId === bk.backup_id}
                            onClick={() => {
                              setActionMenuId(null)
                              handleRestore(bk)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-white hover:bg-[#303030] flex items-center justify-between transition cursor-pointer disabled:opacity-50"
                          >
                            <span>
                              {restoringId === bk.backup_id ? 'Restoring...' : 'Restore to index'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuId(null)
                              navigate(`/explorer?collection=${encodeURIComponent(bk.collection)}`)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-white hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>View source index</span>
                          </button>

                          <div className="my-1 border-t border-[#343434]" />

                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuId(null)
                              setDeleteTarget(bk)
                            }}
                            className="w-full px-3.5 py-2 text-[13px] text-[#f85149] hover:bg-[#303030] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>Delete backup</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Backup Modal (Pinecone Dark Modal Style) ── */}
      {showCreate && (
        <div
          onClick={() => setShowCreate(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-[2px] border border-[#343434] bg-[#1c1c1c] p-[32px] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-white tracking-tight">
                Create a backup
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-white hover:text-[#cccccc] transition p-1 cursor-pointer"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {collections.length === 0 ? (
              <div className="py-4 text-center space-y-4">
                <p className="text-[13.5px] text-[#a0a0a0]">
                  You don&apos;t have any active indexes to back up yet.
                </p>
                <Link
                  to="/collections"
                  className="h-[35px] px-[15px] rounded-[2px] bg-[#388bfd] hover:bg-[#4996ff] text-white text-[13px] font-semibold inline-flex items-center justify-center"
                >
                  Create an index first
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateBackup} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-white mb-2">
                    Source index
                  </label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[2px] border border-[#383838] bg-[#212121] text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                  >
                    {collections.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-white mb-2">
                    Backup name <span className="text-[#888888] font-normal">(optional)</span>
                  </label>
                  <input
                    value={backupLabel}
                    onChange={(e) => setBackupLabel(e.target.value)}
                    placeholder={`e.g. ${selectedCollection || 'index'}_snapshot_v1`}
                    className="w-full h-[38px] px-3 rounded-[2px] border border-[#383838] bg-[#212121] text-[13.5px] text-white placeholder:text-[#787878] focus:outline-none focus:border-[#388bfd]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !selectedCollection}
                    className="w-full h-[38px] rounded-[2px] bg-white hover:bg-[#e8e8e8] text-[#141414] text-[13.5px] font-semibold transition cursor-pointer"
                  >
                    {loading ? 'Creating backup...' : 'Create backup'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete backup?"
        message={
          deleteTarget
            ? `Are you sure you want to remove backup "${deleteTarget.label || deleteTarget.backup_id}" from your workspace?`
            : ''
        }
        confirmText={deleting ? 'Deleting...' : 'Delete backup'}
        danger
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  )
}
