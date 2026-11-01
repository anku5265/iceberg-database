import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'

export default function Security() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-12 pb-10 md:pt-24 md:pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#888] bg-[#111] mb-6">
          Security, Data Residency &amp; Governance • v1.0.0
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Your data stays<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">in India.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Iceberg DB is engineered for Indian data residency and security from the ground up — hosted in India (<code className="text-[#aaa]">ap-south-1</code>) to support DPDP Act 2023 localization, with cryptographic SHA-256 API key hashing, strict Role-Based Access Control (RBAC), and multi-tenant storage isolation.
        </p>
      </section>

      <section className="border-y border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Data Localization &amp; Compliance</p>
          <h2 className="text-3xl font-bold mb-12">Built for Indian regulatory requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: 'DPDP Act 2023 Alignment',
                desc: 'Designed to help Data Fiduciaries comply with the Digital Personal Data Protection Act 2023. Vectors, document chunks, and agent memories remain in India with full tenant deletion and export controls.',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253"/></svg>,
              },
              {
                title: 'India Data Residency (ap-south-1)',
                desc: 'Primary compute, server-side ONNX CPU embeddings, and vector storage are hosted in India (ap-south-1). You do not need to send user prompts to US-hosted embedding APIs.',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>,
              },
              {
                title: 'BYOC VPC Deployment (RBI / BFSI)',
                desc: 'Regulated fintechs, NBFCs, and enterprises can deploy Iceberg DB inside their own AWS, GCP, or Azure India VPC using our Docker & Terraform BYOC templates.',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg>,
              },
            ].map((c, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">{c.icon}</div>
                <h3 className="font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-[#777] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Access Control</p>
          <h2 className="text-3xl font-bold mb-12">Strict RBAC — granular API key permissions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { role: 'admin', label: 'Admin', desc: 'Full control — create/delete collections, index & delete documents, create/revoke API keys, trigger snapshot backups, and manage billing.', color: 'text-red-400 border-red-900/30' },
              { role: 'read_write', label: 'Read-Write', desc: 'Data plane read & write — create collections, index/update/delete documents, store & recall agent memory, and run searches. Cannot manage API keys.', color: 'text-yellow-400 border-yellow-900/30' },
              { role: 'read_only', label: 'Read-Only', desc: 'Search & recall only — permitted on GET /collections, POST /search, and POST /memory/{id}/recall. Any write or delete attempt returns HTTP 403 Forbidden.', color: 'text-green-400 border-green-900/30' },
            ].map((r, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] p-5">
                <div className={`text-xs font-mono px-2 py-1 rounded border inline-block mb-3 ${r.color}`}>{r.role}</div>
                <h3 className="font-semibold mb-2">{r.label}</h3>
                <p className="text-sm text-[#777] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-[#1a1a1a] p-5">
            <p className="text-sm text-[#777]">
              Create scoped keys per microservice or environment. Revoke any key immediately from the dashboard or via <code className="text-[#aaa]">DELETE /auth/keys/&#123;key_id&#125;</code> without impacting other active keys.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Infrastructure &amp; Isolation</p>
          <h2 className="text-3xl font-bold mb-12">Defense-in-depth architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              { title: 'SHA-256 Cryptographic Key Hashing', desc: 'API keys (ib_...) are hashed using SHA-256 before persistence. Plaintext keys are never stored in our database and cannot be retrieved after creation.' },
              { title: 'Multi-Tenant Storage Isolation', desc: 'Every collection is isolated at the storage engine layer using deterministic tenant namespace prefixes (t_{uid8}__ and u_{uid8}__) so tenants can never read or overwrite each other’s collections.' },
              { title: 'TLS 1.3 In-Transit & Volume Encryption', desc: 'All client-to-gateway and internal service communication is encrypted over HTTPS/TLS 1.3. Persistent storage volumes and snapshots are encrypted at rest (AES-256).' },
              { title: 'Zero Training on Customer Data', desc: 'Your raw documents, search queries, embeddings, and agent memories are strictly isolated to your workspace and are never used to train external AI models.' },
              { title: 'Point-in-Time Snapshots & Data Export', desc: 'Trigger collection snapshots via POST /backup/create/{collection} or export all raw text chunks and metadata in standard JSON via GET /documents/{collection}/scroll.' },
              { title: 'Strict Input & Vector Validation', desc: 'All incoming vectors and payloads are validated for exact dimensionality (384d), finite float bounds (rejecting NaN/Inf with HTTP 422), and payload size limits.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-[#1a1a1a]">
                <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                <div>
                  <h3 className="font-medium mb-1">{f.title}</h3>
                  <p className="text-sm text-[#777]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Security inquiries or vulnerability disclosure?</h2>
          <p className="text-[#777] mb-8">
            To request our architecture whitepaper, discuss BYOC VPC deployments, or report a security issue under responsible disclosure, email our engineering team directly.
          </p>
          <a href="mailto:contact@icebergdb.in" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">
            contact@icebergdb.in
          </a>
        </div>
      </section>
      <Footer />
    </div>
  )
}
