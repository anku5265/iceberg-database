import { useState, useRef, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import HomePageComponent from './HomePageNew'
import ProductDatabase from './pages/ProductDatabase'
import ProductMemory from './pages/ProductMemory'
import ProductAssistant from './pages/ProductAssistant'
import ProductBYOC from './pages/ProductBYOC'
import ProductSDK from './pages/ProductSDK'
import ProductDashboard from './pages/ProductDashboard'
import Security from './pages/Security'
import Integrations from './pages/Integrations'
import ProductBackup from './pages/ProductBackup'
import ProductNamespaces from './pages/ProductNamespaces'
import Docs from './pages/Docs'
import LivingCodePage from './pages/LivingCodePage'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Status from './pages/Status'
import Contact from './pages/Contact'
import About from './pages/About'
import Benchmarks from './pages/Benchmarks'
import Pricing from './pages/Pricing'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'
const API = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'

function ProductDropdown({ dark = true }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition text-sm ${
          dark
            ? (open ? 'text-white bg-white/5' : 'text-[#888] hover:text-white hover:bg-white/5')
            : (open ? 'text-black bg-black/5' : 'text-[#6b7280] hover:text-black hover:bg-black/5')
        }`}
      >
        Product
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className={`absolute top-full left-0 mt-2 w-[560px] rounded-xl shadow-2xl p-5 z-50 border ${
          dark ? 'bg-[#111] border-[#222] shadow-black/50' : 'bg-white border-[#e5e7eb] shadow-black/10'
        }`}>
          {/* Products */}
          <div className="mb-5">
            <p className="text-xs text-[#555] uppercase tracking-widest mb-3 px-1">Products</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: <DBIcon/>,   name: 'Iceberg Database',  desc: 'Serverless, India-hosted vector DB',   to: '/product/database' },
                { icon: <MemIcon/>,  name: 'Iceberg Memory',    desc: 'Persistent memory for AI agents',      to: '/product/memory' },
                { icon: <BotIcon/>,  name: 'Iceberg Assistant', desc: 'No-code RAG chatbot + WhatsApp',       to: '/product/assistant' },
                { icon: <ByocIcon/>, name: 'Iceberg BYOC',      desc: 'Deploy on your own server',            to: '/product/byoc' },
                { icon: <SDKIcon/>,  name: 'Iceberg SDK',       desc: 'Python, JS, Go, Java, .NET, Rust',    to: '/product/sdk' },
                { icon: <DashIcon/>, name: 'Iceberg Dashboard', desc: 'Manage collections, search, and keys', to: '/product/dashboard' },
              ].map(p => (
                <Link key={p.name} to={p.to} onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 p-3 rounded-lg transition group ${dark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.04]'}`}>
                  <span className="text-[#555] group-hover:text-blue-500 transition mt-0.5 flex-shrink-0">{p.icon}</span>
                  <div>
                    <span className={`text-sm font-medium block ${dark ? 'text-white' : 'text-[#111827]'}`}>{p.name}</span>
                    <span className="text-xs text-[#666]">{p.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t mb-4 ${dark ? 'border-[#1a1a1a]' : 'border-[#e5e7eb]'}`}/>

          {/* Capabilities */}
          <div>
            <p className="text-xs text-[#555] uppercase tracking-widest mb-3 px-1">Capabilities</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: <SecIcon/>,    name: 'Security',         desc: 'DPDP compliant, India data residency', to: '/security' },
                { icon: <IntIcon/>,    name: 'Integrations',     desc: 'LangChain, LlamaIndex, OpenClaw, MCP', to: '/integrations' },
                { icon: <BackupIcon/>, name: 'Backup & Restore', desc: 'One-click backup, restore anytime',     to: '/product/backup' },
                { icon: <NsIcon/>,     name: 'Namespaces',       desc: 'Logical separation within collections', to: '/product/namespaces' },
              ].map(c => (
                <Link key={c.name} to={c.to} onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 p-3 rounded-lg transition group ${dark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.04]'}`}>
                  <span className="text-[#555] group-hover:text-blue-500 transition mt-0.5 flex-shrink-0">{c.icon}</span>
                  <div>
                    <div className={`text-sm font-medium ${dark ? 'text-white' : 'text-[#111827]'}`}>{c.name}</div>
                    <div className="text-xs text-[#666]">{c.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DBIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/></svg> }
function SDKIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25z"/></svg> }
function DashIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function BotIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Zm3-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm3.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3.75 4.5a3 3 0 0 1 3 0"/></svg> }
function SecIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg> }
function IntIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"/></svg> }
function MemIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/></svg> }
function ByocIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 6 0m-6 0H3m16.5 0a3 3 0 0 0 3-3m-3 3a3 3 0 1 1-6 0m6 0h1.5m-1.5-6a3 3 0 0 0-3-3m0 0a3 3 0 0 0-3 3m3-3V3m0 18v-1.5"/></svg> }
function BackupIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg> }
function NsIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg> }

export default function App() {
  useEffect(() => {
    try {
      const path = window.location.pathname || '/'
      const search = window.location.search || ''
      const isRoot = path === '/' || path === '/index.html'
      const stayOnSite = search.includes('home=1') || search.includes('site=1') || search.includes('landing=1')
      const hasSessionCookie = /(?:^|;\s*)ib_session=1(?:;|$)/.test(document.cookie || '')
      const hasLocalKey = !!localStorage.getItem('iceberg_api_key')
      if (isRoot && !stayOnSite && (hasSessionCookie || hasLocalKey)) {
        window.location.replace(D)
      }
    } catch {}
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePageComponent ProductDropdown={ProductDropdown} />} />
      <Route path="/product/database" element={<ProductDatabase />} />
      <Route path="/product/memory" element={<ProductMemory />} />
      <Route path="/product/assistant" element={<ProductAssistant />} />
      <Route path="/product/byoc" element={<ProductBYOC />} />
      <Route path="/product/sdk" element={<ProductSDK />} />
      <Route path="/product/dashboard" element={<ProductDashboard />} />
      <Route path="/product/backup" element={<ProductBackup />} />
      <Route path="/product/namespaces" element={<ProductNamespaces />} />
      <Route path="/security" element={<Security />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/living-code" element={<LivingCodePage />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/status" element={<Status />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/benchmarks" element={<Benchmarks />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  )
}
