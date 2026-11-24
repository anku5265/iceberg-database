import { useState, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, useSessionTheme } from '../components/Navbar'
import Footer from '../components/Footer'
import { CANONICAL_SPEC } from '../config/canonicalSpec'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

function BlueCheckCircle() {
  return (
    <svg
      className="w-[16px] h-[16px] text-[#3b82f6] mt-[2px] flex-shrink-0"
      viewBox="0 0 20 20"
      fill="none"
    >
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.5 10.25L8.9 12.65L13.75 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TableCheck({ dark }) {
  return (
    <svg
      className={`w-4 h-4 inline-block ${dark ? 'text-[#fafaf9]' : 'text-[#111827]'}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5l3.5 3.5 7.5-7.5" />
    </svg>
  )
}

function TableCross({ dark }) {
  return (
    <svg
      className={`w-3.5 h-3.5 inline-block ${dark ? 'text-[#71717a]' : 'text-[#a1a1aa]'}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}

function AwsLogo() {
  return (
    <svg className="h-7 w-auto" viewBox="0 0 64 38" fill="none">
      <text
        x="32"
        y="21"
        textAnchor="middle"
        fill="currentColor"
        fontSize="19"
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
      >
        aws
      </text>
      <path
        d="M14 27.5C22.5 33 41.5 33 50 27.5"
        stroke="#FF9900"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M47 25.5L51 27.2L48.8 31"
        stroke="#FF9900"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GcpLogo() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 48 48" fill="none">
      <path
        fill="#EA4335"
        d="M31.8 18.6l4.7-4.7 0.3-2C32.5 8 26.3 6.2 20.4 7.7c-5.9 1.5-10.5 6.1-12 12l1.8-0.2 6.6-1.1c0 0 0.4-0.6 0.6-0.5 2.9-3.2 7.8-3.6 11.3-0.9l3.1 1.6z"
      />
      <path
        fill="#4285F4"
        d="M40.2 19.7c-1-3.7-3.1-7-6.1-9.3l-6.6 6.6c2.5 2 3.9 5.2 3.4 8.5v1.1c3.1 0 5.6 2.5 5.6 5.6s-2.5 5.6-5.6 5.6H19.7l-1.1 1.2v6.6l1.1 1.1h11.2c6.7 0 12.6-4.4 14.4-10.9 1.8-6.4-0.5-13.2-5.1-16.1z"
      />
      <path
        fill="#34A853"
        d="M8.5 36.1h11.2v-8.9H8.5c-0.8 0-1.6-0.2-2.3-0.5l-1.6 0.5-4.7 4.7-0.4 1.6c2.4 1.7 5.2 2.6 9 2.6z"
      />
      <path
        fill="#FBBC05"
        d="M8.5 13.7C3.2 17-0.1 23.4 1.1 29.6c0.7 3.5 2.6 6.7 5.4 8.9l6.9-6.9c-2.6-1.2-3.8-4.3-2.6-6.9 0.5-1.2 1.4-2.1 2.6-2.6l-6.9-6.9 2-1.5z"
      />
    </svg>
  )
}

function MicrosoftLogo() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  )
}

const PLAN_CARDS = [
  {
    id: 'free',
    name: 'Free',
    badge: null,
    desc: 'For trying out and for small applications.',
    ctaLabel: 'Start for Free',
    ctaStyle: 'outline',
    ctaHref: `${D}/signup`,
    pricePrimaryInr: 'Free',
    pricePrimaryUsd: 'Free',
    priceSub: '₹0 / $0 forever · No credit card',
    usageLink: true,
    leadIn: null,
    features: [
      { text: '100,000 vectors (384d)', link: '/product/database' },
      { text: '1,000 queries/day (60 req/min)', link: null },
      { text: '1 GB storage · 1 project', link: null },
      { text: 'Free built-in CPU embeddings', link: '/engine' },
      { text: 'Iceberg 4-Tier Agent Memory', link: '/product/memory' },
      { text: 'Iceberg RAG Assistant', link: '/product/assistant' },
      { text: 'Dense, Sparse BM25 & Hybrid RRF', link: '/engine' },
      { text: 'Never pauses (zero cold starts)', link: null },
      { text: 'Community support', link: '/contact' },
    ],
    footerJump: 'Example Free Plan workloads ↓',
  },
  {
    id: 'starter',
    name: 'Starter',
    badge: 'NEW',
    desc: 'For solo developers and small teams.',
    ctaLabel: 'Get Started',
    ctaStyle: 'blue',
    ctaHref: `${D}/signup?plan=starter`,
    pricePrimaryInr: '₹799/month flat',
    pricePrimaryUsd: '$10/month flat',
    priceSub: '₹7,990/yr ($100/yr) · 2 months free',
    usageLink: false,
    leadIn: 'Everything in Free',
    features: [
      { text: '1,000,000 vectors (384d)', link: '/product/database' },
      { text: '20,000 queries/day (300 req/min)', link: null },
      { text: '5 GB storage · 5 projects', link: null },
      { text: 'Unlimited collections & namespaces', link: '/product/namespaces' },
      { text: 'Free built-in CPU embeddings', link: '/engine' },
      { text: '25 MB max document upload', link: null },
      { text: 'Real-time dashboard metrics & logs', link: '/product/dashboard' },
      { text: 'Never pauses (always active)', link: null },
      { text: 'Includes Email support', link: '/contact' },
    ],
    footerJump: null,
  },
  {
    id: 'growth',
    name: 'Growth',
    badge: 'POPULAR',
    desc: 'For production applications at any scale.',
    ctaLabel: 'Start Free Trial',
    ctaStyle: 'blue',
    ctaHref: `${D}/signup?plan=growth`,
    pricePrimaryInr: '₹3,499/month',
    pricePrimaryUsd: '$42/month',
    priceSub: '₹34,990/yr ($420/yr) · 2 months free',
    usageLink: false,
    leadIn: 'Everything in Starter',
    features: [
      { text: '5,000,000 vectors (384d)', link: '/product/database' },
      { text: '100,000 queries/day (1,000 req/min)', link: null },
      { text: '25 GB storage · 15 projects', link: null },
      { text: 'Pay-as-you-grow overage support', link: '#overage-section' },
      { text: 'Metadata filters & Hybrid RRF tuning', link: '/engine' },
      { text: 'Point-in-time snapshot backups', link: '/product/backup' },
      { text: 'One-click backup & restore', link: '/product/backup' },
      { text: 'Role-Based Access Control (RBAC)', link: '/security' },
      { text: 'Priority engineering support', link: '/contact' },
    ],
    footerJump: null,
  },
  {
    id: 'scale',
    name: 'Scale',
    badge: null,
    desc: 'For mission-critical production applications.',
    ctaLabel: 'Get Started',
    ctaSecondaryLabel: 'Request Trial',
    ctaStyle: 'dual',
    ctaHref: `${D}/signup?plan=scale`,
    ctaSecondaryHref: '/contact',
    pricePrimaryInr: '₹9,999/month',
    pricePrimaryUsd: '$119/month',
    priceSub: '₹99,990/yr ($1,190/yr) · 2 months free',
    usageLink: false,
    leadIn: 'Everything in Growth',
    features: [
      { text: '20,000,000 vectors (384d)', link: '/product/database' },
      { text: '500,000 queries/day (3,000 req/min)', link: null },
      { text: '100 GB storage · Unlimited projects', link: null },
      { text: '99.9% Uptime SLA in ap-south-1', link: '/status' },
      { text: 'Bring Your Own Cloud (BYOC)', link: '/product/byoc' },
      { text: 'CMEK & IP allowlist controls', link: '/security' },
      { text: 'Audit Logs & key isolation', link: '/security' },
      { text: 'DPDP Act 2023 India compliance', link: '/security' },
      { text: 'Dedicated Slack & WhatsApp support', link: '/contact' },
    ],
    footerJump: null,
  },
]

const WORKLOAD_EXAMPLES = [
  {
    title: 'Recommendation engine',
    givenLabel: 'Given an e-commerce site with:',
    givenItems: [
      '50K – 100K products',
      'JSON metadata per product (price, brand)',
      'Using 384 dimensions CPU embeddings',
    ],
    givesLabel: 'Free & Starter plan gives you:',
    givesItems: [
      '~ 1,000 to 20,000 recommendations per day',
      '~ 1.95 ms p50 dense retrieval in ap-south-1',
    ],
  },
  {
    title: 'Semantic & hybrid search',
    givenLabel: 'Given a knowledge base of:',
    givenItems: [
      '~ 30K – 250K document chunks',
      'Dense Cosine + Sparse Okapi BM25 index',
      'Using 384 dimensions CPU embeddings',
    ],
    givesLabel: 'Free & Starter plan gives you:',
    givesItems: [
      '~ 1,000 to 20,000 Hybrid RRF searches per day',
      '~ 8.73 ms p50 hybrid latency (100% Recall@10)',
    ],
  },
  {
    title: 'Forum answering bot (RAG)',
    givenLabel: 'Given an AI assistant or agent with:',
    givenItems: [
      '~ 10+ isolated tenant namespaces',
      '4-Tier Cognitive Agent Memory enabled',
      'Using 384 dimensions CPU embeddings',
    ],
    givesLabel: 'Free & Starter plan gives you:',
    givesItems: [
      '~ 20,000 category-scoped RAG chats per day',
      '~ ₹0 external embedding API bill',
    ],
  },
]

const EXPLORE_PRODUCTS = [
  {
    title: 'On-Demand',
    docsTo: '/docs',
    desc: (
      <>
        The foundation for knowledgeable AI. Backed by distributed object storage for scalable, highly available serverless indexes in{' '}
        <span className="underline decoration-current/40 underline-offset-4">ap-south-1</span>.
      </>
    ),
    btnLabel: 'View Pricing',
    btnTo: '#compare-plans',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="7.5" ry="2.75" />
        <path d="M4.5 6v12c0 1.52 3.36 2.75 7.5 2.75s7.5-1.23 7.5-2.75V6" />
        <path d="M4.5 12c0 1.52 3.36 2.75 7.5 2.75s7.5-1.23 7.5-2.75" />
      </svg>
    ),
  },
  {
    title: 'Read Nodes',
    docsTo: '/docs?section=architecture',
    desc: (
      <>
        Dedicated Read Nodes. Exclusive infrastructure for high-throughput queries, with isolated replicas reserved for your collection –{' '}
        <span className="underline decoration-current/40 underline-offset-4">565 QPS burst</span>{' '}
        with zero noisy neighbors.
      </>
    ),
    btnLabel: 'View Pricing',
    btnTo: '#compare-plans',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="6" cy="12" r="2.2" />
        <circle cx="17" cy="6.5" r="2.2" />
        <circle cx="17" cy="17.5" r="2.2" />
        <path strokeLinecap="round" d="M8.1 11L14.9 7.5M8.1 13L14.9 16.5" />
      </svg>
    ),
  },
  {
    title: 'BYOC',
    docsTo: '/product/byoc',
    desc: (
      <>
        Bring Your Own Cloud. Managed Iceberg Vector Engine deployed inside your AWS, GCP, or Azure VPC with a{' '}
        <span className="underline decoration-current/40 underline-offset-4">zero-access operating model</span>.
      </>
    ),
    btnLabel: 'Contact Us for Pricing',
    btnTo: '/contact',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
      </svg>
    ),
  },
  {
    title: 'Memory',
    docsTo: '/docs?section=memory',
    desc: (
      <>
        Iceberg Memory is a 4-tier cognitive engine for AI agents. It offloads{' '}
        <span className="underline decoration-current/40 underline-offset-4">working</span>,{' '}
        <span className="underline decoration-current/40 underline-offset-4">episodic</span>, and{' '}
        <span className="underline decoration-current/40 underline-offset-4">long-term</span>{' '}
        recall from the LLM to a dedicated sub-10ms memory layer.
      </>
    ),
    btnLabel: 'View Pricing',
    btnTo: '#compare-plans',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 4a3.5 3.5 0 0 0-3.5 3.5c0 .44.08.86.23 1.25A3.5 3.5 0 0 0 4 12c0 1.3.7 2.43 1.75 3.04-.16.45-.25.94-.25 1.46A3.5 3.5 0 0 0 9 20h.5V4Zm5 0H14v16h.5a3.5 3.5 0 0 0 3.5-3.5c0-.52-.09-1.01-.25-1.46A3.49 3.49 0 0 0 19.5 12a3.5 3.5 0 0 0-2.23-3.25c.15-.39.23-.81.23-1.25A3.5 3.5 0 0 0 14.5 4Z" />
      </svg>
    ),
  },
  {
    title: 'Inference',
    docsTo: '/engine',
    desc: (
      <>
        Iceberg Inference gives you built-in access to server-side 384d ONNX{' '}
        <span className="underline decoration-current/40 underline-offset-4">embedding</span> and{' '}
        <span className="underline decoration-current/40 underline-offset-4">Hybrid RRF</span>{' '}
        models hosted directly on Iceberg&apos;s infrastructure at ₹0 extra cost.
      </>
    ),
    btnLabel: 'View Pricing',
    btnTo: '#compare-plans',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h5l3 5-3 5H4M12 12h8m0 0-3-3m3 3-3 3" />
      </svg>
    ),
  },
  {
    title: 'Assistant',
    docsTo: '/product/assistant',
    desc: (
      <>
        Iceberg Assistant is a service that allows you to build production-grade{' '}
        <span className="underline decoration-current/40 underline-offset-4">RAG chat</span> and{' '}
        <span className="underline decoration-current/40 underline-offset-4">WhatsApp</span>{' '}
        agent-based applications quickly.
      </>
    ),
    btnLabel: 'View Pricing',
    btnTo: '#compare-plans',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
  {
    title: 'iceberg-mcp & SDKs',
    docsTo: '/product/sdk',
    desc: (
      <>
        Official v1.0.0 packages for{' '}
        <span className="underline decoration-current/40 underline-offset-4">Python, JS, Rust, Go, .NET, Java</span>{' '}
        plus zero-config MCP server that brings Iceberg search into Claude Code &amp; Cursor.
      </>
    ),
    btnLabel: 'Get started for free',
    btnTo: '/product/sdk',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: 'Support',
    docsTo: null,
    desc: (
      <>
        Iceberg Support provides multiple tiers of engineering assistance to ensure your application&apos;s success, from community support to dedicated Slack &amp; WhatsApp channels.
      </>
    ),
    btnLabel: 'View Pricing',
    btnTo: '#compare-plans',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="9" r="3.2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 19c1.2-2.6 3.2-4 5.5-4s4.3 1.4 5.5 4M4.5 19h15" />
      </svg>
    ),
  },
]

