import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/theme'

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
    localStorage.removeItem('iceberg_api_key')
    localStorage.removeItem('iceberg_user')
    localStorage.removeItem('iceberg_project_id')
    localStorage.removeItem('iceberg_api_key_prefix')
    navigate('/login')
  }

  const initials = user.email ? user.email[0].toUpperCase() : '?'

  const themes = [
    { key: 'dark', label: 'Dark', icon: <MoonIcon /> },
    { key: 'light', label: 'Light', icon: <SunIcon /> },
    { key: 'system', label: 'System', icon: <SystemIcon /> },
  ]

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          className={`text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[var(--text-primary)] text-xs font-semibold truncate">{user.email || 'Unknown'}</div>
                <div className="text-[var(--text-muted)] text-xs mt-0.5">Free plan</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button onClick={() => { setOpen(false); navigate('/apikeys') }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition text-left">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6M15 3l3 3"/></svg>
              API Keys
            </button>
            <button onClick={() => { setOpen(false); navigate('/admin') }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition text-left">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Account
            </button>
          </div>

          {/* Theme switcher */}
          <div className="px-4 py-3 border-t border-[var(--border)]">
            <div className="text-[var(--text-dim)] text-xs font-semibold uppercase tracking-wider mb-2">Theme</div>
            <div className="grid grid-cols-3 gap-1">
              {themes.map(t => (
                <button key={t.key} onClick={() => setTheme(t.key)}
                  className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg text-xs font-medium transition
                    ${theme === t.key
                      ? 'bg-blue-600 text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div className="border-t border-[var(--border)] py-1">
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-hover)] transition text-left">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>

          <div className="px-4 py-2 border-t border-[var(--border)]">
            <div className="text-[var(--text-dim)] text-xs">v0.1.0</div>
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
