import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_URL } from '../lib/config'
import { api, getTenantPrefix } from '../lib/api'
import Docs from './Docs'

const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

function getDeterministicProjectUuid(prefix) {
  const stored = localStorage.getItem('iceberg_project_id')
  if (stored && stored.length >= 20 && stored.includes('-')) return stored
  const seed = `${prefix || 'default'}_iceberg_proj_2026`
  let h1 = 0x2fadd29f
  let h2 = 0xa46446ba
  let h3 = 0xafef3e57
  let h4 = 0xcddbe364
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761) >>> 0
    h2 = Math.imul(h2 ^ (c + i), 1597334677) >>> 0
    h3 = Math.imul(h3 ^ (c * 3), 2246822507) >>> 0
    h4 = Math.imul(h4 ^ (c * 7), 3266489909) >>> 0
  }
  const hex = (
    h1.toString(16).padStart(8, '0') +
    h2.toString(16).padStart(8, '0') +
    h3.toString(16).padStart(8, '0') +
    h4.toString(16).padStart(8, '0')
  )
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function getCurrentUserProfile() {
  try {
    const u = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
    const email = u.email || 'founder@icebergdb.in'
    const name =
      u.name ||
      u.displayName ||
      (email === 'uniquegamerz267@gmail.com'
        ? 'UNIQUE_ GAMER_Z'
        : email.split('@')[0].toUpperCase())
    return { name, email, plan: u.plan || localStorage.getItem('iceberg_plan') || 'free' }
  } catch {
    return { name: 'UNIQUE_ GAMER_Z', email: 'founder@icebergdb.in', plan: 'free' }
  }
}

