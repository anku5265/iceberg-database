import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
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
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
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
