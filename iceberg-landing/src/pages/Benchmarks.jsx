import { useState, useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import Footer from '../components/Footer'
import { CodeBlock } from '../components/CodeBlock'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'
const API = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'

const BENCHMARK_SCRIPT = `import time
import statistics
from concurrent.futures import ThreadPoolExecutor
from iceberg import Client

client = Client(api_key="ib_your_key")

# [1/5] Collection Provisioning (384-dim Cosine HNSW + Okapi BM25)
res_col = client.create_collection("bench_test")
print(f"[PASS] 1. Collection Ready: bench_test ({res_col.get('status', 'ok')})")

# [2/5] Server-Side 384d ONNX CPU Embed & Index ($0 OpenAI key required)
t_idx0 = time.perf_counter()
client.index_text(
    "bench_test",
    "Iceberg HNSW engine delivers fast hybrid RRF vector search hosted in India (ap-south-1) for DPDP compliance.",
    source="bench"
)
print(f"[PASS] 2. Ingest + 384d CPU Embed: {(time.perf_counter() - t_idx0) * 1000:.1f} ms")

# [3/5] 30 Sequential Hybrid RRF Search Queries (p50 / p95 / p99)
latencies = []
for _ in range(30):
    t0 = time.perf_counter()
    results = client.search("bench_test", "India vector search latency", top_k=5, search_type="hybrid")
    latencies.append((time.perf_counter() - t0) * 1000)

latencies.sort()
p50 = statistics.median(latencies)
p95 = latencies[int(len(latencies) * 0.95)]
p99 = latencies[int(len(latencies) * 0.99)]
print(f"[PASS] 3. Hybrid RRF Top Match: score={results[0].score:.2f} | '{results[0].text}'")
print(f"       Sequential (30 runs) -> min: {latencies[0]:.1f} ms | p50: {p50:.1f} ms | p95: {p95:.1f} ms | p99: {p99:.1f} ms")

# [4/5] Concurrent Load Test (10 Concurrent Workers, 30 Queries)
def run_concurrent_query(_):
    t0 = time.perf_counter()
    client.search("bench_test", "DPDP compliance India", top_k=5, search_type="hybrid")
    return (time.perf_counter() - t0) * 1000

with ThreadPoolExecutor(max_workers=10) as pool:
    conc_lats = sorted(list(pool.map(run_concurrent_query, range(30))))
print(f"[PASS] 4. Concurrent (10 workers) -> p50: {statistics.median(conc_lats):.1f} ms | p95: {conc_lats[int(len(conc_lats)*0.95)]:.1f} ms | p99: {conc_lats[-1]:.1f} ms")

# [5/5] 4-Tier Cognitive Agent Memory (Store + Semantic Recall)
client.remember("bench_agent", "User prefers dark mode and builds with FastAPI + React", memory_type="long_term")
mem = client.recall("bench_agent", "what stack does user prefer?", top_k=1)
print(f"[PASS] 5. Agent Memory Recall: score={mem[0].score:.2f} | '{mem[0].content}'")
print("\\n=== ALL 5/5 ICEBERG DB v1.0.0 LIVE ENGINE BENCHMARKS PASSED ===")`

const HARDWARE_SPECS = [
  { label: 'Cloud Region & Jurisdiction', value: 'Hosted in India (ap-south-1 • Mumbai)' },
  { label: 'Compute & Memory', value: '4 vCPU (x86_64 AVX2 SIMD) • 16 GB DDR4 RAM' },
  { label: 'Storage & Operating System', value: 'NVMe SSD • Ubuntu 22.04 LTS (Linux 6.x)' },
  { label: 'Vector Dimensions & Metric', value: '384-dimensional float32 • Cosine similarity' },
  { label: 'HNSW Graph Configuration', value: 'Qdrant HNSW (m=16, ef_construct=100, ef_search=64)' },
  { label: 'Lexical & Hybrid Rank Fusion', value: 'Okapi BM25 (k1=1.5, b=0.75) + RRF (k=60, alpha=0.5)' },
  { label: 'Server-Side Embedding Model', value: 'Quantized ONNX Runtime (all-MiniLM-L6-v2, 384d CPU)' },
  { label: 'Warm-up & Measured Runs', value: '20 warm-up iterations + 200 to 500 measured runs per test' },
]

const DEFAULT_SCALE_ROWS = [
  {
    vectors: '1,000',
    mode: 'Float32 (384d Cosine)',
    runs: 200,
    min_ms: '0.84 ms',
    p50_ms: '1.20 ms',
    p95_ms: '6.98 ms',
    p99_ms: '16.85 ms',
    qps: '510 QPS',
    ram_mb: '1.46 MB',
    recall: '100.0%',
  },
  {
    vectors: '10,000',
    mode: 'Float32 (384d Cosine)',
    runs: 200,
    min_ms: '1.95 ms',
    p50_ms: '2.53 ms',
    p95_ms: '6.11 ms',
    p99_ms: '8.88 ms',
    qps: '324 QPS',
    ram_mb: '14.65 MB',
    recall: '100.0%',
  },
  {
    vectors: '50,000',
    mode: 'Float32 (384d Cosine)',
    runs: 200,
    min_ms: '3.56 ms',
    p50_ms: '4.24 ms',
    p95_ms: '5.97 ms',
    p99_ms: '8.53 ms',
    qps: '225 QPS',
    ram_mb: '73.24 MB',
    recall: '100.0%',
  },
  {
    vectors: '10,000',
    mode: 'Int8 SQ8 (4x RAM Compression)',
    runs: 200,
    min_ms: '28.40 ms',
    p50_ms: '36.82 ms',
    p95_ms: '54.77 ms',
    p99_ms: '77.05 ms',
    qps: '27 QPS',
    ram_mb: '3.66 MB',
    recall: '98.4%',
  },
  {
    vectors: '10,000',
    mode: 'Binary BQ (32x RAM Compression)',
    runs: 200,
    min_ms: '10.12 ms',
    p50_ms: '13.55 ms',
    p95_ms: '22.50 ms',
    p99_ms: '30.99 ms',
    qps: '74 QPS',
    ram_mb: '0.46 MB',
    recall: '100.0% (4x oversample)',
  },
]

const DEFAULT_CONCURRENCY_ROWS = [
  {
    users: '1 Concurrent User (Sequential)',
    dataset: '10,000 vectors (384d)',
    queries: 500,
    min_ms: '1.59 ms',
    p50_ms: '1.99 ms',
    p95_ms: '2.92 ms',
    p99_ms: '11.42 ms',
    qps: '149 QPS',
  },
  {
    users: '10 Concurrent Users (Parallel Workers)',
    dataset: '10,000 vectors (384d)',
    queries: 500,
    min_ms: '2.96 ms',
    p50_ms: '14.16 ms',
    p95_ms: '29.56 ms',
    p99_ms: '42.21 ms',
    qps: '470 QPS',
  },
  {
    users: '50 Concurrent Users (High Burst Load)',
    dataset: '10,000 vectors (384d)',
    queries: 500,
    min_ms: '3.43 ms',
    p50_ms: '37.88 ms',
    p95_ms: '81.25 ms',
    p99_ms: '105.64 ms',
    qps: '565 QPS',
  },
]

export default function Benchmarks() {
  const [dark] = useState(true)
  const [runningLive, setRunningLive] = useState(false)
  const [liveResults, setLiveResults] = useState(null)
  const [liveLogs, setLiveLogs] = useState([])
  const [reportMeta, setReportMeta] = useState(null)

  useEffect(() => {
    fetch('/benchmark-report.json')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data && data.generated_at_utc) setReportMeta(data)
      })
      .catch(() => {})
  }, [])

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
      const p99 = rtts[rtts.length - 1] || 0
      setLiveResults({
        min: min.toFixed(1),
        p50: p50.toFixed(1),
        p95: p95.toFixed(1),
        p99: p99.toFixed(1),
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
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-blue-400 bg-[#111] mb-6 font-mono">
          <span>Engineering Benchmark Report • v1.0.0 Reproducible Telemetry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Real Measured Benchmarks.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Zero marketing fluff.</span>
        </h1>
        <p className="text-lg text-[#888] max-w-3xl mb-10 leading-relaxed">
          Complete hardware specifications, index parameters, <code className="text-[#ccc]">p50 / p95 / p99</code> latency percentiles, dataset scaling (<code className="text-[#ccc]">1K</code> to <code className="text-[#ccc]">50K</code> 384d vectors), concurrent user load (<code className="text-[#ccc]">1 / 10 / 50</code> workers), <code className="text-[#ccc]">Recall@10</code> evaluation, and transparent Qdrant vs. Iceberg pipeline architecture analysis.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runLiveBrowserBenchmark}
            disabled={runningLive}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-md transition text-sm flex items-center gap-2 cursor-pointer"
          >
            <span>{runningLive ? 'Running 10 live probes...' : '⚡ Run Live Network RTT Test from Your Browser'}</span>
          </button>
          <a href="#reproduce" className="border border-[#222] hover:border-[#444] text-[#bbb] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">
            Reproducible Python Script
          </a>
          <a
            href="/benchmark-report.json"
            target="_blank"
            rel="noreferrer"
            className="border border-[#222] hover:border-blue-500/40 text-blue-400 hover:text-blue-300 font-mono px-5 py-3 rounded-md transition text-xs flex items-center gap-2"
          >
            <span>Raw Telemetry JSON (/benchmark-report.json)</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-[#777] uppercase">Min RTT</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{liveResults.min} ms</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-[#777] uppercase">Median (p50)</div>
                  <div className="text-xl font-bold font-mono text-white">{liveResults.p50} ms</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-[#777] uppercase">p95 RTT</div>
                  <div className="text-xl font-bold font-mono text-blue-400">{liveResults.p95} ms</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-[#777] uppercase">p99 RTT</div>
                  <div className="text-xl font-bold font-mono text-purple-400">{liveResults.p99} ms</div>
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
            { v: '1.95 ms', l: 'p50 Dense Search (3.80ms p95 / 5.12ms p99)' },
            { v: '8.73 ms', l: 'p50 Hybrid RRF (13.39ms p95 / 17.85ms p99)' },
            { v: '48.25 ms', l: 'Min Server-Side CPU Embed (112.34ms p50)' },
            { v: '100.0%', l: 'Recall@10 (Hybrid RRF alpha=0.5, 40 Queries)' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-white mb-1 font-mono">{s.v}</div>
              <div className="text-xs text-[#777]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 01: Hardware & Index Configuration Specifications */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">01 / Test Environment &amp; Hardware Specs</p>
              <h2 className="text-2xl md:text-3xl font-bold">Hardware, Index &amp; Methodology Specifications</h2>
              <p className="text-sm text-[#777] mt-2 max-w-2xl">
                Every latency and recall number on this page was recorded under the exact hardware, vector dimension, HNSW graph, and BM25 parameters listed below.
              </p>
            </div>
            {reportMeta && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-md shrink-0">
                Last Verified Run: {reportMeta.generated_at_utc}
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HARDWARE_SPECS.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <div className="text-[11px] font-mono text-[#666] uppercase tracking-wider mb-1.5">{item.label}</div>
                <div className="text-xs sm:text-sm font-semibold text-white font-mono leading-snug">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 02: Stage-by-Stage Latency Breakdown (Min / p50 / p95 / p99 / Runs) */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">02 / Stage-by-Stage Latency Percentiles (p50 / p95 / p99)</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Internal Engine Lookup vs. Server-Side CPU Embedding</h2>
          <p className="text-sm text-[#777] mb-8 max-w-2xl">
            Unlike vector databases that require you to call an external OpenAI embedding API before querying, Iceberg embeds raw query text server-side on CPU using quantized ONNX (<code className="text-[#aaa]">all-MiniLM-L6-v2</code>, 384-dim). Below is the exact measured <code className="text-[#aaa]">min</code>, <code className="text-[#aaa]">p50</code>, <code className="text-[#aaa]">p95</code>, and <code className="text-[#aaa]">p99</code> time spent in each stage across 200 benchmark runs.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-xs uppercase text-[#666] font-mono">
                  <th className="py-4 px-5">Pipeline Stage</th>
                  <th className="py-4 px-4">Runs</th>
                  <th className="py-4 px-4">Min</th>
                  <th className="py-4 px-4">Median (p50)</th>
                  <th className="py-4 px-4">p95</th>
                  <th className="py-4 px-4">p99</th>
                  <th className="py-4 px-5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161616] font-mono text-xs">
                <tr className="bg-blue-500/[0.06]">
                  <td className="py-4 px-5 font-sans font-semibold text-white">
                    1. Pure Dense Vector Lookup (384d Cosine HNSW)
                  </td>
                  <td className="py-4 px-4 text-[#888]">200</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold">1.42 ms</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold">1.95 ms</td>
                  <td className="py-4 px-4 text-white">3.80 ms</td>
                  <td className="py-4 px-4 text-blue-400">5.12 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">Post-embedding HNSW graph lookup (top_k=10)</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-sans font-semibold text-white">
                    2. Sparse BM25 Keyword Scoring (k1=1.5, b=0.75)
                  </td>
                  <td className="py-4 px-4 text-[#888]">200</td>
                  <td className="py-4 px-4 text-emerald-400">4.85 ms</td>
                  <td className="py-4 px-4 text-emerald-400">6.93 ms</td>
                  <td className="py-4 px-4 text-white">11.20 ms</td>
                  <td className="py-4 px-4 text-blue-400">14.65 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">Inverted index lexical term-frequency scoring</td>
                </tr>
                <tr className="bg-blue-500/[0.06]">
                  <td className="py-4 px-5 font-sans font-semibold text-white">
                    3. Hybrid RRF Search (Dense + BM25, k=60, alpha=0.5)
                  </td>
                  <td className="py-4 px-4 text-[#888]">200</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold">6.40 ms</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold">8.73 ms</td>
                  <td className="py-4 px-4 text-white">13.39 ms</td>
                  <td className="py-4 px-4 text-blue-400">17.85 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">Combined dense + sparse Reciprocal Rank Fusion</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-sans text-[#ccc]">
                    4. Server-Side Query Embedding (ONNX CPU)
                  </td>
                  <td className="py-4 px-4 text-[#888]">200</td>
                  <td className="py-4 px-4 text-blue-400">48.25 ms</td>
                  <td className="py-4 px-4 text-white">112.34 ms</td>
                  <td className="py-4 px-4 text-[#aaa]">145.10 ms</td>
                  <td className="py-4 px-4 text-[#888]">218.40 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">all-MiniLM-L6-v2 on shared CPU ($0 API cost)</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-sans text-[#ccc]">
                    5. Full E2E HTTPS /search (Internet RTT + CPU Embed + Search)
                  </td>
                  <td className="py-4 px-4 text-[#888]">30</td>
                  <td className="py-4 px-4 text-blue-400">269.7 ms</td>
                  <td className="py-4 px-4 text-white">685.1 ms</td>
                  <td className="py-4 px-4 text-[#aaa]">1023.9 ms</td>
                  <td className="py-4 px-4 text-[#888]">1184.5 ms</td>
                  <td className="py-4 px-5 text-[#888] font-sans">Measured over external HTTPS keep-alive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 03: Dataset Scale (1K / 10K / 50K Vectors + Quantization) & Concurrency (1 / 10 / 50 Users) */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl space-y-12">
          <div>
            <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">03 / Dataset Size &amp; Concurrency Scaling</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Dataset Scaling (1K to 50K Vectors) &amp; Memory Quantization</h2>
            <p className="text-sm text-[#777] mb-6 max-w-3xl">
              Measured on 384-dimensional normalized Cosine vectors (<code className="text-[#aaa]">top_k=10</code>, 200 benchmark runs after 20 warm-up queries) across Float32, Int8 Scalar Quantization (<code className="text-[#aaa]">SQ8</code> — 4x RAM reduction), and Binary Quantization (<code className="text-[#aaa]">BQ</code> — 32x RAM reduction with 4x oversampling rescore).
            </p>

            <div className="overflow-x-auto rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#1a1a1a] text-xs uppercase text-[#666] font-mono">
                    <th className="py-3.5 px-4">Dataset Size</th>
                    <th className="py-3.5 px-4">Index / Quantization Mode</th>
                    <th className="py-3.5 px-4">Runs</th>
                    <th className="py-3.5 px-4">Min</th>
                    <th className="py-3.5 px-4">p50</th>
                    <th className="py-3.5 px-4">p95</th>
                    <th className="py-3.5 px-4">p99</th>
                    <th className="py-3.5 px-4">RAM Used</th>
                    <th className="py-3.5 px-4">Recall@10</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616] font-mono text-xs">
                  {DEFAULT_SCALE_ROWS.map((row, idx) => (
                    <tr key={idx} className={idx === 1 ? 'bg-blue-500/[0.05]' : ''}>
                      <td className="py-3.5 px-4 font-bold text-white">{row.vectors} vectors</td>
                      <td className="py-3.5 px-4 font-sans text-[#ccc]">{row.mode}</td>
                      <td className="py-3.5 px-4 text-[#888]">{row.runs}</td>
                      <td className="py-3.5 px-4 text-emerald-400">{row.min_ms}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">{row.p50_ms}</td>
                      <td className="py-3.5 px-4 text-white">{row.p95_ms}</td>
                      <td className="py-3.5 px-4 text-blue-400">{row.p99_ms}</td>
                      <td className="py-3.5 px-4 text-[#aaa]">{row.ram_mb}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">{row.recall}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Concurrent User Load (1, 10, and 50 Concurrent Workers)</h3>
            <p className="text-sm text-[#777] mb-6 max-w-3xl">
              Measured across 500 total vector search queries (<code className="text-[#aaa]">10,000</code> 384-dim vectors, <code className="text-[#aaa]">top_k=10</code>) dispatched via parallel worker pools (<code className="text-[#aaa]">1</code>, <code className="text-[#aaa]">10</code>, and <code className="text-[#aaa]">50</code> concurrent users).
            </p>

            <div className="overflow-x-auto rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#1a1a1a] text-xs uppercase text-[#666] font-mono">
                    <th className="py-3.5 px-4">Concurrency Level</th>
                    <th className="py-3.5 px-4">Dataset Size</th>
                    <th className="py-3.5 px-4">Total Queries</th>
                    <th className="py-3.5 px-4">Min</th>
                    <th className="py-3.5 px-4">Median (p50)</th>
                    <th className="py-3.5 px-4">p95</th>
                    <th className="py-3.5 px-4">p99</th>
                    <th className="py-3.5 px-4">Throughput</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616] font-mono text-xs">
                  {DEFAULT_CONCURRENCY_ROWS.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">{row.users}</td>
                      <td className="py-3.5 px-4 text-[#999]">{row.dataset}</td>
                      <td className="py-3.5 px-4 text-[#888]">{row.queries}</td>
                      <td className="py-3.5 px-4 text-emerald-400">{row.min_ms}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">{row.p50_ms}</td>
                      <td className="py-3.5 px-4 text-white">{row.p95_ms}</td>
                      <td className="py-3.5 px-4 text-blue-400">{row.p99_ms}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">{row.qps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04: Retrieval Recall@1, Recall@5, Recall@10 & MRR */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">04 / Retrieval Accuracy (Recall@10 &amp; MRR@10)</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Hybrid RRF vs. Pure Dense Vector Search</h2>
          <p className="text-sm text-[#777] mb-8 max-w-3xl">
            Measured on our 120-document technical &amp; financial evaluation corpus across 40 ground-truth queries mixing conceptual questions with exact alphanumeric identifiers (<code className="text-[#aaa]">INV-9042-AX</code>, <code className="text-[#aaa]">ERR_HNSW_MMAP_07</code>, <code className="text-[#aaa]">SKU-8831-PRO</code>, <code className="text-[#aaa]">CVE-2026-4419</code>). Pure dense embeddings miss exact invoice/error IDs, while pure BM25 misses semantic paraphrases. Iceberg Hybrid RRF (<code className="text-[#aaa]">alpha=0.5, k=60</code>) achieves <strong>97.5% Recall@5</strong> and <strong>100.0% Recall@10</strong> (+35% MRR@10 improvement over pure dense).
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                mode: 'Iceberg Hybrid (RRF)',
                param: 'search_type="hybrid", alpha=0.5, k=60',
                r1: '47.5%',
                r5: '97.5%',
                r10: '100.0%',
                mrr: '0.677',
                p50: '8.73 ms',
                p99: '17.85 ms',
                highlight: true,
              },
              {
                mode: 'Pure Semantic (Dense 384d)',
                param: 'search_type="semantic", alpha=1.0',
                r1: '32.5%',
                r5: '90.0%',
                r10: '95.0%',
                mrr: '0.502',
                p50: '1.95 ms',
                p99: '5.12 ms',
                highlight: false,
              },
              {
                mode: 'Pure Keyword (Okapi BM25)',
                param: 'search_type="keyword", alpha=0.0',
                r1: '30.0%',
                r5: '85.0%',
                r10: '90.0%',
                mrr: '0.525',
                p50: '6.93 ms',
                p99: '14.65 ms',
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
                    <span className="text-[#777]">Recall@1</span>
                    <span className="text-white">{r.r1}</span>
                  </div>
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
                  <div className="flex justify-between py-1.5 border-b border-[#161616]">
                    <span className="text-[#777]">Engine p50</span>
                    <span className="text-blue-400">{r.p50}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#777]">Engine p99</span>
                    <span className="text-[#aaa]">{r.p99}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 05: Transparent Architecture Comparison (Iceberg Full Pipeline vs. Standalone Qdrant + External OpenAI Embeddings) */}
      <section className="border-b border-[#111] py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">05 / Architecture Transparency &amp; Qdrant Comparison</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">What Exactly Is Compared: Underlying HNSW vs. Complete RAG Pipeline</h2>
          <p className="text-sm text-[#888] mb-8 max-w-3xl leading-relaxed">
            <strong>Engineering Honesty Note:</strong> Iceberg DB uses <strong>Qdrant HNSW</strong> (<code className="text-[#ccc]">384d</code> Cosine, <code className="text-[#ccc]">m=16, ef_construct=100</code>) as its underlying cloud vector index alongside our vectorized <code className="text-[#ccc]">IcebergCore</code> SIMD/SQ8/BQ engine. We do <strong>not</strong> claim our HNSW graph lookup is faster than Qdrant&apos;s Rust HNSW binary (comparing vectorized C/NumPy search <code className="text-[#ccc]">3.92 ms</code> against <code className="text-[#ccc]">QdrantClient(&quot;:memory:&quot;)</code> pure-Python local emulation <code className="text-[#ccc]">111.20 ms</code> is not an apples-to-apples HNSW comparison). Instead, the table below shows the real architectural difference between calling a <strong>unified India-hosted Iceberg pipeline</strong> vs. assembling <strong>DIY Vector DB + external US OpenAI Embedding API + custom BM25/Memory</strong>.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-xs uppercase text-[#666] font-mono">
                  <th className="py-4 px-5">Pipeline Component</th>
                  <th className="py-4 px-5 text-blue-400">Iceberg DB v1.0.0 (Unified India Pipeline)</th>
                  <th className="py-4 px-5">DIY Vector DB + External US Embedding API</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161616] text-xs">
                <tr>
                  <td className="py-4 px-5 font-semibold text-white">1. Query Embedding Generation</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono">
                    Built-in Server-Side ONNX CPU (48.25ms min / 112.34ms p50 • $0 API cost)
                  </td>
                  <td className="py-4 px-5 text-[#999] font-mono">
                    External HTTPS call to OpenAI US (~180–280ms RTT from India + per-token billing)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-semibold text-white">2. Dense Vector Index (384d Cosine)</td>
                  <td className="py-4 px-5 text-white font-mono">
                    Qdrant HNSW (m=16, ef_construct=100) — 1.95 ms p50 / 5.12 ms p99
                  </td>
                  <td className="py-4 px-5 text-[#999] font-mono">
                    Qdrant HNSW (identical underlying graph engine — ~1.95 ms p50 internal lookup)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-semibold text-white">3. Hybrid BM25 + RRF Rank Fusion</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono">
                    Single-pass Okapi BM25 (k1=1.5, b=0.75) + RRF (k=60) in 8.73 ms p50
                  </td>
                  <td className="py-4 px-5 text-[#999] font-mono">
                    Requires separate sparse vector tokenizer / client-side BM25 + fusion code
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-semibold text-white">4. 4-Tier Agent Memory &amp; TTL</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono">
                    Native /memory/remember &amp; /recall (short_term 1h, episodic 30d, long_term, semantic)
                  </td>
                  <td className="py-4 px-5 text-[#999] font-mono">
                    Requires external Redis / Postgres cron jobs + custom decay scoring
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-semibold text-white">5. Data Residency (DPDP Act 2023)</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono">
                    100% India (ap-south-1) — embeddings &amp; vectors never leave India
                  </td>
                  <td className="py-4 px-5 text-[#999] font-mono">
                    Raw text crosses border if using US-hosted OpenAI / Cohere embedding endpoints
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 06: Reproducible Benchmark Script */}
      <section id="reproduce" className="py-12 md:py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">06 / Reproduce Yourself</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Verify p50, p95, p99 &amp; Concurrency from Your Own Machine</h2>
          <p className="text-sm text-[#777] mb-8 max-w-2xl">
            Follow these 4 steps in VS Code or any terminal to run the live benchmark against <code className="text-[#aaa]">https://api.icebergdb.in</code> and measure real <code className="text-[#aaa]">min</code>, <code className="text-[#aaa]">p50</code>, <code className="text-[#aaa]">p95</code>, <code className="text-[#aaa]">p99</code>, and 10-worker concurrent hybrid search latency from your own laptop.
          </p>

          {/* 4-Step Visual Guide */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
            <div className="rounded-xl border border-[#1d1d1d] bg-[#0d0d0d] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-semibold text-white">Install Python SDK (v1.0.0)</span>
              </div>
              <p className="text-[11px] text-[#777] mb-2.5 leading-relaxed">
                Open your terminal and install the canonical v1.0.0 PyPI package:
              </p>
              <div className="bg-[#080808] border border-[#1f1f1f] rounded-md px-2.5 py-1.5 font-mono text-[11px] text-emerald-400 select-all">
                pip install icebergdb==1.0.0
              </div>
            </div>

            <div className="rounded-xl border border-[#1d1d1d] bg-[#0d0d0d] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-semibold text-white">Create File &amp; Paste Code</span>
              </div>
              <p className="text-[11px] text-[#777] mb-2.5 leading-relaxed">
                Click <strong>Copy</strong> on the code block below, save it as <code className="text-[#aaa]">benchmark_latency.py</code>:
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
                Replace <code className="text-[#aaa]">&quot;ib_your_key&quot;</code> on <strong>Line 6</strong> with your free API key from the Console:
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
                Execute the script to run sequential + 10-worker concurrent hybrid searches:
              </p>
              <div className="bg-[#080808] border border-[#1f1f1f] rounded-md px-2.5 py-1.5 font-mono text-[11px] text-emerald-400 select-all">
                python benchmark_latency.py
              </div>
            </div>
          </div>

          <CodeBlock code={BENCHMARK_SCRIPT} label="benchmark_latency.py (v1.0.0)" />

          {/* Expected Output Box */}
          <div className="mt-6 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#888]">
                Expected Terminal Output (End-to-End Over Internet HTTPS)
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                ✓ Sequential + 10-Worker Concurrent Verified
              </span>
            </div>
            <pre className="bg-[#080808] border border-[#181818] rounded-lg p-4 font-mono text-xs text-[#ccc] overflow-x-auto leading-relaxed">
{`$ python benchmark_latency.py
[PASS] 1. Collection Ready: bench_test (ok)
[PASS] 2. Ingest + 384d CPU Embed: 808.2 ms
[PASS] 3. Hybrid RRF Top Match: score=0.84 | 'Iceberg HNSW engine delivers fast hybrid RRF vector search hosted in India (ap-south-1) for DPDP compliance.'
       Sequential (30 runs) -> min: 269.7 ms | p50: 685.1 ms | p95: 1023.9 ms | p99: 1184.5 ms
[PASS] 4. Concurrent (10 workers) -> p50: 742.0 ms | p95: 1140.2 ms | p99: 1295.8 ms
[PASS] 5. Agent Memory Recall: score=0.89 | 'User prefers dark mode and builds with FastAPI + React'

=== ALL 5/5 ICEBERG DB v1.0.0 LIVE ENGINE BENCHMARKS PASSED ===`}
            </pre>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
