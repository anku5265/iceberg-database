import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import IcebergLogo from './IcebergLogo'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

export function useSessionTheme() {
  const [dark, setDarkState] = useState(() => {
    try {
      return sessionStorage.getItem('iceberg_session_theme') !== 'light'
    } catch {
      return true
    }
  })

  useEffect(() => {
    const sync = () => {
      try {
        const isDark = sessionStorage.getItem('iceberg_session_theme') !== 'light'
        setDarkState(isDark)
        document.documentElement.classList.toggle('theme-light', !isDark)
      } catch {}
    }
    const handleAuthLinkClick = (e) => {
      const a = e.target?.closest?.('a[href]')
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (href.includes('/login') || href.includes('/signup')) {
        try {
          const isLight = sessionStorage.getItem('iceberg_session_theme') === 'light'
          const url = new URL(a.href, window.location.origin)
          url.searchParams.set('theme', isLight ? 'light' : 'dark')
          a.href = url.toString()
        } catch {}
      }
    }
    sync()
    window.addEventListener('iceberg-theme-change', sync)
    window.addEventListener('popstate', sync)
    document.addEventListener('click', handleAuthLinkClick, true)
    return () => {
      window.removeEventListener('iceberg-theme-change', sync)
      window.removeEventListener('popstate', sync)
      document.removeEventListener('click', handleAuthLinkClick, true)
    }
  }, [])

  const setDark = (val) => {
    const nextDark = typeof val === 'function' ? val(dark) : !!val
    try {
      sessionStorage.setItem('iceberg_session_theme', nextDark ? 'dark' : 'light')
    } catch {}
    document.documentElement.classList.toggle('theme-light', !nextDark)
    setDarkState(nextDark)
    window.dispatchEvent(new Event('iceberg-theme-change'))
  }

  return [dark, setDark]
}

export const PRODUCTS_LIST = [
  { icon: <DBIcon/>,     name: 'Iceberg Database',  desc: 'Serverless, India-hosted vector DB', to: '/product/database' },
  { icon: <MemIcon/>,    name: 'Iceberg Memory',     desc: 'Persistent memory for AI agents',    to: '/product/memory' },
  { icon: <BotIcon/>,    name: 'Iceberg Assistant',  desc: 'No-code RAG chatbot + WhatsApp',     to: '/product/assistant' },
  { icon: <ByocIcon/>,   name: 'Iceberg BYOC',       desc: 'Deploy on your own server',          to: '/product/byoc' },
  { icon: <SDKIcon/>,    name: 'Iceberg SDK',         desc: 'Python, JS, Go, Java, .NET, Rust',  to: '/product/sdk' },
  { icon: <DashIcon/>,   name: 'Iceberg Dashboard',  desc: 'Manage collections, search, keys',   to: '/product/dashboard' },
]

export const CAPS_LIST = [
  { icon: <SecIcon/>,    name: 'Security',         desc: 'DPDP compliant, India data residency', to: '/security' },
  { icon: <IntIcon/>,    name: 'Integrations',     desc: 'LangChain, LlamaIndex, REST API',       to: '/integrations' },
  { icon: <BackupIcon/>, name: 'Backup & Restore', desc: 'One-click backup, restore anytime',     to: '/product/backup' },
  { icon: <NsIcon/>,     name: 'Namespaces',       desc: 'Logical separation within collections', to: '/product/namespaces' },
]

