# Iceberg Go SDK

Official Go client for [Iceberg Database](https://icebergdb.in) — high-performance, low-latency vector search engine for AI agents and RAG applications.

## 📦 Installation

```bash
go get github.com/anku5265/iceberg-database/iceberg-sdk-go
```

## 🚀 Quickstart

```go
package main

import (
	"fmt"
	"log"

	"github.com/anku5265/iceberg-database/iceberg-sdk-go"
)

func main() {
	// Initialize client (defaults to live Iceberg backend)
	client := iceberg.New("your_api_key")

	// 1. Create a collection
	err := client.CreateCollection("knowledge_base")
	if err != nil {
		log.Printf("Collection may already exist: %v", err)
	}

	// 2. Index a text document
	err = client.IndexText("knowledge_base", "Iceberg is a fast vector database built for AI applications.", "intro")
	if err != nil {
		log.Fatalf("Failed to index: %v", err)
	}

	// 3. Search for similar vectors
	resp, err := client.Search("knowledge_base", "fast vector database", 5)
	if err != nil {
		log.Fatalf("Search failed: %v", err)
	}

	fmt.Printf("Found %d results:\n", len(resp.Results))
	for i, r := range resp.Results {
		fmt.Printf("[%d] Score: %.4f | Text: %s\n", i+1, r.Score, r.Text)
	}
}
```

## 🛠️ Features

- **Vector Search:** Hybrid dense and sparse BM25 semantic retrieval.
- **Collections Management:** Create, list, inspect, and delete collections.
- **Document Indexing:** Single documents, batch uploads, and raw embeddings.
- **Agent Memory:** Long-term memory store and recall for AI agent sessions.
- **Zero Config:** Works out of the box with the live Iceberg cloud backend.

## 📄 License

MIT © [Ankush](https://github.com/anku5265)
