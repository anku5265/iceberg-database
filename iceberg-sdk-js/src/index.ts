export interface SearchResult {
  id?: string
  text: string
  score: number
  source?: string
  chunk_index?: number
  values?: number[]
  metadata: Record<string, unknown>
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  collection: string
  total: number
}

export interface VectorRecord {
  id?: string
  values?: number[]
  vector?: number[]
  text?: string
  metadata?: Record<string, unknown>
  namespace?: string
  timestamp?: number
  importance?: number
}

export interface VectorQueryResponse {
  matches: SearchResult[]
  results: SearchResult[]
  namespace: string
  dimension?: number
  metric?: string
}

export interface CollectionStats {
  name: string
  dimension: number
  metric: string
  quantization?: string
  total_vector_count: number
  namespaces: Record<string, { vector_count: number }>
  deletion_protection?: boolean
  tags?: Record<string, string>
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
  dimension?: number
  metric?: string
  status: string
}

export interface CreateCollectionOptions {
  description?: string
  dimension?: number
  metric?: 'cosine' | 'dotproduct' | 'euclidean' | 'manhattan'
  quantization?: 'float32' | 'sq8' | 'binary'
  deletionProtection?: boolean
  tags?: Record<string, string>
}

export interface ClientOptions {
  apiKey: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
  backoffMs?: number
  integration?: string
  sourceTag?: string
}

export interface ConnectPopupOptions {
  integrationId: string
  dashboardUrl?: string
  onConnect?: (payload: { apiKey: string; projectId?: string }) => void
  onClose?: () => void
}

export function connectPopup(options: ConnectPopupOptions): Window | null {
  if (typeof window === 'undefined') {
    throw new Error('connectPopup can only be called in a browser environment.')
  }
  const base = (options.dashboardUrl || 'https://dashboard.icebergdb.in').replace(/\/$/, '')
  const url = `${base}/connect?integration=${encodeURIComponent(options.integrationId)}`
  const popup = window.open(url, 'iceberg_connect', 'width=560,height=680,menubar=no,toolbar=no')

  const onMessage = (event: MessageEvent) => {
    if (!event.origin.startsWith(base)) return
    const data = event.data as Record<string, unknown> | null
    if (
      data &&
      (data.type === 'ICEBERG_API_KEY_CONNECTED' || data.type === 'ICEBERG_CONNECT_SUCCESS') &&
      typeof data.apiKey === 'string'
    ) {
      options.onConnect?.({
        apiKey: data.apiKey,
        projectId: typeof data.projectId === 'string' ? data.projectId : undefined,
      })
      window.removeEventListener('message', onMessage)
      popup?.close()
    }
  }
  window.addEventListener('message', onMessage)

  if (popup && options.onClose) {
    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer)
        window.removeEventListener('message', onMessage)
        options.onClose?.()
      }
    }, 500)
  }

  return popup
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
  private sourceTag?: string

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = (options.baseUrl || 'https://api.icebergdb.in').replace(/\/$/, '')
    this.maxRetries = Math.max(1, options.maxRetries ?? 3)
    this.backoffMs = options.backoffMs ?? 500
    this.sourceTag = options.integration || options.sourceTag
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async request<T>(method: string, path: string, body?: unknown, formData?: FormData): Promise<T> {
    const headers: Record<string, string> = { 'X-API-Key': this.apiKey }
    if (this.sourceTag) headers['X-Iceberg-Integration'] = this.sourceTag
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

  // -- Collections ----------------------------------------------------------

  async createCollection(
    name: string,
    descriptionOrOptions: string | CreateCollectionOptions = '',
    extraOptions?: CreateCollectionOptions
  ): Promise<{ name: string; dimension?: number; metric?: string; message: string }> {
    const opts: CreateCollectionOptions =
      typeof descriptionOrOptions === 'string'
        ? { description: descriptionOrOptions, ...(extraOptions || {}) }
        : descriptionOrOptions
    return this.request('POST', '/collections', {
      name,
      description: opts.description ?? '',
      dimension: opts.dimension ?? 384,
      metric: opts.metric ?? 'cosine',
      quantization: opts.quantization ?? 'float32',
      deletion_protection: opts.deletionProtection ?? false,
      tags: opts.tags,
    })
  }

  async createIndexForModel(config: {
    name: string
    cloud?: string
    region?: string
    dimension?: number
    metric?: 'cosine' | 'dotproduct' | 'euclidean' | 'manhattan'
    embed?: { model?: string; fieldMap?: Record<string, string> }
    waitUntilReady?: boolean
    description?: string
  }): Promise<{ name: string; message: string }> {
    const desc =
      config.description ||
      `Hosted in ${config.region || 'ap-south-1'} (${config.embed?.model || 'all-MiniLM-L6-v2'})`
    return this.createCollection(config.name, {
      description: desc,
      dimension: config.dimension ?? 384,
      metric: config.metric ?? 'cosine',
    })
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

  async describeCollectionStats(name: string): Promise<CollectionStats> {
    return this.request('GET', `/collections/${name}/stats`)
  }

  // -- Raw Multi-Dimension Vectors ------------------------------------------

  async upsertVectors(
    collection: string,
    vectors: VectorRecord[],
    namespace = ''
  ): Promise<{ upserted_count: number; collection: string; namespace: string }> {
    return this.request('POST', '/vectors/upsert', {
      collection,
      vectors,
      namespace,
    })
  }

  async queryVectors(
    collection: string,
    options: {
      vector?: number[]
      queryText?: string
      topK?: number
      filter?: Record<string, unknown>
      namespace?: string
      searchType?: 'semantic' | 'keyword' | 'hybrid'
      alpha?: number
      scoreThreshold?: number
      includeValues?: boolean
      includeMetadata?: boolean
    }
  ): Promise<VectorQueryResponse> {
    return this.request('POST', '/vectors/query', {
      collection,
      vector: options.vector,
      query_text: options.queryText,
      top_k: options.topK ?? 5,
      filter: options.filter,
      namespace: options.namespace ?? '',
      search_type: options.searchType ?? 'semantic',
      alpha: options.alpha ?? 0.5,
      score_threshold: options.scoreThreshold ?? 0.0,
      include_values: options.includeValues ?? false,
      include_metadata: options.includeMetadata ?? true,
    })
  }

  async fetchVectors(collection: string, ids: string[]): Promise<{ vectors: Record<string, SearchResult> }> {
    return this.request('POST', '/vectors/fetch', { collection, ids })
  }

  async deleteVectors(
    collection: string,
    options: { ids?: string[]; filter?: Record<string, unknown>; namespace?: string; deleteAll?: boolean }
  ): Promise<{ deleted: boolean; deleted_count?: number }> {
    return this.request('POST', '/vectors/delete', {
      collection,
      ids: options.ids,
      filter: options.filter,
      namespace: options.namespace ?? '',
      delete_all: options.deleteAll ?? false,
    })
  }

  // -- Indexing & Point-Level CRUD ------------------------------------------

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

  // -- Search ---------------------------------------------------------------

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

  // -- Agent Memory ---------------------------------------------------------

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

  // -- Usage ----------------------------------------------------------------

  async usageStats(): Promise<{ searches_today: number; total_chunks_indexed: number }> {
    return this.request('GET', '/usage/stats')
  }
}

export { Client as Iceberg }
