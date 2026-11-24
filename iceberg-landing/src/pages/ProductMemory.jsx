import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, useSessionTheme } from '../components/Navbar'
import Footer from '../components/Footer'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'

const HERO_MEMORY_STATES = [
  {
    source: 'Session Chats',
    tier: 'short_term',
    ttl: '1h (3,600s)',
    embed: '384d ONNX · ₹0',
    index: 'HNSW + BM25 RRF',
    retention: 'R(t) = 0.99',
    latency: '8.73ms p50',
  },
  {
    source: 'Order & Ticket Events',
    tier: 'episodic',
    ttl: '30d (2.59M s)',
    embed: '384d ONNX · ₹0',
    index: 'HNSW + BM25 RRF',
    retention: 'R(t) = 0.96',
    latency: '8.73ms p50',
  },
  {
    source: 'User Preferences',
    tier: 'long_term',
    ttl: 'Permanent (∞)',
    embed: '384d ONNX · ₹0',
    index: 'HNSW + BM25 RRF',
    retention: 'R(t) = 1.00',
    latency: '1.95ms dense',
  },
  {
    source: 'Domain & Policy Docs',
    tier: 'semantic',
    ttl: 'Permanent (∞)',
    embed: '384d ONNX · ₹0',
    index: 'HNSW + BM25 RRF',
    retention: 'R(t) = 1.00',
    latency: '8.73ms p50',
  },
  {
    source: 'Claude & Cursor (MCP)',
    tier: 'iceberg-mcp',
    ttl: 'Auto-scoped',
    embed: '384d ONNX · ₹0',
    index: 'HNSW + BM25 RRF',
    retention: 'R(t) = 0.98',
    latency: '8.73ms p50',
  },
]

const DATA_SOURCES_HOW = [
  'Session Chats',
  'Order & Ticket Events',
  'User Preferences',
  'Domain & Policy Docs',
  'Claude & Cursor (MCP)',
]

const RAW_CORPUS_FILES = [
  'chat_turn_01.json',
  'order_upgrade_42.json',
  'user_prefs.json',
  'rbi_dpdp_policy.md',
  'ticket_19.txt',
]

const COMPILED_SCHEMA_FIELDS = [
  { name: 'point_id', type: 'string' },
  { name: 'memory_type', type: 'enum' },
  { name: 'embedding', type: 'float32[384]' },
  { name: 'retention', type: 'float32' },
]

const BENCHMARK_STATS = [
  {
    value: 8.73,
    decimals: 2,
    suffix: 'ms',
    label: 'Faster recall latency',
    sub: 'Hybrid RRF p50 · 1.95ms dense',
  },
  {
    value: 91,
    decimals: 0,
    suffix: '%',
    label: 'Fewer tokens per query',
    sub: 'vs. agentic RAG',
  },
  {
    value: 100,
    decimals: 0,
    suffix: '%',
    label: 'Recall@10 accuracy',
    sub: '384d ONNX + Okapi BM25',
  },
]

const WORKLOAD_BENCHMARKS = [
  {
    domain: 'Customer support & WhatsApp bots',
    corpus: 'Session chats + 30-day order history · short_term & episodic',
    metrics: [
      { label: 'Fewer tokens', value: '91%' },
      { label: 'Faster latency', value: '8.73ms' },
      { label: 'Stale context pruned', value: '100%' },
    ],
  },
  {
    domain: 'Fintech & DPDP compliance copilots',
    corpus: 'RBI circulars + user KYC context · semantic & long_term',
    metrics: [
      { label: 'India data residency', value: '100%' },
      { label: 'BM25 exact term p50', value: '6.93ms' },
      { label: 'Recall@10 accuracy', value: '100%' },
    ],
  },
  {
    domain: 'Autonomous coding & MCP agents',
    corpus: 'Claude Code & Cursor via iceberg-mcp · 4-tier persistent memory',
    metrics: [
      { label: 'CPU embedding cost', value: '₹0' },
      { label: 'Dense Cosine p50', value: '1.95ms' },
      { label: 'Verified burst QPS', value: '565 QPS' },
    ],
  },
]

const RECALL_PRIMITIVES = [
  {
    tag: 'Short_Term',
    desc: 'Working session context with automatic 1-hour (3,600s) TTL expiration.',
  },
  {
    tag: 'Episodic',
    desc: 'Time-bounded user events, purchases, and tickets retained for 30 days.',
  },
  {
    tag: 'Long_Term',
    desc: 'Permanent user preferences and domain facts backed by Cloudflare R2 snapshots.',
  },
  {
    tag: 'Decay R(t)',
    desc: 'Ebbinghaus retention R(t) = exp(-t / S) where repeated recalls reinforce stability.',
  },
  {
    tag: 'Provenance',
    desc: 'Memory-level citations with point ID, tier, and live retention confidence.',
  },
  {
    tag: 'Isolation',
    desc: 'Dedicated per-agent tenant namespaces enforced by role-scoped API keys.',
  },
]

function trackCardGlow(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
}

/* ========================================================================== */
/* STROKE-1.5 ARCHITECTURAL ICONS                                             */
/* ========================================================================== */
function DbCylinderIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  )
}

function DocFileIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9H8M16 13H8M16 17H8" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  )
}

function ZapStrokeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}

function BotStrokeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

/* ========================================================================== */
/* ICEBERG 8-HAIRLINE RETRACTING CROP-MARK BUTTON (MATCHES PRODUCTDATABASE)   */
/* ========================================================================== */
function MemoryCropButton({ href, to, variant = 'primary', dark, children }) {
  const cls = `ib-mem-crop-btn ${
    variant === 'primary'
      ? dark
        ? 'ib-mem-crop-primary-dark'
        : 'ib-mem-crop-primary-light'
      : dark
        ? 'ib-mem-crop-sec-dark'
        : 'ib-mem-crop-sec-light'
  }`

  const inner = (
    <>
      <span className="ib-mem-crop-box">{children}</span>
      <span aria-hidden="true" role="presentation" className="ib-mem-tick ib-mem-tl-h" />
      <span aria-hidden="true" role="presentation" className="ib-mem-tick ib-mem-tl-v" />
      <span aria-hidden="true" role="presentation" className="ib-mem-tick ib-mem-tr-h" />
      <span aria-hidden="true" role="presentation" className="ib-mem-tick ib-mem-tr-v" />
      <span aria-hidden="true" role="presentation" className="ib-mem-tick ib-mem-bl-h" />
      <span aria-hidden="true" role="presentation" className="ib-mem-tick ib-mem-bl-v" />
      <span aria-hidden="true" role="presentation" className="ib-mem-tick ib-mem-br-h" />
      <span aria-hidden="true" role="presentation" className="ib-mem-tick ib-mem-br-v" />
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    )
  }

  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  )
}

