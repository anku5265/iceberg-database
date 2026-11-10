import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'
import { CANONICAL_SPEC } from '../config/canonicalSpec'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

export default function Pricing() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <Navbar dark={dark} />

      <main className="container mx-auto px-6 py-16 md:py-24 max-w-6xl flex-1">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border border-blue-500/20 text-blue-400 bg-blue-500/10 mb-5 font-mono">
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Built for India. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Priced for India.</span>
          </h1>
          <p className="text-sm md:text-base text-[#888] leading-relaxed">
            Transparent INR and USD pricing with zero hidden fees. Start free with 100,000 vectors, built-in CPU embeddings, and zero cluster pausing.
          </p>
        </div>

        {/* 4 Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CANONICAL_SPEC.plans.map((p) => (
            <div
              key={p.id}
              className="relative rounded-2xl p-6 flex flex-col border transition-all duration-300"
              style={{
                background: p.popular
                  ? 'linear-gradient(160deg,rgba(37,99,235,0.09),rgba(124,58,237,0.05))'
                  : 'rgba(255,255,255,0.025)',
                borderColor: p.popular ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)',
              }}
            >
              {p.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}
                >
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#aaa]">
                  {p.name}
                </span>
                <span className="text-xs font-mono text-blue-400">
                  {p.priceUsd}{p.period}
                </span>
              </div>

              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl md:text-4xl font-black text-white">{p.priceInr}</span>
                <span className="text-sm pb-1 text-[#888]">{p.period}</span>
              </div>

              {p.yearlyInr ? (
                <div className="text-xs text-[#777] mb-6 font-mono">
                  {p.yearlyInr} ({p.yearlyUsd}) • 2 months free
                </div>
              ) : (
                <div className="text-xs text-emerald-400/90 mb-6 font-mono">
                  Forever free • No credit card
                </div>
              )}

              <ul className="space-y-3 flex-1 mb-6">
                {p.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-[#bbb]">
                    <svg
                      className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`${D}/signup`}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all text-center block ${
                  p.popular
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'border border-white/10 hover:border-white/25 text-white bg-white/[0.03]'
                }`}
              >
                {p.id === 'free' ? 'Start for free' : `Choose ${p.name}`}
              </a>
            </div>
          ))}
        </div>

        {/* Clean Enterprise / Custom Contact Strip */}
        <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0d0d12] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-base font-bold text-white">Need custom enterprise volume or self-hosted BYOC?</div>
            <div className="text-xs text-[#888] mt-1">
              Deploy dedicated clusters or run Iceberg DB inside your own AWS, GCP, or Azure VPC.
            </div>
          </div>
          <Link
            to="/contact"
            className="text-xs font-semibold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shrink-0"
          >
            Contact Sales →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
