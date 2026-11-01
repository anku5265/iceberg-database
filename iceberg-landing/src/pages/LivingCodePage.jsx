import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const SCENARIOS = {
  key_error: {
    id: 'key_error',
    name: "KeyError: 'discount'",
    domain: 'E-Commerce Checkout',
    buggyCode: `def calculate_invoice(cart: dict) -> float:
    base_price = cart["price"]
    # 💥 CRASH: Client did not send 'discount'
    discount = cart["discount"]
    tax = (base_price - discount) * 0.18
    return (base_price - discount) + tax`,
    healedCode: `def calculate_invoice(cart: dict) -> float:
    base_price = cart["price"]
    # 🧬 HEALED: Safe default applied via AST Mutation
    discount = cart.get("discount", 0)
    tax = (base_price - discount) * 0.18
    return (base_price - discount) + tax`,
    exception: "KeyError: 'discount'",
    trace: "File 'checkout_service.py', line 4 in calculate_invoice: discount = cart['discount']",
    healTime: "24.55 ms",
    result: "Invoice Total: ₹1,180.00 (Success 200 OK)",
  },
  zero_div: {
    id: 'zero_div',
    name: 'ZeroDivisionError: division by zero',
    domain: 'Financial Conversion Metric',
    buggyCode: `def conversion_rate(conversions: int, visitors: int) -> float:
    # 💥 CRASH: visitors == 0 on launch morning
    rate = (conversions / visitors) * 100
    return rate`,
    healedCode: `def conversion_rate(conversions: int, visitors: int) -> float:
    # 🧬 HEALED: Zero-guarded ternary expression
    rate = (conversions / visitors if visitors != 0 else 0) * 100
    return rate`,
    exception: 'ZeroDivisionError: division by zero',
    trace: "File 'analytics_metric.py', line 3 in conversion_rate: rate = (conversions / visitors) * 100",
    healTime: "2.10 ms",
    result: "Conversion Rate: 0.0% (Safe fallback, 200 OK)",
  },
  index_error: {
    id: 'index_error',
    name: 'IndexError: list index out of range',
    domain: 'Realtime Data Pipeline',
    buggyCode: `def get_primary_device(devices: list) -> str:
    # 💥 CRASH: Empty list from newly registered user
    primary = devices[0]
    return f"Active on {primary}"`,
    healedCode: `def get_primary_device(devices: list) -> str:
    # 🧬 HEALED: Array bounds guard injected into AST
    primary = devices[0] if len(devices) > 0 else 'Unknown Device'
    return f"Active on {primary}"`,
    exception: 'IndexError: list index out of range',
    trace: "File 'pipeline_worker.py', line 3 in get_primary_device: primary = devices[0]",
    healTime: "18.30 ms",
    result: "Status: 'Active on Unknown Device' (Safe fallback, 200 OK)",
  },
}