export function MobileNavDrawer({ open, setOpen }) {
  const [dark] = useSessionTheme()
  if (!open) return null
  const themeQuery = !dark ? '?theme=light' : ''
  return (
    <div className={`md:hidden border-t px-4 py-5 space-y-5 max-h-[82vh] overflow-y-auto ${dark ? 'border-white/[0.1] bg-[#0c0d10]' : 'border-black/[0.1] bg-white'}`}>
      <div>
        <p className="text-[10px] text-[#777] uppercase tracking-widest font-semibold mb-2.5 px-1">Products</p>
        <div className="grid grid-cols-1 gap-1">
          {PRODUCTS_LIST.map(p => (
            <Link key={p.name} to={p.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 p-2.5 rounded transition ${dark ? 'hover:bg-white/[0.05]' : 'hover:bg-black/[0.04]'}`}>
              <span className="text-[#3b82f6] flex-shrink-0">{p.icon}</span>
              <div>
                <div className={`text-sm font-medium leading-tight ${dark ? 'text-white' : 'text-[#111827]'}`}>{p.name}</div>
                <div className="text-xs text-[#777]">{p.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className={`border-t pt-4 ${dark ? 'border-white/[0.08]' : 'border-black/[0.08]'}`}>
        <p className="text-[10px] text-[#777] uppercase tracking-widest font-semibold mb-2.5 px-1">Capabilities</p>
        <div className="grid grid-cols-1 gap-1">
          {CAPS_LIST.map(c => (
            <Link key={c.name} to={c.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 p-2.5 rounded transition ${dark ? 'hover:bg-white/[0.05]' : 'hover:bg-black/[0.04]'}`}>
              <span className="text-[#3b82f6] flex-shrink-0">{c.icon}</span>
              <div>
                <div className={`text-sm font-medium leading-tight ${dark ? 'text-white' : 'text-[#111827]'}`}>{c.name}</div>
                <div className="text-xs text-[#777]">{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className={`border-t pt-4 flex flex-wrap gap-2 ${dark ? 'border-white/[0.08]' : 'border-black/[0.08]'}`}>
        <Link to="/docs" onClick={() => setOpen(false)} className={`px-3.5 py-2 text-xs font-medium border ${dark ? 'border-white/10 bg-white/[0.03] text-white' : 'border-black/10 bg-black/[0.03] text-[#111827]'}`}>Documentation</Link>
        <Link to="/pricing" onClick={() => setOpen(false)} className={`px-3.5 py-2 text-xs font-medium border ${dark ? 'border-white/10 bg-white/[0.03] text-white' : 'border-black/10 bg-black/[0.03] text-[#111827]'}`}>Pricing</Link>
        <Link to="/benchmarks" onClick={() => setOpen(false)} className={`px-3.5 py-2 text-xs font-medium border ${dark ? 'border-white/10 bg-white/[0.03] text-white' : 'border-black/10 bg-black/[0.03] text-[#111827]'}`}>Benchmarks</Link>
        <Link to="/status" onClick={() => setOpen(false)} className={`px-3.5 py-2 text-xs font-medium border ${dark ? 'border-white/10 bg-white/[0.03] text-white' : 'border-black/10 bg-black/[0.03] text-[#111827]'}`}>Status</Link>
        <Link to="/contact" onClick={() => setOpen(false)} className={`px-3.5 py-2 text-xs font-medium border ${dark ? 'border-white/10 bg-white/[0.03] text-white' : 'border-black/10 bg-black/[0.03] text-[#111827]'}`}>Contact</Link>
      </div>

      <div className={`border-t pt-4 grid grid-cols-2 gap-2.5 ${dark ? 'border-white/[0.08]' : 'border-black/[0.08]'}`}>
        <a href={`${D}/login${themeQuery}`} className={`py-2.5 text-center border text-xs font-medium ${dark ? 'border-white/15 text-white' : 'border-black/15 text-[#111827]'}`}>Log in</a>
        <a href={`${D}/signup${themeQuery}`} className={`py-2.5 text-center text-xs font-semibold ${dark ? 'bg-white text-[#0a0b0d]' : 'bg-[#0a0b0d] text-white'}`}>Start for free</a>
      </div>
    </div>
  )
}

export function Navbar() {
  const [dark, setDark] = useSessionTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hasSession] = useState(() => {
    try {
      return /(?:^|;\s*)ib_session=1(?:;|$)/.test(document.cookie || '') || !!localStorage.getItem('iceberg_api_key')
    } catch {
      return false
    }
  })
  const themeQuery = !dark ? '?theme=light' : ''
  const gridLine = dark ? 'border-white/[0.12]' : 'border-black/[0.1]'
  const textLink = dark ? 'text-[#e4e4e7] hover:text-white' : 'text-[#27272a] hover:text-black'

  return (
    <header className="sticky top-0 z-50">
      {/* Main Architectural Grid Navbar */}
      <nav className={`border-b ${gridLine} ${dark ? 'bg-[#0a0b0d]' : 'bg-white'}`}>
        <div className={`max-w-[1220px] mx-auto px-4 sm:px-8 h-[68px] flex items-center justify-between border-x ${gridLine}`}>
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <IcebergLogo className="w-7 h-7 transition-transform group-hover:scale-105" />
              <span className={`text-[19px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-[#111827]'}`}>Iceberg</span>
            </Link>
            <div className="hidden md:flex items-center gap-2 text-[14px]">
              <ProductDropdown dark={dark} />
              {[['Developers','/#code'],['Benchmarks','/benchmarks'],['Docs','/docs'],['Pricing','/pricing']].map(([l,h]) => (
                <a key={l} href={h} className={`${textLink} px-3.5 py-1.5 transition font-normal`}>{l}</a>
              ))}
            </div>
          </div>

          {/* Right Side: 5-Cell Segmented Action Box (Pure Ice-White CTA) */}
          <div className={`flex items-center border ${gridLine} ${dark ? 'bg-[#0a0b0d]' : 'bg-white'}`}>
            <a
              href="/#demo"
              title="Search"
              aria-label="Search"
              className={`hidden sm:flex h-10 w-10 items-center justify-center border-r ${gridLine} transition ${textLink}`}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="m20 20-4-4"/></svg>
            </a>

            <button
              onClick={() => setDark(!dark)}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
              className={`h-10 w-10 flex items-center justify-center border-r ${gridLine} transition cursor-pointer ${textLink}`}
            >
              {dark ? (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              )}
            </button>

            <Link
              to="/contact"
              className={`hidden sm:inline-flex items-center h-10 px-4 text-[13px] font-normal border-r ${gridLine} transition ${textLink}`}
            >
              Contact
            </Link>

            {hasSession ? (
              <a
                href={`${D}/`}
                className={`inline-flex items-center h-10 px-4 text-[13px] font-semibold transition whitespace-nowrap ${
                  dark ? 'bg-white hover:bg-[#e0f2fe] text-[#0a0b0d]' : 'bg-[#0a0b0d] hover:bg-[#18181b] text-white'
                }`}
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href={`${D}/login${themeQuery}`}
                  className={`hidden sm:inline-flex items-center h-10 px-4 text-[13px] font-normal border-r ${gridLine} transition whitespace-nowrap ${textLink}`}
                >
                  Log in
                </a>
                <a
                  href={`${D}/signup${themeQuery}`}
                  className={`inline-flex items-center h-10 px-4 text-[13px] font-semibold transition whitespace-nowrap ${
                    dark ? 'bg-white hover:bg-[#e0f2fe] text-[#0a0b0d]' : 'bg-[#0a0b0d] hover:bg-[#18181b] text-white'
                  }`}
                >
                  Start for free
                </a>
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden h-10 w-10 flex items-center justify-center border-l ${gridLine} transition ${textLink}`}
              aria-label="Toggle Menu"
            >
              {mobileOpen ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              )}
            </button>
          </div>
        </div>
        <MobileNavDrawer open={mobileOpen} setOpen={setMobileOpen} dark={dark} />
      </nav>
    </header>
  )
}

function ProductDropdown({ dark = true }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={`flex items-center px-3.5 py-1.5 transition text-[14px] cursor-pointer ${
        dark
          ? (open ? 'text-white' : 'text-[#e4e4e7] hover:text-white')
          : (open ? 'text-black' : 'text-[#27272a] hover:text-black')
      }`}>
        Products
      </button>
      {open && (
        <div className={`absolute top-full left-0 mt-2 w-[560px] shadow-2xl p-5 z-50 border ${
          dark ? 'bg-[#0e0f13] border-white/[0.12] shadow-black/60' : 'bg-white border-black/[0.12] shadow-black/10'
        }`}>
          <div className="mb-5">
            <p className="text-[11px] font-mono text-[#71717a] uppercase tracking-widest mb-3 px-1">Products</p>
            <div className="grid grid-cols-2 gap-1">
              {PRODUCTS_LIST.map(p => (
                <Link key={p.name} to={p.to} onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 p-3 transition group ${dark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.04]'}`}>
                  <span className="text-[#71717a] group-hover:text-[#3b82f6] transition mt-0.5 flex-shrink-0">{p.icon}</span>
                  <div>
                    <span className={`text-sm font-medium block ${dark ? 'text-white' : 'text-[#111827]'}`}>{p.name}</span>
                    <span className="text-xs text-[#71717a]">{p.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className={`border-t mb-4 ${dark ? 'border-white/[0.08]' : 'border-black/[0.08]'}`}/>
          <div>
            <p className="text-[11px] font-mono text-[#71717a] uppercase tracking-widest mb-3 px-1">Capabilities</p>
            <div className="grid grid-cols-2 gap-1">
              {CAPS_LIST.map(c => (
                <Link key={c.name} to={c.to} onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 p-3 transition group ${dark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.04]'}`}>
                  <span className="text-[#71717a] group-hover:text-[#3b82f6] transition mt-0.5 flex-shrink-0">{c.icon}</span>
                  <div>
                    <div className={`text-sm font-medium ${dark ? 'text-white' : 'text-[#111827]'}`}>{c.name}</div>
                    <div className="text-xs text-[#71717a]">{c.desc}</div>
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
