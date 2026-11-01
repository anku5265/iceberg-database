import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const copyEmail = () => {
    navigator.clipboard.writeText('contact@icebergdb.in')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Iceberg DB Inquiry from ${formData.name}`)
    const body = encodeURIComponent(`Hi Iceberg Team,\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=contact@icebergdb.in&su=${subject}&body=${body}`, '_blank')
    setFormSent(true)
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <Navbar dark={true} />

      <main className="container mx-auto px-6 py-20 max-w-5xl flex-1">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border border-blue-500/20 text-blue-400 bg-blue-500/10 mb-6 font-medium">
            About Iceberg DB • Contact &amp; Support
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Built in India for AI Builders.
          </h1>
          <p className="text-lg text-[#888] leading-relaxed">
            Have questions about our India-hosted vector engine (<code className="text-[#bbb]">ap-south-1</code>), enterprise BYOC deployments, or architecture? Reach out directly.
          </p>
        </div>

        {/* Company, Founder & Engineering Transparency Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-6 md:p-8 mb-12 shadow-xl">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">Company &amp; Mission</div>
              <h2 className="text-lg font-bold text-white mb-2">Iceberg Database Technologies</h2>
              <p className="text-xs text-[#888] leading-relaxed">
                Independent AI infrastructure engineering based in Himachal Pradesh, India, with primary cloud vector and embedding clusters hosted in India (<code className="text-[#bbb]">ap-south-1</code>) to eliminate 200ms US/EU cross-border latency and support DPDP Act 2023 localization.
              </p>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">Founder &amp; Engineering</div>
              <h2 className="text-lg font-bold text-white mb-2">Ankush — Founder &amp; Lead Engineer</h2>
              <p className="text-xs text-[#888] leading-relaxed mb-3">
                Direct engineering support with zero middleman layers. Verify our open-source SDKs, benchmarks, and public packages across registries:
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <a href="https://github.com/anku5265/iceberg-database" target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400">GitHub @anku5265</a>
                <a href="https://www.linkedin.com/in/ankush-a-96518a39b/" target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400">LinkedIn</a>
                <a href="https://x.com/igankush33" target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400">X @igankush33</a>
              </div>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">Zero Vendor Lock-In Guarantee</div>
              <h2 className="text-lg font-bold text-white mb-2">Open Standards &amp; Data Ownership</h2>
              <p className="text-xs text-[#888] leading-relaxed">
                Powered by FastAPI, Qdrant HNSW (<code className="text-[#bbb]">384d</code> Cosine), Okapi BM25 + RRF, and ONNX <code className="text-[#bbb]">all-MiniLM-L6-v2</code>. Export 100% of your raw text chunks, metadata, and snapshots anytime via <code className="text-[#bbb]">GET /documents/&#123;col&#125;/scroll</code> or self-host via Docker/Terraform BYOC.
              </p>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left Column: Direct Inboxes & Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">General, Support &amp; Enterprise Inquiries</h3>
                  <p className="text-xs text-[#888]">Primary engineering, security &amp; sales inbox</p>
                </div>
              </div>

              <div className="bg-[#15151c] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between gap-3 mb-4">
                <span className="font-mono text-sm text-blue-400 select-all font-medium">contact@icebergdb.in</span>
                <button
                  onClick={copyEmail}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-3">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@icebergdb.in&su=Iceberg+DB+Inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                  Open in Gmail
                </a>
                <a
                  href="mailto:contact@icebergdb.in"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition text-white"
                >
                  Default Mail App
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4">
                <div className="text-xs text-[#666] uppercase tracking-wider font-semibold mb-1">Developer Support</div>
                <div className="font-mono text-sm text-[#ddd]">contact@icebergdb.in</div>
                <div className="text-xs text-[#777] mt-1">Direct founder &amp; engineer support</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4">
                <div className="text-xs text-[#666] uppercase tracking-wider font-semibold mb-1">Infrastructure Region</div>
                <div className="font-medium text-sm text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Hosted in India (ap-south-1)
                </div>
                <div className="text-xs text-[#777] mt-1">DPDP Act 2023 Compliant</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                ⚡
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Fast Engineering Response</div>
                <div className="text-xs text-[#888]">We typically respond within 2 to 4 hours on business days.</div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Message Form */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-2">Send us a direct message</h2>
            <p className="text-sm text-[#777] mb-6">Fill out the quick form below and we&apos;ll reply directly to your inbox.</p>

            {formSent ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-xl">
                  ✓
                </div>
                <h3 className="font-bold text-white mb-1">Message Prepared!</h3>
                <p className="text-xs text-[#aaa]">Your email client or Gmail has opened to send this note to contact@icebergdb.in.</p>
                <button
                  onClick={() => setFormSent(false)}
                  className="mt-4 text-xs text-blue-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#aaa] mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ankush"
                    className="w-full px-4 py-2.5 bg-[#15151c] border border-white/[0.08] rounded-xl text-sm text-white placeholder-[#555] outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#aaa] mb-1.5">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 bg-[#15151c] border border-white/[0.08] rounded-xl text-sm text-white placeholder-[#555] outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#aaa] mb-1.5">How can we help?</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your AI project, vector scaling requirements, or questions..."
                    className="w-full px-4 py-2.5 bg-[#15151c] border border-white/[0.08] rounded-xl text-sm text-white placeholder-[#555] outline-none focus:border-blue-500 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-600/20"
                >
                  Send Message to contact@icebergdb.in
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