export default function Settings({ initialTab = 'configuration' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const prefix = getTenantPrefix()
  const userProfile = getCurrentUserProfile()

  const resolveTab = (searchStr) => {
    const params = new URLSearchParams(searchStr)
    const raw = params.get('tab') || initialTab || 'configuration'
    if (raw === 'general') return 'configuration'
    return raw
  }

  const [activeTab, setActiveTab] = useState(() => resolveTab(location.search))

  useEffect(() => {
    setActiveTab(resolveTab(location.search))
  }, [location.search])

  const switchTab = (tabId) => {
    setActiveTab(tabId)
    navigate(`/settings?tab=${tabId}`, { replace: true })
  }

  // ── Shared Telemetry & Billing State ──
  const [status, setStatus] = useState(null)
  const [billing, setBilling] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (text, type = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3500)
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 1800)
  }

  // ── 1. CONFIGURATION STATE ──
  const projectId = getDeterministicProjectUuid(prefix)
  const [projectName, setProjectName] = useState(() => {
    return localStorage.getItem(`iceberg_proj_name_${prefix}`) || 'Default'
  })
  const [savedProjectName, setSavedProjectName] = useState(() => {
    return localStorage.getItem(`iceberg_proj_name_${prefix}`) || 'Default'
  })
  const [tags, setTags] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`iceberg_proj_tags_${prefix}`) || '[]')
    } catch {
      return []
    }
  })
  const [showAddTagModal, setShowAddTagModal] = useState(false)
  const [newTagKey, setNewTagKey] = useState('')
  const [newTagVal, setNewTagVal] = useState('')
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false)
  const [deletingAllIndexes, setDeletingAllIndexes] = useState(false)

  const handleSaveProjectName = () => {
    const clean = projectName.trim() || 'Default'
    setProjectName(clean)
    setSavedProjectName(clean)
    localStorage.setItem(`iceberg_proj_name_${prefix}`, clean)
    showToast(`Project name updated to "${clean}".`)
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (!newTagKey.trim()) return
    const next = [
      ...tags.filter((t) => t.key !== newTagKey.trim()),
      { key: newTagKey.trim(), value: newTagVal.trim() || 'true' },
    ]
    setTags(next)
    localStorage.setItem(`iceberg_proj_tags_${prefix}`, JSON.stringify(next))
    setNewTagKey('')
    setNewTagVal('')
    setShowAddTagModal(false)
    showToast('Project tag saved.')
  }

  const handleRemoveTag = (keyToRemove) => {
    const next = tags.filter((t) => t.key !== keyToRemove)
    setTags(next)
    localStorage.setItem(`iceberg_proj_tags_${prefix}`, JSON.stringify(next))
  }

  const handleDeleteAllIndexes = async () => {
    setDeletingAllIndexes(true)
    try {
      const colRes = await api.getCollections()
      const cols = colRes?.collections || []
      await Promise.all(cols.map((c) => api.deleteCollection(c).catch(() => {})))
      setShowDeleteProjectModal(false)
      showToast(
        cols.length > 0
          ? `Deleted ${cols.length} index(es) from ${savedProjectName}.`
          : `No indexes to delete in ${savedProjectName}.`
      )
    } catch {
      showToast('Failed to delete project indexes.', 'error')
    } finally {
      setDeletingAllIndexes(false)
    }
  }

  // ── 2. ACCESS (RBAC & TEAM MEMBERS) STATE ──
  const [members, setMembers] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`iceberg_proj_members_${prefix}`) || 'null')
      if (Array.isArray(stored) && stored.length > 0) return stored
    } catch {}
    return [
      {
        id: 'owner_primary',
        name: userProfile.name,
        email: userProfile.email,
        role: 'Project Owner',
        permissions: 'All',
        addedOn: new Date().toLocaleDateString('en-US'),
        isOwner: true,
      },
    ]
  })
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('Project Editor')
  const [openMemberMenuId, setOpenMemberMenuId] = useState(null)
  const memberMenuRef = useRef(null)

  const handleInviteMember = (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    const cleanEmail = inviteEmail.trim().toLowerCase()
    const displayName = inviteName.trim() || cleanEmail.split('@')[0]
    const permLabel =
      inviteRole === 'Project Owner'
        ? 'All'
        : inviteRole === 'Project Editor'
        ? 'Read & Write'
        : 'Read Only'
    const newMember = {
      id: `mem_${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      role: inviteRole,
      permissions: permLabel,
      addedOn: new Date().toLocaleDateString('en-US'),
      isOwner: false,
    }
    const next = [...members, newMember]
    setMembers(next)
    localStorage.setItem(`iceberg_proj_members_${prefix}`, JSON.stringify(next))
    setInviteEmail('')
    setInviteName('')
    setInviteRole('Project Editor')
    setShowInviteModal(false)
    showToast(`Invited ${cleanEmail} as ${inviteRole}.`)
  }

  const handleRemoveMember = (id) => {
    const next = members.filter((m) => m.id !== id)
    setMembers(next)
    localStorage.setItem(`iceberg_proj_members_${prefix}`, JSON.stringify(next))
    setOpenMemberMenuId(null)
    showToast('Team member removed.')
  }

  const handleCycleMemberRole = (member) => {
    const roles = ['Project Owner', 'Project Editor', 'Project Viewer']
    const nextRole = roles[(roles.indexOf(member.role) + 1) % roles.length]
    const permLabel =
      nextRole === 'Project Owner'
        ? 'All'
        : nextRole === 'Project Editor'
        ? 'Read & Write'
        : 'Read Only'
    const next = members.map((m) =>
      m.id === member.id ? { ...m, role: nextRole, permissions: permLabel } : m
    )
    setMembers(next)
    localStorage.setItem(`iceberg_proj_members_${prefix}`, JSON.stringify(next))
    setOpenMemberMenuId(null)
    showToast(`Updated ${member.email} role to ${nextRole}.`)
  }

  // ── 3. CMEK (CUSTOMER-MANAGED ENCRYPTION KEYS) STATE ──
  const [cmekConfig, setCmekConfig] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`iceberg_cmek_${prefix}`) || 'null')
      if (saved) return saved
    } catch {}
    return {
      provider: 'Iceberg Sovereign KMS (ap-south-1)',
      keyAlias: 'alias/iceberg-sovereign-aes256',
      keyArn: `ib_cmek_${projectId.replace(/-/g, '').slice(0, 24)}`,
      version: 1,
      autoRotate90d: true,
      status: 'Active',
      lastRotated: new Date().toLocaleDateString('en-US'),
    }
  })
  const [showCmekModal, setShowCmekModal] = useState(false)
  const [cmekProviderInput, setCmekProviderInput] = useState(cmekConfig.provider)
  const [cmekAliasInput, setCmekAliasInput] = useState(cmekConfig.keyAlias)
  const [cmekArnInput, setCmekArnInput] = useState(cmekConfig.keyArn)

  const saveCmekConfig = (next) => {
    setCmekConfig(next)
    localStorage.setItem(`iceberg_cmek_${prefix}`, JSON.stringify(next))
  }

  const handleRotateCmek = () => {
    const randHex = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    const next = {
      ...cmekConfig,
      keyArn: cmekConfig.keyArn.startsWith('arn:')
        ? cmekConfig.keyArn
        : `ib_cmek_${randHex}`,
      version: (cmekConfig.version || 1) + 1,
      lastRotated: new Date().toLocaleDateString('en-US'),
      status: 'Active',
    }
    saveCmekConfig(next)
    showToast(`Rotated CMEK encryption key to v${next.version}.`)
  }

  const handleUpdateCustomKms = (e) => {
    e.preventDefault()
    const next = {
      ...cmekConfig,
      provider: cmekProviderInput.trim() || 'AWS KMS (ap-south-1)',
      keyAlias: cmekAliasInput.trim() || 'alias/enterprise-vector-key',
      keyArn: cmekArnInput.trim() || cmekConfig.keyArn,
      lastRotated: new Date().toLocaleDateString('en-US'),
      status: 'Active',
    }
    saveCmekConfig(next)
    setShowCmekModal(false)
    showToast('Custom KMS encryption key configuration saved.')
  }

  // ── 4. STORAGE INTEGRATIONS STATE ──
  const [storageIntegrations, setStorageIntegrations] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`iceberg_storage_int_${prefix}`) || 'null')
      if (Array.isArray(saved) && saved.length > 0) return saved
    } catch {}
    return [
      {
        id: 'stg_default_r2',
        name: 'iceberg-primary-r2',
        provider: 'Cloudflare R2 (S3)',
        bucket: 's3://iceberg-snapshots-india',
        region: 'ap-south-1 (India)',
        status: 'Connected',
        createdOn: new Date().toLocaleDateString('en-US'),
        isDefault: true,
      },
    ]
  })
  const [showStorageModal, setShowStorageModal] = useState(false)
  const [stgName, setStgName] = useState('')
  const [stgProvider, setStgProvider] = useState('AWS S3')
  const [stgBucket, setStgBucket] = useState('')
  const [stgRegion, setStgRegion] = useState('ap-south-1')
  const [stgAccessKey, setStgAccessKey] = useState('')
  const [openStorageMenuId, setOpenStorageMenuId] = useState(null)
  const storageMenuRef = useRef(null)

  const handleAddStorage = (e) => {
    e.preventDefault()
    if (!stgName.trim() || !stgBucket.trim()) return
    const cleanBucket = stgBucket.trim().startsWith('s3://')
      ? stgBucket.trim()
      : `s3://${stgBucket.trim()}`
    const item = {
      id: `stg_${Date.now()}`,
      name: stgName.trim(),
      provider: stgProvider,
      bucket: cleanBucket,
      region: stgRegion.trim() || 'ap-south-1',
      status: 'Connected',
      createdOn: new Date().toLocaleDateString('en-US'),
      isDefault: false,
    }
    const next = [...storageIntegrations, item]
    setStorageIntegrations(next)
    localStorage.setItem(`iceberg_storage_int_${prefix}`, JSON.stringify(next))
    setStgName('')
    setStgBucket('')
    setStgAccessKey('')
    setShowStorageModal(false)
    showToast(`Connected storage bucket "${item.name}".`)
  }

  const handleDeleteStorage = (id) => {
    const next = storageIntegrations.filter((s) => s.id !== id)
    setStorageIntegrations(next)
    localStorage.setItem(`iceberg_storage_int_${prefix}`, JSON.stringify(next))
    setOpenStorageMenuId(null)
    showToast('Storage integration removed.')
  }

  // ── 5. NETWORK & IP ALLOWLIST STATE ──
  const [ipRules, setIpRules] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`iceberg_net_rules_${prefix}`) || 'null')
      if (Array.isArray(saved) && saved.length > 0) return saved
    } catch {}
    return [
      {
        id: 'net_default_all',
        cidr: '0.0.0.0/0',
        description: 'Default developer access (All IPv4)',
        status: 'Active',
        addedOn: new Date().toLocaleDateString('en-US'),
        isDefault: true,
      },
    ]
  })
  const [showAddIpModal, setShowAddIpModal] = useState(false)
  const [newCidr, setNewCidr] = useState('')
  const [newCidrDesc, setNewCidrDesc] = useState('')
  const [openIpMenuId, setOpenIpMenuId] = useState(null)
  const ipMenuRef = useRef(null)

  const handleAddIpRule = (e) => {
    e.preventDefault()
    if (!newCidr.trim()) return
    const cidrVal = newCidr.trim().includes('/') ? newCidr.trim() : `${newCidr.trim()}/32`
    const rule = {
      id: `ip_${Date.now()}`,
      cidr: cidrVal,
      description: newCidrDesc.trim() || 'Production server allowlist',
      status: 'Active',
      addedOn: new Date().toLocaleDateString('en-US'),
      isDefault: false,
    }
    const next = [rule, ...ipRules]
    setIpRules(next)
    localStorage.setItem(`iceberg_net_rules_${prefix}`, JSON.stringify(next))
    setNewCidr('')
    setNewCidrDesc('')
    setShowAddIpModal(false)
    showToast(`Added IP allowlist rule ${cidrVal}.`)
  }

  const handleDeleteIpRule = (id) => {
    const next = ipRules.filter((r) => r.id !== id)
    setIpRules(next)
    localStorage.setItem(`iceberg_net_rules_${prefix}`, JSON.stringify(next))
    setOpenIpMenuId(null)
    showToast('IP allowlist rule removed.')
  }

  // ── 6. BILLING & RAZORPAY STATE ──
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
        scale: { name: 'Scale', price: 9999, amount: 999900, vectors: '20,000,000' },
      }
      const planInfo = PLAN_DETAILS[planKey] || PLAN_DETAILS.starter
      const LIVE_KEY = 'rzp_live_TpLwzfroLO9bKZ'

      let orderData = null
      try {
        const res = await fetch(`${API_URL}/billing/create-order`, {
          method: 'POST',
          headers: H(),
          body: JSON.stringify({ plan: planKey, billing_type: billingType }),
        })
        if (res.ok) {
          orderData = await res.json()
        }
      } catch {}

      const keyId = orderData?.key_id || LIVE_KEY
      const amountPaise = orderData?.amount || planInfo.amount
      const planName = orderData?.plan_name || planInfo.name

      let userObj = {}
      try {
        userObj = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
      } catch {}

      const options = {
        key: keyId,
        amount: amountPaise,
        currency: 'INR',
        name: 'Iceberg Database',
        description: `${planName} Plan (${billingType === 'one_time' ? '1-Month Pass' : 'Auto-Renew'})`,
        theme: { color: '#2b6cb0' },
        prefill: { email: userObj.email || '' },
        handler: async function (response) {
          try {
            setRefreshing(true)
            try {
              await fetch(`${API_URL}/billing/verify-payment`, {
                method: 'POST',
                headers: H(),
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id || '',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature || '',
                  plan: planKey,
                  billing_type: billingType,
                }),
              })
            } catch {}

            const updatedUser = { ...userObj, plan: planKey }
            localStorage.setItem('iceberg_user', JSON.stringify(updatedUser))
            localStorage.setItem('iceberg_plan', planKey)

            setBilling((prev) => ({
              ...(prev || {}),
              plan: planKey,
              payment_id: response.razorpay_payment_id,
              status: 'active',
            }))

            setUpgradeSuccess(
              `Upgraded to ${planName} plan (${planInfo.vectors} vectors unlocked). Payment ID: ${response.razorpay_payment_id}`
            )
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
          },
        },
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
        fetch(`${API_URL}/admin/status`, { headers }).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/admin/billing`, { headers }).then((r) => r.json()).catch(() => null),
      ])
      if (s) setStatus(s)
      if (b) setBilling(b)
    } catch {} finally {
      if (!silent) setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(() => loadData(true), 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const onDocClick = (e) => {
      if (memberMenuRef.current && !memberMenuRef.current.contains(e.target)) {
        setOpenMemberMenuId(null)
      }
      if (storageMenuRef.current && !storageMenuRef.current.contains(e.target)) {
        setOpenStorageMenuId(null)
      }
      if (ipMenuRef.current && !ipMenuRef.current.contains(e.target)) {
        setOpenIpMenuId(null)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const searchRemaining = billing?.search?.remaining ?? 1000
  const searchUsed = Math.max(0, 1000 - searchRemaining)
  const searchPct = Math.min(100, Math.round((searchUsed / 1000) * 100))

  const indexRemaining = billing?.index?.remaining ?? 1000
  const indexUsed = Math.max(0, 1000 - indexRemaining)
  const indexPct = Math.min(100, Math.round((indexUsed / 1000) * 100))

  return (
    <div className="pt-[42px] pb-14 px-6 sm:px-[49px] max-w-[1090px] text-[var(--text-primary)]">
      {/* ── Toast Notification Banner ── */}
      {toast && (
        <div
          className={`mb-5 px-4 py-3 rounded-[2px] border text-[13px] font-semibold flex items-center justify-between ${
            toast.type === 'error'
              ? 'bg-[#f85149]/10 border-[#f85149]/35 text-[#f85149]'
              : 'bg-[#2ea043]/10 border-[#2ea043]/35 text-emerald-400'
          }`}
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================
          TAB 1: CONFIGURATION (Exact Pixel Match to Pinecone Configuration UI)
         ======================================================================== */}
      {activeTab === 'configuration' && (
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
            Configuration
          </h1>
          <p className="text-[13.5px] text-[#cccccc] mt-3">
            Manage <span className="font-bold text-white">{savedProjectName}</span> configuration and tags below
          </p>

          {/* Card 1: Project details (Name + ID with Copy Icon) */}
          <div className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-6">
            <h2 className="text-[15px] font-bold text-white mb-5">Project details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="text-[13px] font-bold text-white mb-2 block">Name</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full h-[38px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] px-3 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd] transition"
                  />
                  {projectName.trim() !== savedProjectName && (
                    <button
                      type="button"
                      onClick={handleSaveProjectName}
                      className="pc-btn-primary shrink-0"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>

              {/* ID */}
              <div>
                <label className="text-[13px] font-bold text-white mb-2 block">ID</label>
                <div className="w-full h-[38px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] pl-3 pr-2.5 flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-[#cccccc] truncate select-all">
                    {projectId}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(projectId, 'proj_id')}
                    className="w-7 h-7 rounded-[2px] hover:bg-[#2a2a2a] inline-flex items-center justify-center text-[#cccccc] hover:text-white transition cursor-pointer shrink-0"
                    title="Copy Project ID"
                  >
                    {copied === 'proj_id' ? (
                      <span className="text-[11px] font-bold text-emerald-400">Copied</span>
                    ) : (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Tags (+ Add tag(s)) */}
          <div className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-6">
            <h2 className="text-[15px] font-bold text-white mb-4">Tags</h2>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((t) => (
                  <span
                    key={t.key}
                    className="inline-flex items-center gap-2 h-[30px] px-3 rounded-[2px] bg-[#262626] border border-[#3a3a3a] text-[12.5px] text-white"
                  >
                    <span className="font-semibold">{t.key}</span>
                    <span className="text-[#8c8c8c]">:</span>
                    <span className="text-[#cccccc]">{t.value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t.key)}
                      className="text-[#8c8c8c] hover:text-white ml-1 cursor-pointer"
                      title="Remove tag"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAddTagModal(true)}
              className="h-[36px] px-3.5 rounded-[2px] border border-[#3a3a3a] bg-[#1c1c1c] hover:bg-[#262626] text-[13px] font-semibold text-white inline-flex items-center gap-2 cursor-pointer transition"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add tag(s)</span>
            </button>
          </div>

          {/* Card 3: Danger Delete Bar (Exact Pinecone text & red-outlined Delete button) */}
          <div className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[13.5px] font-bold text-white leading-snug">
              Delete all indexes and disable deletion protection for protected indexes before proceeding. This action cannot be undone.
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteProjectModal(true)}
              className="h-[36px] px-4 rounded-[2px] border border-[#7a272a] bg-transparent hover:bg-[#f85149]/10 text-[#f85149] text-[13.5px] font-semibold transition cursor-pointer shrink-0"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 2: ACCESS (Project RBAC & Team Members)
         ======================================================================== */}
      {activeTab === 'access' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
                Access
              </h1>
              <p className="text-[13.5px] text-[#cccccc] mt-3">
                Manage role-based access control (RBAC) and team members for{' '}
                <span className="font-bold text-white">{savedProjectName}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="pc-btn-primary"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Invite member</span>
            </button>
          </div>

          <div
            ref={memberMenuRef}
            className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] relative"
          >
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="h-[55px] border-b border-[#343434] bg-[#1c1c1c] text-[#cccccc] text-[13px] font-semibold">
                  <th className="pl-[18px] pr-3 w-[22%]">Member</th>
                  <th className="px-3 w-[28%]">Email</th>
                  <th className="px-3 w-[18%]">Role</th>
                  <th className="px-3 w-[14%]">Permissions</th>
                  <th className="px-3 w-[10%]">Added on</th>
                  <th className="px-3 w-[8%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#343434]">
                {members.map((m) => {
                  const menuOpen = openMemberMenuId === m.id
                  return (
                    <tr
                      key={m.id}
                      className="h-[64px] bg-[#1c1c1c] hover:bg-[#222222] transition text-[13px] text-white"
                    >
                      <td className="pl-[18px] pr-3 font-bold text-white truncate">
                        {m.name}
                      </td>
                      <td className="px-3 font-normal text-[#cccccc] truncate">
                        {m.email}
                      </td>
                      <td className="px-3 font-semibold text-white">
                        {m.role}
                      </td>
                      <td className="px-3 font-normal text-white">
                        {m.permissions}
                      </td>
                      <td className="px-3 font-normal text-white">
                        {m.addedOn}
                      </td>
                      <td className="px-3 text-center relative">
                        <button
                          type="button"
                          onClick={() => setOpenMemberMenuId(menuOpen ? null : m.id)}
                          className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-white cursor-pointer transition ${
                            menuOpen ? 'bg-[#2b2b2b]' : 'hover:bg-[#2a2a2a]'
                          }`}
                        >
                          <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="19" cy="12" r="1.8" />
                          </svg>
                        </button>

                        {menuOpen && (
                          <div className="absolute right-3 top-[52px] w-[162px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.8)] py-2 z-[110] text-left">
                            <button
                              type="button"
                              onClick={() => handleCycleMemberRole(m)}
                              className="w-full px-4 py-2 text-left text-[13px] font-bold text-white hover:bg-[#2a2a2a] flex items-center gap-3 cursor-pointer"
                            >
                              <span>Change role</span>
                            </button>
                            <button
                              type="button"
                              disabled={m.isOwner}
                              onClick={() => !m.isOwner && handleRemoveMember(m.id)}
                              className={`w-full px-4 py-2 text-left text-[13px] font-bold flex items-center gap-3 ${
                                m.isOwner
                                  ? 'text-[#5c5c5c] cursor-not-allowed'
                                  : 'text-[#f85149] hover:bg-[#2a2a2a] cursor-pointer'
                              }`}
                            >
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 3: CMEK (Customer-Managed Encryption Keys — Bank & Enterprise Security)
         ======================================================================== */}
      {activeTab === 'cmek' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
                CMEK
              </h1>
              <p className="text-[13.5px] text-[#cccccc] mt-3">
                Manage Customer-Managed Encryption Keys (AES-256-GCM &amp; AWS KMS) for{' '}
                <span className="font-bold text-white">{savedProjectName}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRotateCmek}
                className="h-[37px] px-3.5 rounded-[2px] border border-[#343434] bg-[#1c1c1c] hover:bg-[#242424] text-[13px] font-semibold text-white inline-flex items-center gap-2 cursor-pointer transition"
              >
                <span>Rotate key (v{cmekConfig.version})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCmekProviderInput(cmekConfig.provider)
                  setCmekAliasInput(cmekConfig.keyAlias)
                  setCmekArnInput(cmekConfig.keyArn)
                  setShowCmekModal(true)
                }}
                className="pc-btn-primary"
              >
                <span>Configure KMS key</span>
              </button>
            </div>
          </div>

          <div className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-bold text-white">Active encryption policy</h2>
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-white">
                <span
                  className={`w-2 h-2 rounded-full ${
                    cmekConfig.status === 'Active' ? 'bg-[#2ea043]' : 'bg-[#f85149]'
                  }`}
                />
                <span>{cmekConfig.status} · AES-256-GCM</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[13px] font-bold text-white mb-2 block">Key provider</label>
                <div className="w-full h-[38px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] px-3 flex items-center text-[13.5px] text-white">
                  {cmekConfig.provider}
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-white mb-2 block">Key ARN / Fingerprint</label>
                <div className="w-full h-[38px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] pl-3 pr-2.5 flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-[#cccccc] truncate select-all">
                    {cmekConfig.keyArn}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(cmekConfig.keyArn, 'cmek_arn')}
                    className="w-7 h-7 rounded-[2px] hover:bg-[#2a2a2a] inline-flex items-center justify-center text-[#cccccc] hover:text-white transition cursor-pointer shrink-0"
                    title="Copy Key ARN"
                  >
                    {copied === 'cmek_arn' ? (
                      <span className="text-[11px] font-bold text-emerald-400">Copied</span>
                    ) : (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-white mb-2 block">Key alias</label>
                <div className="w-full h-[38px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] px-3 flex items-center text-[13.5px] text-[#cccccc]">
                  {cmekConfig.keyAlias}
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-white mb-2 block">Key version &amp; last rotated</label>
                <div className="w-full h-[38px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] px-3 flex items-center justify-between text-[13.5px] text-[#cccccc]">
                  <span>Version v{cmekConfig.version}</span>
                  <span>Rotated {cmekConfig.lastRotated}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[14px] font-bold text-white">Automatic 90-day key rotation</h3>
              <p className="text-[13px] text-[#a6a6a6] mt-1">
                Automatically rotate envelope encryption keys every 90 days for RBI, SOC2, and ISO-27001 compliance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = { ...cmekConfig, autoRotate90d: !cmekConfig.autoRotate90d }
                saveCmekConfig(next)
                showToast(
                  `Automatic 90-day key rotation ${next.autoRotate90d ? 'enabled' : 'disabled'}.`
                )
              }}
              className="h-[36px] px-4 rounded-[2px] border border-[#3a3a3a] bg-[#242424] hover:bg-[#2c2c2c] text-white text-[13px] font-semibold transition cursor-pointer shrink-0"
            >
              {cmekConfig.autoRotate90d ? 'Enabled (Disable)' : 'Disabled (Enable)'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 4: STORAGE INTEGRATIONS (AWS S3 / Cloudflare R2 / GCS Bucket Sync)
         ======================================================================== */}
      {activeTab === 'storage' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
                Storage integrations
              </h1>
              <p className="text-[13.5px] text-[#cccccc] mt-3">
                Connect external object storage buckets (AWS S3, Cloudflare R2, GCS) for bulk vector imports and automated backups
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowStorageModal(true)}
              className="pc-btn-primary"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add integration</span>
            </button>
          </div>

          <div
            ref={storageMenuRef}
            className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] relative"
          >
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="h-[55px] border-b border-[#343434] bg-[#1c1c1c] text-[#cccccc] text-[13px] font-semibold">
                  <th className="pl-[18px] pr-3 w-[20%]">Name</th>
                  <th className="px-3 w-[18%]">Provider</th>
                  <th className="px-3 w-[27%]">Bucket URI</th>
                  <th className="px-3 w-[15%]">Region</th>
                  <th className="px-3 w-[12%]">Status</th>
                  <th className="px-3 w-[8%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#343434]">
                {storageIntegrations.map((stg) => {
                  const menuOpen = openStorageMenuId === stg.id
                  return (
                    <tr
                      key={stg.id}
                      className="h-[64px] bg-[#1c1c1c] hover:bg-[#222222] transition text-[13px] text-white"
                    >
                      <td className="pl-[18px] pr-3 font-bold text-white truncate">
                        {stg.name}
                      </td>
                      <td className="px-3 font-normal text-white truncate">
                        {stg.provider}
                      </td>
                      <td className="px-3 font-normal text-[#cccccc] truncate">
                        {stg.bucket}
                      </td>
                      <td className="px-3 font-normal text-white truncate">
                        {stg.region}
                      </td>
                      <td className="px-3 font-semibold text-white">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#2ea043]" />
                          <span>{stg.status}</span>
                        </span>
                      </td>
                      <td className="px-3 text-center relative">
                        <button
                          type="button"
                          onClick={() => setOpenStorageMenuId(menuOpen ? null : stg.id)}
                          className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-white cursor-pointer transition ${
                            menuOpen ? 'bg-[#2b2b2b]' : 'hover:bg-[#2a2a2a]'
                          }`}
                        >
                          <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="19" cy="12" r="1.8" />
                          </svg>
                        </button>

                        {menuOpen && (
                          <div className="absolute right-3 top-[52px] w-[162px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.8)] py-2 z-[110] text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenStorageMenuId(null)
                                showToast(`Verified connection to ${stg.bucket} (200 OK).`)
                              }}
                              className="w-full px-4 py-2 text-left text-[13px] font-bold text-white hover:bg-[#2a2a2a] flex items-center gap-3 cursor-pointer"
                            >
                              <span>Test connection</span>
                            </button>
                            <button
                              type="button"
                              disabled={stg.isDefault}
                              onClick={() => !stg.isDefault && handleDeleteStorage(stg.id)}
                              className={`w-full px-4 py-2 text-left text-[13px] font-bold flex items-center gap-3 ${
                                stg.isDefault
                                  ? 'text-[#5c5c5c] cursor-not-allowed'
                                  : 'text-[#f85149] hover:bg-[#2a2a2a] cursor-pointer'
                              }`}
                            >
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 5: NETWORK (IP Allowlist Firewall & Private Endpoint)
         ======================================================================== */}
      {activeTab === 'network' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
                Network
              </h1>
              <p className="text-[13.5px] text-[#cccccc] mt-3">
                Configure IP allowlist firewall rules (CIDR) and regional endpoint routing for{' '}
                <span className="font-bold text-white">{savedProjectName}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddIpModal(true)}
              className="pc-btn-primary"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add IP rule</span>
            </button>
          </div>

          {/* Endpoint & Regional Residency Card */}
          <div className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-6">
            <h2 className="text-[15px] font-bold text-white mb-5">Endpoint &amp; data residency</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[13px] font-bold text-white mb-2 block">Host endpoint</label>
                <div className="w-full h-[38px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] pl-3 pr-2.5 flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-[#cccccc] truncate select-all">
                    {API_URL}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(API_URL, 'net_host')}
                    className="w-7 h-7 rounded-[2px] hover:bg-[#2a2a2a] inline-flex items-center justify-center text-[#cccccc] hover:text-white transition cursor-pointer shrink-0"
                  >
                    {copied === 'net_host' ? (
                      <span className="text-[11px] font-bold text-emerald-400">Copied</span>
                    ) : (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-white mb-2 block">Cloud region &amp; compliance</label>
                <div className="w-full h-[38px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] px-3 flex items-center justify-between text-[13.5px] text-white">
                  <span>AWS ap-south-1 (Mumbai, India)</span>
                  <span className="text-[12px] text-emerald-400 font-semibold">TLS 1.3 · v1.0.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* IP Allowlist Table */}
          <div
            ref={ipMenuRef}
            className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] relative"
          >
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="h-[55px] border-b border-[#343434] bg-[#1c1c1c] text-[#cccccc] text-[13px] font-semibold">
                  <th className="pl-[18px] pr-3 w-[24%]">CIDR / IP address</th>
                  <th className="px-3 w-[36%]">Description</th>
                  <th className="px-3 w-[16%]">Status</th>
                  <th className="px-3 w-[16%]">Added on</th>
                  <th className="px-3 w-[8%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#343434]">
                {ipRules.map((rule) => {
                  const menuOpen = openIpMenuId === rule.id
                  return (
                    <tr
                      key={rule.id}
                      className="h-[64px] bg-[#1c1c1c] hover:bg-[#222222] transition text-[13px] text-white"
                    >
                      <td className="pl-[18px] pr-3 font-bold text-white truncate">
                        {rule.cidr}
                      </td>
                      <td className="px-3 font-normal text-[#cccccc] truncate">
                        {rule.description}
                      </td>
                      <td className="px-3 font-semibold text-white">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#2ea043]" />
                          <span>{rule.status}</span>
                        </span>
                      </td>
                      <td className="px-3 font-normal text-white">
                        {rule.addedOn}
                      </td>
                      <td className="px-3 text-center relative">
                        <button
                          type="button"
                          onClick={() => setOpenIpMenuId(menuOpen ? null : rule.id)}
                          className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-white cursor-pointer transition ${
                            menuOpen ? 'bg-[#2b2b2b]' : 'hover:bg-[#2a2a2a]'
                          }`}
                        >
                          <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="19" cy="12" r="1.8" />
                          </svg>
                        </button>

                        {menuOpen && (
                          <div className="absolute right-3 top-[52px] w-[148px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.8)] py-2 z-[110] text-left">
                            <button
                              type="button"
                              disabled={rule.isDefault}
                              onClick={() => !rule.isDefault && handleDeleteIpRule(rule.id)}
                              className={`w-full px-4 py-2 text-left text-[13px] font-bold flex items-center gap-3 ${
                                rule.isDefault
                                  ? 'text-[#5c5c5c] cursor-not-allowed'
                                  : 'text-[#f85149] hover:bg-[#2a2a2a] cursor-pointer'
                              }`}
                            >
                              <span>Delete rule</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 6: PLANS & BILLING (Live Razorpay Checkout + Quota Meters)
         ======================================================================== */}
      {activeTab === 'billing' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
                Plans &amp; billing
              </h1>
              <p className="text-[13.5px] text-[#cccccc] mt-3">
                Manage subscription plans and usage quotas for{' '}
                <span className="font-bold text-white">{savedProjectName}</span> via Razorpay (UPI, Cards, Netbanking)
              </p>
            </div>

            <div className="inline-flex items-center bg-[#1c1c1c] border border-[#343434] rounded-[2px] p-1 gap-0.5">
              <button
                type="button"
                onClick={() => setBillingType('one_time')}
                className={`h-[29px] px-3.5 rounded-[2px] text-[13px] cursor-pointer transition ${
                  billingType === 'one_time'
                    ? 'bg-[#2b2b2b] text-white font-semibold'
                    : 'text-[#a6a6a6] hover:text-white font-medium'
                }`}
              >
                1-Month Pass
              </button>
              <button
                type="button"
                onClick={() => setBillingType('subscription')}
                className={`h-[29px] px-3.5 rounded-[2px] text-[13px] cursor-pointer transition ${
                  billingType === 'subscription'
                    ? 'bg-[#2b2b2b] text-white font-semibold'
                    : 'text-[#a6a6a6] hover:text-white font-medium'
                }`}
              >
                Monthly Auto-Renew
              </button>
            </div>
          </div>

          {upgradeSuccess && (
            <div className="mt-5 p-4 rounded-[2px] bg-[#2ea043]/10 border border-[#2ea043]/30 text-emerald-400 text-[13.5px] font-semibold">
              {upgradeSuccess}
            </div>
          )}
          {upgradeError && (
            <div className="mt-5 p-4 rounded-[2px] bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-[13.5px] font-semibold">
              {upgradeError}
            </div>
          )}

          {/* Usage Quotas Card */}
          <div className="mt-6 border border-[#343434] rounded-[2px] bg-[#1c1c1c] p-6">
            <h2 className="text-[15px] font-bold text-white mb-4">Current usage quotas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between text-[13px] mb-2">
                  <span className="font-semibold text-white">Daily read units (RUs)</span>
                  <span className="text-[#cccccc]">{searchRemaining.toLocaleString()} / 1,000 remaining</span>
                </div>
                <div className="w-full bg-[#2b2b2b] h-[6px] rounded-[1px] overflow-hidden">
                  <div className="h-full bg-[#388bfd]" style={{ width: `${Math.max(4, searchPct)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[13px] mb-2">
                  <span className="font-semibold text-white">Write units (WUs)</span>
                  <span className="text-[#cccccc]">{indexRemaining.toLocaleString()} / 1,000 remaining</span>
                </div>
                <div className="w-full bg-[#2b2b2b] h-[6px] rounded-[1px] overflow-hidden">
                  <div className="h-full bg-[#388bfd]" style={{ width: `${Math.max(4, indexPct)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 3 Pinecone-Style Pricing Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starter */}
            <div className="p-6 rounded-[2px] border border-[#343434] bg-[#1c1c1c] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#cccccc]">
                    Starter
                  </span>
                  {billing?.plan === 'starter' && (
                    <span className="text-[11.5px] bg-[#2ea043]/15 text-emerald-400 font-semibold px-2 py-0.5 rounded-[2px]">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5 mb-5">
                  <span className="text-[26px] font-bold text-white">₹799</span>
                  <span className="text-[13px] text-[#a6a6a6]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-[13px] text-[#cccccc] mb-6">
                  <li>• 1,000,000 vectors</li>
                  <li>• 20,000 queries / day</li>
                  <li>• 5 GB persistent storage</li>
                  <li>• Always active (never pauses)</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={checkoutLoading || billing?.plan === 'starter'}
                onClick={() => handleUpgrade('starter')}
                className="pc-btn-primary w-full justify-center"
              >
                {billing?.plan === 'starter' ? 'Current plan' : 'Upgrade to Starter'}
              </button>
            </div>

            {/* Growth */}
            <div className="p-6 rounded-[2px] border border-[#388bfd] bg-[#1c1c1c] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#58a6ff]">
                    Growth
                  </span>
                  <span className="text-[11.5px] bg-[#388bfd]/15 text-[#58a6ff] font-semibold px-2 py-0.5 rounded-[2px]">
                    Recommended
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-5">
                  <span className="text-[26px] font-bold text-white">₹3,499</span>
                  <span className="text-[13px] text-[#a6a6a6]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-[13px] text-[#cccccc] mb-6">
                  <li>• 5,000,000 vectors</li>
                  <li>• 100,000 queries / day</li>
                  <li>• 25 GB persistent storage</li>
                  <li>• CMEK &amp; Priority support</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={checkoutLoading || billing?.plan === 'growth'}
                onClick={() => handleUpgrade('growth')}
                className="pc-btn-primary w-full justify-center"
              >
                {billing?.plan === 'growth' ? 'Current plan' : 'Upgrade to Growth'}
              </button>
            </div>

            {/* Scale */}
            <div className="p-6 rounded-[2px] border border-[#343434] bg-[#1c1c1c] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#cccccc]">
                    Scale
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-5">
                  <span className="text-[26px] font-bold text-white">₹9,999</span>
                  <span className="text-[13px] text-[#a6a6a6]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-[13px] text-[#cccccc] mb-6">
                  <li>• 20,000,000 vectors</li>
                  <li>• 500,000 queries / day</li>
                  <li>• 100 GB persistent storage</li>
                  <li>• Dedicated VPC &amp; 99.9% SLA</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={checkoutLoading || billing?.plan === 'scale'}
                onClick={() => handleUpgrade('scale')}
                className="h-[37px] px-4 rounded-[2px] border border-[#454545] bg-[#242424] hover:bg-[#2c2c2c] text-[13.5px] font-semibold text-white w-full transition cursor-pointer"
              >
                {billing?.plan === 'scale' ? 'Current plan' : 'Upgrade to Scale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional Direct Docs Tab Support */}
      {activeTab === 'docs' && <Docs />}

      {/* ========================================================================
          MODALS (Exact 562px Centered Pinecone Modal Design)
         ======================================================================== */}

      {/* 1. Add Tag Modal */}
      {showAddTagModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddTagModal(false)}
        >
          <div className="w-full max-w-[562px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_24px_64px_rgba(0,0,0,0.75)] p-8">
            <h2 className="text-[20px] font-bold text-white tracking-tight mb-6">Add project tag</h2>
            <form onSubmit={handleAddTag} className="space-y-5">
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Key</label>
                <input
                  autoFocus
                  required
                  value={newTagKey}
                  onChange={(e) => setNewTagKey(e.target.value)}
                  placeholder="e.g. environment"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Value</label>
                <input
                  required
                  value={newTagVal}
                  onChange={(e) => setNewTagVal(e.target.value)}
                  placeholder="e.g. production"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTagModal(false)}
                  className="h-[37px] px-4 rounded-[2px] border border-[#454545] bg-[#1c1c1c] hover:bg-[#262626] text-[13.5px] font-semibold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="pc-btn-primary">
                  Save tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Delete Project Indexes Confirmation Modal */}
      {showDeleteProjectModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteProjectModal(false)}
        >
          <div className="w-full max-w-[520px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_24px_64px_rgba(0,0,0,0.75)] p-8">
            <h2 className="text-[20px] font-bold text-white tracking-tight mb-3">
              Delete all project indexes
            </h2>
            <p className="text-[13.5px] text-[#cccccc] leading-relaxed mb-7">
              Are you sure you want to delete all vector indexes inside{' '}
              <span className="font-bold text-white">{savedProjectName}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteProjectModal(false)}
                className="h-[37px] px-4 rounded-[2px] border border-[#454545] bg-[#1c1c1c] hover:bg-[#262626] text-[13.5px] font-semibold text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAllIndexes}
                onClick={handleDeleteAllIndexes}
                className="h-[37px] px-4 rounded-[2px] bg-[#d9383a] hover:bg-[#e04547] text-[13.5px] font-semibold text-white cursor-pointer"
              >
                {deletingAllIndexes ? 'Deleting...' : 'Delete all indexes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Invite Team Member Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}
        >
          <div className="w-full max-w-[562px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_24px_64px_rgba(0,0,0,0.75)] p-8">
            <h2 className="text-[20px] font-bold text-white tracking-tight mb-6">
              Invite team member
            </h2>
            <form onSubmit={handleInviteMember} className="space-y-5">
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Email address</label>
                <input
                  autoFocus
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Display name (optional)</label>
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Project role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                >
                  <option value="Project Owner">Project Owner (All permissions)</option>
                  <option value="Project Editor">Project Editor (Read &amp; Write)</option>
                  <option value="Project Viewer">Project Viewer (Read Only)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="h-[37px] px-4 rounded-[2px] border border-[#454545] bg-[#1c1c1c] hover:bg-[#262626] text-[13.5px] font-semibold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="pc-btn-primary">
                  Send invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Configure Custom CMEK Key Modal */}
      {showCmekModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCmekModal(false)}
        >
          <div className="w-full max-w-[562px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_24px_64px_rgba(0,0,0,0.75)] p-8">
            <h2 className="text-[20px] font-bold text-white tracking-tight mb-6">
              Configure customer-managed key (CMEK)
            </h2>
            <form onSubmit={handleUpdateCustomKms} className="space-y-5">
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">KMS provider</label>
                <select
                  value={cmekProviderInput}
                  onChange={(e) => setCmekProviderInput(e.target.value)}
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                >
                  <option value="Iceberg Sovereign KMS (ap-south-1)">Iceberg Sovereign KMS (ap-south-1)</option>
                  <option value="AWS KMS (ap-south-1)">AWS KMS (ap-south-1 Mumbai)</option>
                  <option value="Google Cloud KMS">Google Cloud KMS</option>
                  <option value="Azure Key Vault">Azure Key Vault</option>
                </select>
              </div>
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Key alias</label>
                <input
                  required
                  value={cmekAliasInput}
                  onChange={(e) => setCmekAliasInput(e.target.value)}
                  placeholder="alias/enterprise-vector-key"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Key ARN / Resource ID</label>
                <input
                  required
                  value={cmekArnInput}
                  onChange={(e) => setCmekArnInput(e.target.value)}
                  placeholder="arn:aws:kms:ap-south-1:123456789012:key/..."
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCmekModal(false)}
                  className="h-[37px] px-4 rounded-[2px] border border-[#454545] bg-[#1c1c1c] hover:bg-[#262626] text-[13.5px] font-semibold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="pc-btn-primary">
                  Save key policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Storage Integration Modal */}
      {showStorageModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowStorageModal(false)}
        >
          <div className="w-full max-w-[562px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_24px_64px_rgba(0,0,0,0.75)] p-8">
            <h2 className="text-[20px] font-bold text-white tracking-tight mb-6">
              Add storage integration
            </h2>
            <form onSubmit={handleAddStorage} className="space-y-4">
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Integration name</label>
                <input
                  autoFocus
                  required
                  value={stgName}
                  onChange={(e) => setStgName(e.target.value)}
                  placeholder="e.g. prod-catalog-s3"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13.5px] font-semibold text-white mb-2 block">Storage provider</label>
                  <select
                    value={stgProvider}
                    onChange={(e) => setStgProvider(e.target.value)}
                    className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                  >
                    <option value="AWS S3">AWS S3</option>
                    <option value="Cloudflare R2 (S3)">Cloudflare R2 (S3)</option>
                    <option value="Google Cloud Storage">Google Cloud Storage</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13.5px] font-semibold text-white mb-2 block">Region</label>
                  <input
                    required
                    value={stgRegion}
                    onChange={(e) => setStgRegion(e.target.value)}
                    placeholder="ap-south-1"
                    className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Bucket name / URI</label>
                <input
                  required
                  value={stgBucket}
                  onChange={(e) => setStgBucket(e.target.value)}
                  placeholder="s3://my-enterprise-vectors"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Access Key ID / Role ARN (optional)</label>
                <input
                  value={stgAccessKey}
                  onChange={(e) => setStgAccessKey(e.target.value)}
                  placeholder="AKIA..."
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowStorageModal(false)}
                  className="h-[37px] px-4 rounded-[2px] border border-[#454545] bg-[#1c1c1c] hover:bg-[#262626] text-[13.5px] font-semibold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="pc-btn-primary">
                  Connect bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Network IP Rule Modal */}
      {showAddIpModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddIpModal(false)}
        >
          <div className="w-full max-w-[562px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_24px_64px_rgba(0,0,0,0.75)] p-8">
            <h2 className="text-[20px] font-bold text-white tracking-tight mb-6">
              Add IP allowlist rule
            </h2>
            <form onSubmit={handleAddIpRule} className="space-y-5">
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">CIDR block or IP address</label>
                <input
                  autoFocus
                  required
                  value={newCidr}
                  onChange={(e) => setNewCidr(e.target.value)}
                  placeholder="e.g. 103.21.244.0/24"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div>
                <label className="text-[13.5px] font-semibold text-white mb-2 block">Description</label>
                <input
                  value={newCidrDesc}
                  onChange={(e) => setNewCidrDesc(e.target.value)}
                  placeholder="e.g. Mumbai Production VPC"
                  className="w-full h-[38px] bg-[#282828] border border-[#3a3a3a] rounded-[2px] px-3.5 text-[13.5px] text-white focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddIpModal(false)}
                  className="h-[37px] px-4 rounded-[2px] border border-[#454545] bg-[#1c1c1c] hover:bg-[#262626] text-[13.5px] font-semibold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="pc-btn-primary">
                  Add IP rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
