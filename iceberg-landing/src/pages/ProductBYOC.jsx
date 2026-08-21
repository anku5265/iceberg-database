import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function ProductBYOC() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Iceberg BYOC</div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Your server.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Iceberg's power.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Deploy Iceberg on your own infrastructure — cloud or on-premise. Full data sovereignty. Zero traffic leaves your network. You stay in control.
        </p>
        <div className="flex gap-3">
          <a href="mailto:hello@icebergdb.io" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">Contact sales</a>
          <a href={`${D}/docs`} className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">Setup guide</a>
        </div>
      </section>

      {/* Who is it for */}
      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Use cases</p>
          <h2 className="text-3xl font-bold mb-12">Built for data-sensitive organizations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg>,
                title: 'Banks & NBFCs',
                desc: 'RBI mandates data localization. Deploy Iceberg inside your datacenter. No customer data leaves your network — ever.'
              },
              {
                icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>,
                title: 'Hospitals & Health-tech',
                desc: 'Patient records are sensitive. Run Iceberg on-premise. HIPAA-style data isolation with full AI search capabilities.'
              },
              {
                icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>,
                title: 'Government & Defence',
                desc: 'Air-gapped deployments supported. No internet required once installed. Full vector search on classified data.'
              },
            ].map((u, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">{u.icon}</div>
                <h3 className="font-semibold mb-2">{u.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Architecture</p>
          <h2 className="text-3xl font-bold mb-4">How BYOC works</h2>
          <p className="text-[#666] mb-12 max-w-2xl">Iceberg runs on your server. A secure outbound tunnel (Cloudflare) lets the Iceberg team provide support without touching your data.</p>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              {[
                { step: '01', title: 'Install Iceberg on your server', desc: 'One Docker command. Works on any Linux server — cloud VM, bare metal, or on-premise hardware.' },
                { step: '02', title: 'Activate your license', desc: 'Enter your BYOC license key. Iceberg validates it and starts up. All data stays on your machine.' },
                { step: '03', title: 'Connect your apps', desc: 'Use the same Iceberg API — same SDKs, same code. Just point to your local server URL instead of api.icebergdb.io.' },
                { step: '04', title: 'Support via secure tunnel', desc: 'If you need help, Iceberg team connects via Cloudflare Tunnel. You can close the tunnel anytime with one click.' },
              ].map((s, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-xs font-mono text-blue-500 mt-1 flex-shrink-0">{s.step}</span>
                  <div>
                    <h3 className="font-medium mb-1">{s.title}</h3>
                    <p className="text-sm text-[#666]">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
              <p className="text-xs text-[#555] mb-3">Quick install</p>
              <pre className="text-xs font-mono text-[#aaa] leading-6 overflow-x-auto">{`# Pull and run Iceberg
docker run -d \\
  -e BYOC_LICENSE_KEY=your_key \\
  -v /data/iceberg:/app/data \\
  -p 8000:8000 \\
  icebergdb/iceberg:latest

# Verify it's running
curl http://localhost:8000/health
# {"status": "ok"}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise features */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Enterprise ready</p>
          <h2 className="text-3xl font-bold mb-12">Built for serious data requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Full data sovereignty', desc: 'All data stays on your hardware. No data ever leaves your network — not for telemetry, not for training, not for anything.' },
              { title: 'Air-gap support', desc: 'Deploy in fully disconnected environments. Once installed, Iceberg runs entirely offline. No internet dependency at runtime.' },
              { title: 'Support via secure tunnel', desc: 'Need help? The Iceberg team connects via Cloudflare Tunnel — outbound only, you stay in control. Close it anytime with one click.' },
              { title: 'Same API, same SDKs', desc: 'Your existing code works unchanged. Just point to your local server URL. Python, JS, Java, Go, .NET, Rust — all supported.' },
              { title: 'Docker-based install', desc: 'One Docker command to deploy. Runs on any Linux server — AWS EC2, Azure VM, GCP Compute, or bare metal on-premise.' },
              { title: 'License-based activation', desc: 'Simple license key activation. Manage multiple on-premise deployments from a central dashboard.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-[#1a1a1a]">
                <svg className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                <div>
                  <h3 className="font-medium mb-1">{f.title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to deploy on your infrastructure?</h2>
          <p className="text-[#666] mb-8">Talk to us — we'll get you set up.</p>
          <a href="mailto:hello@icebergdb.io" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">Contact sales</a>
        </div>
      </section>
      <Footer />
    </div>
  )
}

function Check() { return <svg className="w-4 h-4 text-green-500 inline" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> }
function Cross() { return <svg className="w-4 h-4 text-[#444] inline" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> }
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
