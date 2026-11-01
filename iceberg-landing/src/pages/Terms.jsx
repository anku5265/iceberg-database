import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <Navbar dark={true} />

      <main className="container mx-auto px-6 py-20 max-w-4xl flex-1">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-blue-500/20 text-blue-400 bg-blue-500/10 mb-4 font-medium">
            Terms of Service
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm text-[#777]">Last Updated: October 19, 2026 • Effective Date: October 19, 2026</p>
        </div>

        <div className="space-y-10 text-[#aaa] text-sm leading-relaxed border-t border-white/[0.08] pt-10">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using the services, APIs, SDKs, or dashboard provided by Iceberg Database ("Iceberg", "Platform"), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you possess the authority to bind such entity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. API Keys & Account Security</h2>
            <p className="mb-3">
              To utilize Iceberg services, you must generate an API key (`ib_...`) through dashboard.icebergdb.in. You are entirely responsible for maintaining the confidentiality of your API keys and master credentials.
            </p>
            <p>
              Any activity, collection modifications, or search requests executed under your API key are deemed your authorization. In the event of an unauthorized compromise of an API key, you agree to immediately revoke and rotate the key via the dashboard interface or notify us at <strong className="text-white">contact@icebergdb.in</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Subscriptions, Fees & Billing</h2>
            <p className="mb-3">
              Iceberg provides both free tiers and paid commercial subscription plans:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li><strong className="text-white">Free Plan:</strong> Up to 100,000 vectors with standard community support at ₹0.</li>
              <li><strong className="text-white">Starter Plan (₹799/month):</strong> Up to 1,000,000 vectors and 20,000 queries per day.</li>
              <li><strong className="text-white">Growth Plan (₹3,499/month):</strong> Up to 5,000,000 vectors, metadata filtering, and priority SLA.</li>
            </ul>
            <p>
              All payments are processed securely in Indian Rupees (INR) via our payment gateway partner (Razorpay). Subscriptions renew monthly automatically unless cancelled prior to the billing cycle through dashboard.icebergdb.in/settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Service Level Commitment (SLA)</h2>
            <p>
              Iceberg targets an operational uptime of <strong className="text-white">99.9%</strong> for production clusters. Real-time system availability and latency metrics are published transparently on our public Status page at <code className="text-blue-400 bg-white/5 px-2 py-0.5 rounded font-mono">/status</code>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Acceptable Use Policy</h2>
            <p className="mb-3">You agree not to use Iceberg to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ingest or index unlawful, defamatory, or harmful content prohibited under Indian law.</li>
              <li>Interfere with, flood, or launch denial-of-service (DoS) attacks against Iceberg infrastructure.</li>
              <li>Reverse engineer or disassemble the core binary engine without enterprise source licensing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact Information</h2>
            <p>
              For legal notices, contract modifications, or enterprise custom SLAs:
            </p>
            <div className="bg-[#101015] border border-white/[0.08] rounded-xl p-4 font-mono text-sm text-blue-400">
              Email: contact@icebergdb.in<br />
              Legal Department • Iceberg Database Technologies
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
