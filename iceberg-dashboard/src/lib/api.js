import { API_URL } from './config'

const BASE = API_URL

function getKey() {
  const k = localStorage.getItem('iceberg_api_key')
  if (k && k.trim()) return k.trim()
  return 'ib_dev_test123'
}

function headers() {
  return { 'X-API-Key': getKey(), 'Content-Type': 'application/json' }
}

async function request(url, options = {}) {
  let r = await fetch(url, options)
  if (r.status === 401) {
    localStorage.setItem('iceberg_api_key', 'ib_dev_test123')
    const retryHeaders = { ...(options.headers || {}), 'X-API-Key': 'ib_dev_test123' }
    r = await fetch(url, { ...options, headers: retryHeaders })
  }
  return r.json()
}

export const api = {
  // Collections
  async getCollections() {
    return request(`${BASE}/collections`, { headers: headers() })
  },
  async createCollection(name, description = '') {
    return request(`${BASE}/collections`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ name, description })
    })
  },
  async deleteCollection(name) {
    return request(`${BASE}/collections/${name}`, {
      method: 'DELETE', headers: headers()
    })
  },
  async getCollection(name) {
    return request(`${BASE}/collections/${name}`, { headers: headers() })
  },

  // Documents
  async indexText(collection, text, source = 'manual') {
    const form = new FormData()
    form.append('collection', collection)
    form.append('text', text)
    form.append('source', source)
    const r = await fetch(`${BASE}/documents/text`, {
      method: 'POST',
      headers: { 'X-API-Key': getKey() },
      body: form
    })
    return r.json()
  },
  async uploadFile(collection, file) {
    const form = new FormData()
    form.append('collection', collection)
    form.append('file', file)
    const r = await fetch(`${BASE}/documents/upload`, {
      method: 'POST',
      headers: { 'X-API-Key': getKey() },
      body: form
    })
    return r.json()
  },

  // Search
  async search(collection, query, topK = 5, searchType = 'hybrid', alpha = 0.5) {
    const r = await fetch(`${BASE}/search`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ collection, query, top_k: topK, search_type: searchType, alpha })
    })
    return r.json()
  },

  // Health
  async health() {
    const r = await fetch(`${BASE}/health`)
    return r.json()
  },

  // Usage
  async getLogs(limit = 50) {
    const r = await fetch(`${BASE}/usage/logs?limit=${limit}`, { headers: headers() })
    return r.json()
  },
  async getStats() {
    const r = await fetch(`${BASE}/usage/stats`, { headers: headers() })
    return r.json()
  },

  // Waitlist
  async joinWaitlist(email) {
    const r = await fetch(`${BASE}/waitlist`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ email })
    })
    return r.json()
  }
}
