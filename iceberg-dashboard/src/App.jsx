import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProfileMenu from './components/ProfileMenu'
import Overview from './pages/Overview'
import Collections from './pages/Collections'
import Explorer from './pages/Explorer'
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
import { trackFounderEvent } from './lib/api'

function isLoggedIn() {
  return !!localStorage.getItem('iceberg_api_key')
}

function GuestRoute({ children }) {
  // If user is already logged in (and hasn't clicked Sign out), skip Login/Signup and go straight to Dashboard
  const hasOAuthCode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('code')
  if (isLoggedIn() && !hasOAuthCode) {
    return <Navigate to="/" replace />
  }
  return children
}

const PAGE_LABELS = {
  '/': 'Overview',
  '/collections': 'Collections',
  '/explorer': 'Query Explorer',
  '/assistants': 'Assistants',
  '/memory': 'Agent Memory',
  '/apikeys': 'API Keys',
  '/logs': 'Logs',
  '/settings': 'Settings',
  '/docs': 'Documentation',
}

function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true)
  const location = useLocation()
  if (!isLoggedIn()) return <Navigate to="/login" replace />

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('iceberg_user') || '{}')
    } catch {
      return {}
    }
  })()
  const workspaceName = (user.email || 'workspace').split('@')[0]
  const currentPageLabel = PAGE_LABELS[location.pathname] || 'Overview'

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] relative">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-30 md:hidden"
        />
      )}
      <Sidebar open={sidebarOpen} onCloseMobile={() => { if (window.innerWidth < 768) setSidebarOpen(false) }} />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition"
              aria-label="Toggle sidebar"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="text-[var(--text-muted)] truncate">{workspaceName}</span>
              <span className="text-[var(--text-dim)]">/</span>
              <span className="text-[var(--text-primary)] font-medium truncate">{currentPageLabel}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)] px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg-surface2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>ap-south-1</span>
            </div>
            <Link
              to="/settings?tab=docs"
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition border border-[var(--border)]"
              title="Documentation & API Reference"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span>Docs</span>
            </Link>
            <ProfileMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-[var(--bg-base)]">{children}</main>
      </div>
    </div>
  )
}

function PublicDocsLayout() {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      {/* Public header */}
      <header className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-black">IB</span>
          </div>
          <span className="text-[var(--text-primary)] font-semibold text-sm">Iceberg</span>
          <span className="text-[var(--text-dim)] text-xs mx-1">/</span>
          <span className="text-[var(--text-muted)] text-sm">Docs</span>
        </div>
        <div className="flex items-center gap-2">
          <a href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 transition">Sign in</a>
          <a href="/signup" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition font-medium">Get started</a>
        </div>
      </header>
      <div className="flex-1 pb-16">
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
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/terms" element={<div className="min-h-screen bg-[#0a0a0a]"><LegalModal initialTab="terms" onClose={() => window.location.href = '/signup'} /></div>} />
      <Route path="/privacy" element={<div className="min-h-screen bg-[#0a0a0a]"><LegalModal initialTab="privacy" onClose={() => window.location.href = '/signup'} /></div>} />
      <Route path="/docs" element={isLoggedIn() ? <ProtectedLayout><Settings initialTab="docs" /></ProtectedLayout> : <PublicDocsLayout />} />
      <Route path="/" element={<ProtectedLayout><Overview /></ProtectedLayout>} />
      <Route path="/collections" element={<ProtectedLayout><Collections /></ProtectedLayout>} />
      <Route path="/explorer" element={<ProtectedLayout><Explorer /></ProtectedLayout>} />
      <Route path="/apikeys" element={<ProtectedLayout><ApiKeys /></ProtectedLayout>} />
      <Route path="/logs" element={<ProtectedLayout><Logs /></ProtectedLayout>} />
      <Route path="/assistants" element={<ProtectedLayout><Assistants /></ProtectedLayout>} />
      <Route path="/memory" element={<ProtectedLayout><Memory /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/admin" element={<Navigate to="/settings" replace />} />
    </Routes>
  )
}
