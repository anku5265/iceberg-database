import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/theme'
import { clearCrossDomainSessionCookie } from '../lib/api'

export default function ProfileMenu() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const logout = () => {
    clearCrossDomainSessionCookie()
    localStorage.removeItem('iceberg_api_key')
    localStorage.removeItem('iceberg_user')
    localStorage.removeItem('iceberg_project_id')
    localStorage.removeItem('iceberg_api_key_prefix')
    navigate('/login')
  }

  const emailPrefix = (user.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
  const initials = emailPrefix.length >= 2
    ? emailPrefix.slice(0, 2).toUpperCase()
    : (emailPrefix[0] || 'U').toUpperCase()

  const themes = [
    { key: 'dark', label: 'Dark', icon: <MoonIcon /> },
    { key: 'light', label: 'Light', icon: <SunIcon /> },
    { key: 'system', label: 'System', icon: <SystemIcon /> },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-[38px] h-[38px] rounded-full bg-[var(--avatar-bg)] hover:opacity-90 flex items-center justify-center text-[var(--avatar-text)] text-[14px] font-bold tracking-tight cursor-pointer"
        title={user.email || 'Account'}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--card-bg)] border border-[var(--border2)] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.55)] overflow-hidden z-[100]">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--avatar-bg)] flex items-center justify-center text-[var(--avatar-text)] text-[13px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[var(--text-primary)] text-[13.5px] font-semibold truncate">{user.email || 'Unknown'}</div>
                <div className="text-[var(--text-secondary)] text-[12px] mt-0.5">Starter Plan · ap-south-1</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1.5">
            <button onClick={() => { setOpen(false); navigate('/apikeys') }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13.5px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-left">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              API keys
            </button>
            <button onClick={() => { setOpen(false); navigate('/settings') }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13.5px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-left">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
            <button onClick={() => { setOpen(false); navigate('/docs') }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13.5px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-left">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Docs
            </button>
          </div>

          {/* Theme switcher */}
          <div className="px-4 py-3 border-t border-[var(--border)]">
            <div className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-wider mb-2">Theme</div>
            <div className="grid grid-cols-3 gap-1">
              {themes.map(t => (
                <button key={t.key} onClick={() => setTheme(t.key)}
                  className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-[4px] text-[13px] font-semibold cursor-pointer
                    ${theme === t.key
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div className="border-t border-[var(--border)] py-1.5">
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13.5px] font-medium text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--bg-hover)] text-left">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>

          <div className="px-4 py-2.5 border-t border-[var(--border)]">
            <div className="text-[var(--text-muted)] text-[12px]">v1.0.0</div>
          </div>
        </div>
      )}
    </div>
  )
}

function MoonIcon() {
  return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}
function SunIcon() {
  return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
}
function SystemIcon() {
  return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
}
