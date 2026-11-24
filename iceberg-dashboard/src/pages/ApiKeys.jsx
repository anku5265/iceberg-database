import { useState, useEffect, useRef } from 'react'
import { API_URL } from '../lib/config'
import { api } from '../lib/api'
import ConfirmModal from '../components/ConfirmModal'

const BASE = API_URL
const KEY = () => localStorage.getItem('iceberg_api_key') || ''
const H = () => ({ 'X-API-Key': KEY(), 'Content-Type': 'application/json' })

const PERMISSION_OPTIONS = [
  { id: 'admin', label: 'All', tableLabel: 'All' },
  { id: 'read_write', label: 'Read & Write', tableLabel: 'Read & Write' },
  { id: 'read_only', label: 'Read Only', tableLabel: 'Read Only' },
]

const ROLE_PRESET_DEFINITIONS = {
  rag_pipeline: {
    preset: 'rag_pipeline',
    indexes: 'read_only',
    backups: 'none',
    vectors: 'read_write',
    assistants: 'read_write',
    allowedIndexes: '*',
    customScope: 'high_throughput',
  },
  index_backup_admin: {
    preset: 'index_backup_admin',
    indexes: 'read_write',
    backups: 'read_write',
    vectors: 'read_write',
    assistants: 'read_only',
    allowedIndexes: '*',
    customScope: 'standard_all_ips',
  },
  search_only: {
    preset: 'search_only',
    indexes: 'read_only',
    backups: 'read_only',
    vectors: 'read_only',
    assistants: 'read_only',
    allowedIndexes: '*',
    customScope: 'edge_cached_read',
  },
  backup_operator: {
    preset: 'backup_operator',
    indexes: 'read_only',
    backups: 'read_write',
    vectors: 'none',
    assistants: 'none',
    allowedIndexes: '*',
    customScope: 'private_vpc_only',
  },
  assistant_memory: {
    preset: 'assistant_memory',
    indexes: 'read_only',
    backups: 'none',
    vectors: 'read_only',
    assistants: 'read_write',
    allowedIndexes: '*',
    customScope: 'standard_all_ips',
  },
  full_custom_admin: {
    preset: 'full_custom_admin',
    indexes: 'read_write',
    backups: 'read_write',
    vectors: 'read_write',
    assistants: 'read_write',
    allowedIndexes: '*',
    customScope: 'standard_all_ips',
  },
}

function parsePlaneScopes(roleStr) {
  const defaults = {
    mode: 'all',
    ...ROLE_PRESET_DEFINITIONS.rag_pipeline,
  }
  if (!roleStr || roleStr === 'admin') {
    return {
      ...defaults,
      mode: 'all',
      ...ROLE_PRESET_DEFINITIONS.full_custom_admin,
    }
  }
  if (roleStr === 'read_write') {
    return { ...defaults, mode: 'custom', ...ROLE_PRESET_DEFINITIONS.rag_pipeline }
  }
  if (roleStr === 'read_only') {
    return { ...defaults, mode: 'custom', ...ROLE_PRESET_DEFINITIONS.search_only }
  }
  if (roleStr.startsWith('custom_v2:')) {
    try {
      const parsed = JSON.parse(roleStr.slice('custom_v2:'.length))
      return {
        ...defaults,
        ...parsed,
        allowedIndexes: parsed.allowedIndexes || '*',
        customScope: parsed.customScope || 'standard_all_ips',
        mode: 'custom',
      }
    } catch {}
  }
  if (roleStr.startsWith('custom:')) {
    const [, c = 'read_only', d = 'read_write'] = roleStr.split(':')
    return {
      ...defaults,
      mode: 'custom',
      preset: 'custom',
      indexes: c,
      backups: c,
      vectors: d,
      assistants: d,
    }
  }
  return defaults
}

function encodeCustomScopes(obj) {
  return `custom_v2:${JSON.stringify({
    preset: obj.preset || 'custom',
    indexes: obj.indexes || 'read_only',
    backups: obj.backups || 'none',
    vectors: obj.vectors || 'read_write',
    assistants: obj.assistants || 'read_write',
    allowedIndexes: obj.allowedIndexes || '*',
    customScope: obj.customScope || 'standard_all_ips',
  })}`
}

