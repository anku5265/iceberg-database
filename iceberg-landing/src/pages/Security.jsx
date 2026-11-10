import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'

export default function Security() {
  const [dark] = useState(true)

  const dataFlowSteps = [
    {
      step: 'Step 1',
      title: 'TLS 1.3 Encrypted Client Ingress',
      endpoint: 'https://api.icebergdb.in',
      desc: 'All traffic from official v1.0.0 SDKs, MCP clients, and REST endpoints is encrypted in transit over HTTPS / TLS 1.3 with strict cipher suites.',
    },
    {
      step: 'Step 2',
      title: 'SHA-256 Key Verification & RBAC Gate',
      endpoint: 'X-API-Key Header Validation (1.2 ms)',
      desc: 'Incoming API keys (ib_...) are hashed in memory via SHA-256 and matched against irreversible key digests. RBAC role (admin, read_write, read_only) is enforced before touching storage.',
    },
    {
      step: 'Step 3',
      title: 'In-Memory Domestic ONNX CPU Embedding',
      endpoint: 'all-MiniLM-L6-v2 (384d float32 in ap-south-1)',
      desc: 'Raw text chunks are embedded directly in RAM on our India (ap-south-1) CPU nodes in 48.2 ms min / 112.3 ms p50. Zero text or prompts are ever sent to external US-based LLM APIs (0% shared with OpenAI/Anthropic/Cohere).',
    },
    {
      step: 'Step 4',
      title: 'Tenant-Isolated AES-256 NVMe Storage (Mumbai)',
      endpoint: 't_{uid8}__{collection} • Qdrant HNSW + Okapi BM25',
      desc: '384d vectors, BM25 inverted indexes, and JSON payloads are persisted on AES-256 encrypted NVMe volumes in India (ap-south-1) with deterministic namespace isolation.',
    },
  ]

  const subprocessors = [
    {
      name: 'Domestic Cloud Compute & NVMe Storage Cluster',
      scope: 'Primary API Gateway, ONNX CPU Embedding Engine, Qdrant HNSW & BM25 Storage, Encrypted Snapshots',
      location: 'India (ap-south-1, Mumbai)',
      dataAccess: 'Encrypted vector collections, document chunks & agent memory payloads (AES-256 at rest)',
    },
    {
      name: 'Razorpay Software Pvt. Ltd. (PCI-DSS Level 1)',
      scope: 'Subscription Billing, UPI / Card Checkout & Webhook Provisioning',
      location: 'India',
      dataAccess: 'Billing email, invoice metadata & subscription plan tier only (Zero access to vectors or documents)',
    },
    {
      name: 'Vercel Inc. (Frontend Edge CDN)',
      scope: 'Static React UI Hosting for icebergdb.in & dashboard.icebergdb.in',
      location: 'Global Edge / India PoP (bom1)',
      dataAccess: 'Static HTML/JS/CSS assets only (Zero customer vector collections or database backups stored)',
    },
    {
      name: 'External Third-Party LLM / Embedding APIs',
      scope: 'None — 100% Self-Contained Server-Side ONNX Runtime (all-MiniLM-L6-v2)',
      location: 'N/A (0% External Sharing)',
      dataAccess: 'None — Customer documents and queries are never transmitted to OpenAI, Cohere, or Anthropic',
    },
  ]

  const retentionRules = [
    {
      action: 'Single Point Deletion',
      trigger: 'DELETE /documents/{collection}/points/{point_id}',
      activePurge: 'Immediate (< 1 second synchronous removal from HNSW graph & BM25 index)',
      backupPurge: 'Aged out of rolling snapshots within 30 days',
    },
    {
      action: 'Full Collection Deletion',
      trigger: 'DELETE /collections/{name} or Dashboard UI',
      activePurge: 'Immediate (< 1 second purge of all vectors, payloads & RAM caches)',
      backupPurge: 'Purged from encrypted disaster-recovery snapshots within 30 days',
    },
    {
      action: '4-Tier Agent Memory Expiry',
      trigger: 'TTL Policy or POST /memory/decay',
      activePurge: 'short_term: 1h TTL • episodic: 30d TTL • Immediate via API delete',
      backupPurge: 'Purged within 30-day rolling snapshot window',
    },
    {
      action: 'Account / Workspace Termination',
      trigger: 'Account deletion request via Dashboard or contact@icebergdb.in',
      activePurge: 'Complete cryptographic erasure of collections & SHA-256 keys within 72 hours',
      backupPurge: 'Final backup purge completed within 30 days of termination',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-12 pb-10 md:pt-24 md:pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#888] bg-[#111] mb-6">
          Security, India Data Residency &amp; DPDP Act 2023 Governance • v1.0.0
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Your data stays<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">in India (ap-south-1).</span>
        </h1>
        <p className="text-lg text-[#999] max-w-3xl mb-8 leading-relaxed">
          Iceberg DB provides <strong className="text-white">100% India data residency (<code className="text-blue-400">ap-south-1</code> Mumbai)</strong> with technical and organizational controls engineered to help Data Fiduciaries meet India&apos;s <strong className="text-white">Digital Personal Data Protection (DPDP) Act, 2023</strong> — backed by transparent Data Processing Agreement (DPA) roles, subprocessor disclosures, 30-day backup lifecycle bounds, 72-hour breach notification commitments, and zero-lock-in data export.
        </p>
        <div className="flex flex-wrap gap-3 text-xs font-mono">
          <a href="#dpdp-governance" className="px-3.5 py-2 rounded-lg bg-[#121218] border border-white/[0.08] text-blue-400 hover:border-blue-500/40 transition">1. DPDP Roles &amp; DPA</a>
          <a href="#data-flow" className="px-3.5 py-2 rounded-lg bg-[#121218] border border-white/[0.08] text-blue-400 hover:border-blue-500/40 transition">2. End-to-End Data Flow</a>
          <a href="#subprocessors" className="px-3.5 py-2 rounded-lg bg-[#121218] border border-white/[0.08] text-blue-400 hover:border-blue-500/40 transition">3. Subprocessor List</a>
          <a href="#retention-deletion" className="px-3.5 py-2 rounded-lg bg-[#121218] border border-white/[0.08] text-blue-400 hover:border-blue-500/40 transition">4. Retention &amp; Backup Policy</a>
          <a href="#breach-export" className="px-3.5 py-2 rounded-lg bg-[#121218] border border-white/[0.08] text-blue-400 hover:border-blue-500/40 transition">5. 72h Breach &amp; Export SLA</a>
        </div>
      </section>

      {/* Section 1: DPDP Act 2023 Roles & DPA Framework */}
      <section id="dpdp-governance" className="border-y border-[#161616] py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">1. DPDP Act 2023 Legal &amp; Technical Governance</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Clear Data Fiduciary vs. Data Processor Responsibility</h2>
          <p className="text-sm text-[#888] max-w-3xl mb-8 leading-relaxed">
            Compliance under the Digital Personal Data Protection Act, 2023 (India) is a shared responsibility between the application owner (<strong>Data Fiduciary</strong>) and the cloud infrastructure provider (<strong>Data Processor</strong>). Iceberg DB defines these boundaries transparently:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="rounded-xl border border-[#1f1f26] bg-[#0d0d12] p-6">
              <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded inline-block mb-3">
                Customer = Data Fiduciary
              </div>
              <h3 className="font-bold text-base mb-2">100% Customer Data Ownership</h3>
              <p className="text-xs text-[#888] leading-relaxed">
                Under Section 2(i) of the DPDP Act 2023, you act as the <strong>Data Fiduciary</strong>. You retain 100% ownership and intellectual property rights over all ingested documents, 384d embeddings, and agent memories, and control what personal data is indexed and when it is erased.
              </p>
            </div>

            <div className="rounded-xl border border-[#1f1f26] bg-[#0d0d12] p-6">
              <div className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded inline-block mb-3">
                Iceberg DB = Data Processor
              </div>
              <h3 className="font-bold text-base mb-2">Domestic Processing Only (ap-south-1)</h3>
              <p className="text-xs text-[#888] leading-relaxed">
                Under Section 2(k) and Section 8(5) of the DPDP Act 2023, Iceberg DB acts strictly as a <strong>Data Processor</strong>. We process vectors and text solely according to your authenticated API calls within India (<code className="text-white">ap-south-1</code>) and never use customer data for model training.
              </p>
            </div>

            <div className="rounded-xl border border-[#1f1f26] bg-[#0d0d12] p-6">
              <div className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded inline-block mb-3">
                DPA &amp; BYOC VPC Ready
              </div>
              <h3 className="font-bold text-base mb-2">Enterprise DPA &amp; Self-Hosted BYOC</h3>
              <p className="text-xs text-[#888] leading-relaxed">
                Our standard Data Processing Addendum (DPA) is built into our <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>. Regulated RBI/BFSI and healthcare teams can also deploy Iceberg DB inside their own AWS/GCP/Azure India VPC via <a href="/product/byoc" className="text-blue-400 hover:underline">BYOC</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: End-to-End Domestic Data Flow Architecture */}
      <section id="data-flow" className="border-b border-[#161616] py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">2. End-to-End Domestic Data-Flow Architecture</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How your data moves and where it lives in India</h2>
          <p className="text-sm text-[#888] max-w-3xl mb-8 leading-relaxed">
            Every stage of ingestion, server-side ONNX CPU embedding, hybrid search, and snapshot storage executes inside our domestic India (<code className="text-white">ap-south-1</code>) boundary without cross-border hops:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataFlowSteps.map((item, i) => (
              <div key={i} className="rounded-xl border border-[#1f1f26] bg-[#0d0d12] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                    {item.step}
                  </span>
                  <code className="text-[11px] text-[#888] font-mono">{item.endpoint}</code>
                </div>
                <h3 className="font-bold text-base text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-[#888] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Subprocessor Disclosure Table */}
      <section id="subprocessors" className="border-b border-[#161616] py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">3. Subprocessor Disclosure</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Transparent Third-Party Subprocessor Registry</h2>
          <p className="text-sm text-[#888] max-w-3xl mb-6 leading-relaxed">
            We maintain a minimal, audited subprocessor footprint. Customer documents, embeddings, and search queries are never routed to external third-party AI or embedding providers:
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#1f1f26] bg-[#0d0d12]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#999] font-mono uppercase bg-[#111118]">
                  <th className="py-3.5 px-4">Subprocessor / Subsystem</th>
                  <th className="py-3.5 px-4">Operational Scope</th>
                  <th className="py-3.5 px-4">Processing Location</th>
                  <th className="py-3.5 px-4">Data Scope &amp; Safeguards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[#ccc]">
                {subprocessors.map((sub, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-semibold text-white">{sub.name}</td>
                    <td className="py-3.5 px-4 text-[#aaa]">{sub.scope}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">{sub.location}</td>
                    <td className="py-3.5 px-4 text-[#999]">{sub.dataAccess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 4: Data Retention, Deletion & Backup Lifecycle */}
      <section id="retention-deletion" className="border-b border-[#161616] py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">4. Data Retention, Right to Erasure &amp; Backup Lifecycle</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Deterministic Deletion &amp; 30-Day Snapshot Retention</h2>
          <p className="text-sm text-[#888] max-w-3xl mb-6 leading-relaxed">
            In alignment with Section 8(7) and Section 12 of the DPDP Act 2023 (Right to Correction and Erasure), deletions executed via our REST API or SDKs take effect immediately in active storage and age out of encrypted backups on a fixed schedule:
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#1f1f26] bg-[#0d0d12]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#999] font-mono uppercase bg-[#111118]">
                  <th className="py-3.5 px-4">Deletion / Retention Event</th>
                  <th className="py-3.5 px-4">API / Control Trigger</th>
                  <th className="py-3.5 px-4">Active Index &amp; RAM Purge</th>
                  <th className="py-3.5 px-4">Backup &amp; Snapshot Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[#ccc]">
                {retentionRules.map((rule, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-semibold text-white">{rule.action}</td>
                    <td className="py-3.5 px-4 font-mono text-blue-400">{rule.trigger}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium">{rule.activePurge}</td>
                    <td className="py-3.5 px-4 text-[#999]">{rule.backupPurge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5: Breach Notification Protocol & Customer Data Export */}
      <section id="breach-export" className="border-b border-[#161616] py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#1f1f26] bg-[#0d0d12] p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Security Breach Notification Protocol</h3>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25">
                  &le; 72-Hour Notice SLA
                </span>
              </div>
              <p className="text-xs text-[#888] leading-relaxed mb-4">
                In accordance with Section 8(6) of the DPDP Act 2023 and Indian Computer Emergency Response Team (CERT-In) directives, Iceberg DB maintains a formal incident response and breach notification procedure:
              </p>
              <ul className="space-y-2.5 text-xs text-[#ccc]">
                <li>
                  <strong className="text-white">Customer Notification (&le; 72 Hours):</strong> Confirmed unauthorized access or personal data breaches impacting customer collections are reported to affected workspace administrators within <strong>72 hours</strong> of confirmation.
                </li>
                <li>
                  <strong className="text-white">Regulatory Reporting (CERT-In &amp; DPDP Board):</strong> Reportable cyber incidents are notified to CERT-In and the Data Protection Board of India within statutory timelines.
                </li>
                <li>
                  <strong className="text-white">Post-Incident Forensics Report:</strong> Includes affected tenant namespace IDs (<code className="text-blue-400">t_&#123;uid8&#125;__</code>), root-cause analysis, and cryptographic key revocation actions.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#1f1f26] bg-[#0d0d12] p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Zero Lock-In Customer Data Export</h3>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Self-Service JSON Scroll
                </span>
              </div>
              <p className="text-xs text-[#888] leading-relaxed mb-4">
                You are never locked into Iceberg DB. You can export 100% of your indexed text chunks, 384d vectors, JSON metadata, and collection snapshots at any time via standard REST APIs:
              </p>
              <pre className="text-[11px] font-mono bg-[#08080c] border border-white/[0.07] rounded-lg p-3.5 text-emerald-300 overflow-x-auto mb-3 leading-relaxed">
{`# Export all documents & metadata in paginated JSON:
curl -H "X-API-Key: ib_your_key" \\
  "https://api.icebergdb.in/documents/my_docs/scroll?limit=100&offset=0"

# Trigger & list point-in-time collection snapshots:
curl -X POST -H "X-API-Key: ib_your_key" \\
  "https://api.icebergdb.in/backup/create/my_docs"`}
              </pre>
              <p className="text-[11px] text-[#777]">
                No egress fees or administrative approval required for data exports on any plan tier (including Free).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Strict RBAC & Defense-in-Depth */}
      <section className="border-b border-[#161616] py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Access Control &amp; Cryptographic Isolation</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Strict RBAC — granular API key permissions</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { role: 'admin', label: 'Admin', desc: 'Full control — create/delete collections, index & delete documents, create/revoke API keys, trigger snapshot backups, and manage billing.', color: 'text-red-400 border-red-900/30' },
              { role: 'read_write', label: 'Read-Write', desc: 'Data plane read & write — create collections, index/update/delete documents, store & recall agent memory, and run searches. Cannot manage API keys.', color: 'text-yellow-400 border-yellow-900/30' },
              { role: 'read_only', label: 'Read-Only', desc: 'Search & recall only — permitted on GET /collections, POST /search, and POST /memory/{id}/recall. Any write or delete attempt returns HTTP 403 Forbidden.', color: 'text-green-400 border-green-900/30' },
            ].map((r, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d12] p-5">
                <div className={`text-xs font-mono px-2 py-1 rounded border inline-block mb-3 ${r.color}`}>{r.role}</div>
                <h3 className="font-semibold mb-2">{r.label}</h3>
                <p className="text-sm text-[#777] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'SHA-256 Cryptographic Key Hashing', desc: 'API keys (ib_...) are hashed using SHA-256 before persistence. Plaintext keys are never stored in our database and cannot be retrieved after creation.' },
              { title: 'Multi-Tenant Storage Isolation', desc: 'Every collection is isolated at the storage engine layer using deterministic tenant namespace prefixes (t_{uid8}__ and u_{uid8}__) so tenants can never read or overwrite each other’s collections.' },
              { title: 'TLS 1.3 In-Transit & AES-256 Volume Encryption', desc: 'All client-to-gateway and internal service communication is encrypted over HTTPS/TLS 1.3. Persistent storage volumes and snapshots are encrypted at rest (AES-256).' },
              { title: 'Strict Input & Vector Validation', desc: 'All incoming vectors and payloads are validated for exact dimensionality (384d), finite float bounds (rejecting NaN/Inf with HTTP 422), and payload size limits.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-[#1a1a1a] bg-[#0d0d12]">
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

      <section className="py-16">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Request Countersigned DPA or Report a Vulnerability</h2>
          <p className="text-sm text-[#888] mb-8 leading-relaxed">
            To request a countersigned Data Processing Agreement (DPA), discuss BYOC VPC deployments for RBI/BFSI compliance, or report a security vulnerability under responsible disclosure, contact our Data Protection &amp; Engineering desk:
          </p>
          <a href="mailto:contact@icebergdb.in" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition inline-block">
            contact@icebergdb.in
          </a>
        </div>
      </section>
      <Footer />
    </div>
  )
}
