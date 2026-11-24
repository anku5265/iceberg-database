import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const CONNECT_METHODS = [
  { id: 'code', label: 'Code' },
  { id: 'n8n', label: 'n8n' },
  { id: 'claude', label: 'Claude Code' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'codex', label: 'Codex' },
  { id: 'other', label: 'Other Agent' },
  { id: 'none', label: 'None' },
]

const ASSISTANT_SDKS = [
  {
    id: 'node',
    label: 'Node',
    installCmd: 'npm install iceberg-js',
    createLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">import</span> {'{'} Iceberg {'}'} <span className="text-[#ddad7d]">from</span> <span className="text-[#8fcf6d]">&apos;iceberg-js&apos;</span>;</span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#ddad7d]">const</span> ic = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">Iceberg</span>({'{'} apiKey: <span className="text-[#8fcf6d]">&apos;{key}&apos;</span> {'}'});</span>,
      <span key="4"></span>,
      <span key="5"><span className="text-[#ddad7d]">const</span> assistant = <span className="text-[#ddad7d]">await</span> ic.<span className="text-[#6bb6e4]">createAssistant</span>({'{'}</span>,
      <span key="6">{'  '}name: <span className="text-[#8fcf6d]">&apos;example-assistant&apos;</span>,</span>,
      <span key="7">{'  '}instructions: <span className="text-[#8fcf6d]">&apos;Answer in polite, short sentences. Use American English spelling and vocabulary.&apos;</span>,</span>,
      <span key="8">{'  '}region: <span className="text-[#8fcf6d]">&apos;ap-south-1&apos;</span></span>,
      <span key="9">{'}'});</span>,
    ],
    createRaw: (key) => `import { Iceberg } from 'iceberg-js';\n\nconst ic = new Iceberg({ apiKey: '${key}' });\n\nconst assistant = await ic.createAssistant({\n  name: 'example-assistant',\n  instructions: 'Answer in polite, short sentences. Use American English spelling and vocabulary.',\n  region: 'ap-south-1'\n});`,
  },
  {
    id: 'python',
    label: 'Python',
    installCmd: 'pip install icebergdb',
    createLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">from</span> iceberg <span className="text-[#ddad7d]">import</span> Iceberg</span>,
      <span key="2"></span>,
      <span key="3">ic = <span className="text-[#6bb6e4]">Iceberg</span>(api_key=<span className="text-[#8fcf6d]">&quot;{key}&quot;</span>)</span>,
      <span key="4"></span>,
      <span key="5">assistant = ic.assistant.<span className="text-[#6bb6e4]">create_assistant</span>(</span>,
      <span key="6">{'    '}assistant_name=<span className="text-[#8fcf6d]">&quot;example-assistant&quot;</span>,</span>,
      <span key="7">{'    '}instructions=<span className="text-[#8fcf6d]">&quot;Answer in polite, short sentences. Use American English spelling and vocabulary.&quot;</span>,</span>,
      <span key="8">{'    '}region=<span className="text-[#8fcf6d]">&quot;ap-south-1&quot;</span></span>,
      <span key="9">)</span>,
    ],
    createRaw: (key) => `from iceberg import Iceberg\n\nic = Iceberg(api_key="${key}")\n\nassistant = ic.assistant.create_assistant(\n    assistant_name="example-assistant",\n    instructions="Answer in polite, short sentences. Use American English spelling and vocabulary.",\n    region="ap-south-1"\n)`,
  },
  {
    id: 'java',
    label: 'Java',
    installLines: [
      <span key="1"><span className="text-[#8a8a8a]">// Maven (pom.xml)</span></span>,
      <span key="2">&lt;<span className="text-[#6bb6e4]">dependency</span>&gt;</span>,
      <span key="3">{'  '}&lt;<span className="text-[#6bb6e4]">groupId</span>&gt;in.iceberg&lt;/<span className="text-[#6bb6e4]">groupId</span>&gt;</span>,
      <span key="4">{'  '}&lt;<span className="text-[#6bb6e4]">artifactId</span>&gt;iceberg-client&lt;/<span className="text-[#6bb6e4]">artifactId</span>&gt;</span>,
      <span key="5">{'  '}&lt;<span className="text-[#6bb6e4]">version</span>&gt;<span className="text-[#decc75]">1.0.0</span>&lt;/<span className="text-[#6bb6e4]">version</span>&gt;</span>,
      <span key="6">&lt;/<span className="text-[#6bb6e4]">dependency</span>&gt;</span>,
    ],
    installCmd: `<dependency>\n  <groupId>in.iceberg</groupId>\n  <artifactId>iceberg-client</artifactId>\n  <version>1.0.0</version>\n</dependency>`,
    createLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">import</span> in.iceberg.clients.Iceberg;</span>,
      <span key="2"></span>,
      <span key="3">Iceberg ic = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">Iceberg.Builder</span>(<span className="text-[#8fcf6d]">&quot;{key}&quot;</span>).<span className="text-[#6bb6e4]">build</span>();</span>,
      <span key="4">ic.<span className="text-[#6bb6e4]">createCollection</span>(</span>,
      <span key="5">{'    '}<span className="text-[#8fcf6d]">&quot;example-assistant&quot;</span>,</span>,
      <span key="6">{'    '}<span className="text-[#8fcf6d]">&quot;Answer in polite, short sentences. Use American English spelling and vocabulary.&quot;</span></span>,
      <span key="7">);</span>,
    ],
    createRaw: (key) => `import in.iceberg.clients.Iceberg;\n\nIceberg ic = new Iceberg.Builder("${key}").build();\nic.createCollection(\n    "example-assistant",\n    "Answer in polite, short sentences. Use American English spelling and vocabulary."\n);`,
  },
  {
    id: 'go',
    label: 'Go',
    installCmd: 'go get github.com/anku5265/iceberg-sdk-go/iceberg',
    createLines: (key) => [
      <span key="1">ic, err := iceberg.<span className="text-[#c678dd]">NewClient</span>(iceberg.NewClientParams{'{'}</span>,
      <span key="2">{'    '}ApiKey: <span className="text-[#8fcf6d]">&quot;{key}&quot;</span>,</span>,
      <span key="3">{'}'})</span>,
      <span key="4">_, err = ic.<span className="text-[#c678dd]">CreateCollection</span>(</span>,
      <span key="5">{'    '}<span className="text-[#8fcf6d]">&quot;example-assistant&quot;</span>,</span>,
      <span key="6">{'    '}<span className="text-[#8fcf6d]">&quot;Answer in polite, short sentences. Use American English spelling and vocabulary.&quot;</span>,</span>,
      <span key="7">)</span>,
    ],
    createRaw: (key) => `ic, err := iceberg.NewClient(iceberg.NewClientParams{\n    ApiKey: "${key}",\n})\n_, err = ic.CreateCollection(\n    "example-assistant",\n    "Answer in polite, short sentences. Use American English spelling and vocabulary.",\n)`,
  },
  {
    id: 'rust',
    label: 'Rust',
    installCmd: 'cargo add icebergdb',
    createLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">use</span> icebergdb::<span className="text-[#6bb6e4]">Client</span>;</span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#ddad7d]">let</span> ic = <span className="text-[#6bb6e4]">Client</span>::<span className="text-[#c678dd]">new</span>(<span className="text-[#8fcf6d]">&quot;{key}&quot;</span>);</span>,
      <span key="4">ic.<span className="text-[#c678dd]">create_collection</span>(</span>,
      <span key="5">{'    '}<span className="text-[#8fcf6d]">&quot;example-assistant&quot;</span>,</span>,
      <span key="6">{'    '}<span className="text-[#6bb6e4]">Some</span>(<span className="text-[#8fcf6d]">&quot;Answer in polite, short sentences. Use American English spelling and vocabulary.&quot;</span>),</span>,
      <span key="7">).<span className="text-[#ddad7d]">await</span>?;</span>,
    ],
    createRaw: (key) => `use icebergdb::Client;\n\nlet ic = Client::new("${key}");\nic.create_collection(\n    "example-assistant",\n    Some("Answer in polite, short sentences. Use American English spelling and vocabulary."),\n).await?;`,
  },
  {
    id: 'dotnet',
    label: '.NET',
    installCmd: 'dotnet add package IcebergDb --version 1.0.0',
    createLines: (key) => [
      <span key="1"><span className="text-[#ddad7d]">using</span> Iceberg;</span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#ddad7d]">var</span> ic = <span className="text-[#ddad7d]">new</span> <span className="text-[#6bb6e4]">IcebergClient</span>(<span className="text-[#8fcf6d]">&quot;{key}&quot;</span>);</span>,
      <span key="4"><span className="text-[#ddad7d]">await</span> ic.<span className="text-[#c678dd]">CreateCollectionAsync</span>(</span>,
      <span key="5">{'    '}<span className="text-[#8fcf6d]">&quot;example-assistant&quot;</span>,</span>,
      <span key="6">{'    '}<span className="text-[#8fcf6d]">&quot;Answer in polite, short sentences. Use American English spelling and vocabulary.&quot;</span></span>,
      <span key="7">);</span>,
    ],
    createRaw: (key) => `using Iceberg;\n\nvar ic = new IcebergClient("${key}");\nawait ic.CreateCollectionAsync(\n    "example-assistant",\n    "Answer in polite, short sentences. Use American English spelling and vocabulary."\n);`,
  },
  {
    id: 'shell',
    label: 'Shell',
    isShellOnly: true,
    createLines: (key) => [
      <span key="1"><span className="text-[#6bb6e4]">ICEBERG_API_KEY</span>=<span className="text-[#8fcf6d]">&quot;{key}&quot;</span></span>,
      <span key="2"></span>,
      <span key="3"><span className="text-[#c678dd]">curl</span> <span className="text-[#8fcf6d]">&quot;https://api.icebergdb.in/assistant&quot;</span> \</span>,
      <span key="4">{'  '}<span className="text-[#6bb6e4]">-H</span> <span className="text-[#8fcf6d]">&quot;X-API-Key: </span><span className="text-[#6bb6e4]">$ICEBERG_API_KEY</span><span className="text-[#8fcf6d]">&quot;</span> \</span>,
      <span key="5">{'  '}<span className="text-[#6bb6e4]">-H</span> <span className="text-[#8fcf6d]">&quot;Content-Type: application/json&quot;</span> \</span>,
      <span key="6">{'  '}<span className="text-[#6bb6e4]">-d</span> <span className="text-[#8fcf6d]">&apos;{'{'}</span></span>,
      <span key="7"><span className="text-[#8fcf6d]">{'  "name": "example-assistant",'}</span></span>,
      <span key="8"><span className="text-[#8fcf6d]">{'  "instructions": "Answer in polite, short sentences. Use American English spelling and vocabulary."'}</span></span>,
      <span key="9"><span className="text-[#8fcf6d]">{'}\''}</span></span>,
    ],
    createRaw: (key) => `ICEBERG_API_KEY="${key}"\n\ncurl "https://api.icebergdb.in/assistant" \\\n  -H "X-API-Key: $ICEBERG_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n  "name": "example-assistant",\n  "instructions": "Answer in polite, short sentences. Use American English spelling and vocabulary."\n}'`,
  },
]

