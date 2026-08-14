import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProfileMenu() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('qora_user') || '{}')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const logout = () => {
    localStorage.removeItem('qora_api_key')
    localStorage.removeItem('qora_user')
    localStorage.removeItem('qora_project_id')
    localStorage.removeItem('qora_api_key_prefix')
    navigate('/login')
  }

  const initials = user.email ? user.email[0].toUpperCase() : '?'

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          className={`text-[#555] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs font-medium truncate">{user.email || 'Unknown'}</div>
                <div className="text-[#555] text-xs mt-0.5">Free plan</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button onClick={() => { setOpen(false); navigate('/apikeys') }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#888] hover:text-white hover:bg-[#1f1f1f] transition text-left">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6M15 3l3 3"/></svg>
              API Keys
            </button>
            <button onClick={() => { setOpen(false); navigate('/admin') }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#888] hover:text-white hover:bg-[#1f1f1f] transition text-left">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Account
            </button>
          </div>

          <div className="border-t border-[#1f1f1f] py-1">
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#666] hover:text-red-400 hover:bg-[#1f1f1f] transition text-left">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>

          <div className="px-4 py-2 border-t border-[#1f1f1f]">
            <div className="text-[#444] text-xs">v0.1.0</div>
          </div>
        </div>
      )}
    </div>
  )
}
