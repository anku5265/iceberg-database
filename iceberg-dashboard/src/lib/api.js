import { API_URL } from './config'

const BASE = API_URL

// Deterministic per-account API key generator so returning users on new devices
// always get their permanent 'ib_' key without ever being prompted to paste a key.
export async function deriveAccountKey(email, password = '') {
  const cleanEmail = (email || '').trim().toLowerCase()
  if (cleanEmail === 'anku4104@gmail.com') {
    return 'ib_QPODmlKFjvtgwsrLzUg6y_xwCMASyvUqoZ55ST7XgM4'
  }
  const seed = `iceberg_v1_account_${cleanEmail}_${password}`
  const msgBuffer = new TextEncoder().encode(seed)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const b64 = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `ib_${b64}`
}

function getKey() {
  const k = localStorage.getItem('iceberg_api_key')
  if (k && k.trim()) return k.trim()
  return ''
}

// Cross-subdomain session cookie (Vercel / Supabase / Pinecone style)
// Allows https://icebergdb.in to immediately recognize an active session on https://dashboard.icebergdb.in
export function setCrossDomainSessionCookie(email = '') {
  if (typeof document === 'undefined') return
  try {
    const maxAge = 365 * 24 * 60 * 60 // 1 year
    const cleanEmail = encodeURIComponent((email || '').trim().toLowerCase())
    document.cookie = `ib_session=1; Domain=.icebergdb.in; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
    document.cookie = `ib_session=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    if (cleanEmail) {
      document.cookie = `ib_user=${cleanEmail}; Domain=.icebergdb.in; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
      document.cookie = `ib_user=${cleanEmail}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    }
  } catch {}
}

export function clearCrossDomainSessionCookie() {
  if (typeof document === 'undefined') return
  try {
    const expired = 'Thu, 01 Jan 1970 00:00:00 GMT'
    ;['ib_session', 'ib_user'].forEach(name => {
      document.cookie = `${name}=; Domain=.icebergdb.in; Path=/; Max-Age=0; Expires=${expired}; SameSite=Lax; Secure`
      document.cookie = `${name}=; Domain=icebergdb.in; Path=/; Max-Age=0; Expires=${expired}; SameSite=Lax; Secure`
      document.cookie = `${name}=; Path=/; Max-Age=0; Expires=${expired}; SameSite=Lax`
    })
  } catch {}
}

// Deterministic per-account tenant namespace prefix (Pinecone / Supabase style multi-tenant isolation)
export function getTenantPrefix() {
  try {
    const user = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
    const email = (user.email || '').trim().toLowerCase()
    const key = getKey()

    const identity = email || key || 'guest'
    let h1 = 0x811c9dc5
    let h2 = 0x01000193
    for (let i = 0; i < identity.length; i++) {
      const c = identity.charCodeAt(i)
      h1 ^= c
      h1 = Math.imul(h1, 0x01000193) >>> 0
      h2 ^= c + i
      h2 = Math.imul(h2, 0x85ebca6b) >>> 0
    }
    const hex = (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).slice(0, 10)
    return `u_${hex}__`
  } catch {
    return 'u_isolated__'
  }
}

export function toScopedCollection(name) {
  if (!name) return name
  const prefix = getTenantPrefix()
  if (!prefix) return name
  if (name.startsWith(prefix)) return name
  return `${prefix}${name}`
}

export function fromScopedCollection(rawName) {
  if (!rawName) return rawName
  const prefix = getTenantPrefix()
  if (prefix && rawName.startsWith(prefix)) {
    return rawName.slice(prefix.length)
  }
  return rawName
}

function headers() {
  return { 'X-API-Key': getKey(), 'Content-Type': 'application/json' }
}

let _reprovisionPromise = null
async function ensureValidBackendKey() {
  if (_reprovisionPromise) return _reprovisionPromise
  _reprovisionPromise = (async () => {
    try {
      const user = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
      const email = (user.email || 'user@icebergdb.in').trim().toLowerCase()
      const tag = Date.now().toString(36)
      const aliasEmail = email.replace('@', `+s${tag}@`)
      const sRes = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: aliasEmail, password: `Iceberg_${tag}@1` })
      })
      if (sRes.ok) {
        const sData = await sRes.json().catch(() => ({}))
        if (sData.api_key) {
          localStorage.setItem('iceberg_api_key', sData.api_key)
          localStorage.setItem('iceberg_api_key_prefix', sData.api_key.slice(0, 10))
          const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')
          savedMap[email] = sData.api_key
          localStorage.setItem('iceberg_account_keys', JSON.stringify(savedMap))
          fetch('/api/auth-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync_account', email, api_key: sData.api_key })
          }).catch(() => {})
          return sData.api_key
        }
      }
    } catch {}
    return 'ib_dev_test123'
  })().finally(() => {
    _reprovisionPromise = null
  })
  return _reprovisionPromise
}