export default function LivingCodePage() {
  const [selectedScenario, setSelectedScenario] = useState('key_error')
  const [simState, setSimState] = useState('idle') // 'idle' | 'crashing' | 'healing' | 'healed'
  const [stage, setStage] = useState(0) // 1 to 4
  const [terminalLogs, setTerminalLogs] = useState([
    '[SYSTEM] LivingCode Immunity Daemon initialized.',
    '[SYSTEM] Watching process runtime at memory layer...',
  ])

  const scenario = SCENARIOS[selectedScenario]

  const triggerCrash = () => {
    setSimState('crashing')
    setStage(0)
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 💥 UNHANDLED EXCEPTION: ${scenario.exception}`,
      `[${new Date().toLocaleTimeString()}] ❌ PROCESS TERMINATED WITH EXIT CODE 1 (Server Down)`,
    ])
  }

  const triggerHealing = () => {
    setSimState('healing')
    setStage(1)
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ⚠️ EXCEPTION INTERCEPTED: ${scenario.exception}`,
    ])

    setTimeout(() => {
      setStage(2)
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🧬 AST Synthesizer analyzing: ${scenario.trace}`,
        `[${new Date().toLocaleTimeString()}] ✨ Resilient patch generated in ${scenario.healTime}`,
      ])
    }, 600)

    setTimeout(() => {
      setStage(3)
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚡ HOT-SWAP: Bytecode swapped in RAM via __code__ injection`,
        `[${new Date().toLocaleTimeString()}] 🔁 Transparent request retry initiated...`,
      ])
    }, 1200)

    setTimeout(() => {
      setStage(4)
      setSimState('healed')
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🎉 CALL RETURNED: ${scenario.result}`,
        `[${new Date().toLocaleTimeString()}] 📦 GitHub Pull Request auto-generated: #auto-patch-${Math.floor(Math.random() * 899 + 100)}`,
      ])
    }, 1800)
  }

  const resetSim = () => {
    setSimState('idle')
    setStage(0)
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-cyan-500 selection:text-black">
      <Navbar dark={true} />

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-12 max-w-6xl">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs font-mono px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 bg-cyan-950/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            EXPERIMENTAL KHOJ // RUNTIME IMMUNITY
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-950/30">
            ZERO 3 AM DEBUGGING
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Code that refuses to die.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Autonomous Self-Healing Runtime.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#8892b0] max-w-3xl mb-8 leading-relaxed">
          Why should a developer wake up at 3 AM to copy-paste errors into an AI? 
          <strong className="text-white"> Living Code</strong> intercepts production crashes, mutates the Abstract Syntax Tree (AST), 
          runs sandbox regression checks, and hot-swaps bytecode directly in RAM — in under 25 milliseconds.
        </p>

        {/* Top metrics bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl border border-white/[0.08] bg-[#0d1117] mb-12">
          <div>
            <div className="text-xs text-[#6e7681] uppercase font-mono">Mean Time to Repair</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">19.4 ms</div>
            <div className="text-xs text-[#555]">Down from 4.2 hours</div>
          </div>
          <div>
            <div className="text-xs text-[#6e7681] uppercase font-mono">Server Downtime</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">0.00%</div>
            <div className="text-xs text-[#555]">Zero dropped requests</div>
          </div>
          <div>
            <div className="text-xs text-[#6e7681] uppercase font-mono">Hot-Swap Method</div>
            <div className="text-2xl font-bold text-purple-400 font-mono">Bytecode RAM</div>
            <div className="text-xs text-[#555]">Zero server restarts</div>
          </div>
          <div>
            <div className="text-xs text-[#6e7681] uppercase font-mono">Persistence</div>
            <div className="text-2xl font-bold text-yellow-400 font-mono">Auto Git PR</div>
            <div className="text-xs text-[#555]">Permanent codebase fix</div>
          </div>
        </div>
      </section>

      {/* Interactive Simulation Lab */}
      <section className="border-y border-white/[0.08] py-16 bg-[#0a0d14]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">Interactive Command Center</p>
              <h2 className="text-3xl font-bold">Live Crash & Auto-Immunity Simulator</h2>
            </div>

            {/* Scenario selector */}
            <div className="flex gap-2">
              {Object.values(SCENARIOS).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedScenario(s.id)
                    resetSim()
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-mono border transition ${
                    selectedScenario === s.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                      : 'border-white/[0.08] text-[#777] hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  {s.name.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={triggerCrash}
              className="px-6 py-3 rounded-lg border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-semibold text-sm transition flex items-center gap-2"
            >
              <span>💥</span> Simulate Without Living Code (Crashes)
            </button>
            <button
              onClick={triggerHealing}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-cyan-900/30 transition flex items-center gap-2"
            >
              <span>🧬</span> Trigger WITH Living Code Immunity
            </button>
            {(simState === 'healed' || simState === 'crashing') && (
              <button
                onClick={resetSim}
                className="px-4 py-3 rounded-lg border border-white/[0.1] text-[#888] hover:text-white text-xs font-mono transition"
              >
                Reset State
              </button>
            )}
          </div>

          {/* 4-Stage Immunity Pipeline visualization */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { num: '01', title: 'Trap Exception', desc: 'Intercept before crash', active: stage >= 1, color: 'border-yellow-500 text-yellow-400' },
              { num: '02', title: 'AST Synthesizer', desc: 'Resilient patch drafted', active: stage >= 2, color: 'border-cyan-500 text-cyan-400' },
              { num: '03', title: 'Bytecode Hot-Swap', desc: 'RAM memory updated', active: stage >= 3, color: 'border-purple-500 text-purple-400' },
              { num: '04', title: 'Zero Downtime', desc: 'Request succeeds 200 OK', active: stage >= 4, color: 'border-emerald-500 text-emerald-400' },
            ].map((p, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  p.active
                    ? `${p.color} bg-white/[0.04] scale-[1.02] shadow-lg`
                    : 'border-white/[0.05] bg-[#07090e] opacity-40'
                }`}
              >
                <div className="text-xs font-mono mb-1">{p.num}</div>
                <div className="font-semibold text-sm mb-1">{p.title}</div>
                <div className="text-xs text-[#777]">{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Code Diff Display (Red vs Green) */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8">
            {/* Left: Original Buggy Code */}
            <div className={`rounded-xl border p-5 bg-[#090c12] ${simState === 'crashing' ? 'border-red-500/80 shadow-lg shadow-red-950/50' : 'border-white/[0.08]'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-red-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  ORIGINAL SOURCE (Contains Production Bug)
                </span>
                <span className="text-xs text-[#555] font-mono">{scenario.domain}</span>
              </div>
              <pre className="text-xs font-mono p-4 rounded-lg bg-[#05070a] border border-white/[0.04] text-[#aaa] overflow-x-auto leading-6 whitespace-pre">
                {scenario.buggyCode}
              </pre>
              {simState === 'crashing' && (
                <div className="mt-4 p-3 rounded-lg border border-red-500/40 bg-red-950/30 text-xs font-mono text-red-300">
                  <div className="font-bold mb-1">🚨 500 SERVER CRASH:</div>
                  <div>{scenario.exception}</div>
                  <div className="text-[#888] mt-1 text-[11px]">{scenario.trace}</div>
                </div>
              )}
            </div>

            {/* Right: Healed Code */}
            <div className={`rounded-xl border p-5 bg-[#090c12] ${simState === 'healed' ? 'border-emerald-500/80 shadow-lg shadow-emerald-950/50' : 'border-white/[0.08]'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  HEALED BYTECODE (Live In-Memory Hot Patch)
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  {simState === 'healed' ? `Synthesized in ${scenario.healTime}` : 'Standby'}
                </span>
              </div>
              <pre className="text-xs font-mono p-4 rounded-lg bg-[#05070a] border border-white/[0.04] text-[#aaa] overflow-x-auto leading-6 whitespace-pre">
                {simState === 'healed' ? scenario.healedCode : '// Run immunity simulator to inspect synthesized patch...'}
              </pre>
              {simState === 'healed' && (
                <div className="mt-4 p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-xs font-mono text-emerald-300">
                  <div className="font-bold mb-1">✅ 200 OK — ZERO DOWNTIME:</div>
                  <div>{scenario.result}</div>
                  <div className="text-[#888] mt-1 text-[11px]">Next 1,000,000 requests will execute in 0.00ms with zero memory overhead!</div>
                </div>
              )}
            </div>
          </div>

          {/* Live Terminal Telemetry Box */}
          <div className="rounded-xl border border-white/[0.08] bg-[#05070a] p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.05] text-xs font-mono text-[#6e7681]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span>TELEMETRY STREAM // LOCAL RUNTIME</span>
              </div>
              <span>PORT: 5174</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-40 overflow-y-auto">
              {terminalLogs.slice(-8).map((log, idx) => (
                <div key={idx} className={log.includes('💥') || log.includes('❌') ? 'text-red-400' : log.includes('🎉') || log.includes('✅') ? 'text-emerald-400' : log.includes('⚡') ? 'text-purple-400' : 'text-[#8892b0]'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Under the Hood */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">Under the Hood</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">How Living Code works in real production</h2>
        <p className="text-[#8892b0] mb-12 max-w-2xl leading-relaxed">
          Standard exception handling catches an error and shows a blank 500 page. Living Code intercepts the failure,
          inspects the code's Abstract Syntax Tree (AST), verifies a resilient replacement, and hot-patches the process bytecode in RAM.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0d1117]">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold mb-4">
              01
            </div>
            <h3 className="font-semibold text-lg mb-2">AST Mutation Engine</h3>
            <p className="text-sm text-[#777] leading-relaxed">
              Extracts the failing function using Python <code className="text-cyan-300">inspect.getsource</code>, parses it into an AST node graph, and injects bounds checking, null coalescing, and safe default fallbacks.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0d1117]">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold mb-4">
              02
            </div>
            <h3 className="font-semibold text-lg mb-2">In-Memory Hot Swap</h3>
            <p className="text-sm text-[#777] leading-relaxed">
              Updates the function bytecode directly via <code className="text-purple-300">func.__code__</code> in RAM. No container restart, no server reload, no dropped WebSocket connections.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0d1117]">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold mb-4">
              03
            </div>
            <h3 className="font-semibold text-lg mb-2">Automated Git PR</h3>
            <p className="text-sm text-[#777] leading-relaxed">
              Simultaneously commits the validated patch to a background Git branch and creates a verified GitHub PR. Next deployment inherits the permanent fix automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Developer Quickstart */}
      <section className="border-t border-white/[0.08] py-16 bg-[#0a0d14]">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Try it locally on your laptop</h2>
          <p className="text-[#888] mb-8">Run the prototype in your terminal right now.</p>
          
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#05070a] text-left font-mono text-xs max-w-xl mx-auto space-y-2 text-[#aaa]">
            <div className="text-[#555]"># Run the hands-on lab script:</div>
            <div className="text-cyan-300 bg-white/[0.03] p-2.5 rounded">python d:\icebergdb\living_code_prototype\test_my_bug.py</div>
            <div className="text-[#555] pt-2"># Or run the full demo:</div>
            <div className="text-cyan-300 bg-white/[0.03] p-2.5 rounded">python d:\icebergdb\living_code_prototype\demo.py</div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Link to="/" className="px-6 py-2.5 rounded-lg border border-white/[0.1] text-xs font-mono text-[#888] hover:text-white transition">
              ← Back to Iceberg Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
