import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CAPABILITY_CONSOLE_SPECS = [
  {
    shortBadge: 'ap-south-1',
    tag: 'SOVEREIGN INFRASTRUCTURE',
    latency: '1.8ms RTT',
    pipeline: [
      { step: '01 // INGRESS', title: 'India App Traffic', sub: 'Zero cross-border hop', pct: 100 },
      { step: '02 // REGION ENCLAVE', title: 'Mumbai (ap-south-1)', sub: 'NVMe HNSW Cluster', pct: 96 },
      { step: '03 // COMPLIANCE', title: 'DPDP Act 2023 Ready', sub: '100% Domestic Residency', pct: 100 },
    ],
    codeLines: [
      <><span className="s-cmt"># 100% Domestic Data Residency in Mumbai (ap-south-1)</span></>,
      <><span className="s-pl">client = </span><span className="s-fn">Client</span><span className="s-pl">(</span><span className="s-key">api_key</span><span className="s-pl">=</span><span className="s-str">"ib_live_9x..."</span><span className="s-pl">, </span><span className="s-key">region</span><span className="s-pl">=</span><span className="s-str">"ap-south-1"</span><span className="s-pl">)</span></>,
      <><span className="s-pl">info = client.</span><span className="s-fn">cluster_info</span><span className="s-pl">()</span></>,
      <><span className="s-fn">print</span><span className="s-pl">(info.region, info.sovereign_lock)</span></>,
    ],
    rawCode: `client = Client(api_key="ib_live_9x...", region="ap-south-1")\ninfo = client.cluster_info()\nprint(info.region, info.sovereign_lock)`,
    jsonOutput: [
      { k: '"status"', v: '"200 OK"', c: '#34d399' },
      { k: '"region"', v: '"ap-south-1 (Mumbai)"', c: '#00d2ff' },
      { k: '"india_rtt_p99"', v: '"1.8ms"', c: '#e0f2fe' },
      { k: '"dpdp_compliant"', v: 'true', c: '#34d399' },
      { k: '"foreign_egress"', v: '"BLOCKED"', c: '#f87171' },
    ],
  },
  {
    shortBadge: 'RRF 1.4ms',
    tag: 'RECIPROCAL RANK FUSION ENGINE',
    latency: '1.4ms p99',
    pipeline: [
      { step: '01 // DENSE STREAM', title: 'Cosine HNSW (70%)', sub: 'Semantic meaning match', pct: 70 },
      { step: '02 // SPARSE STREAM', title: 'BM25 Keyword (30%)', sub: 'Exact SKU / ID / Law match', pct: 30 },
      { step: '03 // RRF FUSION', title: 'Top-K Reranked', sub: '96.4% Recall @ 1.4ms', pct: 96 },
    ],
    codeLines: [
      <><span className="s-cmt"># Combine Dense Vectors (70%) + BM25 Keyword Match (30%)</span></>,
      <><span className="s-pl">res = client.</span><span className="s-fn">search</span><span className="s-pl">(</span></>,
      <><span className="s-pl">  </span><span className="s-key">collection</span><span className="s-pl">=</span><span className="s-str">"fin_docs"</span><span className="s-pl">, </span><span className="s-key">query</span><span className="s-pl">=</span><span className="s-str">"RBI UPI circular 2026"</span><span className="s-pl">,</span></>,
      <><span className="s-pl">  </span><span className="s-key">search_type</span><span className="s-pl">=</span><span className="s-str">"hybrid"</span><span className="s-pl">, </span><span className="s-key">alpha</span><span className="s-pl">=</span><span className="s-num">0.70</span><span className="s-pl">, </span><span className="s-key">top_k</span><span className="s-pl">=</span><span className="s-num">5</span></>,
      <><span className="s-pl">)</span></>,
    ],
    rawCode: `res = client.search(\n  collection="fin_docs", query="RBI UPI circular 2026",\n  search_type="hybrid", alpha=0.70, top_k=5\n)`,
    jsonOutput: [
      { k: '"fusion"', v: '"RRF (alpha=0.70)"', c: '#00d2ff' },
      { k: '"latency_ms"', v: '1.42', c: '#34d399' },
      { k: '"top_hit_score"', v: '0.964', c: '#e0f2fe' },
      { k: '"dense_rank"', v: '#1', c: '#a1a1aa' },
      { k: '"bm25_exact"', v: '"MATCHED"', c: '#34d399' },
    ],
  },
  {
    shortBadge: 'HOT',
    tag: '4-TIER COGNITIVE MEMORY LAYER',
    latency: '1.9ms Recall',
    pipeline: [
      { step: '01 // SHORT & EPISODIC', title: 'Session Context', sub: 'Auto-TTL window GC', pct: 88 },
      { step: '02 // LONG & SEMANTIC', title: 'User Fact Graph', sub: 'Cross-session persistence', pct: 95 },
      { step: '03 // RECALL API', title: '1-Call Injection', sub: 'Scoped per user_id', pct: 100 },
    ],
    codeLines: [
      <><span className="s-cmt"># Store &amp; Recall 4-Tier Cognitive Agent Memory with Auto-TTL</span></>,
      <><span className="s-pl">client.</span><span className="s-fn">remember</span><span className="s-pl">(</span></>,
      <><span className="s-pl">  </span><span className="s-key">agent_id</span><span className="s-pl">=</span><span className="s-str">"copilot"</span><span className="s-pl">, </span><span className="s-key">user_id</span><span className="s-pl">=</span><span className="s-str">"usr_ankush"</span><span className="s-pl">,</span></>,
      <><span className="s-pl">  </span><span className="s-key">content</span><span className="s-pl">=</span><span className="s-str">"Prefers Pinecone architectural UI"</span><span className="s-pl">, </span><span className="s-key">type</span><span className="s-pl">=</span><span className="s-str">"long_term"</span></>,
      <><span className="s-pl">)</span></>,
    ],
    rawCode: `client.remember(\n  agent_id="copilot", user_id="usr_ankush",\n  content="Prefers Pinecone architectural UI", type="long_term"\n)`,
    jsonOutput: [
      { k: '"memory_id"', v: '"mem_88f2a..."', c: '#00d2ff' },
      { k: '"tier"', v: '"LONG_TERM"', c: '#34d399' },
      { k: '"ttl_status"', v: '"PERSISTENT"', c: '#e0f2fe' },
      { k: '"user_scope"', v: '"usr_ankush"', c: '#a1a1aa' },
      { k: '"recall_ms"', v: '1.91', c: '#34d399' },
    ],
  },
  {
    shortBadge: 'RAG',
    tag: 'TURNKEY RAG PIPELINE',
    latency: 'Streaming',
    pipeline: [
      { step: '01 // INGESTION', title: 'Auto-Chunk & Embed', sub: 'PDF · Markdown · Notion', pct: 92 },
      { step: '02 // GROUNDING', title: 'Hybrid Context + Citations', sub: 'Zero hallucination guard', pct: 98 },
      { step: '03 // CHANNELS', title: 'Web Widget + WhatsApp', sub: 'OpenAI & Gemini native', pct: 100 },
    ],
    codeLines: [
      <><span className="s-cmt"># Deploy Grounded RAG Assistant to Web &amp; WhatsApp in 1 Call</span></>,
      <><span className="s-pl">bot = client.rag.</span><span className="s-fn">create_assistant</span><span className="s-pl">(</span></>,
      <><span className="s-pl">  </span><span className="s-key">collection</span><span className="s-pl">=</span><span className="s-str">"help_docs"</span><span className="s-pl">, </span><span className="s-key">llm</span><span className="s-pl">=</span><span className="s-str">"gemini-2.5-pro"</span><span className="s-pl">,</span></>,
      <><span className="s-pl">  </span><span className="s-key">channels</span><span className="s-pl">=[</span><span className="s-str">"web_widget"</span><span className="s-pl">, </span><span className="s-str">"whatsapp_business"</span><span className="s-pl">]</span></>,
      <><span className="s-pl">)</span></>,
    ],
    rawCode: `bot = client.rag.create_assistant(\n  collection="help_docs", llm="gemini-2.5-pro",\n  channels=["web_widget", "whatsapp_business"]\n)`,
    jsonOutput: [
      { k: '"assistant"', v: '"READY"', c: '#34d399' },
      { k: '"llm_engine"', v: '"gemini-2.5-pro"', c: '#00d2ff' },
      { k: '"citations"', v: '"VERIFIED (3 docs)"', c: '#e0f2fe' },
      { k: '"whatsapp"', v: '"WEBHOOK_ACTIVE"', c: '#34d399' },
      { k: '"embed_widget"', v: '"LIVE"', c: '#34d399' },
    ],
  },
  {
    shortBadge: '0ms COLD',
    tag: 'ALWAYS-HOT ARCHITECTURE',
    latency: '0.0ms Wakeup',
    pipeline: [
      { step: '01 // FREE & PRO TIERS', title: 'Zero Auto-Pause', sub: 'Active 365 days/year', pct: 100 },
      { step: '02 // MEMORY GRAPH', title: 'Pinned HNSW Index', sub: 'RAM + NVMe hot cache', pct: 100 },
      { step: '03 // FIRST QUERY', title: '0.0ms Cold Start', sub: 'No 15s wakeup penalty', pct: 100 },
    ],
    codeLines: [
      <><span className="s-cmt"># Zero Cold Starts — Even After 30 Days of Idle Traffic</span></>,
      <><span className="s-pl">health = client.</span><span className="s-fn">health</span><span className="s-pl">(</span><span className="s-key">collection</span><span className="s-pl">=</span><span className="s-str">"dev_sandbox"</span><span className="s-pl">)</span></>,
      <><span className="s-fn">assert</span><span className="s-pl"> health.auto_pause </span><span className="s-kw">is</span><span className="s-pl"> </span><span className="s-num">False</span></>,
      <><span className="s-fn">assert</span><span className="s-pl"> health.cold_start_ms == </span><span className="s-num">0.0</span></>,
    ],
    rawCode: `health = client.health(collection="dev_sandbox")\nassert health.auto_pause is False\nassert health.cold_start_ms == 0.0`,
    jsonOutput: [
      { k: '"state"', v: '"ALWAYS_HOT"', c: '#34d399' },
      { k: '"cold_start_ms"', v: '0.0', c: '#00d2ff' },
      { k: '"idle_timeout"', v: '"DISABLED"', c: '#e0f2fe' },
      { k: '"uptime_sla"', v: '"99.99%"', c: '#34d399' },
      { k: '"tier_policy"', v: '"NEVER_PAUSES"', c: '#34d399' },
    ],
  },
  {
    shortBadge: 'SNAPSHOT',
    tag: 'POINT-IN-TIME SNAPSHOTS',
    latency: '1.2s Restore',
    pipeline: [
      { step: '01 // SNAPSHOT', title: '1-Click Copy-on-Write', sub: 'Zero write blocking', pct: 95 },
      { step: '02 // ROLLBACK', title: 'Instant PITR Restore', sub: 'Any second in history', pct: 98 },
      { step: '03 // ZERO LOCK-IN', title: 'Parquet + JSONL Export', sub: 'Full raw vectors + meta', pct: 100 },
    ],
    codeLines: [
      <><span className="s-cmt"># Instant Snapshot &amp; Open Parquet Export (Zero Lock-In)</span></>,
      <><span className="s-pl">snap = client.</span><span className="s-fn">create_snapshot</span><span className="s-pl">(</span><span className="s-str">"prod_vecs"</span><span className="s-pl">, </span><span className="s-key">label</span><span className="s-pl">=</span><span className="s-str">"v1_release"</span><span className="s-pl">)</span></>,
      <><span className="s-pl">client.</span><span className="s-fn">export_parquet</span><span className="s-pl">(</span><span className="s-key">snapshot_id</span><span className="s-pl">=snap.id, </span><span className="s-key">dest</span><span className="s-pl">=</span><span className="s-str">"s3://my-bucket"</span><span className="s-pl">)</span></>,
    ],
    rawCode: `snap = client.create_snapshot("prod_vecs", label="v1_release")\nclient.export_parquet(snapshot_id=snap.id, dest="s3://my-bucket")`,
    jsonOutput: [
      { k: '"snapshot_id"', v: '"snap_2026_v1"', c: '#00d2ff' },
      { k: '"duration_ms"', v: '380', c: '#34d399' },
      { k: '"export_fmt"', v: '"Apache Parquet"', c: '#e0f2fe' },
      { k: '"vectors_saved"', v: '1,250,000', c: '#a1a1aa' },
      { k: '"vendor_lock"', v: '"NONE (0%)"', c: '#34d399' },
    ],
  },
  {
    shortBadge: 'RBAC',
    tag: 'ZERO-TRUST ACCESS CONTROL',
    latency: '< 50ms Revoke',
    pipeline: [
      { step: '01 // ADMIN KEYS', title: 'Full Cluster DDL', sub: 'Collection & key management', pct: 100 },
      { step: '02 // READ-WRITE', title: 'Scoped Ingestion', sub: 'Upsert + delete per index', pct: 85 },
      { step: '03 // READ-ONLY', title: 'Search-Only Keys', sub: 'Revoke in <50ms globally', pct: 100 },
    ],
    codeLines: [
      <><span className="s-cmt"># Issue Scoped Read-Only Key &amp; Revoke Instantly Without Downtime</span></>,
      <><span className="s-pl">key = client.keys.</span><span className="s-fn">create</span><span className="s-pl">(</span></>,
      <><span className="s-pl">  </span><span className="s-key">name</span><span className="s-pl">=</span><span className="s-str">"search_frontend"</span><span className="s-pl">, </span><span className="s-key">scope</span><span className="s-pl">=</span><span className="s-str">"read_only"</span><span className="s-pl">,</span></>,
      <><span className="s-pl">  </span><span className="s-key">collections</span><span className="s-pl">=[</span><span className="s-str">"catalog_v1"</span><span className="s-pl">]</span></>,
      <><span className="s-pl">)</span></>,
    ],
    rawCode: `key = client.keys.create(\n  name="search_frontend", scope="read_only",\n  collections=["catalog_v1"]\n)`,
    jsonOutput: [
      { k: '"key_prefix"', v: '"ib_ro_7f9a..."', c: '#00d2ff' },
      { k: '"scope"', v: '"READ_ONLY"', c: '#34d399' },
      { k: '"ddl_access"', v: '"DENIED"', c: '#f87171' },
      { k: '"revoke_time"', v: '"< 50ms global"', c: '#e0f2fe' },
      { k: '"audit_log"', v: '"ENABLED"', c: '#34d399' },
    ],
  },
  {
    shortBadge: 'VPC / ON-PREM',
    tag: 'SOVEREIGN VPC & ON-PREMISE',
    latency: '0.4ms Local',
    pipeline: [
      { step: '01 // CLOUD VPC', title: 'AWS · GCP · Azure', sub: 'Deploy inside your account', pct: 100 },
      { step: '02 // BARE-METAL', title: 'Air-Gapped On-Prem', sub: 'Banks · Defense · Hospitals', pct: 100 },
      { step: '03 // ENCRYPTION', title: 'Customer KMS Keys', sub: 'Zero external telemetry', pct: 100 },
    ],
    codeLines: [
      <><span className="s-cmt"># Deploy Iceberg BYOC Data Plane Inside Your Sovereign VPC</span></>,
      <><span className="s-fn">helm</span><span className="s-pl"> install iceberg-node iceberg/byoc-enclave \</span></>,
      <><span className="s-pl">  </span><span className="s-key">--set</span><span className="s-pl"> </span><span className="s-str">vpc.sovereignAirGap=true</span><span className="s-pl"> \</span></>,
      <><span className="s-pl">  </span><span className="s-key">--set</span><span className="s-pl"> </span><span className="s-str">kms.keyArn="arn:aws:kms:ap-south-1:..."</span></>,
    ],
    rawCode: `helm install iceberg-node iceberg/byoc-enclave \\\n  --set vpc.sovereignAirGap=true \\\n  --set kms.keyArn="arn:aws:kms:ap-south-1:..."`,
    jsonOutput: [
      { k: '"enclave"', v: '"CUSTOMER_VPC"', c: '#00d2ff' },
      { k: '"air_gapped"', v: 'true', c: '#34d399' },
      { k: '"kms_control"', v: '"CUSTOMER_OWNED"', c: '#e0f2fe' },
      { k: '"local_p99"', v: '"0.4ms"', c: '#34d399' },
      { k: '"egress"', v: '"0.0 KB/s"', c: '#34d399' },
    ],
  },
  {
    shortBadge: 'v1.0.0',
    tag: 'POLYGLOT NATIVE ECOSYSTEM',
    latency: '6 Native SDKs',
    pipeline: [
      { step: '01 // 6 CORE SDKS', title: 'Py · JS · Go · Rust · Java · .NET', sub: 'All locked at v1.0.0', pct: 100 },
      { step: '02 // FRAMEWORKS', title: 'LangChain & LlamaIndex', sub: '+ Spring Boot AI starter', pct: 100 },
      { step: '03 // AGENT MCP', title: 'Claude · Cursor · Gemini', sub: 'Zero-config MCP server', pct: 100 },
    ],
    codeLines: [
      <><span className="s-cmt"># Install Official v1.0.0 SDKs Across Your Entire Stack</span></>,
      <><span className="s-fn">pip</span><span className="s-pl"> install </span><span className="s-str">icebergdb==1.0.0</span><span className="s-pl">       </span><span className="s-cmt"># Python + LangChain</span></>,
      <><span className="s-fn">npm</span><span className="s-pl"> install </span><span className="s-str">iceberg-js@1.0.0</span><span className="s-pl">       </span><span className="s-cmt"># Node.js / Next.js</span></>,
      <><span className="s-fn">cargo</span><span className="s-pl"> add </span><span className="s-str">icebergdb@1.0.0</span><span className="s-pl">          </span><span className="s-cmt"># Rust Native</span></>,
    ],
    rawCode: `pip install icebergdb==1.0.0\nnpm install iceberg-js@1.0.0\ncargo add icebergdb@1.0.0`,
    jsonOutput: [
      { k: '"sdk_release"', v: '"v1.0.0 (GA)"', c: '#00d2ff' },
      { k: '"languages"', v: '"6 Official SDKs"', c: '#34d399' },
      { k: '"integrations"', v: '"LangChain, LlamaIndex"', c: '#e0f2fe' },
      { k: '"mcp_server"', v: '"npx iceberg-mcp"', c: '#34d399' },
      { k: '"api_parity"', v: '"100%"', c: '#34d399' },
    ],
  },
]