/* ========================================================================== */
/* HERO RIGHT LIVE ARCHITECTURAL CARD (ICEBERG 1PX PRECISION + GLACIAL CYAN)  */
/* ========================================================================== */
function HeroMemoryShowcase({ activeIdx, setActiveIdx, setPaused }) {
  const active = HERO_MEMORY_STATES[activeIdx]

  return (
    <div
      className="border border-[var(--border)] bg-[var(--background-light)] p-4 sm:p-5 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        <span className="truncate">ICEBERG // COGNITIVE MEMORY · AP-SOUTH-1</span>
        <span className="inline-flex items-center gap-1.5 shrink-0 text-[var(--ib-cyan)] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ib-cyan)] animate-pulse" />
          V1.0
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_28px_1.15fr] items-center gap-3 sm:gap-0">
        {/* Left Box: Agent Context Sources */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-3.5">
          <div className="mb-3 flex items-center gap-2">
            <DbCylinderIcon className="h-4 w-4 text-[var(--text-primary)] shrink-0" />
            <span className="text-[13px] font-semibold text-[var(--text-primary)] whitespace-nowrap">
              Agent Context
            </span>
          </div>
          <div className="space-y-1.5">
            {HERO_MEMORY_STATES.map((item, idx) => {
              const isSelected = idx === activeIdx
              return (
                <button
                  key={item.source}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full flex items-center gap-2 border px-2.5 py-2 text-left transition-colors duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[var(--ib-cyan-border)] bg-[var(--ib-cyan-soft)]'
                      : 'border-[var(--border)] bg-transparent hover:border-[var(--text-tertiary)]'
                  }`}
                >
                  <DocFileIcon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isSelected ? 'text-[var(--ib-cyan)]' : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <span
                    className={`text-[12px] font-medium whitespace-nowrap truncate ${
                      isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {item.source}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Center Live Animated Connector Bridge */}
        <div className="hidden sm:flex items-center justify-center w-7">
          <div className="relative h-px w-full bg-[var(--border)] overflow-visible">
            <span className="ib-mem-bridge-dot" />
          </div>
        </div>

        {/* Right Box: Iceberg Memory (Crisp 1px Glacial Cyan Frame) */}
        <div
          className="border border-[var(--ib-cyan-border)] p-3.5"
          style={{
            background: 'var(--ib-cyan-tint)',
            boxShadow: 'var(--ib-cyan-glow)',
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <DbCylinderIcon className="h-4 w-4 text-[var(--ib-cyan)] shrink-0" />
              <span className="text-[13px] font-semibold text-[var(--ib-cyan)] whitespace-nowrap">
                Iceberg Memory
              </span>
            </div>
            <span className="border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--text-secondary)] shrink-0">
              V1
            </span>
          </div>

          <div className="border border-[var(--border)] bg-[var(--background)] p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2 whitespace-nowrap text-[12px]">
              <span className="font-mono text-[var(--text-secondary)]">tier</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">{active.tier}</span>
            </div>
            <div className="flex items-center justify-between gap-2 whitespace-nowrap text-[12px]">
              <span className="font-mono text-[var(--text-secondary)]">ttl</span>
              <span className="font-semibold text-[var(--text-primary)]">{active.ttl}</span>
            </div>
            <div className="flex items-center justify-between gap-2 whitespace-nowrap text-[12px]">
              <span className="font-mono text-[var(--text-secondary)]">embed</span>
              <span className="font-semibold text-[var(--text-primary)]">{active.embed}</span>
            </div>
            <div className="flex items-center justify-between gap-2 whitespace-nowrap text-[12px]">
              <span className="font-mono text-[var(--text-secondary)]">index</span>
              <span className="font-semibold text-[var(--text-primary)]">{active.index}</span>
            </div>
            <div className="flex items-center justify-between gap-2 whitespace-nowrap text-[12px]">
              <span className="font-mono text-[var(--text-secondary)]">decay</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">{active.retention}</span>
            </div>
          </div>

          <div className="mt-2.5 border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 flex items-center justify-between gap-2 whitespace-nowrap text-[12px]">
            <span className="font-mono text-[var(--text-secondary)]">latency</span>
            <span className="font-mono font-semibold text-[var(--ib-cyan)]">{active.latency}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* DUAL-AGENT LIVE STREAMING TERMINAL COMPARISON                              */
/* ========================================================================== */
function DualAgentTerminal({ replayNonce = 0 }) {
  const rootRef = useRef(null)
  const hasObservedRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    let cancelled = false
    let rafId = null
    let runId = 0

    const qSel = (id) => root.querySelector(`#${id}`)
    const promptStr = 'Does Acme Corp qualify for a renewal discount?'

    const startSingleRun = async (myRunId) => {
      const isStale = () => cancelled || myRunId !== runId

      const state = {
        A: {
          tools: 0,
          tokens: 0,
          toolEl: qSel('toolCountA'),
          tokEl: qSel('tokCountA'),
          timeEl: qSel('timeA'),
        },
        B: {
          tools: 0,
          tokens: 0,
          toolEl: qSel('toolCountB'),
          tokEl: qSel('tokCountB'),
          timeEl: qSel('timeB'),
        },
      }

      const promptA = qSel('promptA')
      const promptB = qSel('promptB')
      const outA = qSel('outA')
      const outB = qSel('outB')
      const bodyA = qSel('bodyA')
      const bodyB = qSel('bodyB')

      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }

      if (promptA) promptA.innerHTML = ''
      if (promptB) promptB.innerHTML = ''
      if (outA) outA.innerHTML = ''
      if (outB) outB.innerHTML = ''
      if (bodyA) bodyA.scrollTop = 0
      if (bodyB) bodyB.scrollTop = 0
      if (state.A.toolEl) state.A.toolEl.textContent = '0'
      if (state.A.tokEl) state.A.tokEl.textContent = '0'
      if (state.A.timeEl) state.A.timeEl.textContent = '0.00s'
      if (state.B.toolEl) state.B.toolEl.textContent = '0'
      if (state.B.tokEl) state.B.tokEl.textContent = '0'
      if (state.B.timeEl) state.B.timeEl.textContent = '0.00s'

      const bump = (el) => {
        if (!el || isStale()) return
        el.classList.remove('bump')
        void el.offsetWidth
        el.classList.add('bump')
      }

      const addTokens = (side, amount) => {
        if (isStale()) return
        state[side].tokens += amount
        if (state[side].tokEl) {
          state[side].tokEl.textContent = state[side].tokens.toLocaleString()
          bump(state[side].tokEl)
        }
      }

      const addTool = (side) => {
        if (isStale()) return
        state[side].tools += 1
        if (state[side].toolEl) {
          state[side].toolEl.textContent = String(state[side].tools)
          bump(state[side].toolEl)
        }
      }

      const sleep = (ms) =>
        new Promise((resolve) => {
          setTimeout(resolve, ms / 2)
        })

      const countTokensSmooth = async (side, totalAdd, durationMs = 500) => {
        const steps = Math.min(30, Math.max(8, Math.floor(totalAdd / 200)))
        const perStep = totalAdd / steps
        const stepDelay = durationMs / steps
        let added = 0
        for (let i = 0; i < steps; i++) {
          if (isStale()) return
          const delta = i === steps - 1 ? totalAdd - added : Math.round(perStep)
          state[side].tokens += delta
          added += delta
          if (state[side].tokEl) {
            state[side].tokEl.textContent = state[side].tokens.toLocaleString()
          }
          await sleep(stepDelay)
        }
        bump(state[side].tokEl)
      }

      const formatTime = (valSec) => `${valSec.toFixed(2)}s`
      const timerState = { start: null, running: false, sides: {} }

      const startTimer = (side, targetSec, realDurationSec) => {
        timerState.sides[side] = { target: targetSec, realDurationSec, done: false }
        if (!timerState.running) {
          timerState.running = true
          timerState.start = performance.now()
          const tick = () => {
            if (isStale() || !timerState.running) return
            const elapsed = (performance.now() - timerState.start) / 1000
            for (const k of Object.keys(timerState.sides)) {
              const s = timerState.sides[k]
              if (s.done) continue
              const scaled = (elapsed / s.realDurationSec) * s.target
              const clamped = Math.min(s.target, scaled)
              if (state[k].timeEl) {
                state[k].timeEl.textContent = formatTime(clamped)
              }
            }
            rafId = requestAnimationFrame(tick)
          }
          rafId = requestAnimationFrame(tick)
        }
      }

      const stopTimer = (side) => {
        const s = timerState.sides[side]
        if (!s || isStale()) return
        s.done = true
        if (state[side].timeEl) {
          state[side].timeEl.textContent = formatTime(s.target)
        }
        if (Object.values(timerState.sides).every((x) => x.done)) {
          timerState.running = false
        }
      }

      const createPromptLine = (container) => {
        const div = document.createElement('div')
        div.className = 'line'
        div.innerHTML =
          '<span class="prompt-symbol">&gt;</span> <span class="user-input"></span><span class="cursor"></span>'
        container.appendChild(div)
        return {
          input: div.querySelector('.user-input'),
          cursor: div.querySelector('.cursor'),
        }
      }

      const scrollBottom = (bodyEl) => {
        if (bodyEl && !isStale()) {
          bodyEl.scrollTop = bodyEl.scrollHeight
        }
      }

      const appendLine = (container, bodyEl, html, cls = 'line') => {
        if (isStale()) return null
        const div = document.createElement('div')
        div.className = cls
        div.innerHTML = html
        container.appendChild(div)
        scrollBottom(bodyEl)
        return div
      }

      const typeThinking = async (container, bodyEl, text, side = 'A') => {
        if (isStale()) return
        const div = document.createElement('div')
        div.className = 'thinking'
        div.innerHTML = '<span class="arrow">◇</span><span class="body-text"></span>'
        container.appendChild(div)
        const span = div.querySelector('.body-text')
        let acc = 0
        for (let i = 0; i < text.length; i++) {
          if (isStale()) return
          span.textContent += text[i]
          acc += 0.25
          if (acc >= 1) {
            addTokens(side, Math.floor(acc))
            acc -= Math.floor(acc)
          }
          scrollBottom(bodyEl)
          await sleep(8 + 14 * Math.random())
        }
        if (acc > 0) addTokens(side, Math.ceil(acc))
      }

      const runTraditionalToolCall = async (
        container,
        bodyEl,
        { name, args, chunks, tokens, latencyMs = 700, side = 'A' }
      ) => {
        if (isStale()) return
        addTool(side)
        const card = document.createElement('div')
        card.className = 'tool-call'
        card.innerHTML = `
          <div class="tc-head">⚙ tool_call <span style="opacity:0.6;font-weight:500">#${state[side].tools}</span> → ${name}</div>
          <div class="tc-args">args: ${args}</div>
          <div class="tc-result muted">↳ executing...</div>
        `
        container.appendChild(card)
        scrollBottom(bodyEl)
        await sleep(latencyMs)
        if (isStale()) return
        const resEl = card.querySelector('.tc-result')
        if (resEl) {
          resEl.classList.remove('muted')
          resEl.innerHTML = `↳ returned <span class="chunks">${chunks} chunks</span> · <span class="toks">~${tokens.toLocaleString()} tokens</span> added to context`
        }
        scrollBottom(bodyEl)
        await countTokensSmooth(side, tokens, 350)
        await sleep(150)
      }

      const streamJsonSpans = async (
        container,
        bodyEl,
        tokensArr,
        side,
        { perTokenDelay = 6, countTokens = true } = {}
      ) => {
        if (isStale()) return null
        const block = document.createElement('div')
        block.className = 'json-block'
        container.appendChild(block)
        let acc = 0
        for (const seg of tokensArr) {
          if (isStale()) return block
          const span = document.createElement('span')
          if (seg.c) span.className = seg.c
          span.textContent = seg.t
          block.appendChild(span)
          scrollBottom(bodyEl)
          if (countTokens) {
            acc += 0.25 * seg.t.length
            if (acc >= 1) {
              addTokens(side, Math.floor(acc))
              acc -= Math.floor(acc)
            }
          }
          await sleep(perTokenDelay + 8 * Math.random())
        }
        if (countTokens && acc > 0) addTokens(side, Math.ceil(acc))
        return block
      }

      if (!promptA || !promptB || !outA || !outB) return
      const pLineA = createPromptLine(promptA)
      const pLineB = createPromptLine(promptB)

      for (let i = 0; i < promptStr.length; i++) {
        if (isStale()) return
        const ch = promptStr[i]
        pLineA.input.textContent += ch
        pLineB.input.textContent += ch
        const jitter = 35 * Math.random()
        const spacePause = ch === ' ' ? 15 : 0
        await sleep(40 + jitter + spacePause)
      }
      await sleep(400)
      if (isStale()) return
      pLineA.cursor.classList.add('done')
      pLineB.cursor.classList.add('done')
      const promptTokens = Math.round(promptStr.length / 4)
      addTokens('A', promptTokens)
      addTokens('B', promptTokens)

      // Both panes measure end-to-end agent turn time in seconds (0.00s -> final s)
      startTimer('A', 25.1, 12.55)
      startTimer('B', 1.84, 1.84)

      const runLeftIceberg = async () => {
        await sleep(200)
        await typeThinking(outB, bodyB, 'Building Iceberg recall query...', 'B')
        await sleep(150)
        if (isStale()) return
        addTool('B')

        const card = document.createElement('div')
        card.className = 'tool-call'
        card.innerHTML = `
          <div class="tc-head">⚙ tool_call <span style="opacity:0.6;font-weight:500">#${state.B.tools}</span> → iceberg.recall</div>
          <div class="tc-args">args:</div>
          <div class="tc-query"></div>
          <div class="tc-status muted" style="margin-top:6px;font-size:12px;font-family:var(--font-mono);">↳ executing...</div>
          <div class="tc-divider" style="display:none;margin:10px 0 6px;padding-top:8px;border-top:1px solid var(--border);font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary);letter-spacing:1px;font-weight:700;">response:</div>
          <div class="tc-response"></div>
          <div class="tc-returned" style="margin-top:4px;font-size:12px;font-family:var(--font-mono);color:var(--text-secondary);"></div>
        `
        outB.appendChild(card)
        const qBox = card.querySelector('.tc-query')
        const statusEl = card.querySelector('.tc-status')
        const divEl = card.querySelector('.tc-divider')
        const respBox = card.querySelector('.tc-response')
        const retEl = card.querySelector('.tc-returned')
        scrollBottom(bodyB)

        await streamJsonSpans(
          qBox,
          bodyB,
          [
            { t: '{\n' },
            { t: '  ask', c: 'j-key' },
            { t: ':     ' },
            { t: '"Does Acme Corp qualify for a renewal discount?"', c: 'j-str' },
            { t: '\n' },
            { t: '  tiers', c: 'j-key' },
            { t: ':   [' },
            { t: 'long_term', c: 'j-ref' },
            { t: ', ' },
            { t: 'episodic', c: 'j-ref' },
            { t: ', ' },
            { t: 'semantic', c: 'j-ref' },
            { t: ']\n' },
            { t: '  where', c: 'j-key' },
            { t: ':   { ' },
            { t: 'customer_id', c: 'j-key' },
            { t: ': ' },
            { t: '"acme_corp_001"', c: 'j-str' },
            { t: ' }\n' },
            { t: '  shape', c: 'j-key' },
            { t: ':   { ' },
            { t: 'qualifies', c: 'j-key' },
            { t: ': ' },
            { t: 'bool', c: 'j-bool' },
            { t: ', ' },
            { t: 'discount_pct', c: 'j-key' },
            { t: ': ' },
            { t: 'number', c: 'j-bool' },
            { t: ',\n' },
            { t: '             ' },
            { t: 'applicable_memories', c: 'j-key' },
            { t: ': [{ ' },
            { t: 'memory_id', c: 'j-key' },
            { t: ', ' },
            { t: 'reason', c: 'j-key' },
            { t: ' }] }\n' },
            { t: '  ground', c: 'j-key' },
            { t: ':  { ' },
            { t: 'per_field', c: 'j-key' },
            { t: ': ' },
            { t: 'true', c: 'j-bool' },
            { t: ', ' },
            { t: 'hybrid_rrf', c: 'j-key' },
            { t: ': ' },
            { t: 'true', c: 'j-bool' },
            { t: ' }\n' },
            { t: '  budget', c: 'j-key' },
            { t: ':  { ' },
            { t: 'max_tokens', c: 'j-key' },
            { t: ': ' },
            { t: '2000', c: 'j-num' },
            { t: ', ' },
            { t: 'region', c: 'j-key' },
            { t: ': ' },
            { t: '"ap-south-1"', c: 'j-str' },
            { t: ' }\n' },
            { t: '}' },
          ],
          'B',
          { perTokenDelay: 4 }
        )

        await sleep(120)
        await sleep(400)
        if (isStale()) return
        statusEl.remove()
        divEl.style.display = 'block'

        await streamJsonSpans(
          respBox,
          bodyB,
          [
            { t: '{\n' },
            { t: '  "qualifies"', c: 'j-key' },
            { t: ': ' },
            { t: 'true', c: 'j-bool' },
            { t: ',\n' },
            { t: '  "discount_pct"', c: 'j-key' },
            { t: ': ' },
            { t: '15', c: 'j-num' },
            { t: ',\n' },
            { t: '  "applicable_memories"', c: 'j-key' },
            { t: ': [\n' },
            { t: '    {\n' },
            { t: '      "memory_id"', c: 'j-key' },
            { t: ': ' },
            { t: '"LOYALTY_TIER_2"', c: 'j-str' },
            { t: ',\n' },
            { t: '      "reason"', c: 'j-key' },
            { t: ': ' },
            { t: '"3+ year customer, ARR > ₹4Cr"', c: 'j-str' },
            { t: ',\n' },
            { t: '      "confidence"', c: 'j-key' },
            { t: ': ' },
            { t: '"high"', c: 'j-str' },
            { t: ',\n' },
            { t: '      "source"', c: 'j-key' },
            { t: ': ' },
            { t: '"pricing_policy_v2026.md#loyalty-tiers"', c: 'j-str' },
            { t: '\n    },\n' },
            { t: '    {\n' },
            { t: '      "memory_id"', c: 'j-key' },
            { t: ': ' },
            { t: '"ACME_OVERRIDE_2025"', c: 'j-str' },
            { t: ',\n' },
            { t: '      "reason"', c: 'j-key' },
            { t: ': ' },
            { t: '"Account-specific override supersedes standard loyalty"', c: 'j-str' },
            { t: ',\n' },
            { t: '      "confidence"', c: 'j-key' },
            { t: ': ' },
            { t: '"high"', c: 'j-str' },
            { t: ',\n' },
            { t: '      "source"', c: 'j-key' },
            { t: ': ' },
            { t: '"overrides/acme_corp_001.json"', c: 'j-str' },
            { t: '\n    }\n' },
            { t: '  ]\n' },
            { t: '}' },
          ],
          'B',
          { perTokenDelay: 3, countTokens: false }
        )

        const finalMsg =
          'Based on recalled memory, Acme Corp qualifies for a 15% renewal discount under their approved account override.'
        const respTokens = Math.ceil(finalMsg.length / 4)
        const targetBeforeResp = 1842 - respTokens
        const rem = Math.max(0, targetBeforeResp - state.B.tokens)
        if (rem > 0) await countTokensSmooth('B', rem, 200)
        await sleep(100)
        if (isStale()) return
        retEl.innerHTML =
          '↳ returned <span style="color:var(--text-primary);font-weight:600;">Hybrid RRF (8.73ms)</span> · <span style="color:var(--text-primary);font-weight:600;">~1,842 tokens</span>'
        scrollBottom(bodyB)
        await sleep(150)

        const respDiv = document.createElement('div')
        respDiv.className = 'response'
        outB.appendChild(respDiv)
        for (let i = 0; i < finalMsg.length; i++) {
          if (isStale()) return
          respDiv.textContent += finalMsg[i]
          scrollBottom(bodyB)
          if (i % 4 === 0) addTokens('B', 1)
          await sleep(6 + 10 * Math.random())
        }
        await sleep(200)
        stopTimer('B')
        appendLine(
          outB,
          bodyB,
          `<span class="muted">[done · ${state.B.tools} tool call · ${state.B.tokens.toLocaleString()} tokens · ${state.B.timeEl?.textContent || '1.84s'}]</span>`,
          'line dim'
        )
      }

      const runRightTraditional = async () => {
        await sleep(500)
        await typeThinking(
          outA,
          bodyA,
          "Planning... I'll need contract terms, usage metrics, and policy rules.",
          'A'
        )
        await sleep(250)
        await runTraditionalToolCall(outA, bodyA, {
          name: 'search_contracts',
          args: '"Acme Corp contract terms"',
          chunks: 5,
          tokens: 8000,
          latencyMs: 1000,
        })
        await typeThinking(
          outA,
          bodyA,
          "Reading chunks... identifying current commitment tier. There's a reference to an amendment I don't have context on.",
          'A'
        )
        await sleep(250)
        await runTraditionalToolCall(outA, bodyA, {
          name: 'search_contracts',
          args: '"Acme Corp amendment"',
          chunks: 4,
          tokens: 6000,
          latencyMs: 900,
        })
        await typeThinking(
          outA,
          bodyA,
          'Synthesizing current contract state. Moving to usage metrics.',
          'A'
        )
        await sleep(250)
        await runTraditionalToolCall(outA, bodyA, {
          name: 'search_usage',
          args: '"Acme Corp consumption metrics Q1 2026"',
          chunks: 6,
          tokens: 10000,
          latencyMs: 1100,
        })
        await typeThinking(
          outA,
          bodyA,
          'Reading usage data. Computing consumption vs. commitment thresholds manually...',
          'A'
        )
        await sleep(300)
        await runTraditionalToolCall(outA, bodyA, {
          name: 'search_policies',
          args: '"renewal discount qualification rules"',
          chunks: 8,
          tokens: 12000,
          latencyMs: 1200,
        })
        await typeThinking(
          outA,
          bodyA,
          'Reading policy. Identified a standard discount of 15% for qualifying accounts.',
          'A'
        )
        await sleep(250)
        await typeThinking(
          outA,
          bodyA,
          'Noticed a reference to "account-specific overrides" — unclear if one exists for Acme.',
          'A'
        )
        await sleep(250)
        await runTraditionalToolCall(outA, bodyA, {
          name: 'search_policies',
          args: '"Acme Corp override rules"',
          chunks: 3,
          tokens: 4000,
          latencyMs: 900,
        })
        await typeThinking(
          outA,
          bodyA,
          'Found a custom override for Acme. Now I have conflicting information — standard policy vs. override.',
          'A'
        )
        await sleep(250)
        await runTraditionalToolCall(outA, bodyA, {
          name: 'search_policies',
          args: '"override precedence rules"',
          chunks: 5,
          tokens: 7000,
          latencyMs: 1000,
        })
        await typeThinking(
          outA,
          bodyA,
          'Reviewing precedence rules. Attempting to reconcile...',
          'A'
        )
        await sleep(400)

        if (isStale()) return
        const respDiv = document.createElement('div')
        respDiv.className = 'response'
        outA.appendChild(respDiv)
        const finalMsg =
          'Based on my review, Acme Corp likely qualifies for approximately a 12–15% discount based on their loyalty tier, depending on if an override can be applied.'
        for (let i = 0; i < finalMsg.length; i++) {
          if (isStale()) return
          respDiv.textContent += finalMsg[i]
          scrollBottom(bodyA)
          if (i % 4 === 0) addTokens('A', 1)
          await sleep(14 + 20 * Math.random())
        }
        await sleep(400)
        stopTimer('A')
        appendLine(
          outA,
          bodyA,
          `<span class="muted">[done · ${state.A.tools} tool calls · ${state.A.tokens.toLocaleString()} tokens · ${state.A.timeEl?.textContent || '25.10s'}]</span>`,
          'line dim'
        )
      }

      await Promise.all([runLeftIceberg(), runRightTraditional()])
    }

    const launchRun = () => {
      hasObservedRef.current = true
      runId += 1
      startSingleRun(runId)
    }

    if (replayNonce > 0 || hasObservedRef.current) {
      launchRun()
      return () => {
        cancelled = true
        if (rafId) cancelAnimationFrame(rafId)
      }
    }

    if (typeof IntersectionObserver === 'undefined') {
      launchRun()
      return () => {
        cancelled = true
        if (rafId) cancelAnimationFrame(rafId)
      }
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            launchRun()
            obs.disconnect()
            break
          }
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(root)

    return () => {
      cancelled = true
      obs.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [replayNonce])

  const statLabelCls =
    'text-xs font-semibold uppercase tracking-[1.4px] text-[var(--text-tertiary)]'
  const statValCls =
    'text-xl/[1.4] font-bold tabular-nums text-[var(--text-primary)]'

  return (
    <div
      ref={rootRef}
      className="ib-mem-term-root border border-[var(--border)] text-[var(--text-primary)] flex flex-col lg:flex-row h-[760px] lg:h-[550px] overflow-hidden"
    >
      {/* Left Pane: Iceberg + Recall */}
      <div className="pane left border-[var(--border)] relative flex flex-1 flex-col overflow-hidden border-b lg:border-b-0 lg:border-r">
        <div className="bg-[var(--background-light)] border-[var(--border)] flex-none border-b p-5 pb-4">
          <div className="pane-title mb-[18px] flex max-[512px]:flex-col min-[513px]:items-center gap-2 text-xl/[1.4] font-semibold">
            <ZapStrokeIcon className="text-[var(--ib-cyan)] h-4 w-4 shrink-0" />
            <span>Iceberg + Recall</span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
            <div className="stat flex flex-col gap-1">
              <span className={statLabelCls}>Time</span>
              <span className={`v accent ${statValCls}`} id="timeB">
                0.00s
              </span>
            </div>
            <div className="stat flex flex-col gap-1">
              <span className={statLabelCls}>Tool Calls</span>
              <span className={`v ${statValCls}`} id="toolCountB">
                0
              </span>
            </div>
            <div className="stat flex flex-col gap-1">
              <span className={statLabelCls}>Tokens</span>
              <span className={`v ${statValCls}`} id="tokCountB">
                0
              </span>
            </div>
          </div>
        </div>
        <div className="ib-mem-term bg-[var(--background)] text-[var(--text-primary)] flex flex-1 flex-col overflow-hidden text-sm leading-[1.5]">
          <div className="body" id="bodyB">
            <div className="header">$ agent --system iceberg-memory</div>
            <div id="promptB" />
            <div id="outB" />
          </div>
        </div>
      </div>

      {/* Right Pane: Traditional Agents */}
      <div className="pane right relative flex flex-1 flex-col overflow-hidden">
        <div className="bg-[var(--background-light)] border-[var(--border)] flex-none border-b p-5 pb-4">
          <div className="pane-title mb-[18px] flex max-[512px]:flex-col min-[513px]:items-center gap-2 text-xl/[1.4] font-semibold">
            <BotStrokeIcon className="text-[var(--text-secondary)] h-4 w-4 shrink-0" />
            <span>Traditional Agents</span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
            <div className="stat flex flex-col gap-1">
              <span className={statLabelCls}>Time</span>
              <span className={`v accent ${statValCls}`} id="timeA">
                0.00s
              </span>
            </div>
            <div className="stat flex flex-col gap-1">
              <span className={statLabelCls}>Tool Calls</span>
              <span className={`v ${statValCls}`} id="toolCountA">
                0
              </span>
            </div>
            <div className="stat flex flex-col gap-1">
              <span className={statLabelCls}>Tokens</span>
              <span className={`v ${statValCls}`} id="tokCountA">
                0
              </span>
            </div>
          </div>
        </div>
        <div className="ib-mem-term bg-[var(--background)] text-[var(--text-primary)] flex flex-1 flex-col overflow-hidden text-sm leading-[1.5]">
          <div className="body" id="bodyA">
            <div className="header">$ agent --system traditional-agentic-rag</div>
            <div id="promptA" />
            <div id="outA" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* 4 STICKY SCROLL-SPY VISUALS (1PX PRECISION + ICEBERG GLACIAL CYAN)         */
/* ========================================================================== */
function HowVisual01({ liveTick }) {
  const activeRow = liveTick % DATA_SOURCES_HOW.length
  return (
    <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-center md:gap-0">
      <div className="border border-[var(--border)] bg-[var(--background)] p-4 md:w-[230px] xl:w-[250px]">
        <div className="mb-3 flex items-center gap-2">
          <DbCylinderIcon className="text-[var(--text-primary)] h-4 w-4 shrink-0" />
          <span className="text-[var(--text-primary)] text-[13px] font-semibold">Agent Sources</span>
        </div>
        <div className="space-y-1.5">
          {DATA_SOURCES_HOW.map((src, i) => (
            <div
              key={src}
              className={`flex items-center gap-2 border px-2.5 py-2 transition-colors duration-300 ${
                i === activeRow
                  ? 'border-[var(--ib-cyan-border)] bg-[var(--ib-cyan-soft)]'
                  : 'border-[var(--border)] bg-[var(--background-light)]'
              }`}
            >
              <DocFileIcon
                className={`h-3.5 w-3.5 shrink-0 ${
                  i === activeRow ? 'text-[var(--ib-cyan)]' : 'text-[var(--text-secondary)]'
                }`}
              />
              <span className="text-[var(--text-primary)] text-xs font-medium whitespace-nowrap truncate">
                {src}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center md:w-9 xl:w-12">
        <div className="bg-[var(--border)] relative h-5 w-px md:h-px md:w-full">
          <span className="hidden md:block ib-mem-bridge-dot" />
          <div className="md:hidden bg-[var(--ib-cyan)] absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </div>
      </div>

      <div
        className="border border-[var(--ib-cyan-border)] p-4 md:w-[230px] xl:w-[250px]"
        style={{
          background: 'var(--ib-cyan-tint)',
          boxShadow: 'var(--ib-cyan-glow)',
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DbCylinderIcon className="text-[var(--ib-cyan)] h-4 w-4 shrink-0" />
            <span className="text-[var(--ib-cyan)] text-[13px] font-semibold whitespace-nowrap">
              Iceberg Memory
            </span>
          </div>
          <span className="bg-[var(--background)] text-[var(--text-secondary)] border border-[var(--border)] px-2 py-0.5 font-mono text-[11px] font-medium">
            {DATA_SOURCES_HOW.length}
          </span>
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] space-y-2.5 p-3">
          {[100, 90, 75].map((w, idx) => (
            <div
              key={w}
              className="h-2 transition-colors duration-300"
              style={{
                width: `${w}%`,
                backgroundColor:
                  idx === liveTick % 3 ? 'var(--ib-cyan)' : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function HowVisual02({ liveTick }) {
  const activeField = liveTick % COMPILED_SCHEMA_FIELDS.length
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="border border-[var(--border)] bg-[var(--background-light)]">
        <div className="p-4 pb-3">
          <span className="text-[var(--text-primary)] text-sm font-semibold">Raw Stream</span>
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] m-4 mt-0 space-y-3 p-4">
          {RAW_CORPUS_FILES.map((file) => (
            <div key={file} className="flex items-center gap-2.5">
              <div className="bg-[var(--border)] h-1.5 w-1.5 shrink-0 rounded-full" />
              <span className="text-[var(--text-primary)] font-mono text-sm whitespace-nowrap">
                {file}
              </span>
            </div>
          ))}
          <p className="text-[var(--text-secondary)] pl-4 text-sm">+1,840 more</p>
        </div>
      </div>

      <div
        className="border border-[var(--ib-cyan-border)]"
        style={{
          background: 'var(--ib-cyan-tint)',
          boxShadow: 'var(--ib-cyan-glow)',
        }}
      >
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <DbCylinderIcon className="text-[var(--ib-cyan)] h-4 w-4 shrink-0" />
            <span className="text-[var(--ib-cyan)] text-sm font-semibold">Iceberg</span>
          </div>
          <span className="bg-[var(--background)] text-[var(--text-secondary)] border border-[var(--border)] px-2.5 py-0.5 font-mono text-xs font-medium">
            V1
          </span>
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] m-4 mt-0 space-y-3 p-4">
          {COMPILED_SCHEMA_FIELDS.map((field, idx) => (
            <div key={field.name} className="flex items-center justify-between gap-2 whitespace-nowrap">
              <span className="text-[var(--text-secondary)] font-mono text-sm">{field.name}</span>
              <span
                className={`font-mono text-sm font-semibold transition-colors duration-300 ${
                  idx === activeField ? 'text-[var(--ib-cyan)]' : 'text-[var(--text-primary)]'
                }`}
              >
                {field.type}
              </span>
            </div>
          ))}
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] mx-4 mb-4 flex items-center justify-between p-4 whitespace-nowrap">
          <span className="text-[var(--text-secondary)] font-mono text-sm">residency</span>
          <span className="text-[var(--text-primary)] font-mono text-sm font-semibold">ap-south-1</span>
        </div>
      </div>
    </div>
  )
}

const RAG_LOOP_STEPS = [
  'embed(query)',
  'vector_search(k=20)',
  'llm_reason(chunks)',
  'vector_search(k=20)',
  'llm_reason(chunks)',
  'vector_search(k=20)',
  'llm_reason(chunks)',
  'llm_assemble(context)',
]

function HowVisual03({ liveTick }) {
  const ragIdx = liveTick % RAG_LOOP_STEPS.length
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        className="border border-[var(--ib-cyan-border)]"
        style={{
          background: 'var(--ib-cyan-tint)',
          boxShadow: 'var(--ib-cyan-glow)',
        }}
      >
        <div className="flex items-center gap-2 p-4 pb-3">
          <ZapStrokeIcon className="text-[var(--ib-cyan)] h-4 w-4 shrink-0" />
          <span className="text-[var(--ib-cyan)] text-sm font-semibold">Iceberg Recall</span>
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] m-4 mt-0 p-4 font-mono text-sm space-y-1">
          <p className="text-[var(--text-secondary)]">client.recall(&#123;</p>
          <p className="text-[var(--ib-cyan)] pl-3">agent_id: $agent,</p>
          <p className="text-[var(--ib-cyan)] pl-3">query: $question,</p>
          <p className="text-[var(--ib-cyan)] pl-3">top_k: 5</p>
          <p className="text-[var(--text-secondary)]">&#125;)</p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] mx-4 mb-4 space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] text-sm">Tokens</span>
            <span className="text-[var(--text-primary)] font-mono text-sm font-semibold">0.4K</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] text-sm">Latency</span>
            <span className="text-[var(--ib-cyan)] font-mono text-sm font-semibold">8.73ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] text-sm">Steps</span>
            <span className="text-[var(--text-primary)] font-mono text-sm font-semibold">1</span>
          </div>
        </div>
      </div>

      <div className="border border-[var(--border)] bg-[var(--background-light)]">
        <div className="flex items-center gap-2 p-4 pb-3">
          <BotStrokeIcon className="text-[var(--text-primary)] h-4 w-4 shrink-0" />
          <span className="text-[var(--text-primary)] text-sm font-semibold">Agentic RAG</span>
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] m-4 mt-0 p-4 font-mono text-sm space-y-1">
          {RAG_LOOP_STEPS.map((step, i) => (
            <p
              key={`${step}-${i}`}
              className={`transition-colors duration-200 whitespace-nowrap ${
                i === ragIdx ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
              }`}
            >
              {step}
            </p>
          ))}
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] mx-4 mb-4 space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] text-sm">Tokens</span>
            <span className="text-[var(--text-primary)] font-mono text-sm font-semibold">47K+</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] text-sm">Latency</span>
            <span className="text-[var(--text-primary)] font-mono text-sm font-semibold">25.1s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] text-sm">Steps</span>
            <span className="text-[var(--text-primary)] font-mono text-sm font-semibold">6+</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HowVisual04() {
  const sources = [
    { doc: 'mem_9f2a', section: 'long_term · R(t) = 1.00' },
    { doc: 'mem_4c81', section: 'episodic · R(t) = 0.96' },
    { doc: 'mem_7d10', section: 'semantic · R(t) = 1.00' },
  ]
  return (
    <div className="space-y-6">
      <div
        className="border border-[var(--ib-cyan-border)]"
        style={{
          background: 'var(--ib-cyan-tint)',
          boxShadow: 'var(--ib-cyan-glow)',
        }}
      >
        <div className="flex items-center gap-2 p-4 pb-3">
          <CheckCircleIcon className="text-[var(--ib-cyan)] h-4 w-4 shrink-0" />
          <span className="text-[var(--ib-cyan)] text-sm font-semibold">
            Answer · renewal_discount
          </span>
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] m-4 mt-0 p-4">
          <p className="text-sm/[1.7] text-[var(--text-primary)]">
            <span className="block">Acme Corp qualifies for a 15% Scale renewal discount.</span>
            <span className="block">Approved account override in mem_9f2a supersedes</span>
            <span className="block">standard loyalty tier rules for ap-south-1 clusters.</span>
            <span className="block">Confidence: HIGH.</span>
          </p>
        </div>
      </div>

      <div className="border border-[var(--border)] bg-[var(--background-light)]">
        <div className="flex items-center gap-2 p-4 pb-3">
          <DocFileIcon className="text-[var(--text-primary)] h-4 w-4 shrink-0" />
          <span className="text-[var(--text-primary)] text-sm font-semibold">Sources</span>
        </div>
        <div className="border border-[var(--border)] bg-[var(--background)] m-4 mt-0 space-y-3 p-4">
          {sources.map((s) => (
            <div key={s.doc} className="flex items-center justify-between gap-2 whitespace-nowrap">
              <span className="text-[var(--text-primary)] font-mono text-sm">{s.doc}</span>
              <span className="text-[var(--text-secondary)] font-mono text-xs">{s.section}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ttl-governed', 'cited', 'tenant-scoped'].map((tag) => (
          <span
            key={tag}
            className="bg-[var(--background-light)] text-[var(--text-secondary)] border border-[var(--border)] px-2.5 py-0.5 font-mono text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Memory in',
    body: 'SDKs and MCP connectors bring in session chats, events, and documents with no restructuring required. Iceberg embeds in 384d on CPU at ₹0 cost inside ap-south-1 — or runs BYOC in your own cloud.',
    Visual: HowVisual01,
  },
  {
    number: '02',
    title: 'Compiled once',
    body: 'Each write is compiled into four governed tiers — short_term (1h TTL), episodic (30d TTL), long_term, and semantic — indexing HNSW vectors, Okapi BM25 terms, and Ebbinghaus stability once.',
    Visual: HowVisual02,
  },
  {
    number: '03',
    title: 'One recall() call',
    body: 'Agents query through client.recall(): the question, the agent scope, and top_k. One call fuses dense Cosine similarity, BM25 lexical matching, and live retention R(t) without re-retrieval loops.',
    Visual: HowVisual03,
  },
  {
    number: '04',
    title: 'Grounded answers',
    body: 'Every response is cited per memory turn, scored for live Ebbinghaus retention, and isolated to the agent namespace permitted by role-scoped API keys.',
    Visual: HowVisual04,
  },
]

/* ========================================================================== */
/* CUBIC EASE-OUT COUNT-UP BENCHMARK CELL (+ ICEBERG CURSOR SPOTLIGHT)        */
/* ========================================================================== */
function CountUpStatCell({ value, decimals, suffix, label, sub, triggered }) {
  const [displayVal, setDisplayVal] = useState(0)

  useEffect(() => {
    if (!triggered) return undefined
    let raf = null
    const duration = 1400
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = value * eased
      if (progress < 1) {
        setDisplayVal(current)
        raf = requestAnimationFrame(tick)
      } else {
        setDisplayVal(value)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [triggered, value])

  const formatted = decimals > 0 ? displayVal.toFixed(decimals) : String(Math.floor(displayVal))

  return (
    <div
      onMouseMove={trackCardGlow}
      className="group relative overflow-hidden bg-[var(--background-light)] px-6 sm:px-7 py-7"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'var(--ib-spotlight)' }}
      />
      <div
        className={`relative z-10 flex flex-col gap-1.5 transition-opacity duration-500 ${
          triggered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-[var(--text-primary)] tabular-nums text-4xl sm:text-[44px] font-semibold leading-none tracking-[-0.03em]">
          {formatted}
          {suffix}
        </span>
        <span className="text-[var(--ib-cyan)] mt-1 text-sm font-semibold">{label}</span>
        <span className="text-[var(--text-secondary)] text-xs">{sub}</span>
      </div>
    </div>
  )
}

export default function ProductMemory() {
  const [dark, setDark] = useSessionTheme()
  const [heroIdx, setHeroIdx] = useState(2)
  const [heroPaused, setHeroPaused] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [liveTick, setLiveTick] = useState(0)
  const [statsVisible, setStatsVisible] = useState(false)
  const [statTriggered, setStatTriggered] = useState([false, false, false])

  const stepRefs = useRef([])
  const statsRef = useRef(null)
  const [termReplayNonce, setTermReplayNonce] = useState(0)
  const themeQuery = !dark ? '?theme=light' : ''

  // Hero card live auto-cycle
  useEffect(() => {
    if (heroPaused) return undefined
    const id = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % HERO_MEMORY_STATES.length)
    }, 2800)
    return () => clearInterval(id)
  }, [heroPaused])

  // Subtle live tick for sticky How-It-Works diagrams
  useEffect(() => {
    const id = setInterval(() => {
      setLiveTick((t) => (t + 1) % 24)
    }, 1400)
    return () => clearInterval(id)
  }, [])

  // Deterministic viewport-center scroll-spy for sticky 4-step section
  useEffect(() => {
    const updateActiveStep = () => {
      const targetY = window.innerHeight * 0.45
      let bestIdx = 0
      let bestDist = Infinity
      stepRefs.current.forEach((el, idx) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const center = rect.top + rect.height / 2
        const dist = Math.abs(center - targetY)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = idx
        }
      })
      setActiveStep(bestIdx)
    }

    window.addEventListener('scroll', updateActiveStep, { passive: true })
    window.addEventListener('resize', updateActiveStep)
    updateActiveStep()
    return () => {
      window.removeEventListener('scroll', updateActiveStep)
      window.removeEventListener('resize', updateActiveStep)
    }
  }, [])

  // Staggered 140ms count-up trigger on benchmark grid intersection
  useEffect(() => {
    const el = statsRef.current
    if (!el) return undefined
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStatsVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!statsVisible) return undefined
    const timers = BENCHMARK_STATS.map((_, idx) =>
      setTimeout(() => {
        setStatTriggered((prev) => {
          const next = [...prev]
          next[idx] = true
          return next
        })
      }, 140 * idx)
    )
    return () => timers.forEach((t) => clearTimeout(t))
  }, [statsVisible])

  return (
    <div
      className={`ib-mem-page min-h-screen flex flex-col justify-between antialiased transition-colors duration-200 ${
        dark ? 'ib-mem-dark' : 'ib-mem-light'
      }`}
    >
      <style>{`
        .ib-mem-page {
          --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background-color: var(--background);
          color: var(--text-primary);
        }
        .ib-mem-dark {
          --background: #0a0b0d;
          --background-light: #0b0c0f;
          --background-sub: #0d0e12;
          --border: rgba(255, 255, 255, 0.12);
          --text-primary: #ffffff;
          --text-secondary: #a1a1aa;
          --text-tertiary: #71717a;
          --ib-cyan: #00d2ff;
          --ib-cyan-border: rgba(0, 210, 255, 0.45);
          --ib-cyan-tint: rgba(0, 210, 255, 0.045);
          --ib-cyan-soft: rgba(0, 210, 255, 0.095);
          --ib-cyan-glow: 0 0 28px rgba(0, 210, 255, 0.055);
          --ib-royal: #1d6bf3;
          --ib-spotlight: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(0, 210, 255, 0.075), transparent 75%);
        }
        .ib-mem-light {
          --background: #ffffff;
          --background-light: #ffffff;
          --background-sub: #f8fafc;
          --border: rgba(0, 0, 0, 0.1);
          --text-primary: #111827;
          --text-secondary: #52525b;
          --text-tertiary: #71717a;
          --ib-cyan: #0284c7;
          --ib-cyan-border: rgba(2, 132, 199, 0.42);
          --ib-cyan-tint: rgba(2, 132, 199, 0.045);
          --ib-cyan-soft: rgba(2, 132, 199, 0.085);
          --ib-cyan-glow: none;
          --ib-royal: #1d6bf3;
          --ib-spotlight: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(2, 132, 199, 0.055), transparent 75%);
        }

        /* Exact 1220px Container Alignment with Iceberg Navbar & Footer Rails */
        .ib-mem-rail {
          width: 100%;
          max-width: 1220px;
          margin-inline: auto;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }
        /* Guaranteed Inner Separation From Outer Vertical Rail Lines */
        .ib-mem-rail-pad {
          padding-left: 24px;
          padding-right: 24px;
        }
        @media (min-width: 640px) {
          .ib-mem-rail-pad {
            padding-left: 40px;
            padding-right: 40px;
          }
        }
        @media (min-width: 1024px) {
          .ib-mem-rail-pad {
            padding-left: 56px;
            padding-right: 56px;
          }
        }

        /* Standalone 1px Framed Grids Separated From Outer Side-Rails */
        .ib-mem-framed-grid-3 {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          border: 1px solid var(--border);
        }
        .ib-mem-framed-grid-3 > * {
          border-bottom: 1px solid var(--border);
        }
        .ib-mem-framed-grid-3 > :last-child {
          border-bottom: none;
        }
        @media (min-width: 768px) {
          .ib-mem-framed-grid-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .ib-mem-framed-grid-3 > * {
            border-bottom: none;
            border-right: 1px solid var(--border);
          }
          .ib-mem-framed-grid-3 > :nth-child(3n) {
            border-right: none;
          }
        }

        .ib-mem-inner-grid-3 {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .ib-mem-inner-grid-3 > * {
          border-bottom: 1px solid var(--border);
        }
        .ib-mem-inner-grid-3 > :last-child {
          border-bottom: none;
        }
        @media (min-width: 768px) {
          .ib-mem-inner-grid-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .ib-mem-inner-grid-3 > * {
            border-bottom: none;
            border-right: 1px solid var(--border);
          }
          .ib-mem-inner-grid-3 > :nth-child(3n) {
            border-right: none;
          }
        }

        .ib-mem-framed-grid-6 {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          border: 1px solid var(--border);
        }
        .ib-mem-framed-grid-6 > * {
          border-bottom: 1px solid var(--border);
        }
        .ib-mem-framed-grid-6 > :last-child {
          border-bottom: none;
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .ib-mem-framed-grid-6 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .ib-mem-framed-grid-6 > :nth-child(odd) {
            border-right: 1px solid var(--border);
          }
          .ib-mem-framed-grid-6 > :nth-last-child(-n + 2) {
            border-bottom: none;
          }
        }
        @media (min-width: 1024px) {
          .ib-mem-framed-grid-6 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .ib-mem-framed-grid-6 > * {
            border-right: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
          }
          .ib-mem-framed-grid-6 > :nth-child(3n) {
            border-right: none;
          }
          .ib-mem-framed-grid-6 > :nth-last-child(-n + 3) {
            border-bottom: none;
          }
        }

        /* Iceberg 8-Hairline Retracting Crop-Mark Buttons (Exact Match to ProductDatabase) */
        .ib-mem-crop-btn {
          position: relative;
          display: inline-block;
          padding: 6px;
          text-decoration: none;
          cursor: pointer;
        }
        .ib-mem-crop-box {
          display: block;
          padding: 10px 22px;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 500;
          border-width: 1px;
          border-style: solid;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-mem-tick {
          position: absolute;
          pointer-events: none;
          transition: transform 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-mem-tl-h { left: 0; top: 5px; width: 6px; height: 1px; }
        .ib-mem-tl-v { left: 5px; top: 0; width: 1px; height: 6px; }
        .ib-mem-tr-h { right: 0; top: 5px; width: 6px; height: 1px; }
        .ib-mem-tr-v { right: 5px; top: 0; width: 1px; height: 6px; }
        .ib-mem-bl-h { left: 0; bottom: 5px; width: 6px; height: 1px; }
        .ib-mem-bl-v { left: 5px; bottom: 0; width: 1px; height: 6px; }
        .ib-mem-br-h { right: 0; bottom: 5px; width: 6px; height: 1px; }
        .ib-mem-br-v { right: 5px; bottom: 0; width: 1px; height: 6px; }

        .ib-mem-crop-btn:hover .ib-mem-tl-h,
        .ib-mem-crop-btn:hover .ib-mem-bl-h { transform: translate3d(5px, 0, 0); }
        .ib-mem-crop-btn:hover .ib-mem-tr-h,
        .ib-mem-crop-btn:hover .ib-mem-br-h { transform: translate3d(-5px, 0, 0); }
        .ib-mem-crop-btn:hover .ib-mem-tl-v,
        .ib-mem-crop-btn:hover .ib-mem-tr-v { transform: translate3d(0, 5px, 0); }
        .ib-mem-crop-btn:hover .ib-mem-bl-v,
        .ib-mem-crop-btn:hover .ib-mem-br-v { transform: translate3d(0, -5px, 0); }

        /* Primary Royal Blue -> Crisp White on Hover (Dark Mode) */
        .ib-mem-crop-primary-dark .ib-mem-crop-box {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-mem-crop-primary-dark .ib-mem-tick { background-color: #1d6bf3; }
        .ib-mem-crop-primary-dark:hover .ib-mem-crop-box {
          background-color: #ffffff;
          border-color: #ffffff;
          color: #0a0b0d !important;
        }
        .ib-mem-crop-primary-dark:hover .ib-mem-tick { background-color: #ffffff; }

        /* Primary Royal Blue -> Deep Navy on Hover (Light Mode) */
        .ib-mem-crop-primary-light .ib-mem-crop-box {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-mem-crop-primary-light .ib-mem-tick { background-color: #1d6bf3; }
        .ib-mem-crop-primary-light:hover .ib-mem-crop-box {
          background-color: #0f172a;
          border-color: #0f172a;
          color: #ffffff !important;
        }
        .ib-mem-crop-primary-light:hover .ib-mem-tick { background-color: #0f172a; }

        /* Secondary Outlined (Dark Mode) */
        .ib-mem-crop-sec-dark .ib-mem-crop-box {
          background-color: #0b0c0f;
          border-color: rgba(255, 255, 255, 0.16);
          color: #ffffff !important;
        }
        .ib-mem-crop-sec-dark .ib-mem-tick { background-color: #ffffff; }
        .ib-mem-crop-sec-dark:hover .ib-mem-crop-box {
          border-color: #ffffff;
        }

        /* Secondary Outlined (Light Mode) */
        .ib-mem-crop-sec-light .ib-mem-crop-box {
          background-color: #ffffff;
          border-color: rgba(15, 23, 42, 0.16);
          color: #111827 !important;
        }
        .ib-mem-crop-sec-light .ib-mem-tick { background-color: #111827; }
        .ib-mem-crop-sec-light:hover .ib-mem-crop-box {
          border-color: #0f172a;
        }

        /* Bottom Flush CTA Buttons (1:1 Match with ProductDatabase) */
        .ib-mem-cta-solid-dark {
          background-color: #ffffff;
          border: 1px solid #ffffff;
          color: #0a0b0d !important;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-mem-cta-solid-dark:hover {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-mem-cta-solid-light {
          background-color: #0f172a;
          border: 1px solid #0f172a;
          color: #ffffff !important;
          transition: background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-mem-cta-solid-light:hover {
          background-color: #1d6bf3;
          border-color: #1d6bf3;
          color: #ffffff !important;
        }
        .ib-mem-plain-btn-dark {
          background-color: #0a0b0d;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff !important;
          transition: border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-mem-plain-btn-dark:hover {
          border-color: #ffffff;
        }
        .ib-mem-plain-btn-light {
          background-color: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.16);
          color: #111827 !important;
          transition: border-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      background-color 200ms cubic-bezier(0, 0, 0.2, 1),
                      color 200ms cubic-bezier(0, 0, 0.2, 1);
        }
        .ib-mem-plain-btn-light:hover {
          border-color: #0f172a;
        }

        /* Live Gliding Glacial Cyan Bridge Dot */
        .ib-mem-bridge-dot {
          position: absolute;
          top: 50%;
          left: 0;
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background-color: var(--ib-cyan);
          box-shadow: 0 0 10px var(--ib-cyan);
          transform: translate(-50%, -50%);
          animation: ib-mem-glide-dot 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes ib-mem-glide-dot {
          0%   { left: 8%; opacity: 0.25; }
          50%  { left: 50%; opacity: 1; }
          100% { left: 92%; opacity: 0.25; }
        }

        /* Dual-Agent Live Terminal Styles (1px Obsidian Precision + Iceberg Glacial Cyan) */
        .ib-mem-term-root {
          --ib-term-accent: var(--ib-cyan);
        }
        .ib-mem-term-root, .ib-mem-term-root * {
          box-sizing: border-box;
        }
        .ib-mem-term-root .pane.left {
          background: color-mix(in srgb, var(--ib-term-accent) 4%, var(--background-light));
        }
        .ib-mem-term-root .pane.left .stat .v.accent {
          color: var(--ib-term-accent);
        }
        .ib-mem-term-root .pane.right .stat .v.accent {
          color: var(--text-primary);
        }
        .ib-mem-term-root .stat .v.bump {
          animation: ib-mem-term-bump 0.35s ease-out;
        }
        @keyframes ib-mem-term-bump {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .ib-mem-term-root .body {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 16px 20px 32px;
          scroll-behavior: smooth;
        }
        .ib-mem-term-root .body::-webkit-scrollbar { width: 8px; }
        .ib-mem-term-root .body::-webkit-scrollbar-thumb {
          background: rgba(127, 127, 127, 0.25);
          border-radius: 4px;
        }
        .ib-mem-term-root .header {
          font-family: var(--font-mono);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .ib-mem-term-root .line {
          margin-bottom: 2px;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .ib-mem-term-root .prompt-symbol {
          font-weight: 700;
          color: var(--text-tertiary);
        }
        .ib-mem-term-root .user-input {
          font-weight: 600;
        }
        .ib-mem-term-root .cursor {
          display: inline-block;
          width: 7px;
          height: 14px;
          vertical-align: text-bottom;
          margin-left: 2px;
          background: var(--text-primary);
          animation: ib-mem-term-blink 1s step-end infinite;
        }
        .ib-mem-term-root .cursor.done {
          animation: none;
          opacity: 0;
        }
        @keyframes ib-mem-term-blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
        .ib-mem-term-root .tool-call {
          margin: 12px 0;
          padding: 16px;
          border: 1px solid var(--border);
          background: var(--background);
        }
        .ib-mem-term-root .pane.left .tool-call {
          border-color: color-mix(in srgb, var(--ib-term-accent) 30%, var(--border));
          background: color-mix(in srgb, var(--ib-term-accent) 6%, var(--background));
        }
        .ib-mem-term-root .pane.right .tool-call {
          background: color-mix(in srgb, var(--text-secondary) 6%, var(--background));
        }
        .ib-mem-term-root .tool-call .tc-head {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.8125rem;
          color: var(--text-primary);
        }
        .ib-mem-term-root .tool-call .tc-args {
          font-family: var(--font-mono);
          margin-top: 4px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }
        .ib-mem-term-root .tool-call .tc-result {
          font-family: var(--font-mono);
          margin-top: 6px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }
        .ib-mem-term-root .tool-call .tc-result .chunks,
        .ib-mem-term-root .tool-call .tc-result .toks {
          color: var(--text-primary);
          font-weight: 600;
        }
        .ib-mem-term-root .thinking {
          margin: 8px 0;
          color: var(--text-secondary);
        }
        .ib-mem-term-root .thinking .arrow {
          margin-right: 4px;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .ib-mem-term-root .response {
          margin-top: 14px;
          white-space: pre-wrap;
          word-break: break-word;
          font-weight: 500;
        }
        .ib-mem-term-root .json-block {
          font-family: var(--font-mono);
          margin: 8px 0;
          padding: 16px;
          background: var(--background);
          border: 1px solid var(--border);
          font-size: 0.8125rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
          color: var(--text-primary);
        }
        .ib-mem-term-root .tool-call .json-block {
          margin: 4px 0;
          padding: 8px 0 4px;
          background: transparent;
          border: none;
        }
        .ib-mem-term-root .json-block .j-key   { color: var(--ib-term-accent); font-weight: 600; }
        .ib-mem-term-root .json-block .j-str   { color: var(--text-primary); }
        .ib-mem-term-root .json-block .j-num   { color: var(--text-primary); font-weight: 600; }
        .ib-mem-term-root .json-block .j-bool  { color: var(--ib-term-accent); font-weight: 600; }
        .ib-mem-term-root .json-block .j-punct { color: var(--text-tertiary); }
        .ib-mem-term-root .json-block .j-ref   { color: var(--text-secondary); font-style: italic; }
        .ib-mem-term-root .muted { color: var(--text-tertiary); }
        .ib-mem-term-root .dim   { opacity: 0.7; }
      `}</style>

      <Navbar dark={dark} setDark={setDark} />

      <main className="flex-1">
        {/* ================================================================== */}
        {/* SECTION 1: HERO (CONTINUOUS 1220PX RAIL + ICEBERG TYPOGRAPHY/CTA)  */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-mem-rail ib-mem-rail-pad py-12 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">
              <div className="lg:col-span-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 text-[var(--ib-cyan)]">
                  ICEBERG AGENT MEMORY
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-semibold tracking-[-0.025em] leading-[1.08] mb-5 text-[var(--text-primary)]">
                  The <span className="text-[var(--ib-cyan)]">cognitive memory</span> engine for agents
                </h1>

                <p className="text-[15.5px] leading-[1.6] max-w-[490px] mb-8 text-[var(--text-secondary)]">
                  Compiles session context, episodic events, and user preferences into governed
                  memory once, then serves it on every call. Agents get more accurate, faster,
                  lower cost, and trusted answers.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <MemoryCropButton
                    href={`${D}/signup${themeQuery}`}
                    variant="primary"
                    dark={dark}
                  >
                    Create Memory
                  </MemoryCropButton>

                  <MemoryCropButton to="/docs" variant="secondary" dark={dark}>
                    View Docs
                  </MemoryCropButton>
                </div>
              </div>

              <div className="lg:col-span-6 w-full">
                <HeroMemoryShowcase
                  activeIdx={heroIdx}
                  setActiveIdx={setHeroIdx}
                  setPaused={setHeroPaused}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 2: DUAL-AGENT LIVE TERMINAL (INSET STANDALONE FRAME)       */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-mem-rail ib-mem-rail-pad py-12 sm:py-16">
            <div className="mb-7 sm:mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl sm:text-[28px] lg:text-[31px]/[1.2] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                More accurate, faster, lower cost, and{' '}
                <span className="text-[var(--ib-cyan)]">trusted memory</span> for agents
              </h2>
              <button
                type="button"
                onClick={() => setTermReplayNonce((n) => n + 1)}
                className="border border-[var(--border)] bg-[var(--background-light)] hover:border-[var(--text-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer shrink-0"
                title="Replay live comparison"
              >
                ↻ Replay
              </button>
            </div>

            <DualAgentTerminal replayNonce={termReplayNonce} />
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 3: STICKY 4-STEP "HOW IT WORKS" (INSET FRAMED STAGE)       */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-mem-rail ib-mem-rail-pad py-14 sm:py-20">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
              {/* Left Scrolling Narrative Column */}
              <div className="w-full lg:w-5/12">
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-8">
                  HOW IT WORKS
                </div>

                {HOW_IT_WORKS_STEPS.map((step, idx) => {
                  const isActive = idx === activeStep
                  const StepVisual = step.Visual
                  return (
                    <div
                      key={step.number}
                      ref={(el) => {
                        stepRefs.current[idx] = el
                      }}
                      onClick={() => {
                        setActiveStep(idx)
                        stepRefs.current[idx]?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        })
                      }}
                      className={`${
                        idx > 0 ? 'lg:min-h-[54vh]' : 'lg:min-h-[42vh]'
                      } flex flex-col justify-center py-8 cursor-pointer`}
                    >
                      <span
                        className={`mb-2.5 block font-mono text-xs font-semibold tracking-[0.18em] transition-colors duration-300 ${
                          isActive
                            ? 'text-[var(--ib-cyan)]'
                            : 'text-[var(--ib-cyan)] lg:text-[var(--text-tertiary)]'
                        }`}
                      >
                        {step.number}
                      </span>
                      <h3
                        className={`text-xl/[1.2] font-semibold md:text-2xl/[1.18] tracking-[-0.02em] transition-colors duration-300 ${
                          isActive
                            ? 'text-[var(--text-primary)]'
                            : 'text-[var(--text-primary)] lg:text-[var(--text-secondary)]'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`mt-2.5 text-[14.5px]/[1.6] max-w-sm transition-colors duration-300 ${
                          isActive
                            ? 'text-[var(--text-secondary)]'
                            : 'text-[var(--text-secondary)] lg:opacity-50'
                        }`}
                      >
                        {step.body}
                      </p>

                      {/* Mobile Inline Visual */}
                      <div className="block lg:hidden mt-5">
                        <StepVisual liveTick={liveTick} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right Sticky Crossfading Visual Stage (Detached Standalone Box) */}
              <div className="hidden lg:block lg:w-7/12 self-stretch">
                <div className="sticky top-24 py-4">
                  <div className="border border-[var(--border)] bg-[var(--background-light)] p-6 xl:p-7">
                    <div className="relative w-full min-h-[345px]">
                      {HOW_IT_WORKS_STEPS.map((step, idx) => {
                        const isActive = idx === activeStep
                        const StepVisual = step.Visual
                        return (
                          <div
                            key={step.number}
                            aria-hidden={!isActive}
                            className={`absolute inset-0 flex flex-col justify-center transition-all duration-500 ease-out ${
                              isActive
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-4 pointer-events-none'
                            }`}
                          >
                            <StepVisual liveTick={liveTick} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 4: BENCHMARK STATS + 3 WORKLOAD CARDS (INSET FRAMED BOX)   */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-mem-rail ib-mem-rail-pad py-14 sm:py-20">
            <div className="mb-8 sm:mb-9">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-2.5">
                VERIFIED BENCHMARKS
              </div>
              <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--text-primary)] max-w-2xl">
                The results hold across{' '}
                <span className="text-[var(--ib-cyan)]">agent workloads</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-[1.6] mt-3 max-w-2xl">
                Iceberg Memory was benchmarked against iterative agentic RAG across three
                production workloads in ap-south-1. The latency and token savings held across
                every domain.
              </p>
            </div>

            <div className="border border-[var(--border)] bg-[var(--background-light)]">
              <div ref={statsRef} className="ib-mem-inner-grid-3">
                {BENCHMARK_STATS.map((stat, idx) => (
                  <CountUpStatCell
                    key={stat.label}
                    {...stat}
                    triggered={statTriggered[idx]}
                  />
                ))}
              </div>

              <div className="ib-mem-inner-grid-3 border-t border-[var(--border)]">
                {WORKLOAD_BENCHMARKS.map((card) => (
                  <article
                    key={card.domain}
                    onMouseMove={trackCardGlow}
                    className="group relative overflow-hidden bg-[var(--background-light)] flex flex-col px-6 sm:px-7 py-6"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'var(--ib-spotlight)' }}
                    />
                    <div className="relative z-10 flex flex-col flex-1">
                      <p className="text-[var(--text-primary)] text-[15px] font-semibold">
                        {card.domain}
                      </p>
                      <p className="text-[var(--text-secondary)] mt-1 text-xs/[1.5]">
                        {card.corpus}
                      </p>
                      <dl className="mt-5 space-y-2.5">
                        {card.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-2.5 last:border-b-0 last:pb-0"
                          >
                            <dt className="text-[var(--text-secondary)] text-xs">{m.label}</dt>
                            <dd className="text-[var(--text-primary)] shrink-0 font-mono text-[13px] font-semibold tabular-nums">
                              {m.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </article>
                ))}
              </div>

              <div className="border-t border-[var(--border)] bg-[var(--background-sub)] px-6 sm:px-7 py-4">
                <p className="text-[var(--text-tertiary)] font-mono text-[11.5px] leading-relaxed">
                  Iceberg Memory v1.0.0 benchmarked in AWS ap-south-1 (Mumbai) using 384d ONNX CPU
                  embeddings + Okapi BM25 Reciprocal Rank Fusion against multi-step agentic RAG loops.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 5: RECALL & DECAY PRIMITIVES (INSET FRAMED 6-CARD GRID)    */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-mem-rail ib-mem-rail-pad py-14 sm:py-20">
            <div className="mb-8 sm:mb-9">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-2.5">
                MEMORY PRIMITIVES
              </div>
              <h2 className="text-2xl sm:text-[34px] lg:text-[36px] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--text-primary)]">
                Recall &amp; Decay
              </h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-[1.6] mt-3 max-w-3xl">
                Every application built its own session cache and prompt-stuffing loop before
                cognitive memory existed. Agents are at that same point now. Iceberg gives them
                a shared interface for structured, retention-weighted memory in a single call.
              </p>
            </div>

            <div className="ib-mem-framed-grid-6">
              {RECALL_PRIMITIVES.map((item) => (
                <article
                  key={item.tag}
                  onMouseMove={trackCardGlow}
                  className="group relative overflow-hidden bg-[var(--background-light)] flex flex-col px-6 sm:px-7 py-6"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'var(--ib-spotlight)' }}
                  />
                  {/* Left Laser Indicator Bar */}
                  <div className="w-[2px] h-4 transition-all duration-200 group-hover:h-7 absolute left-0 top-6 bg-[var(--border)]" />
                  <div
                    className="w-[2px] h-7 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-6 bg-[var(--ib-cyan)]"
                    style={{ boxShadow: '0 0 12px rgba(0, 210, 255, 0.8)' }}
                  />

                  <div className="relative z-10">
                    <p className="text-[var(--ib-cyan)] text-[13px] font-mono font-semibold uppercase tracking-[0.18em]">
                      {item.tag}
                    </p>
                    <p className="text-[var(--text-secondary)] mt-2.5 text-[13.5px]/[1.6]">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 6: INSET FRAMED 3-COLUMN BOTTOM CTA                        */}
        {/* ================================================================== */}
        <section className="border-b border-[var(--border)]">
          <div className="ib-mem-rail ib-mem-rail-pad py-12 sm:py-16">
            <div className="border border-[var(--border)] bg-[var(--background-light)] grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 px-6 sm:px-8 py-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex items-center">
                <h2 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] leading-snug text-[var(--text-primary)]">
                  Trusted memory for
                  <br />
                  <span className="text-[var(--ib-cyan)]">production agents</span>
                </h2>
              </div>

              <div className="lg:col-span-5 px-6 sm:px-8 py-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex items-center">
                <p className="text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
                  Every answer traces back to a memory turn your agent stored, ranked by live
                  retention and hosted 100% in India (ap-south-1) with 100,000 free vectors.
                </p>
              </div>

              <div className="lg:col-span-2 p-5 flex flex-col justify-center gap-2.5">
                <a
                  href={`${D}/signup${themeQuery}`}
                  className={`w-full py-2.5 px-4 text-center text-[13.5px] font-medium no-underline ${
                    dark ? 'ib-mem-cta-solid-dark' : 'ib-mem-cta-solid-light'
                  }`}
                >
                  Start building
                </a>
                <Link
                  to="/contact"
                  className={`w-full py-2.5 px-4 text-center text-[13.5px] font-medium no-underline ${
                    dark ? 'ib-mem-plain-btn-dark' : 'ib-mem-plain-btn-light'
                  }`}
                >
                  Get a demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer dark={dark} />
    </div>
  )
}
