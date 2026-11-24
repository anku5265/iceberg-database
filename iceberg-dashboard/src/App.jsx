import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProfileMenu from './components/ProfileMenu'
import IcebergLogo from './components/IcebergLogo'
import Overview from './pages/Overview'
import DatabaseQuickstart from './pages/DatabaseQuickstart'
import AssistantQuickstart from './pages/AssistantQuickstart'
import Collections from './pages/Collections'
import Explorer from './pages/Explorer'
import Backups from './pages/Backups'
import ApiKeys from './pages/ApiKeys'
import Logs from './pages/Logs'
import Docs from './pages/Docs'
import Login from './pages/Login'
import LoginKey from './pages/LoginKey'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import LegalModal from './components/LegalModal'
import Settings from './pages/Settings'
import Assistants from './pages/Assistants'
import Memory from './pages/Memory'
import ConnectIntegration from './pages/ConnectIntegration'
import PartnerIntegrations from './pages/PartnerIntegrations'
import { trackFounderEvent, setCrossDomainSessionCookie, clearCrossDomainSessionCookie } from './lib/api'

function isLoggedIn() {
  return !!localStorage.getItem('iceberg_api_key')
}

function GuestRoute({ children }) {
  const hasOAuthCode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('code')
  if (isLoggedIn() && !hasOAuthCode) {
    setCrossDomainSessionCookie()
    return <Navigate to="/" replace />
  }
  return children
}

const PAGE_LABELS = {
  '/': 'Overview',
  '/database/quickstart': 'Database',
  '/collections': 'Database',
  '/explorer': 'Database',
  '/backups': 'Database',
  '/assistants/quickstart': 'Assistant',
  '/assistants': 'Assistant',
  '/memory': 'Memory',
  '/apikeys': 'API keys',
  '/integrations': 'Integrations',
  '/integrations/create': 'Integrations',
  '/logs': 'Logs',
  '/settings': 'Settings',
  '/docs': 'Docs',
}

function CrumbIcon({ path }) {
  if (path.startsWith('/database') || path.startsWith('/collections') || path.startsWith('/explorer') || path.startsWith('/backups')) {
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
        <rect x="3" y="4" width="18" height="7" rx="1.5" />
        <rect x="3" y="13" width="18" height="7" rx="1.5" />
        <line x1="7" y1="7.5" x2="7.01" y2="7.5" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="7" y1="16.5" x2="7.01" y2="16.5" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    )
  }
  if (path.startsWith('/assistants')) {
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.75c.6.45 1 1.15 1 1.9V18h6v-1.35c0-.75.4-1.45 1-1.9A7 7 0 0 0 12 2z" />
      </svg>
    )
  }
  if (path.startsWith('/memory')) {
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
      </svg>
    )
  }
  if (path.startsWith('/apikeys')) {
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    )
  }
  if (path.startsWith('/integrations')) {
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4m6-4v4M7 7h10v4a5 5 0 0 1-5 5v5m-5-9h10" />
      </svg>
    )
  }
  if (path.startsWith('/logs')) {
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    )
  }
  if (path.startsWith('/settings')) {
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  }
  if (path.startsWith('/docs')) {
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  )
}

