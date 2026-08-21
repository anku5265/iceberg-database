import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function Security() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Security</div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Your data stays<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">in India.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Iceberg is built for Indian data compliance from day one. DPDP Act compliant, India-hosted, with enterprise-grade access controls.
        </p>
      </section>

      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Compliance</p>
          <h2 className="text-3xl font-bold mb-12">Built for Indian regulations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'DPDP Act 2023',
                desc: 'Digital Personal Data Protection Act compliant. Data stays within India. No cross-border transfer of personal data without consent.',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253"/></svg>,
              },
              {
                title: 'Data Residency',
                desc: 'All data stored on servers in Mumbai. Your vectors, documents, and metadata never leave Indian soil — guaranteed by infrastructure, not just policy.',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>,
              },
              {
                title: 'RBI Compliance',
                desc: 'BYOC option for banks and NBFCs requiring on-premise deployment as per RBI data localization guidelines.',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg>,
              },
            ].map((c, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">{c.icon}</div>
                <h3 className="font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Access control</p>
          <h2 className="text-3xl font-bold mb-12">RBAC — granular key permissions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { role: 'admin', label: 'Admin', desc: 'Full access — create/delete collections, manage keys, view all data, billing.', color: 'text-red-400 border-red-900/30' },
              { role: 'read_write', label: 'Read-Write', desc: 'Index documents, run searches. Cannot delete collections or manage keys.', color: 'text-yellow-400 border-yellow-900/30' },
              { role: 'read', label: 'Read-only', desc: 'Search only. Safe to embed in client-side apps or share with partners.', color: 'text-green-400 border-green-900/30' },
            ].map((r, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] p-5">
                <div className={`text-xs font-mono px-2 py-1 rounded border inline-block mb-3 ${r.color}`}>{r.role}</div>
                <h3 className="font-semibold mb-2">{r.label}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-[#1a1a1a] p-5">
            <p className="text-sm text-[#666]">
              Create as many keys as you need. Revoke any key instantly — other keys are unaffected. Each key is scoped to a project.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Infrastructure</p>
          <h2 className="text-3xl font-bold mb-12">Secure by design</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Encryption at rest', desc: 'All stored vectors and metadata are encrypted at rest using AES-256.' },
              { title: 'Encryption in transit', desc: 'All API communication over HTTPS/TLS 1.3. No plaintext traffic.' },
              { title: 'API key hashing', desc: 'API keys are stored as hashed values. Even Iceberg cannot read your key after creation.' },
              { title: 'No data training', desc: 'Your data is never used to train models or improve Iceberg AI. Your data is yours.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-[#1a1a1a]">
                <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                <div>
                  <h3 className="font-medium mb-1">{f.title}</h3>
                  <p className="text-sm text-[#666]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Questions about security?</h2>
          <p className="text-[#666] mb-8">We're happy to discuss your compliance requirements.</p>
          <a href="mailto:hello@icebergdb.io" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">Contact us</a>
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
        <Link to="/" className="text-white font-bold text-lg">Iceberg</Link>
        <div className="flex gap-6">{['Privacy','Terms','Docs','Status'].map(l=><a key={l} href="#" className="hover:text-white transition">{l}</a>)}</div>
        <div>© 2026 Iceberg</div>
      </div>
    </footer>
  )
}