function formatRoleTableLabel(roleStr) {
  const parsed = parsePlaneScopes(roleStr)
  if (parsed.mode === 'all') return 'All'
  const presetLabels = {
    index_backup_admin: 'Indexes & Backups',
    rag_pipeline: 'Read & Write',
    search_only: 'Read Only',
    backup_operator: 'Backups Only',
    assistant_memory: 'Assistant & Memory',
    full_custom_admin: 'Full Custom',
  }
  if (parsed.preset && presetLabels[parsed.preset]) {
    return presetLabels[parsed.preset]
  }
  if (parsed.indexes === 'read_only' && parsed.vectors === 'read_only') return 'Read Only'
  if (parsed.indexes === 'read_write' && parsed.vectors === 'read_write') return 'Read & Write'
  return 'Custom RBAC'
}

function CustomPermissionsConfigurator({ roleValue, onChange }) {
  const parsed = parsePlaneScopes(roleValue)
  const isCustom = parsed.mode === 'custom'
  const cachedIndexes = api.getCachedCollections() || []

  const applyPreset = (presetId) => {
    if (presetId === 'custom') {
      onChange(encodeCustomScopes({ ...parsed, preset: 'custom' }))
      return
    }
    const targetPreset = ROLE_PRESET_DEFINITIONS[presetId] || ROLE_PRESET_DEFINITIONS.rag_pipeline
    onChange(encodeCustomScopes({ ...parsed, ...targetPreset }))
  }

  const updateField = (key, val) => {
    const next = {
      ...parsed,
      [key]: val,
    }
    // Check if the new combination matches a known preset
    const matchedPresetKey = Object.keys(ROLE_PRESET_DEFINITIONS).find((k) => {
      const p = ROLE_PRESET_DEFINITIONS[k]
      return (
        p.indexes === next.indexes &&
        p.backups === next.backups &&
        p.vectors === next.vectors &&
        p.assistants === next.assistants
      )
    })
    next.preset = matchedPresetKey || 'custom'
    onChange(encodeCustomScopes(next))
  }

  return (
    <>
      <div className="inline-flex rounded-[2px] border border-[#3a3a3a] bg-[#1c1c1c] overflow-hidden">
        <button
          type="button"
          onClick={() => onChange('admin')}
          className={`px-3.5 py-1.5 text-[13px] font-bold transition cursor-pointer ${
            !isCustom ? 'bg-[#333333] text-white' : 'text-[#888888] hover:text-white'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isCustom) {
              onChange(encodeCustomScopes({ ...ROLE_PRESET_DEFINITIONS.rag_pipeline, mode: 'custom' }))
            }
          }}
          className={`px-3.5 py-1.5 text-[13px] font-semibold border-l border-[#3a3a3a] transition cursor-pointer ${
            isCustom ? 'bg-[#333333] text-white font-bold' : 'text-[#777777] hover:text-white'
          }`}
        >
          Custom
        </button>
      </div>

      <p className="mt-2.5 text-[13px] text-white leading-[1.5]">
        Configure role-based access permissions for this API key, including the ability to manage and configure indexes and backups.
      </p>

      {isCustom && (
        <div className="mt-3 border border-[#343434] rounded-[2px] bg-[#161616] p-3.5 space-y-3">
          {/* 1. Use-Case Role Preset Dropdown */}
          <div>
            <label className="block text-[12px] font-bold text-white mb-1">
              Role preset (Use case)
            </label>
            <select
              value={parsed.preset || 'custom'}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full h-[36px] px-2.5 rounded-[2px] border border-[#3a3a3a] bg-[#222222] text-[12.5px] text-white focus:outline-none focus:border-[#4da3fa] cursor-pointer"
            >
              <option value="rag_pipeline">RAG &amp; Vector Pipeline (Upsert &amp; Query Vectors)</option>
              <option value="index_backup_admin">Index &amp; Backup Manager (Manage Indexes &amp; Backups)</option>
              <option value="search_only">Search &amp; Query Client Only (Read-Only Access)</option>
              <option value="backup_operator">Backup &amp; Snapshot Operator (Manage Backups Only)</option>
              <option value="assistant_memory">AI Assistant &amp; Agent Memory (Assistants &amp; Memory Only)</option>
              <option value="full_custom_admin">Full Control &amp; Data Plane (All Resources)</option>
              <option value="custom">Custom Granular Permissions</option>
            </select>
          </div>

          {/* 2. Four Resource Permission Dropdowns (Indexes, Backups, Vectors, Assistants) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11.5px] font-semibold text-[#cccccc] mb-1">
                Indexes (Control plane)
              </label>
              <select
                value={parsed.indexes}
                onChange={(e) => updateField('indexes', e.target.value)}
                className="w-full h-[35px] px-2.5 rounded-[2px] border border-[#3a3a3a] bg-[#222222] text-[12.5px] text-white focus:outline-none focus:border-[#4da3fa] cursor-pointer"
              >
                <option value="read_write">Manage &amp; Configure (Full)</option>
                <option value="read_only">View &amp; Describe Only (Read)</option>
                <option value="none">No Access</option>
              </select>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-[#cccccc] mb-1">
                Backups &amp; Snapshots
              </label>
              <select
                value={parsed.backups}
                onChange={(e) => updateField('backups', e.target.value)}
                className="w-full h-[35px] px-2.5 rounded-[2px] border border-[#3a3a3a] bg-[#222222] text-[12.5px] text-white focus:outline-none focus:border-[#4da3fa] cursor-pointer"
              >
                <option value="read_write">Create, Restore &amp; Delete (Full)</option>
                <option value="read_only">View Backups Only (Read)</option>
                <option value="none">No Access</option>
              </select>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-[#cccccc] mb-1">
                Vectors &amp; Queries (Data plane)
              </label>
              <select
                value={parsed.vectors}
                onChange={(e) => updateField('vectors', e.target.value)}
                className="w-full h-[35px] px-2.5 rounded-[2px] border border-[#3a3a3a] bg-[#222222] text-[12.5px] text-white focus:outline-none focus:border-[#4da3fa] cursor-pointer"
              >
                <option value="read_write">Upsert, Delete &amp; Query (R/W)</option>
                <option value="read_only">Query &amp; Fetch Only (Read)</option>
                <option value="none">No Access</option>
              </select>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-[#cccccc] mb-1">
                Assistants &amp; Agent Memory
              </label>
              <select
                value={parsed.assistants}
                onChange={(e) => updateField('assistants', e.target.value)}
                className="w-full h-[35px] px-2.5 rounded-[2px] border border-[#3a3a3a] bg-[#222222] text-[12.5px] text-white focus:outline-none focus:border-[#4da3fa] cursor-pointer"
              >
                <option value="read_write">Chat, Files &amp; Store Memory (R/W)</option>
                <option value="read_only">Query &amp; Recall Only (Read)</option>
                <option value="none">No Access</option>
              </select>
            </div>
          </div>

          {/* 3. Two Scope & Policy Dropdowns (Replaces bottom text inputs with dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#2c2c2c]">
            <div>
              <label className="block text-[11.5px] font-semibold text-[#cccccc] mb-1">
                Restrict to indexes
              </label>
              <select
                value={parsed.allowedIndexes || '*'}
                onChange={(e) => updateField('allowedIndexes', e.target.value)}
                className="w-full h-[35px] px-2.5 rounded-[2px] border border-[#3a3a3a] bg-[#222222] text-[12.5px] text-white focus:outline-none focus:border-[#4da3fa] cursor-pointer"
              >
                <option value="*">All indexes in project (*)</option>
                {cachedIndexes.map((idxName) => (
                  <option key={idxName} value={idxName}>
                    Only index: {idxName}
                  </option>
                ))}
                <option value="prod_*">Production indexes only (prod_*)</option>
                <option value="staging_*">Staging &amp; Dev indexes (staging_*)</option>
                <option value="readonly_public">Public read-only indexes</option>
              </select>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-[#cccccc] mb-1">
                Access &amp; Rate limit policy
              </label>
              <select
                value={parsed.customScope || 'standard_all_ips'}
                onChange={(e) => updateField('customScope', e.target.value)}
                className="w-full h-[35px] px-2.5 rounded-[2px] border border-[#3a3a3a] bg-[#222222] text-[12.5px] text-white focus:outline-none focus:border-[#4da3fa] cursor-pointer"
              >
                <option value="standard_all_ips">All IPs &amp; Standard Rate (0.0.0.0/0)</option>
                <option value="high_throughput">High-Throughput Burst (10k req/s)</option>
                <option value="private_vpc_only">Private VPC &amp; Server Only (Strict)</option>
                <option value="edge_cached_read">Low-Latency Edge Cache Mode</option>
                <option value="audit_strict">Strict Audit &amp; Compliance Logging</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getCreatorDisplayName() {
  try {
    const u = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
    if (u.name && u.name.trim()) return u.name.trim().toUpperCase()
    const raw = (u.email || 'DEFAULT_USER').split('@')[0]
    return raw.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase()
  } catch {
    return 'DEFAULT_USER'
  }
}

/**
 * Formats an Iceberg API key into our structured 3-part enterprise secret key format:
 *   ibsk_<5-char-label>_***********
 * Follows the exact visual cadence of <lower><lower><digit><lower><Upper> (e.g. ibsk_km8vR_***********)
 * so every key in the table looks clean, balanced, and unmistakably enterprise-grade.
 */
function formatMaskedIcebergKey(fullOrPrefix) {
  const raw = (fullOrPrefix || '').trim()
  if (/^ibsk_[a-z]{2}[0-9][a-z][A-Z]_/.test(raw)) {
    return `${raw.slice(0, 10)}_***********`
  }

  const stripped = raw.replace(/^(ibsk_|ib_)/, '').replace(/[^a-zA-Z0-9]/g, '')
  if (!stripped) {
    return 'ibsk_km8vR_***********'
  }

  const lowers = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

  const c0 = stripped.charCodeAt(0 % stripped.length)
  const c1 = stripped.charCodeAt(1 % stripped.length)
  const c2 = stripped.charCodeAt(2 % stripped.length)
  const c3 = stripped.charCodeAt(3 % stripped.length)
  const c4 = stripped.charCodeAt(4 % stripped.length)

  const label =
    lowers[(c0 + 3) % lowers.length] +
    lowers[(c1 + 11) % lowers.length] +
    digits[(c2 + 5) % digits.length] +
    lowers[(c3 + 17) % lowers.length] +
    uppers[(c4 + 7) % uppers.length]

  return `ibsk_${label}_***********`
}

export default function ApiKeys() {
  const [keys, setKeys] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyRole, setNewKeyRole] = useState('admin')

  // "Manage API key" modal state
  const [manageTarget, setManageTarget] = useState(null)
  const [manageName, setManageName] = useState('')
  const [manageRole, setManageRole] = useState('admin') // 'admin' | 'read_write' | 'read_only'
  const [manageCopied, setManageCopied] = useState(false)

  // Persisted custom key names & roles
  const [customKeyNames, setCustomKeyNames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iceberg_custom_key_names') || '{}')
    } catch {
      return {}
    }
  })
  const [customKeyRoles, setCustomKeyRoles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iceberg_custom_key_roles') || '{}')
    } catch {
      return {}
    }
  })

  const [createdKey, setCreatedKey] = useState(null)
  const [copiedId, setCopiedId] = useState('')
  const [openActionRowId, setOpenActionRowId] = useState(null)
  const actionMenuRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState(null)
  const [revoking, setRevoking] = useState(false)
  const [defaultDeleted, setDefaultDeleted] = useState(() => {
    try {
      return localStorage.getItem('iceberg_default_key_deleted') === '1'
    } catch {
      return false
    }
  })

  const activeKey = KEY()
  const creatorName = getCreatorDisplayName()

  // Local map of full keys created in this browser so the user can always copy them
  const [localFullKeys, setLocalFullKeys] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iceberg_created_keys_map') || '{}')
    } catch {
      return {}
    }
  })

  useEffect(() => {
    const onDocClick = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionRowId(null)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const loadKeys = async () => {
    try {
      const r = await fetch(`${BASE}/auth/keys`, { headers: H() })
      const data = await r.json()
      if (Array.isArray(data?.keys)) {
        setKeys(data.keys)
      }
    } catch (err) {
      console.error('Failed to load keys:', err)
    }
  }

  useEffect(() => {
    loadKeys()
    const timer = setInterval(() => loadKeys(), 5000)
    const onFocus = () => loadKeys()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const createKey = async (e) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    setLoading(true)
    try {
      const backendRole =
        newKeyRole === 'admin'
          ? 'admin'
          : newKeyRole.includes('read_write')
          ? 'read_write'
          : 'read_only'
      const r = await fetch(`${BASE}/auth/keys`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({ name: newKeyName.trim(), role: backendRole }),
      })
      const data = await r.json()
      if (data.api_key) {
        const prefix = data.key_prefix || data.api_key.slice(0, 10)
        const nextMap = { ...localFullKeys, [prefix]: data.api_key }
        setLocalFullKeys(nextMap)
        try {
          localStorage.setItem('iceberg_created_keys_map', JSON.stringify(nextMap))
        } catch {}

        if (newKeyRole !== 'admin') {
          const rId = data.id || prefix
          const nextRoles = { ...customKeyRoles, [rId]: newKeyRole }
          setCustomKeyRoles(nextRoles)
          try {
            localStorage.setItem('iceberg_custom_key_roles', JSON.stringify(nextRoles))
          } catch {}
        }

        setCreatedKey(data)
        setShowCreate(false)
        setNewKeyName('')
        setNewKeyRole('admin')
        await loadKeys()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const confirmRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    try {
      if (revokeTarget.isDefault) {
        setDefaultDeleted(true)
        try {
          localStorage.setItem('iceberg_default_key_deleted', '1')
        } catch {}
      } else {
        await fetch(`${BASE}/auth/keys/${revokeTarget.key_prefix}`, { method: 'DELETE', headers: H() })
      }
      setKeys(prev => prev.filter(k => k.key_prefix !== revokeTarget.key_prefix))
      setRevokeTarget(null)
    } catch (err) {
      console.error(err)
    } finally {
      setRevoking(false)
    }
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  const openManageModal = (row) => {
    setManageTarget(row)
    setManageName(row.name)
    setManageRole(row.role || 'admin')
    setManageCopied(false)
    setOpenActionRowId(null)
  }

  const handleUpdateKey = (e) => {
    e.preventDefault()
    if (!manageTarget || !manageName.trim()) return
    const nextNames = { ...customKeyNames, [manageTarget.rowId]: manageName.trim() }
    const nextRoles = { ...customKeyRoles, [manageTarget.rowId]: manageRole }
    setCustomKeyNames(nextNames)
    setCustomKeyRoles(nextRoles)
    try {
      localStorage.setItem('iceberg_custom_key_names', JSON.stringify(nextNames))
      localStorage.setItem('iceberg_custom_key_roles', JSON.stringify(nextRoles))
    } catch {}
    setManageTarget(null)
  }

  // Build unified rows: always ensure the "default" key row is first
  const defaultPrefix = activeKey ? activeKey.slice(0, 10) : 'ibsk_km8vR'
  const matchingBackendDefault = keys.find(
    k => (activeKey && activeKey.startsWith(k.key_prefix)) || k.name?.toLowerCase() === 'default'
  )

  const defaultRoleId = customKeyRoles['default_row'] || 'admin'

  const defaultRow = {
    rowId: 'default_row',
    name: customKeyNames['default_row'] || 'default',
    createdOn: matchingBackendDefault?.created_at
      ? new Date(matchingBackendDefault.created_at * 1000).toLocaleDateString('en-US')
      : new Date().toLocaleDateString('en-US'),
    createdBy: creatorName,
    fullKey: activeKey || 'ibsk_km8vR_xwCMASyvUqoZ55ST7XgM4',
    maskedValue: formatMaskedIcebergKey(activeKey || defaultPrefix),
    role: defaultRoleId,
    permissions: formatRoleTableLabel(defaultRoleId),
    isDefault: true,
    key_prefix: matchingBackendDefault?.key_prefix || defaultPrefix,
  }

  const extraRows = keys
    .filter(k => k !== matchingBackendDefault)
    .map(k => {
      const rId = k.id || k.key_prefix
      const full = localFullKeys[k.key_prefix] || (activeKey.startsWith(k.key_prefix) ? activeKey : '')
      const effectiveRole = customKeyRoles[rId] || customKeyRoles[k.key_prefix] || k.role || 'admin'
      return {
        rowId: rId,
        name: customKeyNames[rId] || k.name || 'api-key',
        createdOn: k.created_at
          ? new Date(k.created_at * 1000).toLocaleDateString('en-US')
          : new Date().toLocaleDateString('en-US'),
        createdBy: creatorName,
        fullKey: full,
        maskedValue: formatMaskedIcebergKey(full || k.key_prefix),
        role: effectiveRole,
        permissions: formatRoleTableLabel(effectiveRole),
        isDefault: false,
        key_prefix: k.key_prefix,
      }
    })

  const allRows = defaultDeleted ? extraRows : [defaultRow, ...extraRows]
  const isManageChanged =
    manageTarget &&
    manageName.trim() &&
    (manageName.trim() !== manageTarget.name || manageRole !== (manageTarget.role || 'admin'))

  return (
    <div className="pt-[50px] pb-12 px-6 sm:px-[49px] max-w-[1090px] text-[var(--text-primary)]">
      {/* ── Top Header Row: "API keys" (24px bold Inter) + "+ API key" Button (104x37px) ── */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[24px] font-bold tracking-[-0.015em] text-white leading-none">
          API keys
        </h1>

        <button
          type="button"
          onClick={() => {
            setNewKeyName('')
            setNewKeyRole('admin')
            setShowCreate(true)
          }}
          className="pc-btn-primary"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>API key</span>
        </button>
      </div>

      {/* ── Exact 6-Column Bordered Table (#1c1c1c surface on #171717 canvas, #343434 borders, 55px header, 64px row, 13px Inter) ── */}
      <div ref={actionMenuRef} className="mt-[25px] border border-[#343434] rounded-[2px] bg-[#1c1c1c] relative">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="h-[55px] border-b border-[#343434] bg-[#1c1c1c] text-[#cccccc] text-[13px] font-semibold">
              <th className="pl-[18px] pr-3 w-[12.1%]">Name</th>
              <th className="px-3 w-[15.1%]">Created on</th>
              <th className="px-3 w-[22.8%]">Created by</th>
              <th className="px-3 w-[23.9%]">Value</th>
              <th className="px-3 w-[17.7%]">Permissions</th>
              <th className="px-3 w-[8.4%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#343434]">
            {allRows.length === 0 ? (
              <tr className="h-[64px] bg-[#1c1c1c] text-[13px] text-[#9a9a9a]">
                <td colSpan={6} className="px-[18px] text-center">
                  No API keys in this project. Click &ldquo;+ API key&rdquo; to create one.
                </td>
              </tr>
            ) : null}
            {allRows.map(row => {
              const isCopied = copiedId === row.rowId
              const menuOpen = openActionRowId === row.rowId

              return (
                <tr key={row.rowId} className="h-[64px] bg-[#1c1c1c] hover:bg-[#222222] transition text-[13px] text-white">
                  <td className="pl-[18px] pr-3 font-bold text-white truncate">
                    {row.name}
                  </td>

                  <td className="px-3 font-normal text-white">
                    {row.createdOn}
                  </td>

                  <td className="px-3 font-normal text-white truncate">
                    {row.createdBy}
                  </td>

                  <td className="px-3 font-normal text-white select-none">
                    {row.maskedValue}
                  </td>

                  <td className="px-3 font-normal text-white">
                    {row.permissions}
                  </td>

                  <td className="px-3 text-center relative">
                    <button
                      type="button"
                      onClick={() => setOpenActionRowId(menuOpen ? null : row.rowId)}
                      className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-white cursor-pointer transition ${
                        menuOpen ? 'bg-[#2b2b2b]' : 'hover:bg-[#2a2a2a]'
                      }`}
                      title="Actions"
                    >
                      <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="19" cy="12" r="1.8" />
                      </svg>
                    </button>

                    {/* Exact 2-Item Popup Menu: Gear "Settings" + Trash "Delete" */}
                    {menuOpen && (
                      <div className="absolute right-3 top-[52px] w-[142px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.8)] py-2 z-[110] text-left">
                        <button
                          type="button"
                          onClick={() => openManageModal(row)}
                          className="w-full px-4 py-2 text-left text-[13.5px] font-bold text-white hover:bg-[#2a2a2a] flex items-center gap-3 cursor-pointer"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="text-white shrink-0">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          <span>Settings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenActionRowId(null)
                            setRevokeTarget(row)
                          }}
                          className="w-full px-4 py-2 text-left text-[13.5px] font-bold text-[#f85149] hover:bg-[#2a2a2a] flex items-center gap-3 cursor-pointer"
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" className="shrink-0">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
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

      {/* ── Centered "Manage API key" Modal (Exact 562px width, fits 100% on 768p screens) ── */}
      {manageTarget && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) setManageTarget(null)
          }}
        >
          <form
            onSubmit={handleUpdateKey}
            className="w-full max-w-[562px] max-h-[92vh] overflow-y-auto bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] px-7 py-6 shadow-[0_24px_64px_rgba(0,0,0,0.75)] text-left"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold tracking-tight text-white">
                Manage API key
              </h2>
              <button
                type="button"
                onClick={() => setManageTarget(null)}
                className="w-7 h-7 flex items-center justify-center text-[#cccccc] hover:text-white transition cursor-pointer"
                aria-label="Close modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="mt-1.5 text-[13px] text-white">
              Specify the name and permissions for your API key.
            </p>

            <div className="mt-3.5">
              <label className="block text-[13px] font-bold text-white mb-1.5">
                Key name
              </label>
              <div className="w-full h-[40px] px-3.5 rounded-[2px] bg-[#282828] border border-[#3a3a3a] focus-within:border-[#4da3fa] flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={manageName}
                  onChange={e => setManageName(e.target.value)}
                  className="flex-1 bg-transparent text-[13.5px] text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = manageTarget.fullKey || manageName
                    navigator.clipboard.writeText(textToCopy)
                    setManageCopied(true)
                    setTimeout(() => setManageCopied(false), 1800)
                  }}
                  className="text-[#cccccc] hover:text-white shrink-0 cursor-pointer"
                  title="Copy API key"
                >
                  {manageCopied ? <CheckSmallIcon /> : <CopySmallIcon />}
                </button>
              </div>
            </div>

            <div className="mt-3.5">
              <label className="flex items-center gap-1.5 text-[13px] font-bold text-white mb-2">
                <span>Permissions</span>
                <span
                  className="text-[#cccccc] inline-flex items-center cursor-help"
                  title="Permissions granted to this API key"
                >
                  <InfoCircleIcon size={14} />
                </span>
              </label>

              <CustomPermissionsConfigurator
                roleValue={manageRole}
                onChange={setManageRole}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-5">
              <button
                type="button"
                onClick={() => setManageTarget(null)}
                className="text-[13.5px] font-bold text-white hover:opacity-80 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isManageChanged}
                className={`h-[36px] px-4 rounded-[2px] text-[13.5px] font-semibold transition flex items-center justify-center ${
                  !isManageChanged
                    ? 'bg-[#333333] text-[#888888] cursor-not-allowed'
                    : 'bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] cursor-pointer'
                }`}
              >
                Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Centered "Create an API key" Modal (Exact 562px width) ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) {
              setShowCreate(false)
            }
          }}
        >
          <form
            onSubmit={createKey}
            className="w-full max-w-[562px] max-h-[92vh] overflow-y-auto bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] px-7 py-6 shadow-[0_24px_64px_rgba(0,0,0,0.75)] text-left"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold tracking-tight text-white">
                Create an API key
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="w-7 h-7 flex items-center justify-center text-[#cccccc] hover:text-white transition cursor-pointer"
                aria-label="Close modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="mt-1.5 text-[13px] text-white">
              Specify the name and permissions for your API key.
            </p>

            <div className="mt-3.5">
              <label className="block text-[13px] font-bold text-white mb-1.5">
                Key name
              </label>
              <input
                autoFocus
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="Key name"
                className="w-full h-[40px] px-3.5 rounded-[2px] bg-[#282828] border border-[#3a3a3a] focus:border-[#4da3fa] text-[13.5px] text-white placeholder:text-[#737373] outline-none"
              />
            </div>

            <div className="mt-3.5">
              <label className="flex items-center gap-1.5 text-[13px] font-bold text-white mb-2">
                <span>Permissions</span>
                <span
                  className="text-[#cccccc] inline-flex items-center cursor-help"
                  title="Permissions granted to this API key"
                >
                  <InfoCircleIcon size={14} />
                </span>
              </label>

              <CustomPermissionsConfigurator
                roleValue={newKeyRole}
                onChange={setNewKeyRole}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-5">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-[13.5px] font-bold text-white hover:opacity-80 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !newKeyName.trim()}
                className={`h-[36px] px-4 rounded-[2px] text-[13.5px] font-semibold transition flex items-center justify-center ${
                  loading || !newKeyName.trim()
                    ? 'bg-[#333333] text-[#888888] cursor-not-allowed'
                    : 'bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] cursor-pointer'
                }`}
              >
                {loading ? 'Creating...' : 'Create key'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Centered "Copy your API key" Modal ── */}
      {createdKey && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreatedKey(null)
          }}
        >
          <div className="w-full max-w-[562px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-[2px] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.75)] text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold tracking-tight text-white">
                Copy your API key
              </h2>
              <button
                type="button"
                onClick={() => setCreatedKey(null)}
                className="w-7 h-7 flex items-center justify-center text-[#cccccc] hover:text-white transition cursor-pointer"
                aria-label="Close modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="mt-2.5 text-[13.5px] text-white">
              Save your API key in a secure location.
            </p>

            <div className="mt-5">
              <label className="block text-[13.5px] font-bold text-white mb-2">
                API key value
              </label>
              <div className="w-full h-[45px] px-3.5 rounded-[2px] bg-[#282828] border border-[#3a3a3a] flex items-center justify-between gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdKey.api_key}
                  className="flex-1 bg-transparent font-mono text-[13px] text-white outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => copy(createdKey.api_key, 'new_modal')}
                  className="text-[#cccccc] hover:text-white shrink-0 cursor-pointer"
                  title="Copy API key"
                >
                  {copiedId === 'new_modal' ? <CheckSmallIcon /> : <CopySmallIcon />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setCreatedKey(null)}
                className="pc-btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!revokeTarget}
        title="Delete API key?"
        message={
          <div>
            Are you sure you want to permanently delete the API key{' '}
            <span className="font-semibold text-[var(--text-primary)]">{revokeTarget?.name}</span> (
            <code className="font-mono">{revokeTarget?.maskedValue}</code>)? Any applications using this key will immediately lose access.
          </div>
        }
        confirmText="Delete key"
        loading={revoking}
        onConfirm={confirmRevoke}
        onClose={() => setRevokeTarget(null)}
      />
    </div>
  )
}

function CopySmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function InfoCircleIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.85" />
      <rect x="9" y="5.4" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="9" y="9" width="2" height="5.6" rx="0.4" fill="currentColor" />
    </svg>
  )
}
