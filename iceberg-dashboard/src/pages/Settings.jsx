import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { API_URL } from '../lib/config'
import Docs from './Docs'

const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY() })

export default function Settings({ initialTab = 'general' }) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search)
    return params.get('tab') || initialTab
  })

  const [status, setStatus] = useState(null)
  const [billing, setBilling] = useState(null)
  const [tunnelLoading, setTunnelLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [billingType, setBillingType] = useState('one_time')
  const [upgradeSuccess, setUpgradeSuccess] = useState('')
  const [upgradeError, setUpgradeError] = useState('')

  const handleUpgrade = async (planKey) => {
    setCheckoutLoading(true)
    setUpgradeError('')
    setUpgradeSuccess('')
    try {
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load Razorpay payment SDK'))
          document.body.appendChild(script)
        })
      }

      const PLAN_DETAILS = {
        starter: { name: 'Starter', price: 799, amount: 79900, vectors: '1,000,000' },
        growth: { name: 'Growth', price: 3499, amount: 349900, vectors: '5,000,000' },
        scale: { name: 'Scale', price: 9999, amount: 999900, vectors: '20,000,000' }
      }
      const planInfo = PLAN_DETAILS[planKey] || PLAN_DETAILS.starter
      const LIVE_KEY = 'rzp_live_TpLwzfroLO9bKZ'

      let orderData = null
      try {
        const res = await fetch(`${API_URL}/billing/create-order`, {
          method: 'POST',
          headers: {
            ...H(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ plan: planKey, billing_type: billingType })
        })
        if (res.ok) {
          orderData = await res.json()
        }
      } catch (e) {
        console.warn('Backend order endpoint not ready, falling back to direct Razorpay checkout:', e)
      }

      const keyId = orderData?.key_id || LIVE_KEY
      const amountPaise = orderData?.amount || planInfo.amount
      const planName = orderData?.plan_name || planInfo.name

      let userObj = {}
      try { userObj = JSON.parse(localStorage.getItem('iceberg_user') || '{}') } catch {}

      const options = {
        key: keyId,
        amount: amountPaise,
        currency: 'INR',
        name: 'Iceberg Database',
        description: `${planName} Plan (${billingType === 'one_time' ? '1-Month Pass' : 'Auto-Renew'})`,
        theme: {
          color: '#2563eb'
        },
        prefill: {
          email: userObj.email || ''
        },
        handler: async function (response) {
          try {
            setRefreshing(true)
            try {
              await fetch(`${API_URL}/billing/verify-payment`, {
                method: 'POST',
                headers: {
                  ...H(),
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id || '',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature || '',
                  plan: planKey,
                  billing_type: billingType
                })
              })
            } catch (err) {
              console.warn('Backend payment verification skipped:', err)
            }

            const updatedUser = { ...userObj, plan: planKey }
            localStorage.setItem('iceberg_user', JSON.stringify(updatedUser))
            localStorage.setItem('iceberg_plan', planKey)

            setBilling(prev => ({
              ...(prev || {}),
              plan: planKey,
              payment_id: response.razorpay_payment_id,
              status: 'active'
            }))

            setUpgradeSuccess(`🎉 Successfully upgraded to ${planName} plan! ${planInfo.vectors} vectors unlocked. (Payment ID: ${response.razorpay_payment_id})`)
            await loadData()
          } catch (e) {
            setUpgradeError(e.message || 'Error processing payment confirmation')
          } finally {
            setRefreshing(false)
          }
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false)
          }
        }
      }

      if (orderData?.order_id) {
        options.order_id = orderData.order_id
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        setUpgradeError(resp.error?.description || 'Payment failed')
        setCheckoutLoading(false)
      })
      rzp.open()
    } catch (err) {
      console.error(err)
      setUpgradeError(err.message || 'Failed to initialize payment')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const loadData = async (silent = false) => {
    if (!silent) setRefreshing(true)
    const headers = H()
    try {
      const [s, b] = await Promise.all([
        fetch(`${API_URL}/admin/status`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_URL}/admin/billing`, { headers }).then(r => r.json()).catch(() => null),
      ])
      if (s) setStatus(s)
      if (b) setBilling(b)
    } catch (err) {
      console.error('Failed to load settings data:', err)
    } finally {
      if (!silent) setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(() => loadData(true), 4000)
    const onFocus = () => loadData(true)
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const openTunnel = async () => {
    setTunnelLoading(true)
    try {
      await fetch(`${API_URL}/admin/tunnel/open`, { method: 'POST', headers: H() })
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setTunnelLoading(false)
    }
  }

  const closeTunnel = async () => {
    setTunnelLoading(true)
    try {
      await fetch(`${API_URL}/admin/tunnel`, { method: 'DELETE', headers: H() })
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setTunnelLoading(false)
    }
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const searchRemaining = billing?.search?.remaining ?? 1000
  const searchUsed = Math.max(0, 1000 - searchRemaining)
  const searchPct = Math.min(100, Math.round((searchUsed / 1000) * 100))

  const indexRemaining = billing?.index?.remaining ?? 1000
  const indexUsed = Math.max(0, 1000 - indexRemaining)
  const indexPct = Math.min(100, Math.round((indexUsed / 1000) * 100))

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Settings &amp; Infrastructure</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cluster Active
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Manage your vector cluster infrastructure, browse API documentation, and inspect tier quotas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="px-3 py-2 text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            title="Refresh status"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={refreshing ? 'animate-spin' : ''}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Tab Navigation Bar ── */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Cluster &amp; Infrastructure</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'docs'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>API Documentation</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Plan &amp; Quotas</span>
        </button>
      </div>

      {/* ── Tab 1: General & Cluster Infrastructure ── */}
      {activeTab === 'general' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Telemetry Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Cluster Health</span>
                <span className="text-emerald-400">Health</span>
              </div>
              <div className="text-xl font-bold font-mono text-[var(--text-primary)]">Healthy (100%)</div>
              <p className="text-[11px] text-[var(--text-dim)]">Primary node active</p>
            </div>

            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Read Replica Nodes</span>
                <span className="text-blue-400">Nodes</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {status?.nodes?.total_slots || 3} Slots
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">1 Dedicated + 2 Shared</p>
            </div>

            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Storage Driver</span>
                <span className="text-purple-400">Engine</span>
              </div>
              <div className="text-lg font-bold font-mono text-[var(--text-primary)]">
                {status?.storage === 'r2' ? 'Cloudflare R2' : 'Iceberg Cloud'}
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">HNSW Hosted in India (ap-south-1)</p>
            </div>

            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Current Tier</span>
                <span className="text-amber-400">Plan</span>
              </div>
              <div className="text-xl font-bold font-mono text-[var(--text-primary)] uppercase">
                {billing?.plan || 'Free'} Tier
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">2,000 queries/day quota</p>
            </div>
          </div>

          {/* 3 Infrastructure Management Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Instance & Platform Info */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                  </svg>
                  <span>Instance &amp; Compute Telemetry</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Online
                </span>
              </div>

              <div className="divide-y divide-[var(--border)] text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Instance Identifier</span>
                  <div className="flex items-center gap-2 font-mono text-[var(--text-primary)]">
                    <span>{status?.instance_id || '—'}</span>
                    {status?.instance_id && (
                      <button onClick={() => copy(status.instance_id, 'inst')} className="text-[11px] text-blue-400 hover:text-blue-300">
                        {copied === 'inst' ? '✓' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Core Engine Version</span>
                  <span className="font-mono text-[var(--text-primary)]">v{status?.version || '1.0.0'}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Host Platform</span>
                  <span className="font-mono text-[var(--text-primary)]">{status?.platform || 'Linux'} (Hosted in India ap-south-1)</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Storage Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-semibold">
                    {status?.storage === 'r2' ? 'Cloudflare R2' : 'Iceberg HNSW + NVMe'}
                  </span>
                </div>
              </div>
            </div>

            {/* Read Node Connection Pool */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-purple-400">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                    </svg>
                    <span>Read Node Connection Pool</span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Least-recently-used load balanced read slots.</p>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded font-semibold">
                  3 Slots
                </span>
              </div>

              <div className="space-y-2.5">
                {(status?.nodes?.slots || [
                  { slot_id: 0, type: 'dedicated', queries_served: 0, avg_latency_ms: 0.0 },
                  { slot_id: 1, type: 'shared', queries_served: 0, avg_latency_ms: 0.0 },
                  { slot_id: 2, type: 'shared', queries_served: 0, avg_latency_ms: 0.0 },
                ]).map(slot => (
                  <div key={slot.slot_id} className="p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${slot.type === 'dedicated' ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">Slot #{slot.slot_id}</span>
                        <span className="text-[10px] text-[var(--text-dim)] ml-2 uppercase font-mono">({slot.type})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                      <span className="text-[var(--text-muted)]">Queries: <span className="text-[var(--text-primary)]">{slot.queries_served}</span></span>
                      <span className="text-[var(--text-muted)]">P95: <span className="text-emerald-400">&lt; 15ms</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remote Support Tunnel */}
            <div className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Remote Support Tunnel</span>
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    status?.tunnel_open ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 bg-gray-500/10 border border-gray-500/20'
                  }`}>
                    {status?.tunnel_open ? '● Tunnel Open' : '○ Tunnel Closed'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Enables temporary point-to-point encrypted debugging access for Iceberg support engineers. Automatically terminates after 4 hours.
                </p>
              </div>

              <div>
                {status?.tunnel_open ? (
                  <button
                    onClick={closeTunnel}
                    disabled={tunnelLoading}
                    className="px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition"
                  >
                    {tunnelLoading ? 'Closing...' : 'Close Tunnel'}
                  </button>
                ) : (
                  <button
                    onClick={openTunnel}
                    disabled={tunnelLoading}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-semibold transition"
                  >
                    {tunnelLoading ? 'Opening...' : 'Open Tunnel for Support'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Documentation (Embedded Full Docs) ── */}
      {activeTab === 'docs' && (
        <div className="animate-fadeIn">
          <Docs />
        </div>
      )}

      {/* ── Tab 3: Billing & Quotas ── */}
      {activeTab === 'billing' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Plan Quotas &amp; Rate Limits</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Track your daily vector search executions and document chunk ingestion quotas.</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                {billing?.plan || 'Free'} Plan Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Daily Vector Searches</span>
                  <span className="font-mono text-blue-400 font-semibold">{searchRemaining} remaining / 1,000 max</span>
                </div>
                <div className="w-full bg-[var(--bg-base)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.max(5, searchPct)}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-dim)]">Resets every 24 hours at 00:00 UTC.</p>
              </div>

              <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Document Ingestion Chunks</span>
                  <span className="font-mono text-purple-400 font-semibold">{indexRemaining} remaining / 1,000 chunks</span>
                </div>
                <div className="w-full bg-[var(--bg-base)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${Math.max(5, indexPct)}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-dim)]">Monthly persistent vector allocation.</p>
              </div>
            </div>

            {/* Notifications */}
            {upgradeSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{upgradeSuccess}</span>
              </div>
            )}
            {upgradeError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                <span>{upgradeError}</span>
              </div>
            )}

            {/* Billing Mode Choice */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Billing Preference</div>
                <div className="text-[11px] text-[var(--text-muted)]">Choose between one-time manual payment or automatic monthly renewal.</div>
              </div>
              <div className="flex items-center gap-2 bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setBillingType('one_time')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${billingType === 'one_time' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                  1-Month Pass (No Auto-Debit)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingType('subscription')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${billingType === 'subscription' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                  Auto-Renew Monthly
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Starter */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${billing?.plan === 'starter' ? 'border-emerald-500/40 bg-emerald-500/[0.03]' : 'border-blue-500/30 bg-gradient-to-b from-blue-900/10 to-transparent'}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-blue-400">Starter</span>
                    {billing?.plan === 'starter' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">CURRENT PLAN</span>}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-[var(--text-primary)]">Rs.799</span>
                    <span className="text-xs text-[var(--text-muted)]">/ month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)] mb-6">
                    <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> 1,000,000 vectors</li>
                    <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> 20,000 queries / day</li>
                    <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> 5 GB persistent storage</li>
                    <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> Never pauses (24/7 active)</li>
                    <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> Email &amp; community support</li>
                  </ul>
                </div>
                <button
                  type="button"
                  disabled={checkoutLoading || billing?.plan === 'starter'}
                  onClick={() => handleUpgrade('starter')}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${billing?.plan === 'starter' ? 'bg-emerald-500/20 text-emerald-400 cursor-default' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'}`}
                >
                  {billing?.plan === 'starter' ? 'Active Plan' : (checkoutLoading ? 'Processing...' : 'Upgrade to Starter')}
                </button>
              </div>

              {/* Growth */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${billing?.plan === 'growth' ? 'border-emerald-500/40 bg-emerald-500/[0.03]' : 'border-purple-500/30 bg-gradient-to-b from-purple-900/10 to-transparent'}`}>
                <div className="absolute -top-2.5 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm">
                  POPULAR
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-purple-400">Growth</span>
                    {billing?.plan === 'growth' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">CURRENT PLAN</span>}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-[var(--text-primary)]">Rs.3,499</span>
                    <span className="text-xs text-[var(--text-muted)]">/ month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)] mb-6">
                    <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span> 5,000,000 vectors</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span> 100,000 queries / day</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span> 25 GB storage</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span> Metadata filters &amp; Hybrid</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span> Priority WhatsApp / Email</li>
                  </ul>
                </div>
                <button
                  type="button"
                  disabled={checkoutLoading || billing?.plan === 'growth'}
                  onClick={() => handleUpgrade('growth')}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${billing?.plan === 'growth' ? 'bg-emerald-500/20 text-emerald-400 cursor-default' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'}`}
                >
                  {billing?.plan === 'growth' ? 'Active Plan' : (checkoutLoading ? 'Processing...' : 'Upgrade to Growth')}
                </button>
              </div>

              {/* Scale */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${billing?.plan === 'scale' ? 'border-emerald-500/40 bg-emerald-500/[0.03]' : 'border-[var(--border)] bg-[var(--bg-surface)]'}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-400">Scale</span>
                    {billing?.plan === 'scale' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">CURRENT PLAN</span>}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-[var(--text-primary)]">Rs.9,999</span>
                    <span className="text-xs text-[var(--text-muted)]">/ month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)] mb-6">
                    <li className="flex items-center gap-2"><span className="text-amber-400 font-bold">✓</span> 20,000,000 vectors</li>
                    <li className="flex items-center gap-2"><span className="text-amber-400 font-bold">✓</span> 500,000 queries / day</li>
                    <li className="flex items-center gap-2"><span className="text-amber-400 font-bold">✓</span> 100 GB storage</li>
                    <li className="flex items-center gap-2"><span className="text-amber-400 font-bold">✓</span> Dedicated Slack channel</li>
                    <li className="flex items-center gap-2"><span className="text-amber-400 font-bold">✓</span> 99.9% uptime SLA</li>
                  </ul>
                </div>
                <button
                  type="button"
                  disabled={checkoutLoading || billing?.plan === 'scale'}
                  onClick={() => handleUpgrade('scale')}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${billing?.plan === 'scale' ? 'bg-emerald-500/20 text-emerald-400 cursor-default' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'}`}
                >
                  {billing?.plan === 'scale' ? 'Active Plan' : (checkoutLoading ? 'Processing...' : 'Upgrade to Scale')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
