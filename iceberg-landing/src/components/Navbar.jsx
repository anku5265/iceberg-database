import { useState, useRef, useEffect, useLayoutEffect, memo } from 'react'
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

const PRODUCTS_LIST = [
  { icon: <DBIcon/>,     name: 'Iceberg Database',  desc: 'Serverless, India-hosted vector DB', to: '/product/database' },
  { icon: <MemIcon/>,    name: 'Iceberg Memory',     desc: 'Persistent memory for AI agents',    to: '/product/memory' },
  { icon: <BotIcon/>,    name: 'Iceberg Assistant',  desc: 'No-code RAG chatbot + WhatsApp',     to: '/product/assistant' },
  { icon: <ByocIcon/>,   name: 'Iceberg BYOC',       desc: 'Deploy on your own server',          to: '/product/byoc' },
  { icon: <SDKIcon/>,    name: 'Iceberg SDK',         desc: 'Python, JS, Go, Java, .NET, Rust',  to: '/product/sdk' },
  { icon: <DashIcon/>,   name: 'Iceberg Dashboard',  desc: 'Manage collections, search, keys',   to: '/product/dashboard' },
]

const CAPS_LIST = [
  { icon: <SecIcon/>,    name: 'Security',         desc: 'DPDP compliant, India data residency', to: '/security' },
  { icon: <IntIcon/>,    name: 'Integrations',     desc: 'LangChain, LlamaIndex, REST API',       to: '/integrations' },
  { icon: <BackupIcon/>, name: 'Backup & Restore', desc: 'One-click backup, restore anytime',     to: '/product/backup' },
  { icon: <NsIcon/>,     name: 'Namespaces',       desc: 'Logical separation within collections', to: '/product/namespaces' },
]

