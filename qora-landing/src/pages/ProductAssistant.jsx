import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function ProductAssistant() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Qora Assistant</div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Upload docs.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Get a chatbot instantly.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          No-code RAG chatbot builder. Upload your documents, configure your LLM, and deploy to your website or WhatsApp — in minutes.
        </p>
        <div className="flex gap-3">
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">Create assistant</a>
          <a href={`${D}/docs`} className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">View docs</a>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl font-bold mb-12">Three steps to a live chatbot</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create assistant', desc: 'Name it, set a greeting, pick your LLM (OpenAI or Gemini), choose a color. Done in 30 seconds.' },
              { step: '02', title: 'Upload documents', desc: 'Upload PDFs, .txt files, or any text. Qora chunks and indexes everything automatically. Your chatbot now knows your content.' },
              { step: '03', title: 'Deploy anywhere', desc: 'Paste one line of JS on your website. Or point your WhatsApp Business webhook to the provided URL. Live instantly.' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <div className="text-xs font-mono text-[#444] mb-3">{s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Deploy channels</p>
          <h2 className="text-3xl font-bold mb-4">Meet your users where they are</h2>
          <p className="text-[#666] mb-12 max-w-2xl">Two deployment channels built in — embed on any website with one line of code, or connect to WhatsApp Business. No extra setup, no third-party services.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#1a1a1a] p-6">
              <div className="text-blue-400 mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/></svg>
              </div>
              <h3 className="font-semibold mb-2">Website embed widget</h3>
              <p className="text-sm text-[#666] leading-relaxed mb-4">One line of JavaScript. Paste it anywhere — WordPress, Webflow, custom HTML. A chat bubble appears in the bottom-right corner.</p>
              <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-xs font-mono text-[#aaa] overflow-x-auto">{`<script src="https://api.qora.in/assistant/YOUR_ID/widget.js"></script>`}</pre>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] p-6">
              <div className="text-green-400 mb-4">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.267a.5.5 0 0 0 .624.633l5.532-1.437A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.959 9.959 0 0 1-5.341-1.548l-.383-.23-3.28.852.88-3.164-.251-.399A9.964 9.964 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              </div>
              <h3 className="font-semibold mb-2">WhatsApp Business</h3>
              <p className="text-sm text-[#666] leading-relaxed mb-4">Point your WhatsApp Business API webhook to Qora. Users message your WhatsApp number — the assistant answers from your documents automatically.</p>
              <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-xs font-mono text-[#aaa] overflow-x-auto">{`Webhook URL:\nhttps://api.qora.in/assistant/YOUR_ID/whatsapp`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* LLM support */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">LLM support</p>
          <h2 className="text-3xl font-bold mb-4">Bring your own LLM</h2>
          <p className="text-[#666] mb-12 max-w-2xl">Qora handles retrieval. You choose the generation model. Swap anytime without touching your documents.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'OpenAI', models: 'GPT-3.5, GPT-4, GPT-4o', status: 'Supported' },
              { name: 'Google Gemini', models: 'Gemini Pro, Gemini Flash', status: 'Supported' },
              { name: 'Qora AI', models: 'Coming soon — India-hosted model', status: 'Soon' },
            ].map((l, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">{l.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${l.status === 'Soon' ? 'text-[#555] border-[#333]' : 'text-green-400 border-green-900/40 bg-green-950/30'}`}>{l.status}</span>
                </div>
                <p className="text-xs text-[#555]">{l.models}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full features */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Everything included</p>
          <h2 className="text-3xl font-bold mb-12">What you get out of the box</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'No-code document upload', desc: 'Upload PDFs, text files via dashboard or API. Qora chunks and indexes automatically — no preprocessing needed.' },
              { title: 'Website embed — one line', desc: 'Paste a single script tag on any website. Chat bubble appears in the bottom-right corner, styled with your brand color.' },
              { title: 'WhatsApp Business integration', desc: 'Point your WhatsApp Business webhook to Qora. Users message your number — the assistant answers from your documents.' },
              { title: 'Custom greeting & branding', desc: 'Set your assistant name, greeting message, and accent color. Matches your product, not Qora.' },
              { title: 'OpenAI & Gemini support', desc: 'Bring your own API key for OpenAI or Google Gemini. Swap models anytime without touching your documents.' },
              { title: 'Multi-assistant support', desc: 'Create separate assistants for different use cases — support bot, onboarding bot, sales bot — each with its own document set.' },
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
          <h2 className="text-3xl font-bold mb-4">Build your first assistant</h2>
          <p className="text-[#666] mb-8">Free tier — full assistant API included.</p>
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">Get started free</a>
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
