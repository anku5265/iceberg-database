import { useEffect } from 'react'

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && open && !loading) {
        onClose?.()
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, loading, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={!loading ? onClose : undefined} />

      <div className="relative w-full max-w-md pc-card shadow-2xl overflow-hidden p-6 z-10">
        <div className="flex items-start gap-3.5">
          <div className={`w-9 h-9 rounded-[2px] flex items-center justify-center shrink-0 ${
            variant === 'danger'
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20'
          }`}>
            {variant === 'danger' ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-semibold text-[var(--text-primary)] leading-6 mb-1">
              {title}
            </h3>
            <div className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
              {message}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="pc-btn-secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-3.5 py-2 text-[14px] font-medium text-white rounded-[2px] transition disabled:opacity-50 flex items-center gap-1.5 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500'
                : 'pc-btn-primary'
            }`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
