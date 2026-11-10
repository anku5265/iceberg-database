import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <Navbar dark={true} />

      <main className="container mx-auto px-6 py-20 max-w-4xl flex-1">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-blue-500/20 text-blue-400 bg-blue-500/10 mb-4 font-medium">
            Legal, Privacy &amp; DPDP Act 2023 Governance (v1.0.0)
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Privacy Policy &amp; Data Processing Addendum (DPA)
          </h1>
          <p className="text-sm text-[#777]">
            Last Updated: November 6, 2026 • Effective Date: October 19, 2026 • Jurisdiction: Republic of India
          </p>
        </div>

        <div className="space-y-10 text-[#aaa] text-sm leading-relaxed border-t border-white/[0.08] pt-10">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Executive Overview &amp; DPDP Act 2023 Roles (Data Fiduciary vs. Data Processor)</h2>
            <p className="mb-3">
              Iceberg Database Technologies (&quot;Iceberg DB&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the cloud vector database, hybrid BM25+RRF search engine, and 4-tier cognitive agent memory platform at <strong className="text-white">icebergdb.in</strong>, <strong className="text-white">dashboard.icebergdb.in</strong>, and <strong className="text-white">api.icebergdb.in</strong>.
            </p>
            <p className="mb-3">
              Under India&apos;s <strong className="text-white">Digital Personal Data Protection (DPDP) Act, 2023</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Customer as Data Fiduciary (Section 2(i)):</strong> When you ingest documents, embeddings, or agent memories into your Iceberg DB workspace, you act as the <strong>Data Fiduciary</strong> (or Data Controller under GDPR). You retain 100% ownership of your data, determine the purpose and lawful basis of processing, and manage end-user consent.
              </li>
              <li>
                <strong className="text-white">Iceberg DB as Data Processor (Section 2(k) &amp; Section 8(5)):</strong> Iceberg DB acts strictly as a <strong>Data Processor</strong> on your behalf, executing indexing, embedding, storage, recall, and deletion commands authenticated by your <code className="text-blue-400">X-API-Key</code> within our domestic India (<code className="text-white">ap-south-1</code>) cluster.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. 100% India Data Residency (`ap-south-1`) &amp; End-to-End Data Flow</h2>
            <p className="mb-3">
              All production compute nodes, Qdrant HNSW vector indexes, Okapi BM25 inverted indexes, server-side ONNX CPU embedding workers (<code className="text-white">all-MiniLM-L6-v2</code>, 384d), and snapshot backups reside exclusively in <strong className="text-white">India (<code className="text-blue-400">ap-south-1</code>, Mumbai)</strong>:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong className="text-white">Ingress (TLS 1.3):</strong> Client SDK / REST requests terminate at <code className="text-white">https://api.icebergdb.in</code> over HTTPS / TLS 1.3.</li>
              <li><strong className="text-white">Authentication (SHA-256 + RBAC):</strong> API keys (<code className="text-white">ib_...</code>) are verified against irreversible SHA-256 hashes and scoped to <code className="text-white">admin</code>, <code className="text-white">read_write</code>, or <code className="text-white">read_only</code> permissions.</li>
              <li><strong className="text-white">Domestic CPU Embedding (Zero External AI Sharing):</strong> Text chunks are converted to 384-dimensional float32 vectors in RAM on domestic CPU nodes in <code className="text-white">ap-south-1</code>. <strong>0% of customer text or queries are sent to OpenAI, Anthropic, Cohere, or foreign embedding APIs.</strong></li>
              <li><strong className="text-white">Tenant-Isolated Storage (AES-256):</strong> Vectors and metadata are stored under deterministic tenant prefixes (<code className="text-white">t_&#123;uid8&#125;__</code> and <code className="text-white">u_&#123;uid8&#125;__</code>) on AES-256 encrypted NVMe volumes in <code className="text-white">ap-south-1</code>.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Categories of Information Processed</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Account &amp; Workspace Metadata:</strong> Name, work email address, password hash, and SHA-256 API key digests created via <code className="text-white">dashboard.icebergdb.in</code>.</li>
              <li><strong className="text-white">Customer Vector &amp; Document Payloads:</strong> 384d float32 embeddings, raw text chunks, PDF/TXT/MD extracts, JSON metadata, and 4-tier agent memory entries ingested via your API keys.</li>
              <li><strong className="text-white">Operational Telemetry:</strong> Request counts, latency percentiles, HTTP status codes, and vector quota utilization required for rate limiting, SLA monitoring, and billing.</li>
              <li><strong className="text-white">Billing &amp; Payment Metadata:</strong> Subscription checkouts are processed by PCI-DSS Level 1 certified Indian payment gateway <strong className="text-white">Razorpay</strong>. Iceberg DB never stores raw credit/debit card numbers or UPI PINs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Official Subprocessor Disclosure</h2>
            <p className="mb-3">
              Iceberg DB engages only the following audited subprocessors to deliver the service:
            </p>
            <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c0c12]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#888] font-mono uppercase bg-[#111118]">
                    <th className="py-3 px-4">Subprocessor</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Region</th>
                    <th className="py-3 px-4">Data Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-[#ccc]">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Domestic Cloud Infrastructure</td>
                    <td className="py-3 px-4">API Gateway, ONNX CPU Embeddings, Qdrant HNSW + BM25 NVMe Storage &amp; Snapshots</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">India (ap-south-1)</td>
                    <td className="py-3 px-4">Encrypted customer collections &amp; workspace state</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Razorpay Software Pvt. Ltd.</td>
                    <td className="py-3 px-4">INR / USD Subscription Checkout &amp; Invoicing</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">India</td>
                    <td className="py-3 px-4">Billing email &amp; subscription tier (Zero vector access)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Vercel Inc.</td>
                    <td className="py-3 px-4">Static Web Frontend CDN (icebergdb.in &amp; dashboard.icebergdb.in)</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">India Edge (bom1)</td>
                    <td className="py-3 px-4">Static UI assets only (Zero database payloads)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">External AI / LLM APIs</td>
                    <td className="py-3 px-4">None (Built-in ONNX CPU inference)</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">0% Shared</td>
                    <td className="py-3 px-4">Zero customer data shared with OpenAI/Anthropic/Cohere</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Retention, Right to Erasure &amp; 30-Day Backup Policy</h2>
            <p className="mb-3">
              In alignment with Section 8(7) and Section 12 of the DPDP Act 2023:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Point &amp; Collection Deletion (Immediate Active Purge):</strong> Calling <code className="text-blue-400">DELETE /documents/&#123;collection&#125;/points/&#123;id&#125;</code> or <code className="text-blue-400">DELETE /collections/&#123;name&#125;</code> synchronously removes the targeted vectors, BM25 entries, and payloads from active RAM and disk indexes in under <strong className="text-white">1 second</strong>.
              </li>
              <li>
                <strong className="text-white">Backup &amp; Snapshot Lifecycle (30-Day Maximum Window):</strong> Deleted points and collections age out of encrypted disaster-recovery snapshots within a strict <strong className="text-white">30-day rolling retention window</strong>.
              </li>
              <li>
                <strong className="text-white">Workspace Termination (72-Hour Active Erasure):</strong> Upon account deletion request, all collections, projects, and SHA-256 API keys are permanently purged from active storage within <strong className="text-white">72 hours</strong> (and from rolling backups within 30 days).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Customer Data Export &amp; Portability (Zero Vendor Lock-In)</h2>
            <p>
              You may export 100% of your indexed text chunks, 384d vectors, and JSON metadata at any time without egress fees via <code className="text-blue-400">GET https://api.icebergdb.in/documents/&#123;collection&#125;/scroll?limit=100&amp;offset=0</code> or create downloadable collection snapshots via <code className="text-blue-400">POST /backup/create/&#123;collection&#125;</code>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Security Incident &amp; Breach Notification Protocol (&le; 72 Hours)</h2>
            <p>
              In accordance with Section 8(6) of the DPDP Act 2023 and CERT-In directives, in the event of a confirmed personal data breach affecting customer collections, Iceberg DB will notify affected workspace administrators via email within <strong className="text-white">72 hours</strong> of confirmation (alongside required statutory notifications to CERT-In and the Data Protection Board of India), detailing affected namespaces, root cause, and remediation actions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Data Protection Officer (DPO) &amp; Grievance Redressal Contact</h2>
            <p className="mb-3">
              For DPDP Act 2023 inquiries, countersigned Enterprise Data Processing Agreements (DPA), or data erasure/portability requests, contact our Grievance &amp; Data Protection Officer:
            </p>
            <div className="bg-[#101015] border border-white/[0.08] rounded-xl p-4 font-mono text-xs text-blue-400 leading-relaxed">
              Grievance &amp; Data Protection Officer: Ankush (Founder &amp; Lead Systems Engineer)<br />
              Email: contact@icebergdb.in<br />
              Response SLA: Acknowledgement within 24 hours • Resolution within 7 business days<br />
              Organization: Iceberg Database Technologies (Himachal Pradesh, India • Cluster: ap-south-1 Mumbai)
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
