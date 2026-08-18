import { NavLink } from 'react-router-dom'

const groups = [
  {
    links: [
      { to: '/', label: 'Overview', icon: <GridIcon /> },
      { to: '/collections', label: 'Collections', icon: <DbIcon /> },
      { to: '/explorer', label: 'Explorer', icon: <SearchIcon /> },
    ]
  },
  {
    label: 'AI',
    links: [
      { to: '/assistants', label: 'Assistants', icon: <BotIcon /> },
      { to: '/memory', label: 'Memory', icon: <MemIcon /> },
    ]
  },
  {
    label: 'Manage',
    links: [
      { to: '/apikeys', label: 'API Keys', icon: <KeyIcon /> },
      { to: '/logs', label: 'Logs', icon: <LogIcon /> },
      { to: '/docs', label: 'Docs', icon: <DocIcon /> },
      { to: '/admin', label: 'Admin', icon: <AdminIcon /> },
    ]
  },
]

export default function Sidebar({ open = true }) {
  return (
    <aside className={`${open ? 'w-56' : 'w-[52px]'} shrink-0 min-h-screen bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col overflow-hidden transition-all duration-200`}
      style={{ boxShadow: 'inset -1px 0 0 var(--border)' }}>

      {/* Logo */}
      <div className={`flex items-center border-b border-[var(--border)] ${open ? 'px-5 py-4' : 'justify-center py-4'}`}>
        {open ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">IB</span>
            </div>
            <span className="text-[var(--text-primary)] font-bold text-sm tracking-tight">Iceberg</span>
            <span className="text-[9px] text-[var(--text-muted)] bg-[var(--bg-hover)] px-1.5 py-0.5 rounded-md border border-[var(--border2)] font-semibold uppercase tracking-wider">beta</span>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-black">IB</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-hidden">
        {groups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {group.label && open && (
              <p className="section-label px-3 mb-1.5">{group.label}</p>
            )}
            <div className="space-y-px">
              {group.links.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} title={!open ? l.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg text-sm transition-all duration-100 ${open ? 'px-3 py-2' : 'justify-center py-2.5'} ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-400 font-medium'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`
                  }
                >
                  <span className="shrink-0 opacity-90">{l.icon}</span>
                  {open && <span className="whitespace-nowrap">{l.label}</span>}
                </NavLink>
              ))}
            </div>
            {gi < groups.length - 1 && open && <div className="mt-3 h-px bg-[var(--border)]"/>}
          </div>
        ))}
      </nav>
    </aside>
  )
}

function GridIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function DbIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/></svg>
}
function SearchIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function KeyIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6M15 3l3 3"/></svg>
}
function LogIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}
function DocIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
function MemIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>
}
function BotIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Zm3-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm3.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3.75 4.5a3 3 0 0 1 3 0"/></svg>
}
function AdminIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
}
function LogoutIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
function ChevronIcon({ className }) {
  return <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={className}><polyline points="18 15 12 9 6 15"/></svg>
}
