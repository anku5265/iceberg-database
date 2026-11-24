import { useState } from 'react'

export default function LegalModal({ initialTab = 'terms', onClose }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-[#2a2a2a] rounded-[2px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0e0e0e]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('terms')}
              className={`text-[14px] font-semibold px-3.5 py-1.5 rounded-[2px] transition ${
                tab === 'terms'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#888] hover:text-white bg-[#1a1a1a]'
              }`}
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setTab('privacy')}
              className={`text-[14px] font-semibold px-3.5 py-1.5 rounded-[2px] transition ${
                tab === 'privacy'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#888] hover:text-white bg-[#1a1a1a]'
              }`}
            >
              Privacy Policy
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#666] hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Full Legal Document Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-[14px] text-[#aaa] leading-relaxed">
          {tab === 'terms' ? (
            <>
              <div className="border-b border-[#222] pb-3">
                <h3 className="text-white font-semibold text-base">Iceberg Vector Database — Terms of Service</h3>
                <div className="text-[13px] text-[#666] mt-0.5">
                  Last Updated: October 2026 · Governing Jurisdiction: India (IT Act, 2000 & DPDP Act, 2023)
                </div>
              </div>

              <p>
                Welcome to <strong>Iceberg Vector Database</strong> ("Iceberg DB", "we", "our", or "us"), accessible at{' '}
                <span className="text-white">https://icebergdb.in</span>,{' '}
                <span className="text-white">https://dashboard.icebergdb.in</span>, and{' '}
                <span className="text-white">https://api.icebergdb.in</span>. These Terms of Service ("Terms") constitute a legally binding agreement between you ("Customer", "User", or "you") and Iceberg DB governing your access to and use of our cloud vector database, Cognitive Memory APIs, SDKs, and web dashboard (collectively, the "Services").
              </p>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">1. Acceptance of Terms & Eligibility</h4>
                <p>
                  By registering for an account, clicking "Create account", signing in via Google Authentication, or accessing our APIs using an <code className="text-blue-400">ic_live_</code> API key, you acknowledge that you have read, understood, and agree to be bound by these Terms. You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to enter into this agreement on behalf of yourself or your organization.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">2. Account Registration & API Key Security</h4>
                <p>
                  To access the Services, you must provide a valid email address and maintain accurate account information. You are solely responsible for safeguarding your account password, 6-digit verification codes (OTPs), and project API keys (<code className="text-blue-400">ic_live_...</code>). Any API requests, vector upserts, or deletions authenticated with your API key are deemed authorized by you. You may rotate or revoke compromised API keys immediately via the Iceberg Dashboard.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">3. Customer Data & 100% Intellectual Property Ownership</h4>
                <p>
                  You retain all right, title, and 100% ownership interest in and to all vector embeddings, metadata payloads, JSON documents, text prompts, and AI agent memories uploaded or stored in your Iceberg DB collections ("Customer Data"). Iceberg DB claims no ownership over your Customer Data. You grant Iceberg DB a limited, non-exclusive license solely to store, index, compress, and retrieve your Customer Data as required to execute your API queries. <strong>We never sell Customer Data and never use private Customer Data to train foundation AI models.</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">4. Acceptable Use Policy (AUP)</h4>
                <p>
                  You agree not to misuse the Services. Specifically, you shall not: (a) store or transmit unlawful, defamatory, or infringing content; (b) distribute malware, ransomware, or phishing material; (c) attempt unauthorized access, reverse engineering, or penetration testing against Iceberg DB infrastructure; (d) launch Denial-of-Service (DoS/DDoS) attacks or intentionally bypass rate limits; or (e) create multiple automated accounts to circumvent Free Tier storage quotas.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">5. Service Plans, Quotas & Rate Limits</h4>
                <p>
                  Iceberg DB offers a Free Tier (up to 100,000 vectors with standard rate limits) and paid subscription tiers (Starter, Pro, Scale, and Enterprise). If your usage exceeds your plan's vector capacity or QPS rate limits, API write operations may be temporarily throttled (HTTP 429) until you upgrade your plan or reduce vector count.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">6. Billing, Payments, Cancellations & Refund Policy</h4>
                <p>
                  Paid plans are billed in advance on a monthly or annual billing cycle via authorized payment processors (including Razorpay / Stripe). All applicable taxes (including GST where applicable) are calculated at checkout. You may cancel or downgrade your subscription at any time from Dashboard Settings; your paid features will remain active through the end of the current billing period. If you experience a verified critical service failure that prevents API usage within 7 days of an initial charge, you may request a billing review or refund by contacting <span className="text-blue-400">contact@icebergdb.in</span>.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">7. Service Level, Maintenance & Modifications</h4>
                <p>
                  We strive to maintain 99.9% API availability for production collections. However, Iceberg DB may occasionally perform scheduled maintenance, security patches, or infrastructure upgrades. We reserve the right to evolve, improve, or deprecate API endpoints with reasonable prior notice to active developers.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">8. Data Backup, Suspension & Account Termination</h4>
                <p>
                  You are free to export or delete your collections at any time. We reserve the right to suspend or terminate accounts that violate the Acceptable Use Policy, engage in fraudulent payment activity, or pose a security risk to our cloud cluster. Inactive Free Tier accounts with zero API activity for more than 180 consecutive days may be archived after prior email notification.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">9. Disclaimer of Warranties ("AS-IS" Clause)</h4>
                <p>
                  EXCEPT AS EXPRESSLY PROVIDED HEREIN, THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. ICEBERG DB DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">10. Limitation of Liability</h4>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ICEBERG DB OR ITS FOUNDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, OR DATA ARISING OUT OF YOUR USE OF THE SERVICES. ICEBERG DB'S TOTAL AGGREGATE LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO ICEBERG DB IN THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO LIABILITY (OR INR 1,000 FOR FREE TIER USERS).
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">11. Indemnification</h4>
                <p>
                  You agree to indemnify, defend, and hold harmless Iceberg DB and its founder, officers, and affiliates from any third-party claims, damages, liabilities, or legal expenses arising out of your Customer Data, your violation of these Terms, or your infringement of any third-party intellectual property or privacy rights.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">12. Governing Law, Dispute Resolution & Contact</h4>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in India. For all legal, billing, or support notices, please contact:{' '}
                  <a href="mailto:contact@icebergdb.in" className="text-blue-400 hover:underline">
                    contact@icebergdb.in
                  </a>.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-[#222] pb-3">
                <h3 className="text-white font-semibold text-base">Iceberg Vector Database — Privacy Policy</h3>
                <div className="text-[13px] text-[#666] mt-0.5">
                  Last Updated: October 2026 · Compliant with India DPDP Act 2023 & Global GDPR Principles
                </div>
              </div>

              <p>
                This Privacy Policy explains how <strong>Iceberg Vector Database</strong> ("Iceberg DB", "we", "us") collects, processes, protects, and handles your personal information and technical data when you use <span className="text-white">icebergdb.in</span>, <span className="text-white">dashboard.icebergdb.in</span>, and <span className="text-white">api.icebergdb.in</span>.
              </p>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">1. Information We Collect</h4>
                <p>
                  <strong>(a) Account Information:</strong> When you sign up via Email or Google Authentication, we collect your email address, display name (if provided via Google), and cryptographic password hash.<br />
                  <strong>(b) Vector & API Data:</strong> We store the collections, high-dimensional vectors, metadata payloads, and Cognitive Memory records that you explicitly transmit to our API.<br />
                  <strong>(c) Operational Telemetry:</strong> We log API request timestamps, HTTP status codes, query latency, and rate-limit counters to display real-time analytics in your Dashboard and protect against abuse.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">2. How We Use Your Information</h4>
                <p>
                  We use your information strictly to: (a) provision and authenticate your account and <code className="text-blue-400">ic_live_</code> API keys; (b) send 6-digit one-time verification codes (OTPs) for password resets and Google sign-in; (c) execute vector similarity searches and memory recall requests; (d) process subscription billing; and (e) send essential security or quota alerts. <strong>We never sell, rent, or trade your email address or vector data to third parties.</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">3. Data Security, Encryption & Isolation</h4>
                <p>
                  All communication between your applications, our SDKs, the Dashboard, and <code className="text-blue-400">api.icebergdb.in</code> is encrypted in transit using TLS 1.2/1.3 (HTTPS). Passwords and OTP tokens are protected using cryptographic hashing (HMAC-SHA256 / bcrypt). Multi-tenant projects are logically isolated by unique <code className="text-blue-400">project_id</code> and namespace boundaries so no user can ever access another user's vectors.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">4. Local Storage & Session Tokens</h4>
                <p>
                  The Iceberg Dashboard uses browser <code className="text-blue-400">localStorage</code> strictly for essential authentication state (storing your active session, API key reference, and remembered sign-in accounts on your own device). We do not use invasive third-party advertising trackers or cross-site marketing cookies.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">5. Subprocessors & Cloud Infrastructure</h4>
                <p>
                  To deliver low-latency global performance, we utilize trusted enterprise cloud providers for compute hosting, serverless routing, transactional email delivery (Zoho Mail SMTP for official <code className="text-blue-400">@icebergdb.in</code> verification codes), and payment processing (Razorpay / Stripe). We never store your credit card or UPI credentials on Iceberg servers.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">6. Data Retention & Your Deletion Rights</h4>
                <p>
                  You have full control over your data. You can delete individual vectors, wipe entire collections, or revoke API keys instantaneously via the Dashboard or REST API. Under the Digital Personal Data Protection Act, 2023 (India) and GDPR, you have the right to request complete erasure of your account and all associated data by emailing <span className="text-blue-400">contact@icebergdb.in</span>.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-semibold text-[14px]">7. Grievance Officer & Contact Information</h4>
                <p>
                  For any privacy questions, data deletion requests, or compliance inquiries, please contact the Iceberg DB Privacy & Support Team at:{' '}
                  <a href="mailto:contact@icebergdb.in" className="text-blue-400 hover:underline">
                    contact@icebergdb.in
                  </a>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#222] flex items-center justify-between bg-[#0e0e0e]">
          <span className="text-[13px] text-[#666]">Official Legal Agreement · Iceberg DB (icebergdb.in)</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-medium px-5 py-1.5 rounded-[2px] transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}