function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true)
  const [openMenu, setOpenMenu] = useState(null) // 'org' | 'project' | null
  const navRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setOpenMenu(null)
  }, [location.pathname])

  if (!isLoggedIn()) {
    clearCrossDomainSessionCookie()
    return <Navigate to="/login" replace />
  }

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('iceberg_user') || '{}')
    } catch {
      return {}
    }
  })()
  useEffect(() => {
    setCrossDomainSessionCookie(user.email || '')
  }, [user.email])

  const rawPrefix = (user.email || 'DEFAULT').split('@')[0].toUpperCase()
  const orgDisplay = rawPrefix.length > 8 ? `${rawPrefix.slice(0, 7)}_'s Org` : `${rawPrefix}'s Org`
  const currentPageLabel = PAGE_LABELS[location.pathname] || 'Overview'

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] relative">
      {/* Full-Width Top Console Navbar (72px height) */}
      <header className="h-[72px] bg-[var(--topbar-bg)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-50">
        {/* Left: Hamburger + Iceberg Logo + Org Dropdown / Project Dropdown / Active Section Breadcrumb */}
        <div ref={navRef} className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] md:hidden"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Official Iceberg Crystal Logo + Wordmark (Exact Measured Size: 27px icon + 20.5px wordmark) */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 pr-1">
            <IcebergLogo className="w-[27px] h-[27px]" />
            <span className="font-medium text-[20.5px] tracking-[-0.02em] text-[var(--text-primary)]">
              Iceberg
            </span>
          </Link>

          <span className="text-[var(--text-secondary)] text-[16px] select-none mx-1">/</span>

          {/* Organization Selector Dropdown */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'org' ? null : 'org')}
              className="inline-flex items-center gap-2.5 px-2 py-1.5 rounded-[4px] hover:bg-[var(--bg-hover)] text-[15.5px] font-semibold text-[var(--text-primary)] cursor-pointer"
            >
              {/* Dual-Block Building Icon */}
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
                <rect x="3" y="3" width="10" height="18" rx="1" />
                <path d="M13 9h8v12h-8" />
                <line x1="6" y1="7" x2="10" y2="7" />
                <line x1="6" y1="11" x2="10" y2="11" />
                <line x1="6" y1="15" x2="10" y2="15" />
                <line x1="16" y1="13" x2="18" y2="13" />
                <line x1="16" y1="17" x2="18" y2="17" />
              </svg>
              <span className="truncate">{orgDisplay}</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0 ml-1">
                {openMenu === 'org' ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
            </button>

            {openMenu === 'org' && (
              <div className="absolute left-0 top-full mt-1 w-[250px] bg-[var(--card-bg)] border border-[var(--border2)] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.55)] py-4 px-5 z-[100]">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-3 select-none">
                  ORGANIZATIONS
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null)
                    navigate('/')
                  }}
                  className="w-full text-left text-[15.5px] font-bold text-[var(--text-primary)] hover:opacity-80 py-0.5 cursor-pointer truncate"
                >
                  {orgDisplay}
                </button>
              </div>
            )}
          </div>

          <span className="hidden sm:inline text-[var(--text-secondary)] text-[16px] select-none mx-1">/</span>

          {/* Project Selector Dropdown (Default) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'project' ? null : 'project')}
              className="inline-flex items-center gap-2.5 px-2 py-1.5 rounded-[4px] hover:bg-[var(--bg-hover)] text-[15.5px] font-semibold text-[var(--text-primary)] cursor-pointer"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="truncate">Default</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="text-[var(--text-primary)] shrink-0 ml-1">
                {openMenu === 'project' ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
            </button>

            {openMenu === 'project' && (
              <div className="absolute left-0 top-full mt-1 w-[250px] bg-[var(--card-bg)] border border-[var(--border2)] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.55)] py-4 px-5 z-[100]">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-3 select-none">
                  PROJECTS
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null)
                    navigate('/')
                  }}
                  className="w-full text-left text-[15.5px] font-bold text-[var(--text-primary)] hover:opacity-80 py-0.5 cursor-pointer truncate"
                >
                  Default
                </button>
              </div>
            )}
          </div>

          <span className="text-[var(--text-secondary)] text-[16px] select-none mx-1">/</span>

          {/* Active Section Crumb */}
          <div className="inline-flex items-center gap-2.5 px-2 py-1.5 text-[15.5px] font-semibold text-[var(--text-primary)] truncate">
            <CrumbIcon path={location.pathname} />
            <span className="truncate">{currentPageLabel}</span>
          </div>
        </div>

        {/* Right: Docs | Settings | Get help | Round Avatar */}
        <div className="flex items-center gap-6 sm:gap-7 shrink-0">
          <Link
            to="/docs"
            className="text-[15px] font-semibold text-[var(--text-primary)] hover:opacity-80 hidden sm:inline"
          >
            Docs
          </Link>
          <Link
            to="/settings"
            className="text-[15px] font-semibold text-[var(--text-primary)] hover:opacity-80 hidden sm:inline"
          >
            Settings
          </Link>
          <a
            href="mailto:contact@icebergdb.in"
            className="text-[15px] font-semibold text-[var(--text-primary)] hover:opacity-80 hidden md:inline"
          >
            Get help
          </a>
          <ProfileMenu />
        </div>
      </header>

      {/* ── Body Below Topbar: Left Sidebar + Main Scrollable Canvas ── */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-30 md:hidden"
          />
        )}
        <Sidebar open={sidebarOpen} onCloseMobile={() => { if (window.innerWidth < 768) setSidebarOpen(false) }} />
        <main className="flex-1 overflow-y-auto bg-[var(--bg-base)] min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