const RESOURCES_LIST = [
  { icon: <PineconeCubeIcon/>,      name: 'How IcebergDB Works', desc: "Overview of Iceberg's architecture",   to: '/docs?section=architecture' },
  { icon: <PineconeBookIcon/>,      name: 'Docs',                desc: 'Guides, references, and API docs',     to: '/docs' },
  { icon: <PineconeBookIcon/>,      name: 'Learn',               desc: 'Learn and build with best practices',  to: '/docs?section=concepts' },
  { icon: <PineconeDocIcon/>,       name: 'Blog',                desc: 'Latest news and updates from Iceberg', to: '/about' },
  { icon: <PineconeStatusIcon/>,    name: 'Research',            desc: 'Latest research from Iceberg',         to: '/living-code' },
  { icon: <PineconeCommunityIcon/>, name: 'Community',           desc: 'Events, webinars, and workshops',      to: '/contact' },
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
        <Link to="/engine" onClick={() => setOpen(false)} className={`px-3.5 py-2 text-xs font-medium border ${dark ? 'border-white/10 bg-white/[0.03] text-white' : 'border-black/10 bg-black/[0.03] text-[#111827]'}`}>Engine</Link>
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

export const Navbar = memo(function Navbar() {
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
          <div className="flex items-center gap-8 h-full">
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <IcebergLogo className="w-7 h-7 transition-transform group-hover:scale-105" />
              <span className={`text-[19px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-[#111827]'}`}>Iceberg</span>
            </Link>
            <div className="hidden md:flex items-stretch gap-2 text-[15px] h-full select-none">
              <ProductDropdown dark={dark} />
              {[['Engine','/engine'],['Benchmarks','/benchmarks']].map(([l,h]) => (
                <Link
                  key={l}
                  to={h}
                  className="focus:outline-none group flex items-center no-underline"
                >
                  <span
                    className={`text-[15px] px-[0.9375rem] py-3 leading-none border border-transparent ${
                      dark
                        ? 'text-[#fafaf9] group-hover:border-[#333338]'
                        : 'text-[#1c1917] group-hover:border-[#e7e5e4]'
                    } font-normal`}
                  >
                    {l}
                  </span>
                </Link>
              ))}
              <ResourcesDropdown dark={dark} />
              <Link
                to="/pricing"
                className="focus:outline-none group flex items-center no-underline"
              >
                <span
                  className={`text-[15px] px-[0.9375rem] py-3 leading-none border border-transparent ${
                    dark
                      ? 'text-[#fafaf9] group-hover:border-[#333338]'
                      : 'text-[#1c1917] group-hover:border-[#e7e5e4]'
                  } font-normal`}
                >
                  Pricing
                </span>
              </Link>
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
                className="inline-flex items-center h-10 px-4 text-[13px] font-medium transition whitespace-nowrap bg-[#1d6bf3] hover:bg-[#1559d6] text-white"
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
                  className="inline-flex items-center h-10 px-4 text-[13px] font-medium transition whitespace-nowrap bg-[#1d6bf3] hover:bg-[#1559d6] text-white"
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
})

const ProductDropdown = memo(function ProductDropdown({ dark = true }) {
  const [open, setOpen] = useState(false)
  const [borderVisible, setBorderVisible] = useState(false)
  const [contentHeight, setContentHeight] = useState(426)
  const ref = useRef(null)
  const innerRef = useRef(null)
  const closeTimerRef = useRef(null)

  // Measure stationary inner content once on mount (no forced reflow during hover animation)
  useLayoutEffect(() => {
    if (innerRef.current) {
      const h = innerRef.current.offsetHeight
      if (h > 0) setContentHeight(h)
    }
  }, [])

  const handleOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    try {
      window.__ibDropdownOpen = true
    } catch {}
    setBorderVisible(true)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setBorderVisible(false)
      try {
        window.__ibDropdownOpen = false
      } catch {}
      closeTimerRef.current = null
    }, 285)
  }

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handleClose()
    }
    document.addEventListener('mousedown', h)
    return () => {
      document.removeEventListener('mousedown', h)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      try {
        window.__ibDropdownOpen = false
      } catch {}
    }
  }, [])

  const paperBg = dark ? 'bg-[#1b1c20]' : 'bg-[#fbfbfc]'
  const borderCol = dark ? 'border-[#333338] divide-[#333338]' : 'border-[#e7e5e4] divide-[#e7e5e4]'
  const itemHoverBg = dark ? 'hover:bg-[#111215] focus:bg-[#111215]' : 'hover:bg-white focus:bg-white'
  const textPrimary = dark ? 'text-[#fafaf9]' : 'text-[#1c1917]'
  const textSecondary = dark ? 'text-[#a8a29e]' : 'text-[#57534e]'

  return (
    <div
      ref={ref}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={(e) => {
        const related = e.relatedTarget
        if (ref.current !== null && !ref.current.contains(related)) handleClose()
      }}
      className="group relative flex cursor-pointer after:content-[''] after:absolute after:-left-[25%] after:h-[calc(100%+1px)] after:w-[150%]"
    >
      <Link
        to="/product/database"
        aria-label="Products"
        className="flex items-center relative z-[2] no-underline"
      >
        <span
          className={`text-[15px] border border-transparent px-[0.9375rem] py-3 leading-none ${
            dark
              ? 'text-[#fafaf9] group-hover:border-[#333338]'
              : 'text-[#1c1917] group-hover:border-[#e7e5e4]'
          }`}
        >
          Products
        </span>
      </Link>

      <div
        aria-hidden={!open}
        style={{
          height: open ? `${contentHeight}px` : '0px',
          transition: open
            ? 'height 320ms cubic-bezier(0.28, 0.85, 0.25, 1)'
            : 'height 280ms cubic-bezier(0.3, 0.82, 0.25, 1)',
          willChange: 'height',
          transform: 'translate3d(0, 0, 0)',
          contain: 'layout paint style',
        }}
        className={`${paperBg} absolute top-[calc(100%+1px)] -left-[6.5rem] z-50 w-max overflow-hidden rounded-b border-x ${
          open || borderVisible ? 'border-b' : 'border-b-0'
        } ${borderCol} ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          ref={innerRef}
          style={{
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
          }}
          className={`${paperBg} divide-y ${borderCol} w-[40.25rem] overflow-hidden rounded-b`}
        >
          {/* Top Section: Products */}
          <div>
            <div className="pt-6">
              <span className={`text-[15px] ${textPrimary} block px-8 font-bold`}>
                Products
              </span>
            </div>
            <div className="grid grid-cols-2 p-4">
              {PRODUCTS_LIST.map((p) => (
                <Link
                  key={p.name}
                  to={p.to}
                  tabIndex={open ? 0 : -1}
                  onClick={handleClose}
                  className={`focus:outline-none ${itemHoverBg} p-4 transition-colors duration-150 block no-underline`}
                >
                  <span className={`text-[15px] ${textPrimary} flex items-center gap-3`}>
                    <span className={textPrimary}>{p.icon}</span>
                    {p.name}
                  </span>
                  <span className={`${textSecondary} mt-1 block text-xs/[130%]`}>
                    {p.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Section: Capabilities */}
          <div>
            <div className="pt-6">
              <span className={`text-[15px] ${textPrimary} block px-8 font-bold`}>
                Capabilities
              </span>
            </div>
            <div className="grid grid-cols-2 p-4">
              {CAPS_LIST.map((c) => (
                <Link
                  key={c.name}
                  to={c.to}
                  tabIndex={open ? 0 : -1}
                  onClick={handleClose}
                  className={`focus:outline-none ${itemHoverBg} p-4 transition-colors duration-150 block no-underline`}
                >
                  <span className={`text-[15px] ${textPrimary} flex items-center gap-3`}>
                    <span className={textPrimary}>{c.icon}</span>
                    {c.name}
                  </span>
                  <span className={`${textSecondary} mt-1 block text-xs/[130%]`}>
                    {c.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

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

const ResourcesDropdown = memo(function ResourcesDropdown({ dark = true }) {
  const [open, setOpen] = useState(false)
  const [borderVisible, setBorderVisible] = useState(false)
  const [contentHeight, setContentHeight] = useState(414)
  const ref = useRef(null)
  const innerRef = useRef(null)
  const closeTimerRef = useRef(null)

  useLayoutEffect(() => {
    if (innerRef.current) {
      const h = innerRef.current.offsetHeight
      if (h > 0) setContentHeight(h)
    }
  }, [])

  const handleOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    try {
      window.__ibDropdownOpen = true
    } catch {}
    setBorderVisible(true)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setBorderVisible(false)
      try {
        window.__ibDropdownOpen = false
      } catch {}
      closeTimerRef.current = null
    }, 285)
  }

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handleClose()
    }
    document.addEventListener('mousedown', h)
    return () => {
      document.removeEventListener('mousedown', h)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      try {
        window.__ibDropdownOpen = false
      } catch {}
    }
  }, [])

  const paperBg = dark ? 'bg-[#1b1c20]' : 'bg-[#fbfbfc]'
  const borderCol = dark ? 'border-[#333338] divide-[#333338]' : 'border-[#e7e5e4] divide-[#e7e5e4]'
  const itemHoverBg = dark ? 'hover:bg-[#111215] focus:bg-[#111215]' : 'hover:bg-white focus:bg-white'
  const textPrimary = dark ? 'text-[#fafaf9]' : 'text-[#1c1917]'
  const textSecondary = dark ? 'text-[#a8a29e]' : 'text-[#57534e]'

  return (
    <div
      ref={ref}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={(e) => {
        const related = e.relatedTarget
        if (ref.current !== null && !ref.current.contains(related)) handleClose()
      }}
      className="group relative flex cursor-pointer after:content-[''] after:absolute after:-left-[25%] after:h-[calc(100%+1px)] after:w-[150%]"
    >
      <Link
        to="/docs"
        aria-label="Resources"
        className="flex items-center relative z-[2] no-underline"
      >
        <span
          className={`text-[15px] border border-transparent px-[0.9375rem] py-3 leading-none ${
            dark
              ? 'text-[#fafaf9] group-hover:border-[#333338]'
              : 'text-[#1c1917] group-hover:border-[#e7e5e4]'
          }`}
        >
          Resources
        </span>
      </Link>

      <div
        aria-hidden={!open}
        style={{
          height: open ? `${contentHeight}px` : '0px',
          transition: open
            ? 'height 320ms cubic-bezier(0.28, 0.85, 0.25, 1)'
            : 'height 280ms cubic-bezier(0.3, 0.82, 0.25, 1)',
          willChange: 'height',
          transform: 'translate3d(0, 0, 0)',
          contain: 'layout paint style',
        }}
        className={`${paperBg} absolute top-[calc(100%+1px)] left-0 z-50 w-max overflow-hidden rounded-b border-x ${
          open || borderVisible ? 'border-b' : 'border-b-0'
        } ${borderCol} ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          ref={innerRef}
          style={{
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
          }}
          className={`${paperBg} divide-y ${borderCol} flex w-[16.25rem] flex-col overflow-hidden rounded-b`}
        >
          {RESOURCES_LIST.map((r) => (
            <Link
              key={r.name}
              to={r.to}
              tabIndex={open ? 0 : -1}
              onClick={handleClose}
              className={`focus:outline-none ${itemHoverBg} p-4 transition-colors duration-150 block no-underline`}
            >
              <span className={`text-[15px] ${textPrimary} flex items-center gap-3`}>
                <span className={textPrimary}>{r.icon}</span>
                {r.name}
              </span>
              <span className={`${textSecondary} mt-1 block text-xs/[130%]`}>
                {r.desc}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
})

function PineconeBookIcon() {
  return (
    <svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.96875 2.36523C7.91016 2.33594 7.88086 2.33594 7.82227 2.30664C7.64648 2.24805 7.41211 2.16016 7.08984 2.07227C6.47461 1.92578 5.625 1.75 4.6875 1.75C3.39844 1.75 2.34375 2.01367 1.58203 2.27734C1.31836 2.39453 1.11328 2.48242 0.9375 2.57031V12.2969C1.05469 12.2676 1.17188 12.2383 1.28906 12.209C2.16797 12.0332 3.31055 11.8281 4.21875 11.8281C5.53711 11.8574 6.67969 12.1797 7.5293 12.502C7.67578 12.5605 7.82227 12.6191 7.96875 12.6777V2.36523ZM8.90625 12.6777C9.02344 12.6191 9.16992 12.5605 9.31641 12.502C10.166 12.1797 11.3086 11.8574 12.627 11.8574C13.5645 11.8281 14.707 12.0332 15.5566 12.209C15.6738 12.2383 15.791 12.2676 15.9375 12.2969V2.57031C15.7617 2.48242 15.5273 2.39453 15.2637 2.30664C14.502 2.04297 13.4473 1.75 12.1875 1.75C11.3379 1.75 10.4883 1.92578 9.81445 2.07227C9.49219 2.16016 9.22852 2.24805 9.02344 2.30664C8.99414 2.33594 8.93555 2.33594 8.90625 2.36523V12.6777ZM12.1875 0.8125C15 0.8125 16.875 1.98438 16.875 1.98438V12.502V13.4688C16.875 13.4688 16.4941 13.3809 15.9375 13.2344C15.0293 13.0293 13.6523 12.7656 12.6562 12.7656C10.3125 12.8242 8.4375 13.9375 8.4375 13.9375C8.4375 13.9375 6.5332 12.8242 4.21875 12.7656C3.19336 12.7656 1.81641 13.0293 0.9375 13.2344C0.351562 13.3809 0 13.4688 0 13.4688V12.502V1.98438C0 1.98438 1.875 0.8125 4.6875 0.8125C6.79688 0.8125 8.4375 1.51562 8.4375 1.51562C8.4375 1.51562 10.3125 0.8125 12.1875 0.8125Z" fill="currentColor"/>
    </svg>
  )
}

function PineconeCubeIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.9375 6.85156V9.51758L3.86719 11.1875H9.22852L12.1875 9.51758V6.85156L9.58008 8.31641L9.49219 8.375H9.375H3.75H3.60352L3.51562 8.31641L0.9375 6.85156ZM0.9375 5.76758L3.86719 7.4375H9.22852L12.1875 5.76758V3.74609L9.08203 1.8125H4.01367L0.9375 3.74609V5.76758ZM0.9375 13.0332L4.01367 14.9375H9.08203L12.1875 13.0332V10.6016L9.58008 12.0664L9.49219 12.125H9.375H3.75H3.60352L3.51562 12.0664L0.9375 10.6016V13.0332ZM3.75 0.875H9.375L13.125 3.21875V13.5312L9.375 15.875H3.75L0 13.5312V3.21875L3.75 0.875Z" fill="currentColor"/>
    </svg>
  )
}

function PineconeDocIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.3125 14.9375V6.5H6.09375H5.625V6.03125V1.8125H0.9375V14.9375H10.3125ZM6.5625 1.98828V5.5625H10.1367L6.5625 1.98828ZM6.79688 0.875L11.25 5.32812V14.9375V15.875H10.3125H0.9375H0V14.9375V1.8125V0.875H0.9375H6.79688ZM3.28125 8.375H7.96875H8.4375V9.3125H7.96875H3.28125H2.8125V8.375H3.28125ZM3.28125 10.25H7.96875H8.4375V11.1875H7.96875H3.28125H2.8125V10.25H3.28125ZM3.28125 12.125H7.96875H8.4375V13.0625H7.96875H3.28125H2.8125V12.125H3.28125Z" fill="currentColor"/>
    </svg>
  )
}

function PineconeStatusIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="1" width="10" height="14" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="7" cy="12.5" r="0.8" fill="currentColor"/>
    </svg>
  )
}

function PineconeCommunityIcon() {
  return (
    <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.875 1.8125H1.875V7.61328C1.52344 7.73047 1.20117 7.93555 0.9375 8.16992V1.8125V0.875H1.875H16.875H17.8125V1.8125V8.16992C17.5195 7.93555 17.1973 7.73047 16.875 7.61328V1.8125ZM2.8125 11.1875C3.31055 11.1875 3.75 10.7773 3.75 10.25C3.75 9.75195 3.31055 9.3125 2.8125 9.3125C2.28516 9.3125 1.875 9.75195 1.875 10.25C1.875 10.7773 2.28516 11.1875 2.8125 11.1875ZM2.8125 8.375C3.45703 8.375 4.07227 8.75586 4.42383 9.3125C4.74609 9.89844 4.74609 10.6309 4.42383 11.1875C4.07227 11.7734 3.45703 12.125 2.8125 12.125C2.13867 12.125 1.52344 11.7734 1.17188 11.1875C0.849609 10.6309 0.849609 9.89844 1.17188 9.3125C1.52344 8.75586 2.13867 8.375 2.8125 8.375ZM9.375 11.1875C9.87305 11.1875 10.3125 10.7773 10.3125 10.25C10.3125 9.75195 9.87305 9.3125 9.375 9.3125C8.84766 9.3125 8.4375 9.75195 8.4375 10.25C8.4375 10.7773 8.84766 11.1875 9.375 11.1875ZM9.375 8.375C10.0195 8.375 10.6348 8.75586 10.9863 9.3125C11.3086 9.89844 11.3086 10.6309 10.9863 11.1875C10.6348 11.7734 10.0195 12.125 9.375 12.125C8.70117 12.125 8.08594 11.7734 7.73438 11.1875C7.41211 10.6309 7.41211 9.89844 7.73438 9.3125C8.08594 8.75586 8.70117 8.375 9.375 8.375ZM16.875 10.25C16.875 9.75195 16.4355 9.3125 15.9375 9.3125C15.4102 9.3125 15 9.75195 15 10.25C15 10.7773 15.4102 11.1875 15.9375 11.1875C16.4355 11.1875 16.875 10.7773 16.875 10.25ZM14.0625 10.25C14.0625 9.60547 14.4141 8.99023 15 8.63867C15.5566 8.31641 16.2891 8.31641 16.875 8.63867C17.4316 8.99023 17.8125 9.60547 17.8125 10.25C17.8125 10.9238 17.4316 11.5391 16.875 11.8906C16.2891 12.2129 15.5566 12.2129 15 11.8906C14.4141 11.5391 14.0625 10.9238 14.0625 10.25ZM1.61133 14L0.966797 15.875H0L0.9375 13.0625H4.6875L5.625 15.875H4.62891L4.01367 14H1.61133ZM7.5293 15.875H6.5625L7.5 13.0625H11.25L12.1875 15.875H11.1914L10.5762 14H8.17383L7.5293 15.875ZM14.7363 14L14.0918 15.875H13.125L14.0625 13.0625H17.8125L18.75 15.875H17.7539L17.1387 14H14.7363Z" fill="currentColor"/>
    </svg>
  )
}
