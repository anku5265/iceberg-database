import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <Navbar dark={true} />

      <main className="container mx-auto px-6 py-20 max-w-4xl flex-1">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-blue-500/20 text-blue-400 bg-blue-500/10 mb-4 font-medium">
            Legal & Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-[#777]">Last Updated: October 19, 2026 • Effective Date: October 19, 2026</p>
        </div>

        <div className="space-y-10 text-[#aaa] text-sm leading-relaxed border-t border-white/[0.08] pt-10">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Executive Overview & Data Philosophy</h2>
            <p className="mb-3">
              Iceberg Database ("Iceberg", "we", "us", or "our") operates the high-performance serverless vector database platform available at <strong className="text-white">icebergdb.in</strong> and related subdomains. We believe your data belongs exclusively to you.
            </p>
            <p>
              Unlike legacy international providers that route data across global borders, Iceberg is built with strict <strong className="text-white">India Data Residency</strong> and full compliance with India's <strong className="text-white">Digital Personal Data Protection (DPDP) Act, 2023</strong> and international GDPR principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Data Residency Guarantee — Hosted in India (ap-south-1)</h2>
            <p className="mb-3">
              All production clusters, HNSW vector indexes, embedded documents, and metadata are hosted on sovereign cloud infrastructure located exclusively in <strong className="text-white">India (ap-south-1)</strong>.
            </p>
            <p>
              Your vector embeddings and text payloads never leave Indian borders. We do not transmit customer data outside the Republic of India under any operational circumstance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Account Information:</strong> Name, work email address, and authentication credentials when you register via dashboard.icebergdb.in.</li>
              <li><strong className="text-white">Vector & Document Payloads:</strong> High-dimensional embeddings, document text, and JSON metadata ingested via our REST APIs and SDKs.</li>
              <li><strong className="text-white">Operational Telemetry:</strong> Query latency metrics, vector counts, API error rates, and request volumes utilized strictly for service billing and reliability.</li>
              <li><strong className="text-white">Payment Data:</strong> Subscription transactions are processed via PCI-DSS compliant Indian payment partners (Razorpay). Iceberg does not store credit card numbers or UPI PINs on its servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. How We Use and Protect Customer Data</h2>
            <p className="mb-3">
              We process your data strictly to index, store, and execute nearest-neighbor vector similarity queries requested by your authorized API keys.
            </p>
            <p className="mb-3">
              <strong className="text-white">We never sell, rent, or monetize your data.</strong> We do not use customer vector embeddings or stored text documents to train proprietary foundation models without explicit contractual agreement.
            </p>
            <p>
              All data in transit is encrypted using modern TLS 1.3 encryption. Data at rest is secured using AES-256 standard encryption.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Retention, Portability & Deletion (Right to Erasure)</h2>
            <p className="mb-3">
              In full compliance with Section 8 of the DPDP Act 2023, you maintain complete ownership and control over your data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Calling the <code className="text-blue-400 bg-white/5 px-2 py-0.5 rounded font-mono">DELETE /collections/{"{name}"}</code> endpoint immediately purges all associated vector points and in-memory caches.</li>
              <li>When you delete an account, all associated projects, API keys, and database shards are permanently shredded within 72 hours.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contact Our Data Protection Officer (DPO)</h2>
            <p className="mb-3">
              For any questions regarding our compliance practices, enterprise data processing agreements (DPA), or data deletion requests, contact our legal and privacy desk:
            </p>
            <div className="bg-[#101015] border border-white/[0.08] rounded-xl p-4 font-mono text-sm text-blue-400">
              Email: contact@icebergdb.in<br />
              Subject: Privacy & DPDP Inquiry<br />
              Organization: Iceberg Database Technologies
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
