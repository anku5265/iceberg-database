import { Link } from 'react-router-dom'
import IcebergLogo from './IcebergLogo'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070709] py-12 text-sm text-[#777]">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-base group">
            <IcebergLogo className="w-6 h-6 transition-transform group-hover:scale-105" />
            <span className="tracking-tight">Iceberg</span>
          </Link>
          <span className="text-[#333]">|</span>
          <span className="text-xs text-[#888]">High-Performance Vector DB for India</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link to="/about" className="text-[#888] hover:text-white transition">About</Link>
          <Link to="/security" className="text-[#888] hover:text-white transition">Security</Link>
          <Link to="/benchmarks" className="text-[#888] hover:text-white transition">Benchmarks</Link>
          <Link to="/docs" className="text-[#888] hover:text-white transition">Docs</Link>
          <Link to="/status" className="text-[#888] hover:text-white transition">Status</Link>
          <Link to="/privacy" className="text-[#888] hover:text-white transition">Privacy</Link>
          <Link to="/terms" className="text-[#888] hover:text-white transition">Terms</Link>
          <Link to="/contact" className="text-[#888] hover:text-white transition">Contact</Link>
          <a
            href="https://www.linkedin.com/in/ankush-a-96518a39b/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#888] hover:text-white transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
          <a
            href="https://x.com/igankush33"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#888] hover:text-white transition"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </a>
        </div>

        <div className="text-xs text-[#555]">
          © {new Date().getFullYear()} Iceberg DB. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