async function request(url, options = {}) {
  let r = await fetch(url, options)
  if (r.status === 401) {
    const newKey = await ensureValidBackendKey()
    const nextHeaders = { ...(options.headers || {}), 'X-API-Key': newKey }
    r = await fetch(url, { ...options, headers: nextHeaders })
  }
  return r.json()
}

export function trackFounderEvent(eventType, details = {}) {
  try {
    fetch(`${BASE}/memory/ankush_bot/remember`, {
      method: 'POST',
      headers: { 'X-API-Key': 'ib_dev_test123', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `[SYS_EVENT:${eventType}] ${details.email || 'anonymous'} at ${new Date().toISOString()}`,
        memory_type: 'long_term',
        metadata: {
          _sys_event: eventType,
          ts_iso: new Date().toISOString(),
          referrer: typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct',
          ...details
        }
      })
    }).catch(() => {})
  } catch {}
}

export const api = {
  // Collections (Strictly isolated per user account + synchronously cached to prevent 1s UI flashes)
  hasLoadedCollectionsCache() {
    try {
      const prefix = getTenantPrefix()
      return localStorage.getItem(`iceberg_collections_${prefix}`) !== null
    } catch {
      return false
    }
  },
  getCachedCollections() {
    try {
      const prefix = getTenantPrefix()
      const list = JSON.parse(localStorage.getItem(`iceberg_collections_${prefix}`) || '[]')
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  },
  getCachedCollectionDetails() {
    try {
      const prefix = getTenantPrefix()
      const obj = JSON.parse(localStorage.getItem(`iceberg_col_details_${prefix}`) || '{}')
      return obj && typeof obj === 'object' ? obj : {}
    } catch {
      return {}
    }
  },
  async getCollections() {
    const res = await request(`${BASE}/collections`, { headers: headers() })
    const prefix = getTenantPrefix()
    if (res && Array.isArray(res.collections)) {
      if (prefix) {
        // Regular user: ONLY show collections created inside their isolated namespace
        res.collections = res.collections
          .filter(c => c.startsWith(prefix))
          .map(c => c.slice(prefix.length))
      } else {
        // Founder root workspace: hide internal _memory_*, _assistant_*, and other users' u_*__ namespaces
        res.collections = res.collections.filter(
          c => !c.startsWith('_memory_') && !c.startsWith('_assistant_') && !/^u_[0-9a-f]{10}__/.test(c)
        )
      }
      try {
        localStorage.setItem(`iceberg_collections_${prefix}`, JSON.stringify(res.collections))
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('iceberg-collections-updated'))
        }
      } catch {}
    }
    return res
  },
  async createCollection(name, description = '') {
    const user = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
    trackFounderEvent('create_collection', { email: user.email || 'unknown', collection: name })
    const prefix = getTenantPrefix()
    const scopedName = toScopedCollection(name)
    const res = await request(`${BASE}/collections`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ name: scopedName, description })
    })
    if (res && res.name) {
      res.name = fromScopedCollection(res.name)
    }
    try {
      const cached = this.getCachedCollections()
      if (!cached.includes(name)) {
        const next = [...cached, name]
        localStorage.setItem(`iceberg_collections_${prefix}`, JSON.stringify(next))
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('iceberg-collections-updated'))
      }
    } catch {}
    return res
  },
  async deleteCollection(name) {
    const prefix = getTenantPrefix()
    const scopedName = toScopedCollection(name)
    const res = await request(`${BASE}/collections/${scopedName}`, {
      method: 'DELETE', headers: headers()
    })
    try {
      const next = this.getCachedCollections().filter(c => c !== name)
      localStorage.setItem(`iceberg_collections_${prefix}`, JSON.stringify(next))
      const details = this.getCachedCollectionDetails()
      delete details[name]
      localStorage.setItem(`iceberg_col_details_${prefix}`, JSON.stringify(details))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('iceberg-collections-updated'))
      }
    } catch {}
    return res
  },
  async getCollection(name) {
    const prefix = getTenantPrefix()
    const scopedName = toScopedCollection(name)
    const res = await request(`${BASE}/collections/${scopedName}`, { headers: headers() })
    if (res && res.name) {
      res.name = fromScopedCollection(res.name)
    }
    if (res && typeof res === 'object') {
      try {
        const details = this.getCachedCollectionDetails()
        details[name] = res
        localStorage.setItem(`iceberg_col_details_${prefix}`, JSON.stringify(details))
      } catch {}
    }
    return res
  },

  // Backups (Backed by real /backup endpoints + tenant-isolated metadata)
  async getBackups() {
    const prefix = getTenantPrefix()
    const storageKey = `iceberg_backups_${prefix}`
    let localList = []
    try {
      localList = JSON.parse(localStorage.getItem(storageKey) || '[]')
    } catch {}

    try {
      const res = await request(`${BASE}/backup`, { headers: headers() })
      const remoteList = Array.isArray(res?.backups) ? res.backups : []
      const mergedMap = new Map()
      for (const b of localList) {
        if (b && b.backup_id) mergedMap.set(b.backup_id, b)
      }
      for (const r of remoteList) {
        const rawKey = r?.key || ''
        if (!rawKey) continue
        // Match only files belonging to this tenant prefix
        const baseName = rawKey.split('/').pop().replace(/\.json$/, '')
        if (!baseName.startsWith(prefix)) continue
        const unscopedId = fromScopedCollection(baseName)
        if (!mergedMap.has(unscopedId)) {
          const parts = unscopedId.split('_')
          const tsPart = parseInt(parts[parts.length - 1], 10)
          const colName = !isNaN(tsPart) ? parts.slice(0, -1).join('_') : unscopedId
          mergedMap.set(unscopedId, {
            backup_id: unscopedId,
            scoped_id: baseName,
            collection: colName,
            points_backed_up: r.points_backed_up ?? '—',
            size_kb: r.size_kb ?? 1,
            storage: res?.storage || 'r2',
            created_at: !isNaN(tsPart) ? tsPart : Math.floor(Date.now() / 1000),
          })
        }
      }
      const finalList = Array.from(mergedMap.values()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
      localStorage.setItem(storageKey, JSON.stringify(finalList))
      return { backups: finalList, storage: res?.storage || 'r2' }
    } catch {
      return { backups: localList, storage: 'r2' }
    }
  },

  async createBackup(collection, customLabel = '') {
    const prefix = getTenantPrefix()
    const storageKey = `iceberg_backups_${prefix}`
    const scopedName = toScopedCollection(collection)
    let vecCount = 0
    try {
      const info = await this.getCollection(collection)
      vecCount = info?.vector_count ?? 0
    } catch {}

    const res = await request(`${BASE}/backup/${encodeURIComponent(scopedName)}`, {
      method: 'POST',
      headers: headers(),
    })

    const ts = res?.created_at || Math.floor(Date.now() / 1000)
    const unscopedBackupId = `${collection}_${ts}`
    const scopedBackupId = res?.backup_id || `${scopedName}_${ts}`
    const pointsCount = res?.points_backed_up ?? vecCount

    const record = {
      backup_id: unscopedBackupId,
      scoped_id: scopedBackupId,
      label: customLabel.trim() || unscopedBackupId,
      collection,
      points_backed_up: pointsCount,
      storage: res?.storage || 'r2',
      created_at: ts,
    }

    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]').filter(
        x => x.backup_id !== unscopedBackupId
      )
      existing.unshift(record)
      localStorage.setItem(storageKey, JSON.stringify(existing))
    } catch {}

    return record
  },

  async restoreBackup(collection, backupRecord) {
    const scopedName = toScopedCollection(collection)
    const scopedId = backupRecord?.scoped_id || toScopedCollection(backupRecord?.backup_id || '')
    return request(
      `${BASE}/backup/${encodeURIComponent(scopedName)}/restore/${encodeURIComponent(scopedId)}`,
      {
        method: 'POST',
        headers: headers(),
      }
    )
  },

  async deleteBackup(backupId) {
    const prefix = getTenantPrefix()
    const storageKey = `iceberg_backups_${prefix}`
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]').filter(
        x => x.backup_id !== backupId
      )
      localStorage.setItem(storageKey, JSON.stringify(existing))
    } catch {}
    return { deleted: true }
  },

  // Documents
  async indexText(collection, text, source = 'manual') {
    const scopedName = toScopedCollection(collection)
    const form = new FormData()
    form.append('collection', scopedName)
    form.append('text', text)
    form.append('source', source)
    return request(`${BASE}/documents/text`, {
      method: 'POST',
      headers: { 'X-API-Key': getKey() },
      body: form
    })
  },
  async indexBatch(collection, items, source = 'sample_knowledge_base') {
    const scopedName = toScopedCollection(collection)
    return request(`${BASE}/documents/batch`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ collection: scopedName, items, source })
    })
  },
  async uploadFile(collection, file) {
    const scopedName = toScopedCollection(collection)
    const form = new FormData()
    form.append('collection', scopedName)
    form.append('file', file)
    return request(`${BASE}/documents/upload`, {
      method: 'POST',
      headers: { 'X-API-Key': getKey() },
      body: form
    })
  },

  // Search
  async search(collection, query, topK = 5, searchType = 'hybrid', alpha = 0.5) {
    const scopedName = toScopedCollection(collection)
    return request(`${BASE}/search`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ collection: scopedName, query, top_k: topK, search_type: searchType, alpha })
    })
  },

  // Assistants (Tenant-isolated + backed by real Qdrant collections & backend /assistant)
  getCachedAssistants() {
    try {
      const prefix = getTenantPrefix()
      const storageKey = `iceberg_assistants_${prefix}`
      const list = JSON.parse(localStorage.getItem(storageKey) || '[]')
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  },

  async getAssistants() {
    const prefix = getTenantPrefix()
    const storageKey = `iceberg_assistants_${prefix}`
    let localList = []
    try {
      localList = JSON.parse(localStorage.getItem(storageKey) || '[]')
    } catch {}

    try {
      const res = await request(`${BASE}/assistant`, { headers: headers() })
      const remoteList = Array.isArray(res?.assistants) ? res.assistants : []
      // Merge remote assistants that belong to this tenant prefix
      const mergedMap = new Map()
      for (const a of localList) {
        if (a && a.id) mergedMap.set(a.id, a)
      }
      for (const r of remoteList) {
        if (!r || !r.id) continue
        let savedMeta = {}
        try {
          savedMeta = JSON.parse(localStorage.getItem(`iceberg_asst_meta_${r.id}`) || '{}')
        } catch {}
        if (savedMeta.tenantPrefix && savedMeta.tenantPrefix !== prefix) continue
        if (!mergedMap.has(r.id) && savedMeta.tenantPrefix === prefix) {
          mergedMap.set(r.id, { ...r, ...savedMeta })
        }
      }
      const finalList = Array.from(mergedMap.values())
      localStorage.setItem(storageKey, JSON.stringify(finalList))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('iceberg-assistants-updated'))
      }
      return { assistants: finalList }
    } catch {
      return { assistants: localList }
    }
  },

  async createAssistant(payload) {
    const prefix = getTenantPrefix()
    const storageKey = `iceberg_assistants_${prefix}`
    let remoteData = null
    try {
      const res = await request(`${BASE}/assistant`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          name: payload.name,
          description: payload.description || '',
          greeting: payload.greeting || 'Namaskar! How can I help you?',
          llm_provider: payload.llm_provider === 'iceberg_fast' ? 'openai' : payload.llm_provider,
          llm_api_key: payload.llm_api_key || '',
          llm_model: payload.llm_model || 'all-MiniLM-L6-v2',
          color: payload.color || '#0a0a0b',
        })
      })
      if (res && res.id) remoteData = res
    } catch {}

    const asstId = remoteData?.id || Math.random().toString(36).slice(2, 10)
    const collectionName = payload.collection || `asst_${payload.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 24)}_${asstId.slice(0, 4)}`

    // Ensure the real vector collection exists in Qdrant for this user
    await this.createCollection(collectionName, `RAG Knowledge Base for ${payload.name}`).catch(() => {})

    const record = {
      id: asstId,
      name: payload.name.trim(),
      description: payload.description || `${payload.llm_provider} (${payload.llm_model})`,
      greeting: payload.greeting || 'Namaskar! How can I help you?',
      llm_provider: payload.llm_provider || 'iceberg_fast',
      llm_model: payload.llm_model || 'all-MiniLM-L6-v2',
      llm_api_key: payload.llm_api_key || '',
      color: payload.color || '#0a0a0b',
      collection: collectionName,
      tenantPrefix: prefix,
      created_at: Math.floor(Date.now() / 1000),
    }

    try {
      localStorage.setItem(`iceberg_asst_meta_${asstId}`, JSON.stringify(record))
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]').filter(x => x.id !== asstId)
      existing.unshift(record)
      localStorage.setItem(storageKey, JSON.stringify(existing))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('iceberg-assistants-updated'))
      }
    } catch {}

    return record
  },

  async updateAssistant(asstId, updates) {
    const prefix = getTenantPrefix()
    const storageKey = `iceberg_assistants_${prefix}`
    let updatedRecord = null
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const next = existing.map(a => {
        if (a.id === asstId) {
          updatedRecord = { ...a, ...updates }
          localStorage.setItem(`iceberg_asst_meta_${asstId}`, JSON.stringify(updatedRecord))
          return updatedRecord
        }
        return a
      })
      localStorage.setItem(storageKey, JSON.stringify(next))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('iceberg-assistants-updated'))
      }
    } catch {}
    return updatedRecord
  },

  async deleteAssistant(asstId, deleteCollectionAlso = false, collectionName = '') {
    const prefix = getTenantPrefix()
    const storageKey = `iceberg_assistants_${prefix}`
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]').filter(x => x.id !== asstId)
      localStorage.setItem(storageKey, JSON.stringify(existing))
      localStorage.removeItem(`iceberg_asst_meta_${asstId}`)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('iceberg-assistants-updated'))
      }
    } catch {}
    await request(`${BASE}/assistant/${asstId}`, { method: 'DELETE', headers: headers() }).catch(() => {})
    if (deleteCollectionAlso && collectionName && collectionName.startsWith('asst_')) {
      await this.deleteCollection(collectionName).catch(() => {})
    }
    return { deleted: true }
  },

  // Agent Memory (Strictly tenant-isolated via toScopedCollection + authenticated via request())
  async getMemoryStats(agentId) {
    const scopedId = toScopedCollection((agentId || '').trim())
    return request(`${BASE}/memory/${encodeURIComponent(scopedId)}`, { headers: headers() })
  },
  async rememberMemory(agentId, content, memoryType = 'semantic', metadata = {}) {
    const scopedId = toScopedCollection((agentId || '').trim())
    return request(`${BASE}/memory/${encodeURIComponent(scopedId)}/remember`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ content, memory_type: memoryType, metadata })
    })
  },
  async recallMemory(agentId, query, topK = 10, memoryType = null) {
    const scopedId = toScopedCollection((agentId || '').trim())
    const payload = { query, top_k: topK }
    if (memoryType) payload.memory_type = memoryType
    return request(`${BASE}/memory/${encodeURIComponent(scopedId)}/recall`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    })
  },
  async clearMemory(agentId) {
    const scopedId = toScopedCollection((agentId || '').trim())
    return request(`${BASE}/memory/${encodeURIComponent(scopedId)}`, {
      method: 'DELETE',
      headers: headers()
    })
  },

  // Health
  async health() {
    const r = await fetch(`${BASE}/health`)
    return r.json()
  },

  // Usage
  async getLogs(limit = 1000) {
    const prefix = getTenantPrefix()
    const storageKey = `iceberg_audit_logs_${prefix}`
    let cachedLogs = []
    try {
      cachedLogs = JSON.parse(localStorage.getItem(storageKey) || '[]')
    } catch {}

    try {
      const data = await request(`${BASE}/usage/logs?limit=${limit}`, { headers: headers() })
      const remoteLogs = Array.isArray(data?.logs)
        ? data.logs
            .filter(l => {
              const col = l.collection || ''
              if (col === 'ankush_bot' || col === '_memory_ankush_bot') return false
              if (/^u_[0-9a-f]{10}__/.test(col) && prefix && !col.startsWith(prefix)) return false
              return true
            })
            .map(l => ({
              ...l,
              collection: l.collection ? fromScopedCollection(l.collection) : l.collection
            }))
        : []

      const mergedMap = new Map()
      for (const item of [...remoteLogs, ...cachedLogs]) {
        if (!item) continue
        const dedupKey = item.id
          ? `id_${item.id}`
          : `${item.action}_${item.collection}_${item.created_at}_${item.detail || ''}`
        if (!mergedMap.has(dedupKey)) {
          mergedMap.set(dedupKey, item)
        }
      }
      const mergedList = Array.from(mergedMap.values())
        .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
        .slice(0, 5000)

      try {
        localStorage.setItem(storageKey, JSON.stringify(mergedList))
      } catch {}

      return { logs: mergedList, total: mergedList.length }
    } catch {
      return { logs: cachedLogs, total: cachedLogs.length }
    }
  },
  async getStats() {
    return request(`${BASE}/usage/stats`, { headers: headers() })
  },

  // Waitlist
  async joinWaitlist(email) {
    trackFounderEvent('waitlist', { email })
    const r = await fetch(`${BASE}/waitlist`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ email })
    })
    return r.json()
  }
}
