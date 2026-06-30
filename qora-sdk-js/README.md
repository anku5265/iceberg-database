# Qora JavaScript/TypeScript SDK

## Install

```bash
npm install qora
```

## Quickstart

```typescript
import { Client } from 'qora'

const client = new Client({ apiKey: 'your_api_key' })

// Create collection
await client.createCollection('my_docs')

// Index text
await client.indexText('my_docs', 'Qora is a vector database for Indian AI teams.')

// Search
const results = await client.search('my_docs', 'Indian AI database')
results.forEach(r => console.log(r.score, r.text))

// Search with filters
const filtered = await client.search('my_docs', 'AI', {
  topK: 10,
  filters: { source: 'docs.pdf' }
})
```
