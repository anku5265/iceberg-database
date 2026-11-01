export interface SearchResult {
  id?: string
  text: string
  score: number
  source?: string
  chunk_index?: number
  metadata: Record<string, unknown>
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  collection: string
  total: number
}

export interface MemoryItem {
  content: string
  score: number
  type?: string
  memory_type?: string
  created_at?: number
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
  maxRetries?: number
  backoffMs?: number
}

export class IcebergError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'IcebergError'
  }
}

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504])

export class Client {
  private apiKey: string
  private baseUrl: string
  private maxRetries: number
  private backoffMs: number

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = (options.baseUrl || 'https://api.icebergdb.in').replace(/\/$/, '')
    this.maxRetries = Math.max(1, options.maxRetries ?? 3)
    this.backoffMs = options.backoffMs ?? 500
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async request<T>(method: string, path: string, body?: unknown, formData?: FormData): Promise<T> {
    const headers: Record<string, string> = { 'X-API-Key': this.apiKey }
    if (body && !formData) headers['Content-Type'] = 'application/json'

    let lastError: unknown = null

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers,
          body: formData || (body ? JSON.stringify(body) : undefined),
        })

        if (RETRYABLE_STATUS_CODES.has(res.status) && attempt < this.maxRetries - 1) {
          await this.sleep(this.backoffMs * Math.pow(2, attempt))
          continue
        }

        if (!res.ok) {
          let detail = res.statusText
          try {
            detail = (await res.json()).detail || detail
          } catch {}
          throw new IcebergError(res.status, `HTTP ${res.status}: ${detail}`)
        }

        return (await res.json()) as T
      } catch (err) {
        if (err instanceof IcebergError) {
          throw err
        }
        lastError = err
        if (attempt < this.maxRetries - 1) {
          await this.sleep(this.backoffMs * Math.pow(2, attempt))
          continue
        }
      }
    }

    throw new IcebergError(0, `Network error after ${this.maxRetries} attempts: ${String(lastError)}`)
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

  async renameCollection(name: string, newName: string): Promise<{ renamed: boolean; old_name: string; new_name: string; points_migrated: number }> {
    return this.request('PATCH', `/collections/${name}`, { new_name: newName })
  }

  async clearCollection(name: string): Promise<{ cleared: boolean; collection: string }> {
    return this.request('POST', `/collections/${name}/clear`)
  }

  async collectionInfo(name: string): Promise<CollectionInfo> {
    return this.request('GET', `/collections/${name}`)
  }

  // ── Indexing & Point-Level CRUD ──────────────────────────────────────────

  async indexText(collection: string, text: string, source = 'sdk', namespace?: string): Promise<{ chunks_indexed: number }> {
    const form = new FormData()
    form.append('collection', collection)
    form.append('text', text)
    form.append('source', source)
    if (namespace) form.append('namespace', namespace)
    return this.request('POST', '/documents/text', undefined, form)
  }

  async uploadFile(collection: string, file: File | Blob, filename?: string, namespace?: string): Promise<{ chunks_indexed: number; filename: string }> {
    const form = new FormData()
    form.append('collection', collection)
    form.append('file', file, filename)
    if (namespace) form.append('namespace', namespace)
    return this.request('POST', '/documents/upload', undefined, form)
  }

  async upsertPoint(
    collection: string,
    pointId: string,
    options: { text?: string; vector?: number[]; source?: string; metadata?: Record<string, unknown> }
  ): Promise<{ id: string; collection: string; updated: boolean }> {
    return this.request('PUT', `/documents/${collection}/points/${pointId}`, {
      text: options.text,
      vector: options.vector,
      source: options.source ?? 'sdk',
      metadata: options.metadata ?? {},
    })
  }

  async getPoint(collection: string, pointId: string): Promise<SearchResult> {
    return this.request('GET', `/documents/${collection}/points/${pointId}`)
  }

  async deletePoint(collection: string, pointId: string): Promise<{ id: string; deleted: boolean }> {
    return this.request('DELETE', `/documents/${collection}/points/${pointId}`)
  }

  async scroll(collection: string, limit = 100, offset = 0): Promise<{ points: SearchResult[]; count: number }> {
    return this.request('GET', `/documents/${collection}/scroll?limit=${limit}&offset=${offset}`)
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async search(
    collection: string,
    query: string,
    options: {
      topK?: number
      scoreThreshold?: number
      searchType?: 'hybrid' | 'semantic' | 'keyword'
      alpha?: number
      namespace?: string
      filters?: Record<string, unknown>
    } = {}
  ): Promise<SearchResult[]> {
    const data = await this.request<SearchResponse>('POST', '/search', {
      collection,
      query,
      top_k: options.topK ?? 5,
      score_threshold: options.scoreThreshold ?? 0.0,
      search_type: options.searchType ?? 'hybrid',
      alpha: options.alpha ?? 0.5,
      namespace: options.namespace,
      filters: options.filters,
    })
    return data.results
  }

  // ── Agent Memory ──────────────────────────────────────────────────────────

  async remember(
    agentId: string,
    content: string,
    memoryType: 'short_term' | 'episodic' | 'long_term' | 'semantic' = 'long_term',
    metadata: Record<string, unknown> = {}
  ): Promise<{ stored: boolean; agent_id: string; memory_type: string }> {
    return this.request('POST', `/memory/${agentId}/remember`, {
      content,
      memory_type: memoryType,
      metadata,
    })
  }

  async recall(
    agentId: string,
    query: string,
    options: { topK?: number; memoryType?: string } = {}
  ): Promise<MemoryItem[]> {
    const data = await this.request<{ memories: MemoryItem[] }>('POST', `/memory/${agentId}/recall`, {
      query,
      top_k: options.topK ?? 5,
      memory_type: options.memoryType,
    })
    return data.memories || []
  }

  async clearMemory(agentId: string): Promise<{ cleared: boolean; agent_id: string }> {
    return this.request('DELETE', `/memory/${agentId}`)
  }

  // ── Usage ─────────────────────────────────────────────────────────────────

  async usageStats(): Promise<{ searches_today: number; total_chunks_indexed: number }> {
    return this.request('GET', '/usage/stats')
  }
}
