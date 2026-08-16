import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export function Navbar({ dark, setDark }) {
  return (
    <nav className={`sticky top-0 z-50 border-b ${dark ? 'border-white/[0.06] bg-[#0a0a0a]/90' : 'border-black/[0.06] bg-white/90'} backdrop-blur-md`}>
      <div className="container mx-auto px-6 py-3 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-white">Qora</Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <ProductDropdown dark={dark} />
            {[['Developers','#code'],['Pricing','/#pricing'],['Docs',`${D}/docs`],['Blog','#']].map(([l,h]) => (
              <a key={l} href={h} className={`${dark ? 'text-[#888] hover:text-white hover:bg-white/5' : 'text-[#666] hover:text-black hover:bg-black/5'} px-3 py-1.5 rounded-md transition`}>{l}</a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`${D}/login`} className={`text-sm ${dark ? 'text-[#888] hover:text-white' : 'text-[#666] hover:text-black'} px-3 py-1.5 transition`}>Sign in</a>
          <a href={`${D}/signup`} className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-white/90 transition">Start your project</a>
          {setDark && (
            <button onClick={() => setDark(!dark)} className={`p-1.5 rounded-md border transition ${dark ? 'border-[#1f1f1f] hover:border-[#333] text-[#888] hover:text-white' : 'border-[#ddd] hover:border-[#aaa] text-[#666] hover:text-black'}`}>
              {dark ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

function ProductDropdown({ dark }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const products = [
    { icon: <DBIcon/>,     name: 'Qora Database',  desc: 'Serverless, India-hosted vector DB', to: '/product/database' },
    { icon: <MemIcon/>,    name: 'Qora Memory',     desc: 'Persistent memory for AI agents',    to: '/product/memory' },
    { icon: <BotIcon/>,    name: 'Qora Assistant',  desc: 'No-code RAG chatbot + WhatsApp',     to: '/product/assistant' },
    { icon: <ByocIcon/>,   name: 'Qora BYOC',       desc: 'Deploy on your own server',          to: '/product/byoc' },
    { icon: <SDKIcon/>,    name: 'Qora SDK',         desc: 'Python, JS, Go, Java, .NET, Rust',  to: '/product/sdk' },
    { icon: <DashIcon/>,   name: 'Qora Dashboard',  desc: 'Manage collections, search, keys',   to: '/product/dashboard' },
  ]
  const caps = [
    { icon: <SecIcon/>,    name: 'Security',         desc: 'DPDP compliant, India data residency', to: '/security' },
    { icon: <IntIcon/>,    name: 'Integrations',     desc: 'LangChain, LlamaIndex, REST API',       to: '/integrations' },
    { icon: <BackupIcon/>, name: 'Backup & Restore', desc: 'One-click backup, restore anytime',     to: '/product/backup' },
    { icon: <NsIcon/>,     name: 'Namespaces',       desc: 'Logical separation within collections', to: '/product/namespaces' },
  ]

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition text-sm ${open ? 'text-white bg-white/5' : 'text-[#888] hover:text-white hover:bg-white/5'}`}>
        Product
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${open ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-[560px] bg-[#111] border border-[#222] rounded-xl shadow-2xl shadow-black/50 p-5 z-50">
          <div className="mb-5">
            <p className="text-xs text-[#555] uppercase tracking-widest mb-3 px-1">Products</p>
            <div className="grid grid-cols-2 gap-1">
              {products.map(p => (
                <Link key={p.name} to={p.to} onClick={() => setOpen(false)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition group">
                  <span className="text-[#555] group-hover:text-blue-400 transition mt-0.5 flex-shrink-0">{p.icon}</span>
                  <div>
                    <span className="text-sm text-white font-medium block">{p.name}</span>
                    <span className="text-xs text-[#666]">{p.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-[#1a1a1a] mb-4"/>
          <div>
            <p className="text-xs text-[#555] uppercase tracking-widest mb-3 px-1">Capabilities</p>
            <div className="grid grid-cols-2 gap-1">
              {caps.map(c => (
                <Link key={c.name} to={c.to} onClick={() => setOpen(false)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition group">
                  <span className="text-[#555] group-hover:text-blue-400 transition mt-0.5 flex-shrink-0">{c.icon}</span>
                  <div>
                    <div className="text-sm text-white font-medium">{c.name}</div>
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
function MemIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/></svg> }
function ByocIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 6 0m-6 0H3m16.5 0a3 3 0 0 0 3-3m-3 3a3 3 0 1 1-6 0m6 0h1.5m-1.5-6a3 3 0 0 0-3-3m0 0a3 3 0 0 0-3 3m3-3V3m0 18v-1.5"/></svg> }
function SecIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg> }
function IntIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"/></svg> }
function BackupIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg> }
function NsIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg> }
function GHIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg> }
