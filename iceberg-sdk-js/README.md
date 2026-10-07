# Iceberg Vector Database — Official JavaScript & TypeScript SDK

[![npm version](https://img.shields.io/npm/v/icebergdb.svg)](https://www.npmjs.com/package/icebergdb)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official Node.js, JavaScript, and TypeScript client for **Iceberg Vector Database** — high-performance vector search and RAG engine built for AI agents and production enterprise workflows.

Created by **Ankush** | [Iceberg Database](https://iceberg-dashboard.vercel.app)

---

## 📦 Installation

```bash
npm install icebergdb
```

Or using yarn / pnpm / bun:

```bash
pnpm add icebergdb
# or
yarn add icebergdb
# or
bun add icebergdb
```

---

## 🚀 Quickstart

```typescript
import { Client } from 'icebergdb'

// Initialize the Iceberg Client
const client = new Client({
  apiKey: process.env.ICEBERG_API_KEY || 'your_api_key_here',
  // baseUrl: 'https://api.icebergdb.io' // Optional custom host
})

async function main() {
  // 1. Create a Vector Collection
  await client.createCollection('support_faq', 'Customer knowledge base')

  // 2. Index Documents & Text
  await client.indexText(
    'support_faq',
    'Iceberg DB is a distributed vector database optimized for real-time AI retrieval.'
  )

  // 3. Search with semantic similarity
  const results = await client.search('support_faq', 'real-time vector search', {
    topK: 5,
    scoreThreshold: 0.2
  })

  console.log('Search Results:', results)
}

main().catch(console.error)
```

---

## 📖 API Reference

### `new Client(options)`
- `apiKey` *(string, required)*: Your Iceberg API authentication key.
- `baseUrl` *(string, optional)*: Default `https://api.icebergdb.io`.

### Collections
- `client.createCollection(name, description?)`: Create a new vector collection.
- `client.listCollections()`: List all collection names.
- `client.collectionInfo(name)`: Get vector count and status.
- `client.deleteCollection(name)`: Delete a collection.

### Indexing & Search
- `client.indexText(collection, text, source?)`: Ingest text chunks into vectors.
- `client.uploadFile(collection, file, filename?)`: Upload documents (PDF, TXT, etc.).
- `client.search(collection, query, { topK, scoreThreshold, filters })`: Perform semantic similarity search.

---

## 🛡️ License

MIT © [Ankush](https://github.com/anku5265) & [Iceberg DB](https://iceberg-dashboard.vercel.app)
