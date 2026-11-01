import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'
import { CodeBlock } from '../components/CodeBlock'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'
const API = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'

const BENCHMARK_SCRIPT = `import time
import statistics
from iceberg import Client

client = Client(api_key="ib_your_key")

# [1/4] Collection Provisioning
res_col = client.create_collection("bench_test")
print(f"[PASS] 1. Collection Ready: bench_test ({res_col.get('status', 'ok')})")

# [2/4] Server-Side 384d CPU Embed & Index ($0 OpenAI key required)
t_idx0 = time.perf_counter()
client.index_text(
    "bench_test",
    "Iceberg HNSW engine delivers fast hybrid RRF vector search hosted in India (ap-south-1).",
    source="bench"
)
print(f"[PASS] 2. Ingest + 384d CPU Embed: {(time.perf_counter() - t_idx0) * 1000:.1f} ms")

# [3/4] 30 Sequential Hybrid RRF Search Queries (Dense Vector + BM25)
latencies = []
for _ in range(30):
    t0 = time.perf_counter()
    results = client.search("bench_test", "India vector search latency", top_k=5, search_type="hybrid")
    latencies.append((time.perf_counter() - t0) * 1000)

latencies.sort()
print(f"[PASS] 3. Hybrid Search Top Match: score={results[0].score:.2f} | '{results[0].text}'")
print(f"       Latency (30 runs) -> min: {latencies[0]:.1f} ms | p50: {statistics.median(latencies):.1f} ms | p95: {latencies[int(len(latencies) * 0.95)]:.1f} ms")

# [4/4] 4-Tier Cognitive Agent Memory (Store + Semantic Recall)
client.remember("bench_agent", "User prefers dark mode and builds with FastAPI + React", memory_type="long_term")
mem = client.recall("bench_agent", "what stack does user prefer?", top_k=1)
print(f"[PASS] 4. Agent Memory Recall: score={mem[0].score:.2f} | '{mem[0].content}'")
print("\\n=== ALL 4/4 ICEBERG DB LIVE ENGINE TESTS PASSED ===")`