function PublicDocsLayout() {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      <header className="h-[72px] bg-[var(--topbar-bg)] border-b border-[var(--border)] flex items-center justify-between px-6 sm:px-7 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <IcebergLogo className="w-[26px] h-[26px]" />
          <span className="text-[var(--text-primary)] font-semibold text-[20.5px] tracking-[-0.02em]">Iceberg</span>
          <span className="text-[var(--text-secondary)] text-[16px] mx-1.5">/</span>
          <span className="text-[var(--text-primary)] text-[15.5px] font-semibold">Docs</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-[15px] font-semibold text-[var(--text-primary)] hover:opacity-80 px-3 py-1.5">Sign in</a>
          <a href="/signup" className="pc-btn-primary">Get started</a>
        </div>
      </header>
      <div className="flex-1 pb-16 max-w-[1090px] mx-auto w-full px-6 sm:px-12 py-10 sm:py-12">
        <Docs />
      </div>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('_ib_dash_visit')) {
        sessionStorage.setItem('_ib_dash_visit', '1')
        const user = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
        trackFounderEvent('dashboard_visit', {
          email: user.email || 'visitor',
          path: window.location.pathname
        })
      }
    } catch {}
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/login/key" element={<GuestRoute><LoginKey /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/connect" element={<ConnectIntegration />} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/terms" element={<div className="min-h-screen bg-[#0a0a0a]"><LegalModal initialTab="terms" onClose={() => window.location.href = '/signup'} /></div>} />
      <Route path="/privacy" element={<div className="min-h-screen bg-[#0a0a0a]"><LegalModal initialTab="privacy" onClose={() => window.location.href = '/signup'} /></div>} />
      <Route path="/docs" element={isLoggedIn() ? <ProtectedLayout><Settings initialTab="docs" /></ProtectedLayout> : <PublicDocsLayout />} />
      <Route path="/" element={<ProtectedLayout><Overview /></ProtectedLayout>} />
      <Route path="/database/quickstart" element={<ProtectedLayout><DatabaseQuickstart /></ProtectedLayout>} />
      <Route path="/assistants/quickstart" element={<ProtectedLayout><AssistantQuickstart /></ProtectedLayout>} />
      <Route path="/collections" element={<ProtectedLayout><Collections /></ProtectedLayout>} />
      <Route path="/explorer" element={<ProtectedLayout><Explorer /></ProtectedLayout>} />
      <Route path="/backups" element={<ProtectedLayout><Backups /></ProtectedLayout>} />
      <Route path="/apikeys" element={<ProtectedLayout><ApiKeys /></ProtectedLayout>} />
      <Route path="/integrations" element={<ProtectedLayout><PartnerIntegrations /></ProtectedLayout>} />
      <Route path="/integrations/create" element={<ProtectedLayout><PartnerIntegrations forceCreate={true} /></ProtectedLayout>} />
      <Route path="/logs" element={<ProtectedLayout><Logs /></ProtectedLayout>} />
      <Route path="/assistants" element={<ProtectedLayout><Assistants /></ProtectedLayout>} />
      <Route path="/memory" element={<ProtectedLayout><Memory /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/admin" element={<Navigate to="/settings" replace />} />
    </Routes>
  )
}
