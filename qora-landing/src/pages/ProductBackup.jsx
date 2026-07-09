import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function ProductBackup() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Backup & Restore</div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Your data.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Always safe.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          One-click backups for any collection. Restore to any point in time. Your data is yours — export it, move it, recover it whenever you need.
        </p>
      </section>

      {/* How it works */}
      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl font-bold mb-12">Backup in one API call</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Trigger backup', desc: 'Call POST /backup/{collection}. Qora exports all vectors, payloads, and metadata to JSON.', code: 'POST /backup/my_docs' },
              { step: '02', title: 'Stored safely', desc: 'Backup saved to Cloudflare R2 (if configured) or local disk. Versioned by timestamp.', code: 'backups/user/my_docs/1234567890.json' },
              { step: '03', title: 'Restore anytime', desc: 'Call POST /backup/{collection}/restore/{id}. Collection is recreated exactly as it was.', code: 'POST /backup/my_docs/restore/my_docs_123' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <div className="text-xs font-mono text-[#444] mb-3">{s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed mb-4">{s.desc}</p>
                <code className="text-xs text-blue-400 font-mono">{s.code}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Why it matters</p>
          <h2 className="text-3xl font-bold mb-6">Your data, always recoverable</h2>
          <p className="text-[#666] mb-10 max-w-2xl">Accidental deletes, data corruption, environment migrations — backup and restore handles all of it. Full vector + metadata export means zero lock-in.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
              <h3 className="font-semibold mb-3 text-[#aaa]">Without backup</h3>
              <ul className="space-y-2 text-sm text-[#666]">
                {['Accidental delete = data gone', 'No rollback if indexing goes wrong', 'Migration = reindex everything from scratch', 'Stuck with one vendor forever'].map((item) => (
                  <li key={item} className="flex gap-2 items-start">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
              <h3 className="font-semibold mb-3 text-white">With Qora backup</h3>
              <ul className="space-y-2 text-sm text-[#666]">
                {['One API call to backup any collection', 'Restore to exact previous state instantly', 'Export full data — migrate anywhere', 'Cloudflare R2 or local disk storage'].map((item) => (
                  <li key={item} className="flex gap-2 items-start">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Never lose your data</h2>
          <p className="text-[#666] mb-8">Backup included in all Qora plans — even free.</p>
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">Start for free</a>
        </div>
      </section>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#111] py-10">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#555]">
        <Link to="/" className="text-white font-bold text-lg">Qora</Link>
        <div className="flex gap-6">{['Privacy','Terms','Docs','Status'].map(l=><a key={l} href="#" className="hover:text-white transition">{l}</a>)}</div>
        <div>© 2026 Qora</div>
      </div>
    </footer>
  )
}