function CopyIconButton({ copied, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-[2px] text-[#999999] hover:text-white hover:bg-[#2a2a2a] cursor-pointer shrink-0"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg width="16" height="16" fill="none" stroke="#10b981" strokeWidth="2.2" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

export default function AssistantQuickstart() {
  const dropdownRef = useRef(null)
  const [connectMethod, setConnectMethod] = useState('code')
  const [sdkLang, setSdkLang] = useState('shell')
  const [openMenu, setOpenMenu] = useState(null) // 'method' | 'sdk' | null
  const [revealedKey, setRevealedKey] = useState('')
  const [copiedId, setCopiedId] = useState('')

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentSdk = ASSISTANT_SDKS.find((s) => s.id === sdkLang) || ASSISTANT_SDKS[ASSISTANT_SDKS.length - 1]
  const currentMethod = CONNECT_METHODS.find((m) => m.id === connectMethod) || CONNECT_METHODS[0]
  const displayKey = revealedKey || 'YOUR_API_KEY'

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 1800)
  }

  const handleGetApiKey = () => {
    const storedKey = localStorage.getItem('iceberg_api_key') || 'ib_live_quickstart_key'
    setRevealedKey(storedKey)
    copyText(storedKey, 'apikey')
  }

  return (
    <div className="py-12 sm:py-14 px-4 sm:px-6 max-w-[920px] mx-auto">
      {/* ── Top Centered Hero Section (Exact Match to Pinecone Screenshot 1) ── */}
      <div className="text-center max-w-[660px] mx-auto">
        <h1 className="text-[34px] sm:text-[36px] font-bold tracking-[-0.02em] text-[var(--text-primary)] leading-[1.2]">
          Get started with Iceberg Assistant
        </h1>
        <p className="mt-4 text-[15px] text-[var(--text-primary)] leading-[1.6]">
          Start building accurate question-answering capability into your AI products.
          <br className="hidden sm:inline" />{' '}
          Read through our{' '}
          <Link to="/docs" className="text-[var(--accent)] hover:underline">
            documentation
          </Link>{' '}
          or follow the quickstart guide below.
        </p>

        <div className="mt-7 flex justify-center">
          <Link to="/assistants?create=1" className="pc-btn-primary">
            Create an assistant
          </Link>
        </div>
      </div>

      {/* ── Single Unified Bordered Developer Quickstart Card (Exact Match to Pinecone Screenshots 1, 2, 3) ── */}
      <div className="mt-11 max-w-[660px] mx-auto pc-card p-6 sm:p-8 space-y-6">
        {/* Top Row: Developer quickstart + Custom Dark Dropdowns */}
        <div ref={dropdownRef} className="flex items-center justify-between gap-4">
          <h2 className="text-[16.5px] font-bold tracking-tight text-[var(--text-primary)]">
            Developer quickstart
          </h2>

          <div className="flex items-center gap-5">
            {/* Dropdown 1: Connect Method (Code / Claude Code / Cursor / Codex / Other Agent / None) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === 'method' ? null : 'method')}
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)] hover:opacity-80 cursor-pointer py-1"
              >
                <span>{currentMethod.label}</span>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  {openMenu === 'method' ? (
                    <polyline points="18 15 12 9 6 15" />
                  ) : (
                    <polyline points="6 9 12 15 18 9" />
                  )}
                </svg>
              </button>

              {openMenu === 'method' && (
                <div className="absolute right-0 top-full mt-1.5 w-[160px] bg-[#1f1f1f] border border-[#3a3a3a] rounded-[2px] py-1.5 z-50 shadow-[0_10px_28px_rgba(0,0,0,0.65)]">
                  {CONNECT_METHODS.map((m) => {
                    const active = m.id === connectMethod
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setConnectMethod(m.id)
                          setOpenMenu(null)
                        }}
                        className={`w-full px-3.5 py-2 text-left text-[14.5px] flex items-center justify-between hover:bg-[#2a2a2a] cursor-pointer ${
                          active ? 'font-bold text-white' : 'font-normal text-[#e5e5e5]'
                        }`}
                      >
                        <span>{m.label}</span>
                        {active && (
                          <svg width="15" height="15" fill="none" stroke="#4da3fa" strokeWidth="2.4" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dropdown 2: SDK Language (Node, Python, Java, Go, Rust, .NET, Shell) */}
            {connectMethod === 'code' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === 'sdk' ? null : 'sdk')}
                  className="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)] hover:opacity-80 cursor-pointer py-1"
                >
                  <span>{currentSdk.label}</span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    {openMenu === 'sdk' ? (
                      <polyline points="18 15 12 9 6 15" />
                    ) : (
                      <polyline points="6 9 12 15 18 9" />
                    )}
                  </svg>
                </button>

                {openMenu === 'sdk' && (
                  <div className="absolute right-0 top-full mt-1.5 w-[132px] bg-[#1f1f1f] border border-[#3a3a3a] rounded-[2px] py-1.5 z-50 shadow-[0_10px_28px_rgba(0,0,0,0.65)]">
                    {ASSISTANT_SDKS.map((sdk) => {
                      const active = sdk.id === sdkLang
                      return (
                        <button
                          key={sdk.id}
                          type="button"
                          onClick={() => {
                            setSdkLang(sdk.id)
                            setOpenMenu(null)
                          }}
                          className={`w-full px-3.5 py-2 text-left text-[14.5px] flex items-center justify-between hover:bg-[#2a2a2a] cursor-pointer ${
                            active ? 'font-bold text-white' : 'font-normal text-[#e5e5e5]'
                          }`}
                        >
                          <span>{sdk.label}</span>
                          {active && (
                            <svg width="15" height="15" fill="none" stroke="#4da3fa" strokeWidth="2.4" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 1: Get your API key */}
        <div>
          <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
            Get your API key
          </h3>
          <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5">
            You need an API key for secure access to your project.
          </p>
          <div className="mt-3.5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleGetApiKey}
              className="inline-flex items-center gap-2.5 px-3.5 h-[36px] rounded-[2px] border border-[var(--border2)] bg-[var(--card-bg)] hover:bg-[var(--bg-hover)] text-[14.5px] font-semibold text-[var(--text-primary)] cursor-pointer"
            >
              <span className="text-[17px] leading-none font-normal">+</span>
              <span>API key</span>
            </button>
            {revealedKey && (
              <span className="text-[13.5px] text-emerald-400 font-medium">
                {copiedId === 'apikey' ? 'API key copied & injected below!' : 'Active API key injected into snippet below'}
              </span>
            )}
          </div>
        </div>

        {connectMethod === 'code' ? (
          <>
            {/* Step 2: Install Iceberg SDK (Hidden for Shell, matching Pinecone Screenshot 2) */}
            {!currentSdk.isShellOnly && (
              <div>
                <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
                  Install Iceberg SDK
                </h3>
                <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5">
                  To start using Iceberg Assistant with the {currentSdk.label} SDK, install or upgrade the package as follows:
                </p>

                {currentSdk.installLines ? (
                  <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 py-[14px] relative font-mono text-[14px] leading-[21px]">
                    <div className="absolute top-3 right-3">
                      <CopyIconButton
                        copied={copiedId === 'install'}
                        onClick={() => copyText(currentSdk.installCmd, 'install')}
                      />
                    </div>
                    <div className="overflow-x-auto pr-8">
                      {currentSdk.installLines.map((lineEl, idx) => (
                        <div key={idx} className="flex items-start gap-4 whitespace-pre min-h-[21px]">
                          <span className="text-[#8a8a8a] select-none shrink-0">{idx + 1}</span>
                          <span className="text-[var(--text-primary)]">{lineEl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 h-[50px] flex items-center justify-between font-mono text-[14px]">
                    <div className="flex items-center gap-4 min-w-0 overflow-x-auto no-scrollbar">
                      <span className="text-[#8a8a8a] select-none shrink-0">1</span>
                      <span className="text-[var(--text-primary)] whitespace-nowrap">{currentSdk.installCmd}</span>
                    </div>
                    <CopyIconButton
                      copied={copiedId === 'install'}
                      onClick={() => copyText(currentSdk.installCmd, 'install')}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Create a new assistant */}
            <div>
              <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
                Create a new assistant
              </h3>
              <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5 leading-relaxed">
                To create an assistant, use the create assistant endpoint as in the following example:
              </p>

              <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 py-[14px] relative font-mono text-[14px] leading-[21px]">
                <div className="absolute top-3 right-3">
                  <CopyIconButton
                    copied={copiedId === 'create'}
                    onClick={() => copyText(currentSdk.createRaw(displayKey), 'create')}
                  />
                </div>
                <div className="overflow-x-auto pr-8">
                  {currentSdk.createLines(displayKey).map((lineEl, idx, arr) => (
                    <div key={idx} className="flex items-start gap-4 whitespace-pre min-h-[21px]">
                      <span className={`text-[#8a8a8a] select-none shrink-0 ${arr.length >= 10 ? 'w-4 text-right' : ''}`}>
                        {idx + 1}
                      </span>
                      <span className="text-[var(--text-primary)]">{lineEl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : connectMethod === 'n8n' ? (
          /* n8n Workflow Integration Snippet */
          <div>
            <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
              Connect n8n to Iceberg Assistant
            </h3>
            <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5 leading-relaxed">
              Add an HTTP Request node in your n8n workflow to create or chat with an Iceberg Assistant:
            </p>
            <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 py-[14px] relative font-mono text-[14px] leading-[21px]">
              <div className="absolute top-3 right-3">
                <CopyIconButton
                  copied={copiedId === 'n8n'}
                  onClick={() =>
                    copyText(
                      `{\n  "method": "POST",\n  "url": "https://api.icebergdb.in/assistant",\n  "headers": {\n    "X-API-Key": "${displayKey}",\n    "Content-Type": "application/json"\n  },\n  "body": {\n    "name": "example-assistant",\n    "instructions": "Answer in polite, short sentences. Use American English spelling and vocabulary."\n  }\n}`,
                      'n8n'
                    )
                  }
                />
              </div>
              <div className="overflow-x-auto pr-8">
                {[
                  <span key="1">{'{'}</span>,
                  <span key="2">{'  '}<span className="text-[#6bb6e4]">&quot;method&quot;</span>: <span className="text-[#8fcf6d]">&quot;POST&quot;</span>,</span>,
                  <span key="3">{'  '}<span className="text-[#6bb6e4]">&quot;url&quot;</span>: <span className="text-[#8fcf6d]">&quot;https://api.icebergdb.in/assistant&quot;</span>,</span>,
                  <span key="4">{'  '}<span className="text-[#6bb6e4]">&quot;headers&quot;</span>: {'{'}</span>,
                  <span key="5">{'    '}<span className="text-[#6bb6e4]">&quot;X-API-Key&quot;</span>: <span className="text-[#8fcf6d]">&quot;{displayKey}&quot;</span>,</span>,
                  <span key="6">{'    '}<span className="text-[#6bb6e4]">&quot;Content-Type&quot;</span>: <span className="text-[#8fcf6d]">&quot;application/json&quot;</span></span>,
                  <span key="7">{'  '}{'}'},</span>,
                  <span key="8">{'  '}<span className="text-[#6bb6e4]">&quot;body&quot;</span>: {'{'}</span>,
                  <span key="9">{'    '}<span className="text-[#6bb6e4]">&quot;name&quot;</span>: <span className="text-[#8fcf6d]">&quot;example-assistant&quot;</span>,</span>,
                  <span key="10">{'    '}<span className="text-[#6bb6e4]">&quot;instructions&quot;</span>: <span className="text-[#8fcf6d]">&quot;Answer in polite, short sentences. Use American English spelling and vocabulary.&quot;</span></span>,
                  <span key="11">{'  '}{'}'}</span>,
                  <span key="12">{'}'}</span>,
                ].map((lineEl, idx) => (
                  <div key={idx} className="flex items-start gap-4 whitespace-pre min-h-[21px]">
                    <span className="text-[#8a8a8a] select-none shrink-0 w-4 text-right">{idx + 1}</span>
                    <span className="text-[var(--text-primary)]">{lineEl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MCP / Agent Connect Snippet */
          <div>
            <h3 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
              Connect {currentMethod.label} to Iceberg MCP
            </h3>
            <p className="text-[14.5px] text-[var(--text-primary)] mt-1.5 leading-relaxed">
              Add the Iceberg MCP server to your agent configuration to create and query assistants directly:
            </p>
            <div className="mt-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--bg-surface2)] px-4 h-[50px] flex items-center justify-between font-mono text-[14px]">
              <div className="flex items-center gap-4 min-w-0 overflow-x-auto no-scrollbar">
                <span className="text-[#8a8a8a] select-none shrink-0">1</span>
                <span className="text-[var(--text-primary)] whitespace-nowrap">
                  npx -y iceberg-mcp-server --api-key {displayKey}
                </span>
              </div>
              <CopyIconButton
                copied={copiedId === 'mcp'}
                onClick={() => copyText(`npx -y iceberg-mcp-server --api-key ${displayKey}`, 'mcp')}
              />
            </div>
          </div>
        )}

        {/* Bottom Documentation Line (Exact Match to Pinecone Screenshots 2 & 3) */}
        <p className="text-[14.5px] text-[var(--text-primary)] leading-relaxed pt-1">
          Now you&apos;re ready to start using Iceberg Assistant. Head to our{' '}
          <Link to="/docs" className="text-[var(--accent)] hover:underline">
            documentation
          </Link>{' '}
          for detailed information and examples.
        </p>
      </div>
    </div>
  )
}