const COMPARE_SECTIONS = [
  {
    category: 'Database Features',
    rows: [
      {
        feature: 'Cloud Availability',
        vals: ['Iceberg Managed Cloud', 'Iceberg Managed Cloud', 'Iceberg Managed Cloud', 'Managed Cloud + BYOC (AWS, GCP, Azure)'],
      },
      {
        feature: 'Region Availability',
        vals: ['India (ap-south-1)', 'India (ap-south-1)', 'India (ap-south-1)', 'India (ap-south-1) + Custom VPC'],
      },
      {
        feature: 'Zero Cold Starts (Never Pauses)',
        vals: [true, true, true, true],
      },
      {
        feature: 'Index Types',
        vals: [
          'Dense 384d, Sparse BM25, Hybrid RRF',
          'Dense 384d, Sparse BM25, Hybrid RRF',
          'Dense 384d, Sparse BM25, Hybrid RRF',
          'Dense 384d, Sparse BM25, Hybrid RRF',
        ],
      },
      {
        feature: 'Collections',
        vals: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'],
      },
      {
        feature: 'Namespaces per Collection',
        vals: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'],
      },
      {
        feature: 'Built-in Embedding Model',
        vals: [
          'ONNX all-MiniLM-L6-v2 (384d)',
          'ONNX all-MiniLM-L6-v2 (384d)',
          'ONNX all-MiniLM-L6-v2 (384d)',
          'ONNX all-MiniLM-L6-v2 (384d)',
        ],
      },
      {
        feature: 'Hybrid Fusion Algorithm',
        vals: ['Reciprocal Rank Fusion (RRF)', 'Reciprocal Rank Fusion (RRF)', 'Configurable Alpha + RRF', 'Configurable Alpha + RRF'],
      },
      {
        feature: 'Console Index Metrics & Logs',
        vals: [true, true, true, true],
      },
      {
        feature: 'Uptime SLA',
        vals: ['Standard', '99.9%', '99.9%', '99.9% Guaranteed SLA'],
      },
    ],
  },
  {
    category: 'Pricing Dimensions — Database & Capacity',
    rows: [
      {
        feature: 'Included Vectors (384d)',
        vals: ['100,000', '1,000,000', '5,000,000', '20,000,000'],
      },
      {
        feature: 'Daily Search & Memory Queries',
        vals: ['1,000 / day', '20,000 / day', '100,000 / day', '500,000 / day'],
      },
      {
        feature: 'Burst Rate Limit',
        vals: ['60 req/min', '300 req/min', '1,000 req/min', '3,000 req/min'],
      },
      {
        feature: 'Included Storage',
        vals: ['1 GB', '5 GB', '25 GB', '100 GB'],
      },
      {
        feature: 'Max Document Upload Size',
        vals: ['10 MB', '25 MB', '50 MB', '100 MB'],
      },
      {
        feature: 'Cross-Border Egress Fee',
        vals: ['₹0 / $0 (Local ap-south-1)', '₹0 / $0 (Local ap-south-1)', '₹0 / $0 (Local ap-south-1)', '₹0 / $0 (Local ap-south-1)'],
      },
      {
        feature: 'Pay-As-You-Grow Extra Vectors',
        vals: [false, '₹100 per 100K extra vectors', '₹100 per 100K extra vectors', '₹100 per 100K extra vectors'],
      },
      {
        feature: 'Pay-As-You-Grow Extra Queries',
        vals: [false, '₹50 per 50K extra queries', '₹50 per 50K extra queries', '₹50 per 50K extra queries'],
      },
      {
        feature: 'Point-in-time R2 Backups',
        vals: [false, false, true, true],
      },
      {
        feature: 'One-Click Restore from Backup',
        vals: [false, false, true, true],
      },
    ],
  },
  {
    category: 'Inference, Agent Memory & Assistant',
    rows: [
      {
        feature: 'all-MiniLM-L6-v2 (384d CPU Embeddings)',
        vals: ['₹0 / Free Unlimited', '₹0 / Free Unlimited', '₹0 / Free Unlimited', '₹0 / Free Unlimited'],
      },
      {
        feature: 'Okapi BM25 Lexical Tokenization',
        vals: ['₹0 / Free Unlimited', '₹0 / Free Unlimited', '₹0 / Free Unlimited', '₹0 / Free Unlimited'],
      },
      {
        feature: '4-Tier Cognitive Agent Memory',
        vals: [
          'Working, Episodic, Semantic, Long-Term',
          'Working, Episodic, Semantic, Long-Term',
          'Working, Episodic, Semantic, Long-Term',
          'Working, Episodic, Semantic, Long-Term',
        ],
      },
      {
        feature: 'Memory Deduplication & TTL Decay',
        vals: [true, true, true, true],
      },
      {
        feature: 'Iceberg RAG Assistant & WhatsApp Bot',
        vals: [true, true, true, true],
      },
      {
        feature: 'Official v1.0.0 SDKs & MCP Server',
        vals: ['All 6 SDKs + iceberg-mcp', 'All 6 SDKs + iceberg-mcp', 'All 6 SDKs + iceberg-mcp', 'All 6 SDKs + iceberg-mcp'],
      },
    ],
  },
  {
    category: 'Org Management, Security & Compliance',
    rows: [
      {
        feature: 'Projects',
        vals: ['1 project', '5 projects', '15 projects', 'Unlimited projects'],
      },
      {
        feature: 'Encryption at rest and in transit',
        vals: [true, true, true, true],
      },
      {
        feature: 'DPDP Act 2023 India Data Residency',
        vals: [true, true, true, true],
      },
      {
        feature: 'Role-Based Access Control (RBAC Keys)',
        vals: [true, true, true, true],
      },
      {
        feature: 'Audit Logs',
        vals: [false, false, true, true],
      },
      {
        feature: 'IP Allowlist Controls',
        vals: [false, false, false, true],
      },
      {
        feature: 'Customer Managed Encryption Keys (CMEK)',
        vals: [false, false, false, true],
      },
      {
        feature: 'Bring Your Own Cloud (BYOC)',
        vals: [false, false, false, true],
      },
      {
        feature: 'Support',
        vals: ['Community support', 'Email support', 'Priority engineering support', 'Dedicated Slack & WhatsApp'],
      },
    ],
  },
]

