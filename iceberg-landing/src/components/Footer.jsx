import { Link } from 'react-router-dom'
import IcebergLogo from './IcebergLogo'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

export default function Footer({ dark = true }) {
  const gridLine = dark ? 'rgba(255, 255, 255, 0.085)' : 'rgba(15, 23, 42, 0.09)'
  const bgCol = dark ? '#0a0b0d' : '#fafafa'
  const headingCol = dark ? 'text-[#71717a]' : 'text-[#6b7280]'
  const linkCol = dark
    ? 'text-[#a1a1aa] hover:text-[#00d2ff] transition text-[13.5px]'
    : 'text-[#374151] hover:text-[#0284c7] transition text-[13.5px]'
  const mutedCol = dark ? 'text-[#71717a]' : 'text-[#6b7280]'
  const iconBoxBorder = dark ? 'border-white/[0.13] bg-[#0c0d10]' : 'border-black/[0.12] bg-white'
  const iconDivider = dark ? 'divide-white/[0.13]' : 'divide-black/[0.12]'
  const iconItemCol = dark
    ? 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.06]'
    : 'text-[#4b5563] hover:text-black hover:bg-black/[0.06]'

  return (
    <footer style={{ background: bgCol }} className="text-sm">
      <div
        className="max-w-[1220px] mx-auto"
        style={{
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
        }}
      >
        {/* Top Row: Brand Logo + Live Status Pill on Left + Sharp Segmented Social Bar on Right */}
        <div
          className="px-6 sm:px-10 lg:px-14 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ borderBottom: `1px solid ${gridLine}` }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className={`inline-flex items-center gap-2.5 font-bold text-[18px] tracking-[-0.02em] group ${
                dark ? 'text-white' : 'text-[#111827]'
              }`}
            >
              <IcebergLogo className="w-7 h-7 transition-transform group-hover:scale-105" />
              <span>Iceberg</span>
            </Link>

            <Link
              to="/status"
              className="inline-flex items-center gap-2 px-2.5 py-1 text-[10.5px] font-mono tracking-[0.12em] uppercase transition"
              style={{
                border: `1px solid ${gridLine}`,
                background: dark ? '#0c0d11' : '#ffffff',
                color: dark ? '#a1a1aa' : '#4b5563',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ALL SYSTEMS OPERATIONAL · ap-south-1</span>
            </Link>
          </div>

          {/* Sharp 0px Segmented Social & Developer Icon Bar (Matches Navbar Action Bar) */}
          <div
            className={`inline-flex items-center rounded-none border ${iconBoxBorder} divide-x ${iconDivider} overflow-hidden`}
          >
            <a
              href="https://x.com/igankush33"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              title="X (@igankush33)"
              className={`w-10 h-9 transition flex items-center justify-center ${iconItemCol}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/ankush-a-96518a39b/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className={`w-10 h-9 transition flex items-center justify-center ${iconItemCol}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://github.com/anku5265/iceberg-database"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub (@anku5265/iceberg-database)"
              className={`w-10 h-9 transition flex items-center justify-center ${iconItemCol}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                />
              </svg>
            </a>
            <a
              href="mailto:contact@icebergdb.in"
              aria-label="Email Support"
              title="contact@icebergdb.in"
              className={`w-10 h-9 transition flex items-center justify-center ${iconItemCol}`}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Middle 4-Column Architectural Link Matrix: Products | Resources | Company | Legal */}
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderBottom: `1px solid ${gridLine}` }}
        >
          {/* Column 1: Products */}
          <div
            className="px-6 sm:px-10 lg:px-14 py-10"
            style={{ borderRight: `1px solid ${gridLine}` }}
          >
            <h3 className={`text-[11px] font-mono tracking-[0.18em] uppercase mb-4 ${headingCol}`}>
              PRODUCTS
            </h3>
            <ul className="space-y-2.5">
              <li><Link to="/product/database" className={linkCol}>Vector Database</Link></li>
              <li><Link to="/product/memory" className={linkCol}>4-Tier AI Memory</Link></li>
              <li><Link to="/product/assistant" className={linkCol}>AI Assistant</Link></li>
              <li><Link to="/product/sdk" className={linkCol}>Official SDKs &amp; MCP</Link></li>
              <li><Link to="/product/byoc" className={linkCol}>BYOC Self-Hosted</Link></li>
              <li><Link to="/pricing" className={linkCol}>Pricing</Link></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div
            className="px-6 sm:px-10 py-10"
            style={{ borderRight: `1px solid ${gridLine}` }}
          >
            <h3 className={`text-[11px] font-mono tracking-[0.18em] uppercase mb-4 ${headingCol}`}>
              RESOURCES
            </h3>
            <ul className="space-y-2.5">
              <li><Link to="/docs" className={linkCol}>Documentation</Link></li>
              <li><Link to="/benchmarks" className={linkCol}>Benchmarks</Link></li>
              <li><Link to="/integrations" className={linkCol}>Integrations</Link></li>
              <li><Link to="/product/namespaces" className={linkCol}>Namespaces</Link></li>
              <li><Link to="/product/backup" className={linkCol}>Backup &amp; Restore</Link></li>
              <li><Link to="/status" className={linkCol}>Status</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div
            className="px-6 sm:px-10 py-10 border-t md:border-t-0"
            style={{
              borderRight: `1px solid ${gridLine}`,
              borderTopColor: gridLine,
            }}
          >
            <h3 className={`text-[11px] font-mono tracking-[0.18em] uppercase mb-4 ${headingCol}`}>
              COMPANY
            </h3>
            <ul className="space-y-2.5">
              <li><Link to="/about" className={linkCol}>About</Link></li>
              <li>
                <a href={D} className={linkCol}>
                  Cloud Console
                </a>
              </li>
              <li><Link to="/contact" className={linkCol}>Contact</Link></li>
              <li>
                <a
                  href="https://github.com/anku5265/iceberg-database"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkCol}
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div
            className="px-6 sm:px-10 py-10 border-t md:border-t-0"
            style={{ borderTopColor: gridLine }}
          >
            <h3 className={`text-[11px] font-mono tracking-[0.18em] uppercase mb-4 ${headingCol}`}>
              LEGAL
            </h3>
            <ul className="space-y-2.5">
              <li><Link to="/security" className={linkCol}>Security &amp; DPDP</Link></li>
              <li><Link to="/terms" className={linkCol}>Terms of Service</Link></li>
              <li><Link to="/privacy" className={linkCol}>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Residency Bar */}
        <div
          className={`px-6 sm:px-10 lg:px-14 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-mono ${mutedCol}`}
        >
          <div>
            © {new Date().getFullYear()} Iceberg Database Technologies · Hosted in India (ap-south-1)
          </div>
          <div>
            v1.0.0 GA · High-performance vector &amp; hybrid search infrastructure for AI builders.
          </div>
        </div>
      </div>
    </footer>
  )
}
