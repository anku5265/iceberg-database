import IcebergLogo from './IcebergLogo'

// Crisp, recognizable SVG brand marks and wordmarks for the Integrations Overview 3-column grid.
// Zero generic 2-letter placeholder boxes; AI coding tools cards intentionally omit top icons (matching reference layout).
export default function IntegrationLogo({ slug, category, dark = true }) {
  if (category === 'ai-coding-tools') {
    return null
  }

  const wrap = 'h-10 mb-3.5 flex items-center justify-start select-none'
  const fg = dark ? '#ffffff' : '#0f172a'

  switch (slug) {
    // -- Iceberg Native Capabilities ----------------------------------------
    case 'builtin-onnx':
    case 'openclaw-crewai':
      return (
        <div className={wrap}>
          <IcebergLogo className="w-8 h-8" />
        </div>
      )

    // -- Data Sources -------------------------------------------------------
    case 'airbyte':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <path d="M18 5C10.82 5 5 10.82 5 18v11h4.5V18a8.5 8.5 0 1117 0v11H31V18c0-7.18-5.82-13-13-13z" fill="#615EFF" />
            <circle cx="18" cy="18" r="4" fill="#8B88FF" />
          </svg>
        </div>
      )
    case 'apify':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <rect x="3" y="3" width="30" height="30" rx="6" fill={dark ? '#ffffff' : '#f1f5f9'} />
            <path d="M9 9l10 3-8 14L9 9z" fill="#83C524" />
            <path d="M19 12l8-3-3 18-5-15z" fill="#00AEEF" />
            <path d="M19 12l5 15H11l8-15z" fill="#FF6B2B" />
          </svg>
        </div>
      )
    case 'aryn':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <rect x="3" y="3" width="30" height="30" rx="6" fill={dark ? '#ffffff' : '#f1f5f9'} />
            <circle cx="18" cy="18" r="10" stroke="#1E3A5F" strokeWidth="2.2" />
            <path d="M12 20c2-5 4-5 6 0s4 5 6-3" stroke="#0EA5E9" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'box':
      return (
        <div className={wrap}>
          <div className="w-9 h-9 rounded-[5px] bg-white flex items-center justify-center border border-black/10">
            <span className="font-sans font-extrabold text-[14px] tracking-tight text-[#0061D5]">box</span>
          </div>
        </div>
      )
    case 'confluent':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="14" stroke="#C4A47C" strokeWidth="2" />
            <path d="M18 8v20M8 18h20M11 11l14 14M25 11L11 25" stroke="#C4A47C" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'databricks':
      return (
        <div className={wrap}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M18 5L5 12l13 7 13-7L18 5z" stroke="#FF3621" strokeWidth="2.3" strokeLinejoin="round" />
            <path d="M5 18l13 7 13-7" stroke="#FF3621" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 24l13 7 13-7" stroke="#FF3621" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )
    case 'estuary':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <path d="M6 12c6-4 18-4 24 0M6 18c6-4 18-4 24 0M6 24c6-4 18-4 24 0" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'fleak':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <rect x="5" y="7" width="16" height="6" rx="3" fill="#6366F1" />
            <rect x="5" y="16" width="24" height="6" rx="3" fill="#818CF8" />
            <rect x="5" y="25" width="11" height="5" rx="2.5" fill="#A5B4FC" />
          </svg>
        </div>
      )
    case 'flowise':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="4" width="28" height="28" rx="7" fill="url(#fwGrad)" />
            <path d="M12 13h12M12 18h8M12 23h5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="fwGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    case 'gathr':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="12" stroke="#14B8A6" strokeWidth="2.5" />
            <path d="M18 12v6h6" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'matillion':
      return (
        <div className={wrap}>
          <div className="inline-flex items-center gap-1.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 18V8l4 5 4-5 4 5 4-5v10" stroke="#22C55E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-sans font-bold text-[15px] text-[#22C55E] tracking-tight">matillion</span>
          </div>
        </div>
      )
    case 'nexla':
      return (
        <div className={wrap}>
          <svg width="36" height="28" viewBox="0 0 40 28" fill="none">
            <path d="M4 20l10-12 10 12" stroke="#3B82F6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 8l10 12 10-12" stroke="#F97316" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )
    case 'redpanda':
      return (
        <div className={wrap}>
          <span className="font-sans font-extrabold text-[15px] tracking-tight text-[#E2442F]">Redpanda</span>
        </div>
      )
    case 'snowflake-openflow':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <path d="M18 4v28M4 18h28M8 8l20 20M28 8L8 28" stroke="#29B5E8" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="18" cy="18" r="3.5" fill={dark ? '#151619' : '#ffffff'} stroke="#29B5E8" strokeWidth="2.4" />
          </svg>
        </div>
      )
    case 'streamnative':
      return (
        <div className={wrap}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M24 9H14a5 5 0 000 10h8a5 5 0 010 10H12" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="18" cy="19" r="2.5" fill="#60A5FA" />
          </svg>
        </div>
      )
    case 'unstructured':
      return (
        <div className={wrap}>
          <div className="w-9 h-9 rounded-[4px] bg-[#0AD2E6] text-[#082028] font-mono font-extrabold text-[8px] leading-[1.05] flex flex-col items-center justify-center tracking-widest">
            <span>UNST</span>
            <span>RUCT</span>
            <span>URED</span>
          </div>
        </div>
      )

    // -- Frameworks ---------------------------------------------------------
    case 'ai-engine':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <rect x="6" y="8" width="24" height="20" rx="5" stroke="#818CF8" strokeWidth="2.2" />
            <circle cx="14" cy="18" r="2.2" fill="#818CF8" />
            <circle cx="22" cy="18" r="2.2" fill="#818CF8" />
            <path d="M18 4v4" stroke="#818CF8" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'amazon-bedrock':
    case 'amazon-sagemaker':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <path d="M18 6v24M11 10h7M11 18h7M11 26h7M25 13h-7M25 21h-7" stroke={fg} strokeWidth="1.9" strokeLinecap="round" />
            <circle cx="10" cy="10" r="2" fill="#38BDF8" />
            <circle cx="10" cy="18" r="2" fill="#38BDF8" />
            <circle cx="10" cy="26" r="2" fill="#38BDF8" />
            <circle cx="26" cy="13" r="2" fill="#A78BFA" />
            <circle cx="26" cy="21" r="2" fill="#A78BFA" />
          </svg>
        </div>
      )
    case 'cloudera-ai':
      return (
        <div className={wrap}>
          <span className="font-sans font-extrabold text-[12.5px] tracking-[0.12em] text-[#F96702]">CLOUDERA</span>
        </div>
      )
    case 'context-data':
      return (
        <div className={wrap}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M24 10l-8-4-8 5v14l8 5 8-4" stroke="#6366F1" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 14l8 4-8 4" stroke="#818CF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )
    case 'genkit':
      return (
        <div className={wrap}>
          <div className="inline-flex items-center gap-1.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke="#FFA000" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" fill="#FFCA28" />
            </svg>
            <span className="font-sans font-bold text-[14.5px]" style={{ color: fg }}>Genkit</span>
          </div>
        </div>
      )
    case 'haystack':
      return (
        <div className={wrap}>
          <div className="w-9 h-9 rounded-[7px] bg-[#14B89A] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M7 19v-7a5 5 0 0110 0v7M11 19v-5a1 1 0 012 0v5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )
    case 'instill':
      return (
        <div className={wrap}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="6" height="10" fill="#FACC15" />
            <rect x="13" y="4" width="6" height="6" fill="#38BDF8" />
            <rect x="22" y="4" width="6" height="12" fill="#EF4444" />
            <rect x="4" y="17" width="12" height="5" fill="#3B82F6" />
            <rect x="19" y="19" width="9" height="9" fill="#22C55E" />
            <rect x="4" y="24" width="12" height="4" fill="#F97316" />
          </svg>
        </div>
      )
    case 'langchain':
      return (
        <div className={wrap}>
          <svg width="38" height="32" viewBox="0 0 42 32" fill="none">
            <path d="M10 22c-3-4-2-10 3-12 2 3 4 6 3 10l-6 2z" fill="#84CC16" />
            <path d="M23 19l5-5a4 4 0 015.6 5.6l-3 3M27 15l-3 3a4 4 0 005.6 5.6l2-2" stroke="#A1A1AA" strokeWidth="2.1" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'llamaindex':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <path d="M12 6v10l12 4v10H10V16" stroke="url(#liGrad)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="liGrad" x1="10" y1="6" x2="26" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F472B6" />
                <stop offset="0.5" stopColor="#A78BFA" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    case 'n8n':
      return (
        <div className={wrap}>
          <svg width="38" height="28" viewBox="0 0 42 28" fill="none">
            <circle cx="8" cy="14" r="3.2" stroke="#EA4B71" strokeWidth="2.2" />
            <circle cx="19" cy="14" r="3.2" stroke="#EA4B71" strokeWidth="2.2" />
            <circle cx="31" cy="8" r="3.2" stroke="#EA4B71" strokeWidth="2.2" />
            <circle cx="31" cy="20" r="3.2" stroke="#EA4B71" strokeWidth="2.2" />
            <path d="M11.5 14h4M22 12.5l6-3.5M22 15.5l6 3.5" stroke="#EA4B71" strokeWidth="2.2" />
          </svg>
        </div>
      )
    case 'progress-agentic-rag':
      return (
        <div className={wrap}>
          <div className="w-9 h-9 rounded-[5px] bg-white flex items-center justify-center border border-black/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 5l11 7-11 7V5z" fill="#5CE500" />
            </svg>
          </div>
        </div>
      )
    case 'voltagent':
      return (
        <div className={wrap}>
          <div className="inline-flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full border border-[#10B981] text-[#10B981] flex items-center justify-center text-[11px] font-bold">v</span>
            <span className="font-sans font-bold text-[13.5px] text-[#10B981]">voltagent</span>
          </div>
        </div>
      )

    // -- Infrastructure -----------------------------------------------------
    case 'aws':
      return (
        <div className={wrap}>
          <div className="inline-flex flex-col items-start leading-none">
            <span className="font-sans font-bold text-[18px] tracking-tight" style={{ color: fg }}>aws</span>
            <svg width="36" height="9" viewBox="0 0 36 9" fill="none">
              <path d="M2 2c9 6 22 6 31 0" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M29 1l4 1-1.5 4" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )
    case 'google-cloud':
      return (
        <div className={wrap}>
          <svg width="36" height="30" viewBox="0 0 40 32" fill="none">
            <path d="M25 10a8 8 0 00-14 3" stroke="#EA4335" strokeWidth="4" strokeLinecap="round" />
            <path d="M11 13a7 7 0 002 13h7" stroke="#FBBC05" strokeWidth="4" strokeLinecap="round" />
            <path d="M20 26h7a6 6 0 001-11.8" stroke="#4285F4" strokeWidth="4" strokeLinecap="round" />
            <path d="M28 14.2A8 8 0 0025 10" stroke="#34A853" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'microsoft-azure':
      return (
        <div className={wrap}>
          <svg width="34" height="32" viewBox="0 0 36 34" fill="none">
            <path d="M15 4L4 28h8l7-15-4-9z" fill="#0078D4" />
            <path d="M17 9l6 13h-8l-3 6h19L20 4l-3 5z" fill="#38BDF8" />
          </svg>
        </div>
      )
    case 'docker-byoc':
      return (
        <div className={wrap}>
          <svg width="36" height="30" viewBox="0 0 40 32" fill="none">
            <rect x="8" y="12" width="5" height="5" rx="1" fill="#2496ED" />
            <rect x="14" y="12" width="5" height="5" rx="1" fill="#2496ED" />
            <rect x="20" y="12" width="5" height="5" rx="1" fill="#2496ED" />
            <rect x="14" y="6" width="5" height="5" rx="1" fill="#2496ED" />
            <rect x="20" y="6" width="5" height="5" rx="1" fill="#2496ED" />
            <path d="M4 18h25c2 0 4-1 5-3 2 1 3 3 2 5-2 5-8 8-17 8S5 24 4 18z" fill="#2496ED" />
          </svg>
        </div>
      )
    case 'pulumi':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <path d="M18 4l11 6.5v13L18 30 7 23.5v-13L18 4z" stroke="#A855F7" strokeWidth="2.4" />
            <circle cx="18" cy="11" r="2.5" fill="#FACC15" />
            <circle cx="12" cy="21" r="2.5" fill="#EC4899" />
            <circle cx="24" cy="21" r="2.5" fill="#8B5CF6" />
          </svg>
        </div>
      )
    case 'terraform':
      return (
        <div className={wrap}>
          <svg width="32" height="34" viewBox="0 0 32 34" fill="none">
            <path d="M3 3l8 4.6v9.2L3 12.2V3z" fill="#7B42BC" />
            <path d="M12.5 8.4l8 4.6v9.2l-8-4.6V8.4z" fill="#7B42BC" />
            <path d="M22 13l8-4.6v9.2L22 22.2V13z" fill="#5C4EE5" />
            <path d="M12.5 19.2l8 4.6V33l-8-4.6v-9.2z" fill="#7B42BC" />
          </svg>
        </div>
      )
    case 'vercel':
      return (
        <div className={wrap}>
          <svg width="30" height="28" viewBox="0 0 32 28" fill="none">
            <path d="M16 3L30 27H2L16 3z" fill={fg} />
          </svg>
        </div>
      )
    case 'zapier':
      return (
        <div className={wrap}>
          <div className="inline-flex items-baseline font-sans font-extrabold text-[16px] tracking-tight">
            <span className="text-[#FF4F00] mr-0.5">_</span>
            <span style={{ color: fg }}>zapier</span>
          </div>
        </div>
      )

    // -- Models -------------------------------------------------------------
    case 'cohere':
      return (
        <div className={wrap}>
          <svg width="36" height="32" viewBox="0 0 38 32" fill="none">
            <rect x="4" y="4" width="24" height="13" rx="6.5" fill="#39594D" />
            <circle cx="9" cy="24" r="4.5" fill="#FF7759" />
            <rect x="16" y="19" width="14" height="9" rx="4.5" fill="#D18EE2" />
          </svg>
        </div>
      )
    case 'voyage-ai':
      return (
        <div className={wrap}>
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="17" stroke={fg} strokeOpacity="0.45" strokeWidth="1.2" />
            <text x="20" y="22.5" textAnchor="middle" fill={fg} fontSize="5.4" fontWeight="700" letterSpacing="0.45" fontFamily="sans-serif">
              VOYAGE AI
            </text>
          </svg>
        </div>
      )
    case 'huggingface':
      return (
        <div className={wrap}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="13" fill="#FFD21E" />
            <circle cx="13.5" cy="15" r="1.8" fill="#1F2937" />
            <circle cx="22.5" cy="15" r="1.8" fill="#1F2937" />
            <path d="M13 21c1.5 2.5 8.5 2.5 10 0" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'jina-ai':
      return (
        <div className={wrap}>
          <div className="inline-flex items-baseline font-sans font-extrabold text-[18px] tracking-tight">
            <span className="text-[#F43F5E]">.</span>
            <span className="text-[#14B8A6]">jina</span>
          </div>
        </div>
      )
    case 'openai':
      return (
        <div className={wrap}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="11" stroke={fg} strokeWidth="2.2" />
            <polygon points="18,9 25.8,13.5 25.8,22.5 18,27 10.2,22.5 10.2,13.5" stroke={fg} strokeWidth="1.8" fill="none" />
          </svg>
        </div>
      )
    case 'twelve-labs':
      return (
        <div className={wrap}>
          <div className="w-9 h-9 rounded-[5px] bg-white p-1.5 grid grid-cols-2 gap-1 border border-black/10">
            <span className="rounded-full bg-[#FB923C]" />
            <span className="rounded-full bg-[#4ADE80]" />
            <span className="rounded-full bg-[#38BDF8]" />
            <span className="rounded-full bg-[#1E1B4B]" />
          </div>
        </div>
      )

    // -- Observability ------------------------------------------------------
    case 'prometheus-grafana':
      return (
        <div className={wrap}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="13" stroke="#E6522C" strokeWidth="2.4" />
            <path d="M13 22c1-5 3-9 5-11 2 2 4 6 5 11H13z" fill="#E6522C" />
          </svg>
        </div>
      )
    case 'datadog':
      return (
        <div className={wrap}>
          <div className="w-9 h-9 rounded-[6px] bg-[#632CA6] flex items-center justify-center">
            <span className="font-mono font-extrabold text-[13px] text-white">DD</span>
          </div>
        </div>
      )
    case 'honeyhive':
      return (
        <div className={wrap}>
          <div className="inline-flex items-center gap-1.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon points="12,3 19,7 19,17 12,21 5,17 5,7" stroke="#38BDF8" strokeWidth="2" />
            </svg>
            <span className="font-sans font-semibold text-[14px]" style={{ color: fg }}>HoneyHive</span>
          </div>
        </div>
      )
    case 'new-relic':
      return (
        <div className={wrap}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M18 5l11 6.5v13L18 31v-13L7 11.5 18 5z" stroke="#1CE783" strokeWidth="3" strokeLinejoin="round" />
          </svg>
        </div>
      )
    case 'traceloop':
      return (
        <div className={wrap}>
          <svg width="34" height="28" viewBox="0 0 38 28" fill="none">
            <path d="M12 8a6 6 0 100 12c5 0 9-12 14-12a6 6 0 110 12c-5 0-9-12-14-12z" stroke="#60A5FA" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'trulens':
      return (
        <div className={wrap}>
          <div className="inline-flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-md bg-[#0EA5E9]/20 border border-[#0EA5E9] text-[#38BDF8] flex items-center justify-center font-mono text-[11px] font-bold">T</span>
            <span className="font-sans font-bold text-[14.5px]" style={{ color: fg }}>TruLens</span>
          </div>
        </div>
      )

    default:
      return (
        <div className={wrap}>
          <IcebergLogo className="w-7 h-7" />
        </div>
      )
  }
}
