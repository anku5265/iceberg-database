// In dev: requests go to /api → proxied to localhost:8000
// In prod: requests go directly to VITE_API_URL (the Railway backend)
const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '/api'

function getKey() {
  return localStorage.getItem('iceberg_api_key') || ''
}

function headers() {
  return { 'X-API-Key': getKey(), 'Content-Type': 'application/json' }
}

export const api = {
  // Collections
  async getCollections() {
    const r = await fetch(`${BASE}/collections`, { headers: headers() })
    return r.json()
  },
  async createCollection(name, description = '') {
    const r = await fetch(`${BASE}/collections`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ name, description })
    })
    return r.json()
  },
  async deleteCollection(name) {
    const r = await fetch(`${BASE}/collections/${name}`, {
      method: 'DELETE', headers: headers()
    })
    return r.json()
  },
  async getCollection(name) {
    const r = await fetch(`${BASE}/collections/${name}`, { headers: headers() })
    return r.json()
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
