import Footer from '../components/Footer'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { CodeBlock } from '../components/CodeBlock'
import { CANONICAL_SPEC } from '../config/canonicalSpec'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

export default function ProductSDK() {
  const [dark] = useState(true)
  const [active, setActive] = useState('python')
  const sdk = CANONICAL_SPEC.sdks.find((s) => s.id === active) || CANONICAL_SPEC.sdks[0]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-12 pb-10 md:pt-24 md:pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-blue-400 bg-[#111] mb-6 font-mono">
          <span>Official Iceberg SDKs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Your language.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Your stack.</span>
        </h1>
        <p className="text-lg text-[#888] max-w-2xl mb-10 leading-relaxed">
          Official SDKs for Python, JavaScript/TypeScript, Rust, .NET, Go, Java, and MCP Server — with identical API behavior across every runtime.
        </p>
        <div className="flex gap-3 flex-wrap">
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">
            Get your API key
          </a>
          <Link to="/docs" className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">
            Full API reference
          </Link>
        </div>
      </section>

      {/* Interactive SDK Explorer */}
      <section className="border-y border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3 font-mono">
            Quickstart
          </p>
          <h2 className="text-3xl font-bold mb-8">Pick your language</h2>

          <div className="flex gap-2 flex-wrap mb-6">
            {CANONICAL_SPEC.sdks.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                  active === s.id
                    ? 'bg-blue-600 text-white'
                    : 'border border-[#222] text-[#888] hover:text-white hover:border-[#444]'
                }`}
              >
                {s.language.split(' (')[0]}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <CodeBlock
                code={sdk.codeExample}
                label={sdk.language.split(' (')[0]}
              />
            </div>

            <div className="space-y-4">
              <CodeBlock code={sdk.installCmd} label="Install" />

              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0f14] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#777] uppercase tracking-wider">Package Info</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {sdk.displayVersion}
                  </span>
                </div>
                <div className="text-xs text-[#999] space-y-1.5">
                  <div>
                    <span className="text-[#666]">Package: </span>
                    <code className="text-white font-mono">{sdk.packageName}</code>
                  </div>
                  <div>
                    <span className="text-[#666]">Registry: </span>
                    <span className="text-[#ccc]">{sdk.registryName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1a1a1a] flex items-center gap-4">
                  <a
                    href={sdk.registryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition font-mono"
                  >
                    <span>{sdk.registryName}</span>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/anku5265/iceberg-database"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition font-mono"
                  >
                    <span>GitHub</span>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Framework integrations */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Integrations</p>
          <h2 className="text-3xl font-bold mb-12">Works with your existing stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['LangChain', 'LlamaIndex', 'OpenClaw', 'Hermes', 'CrewAI', 'MCP (Cursor)', 'FastAPI', 'Next.js'].map((f) => (
              <Link
                to="/integrations"
                key={f}
                className="rounded-xl border border-[#1a1a1a] p-4 text-center text-sm text-[#666] hover:text-white hover:border-[#333] transition block"
              >
                {f}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Start building in 30 seconds</h2>
          <p className="text-[#666] mb-8">Free API key — 100,000 vectors, built-in CPU embeddings, no credit card required.</p>
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">
            Get API key
          </a>
        </div>
      </section>
      <Footer />
    </div>
  )
}