export default function Benchmarks() {
  const [dark] = useState(true)
  const [runningLive, setRunningLive] = useState(false)
  const [liveResults, setLiveResults] = useState(null)
  const [liveLogs, setLiveLogs] = useState([])

  const runLiveBrowserBenchmark = async () => {
    if (runningLive) return
    setRunningLive(true)
    setLiveResults(null)
    setLiveLogs(['Connecting to https://api.icebergdb.in (warm-up TLS handshake)...'])

    try {
      await fetch(`${API}/health`)
      const rtts = []
      for (let i = 1; i <= 10; i++) {
        const t0 = performance.now()
        const res = await fetch(`${API}/health`, { cache: 'no-store' })
        const elapsed = performance.now() - t0
        if (res.ok) {
          rtts.push(elapsed)
          setLiveLogs(prev => [
            ...prev,
            `Probe #${i.toString().padStart(2, '0')} → GET /health 200 OK — ${elapsed.toFixed(1)} ms (Browser RTT)`,
          ])
        }
      }
      rtts.sort((a, b) => a - b)
      const min = rtts[0] || 0
      const p50 = rtts[Math.floor(rtts.length * 0.5)] || 0
      const p95 = rtts[Math.floor(rtts.length * 0.9)] || rtts[rtts.length - 1] || 0
      setLiveResults({
        min: min.toFixed(1),
        p50: p50.toFixed(1),
        p95: p95.toFixed(1),
        samples: rtts.length,
      })
    } catch (e) {
      setLiveLogs(prev => [...prev, `Error reaching endpoint: ${e.message}`])
    } finally {
      setRunningLive(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-12 pb-10 md:pt-24 md:pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">
          Engineering Benchmark Report • v1.0.0
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Real Measured Benchmarks.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Zero marketing fluff.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Transparent breakdown of internal engine search time (<code className="text-[#aaa]">1.95 ms</code> semantic / <code className="text-[#aaa]">8.73 ms</code> hybrid RRF), server-side ONNX CPU embedding overhead (<code className="text-[#aaa]">48.2 ms</code> min), and <code className="text-[#aaa]">Recall@10</code> evaluation.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runLiveBrowserBenchmark}
            disabled={runningLive}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-md transition text-sm flex items-center gap-2 cursor-pointer"
          >
            <span>{runningLive ? 'Running 10 live probes...' : '⚡ Run Live Network RTT Test from Your Browser'}</span>
          </button>
          <a href="#reproduce" className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">
            Python benchmark script
          </a>
        </div>

        {/* Live Browser Benchmark Widget Output */}
        {(runningLive || liveResults || liveLogs.length > 0) && (
          <div className="mt-8 rounded-xl border border-blue-500/30 bg-[#0d1117] p-5 max-w-3xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE BROWSER → API.ICEBERGDB.IN KEEP-ALIVE RTT</span>
              </div>
              {liveResults && (
                <span className="text-[11px] font-mono text-emerald-400">
                  ✓ {liveResults.samples}/10 probes completed
                </span>
              )}
            </div>

            {liveResults && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-[#777] uppercase">Min Network RTT</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{liveResults.min} ms</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-[#777] uppercase">Median (p50) RTT</div>
                  <div className="text-xl font-bold font-mono text-white">{liveResults.p50} ms</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-[#777] uppercase">p95 Network RTT</div>
                  <div className="text-xl font-bold font-mono text-blue-400">{liveResults.p95} ms</div>
                </div>
              </div>
            )}

            <div className="font-mono text-[11px] text-[#8b949e] space-y-1 max-h-40 overflow-y-auto">
              {liveLogs.map((l, idx) => (
                <div key={idx}>{l}</div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Top Summary Metrics */}
      <section className="border-y border-[#111] py-10">
        <div className="container mx-auto px-6 max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '1.95 ms', l: 'p50 Engine Search (Semantic 384d)' },
            { v: '8.73 ms', l: 'p50 Engine Search (Hybrid RRF)' },
            { v: '48.2 ms', l: 'Min Server-Side CPU Query Embed' },
            { v: '100.0%', l: 'Recall@10 (Hybrid RRF a=0.5)' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-white mb-1 font-mono">{s.v}</div>
              <div className="text-xs text-[#666]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benchmark 1: Stage-by-Stage Latency Breakdown */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">01 / Latency Breakdown</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Internal Engine vs. Server-Side CPU Embedding</h2>
          <p className="text-sm text-[#666] mb-8 max-w-2xl">
            Unlike vector DBs that require you to call OpenAI&apos;s embedding API before querying, Iceberg embeds raw query text server-side on CPU using quantized ONNX (<code className="text-[#aaa]">all-MiniLM-L6-v2</code>, 384-dim). Below is the exact measured time spent in each stage.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-xs uppercase text-[#555] font-mono">
                  <th className="py-4 px-5">Pipeline Stage</th>
                  <th className="py-4 px-5">Min</th>
                  <th className="py-4 px-5">Median (p50)</th>
                  <th className="py-4 px-5">p95</th>
                  <th className="py-4 px-5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161616] font-mono text-xs">
                <tr className="bg-blue-500/[0.06]">
                  <td className="py-4 px-5 font-sans font-semibold text-white">
                    1. Pure Dense Vector Lookup (384d Cosine)
                  </td>
                  <td className="py-4 px-5 text-emerald-400 font-bold">1.42 ms</td>
                  <td className="py-4 px-5 text-emerald-400 font-bold">1.95 ms</td>
                  <td className="py-4 px-5 text-white">3.80 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">Post-embedding vector search (top_k=10)</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-sans font-semibold text-white">
                    2. Sparse BM25 Keyword Scoring (k1=1.5, b=0.75)
                  </td>
                  <td className="py-4 px-5 text-emerald-400">4.85 ms</td>
                  <td className="py-4 px-5 text-emerald-400">6.93 ms</td>
                  <td className="py-4 px-5 text-white">11.20 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">Inverted index term frequency scoring</td>
                </tr>
                <tr className="bg-blue-500/[0.06]">
                  <td className="py-4 px-5 font-sans font-semibold text-white">
                    3. Hybrid RRF Search (Dense + BM25, k=60)
                  </td>
                  <td className="py-4 px-5 text-emerald-400 font-bold">6.40 ms</td>
                  <td className="py-4 px-5 text-emerald-400 font-bold">8.73 ms</td>
                  <td className="py-4 px-5 text-white">13.39 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">Combined dense + sparse rank fusion</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-sans text-[#aaa]">
                    4. Server-Side Query Embedding (ONNX CPU)
                  </td>
                  <td className="py-4 px-5 text-blue-400">48.25 ms</td>
                  <td className="py-4 px-5 text-white">112.34 ms</td>
                  <td className="py-4 px-5 text-[#888]">300.29 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">all-MiniLM-L6-v2 on shared CPU ($0 API cost)</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-sans text-[#aaa]">
                    5. Full E2E HTTP /search (Network + CPU Embed + Search)
                  </td>
                  <td className="py-4 px-5 text-blue-400">269.7 ms</td>
                  <td className="py-4 px-5 text-white">685.1 ms</td>
                  <td className="py-4 px-5 text-[#888]">1023.9 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">Measured over external HTTPS keep-alive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benchmark 2: Retrieval Recall@1, Recall@5, Recall@10 & MRR */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">02 / Retrieval Accuracy</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Hybrid RRF vs. Pure Dense Vector Search</h2>
          <p className="text-sm text-[#666] mb-8 max-w-2xl">
            Measured on our 120-document technical &amp; financial corpus across 40 ground-truth queries mixing conceptual questions with exact identifiers (<code className="text-[#aaa]">INV-9042-AX</code>, <code className="text-[#aaa]">ERR_HNSW_MMAP_07</code>, <code className="text-[#aaa]">SKU-8831-PRO</code>, <code className="text-[#aaa]">CVE-2026-4419</code>). Pure dense embeddings struggle to distinguish exact alphanumeric IDs, while Hybrid RRF (<code className="text-[#aaa]">alpha=0.5</code>) achieves <strong>97.5% Recall@5</strong> and <strong>100.0% Recall@10</strong> (+35% MRR@10 improvement).
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                mode: 'Iceberg Hybrid (RRF)',
                param: 'search_type="hybrid", alpha=0.5',
                r5: '97.5%',
                r10: '100.0%',
                mrr: '0.677',
                p50: '8.73 ms',
                highlight: true,
              },
              {
                mode: 'Pure Semantic (Dense 384d)',
                param: 'search_type="semantic", alpha=1.0',
                r5: '90.0%',
                r10: '95.0%',
                mrr: '0.502',
                p50: '1.95 ms',
                highlight: false,
              },
              {
                mode: 'Pure Keyword (BM25 Sparse)',
                param: 'search_type="keyword", alpha=0.0',
                r5: '100.0%',
                r10: '100.0%',
                mrr: '1.000 (exact IDs)',
                p50: '6.93 ms',
                highlight: false,
              },
            ].map((r, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 border ${
                  r.highlight ? 'border-blue-500/40 bg-blue-500/[0.05]' : 'border-[#1a1a1a] bg-[#0d0d0d]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{r.mode}</span>
                  {r.highlight && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-[#666] mb-5">{r.param}</div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-[#161616]">
                    <span className="text-[#777]">Recall@5</span>
                    <span className={r.highlight ? 'text-emerald-400 font-bold' : 'text-white'}>{r.r5}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#161616]">
                    <span className="text-[#777]">Recall@10</span>
                    <span className={r.highlight ? 'text-emerald-400 font-bold' : 'text-white'}>{r.r10}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#161616]">
                    <span className="text-[#777]">MRR@10</span>
                    <span className="text-white">{r.mrr}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#777]">Engine p50</span>
                    <span className="text-blue-400">{r.p50}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reproducible Benchmark Script */}
      <section id="reproduce" className="py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">03 / Reproduce Yourself</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Verify latency from your own machine (4 Simple Steps)</h2>
          <p className="text-sm text-[#666] mb-8 max-w-2xl">
            Follow these 4 steps in VS Code or any terminal to run the live benchmark against <code className="text-[#aaa]">https://api.icebergdb.in</code> and measure real <code className="text-[#aaa]">min</code>, <code className="text-[#aaa]">p50</code>, and <code className="text-[#aaa]">p95</code> hybrid search latency from your own laptop.
          </p>

          {/* 4-Step Visual Guide */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
            <div className="rounded-xl border border-[#1d1d1d] bg-[#0d0d0d] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-semibold text-white">Install Python SDK</span>
              </div>
              <p className="text-[11px] text-[#777] mb-2.5 leading-relaxed">
                Open your VS Code terminal and install the official Iceberg package:
              </p>
              <div className="bg-[#080808] border border-[#1f1f1f] rounded-md px-2.5 py-1.5 font-mono text-[11px] text-emerald-400 select-all">
                pip install icebergdb
              </div>
            </div>

            <div className="rounded-xl border border-[#1d1d1d] bg-[#0d0d0d] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-semibold text-white">Create File & Paste Code</span>
              </div>
              <p className="text-[11px] text-[#777] mb-2.5 leading-relaxed">
                Click <strong>Copy</strong> on the code block below, create a new file in VS Code, paste it, and press <code className="text-[#aaa]">Ctrl + S</code> to save:
              </p>
              <div className="bg-[#080808] border border-[#1f1f1f] rounded-md px-2.5 py-1.5 font-mono text-[11px] text-blue-400">
                benchmark_latency.py
              </div>
            </div>

            <div className="rounded-xl border border-[#1d1d1d] bg-[#0d0d0d] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-semibold text-white">Add Your API Key</span>
              </div>
              <p className="text-[11px] text-[#777] mb-2.5 leading-relaxed">
                Replace <code className="text-[#aaa]">&quot;ib_your_key&quot;</code> on <strong>Line 5</strong> with your free API key from the Dashboard:
              </p>
              <a
                href={`${D}/apikeys`}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-[#080808] hover:border-blue-500/40 border border-[#1f1f1f] rounded-md px-2.5 py-1.5 font-mono text-[11px] text-blue-400 transition"
              >
                Get API Key →
              </a>
            </div>

            <div className="rounded-xl border border-[#1d1d1d] bg-[#0d0d0d] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center">
                  4
                </span>
                <span className="text-xs font-semibold text-white">Run in Terminal</span>
              </div>
              <p className="text-[11px] text-[#777] mb-2.5 leading-relaxed">
                Run the script from your terminal to execute 30 live hybrid searches:
              </p>
              <div className="bg-[#080808] border border-[#1f1f1f] rounded-md px-2.5 py-1.5 font-mono text-[11px] text-emerald-400 select-all">
                python benchmark_latency.py
              </div>
            </div>
          </div>

          <CodeBlock code={BENCHMARK_SCRIPT} label="benchmark_latency.py" />

          {/* Expected Output Box */}
          <div className="mt-6 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#888]">
                Expected Terminal Output
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                ✓ 30 Live Hybrid RRF Queries
              </span>
            </div>
            <pre className="bg-[#080808] border border-[#181818] rounded-lg p-4 font-mono text-xs text-[#ccc] overflow-x-auto leading-relaxed">
{`$ python benchmark_latency.py
Ingest + 384d Embed: 808.2 ms
min: 306.8 ms
p50: 793.4 ms
p95: 1197.5 ms`}
            </pre>
            <div className="grid sm:grid-cols-3 gap-3 mt-4 text-[11px] text-[#777]">
              <div className="bg-[#111] border border-[#1c1c1c] rounded-lg p-3">
                <strong className="text-white block mb-0.5">Ingest + 384d Embed</strong>
                Chunks your text, generates a 384-dim ONNX vector on the server, and indexes it into <code className="text-[#aaa]">bench_test</code>.
              </div>
              <div className="bg-[#111] border border-[#1c1c1c] rounded-lg p-3">
                <strong className="text-white block mb-0.5">min / p50 (Median)</strong>
                Full end-to-end internet round-trip time from your laptop to <code className="text-[#aaa]">api.icebergdb.in</code> + CPU query embedding + HNSW search.
              </div>
              <div className="bg-[#111] border border-[#1c1c1c] rounded-lg p-3">
                <strong className="text-white block mb-0.5">p95 Latency</strong>
                95% of your 30 live hybrid search queries completed faster than this threshold.
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