export default function CapabilitiesSplitConsole({ features, dark, gridLine, textPrimary, textMuted }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % features.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isHovered, features.length])

  const activeFeature = features[activeIdx]
  const activeSpec = CAPABILITY_CONSOLE_SPECS[activeIdx]
  const frameBorder = dark ? 'rgba(255,255,255,0.13)' : 'rgba(15,23,42,0.14)'

  const handleCopy = () => {
    navigator.clipboard?.writeText(activeSpec.rawCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      className="ib-code-frame grid grid-cols-1 lg:grid-cols-12"
      style={{
        background: dark ? '#0b0c0f' : '#ffffff',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
        e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
      }}
    >
      {/* ── Left Column (4/12): Pinecone Architectural Module Index ── */}
      <div
        className="lg:col-span-4 flex flex-col justify-between"
        style={{
          borderRight: `1px solid ${frameBorder}`,
          background: dark ? '#090a0d' : '#f8fafc',
        }}
      >
        {/* Left Top Architectural Header Bar */}
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{
            borderBottom: `1px solid ${frameBorder}`,
            background: dark ? '#0c0d11' : '#f1f5f9',
          }}
        >
          <span className="text-[10.5px] font-mono tracking-[0.18em] uppercase text-[#71717a] font-semibold">
            CAPABILITY INDEX // 09
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.12em] uppercase text-[#71717a]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isHovered ? 'bg-[#00d2ff]' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            {isHovered ? 'INTERACTIVE' : 'AUTO-LIVE'}
          </span>
        </div>

        {/* 9 Sleek Pinecone Selector Rows */}
        <div className="flex-1 flex flex-col justify-between">
          {features.map((f, i) => {
            const isActive = i === activeIdx
            const spec = CAPABILITY_CONSOLE_SPECS[i]
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => setActiveIdx(i)}
                className="group relative w-full text-left px-4 py-2.5 flex items-center justify-between gap-2.5 transition-all duration-150 cursor-pointer outline-none focus:outline-none"
                style={{
                  borderBottom: i < features.length - 1 ? `1px solid ${gridLine}` : 'none',
                  background: isActive
                    ? dark
                      ? '#13161d'
                      : '#e2e8f0'
                    : 'transparent',
                }}
              >
                {/* Crisp Left Indicator Bar (Pure White + Cyan Glow on Active) */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-150"
                  style={{
                    background: isActive ? '#ffffff' : 'transparent',
                    boxShadow: isActive ? '0 0 10px rgba(0, 210, 255, 0.75)' : 'none',
                  }}
                />

                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Pinecone Crisp White Active Number Pill */}
                  <span
                    className="text-[10.5px] font-mono px-1.5 py-0.5 tracking-[0.08em] shrink-0 transition-colors duration-150"
                    style={{
                      background: isActive
                        ? dark
                          ? '#ffffff'
                          : '#0a0b0d'
                        : dark
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(15,23,42,0.05)',
                      color: isActive
                        ? dark
                          ? '#0a0b0d'
                          : '#ffffff'
                        : dark
                          ? 'rgba(255,255,255,0.38)'
                          : '#64748b',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    0{i + 1}
                  </span>

                  <span
                    className="w-4 h-4 shrink-0 transition-colors duration-150"
                    style={{
                      color: isActive ? '#00d2ff' : dark ? 'rgba(255,255,255,0.45)' : '#64748b',
                    }}
                  >
                    {f.icon}
                  </span>

                  <span
                    className="text-[13.5px] truncate transition-colors duration-150"
                    style={{
                      color: isActive ? (dark ? '#ffffff' : '#0f172a') : textMuted,
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {f.title}
                  </span>
                </div>

                {/* Right Micro-Tag Badge */}
                <span
                  className="text-[9.5px] font-mono px-1.5 py-0.5 uppercase tracking-[0.1em] shrink-0 transition-all duration-150"
                  style={{
                    background:
                      spec.shortBadge === 'HOT' || isActive
                        ? dark
                          ? 'rgba(0, 210, 255, 0.14)'
                          : 'rgba(2, 132, 199, 0.12)'
                        : 'transparent',
                    color:
                      spec.shortBadge === 'HOT' || isActive
                        ? dark
                          ? '#00d2ff'
                          : '#0284c7'
                        : dark
                          ? 'rgba(255,255,255,0.26)'
                          : '#94a3b8',
                    border:
                      spec.shortBadge === 'HOT' || isActive
                        ? `1px solid ${dark ? 'rgba(0, 210, 255, 0.35)' : 'rgba(2, 132, 199, 0.3)'}`
                        : '1px solid transparent',
                  }}
                >
                  {spec.shortBadge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right Column (8/12): Live Interactive Architecture & Execution Console ── */}
      <div
        className="lg:col-span-8 flex flex-col justify-between relative overflow-hidden"
        style={{
          backgroundImage: dark
            ? 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)'
            : 'radial-gradient(rgba(15,23,42,0.05) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Right Top Architectural Status Bar (Matches Left Top Bar Height) */}
        <div
          className="px-6 py-2.5 flex flex-wrap items-center justify-between gap-2"
          style={{
            borderBottom: `1px solid ${frameBorder}`,
            background: dark ? '#0c0d11' : '#f1f5f9',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="text-[10.5px] font-mono tracking-[0.16em] uppercase font-semibold"
              style={{ color: dark ? '#00d2ff' : '#0284c7' }}
            >
              0{activeIdx + 1} // {activeSpec.tag}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-[10.5px] font-mono px-2 py-0.5"
              style={{
                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.05)',
                border: `1px solid ${frameBorder}`,
                color: dark ? '#e0f2fe' : '#0f172a',
              }}
            >
              SLA: <strong className="text-[#00d2ff]">{activeSpec.latency}</strong>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] font-mono text-[#71717a]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>v1.0.0 ENGINE</span>
            </span>
          </div>
        </div>

        {/* Main Live Body */}
        <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between gap-5">
          {/* 1. Selected Feature Title + Description + Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className="w-7 h-7 flex items-center justify-center shrink-0"
                  style={{
                    border: `1px solid ${dark ? 'rgba(0, 210, 255, 0.4)' : 'rgba(2, 132, 199, 0.3)'}`,
                    background: dark ? 'rgba(0, 210, 255, 0.1)' : 'rgba(2, 132, 199, 0.08)',
                    color: dark ? '#00d2ff' : '#0284c7',
                  }}
                >
                  <div className="w-4 h-4">{activeFeature.icon}</div>
                </div>
                <h3
                  className="text-lg sm:text-[21px] font-semibold tracking-[-0.02em]"
                  style={{ color: textPrimary }}
                >
                  {activeFeature.title}
                </h3>
              </div>
              <p
                className="text-[13.5px] sm:text-[14px] leading-[1.55] max-w-[580px]"
                style={{ color: textMuted }}
              >
                {activeFeature.desc}
              </p>
            </div>

            {activeFeature.title === 'Agent Memory' && (
              <Link
                to="/product/memory"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-mono font-semibold bg-white text-[#0a0b0d] hover:bg-[#e0f2fe] transition shrink-0"
              >
                <span>Memory Engine</span>
                <span>&#8599;</span>
              </Link>
            )}
          </div>

          {/* 2. Live 3-Stage Architectural Blueprint Pipeline (With Animated Flow & Telemetry Bars) */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 relative"
            style={{
              borderTop: `1px solid ${frameBorder}`,
              borderLeft: `1px solid ${frameBorder}`,
              background: dark ? '#08090c' : '#f8fafc',
            }}
          >
            {activeSpec.pipeline.map((node, idx) => (
              <div
                key={idx}
                className="p-3.5 relative flex flex-col justify-between"
                style={{
                  borderRight: `1px solid ${frameBorder}`,
                  borderBottom: `1px solid ${frameBorder}`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9.5px] font-mono tracking-[0.14em] uppercase text-[#71717a]">
                      {node.step}
                    </span>
                    <span className="text-[10px] font-mono text-[#00d2ff]">
                      {idx < 2 ? '───●' : '● LIVE'}
                    </span>
                  </div>
                  <div
                    className="text-[13px] font-mono font-semibold mb-0.5"
                    style={{ color: dark ? '#ffffff' : '#0f172a' }}
                  >
                    {node.title}
                  </div>
                  <div className="text-[11.5px] text-[#71717a] mb-2.5">
                    {node.sub}
                  </div>
                </div>

                {/* Live Telemetry Progress Bar */}
                <div
                  className="w-full h-[3px] overflow-hidden"
                  style={{ background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${node.pct}%`,
                      background: 'linear-gradient(90deg, #0076ff 0%, #00d2ff 100%)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 3. Split Syntax-Highlighted Code + Live Engine JSON Output Terminal */}
          <div
            className="grid grid-cols-1 md:grid-cols-12"
            style={{
              border: `1px solid ${frameBorder}`,
              background: dark ? '#07080a' : '#0f172a',
            }}
          >
            {/* Left (7/12): Numbered Syntax-Highlighted SDK Snippet */}
            <div
              className="md:col-span-7 flex flex-col justify-between"
              style={{
                borderBottom: `1px solid rgba(255,255,255,0.08)`,
                borderRight: `1px solid rgba(255,255,255,0.08)`,
              }}
            >
              <div
                className="px-3.5 py-2 flex items-center justify-between text-[10px] font-mono tracking-[0.14em] uppercase"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#a1a1aa',
                }}
              >
                <span>SDK REQUEST // v1.0.0</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy snippet"
                  className="px-1.5 py-0.5 text-[10px] font-mono border border-white/15 text-white/70 hover:text-white hover:border-white/40 transition cursor-pointer"
                >
                  {copied ? 'COPIED' : 'COPY ❐'}
                </button>
              </div>

              <div className="p-3.5 font-mono text-[12px] leading-[1.7] overflow-x-auto">
                {activeSpec.codeLines.map((line, lIdx) => (
                  <div key={lIdx} className="flex items-baseline">
                    <span className="w-6 shrink-0 select-none text-[10.5px] text-white/25">
                      {lIdx + 1}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right (5/12): Live Engine Telemetry JSON Response */}
            <div className="md:col-span-5 flex flex-col justify-between bg-[#050608]">
              <div
                className="px-3.5 py-2 flex items-center justify-between text-[10px] font-mono tracking-[0.14em] uppercase"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(0, 210, 255, 0.04)',
                  color: '#00d2ff',
                }}
              >
                <span>ENGINE OUTPUT</span>
                <span className="text-emerald-400">● 200 OK</span>
              </div>

              <div className="p-3.5 font-mono text-[11.5px] leading-[1.65] overflow-x-auto">
                <div className="text-white/40">{'{'}</div>
                {activeSpec.jsonOutput.map((row, rIdx) => (
                  <div key={rIdx} className="pl-3 flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-[#94a3b8]">{row.k}:</span>
                    <span style={{ color: row.c, fontWeight: 600 }}>{row.v}</span>
                    {rIdx < activeSpec.jsonOutput.length - 1 && (
                      <span className="text-white/30">,</span>
                    )}
                  </div>
                ))}
                <div className="text-white/40">{'}'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
