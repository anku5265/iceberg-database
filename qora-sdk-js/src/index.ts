export interface SearchResult {
  text: string
  score: number
  metadata: Record<string, unknown>
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  collection: string
  total: number
}

export interface CollectionInfo {
  name: string
  vector_count: number
  status: string
}

export interface ClientOptions {
  apiKey: string
  baseUrl?: string
  timeout?: number
}

export class QoraError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'QoraError'
  }
}

export class Client {
  private apiKey: string
  private baseUrl: string

  /**
   * Qora JavaScript/TypeScript SDK
   *
   * @example
   * import { Client } from 'qora'
   * const client = new Client({ apiKey: 'your_api_key' })
   *
   * await client.createCollection('my_docs')
   * await client.indexText('my_docs', 'Hello from India!')
   *
   * const results = await client.search('my_docs', 'Indian AI')
   * results.forEach(r => console.log(r.score, r.text))
   */
  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = (options.baseUrl || 'https://api.qora.in').replace(/\/$/, '')
  }

  private async request<T>(method: string, path: string, body?: unknown, formData?: FormData): Promise<T> {
    const headers: Record<string, string> = { 'X-API-Key': this.apiKey }
    if (body && !formData) headers['Content-Type'] = 'application/json'

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: formData || (body ? JSON.stringify(body) : undefined),
    })

    if (!res.ok) {
      let detail = res.statusText
      try { detail = (await res.json()).detail || detail } catch {}
      throw new QoraError(res.status, `HTTP ${res.status}: ${detail}`)
    }

    return res.json() as T
  }

  // ── Collections ──────────────────────────────────────────────────────────

  async createCollection(name: string, description = ''): Promise<{ name: string; message: string }> {
    return this.request('POST', '/collections', { name, description })
  }

  async listCollections(): Promise<string[]> {
    const data = await this.request<{ collections: string[] }>('GET', '/collections')
    return data.collections
  }

  async deleteCollection(name: string): Promise<{ message: string }> {
    return this.request('DELETE', `/collections/${name}`)
  }

  async collectionInfo(name: string): Promise<CollectionInfo> {
    return this.request('GET', `/collections/${name}`)
  }

  // ── Indexing ──────────────────────────────────────────────────────────────

  async indexText(collection: string, text: string, source = 'sdk'): Promise<{ chunks_indexed: number }> {
    const form = new FormData()
    form.append('collection', collection)
    form.append('text', text)
    form.append('source', source)
    return this.request('POST', '/documents/text', undefined, form)
  }

  async uploadFile(collection: string, file: File | Blob, filename?: string): Promise<{ chunks_indexed: number; filename: string }> {
    const form = new FormData()
    form.append('collection', collection)
    form.append('file', file, filename)
    return this.request('POST', '/documents/upload', undefined, form)
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async search(
    collection: string,
    query: string,
    options: {
      topK?: number
      scoreThreshold?: number
      filters?: Record<string, unknown>
    } = {}
  ): Promise<SearchResult[]> {
    const data = await this.request<SearchResponse>('POST', '/search', {
      collection,
      query,
      top_k: options.topK ?? 5,
      score_threshold: options.scoreThreshold ?? 0.3,
      filters: options.filters,
    })
    return data.results
  }

  // ── Usage ─────────────────────────────────────────────────────────────────

  async usageStats(): Promise<{ searches_today: number; total_chunks_indexed: number }> {
    return this.request('GET', '/usage/stats')
  }
}