export default function Pricing() {
  const [dark] = useSessionTheme()
  const [currency, setCurrency] = useState('INR')

  const pageBg = dark ? 'bg-[#0a0b0d] text-[#fafaf9]' : 'bg-[#fbfbfc] text-[#1c1917]'
  const gridLine = dark ? 'border-white/[0.12]' : 'border-black/[0.1]'
  const textMuted = dark ? 'text-[#a1a1aa]' : 'text-[#52525b]'
  const textDim = dark ? 'text-[#71717a]' : 'text-[#71717a]'
  const cardBg = dark ? 'bg-[#0d0e12]' : 'bg-white'
  const subtleBg = dark ? 'bg-[#111318]' : 'bg-[#f4f4f5]'

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${pageBg}`}>
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-12 py-14 lg:py-20 border-x ${gridLine}`}>
            <div className="max-w-[680px]">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#3b82f6] mb-4 font-semibold">
                PRICING
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-[-0.03em] leading-[1.06] mb-6">
                Start free, scale effortlessly
              </h1>
              <p className={`text-[15px] sm:text-[16px] leading-[1.65] max-w-[560px] mb-7 ${textMuted}`}>
                Iceberg runs on fully managed infrastructure in{' '}
                <span className={dark ? 'text-white font-medium' : 'text-black font-medium'}>
                  {CANONICAL_SPEC.region}
                </span>{' '}
                that scales with you. Start building today with transparent INR &amp; USD plans, free built-in 384d CPU embeddings, and zero cluster pausing.
              </p>

              {/* Currency Switcher Pill */}
              <div className="inline-flex items-center gap-3">
                <div className={`inline-flex border ${gridLine} ${cardBg} p-0.5`}>
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={`px-3.5 py-1.5 text-xs font-mono font-medium transition cursor-pointer ${
                      currency === 'INR'
                        ? 'bg-[#1d6bf3] text-white'
                        : `${textMuted} hover:text-current`
                    }`}
                  >
                    INR (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-3.5 py-1.5 text-xs font-mono font-medium transition cursor-pointer ${
                      currency === 'USD'
                        ? 'bg-[#1d6bf3] text-white'
                        : `${textMuted} hover:text-current`
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
                <span className={`text-xs font-mono ${textDim}`}>
                  2 months free on annual billing
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 4-COLUMN ARCHITECTURAL PRICING GRID */}
        <section className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-12 py-12 border-x ${gridLine}`}>
            <div className={`border ${gridLine} ${cardBg}`}>
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x ${gridLine}`}>
                {PLAN_CARDS.map((p) => {
                  const displayPrice = currency === 'INR' ? p.pricePrimaryInr : p.pricePrimaryUsd
                  return (
                    <div key={p.id} className="p-6 sm:p-7 flex flex-col justify-between">
                      <div>
                        {/* Title + Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <h2 className="text-[26px] font-semibold tracking-tight leading-none">
                            {p.name}
                          </h2>
                          {p.badge && (
                            <span
                              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${gridLine} ${subtleBg} ${textMuted}`}
                            >
                              {p.badge}
                            </span>
                          )}
                        </div>

                        {/* Subtitle */}
                        <p className={`text-[13px] leading-[1.45] min-h-[38px] mb-5 ${textMuted}`}>
                          {p.desc}
                        </p>

                        {/* Action Button(s) right below subtitle (Exact Pinecone placement) */}
                        <div className="mb-7">
                          {p.ctaStyle === 'outline' && (
                            <a
                              href={p.ctaHref}
                              className={`relative group flex items-center justify-center w-full h-10 text-[13px] font-medium border ${gridLine} transition no-underline ${
                                dark
                                  ? 'bg-transparent hover:bg-white/[0.04] text-white'
                                  : 'bg-transparent hover:bg-black/[0.04] text-[#111827]'
                              }`}
                            >
                              <span className="ib-corner-tl" />
                              <span className="ib-corner-tr" />
                              <span className="ib-corner-bl" />
                              <span className="ib-corner-br" />
                              {p.ctaLabel}
                            </a>
                          )}

                          {p.ctaStyle === 'blue' && (
                            <a
                              href={p.ctaHref}
                              className="relative group flex items-center justify-center w-full h-10 text-[13px] font-medium bg-[#1d6bf3] hover:bg-[#1559d6] text-white transition no-underline"
                            >
                              <span className="ib-corner-tl" />
                              <span className="ib-corner-tr" />
                              <span className="ib-corner-bl" />
                              <span className="ib-corner-br" />
                              {p.ctaLabel}
                            </a>
                          )}

                          {p.ctaStyle === 'dual' && (
                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={p.ctaHref}
                                className={`relative group flex items-center justify-center h-10 text-[13px] font-medium transition no-underline ${
                                  dark
                                    ? 'bg-white text-[#0a0b0d] hover:bg-zinc-200'
                                    : 'bg-[#111827] text-white hover:bg-zinc-800'
                                }`}
                              >
                                <span className="ib-corner-tl" />
                                <span className="ib-corner-tr" />
                                <span className="ib-corner-bl" />
                                <span className="ib-corner-br" />
                                {p.ctaLabel}
                              </a>
                              <Link
                                to={p.ctaSecondaryHref}
                                className={`relative group flex items-center justify-center h-10 text-[13px] font-medium border ${gridLine} transition no-underline ${
                                  dark
                                    ? 'hover:bg-white/[0.04] text-white'
                                    : 'hover:bg-black/[0.04] text-[#111827]'
                                }`}
                              >
                                {p.ctaSecondaryLabel}
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Royal Blue Price Display */}
                        <div className="mb-7 min-h-[56px]">
                          <div className="text-[24px] sm:text-[26px] font-medium tracking-tight text-[#3b82f6] leading-tight">
                            {displayPrice}
                          </div>
                          {p.usageLink ? (
                            <a
                              href="#compare-plans"
                              className={`inline-block mt-1.5 text-xs ${textMuted} hover:underline no-underline`}
                            >
                              View included usage ↓
                            </a>
                          ) : (
                            <div className={`mt-1.5 text-xs ${textDim}`}>{p.priceSub}</div>
                          )}
                        </div>

                        {/* Feature List with Blue Circle Checks */}
                        <ul className="space-y-3.5 text-[13px] leading-[1.45]">
                          {p.leadIn && (
                            <li className="flex items-start gap-2.5 font-medium">
                              <BlueCheckCircle />
                              <span>{p.leadIn}</span>
                            </li>
                          )}
                          {p.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <BlueCheckCircle />
                              {feat.link ? (
                                feat.link.startsWith('#') ? (
                                  <a
                                    href={feat.link}
                                    className="underline decoration-current/40 underline-offset-4 hover:text-[#3b82f6] transition"
                                  >
                                    {feat.text}
                                  </a>
                                ) : (
                                  <Link
                                    to={feat.link}
                                    className="underline decoration-current/40 underline-offset-4 hover:text-[#3b82f6] transition"
                                  >
                                    {feat.text}
                                  </Link>
                                )
                              ) : (
                                <span className={dark ? 'text-[#e4e4e7]' : 'text-[#27272a]'}>
                                  {feat.text}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>

                        {p.footerJump && (
                          <div className="mt-5 pt-2">
                            <a
                              href="#starter-workloads"
                              className="text-xs font-semibold hover:text-[#3b82f6] transition no-underline"
                            >
                              {p.footerJump}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Bar inside Plan Grid (Exact Pinecone Footer Strip) */}
              <div className={`border-t ${gridLine} py-5 px-6 text-center`}>
                <p className={`text-sm ${textMuted}`}>
                  Need elastic capacity beyond your tier? Pay-as-you-grow:{' '}
                  <span className={dark ? 'text-white font-medium' : 'text-black font-medium'}>
                    {CANONICAL_SPEC.overage.vectorsInr}
                  </span>{' '}
                  ·{' '}
                  <span className={dark ? 'text-white font-medium' : 'text-black font-medium'}>
                    {CANONICAL_SPEC.overage.queriesInr}
                  </span>
                </p>
                <a
                  href="#compare-plans"
                  className="inline-block mt-3 text-xs font-semibold tracking-wide hover:text-[#3b82f6] transition no-underline"
                >
                  Compare Plans ↓
                </a>
              </div>

              {/* 3. BRING YOUR OWN CLOUD (2-Column Architectural Row directly attached) */}
              <div className={`border-t ${gridLine} grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x ${gridLine}`}>
                {/* Left 6 Cols */}
                <div className="lg:col-span-6 p-7 sm:p-10">
                  <h3 className="text-2xl sm:text-[28px] font-semibold tracking-tight mb-2">
                    Bring your own cloud
                  </h3>
                  <p className={`text-[13px] mb-6 ${textMuted}`}>
                    For organizations requiring the highest level of security, DPDP compliance, and sovereignty
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mb-7">
                    <Link
                      to="/product/byoc"
                      className={`relative group inline-flex items-center justify-center px-5 h-10 text-xs font-medium border ${gridLine} transition no-underline ${
                        dark ? 'hover:bg-white/[0.04] text-white' : 'hover:bg-black/[0.04] text-[#111827]'
                      }`}
                    >
                      <span className="ib-corner-tl" />
                      <span className="ib-corner-tr" />
                      <span className="ib-corner-bl" />
                      <span className="ib-corner-br" />
                      Get Started
                    </Link>
                    <Link
                      to="/contact"
                      className={`relative group inline-flex items-center justify-center px-5 h-10 text-xs font-medium border ${gridLine} transition no-underline ${
                        dark ? 'hover:bg-white/[0.04] text-white' : 'hover:bg-black/[0.04] text-[#111827]'
                      }`}
                    >
                      Contact Us for Pricing
                    </Link>
                  </div>

                  <ul className="space-y-3 text-[13px]">
                    <li className="flex items-start gap-2.5">
                      <BlueCheckCircle />
                      <span>Iceberg Vector Engine deployed inside your cloud account</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <BlueCheckCircle />
                      <span>Zero-access operations – no SSH, VPN, or inbound access required</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <BlueCheckCircle />
                      <span>Outbound-only operations with an auditable trail</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <BlueCheckCircle />
                      <span>
                        <Link to="/contact" className="underline underline-offset-4 hover:text-[#3b82f6]">
                          Dedicated engineering support
                        </Link>{' '}
                        included
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Right 6 Cols */}
                <div className="lg:col-span-6 p-7 sm:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-16 h-16 border ${gridLine} flex items-center justify-center`}>
                      <AwsLogo />
                    </div>
                    <div className={`w-16 h-16 border ${gridLine} flex items-center justify-center`}>
                      <GcpLogo />
                    </div>
                    <div className={`w-16 h-16 border ${gridLine} flex items-center justify-center`}>
                      <MicrosoftLogo />
                    </div>
                  </div>
                  <p className={`text-[13px] leading-[1.65] ${textMuted}`}>
                    <Link
                      to="/product/byoc"
                      className={`font-medium underline underline-offset-4 ${dark ? 'text-white' : 'text-black'}`}
                    >
                      Bring-your-own-cloud (BYOC)
                    </Link>{' '}
                    runs Iceberg in your cloud account and VPC. Iceberg does not need SSH, VPN, or inbound network access to operate the system. You can use public endpoints or private-only connectivity inside AWS, GCP, or Microsoft Azure while maintaining 100% India data residency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WHAT YOU CAN BUILD ON THE STARTER PLAN */}
        <section id="starter-workloads" className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-12 py-16 border-x ${gridLine}`}>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
              What you can build on the Free &amp; Starter plans
            </h2>

            <div className={`border ${gridLine} ${cardBg} grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x ${gridLine}`}>
              {WORKLOAD_EXAMPLES.map((w) => (
                <div key={w.title} className="p-7 sm:p-8">
                  <h3 className="text-lg font-semibold mb-4">{w.title}</h3>

                  <div className={`text-xs pb-3 mb-4 border-b ${gridLine} ${textMuted}`}>
                    {w.givenLabel}
                  </div>
                  <ul className="space-y-3 text-[13px] mb-7">
                    {w.givenItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <BlueCheckCircle />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`text-xs pb-3 mb-4 border-b ${gridLine} ${textMuted}`}>
                    {w.givesLabel}
                  </div>
                  <ul className="space-y-3 text-[13px]">
                    {w.givesItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <BlueCheckCircle />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className={`text-[11px] mt-5 leading-relaxed ${textDim}`}>
              <strong className={dark ? 'text-zinc-300' : 'text-zinc-700'}>Note:</strong> Built-in 384d CPU embeddings (ONNX all-MiniLM-L6-v2) and Hybrid RRF retrieval are included at ₹0 extra inference cost across all plans in {CANONICAL_SPEC.region}.
            </p>
          </div>
        </section>

        {/* 5. EXPLORE PRODUCTS (Exact Pinecone 3-Col Architectural Grid + Spacer Strip + 2-Col Billing Row) */}
        <section id="overage-section" className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-12 py-16 border-x ${gridLine}`}>
            <h2 className="text-3xl sm:text-[36px] font-bold tracking-[-0.02em] mb-9">
              Explore products
            </h2>

            <div className={`border ${gridLine} ${cardBg}`}>
              {/* 3-Column Product Grid (8 cards + 1 architectural filler cell on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {EXPLORE_PRODUCTS.map((prod, idx) => {
                  const isRow1Or2 = idx < 6
                  const isNotLastCol = idx % 3 !== 2
                  return (
                    <div
                      key={prod.title}
                      className={`p-7 sm:p-9 flex flex-col justify-between border-b ${
                        isRow1Or2 ? `lg:border-b` : `lg:border-b-0`
                      } ${isNotLastCol ? `lg:border-r` : ''} ${gridLine}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-6">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-11 h-11 border ${gridLine} ${
                                dark ? 'bg-[#121318]' : 'bg-[#f8f8fa]'
                              } flex items-center justify-center flex-shrink-0`}
                            >
                              {prod.icon}
                            </div>
                            <h3 className="text-[18px] sm:text-[19px] font-semibold tracking-[-0.01em]">
                              {prod.title}
                            </h3>
                          </div>
                          {prod.docsTo && (
                            <Link
                              to={prod.docsTo}
                              className={`text-xs underline decoration-current/40 underline-offset-4 ${textMuted} hover:text-[#3b82f6] flex-shrink-0`}
                            >
                              Docs ↗
                            </Link>
                          )}
                        </div>
                        <p className={`text-[13.5px] leading-[1.65] mb-8 ${textMuted}`}>
                          {prod.desc}
                        </p>
                      </div>

                      <div>
                        {prod.btnTo.startsWith('#') ? (
                          <a
                            href={prod.btnTo}
                            className={`relative group inline-flex items-center justify-center px-5 h-10 text-xs font-medium border ${gridLine} transition no-underline ${
                              dark ? 'hover:bg-white/[0.04] text-white' : 'hover:bg-black/[0.04] text-[#111827]'
                            }`}
                          >
                            <span className="ib-corner-tl" />
                            <span className="ib-corner-tr" />
                            <span className="ib-corner-bl" />
                            <span className="ib-corner-br" />
                            {prod.btnLabel}
                          </a>
                        ) : (
                          <Link
                            to={prod.btnTo}
                            className={`relative group inline-flex items-center justify-center px-5 h-10 text-xs font-medium border ${gridLine} transition no-underline ${
                              dark ? 'hover:bg-white/[0.04] text-white' : 'hover:bg-black/[0.04] text-[#111827]'
                            }`}
                          >
                            <span className="ib-corner-tl" />
                            <span className="ib-corner-tr" />
                            <span className="ib-corner-bl" />
                            <span className="ib-corner-br" />
                            {prod.btnLabel}
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
                {/* Architectural empty 9th cell on desktop to complete the 3x3 CAD grid */}
                <div className="hidden lg:block p-9" />
              </div>

              {/* Pinecone Architectural Horizontal Spacer Strip between Product Grid and Billing Row */}
              <div
                className={`h-8 border-y ${gridLine} ${
                  dark ? 'bg-[#0a0b0d]' : 'bg-[#fbfbfc]'
                }`}
              />

              {/* 2-Column Bottom Row: Usage-based pricing & Committed Use Contracts */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className={`p-7 sm:p-9 border-b lg:border-b-0 lg:border-r ${gridLine}`}>
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={`w-11 h-11 border ${gridLine} ${
                        dark ? 'bg-[#121318]' : 'bg-[#f8f8fa]'
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                      </svg>
                    </div>
                    <h3 className="text-[18px] sm:text-[19px] font-semibold tracking-[-0.01em]">
                      Usage-based pricing
                    </h3>
                  </div>
                  <p className={`text-[13.5px] leading-[1.65] ${textMuted}`}>
                    Predictable monthly base plans applied to your included capacity. Anything over your tier limit is billed transparently pay-as-you-go ({CANONICAL_SPEC.overage.vectorsInr} and {CANONICAL_SPEC.overage.queriesInr}).
                  </p>
                </div>

                <div className="p-7 sm:p-9 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-5">
                      <div
                        className={`w-11 h-11 border ${gridLine} ${
                          dark ? 'bg-[#121318]' : 'bg-[#f8f8fa]'
                        } flex items-center justify-center flex-shrink-0`}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <h3 className="text-[18px] sm:text-[19px] font-semibold tracking-[-0.01em]">
                        Committed Use Contracts
                      </h3>
                    </div>
                    <p className={`text-[13.5px] leading-[1.65] mb-7 ${textMuted}`}>
                      The larger your annual or volume commitments, the greater your benefits—unlock 2 months free on annual plans, bigger custom discounts, and dedicated engineering support.
                    </p>
                  </div>
                  <div>
                    <Link
                      to="/contact"
                      className={`relative group inline-flex items-center justify-center px-5 h-10 text-xs font-medium border ${gridLine} transition no-underline ${
                        dark ? 'hover:bg-white/[0.04] text-white' : 'hover:bg-black/[0.04] text-[#111827]'
                      }`}
                    >
                      <span className="ib-corner-tl" />
                      <span className="ib-corner-tr" />
                      <span className="ib-corner-bl" />
                      <span className="ib-corner-br" />
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. COMPARE PLANS FULL ARCHITECTURAL TABLE */}
        <section id="compare-plans" className={`border-b ${gridLine}`}>
          <div className={`max-w-[1220px] mx-auto px-6 sm:px-12 py-16 border-x ${gridLine}`}>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
              Compare Plans
            </h2>

            <div className={`border ${gridLine} ${cardBg} overflow-x-auto`}>
              <table className="w-full min-w-[780px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className={`border-b ${gridLine} ${subtleBg}`}>
                    <th className={`py-4 px-5 font-semibold w-[28%] border-r ${gridLine}`}>Feature</th>
                    <th className={`py-4 px-5 font-semibold w-[18%] border-r ${gridLine}`}>Free</th>
                    <th className={`py-4 px-5 font-semibold w-[18%] border-r ${gridLine}`}>Starter</th>
                    <th className={`py-4 px-5 font-semibold w-[18%] border-r ${gridLine}`}>Growth</th>
                    <th className="py-4 px-5 font-semibold w-[18%]">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_SECTIONS.map((sec) => (
                    <Fragment key={sec.category}>
                      <tr className={`border-b ${gridLine} ${subtleBg}`}>
                        <td colSpan={5} className="py-4 px-5 font-semibold text-sm tracking-tight">
                          {sec.category}
                        </td>
                      </tr>
                      {sec.rows.map((row) => (
                        <tr key={row.feature} className={`border-b ${gridLine}`}>
                          <td className={`py-3.5 px-5 font-normal border-r ${gridLine} ${dark ? 'text-[#e4e4e7]' : 'text-[#27272a]'}`}>
                            {row.feature}
                          </td>
                          {row.vals.map((val, cIdx) => (
                            <td
                              key={cIdx}
                              className={`py-3.5 px-5 ${cIdx < 3 ? `border-r ${gridLine}` : ''} ${textMuted}`}
                            >
                              {val === true ? (
                                <TableCheck dark={dark} />
                              ) : val === false ? (
                                <TableCross dark={dark} />
                              ) : (
                                <span>{val}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>

              {/* Bottom Table Note Strip */}
              <div className={`p-6 text-center text-[13px] ${textMuted}`}>
                Evaluating latency and recall for your stack? Explore our{' '}
                <Link
                  to="/benchmarks"
                  className={`underline underline-offset-4 font-medium ${dark ? 'text-white' : 'text-black'} hover:text-[#3b82f6]`}
                >
                  verified ap-south-1 benchmarks
                </Link>{' '}
                covering Dense 384d Cosine, Okapi BM25, Hybrid RRF, and 50-worker concurrent bursts.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
