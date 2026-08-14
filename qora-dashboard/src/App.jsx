import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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
import Admin from './pages/Admin'
import Assistants from './pages/Assistants'
import Memory from './pages/Memory'

function isLoggedIn() {
  return !!localStorage.getItem('qora_api_key')
}

function ProtectedLayout({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar open={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition"
            aria-label="Toggle sidebar"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <ProfileMenu />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login/key" element={<LoginKey />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<ProtectedLayout><Overview /></ProtectedLayout>} />
      <Route path="/collections" element={<ProtectedLayout><Collections /></ProtectedLayout>} />
      <Route path="/explorer" element={<ProtectedLayout><Explorer /></ProtectedLayout>} />
      <Route path="/apikeys" element={<ProtectedLayout><ApiKeys /></ProtectedLayout>} />
      <Route path="/logs" element={<ProtectedLayout><Logs /></ProtectedLayout>} />
      <Route path="/assistants" element={<ProtectedLayout><Assistants /></ProtectedLayout>} />
      <Route path="/memory" element={<ProtectedLayout><Memory /></ProtectedLayout>} />
      <Route path="/docs" element={<ProtectedLayout><Docs /></ProtectedLayout>} />
      <Route path="/admin" element={<ProtectedLayout><Admin /></ProtectedLayout>} />
    </Routes>
  )
}
