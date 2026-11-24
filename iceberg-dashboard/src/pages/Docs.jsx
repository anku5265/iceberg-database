import { useState } from 'react'
import { API_URL } from '../lib/config'
import { CodeBlock } from '../components/CodeBlock'
import { trackFounderEvent } from '../lib/api'

const NAV = [
  {
    group: 'Getting Started',
    items: [
      { id: 'quickstart', title: 'Quickstart (2 Min)' },
      { id: 'cookbook', title: 'Practical Cookbook' },
      { id: 'authentication', title: 'Authentication' },
      { id: 'concepts', title: 'Core Concepts' },
      { id: 'limits', title: 'Pricing & Rate Limits' },
    ]
  },
  {
    group: 'API Reference',
    items: [
      { id: 'memory', title: '4-Tier Agent Memory (v1.0.0)' },
      { id: 'collections', title: 'Collections' },
      { id: 'indexing', title: 'Indexing & Files' },
      { id: 'search', title: 'Hybrid Search' },
      { id: 'assistants', title: 'No-Code Assistants' },
    ]
  },
  {
    group: 'Official SDKs (v1.0.0)',
    items: [
      { id: 'python', title: 'Python (PyPI)' },
      { id: 'javascript', title: 'JavaScript / TS (npm)' },
      { id: 'go', title: 'Go SDK' },
      { id: 'rust', title: 'Rust Crate' },
      { id: 'java', title: 'Java / Spring' },
      { id: 'dotnet', title: '.NET / C# (NuGet)' },
      { id: 'mcp', title: 'MCP Server (Claude/Cursor)' },
      { id: 'frameworks', title: 'LangChain & LlamaIndex' },
      { id: 'rest', title: 'REST API & cURL' },
    ]
  },
]

const CONTENT = {
  quickstart: {
    title: 'Quickstart — Iceberg DB v1.0.0 in 2 Minutes',
    desc: 'Install the official v1.0.0 SDK, index vectors with built-in 384d CPU embeddings, and run 1.95 ms p50 dense / 8.73 ms p50 hybrid RRF search.',
    sections: [
      {
        heading: '1. Sign up & get your free API key',
        text: 'Create a free account at **dashboard.icebergdb.in/signup**. Your `ib_...` API key is generated immediately.',
      },
      {
        heading: '2. Install the Official Python or JS SDK',
        code: `# Python (PyPI)\npip install icebergdb\n\n# JavaScript / TypeScript (npm)\nnpm install icebergdb`,
        lang: 'bash',
      },
      {
        heading: '3A. Cognitive AI Memory (Recommended for Agents & Chatbots)',
        text: 'No need to manually embed vectors or manage collections — pass raw text or conversations and Iceberg automatically extracts facts, resolves contradictions, and applies Ebbinghaus time-decay.',
        code: `from icebergdb import IcebergMemory

mem = IcebergMemory(api_key="ib_your_api_key")

# 1. Remember facts (Auto-Embedding + Auto-Fact Extraction + Conflict Resolution)
mem.remember(
    text="Ankush is the founder of IcebergDB and prefers Python and dark mode.",
    user_id="user_ankush",
    importance=0.95
)

# 2. Recall relevant memories (Hybrid Semantic + BM25 + Cognitive Decay)
hits = mem.recall(
    query="What are the user's preferences and role?",
    user_id="user_ankush",
    limit=3
)
for h in hits["memories"]:
    print(f"[{h['score']:.3f}] {h['text']}")`,
        lang: 'python',
      },
      {
        heading: '3B. Vector Collections & Hybrid RAG Search',
        text: 'Want direct control over collections, document chunks, and PDF uploads? Use the `Client` interface:',
        code: `from iceberg import Client

client = Client(api_key="ib_your_api_key")

# Create a collection & index documents
client.create_collection("my_docs")
client.index_text("my_docs", "Iceberg is India's sovereign vector & cognitive memory database.")
client.index_text("my_docs", "Hybrid search combines 384d semantic vectors and Okapi BM25 keyword ranking.")

# Hybrid Search (Dense Vector + Keyword RRF)
results = client.search("my_docs", "what is Iceberg?", search_type="hybrid", alpha=0.7)
for r in results:
    print(f"{r.score:.2f} — {r.text}")`,
        lang: 'python',
      },
    ]
  },

  cookbook: {
    title: 'Practical Cookbook — Real-World AI Recipes',
    desc: 'Copy-paste production templates for building stateful AI Chatbots and Autonomous Agents.',
    sections: [
      {
        heading: 'Recipe 1: Building an AI Chatbot with Persistent User Memory',
        text: 'Give any LLM (OpenAI, Gemini, Claude, Groq) permanent memory across sessions so it never forgets the user.',
        code: `from icebergdb import IcebergMemory
from openai import OpenAI

memory = IcebergMemory(api_key="ib_your_api_key")
llm = OpenAI(api_key="sk-...")

def chat_with_memory(user_id: str, user_message: str) -> str:
    # 1. Recall past memories about this specific user
    past = memory.recall(query=user_message, user_id=user_id, limit=5)
    context_str = "\\n".join([f"- {m['text']}" for m in past.get("memories", [])])

    # 2. Inject recalled memories into the system prompt
    messages = [
        {"role": "system", "content": f"You are a helpful AI assistant.\\nKnown user memories:\\n{context_str}"},
        {"role": "user", "content": user_message}
    ]
    response = llm.chat.completions.create(model="gpt-4o-mini", messages=messages)
    reply = response.choices[0].message.content

    # 3. Automatically extract and store new facts from this turn
    memory.remember(
        text=f"User said: {user_message}",
        user_id=user_id,
        extract_facts=True,
        resolve_conflicts=True
    )
    return reply`,
        lang: 'python',
      },
      {
        heading: 'Recipe 2: Multi-Agent Scoped Memory (User + Agent + Session Isolation)',
        text: 'Isolate memories between different agents (`coding_agent`, `support_agent`) while sharing global user context.',
        code: `from icebergdb import IcebergMemory

mem = IcebergMemory(api_key="ib_your_api_key")

# Store agent-specific episodic memory
mem.remember(
    text="Fixed CORS issue on production FastAPI server by allowing dashboard origin.",
    user_id="team_alpha",
    agent_id="devops_agent",
    session_id="incident_42",
    category="episodic",
    importance=0.9
)

# Recall only memories belonging to devops_agent for team_alpha
res = mem.recall(
    query="How did we fix the CORS issue?",
    user_id="team_alpha",
    agent_id="devops_agent"
)
print(res["memories"][0]["text"])`,
        lang: 'python',
      },
    ]
  },

  authentication: {
    title: 'Authentication & Scoped RBAC Keys',
    desc: 'All API requests authenticate via the X-API-Key header.',
    sections: [
      {
        heading: 'API Key Header',
        text: 'Pass your API key in the **X-API-Key** header on every request.',
        code: `curl https://api.icebergdb.in/collections \\\n  -H "X-API-Key: ib_your_api_key"`,
        lang: 'bash',
      },
      {
        heading: 'Role-Based Access Control (RBAC)',
        text: 'Create scoped sub-keys for microservices and frontend clients:',
        list: [
          '**admin** — Full access: create/delete collections, manage keys, index & search',
          '**read_write** — Can index documents, store memories, and search; cannot delete collections',
          '**read_only** — Search and recall only; safe for restricted worker services',
        ]
      },
      {
        heading: 'Create Additional Scoped Keys (Python)',
        code: `from iceberg import Client\n\nclient = Client(api_key="ib_admin_key")\nkey = client.create_key(name="production_worker", role="read_write")\nprint(key["api_key"])`,
        lang: 'python',
      },
    ]
  },

  concepts: {
    title: 'Core Architecture & Concepts',
    desc: 'How Iceberg combines High-Speed Vector Search, Okapi BM25, and Human-Like Cognitive Memory.',
    sections: [
      {
        heading: '1. Cognitive Memory vs Raw Vector Storage',
        text: 'Standard vector databases (Pinecone, Qdrant) only store dumb float arrays. Iceberg adds a **Cognitive Memory Layer** with automatic fact extraction, contradiction resolution (replacing outdated facts when a user changes their mind), and **Ebbinghaus Memory Decay** (`Score * exp(-lambda * age) * (1 + alpha * importance)`).',
      },
      {
        heading: '2. Single-Pass Hybrid Search (Dense 384d + BM25)',
        text: 'Every document and memory is indexed into both a **384-dimensional Cosine Vector Index** and an **Okapi BM25 Inverted Keyword Index**. Setting `alpha=0.7` blends 70% deep semantic meaning with 30% exact keyword matching.',
        code: `results = client.search(\n    "my_docs",\n    "DPDP compliance section 4",\n    search_type="hybrid",\n    alpha=0.7\n)`,
        lang: 'python',
      },
      {
        heading: '3. Multi-Tenant Scoped Isolation',
        text: 'Every memory and vector supports zero-leakage isolation via `user_id`, `agent_id`, `session_id`, and custom metadata filters.',
      }
    ]
  },

  limits: {
    title: 'Canonical Pricing, Rate Limits & Plan Quotas (v1.0.0)',
    desc: 'Identical pricing and quota specification enforced across icebergdb.in, dashboard.icebergdb.in, and api.icebergdb.in.',
    sections: [
      {
        heading: 'Canonical Plan Quotas & Rate Limits (INR & USD)',
        list: [
          '**Free Plan (₹0 / $0 • Forever free):** Up to **100,000 vectors** (384d), **1,000 / day** search queries, **1 GB storage**, **60 req/min** burst limit, unlimited collections, **1 project**, max file upload **10 MB**, never pauses.',
          '**Starter Plan (₹799/mo / $10/mo • ₹7,990/yr ($100/yr)):** Up to **1,000,000 vectors** (384d), **20,000 / day** search queries, **5 GB storage**, **300 req/min** burst limit, unlimited collections, **5 projects**, max file upload **25 MB**, email support.',
          '**Growth Plan (₹3,499/mo / $42/mo • ₹34,990/yr ($420/yr)):** Up to **5,000,000 vectors** (384d), **100,000 / day** search queries, **25 GB storage**, **1,000 req/min** burst limit, unlimited collections, **15 projects**, max file upload **50 MB**, priority support.',
          '**Scale Plan (₹9,999/mo / $119/mo • ₹99,990/yr ($1,190/yr)):** Up to **20,000,000 vectors** (384d), **500,000 / day** search queries, **100 GB storage**, **3,000 req/min** burst limit, unlimited collections, **Unlimited projects**, max file upload **100 MB**, dedicated Slack & WhatsApp.',
        ],
      },
      {
        heading: 'Measured Engine Latency & Pay-As-You-Grow Overage',
        list: [
          '**Pure Dense Vector Lookup (384d Cosine HNSW):** 1.42 ms min • **1.95 ms median (p50)** • 3.80 ms p95.',
          '**Hybrid RRF Search (Dense + Okapi BM25):** 6.40 ms min • **8.73 ms median (p50)** • 13.39 ms p95.',
          '**Server-Side CPU Embedding (ONNX all-MiniLM-L6-v2):** **48.25 ms min** • **112.34 ms p50** ($0 external OpenAI key cost).',
          '**Pay-As-You-Grow Overage:** ₹100 per 100K extra vectors and ₹50 per 50K extra queries.',
        ],
      },
    ],
  },

  memory: {
    title: 'Cognitive Memory API (/v1/memory)',
    desc: 'Autonomous long-term, episodic, and semantic memory with auto-extraction and conflict resolution.',
    sections: [
      {
        heading: 'Store & Extract Memories (/v1/memory/remember)',
        code: `from icebergdb import IcebergMemory

mem = IcebergMemory(api_key="ib_your_key")

res = mem.remember(
    text="I moved from Delhi to Bengaluru last week and switched from React to Vue.",
    user_id="user_123",
    agent_id="assistant_v1",
    category="long_term",       # long_term | episodic | semantic | short_term
    importance=0.85,            # 0.0 to 1.0 priority weight
    extract_facts=True,         # Auto-splits into atomic facts
    resolve_conflicts=True      # Automatically supersedes old "lives in Delhi" fact!
)
print(res)`,
        lang: 'python',
      },
      {
        heading: 'Recall with Cognitive Decay (/v1/memory/recall)',
        code: `memories = mem.recall(
    query="Where does the user live and what framework do they use?",
    user_id="user_123",
    limit=5,
    use_decay=True              # Applies Ebbinghaus recency + importance weighting
)

for m in memories["memories"]:
    print(f"Score: {m['score']:.3f} | Fact: {m['text']}")`,
        lang: 'python',
      },
      {
        heading: 'REST cURL Example (/v1/memory/remember)',
        code: `curl -X POST https://api.icebergdb.in/v1/memory/remember \\\n  -H "X-API-Key: ib_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "text": "User prefers concise code examples in Python",\n    "user_id": "user_123",\n    "importance": 0.9,\n    "extract_facts": true,\n    "resolve_conflicts": true\n  }'`,
        lang: 'bash',
      }
    ]
  },

  collections: {
    title: 'Collections API',
    desc: 'Create, inspect, list, and delete vector collections.',
    sections: [
      {
        heading: 'Create Collection (Python)',
        code: `from iceberg import Client\nclient = Client(api_key="ib_your_key")\nclient.create_collection("products", description="E-commerce catalog")`,
        lang: 'python',
      },
      {
        heading: 'Create Collection (cURL)',
        code: `curl -X POST https://api.icebergdb.in/collections \\\n  -H "X-API-Key: ib_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "products", "description": "E-commerce catalog"}'`,
        lang: 'bash',
      },
      {
        heading: 'List & Delete Collections',
        code: `collections = client.list_collections()\nprint(collections)\n\nclient.delete_collection("products")`,
        lang: 'python',
      }
    ]
  },

  indexing: {
    title: 'Indexing Text & Uploading Files (PDF, TXT, MD)',
    desc: 'Automatically chunk, embed (384d), and index text or documents in one call.',
    sections: [
      {
        heading: 'Index Plain Text',
        code: `client.index_text(\n    collection="my_docs",\n    text="Iceberg DB provides 1.95 ms p50 dense search and 8.73 ms p50 hybrid RRF search.",\n    source="architecture_guide"\n)`,
        lang: 'python',
      },
      {
        heading: 'Upload PDF / Markdown / TXT Files',
        code: `# Automatically extracts text, splits into overlapping chunks, and embeds\nclient.upload("my_docs", "company_handbook.pdf")`,
        lang: 'python',
      },
      {
        heading: 'REST File Upload (cURL)',
        code: `curl -X POST https://api.icebergdb.in/documents/upload \\\n  -H "X-API-Key: ib_your_key" \\\n  -F "collection=my_docs" \\\n  -F "file=@company_handbook.pdf"`,
        lang: 'bash',
      }
    ]
  },

  search: {
    title: 'Hybrid, Semantic & Keyword Search API',
    desc: 'Query your collections with Reciprocal Rank Fusion (Dense Cosine + Okapi BM25).',
    sections: [
      {
        heading: 'Search Modes (Hybrid, Semantic, Keyword)',
        code: `# 1. Hybrid Search (Default — combines Vector Similarity + BM25 Keywords)\nresults = client.search("my_docs", "refund policy", search_type="hybrid", alpha=0.6, top_k=5)\n\n# 2. Pure Semantic Search (Meaning-based)\nresults = client.search("my_docs", "money back guarantee", search_type="semantic")\n\n# 3. Pure Keyword Search (Exact BM25 term match)\nresults = client.search("my_docs", "INV-2026-994", search_type="keyword")`,
        lang: 'python',
      },
      {
        heading: 'REST Search (cURL)',
        code: `curl -X POST https://api.icebergdb.in/search \\\n  -H "X-API-Key: ib_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "collection": "my_docs",\n    "query": "refund policy",\n    "top_k": 5,\n    "search_type": "hybrid",\n    "alpha": 0.6\n  }'`,
        lang: 'bash',
      }
    ]
  },

  assistants: {
    title: 'No-Code RAG Assistants & Website Widget',
    desc: 'Deploy a custom AI chatbot trained on your collections in 60 seconds.',
    sections: [
      {
        heading: '1. Create an Assistant in the Dashboard',
        text: 'Open **Assistants** in the sidebar → **New Assistant**. Select your collection and choose any LLM provider (**Iceberg Native AI**, **OpenAI**, **Anthropic Claude**, **Google Gemini**, **Groq Llama 3.3**, or **DeepSeek**).',
      },
      {
        heading: '2. Embed on Any Website (1-Line Script)',
        code: `<script src="https://api.icebergdb.in/assistant/YOUR_ASSISTANT_ID/widget.js" async></script>`,
        lang: 'html',
      },
      {
        heading: '3. WhatsApp Business Webhook',
        code: `https://api.icebergdb.in/assistant/YOUR_ASSISTANT_ID/whatsapp`,
        lang: 'text',
      }
    ]
  },

  python: {
    title: 'Official Python SDK (PyPI: icebergdb v1.0.0)',
    desc: 'pip install icebergdb — Canonical v1.0.0 PyPI package (https://pypi.org/project/icebergdb/1.0.0/). Supports both Vector Collections (Client) and Cognitive Memory (IcebergMemory).',
    sections: [
      {
        heading: 'Official Package & Deprecation Notice (v1.0.0)',
        text: 'Canonical PyPI package: **icebergdb** (version **v1.0.0**, tested on Python 3.9+ clean virtualenv). Legacy pre-release beta names (**iceberg-db**, **iceberg-python**) are deprecated and must not be used.',
      },
      {
        heading: 'Installation (PyPI v1.0.0)',
        code: `# Standard install (v1.0.0)
pip install icebergdb

# Version-pinned install
pip install icebergdb==1.0.0`,
        lang: 'bash',
      },
      {
        heading: 'Verified v1.0.0 Example (Vector Collections + 4-Tier Memory)',
        code: `from iceberg import Client
from icebergdb import IcebergMemory

# 1. Vector Collections & Hybrid RRF Search (Canonical Client)
client = Client(api_key="ib_your_key")
client.create_collection("my_docs")
client.index_text("my_docs", "Our return policy allows 30 day returns.", source="catalog")

results = client.search("my_docs", "can I return my order?", search_type="hybrid", top_k=5)
for r in results:
    print(f"{r.score:.3f} — {r.text}")

# 2. 4-Tier Agent Memory
client.remember("agent_001", "User prefers dark mode", memory_type="long_term")
memories = client.recall("agent_001", "what does user prefer?", top_k=3)

# 3. High-Level Cognitive Memory Engine (Auto-Fact Extraction & Conflict Resolution)
mem = IcebergMemory(api_key="ib_your_key")
mem.remember("User is building an AI SaaS in Python", user_id="u_1", importance=0.9)
print(mem.recall("What is the user building?", user_id="u_1"))`,
        lang: 'python',
      }
    ]
  },

  javascript: {
    title: 'Official JavaScript / TypeScript SDK (npm: icebergdb v1.0.0)',
    desc: 'npm install icebergdb — Canonical v1.0.0 zero-dependency TypeScript client for Node.js, Next.js, Edge Runtime, Deno, and Bun.',
    sections: [
      {
        heading: 'Official Package & Deprecation Notice (v1.0.0)',
        text: 'Canonical npm package: **icebergdb** (version **v1.0.0**, tested on Node.js 18+, Next.js, Deno, and Bun). Legacy pre-release package names (**iceberg-js-sdk**, **iceberg-db**) are deprecated and must not be used.',
      },
      {
        heading: 'Installation (npm v1.0.0)',
        code: `# Standard install (v1.0.0)
npm install icebergdb

# Version-pinned install
npm install icebergdb@1.0.0`,
        lang: 'bash',
      },
      {
        heading: 'Verified v1.0.0 TypeScript / Node.js Usage',
        code: `import { Client, IcebergMemory } from 'icebergdb'

// 1. Vector Collections & Hybrid RRF Search
const client = new Client({ apiKey: process.env.ICEBERG_API_KEY || 'ib_your_key' })

await client.createCollection('my_docs')
await client.indexText('my_docs', 'Our return policy allows 30 day returns.')

const results = await client.search('my_docs', 'return order', {
  topK: 5,
  searchType: 'hybrid',
  alpha: 0.5,
})
results.forEach(r => console.log(r.score, r.text))

// 2. Cognitive Agent Memory
const memory = new IcebergMemory({ apiKey: process.env.ICEBERG_API_KEY || 'ib_your_key' })
await memory.remember({
  text: 'Customer prefers dark mode and monthly GST invoices.',
  userId: 'cust_99',
  importance: 0.9,
})`,
        lang: 'javascript',
      }
    ]
  },

  go: {
    title: 'Official Go SDK (v1.0.0)',
    desc: 'go get github.com/anku5265/iceberg-database/iceberg-sdk-go — Canonical v1.0.0 Go module.',
    sections: [
      {
        heading: 'Official Module & Deprecation Notice (v1.0.0)',
        text: 'Canonical Go module: **github.com/anku5265/iceberg-database/iceberg-sdk-go** (version **v1.0.0**, tested on Go 1.21+). Legacy pre-release name (**iceberg-go**) is deprecated.',
      },
      {
        heading: 'Installation (v1.0.0)',
        code: `# Standard install (v1.0.0)
go get github.com/anku5265/iceberg-database/iceberg-sdk-go

# Version-pinned install
go get github.com/anku5265/iceberg-database/iceberg-sdk-go@v1.0.0`,
        lang: 'bash',
      },
      {
        heading: 'Verified v1.0.0 Go Example',
        code: `package main

import (
    "fmt"
    iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"
)

func main() {
    client := iceberg.New("ib_your_key")

    // Create & index
    _ = client.CreateCollection("my_docs")
    _ = client.IndexText("my_docs", "Our return policy allows 30 day returns.", "docs")

    // Hybrid RRF Search
    res, _ := client.Search("my_docs", "return order", 5)
    for _, r := range res.Results {
        fmt.Printf("%.4f — %s\\n", r.Score, r.Text)
    }
}`,
        lang: 'go',
      }
    ]
  },

  rust: {
    title: 'Official Rust SDK (Crates.io: icebergdb v1.0.0)',
    desc: 'cargo add icebergdb — Canonical v1.0.0 async Tokio + Reqwest Rust crate on Crates.io.',
    sections: [
      {
        heading: 'Official Crate & Deprecation Notice (v1.0.0)',
        text: 'Canonical Crates.io crate: **icebergdb** (version **v1.0.0**, tested on Rust 1.75+ / Tokio 1.x). Legacy pre-release crate names (**iceberg-Vector-db**, **iceberg-rs**) are deprecated and must not be used.',
      },
      {
        heading: 'Installation (Crates.io v1.0.0)',
        code: `# Standard install (v1.0.0)
cargo add icebergdb

# Version-pinned install
cargo add icebergdb@1.0.0

# Cargo.toml
[dependencies]
icebergdb = "1.0.0"
tokio = { version = "1", features = ["full"] }`,
        lang: 'toml',
      },
      {
        heading: 'Verified v1.0.0 Rust Usage',
        code: `use icebergdb::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new("ib_your_key");

    // Create & index
    client.create_collection("my_docs").await?;
    client.index_text("my_docs", "Our return policy allows 30 day returns.", None).await?;

    // Hybrid RRF Search
    let res = client.search("my_docs", "return order", 5).await?;
    for r in res.results {
        println!("{:.4} — {}", r.score, r.text);
    }
    Ok(())
}`,
        lang: 'rust',
      }
    ]
  },

  java: {
    title: 'Official Java SDK (Maven: io.icebergdb:iceberg-sdk:1.0.0)',
    desc: 'io.icebergdb:iceberg-sdk:1.0.0 — Canonical v1.0.0 Java 17+ HTTP client for Spring Boot and JVM backends.',
    sections: [
      {
        heading: 'Official Maven Artifact & Deprecation Notice (v1.0.0)',
        text: 'Canonical Maven artifact: **io.icebergdb:iceberg-sdk:1.0.0** (version **v1.0.0**, tested on Java 17+ / Spring Boot 3.x). Legacy pre-release coordinate (**in.icebergdb:iceberg-sdk-java**) is deprecated.',
      },
      {
        heading: 'Maven Dependency (v1.0.0)',
        code: `<dependency>
  <groupId>io.icebergdb</groupId>
  <artifactId>iceberg-sdk</artifactId>
  <version>1.0.0</version>
</dependency>`,
        lang: 'xml',
      },
      {
        heading: 'Verified v1.0.0 Java Example',
        code: `import in.iceberg.Client;
import java.util.Map;

public class Example {
    public static void main(String[] args) throws Exception {
        Client client = new Client("ib_your_key");

        // Create & index
        client.createCollection("my_docs");
        client.indexText("my_docs", "Our return policy allows 30 day returns.", "docs");

        // Hybrid RRF Search
        Map<String, Object> results = client.search("my_docs", "return order", 5, "hybrid");
        System.out.println(results);
    }
}`,
        lang: 'java',
      }
    ]
  },

  dotnet: {
    title: 'Official .NET / C# SDK (NuGet: IcebergDb v1.0.0)',
    desc: 'dotnet add package IcebergDb — Canonical v1.0.0 NuGet package for .NET 8.0+ enterprise applications.',
    sections: [
      {
        heading: 'Official Package & Deprecation Notice (v1.0.0)',
        text: 'Canonical NuGet package: **IcebergDb** (version **v1.0.0**, tested on .NET 8.0+ / C# 12). Legacy pre-release package names (**Iceberg.VectorDB**, **Iceberg.Net**) are deprecated and must not be used.',
      },
      {
        heading: 'Installation (NuGet v1.0.0)',
        code: `# Standard install (v1.0.0)
dotnet add package IcebergDb

# Version-pinned install
dotnet add package IcebergDb --version 1.0.0`,
        lang: 'bash',
      },
      {
        heading: 'Verified v1.0.0 C# Usage',
        code: `using IcebergDb;

var client = new IcebergClient("ib_your_key");

// Create & index
await client.CreateCollectionAsync("my_docs");
await client.IndexTextAsync("my_docs", "Our return policy allows 30 day returns.");

// Hybrid RRF Search
var results = await client.SearchAsync("my_docs", "return order", topK: 5);
foreach (var r in results.Results)
{
    Console.WriteLine($"{r.Score:F4} — {r.Text}");
}`,
        lang: 'csharp',
      }
    ]
  },

  mcp: {
    title: 'Official MCP Server (npm: iceberg-mcp v1.0.0)',
    desc: 'npx -y iceberg-mcp — Canonical v1.0.0 MCP server for Claude Code, Cursor, Windsurf, GitHub Copilot, and Gemini CLI.',
    sections: [
      {
        heading: 'Official MCP Package (v1.0.0)',
        text: 'Canonical npm package: **iceberg-mcp** (version **v1.0.0**, https://www.npmjs.com/package/iceberg-mcp). Legacy pre-release name (**iceberg-mcp-server**) is deprecated.',
      },
      {
        heading: 'Quick Add to Claude Code (v1.0.0)',
        code: `claude mcp add icebergdb --env ICEBERG_API_KEY=ib_your_api_key -- npx -y iceberg-mcp`,
        lang: 'bash',
      },
      {
        heading: 'Cursor / Windsurf / Claude Desktop (mcp.json)',
        code: `{
  "mcpServers": {
    "icebergdb": {
      "command": "npx",
      "args": ["-y", "iceberg-mcp"],
      "env": {
        "ICEBERG_API_KEY": "ib_your_api_key",
        "ICEBERG_API_URL": "https://api.icebergdb.in"
      }
    }
  }
}`,
        lang: 'json',
      },
    ],
  },

  frameworks: {
    title: 'LangChain & LlamaIndex Integrations',
    desc: 'Drop-in VectorStore and ChatMessageHistory adapters for LangChain and LlamaIndex.',
    sections: [
      {
        heading: 'LangChain Integration',
        code: `from icebergdb.integrations.langchain import IcebergVectorStore, IcebergChatMessageHistory

# 1. Persistent Chat Memory for LangChain Chains / Agents
history = IcebergChatMessageHistory(
    api_key="ib_your_key",
    user_id="user_ankush",
    session_id="chat_01"
)
history.add_user_message("We are launching Iceberg DB v1.0.0 today.")
print(history.messages)

# 2. LangChain Retriever
vectorstore = IcebergVectorStore(api_key="ib_your_key", collection_name="docs")
docs = vectorstore.similarity_search("IcebergCore launch", k=4)`,
        lang: 'python',
      },
      {
        heading: 'LlamaIndex Integration',
        code: `from icebergdb.integrations.llamaindex import IcebergVectorStore

store = IcebergVectorStore(api_key="ib_your_key", collection_name="research_papers")
store.add_texts(["Iceberg DB v1.0.0 delivers 1.95 ms p50 dense HNSW and 8.73 ms p50 hybrid RRF search in India (ap-south-1)."])
results = store.query("India vector search latency", top_k=3)`,
        lang: 'python',
      }
    ]
  },

  rest: {
    title: 'REST API Reference & OpenAPI Playground',
    desc: `Base URL: ${API_URL}`,
    sections: [
      {
        heading: 'Core Endpoints',
        list: [
          '**POST /v1/memory/remember** — Store cognitive memory (auto-extract facts & resolve conflicts)',
          '**POST /v1/memory/recall** — Recall memories with Ebbinghaus time-decay & hybrid scoring',
          '**GET /v1/memory/profile/{user_id}** — Retrieve consolidated user memory profile',
          '**GET /collections** — List all vector collections',
          '**POST /collections** — Create a new vector collection',
          '**POST /documents/text** — Chunk, embed, and index plain text',
          '**POST /documents/upload** — Upload PDF, TXT, or Markdown file',
          '**POST /search** — Execute Hybrid (Vector + BM25), Semantic, or Keyword search',
          '**GET /status** — Live server health & uptime telemetry',
        ]
      },
      {
        heading: 'Interactive Swagger UI Playground',
        text: 'Test every endpoint live in your browser using the OpenAPI 3.1 Swagger Playground:',
        code: `${API_URL}/docs`,
        lang: 'url',
      }
    ]
  },
}

function renderBold(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-[var(--text-primary)] font-semibold">{part}</strong>
      : part
  )
}

export default function Docs() {
  const [active, setActive] = useState('quickstart')
  const doc = CONTENT[active]

  const handleSelectTab = (id) => {
    setActive(id)
    try {
      const user = JSON.parse(localStorage.getItem('iceberg_user') || '{}')
      trackFounderEvent('dashboard_visit', {
        email: user.email || 'visitor',
        path: `/docs#${id}`
      })
    } catch {}
  }

  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">Documentation &amp; SDK Reference</h1>
            <span className="px-2.5 py-0.5 rounded-[2px] text-[13px] font-mono font-semibold bg-[var(--bg-surface2)] text-[var(--accent)] border border-[var(--border)]">
              {doc?.title?.split('—')[0] || 'Guides'}
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-[14.5px] mt-1.5">
            Official guides, Practical AI Cookbook, Cognitive Memory API, and 6 Native Language SDKs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`${API_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            className="pc-btn-primary"
          >
            <span>Open Interactive Swagger Docs</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="pc-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[13.5px] text-[var(--text-secondary)]">
            <span>Official SDKs</span>
            <span className="text-[var(--accent)] font-semibold">Native</span>
          </div>
          <div className="text-[19px] font-bold font-mono text-[var(--text-primary)]">6 Languages</div>
          <p className="text-[13px] text-[var(--text-secondary)]">Python, JS, Go, Rust, Java, .NET</p>
        </div>

        <div className="pc-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[13.5px] text-[var(--text-secondary)]">
            <span>Backend Host</span>
            <span className="text-emerald-500 font-semibold">Live</span>
          </div>
          <div className="text-[15.5px] font-bold font-mono text-[var(--text-primary)] truncate" title={API_URL}>
            {API_URL.replace('https://', '')}
          </div>
          <p className="text-[13px] text-[var(--text-secondary)]">Cognitive Memory + Vector API</p>
        </div>

        <div className="pc-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[13.5px] text-[var(--text-secondary)]">
            <span>Cognitive Engine</span>
            <span className="text-[var(--accent)] font-mono font-semibold">v1.0.0</span>
          </div>
          <div className="text-[17.5px] font-bold font-mono text-[var(--text-primary)]">Decay + Conflict</div>
          <p className="text-[13px] text-[var(--text-secondary)]">Auto-fact extraction &amp; scoring</p>
        </div>

        <div className="pc-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[13.5px] text-[var(--text-secondary)]">
            <span>Hybrid Pipeline</span>
            <span className="text-amber-500 font-semibold">RRF</span>
          </div>
          <div className="text-[17.5px] font-bold font-mono text-[var(--text-primary)]">Dense + BM25</div>
          <p className="text-[13px] text-[var(--text-secondary)]">Single-pass rank fusion</p>
        </div>
      </div>

      {/* ── 3. Main Split Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3 pc-card p-4 space-y-5">
          {NAV.map((group, gi) => (
            <div key={gi} className="space-y-1.5">
              <p className="text-[12.5px] uppercase tracking-[0.08em] text-[var(--text-secondary)] px-3 font-semibold">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-[2px] text-[14.5px] flex items-center justify-between cursor-pointer ${
                      active === item.id
                        ? 'bg-[var(--nav-active-bg)] text-[var(--accent)] font-semibold'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium'
                    }`}
                  >
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-[var(--border)]">
            <a
              href={`${API_URL}/docs`}
              target="_blank"
              rel="noreferrer"
              className="pc-btn-secondary w-full !justify-between"
            >
              <span>Swagger UI Playground</span>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="lg:col-span-9 pc-card p-6 md:p-8 space-y-6">
          {doc && (
            <>
              <div className="pb-4 border-b border-[var(--border)]">
                <h2 className="text-[22px] font-semibold text-[var(--text-primary)] tracking-tight">
                  {doc.title}
                </h2>
                <p className="text-[14.5px] text-[var(--text-secondary)] mt-1.5">
                  {doc.desc}
                </p>
              </div>

              <div className="space-y-8">
                {doc.sections.map((sec, si) => (
                  <div key={si} className="space-y-3">
                    {sec.heading && (
                      <h3 className="text-[17px] font-semibold text-[var(--text-primary)] flex items-center gap-2.5">
                        <span className="text-[13px] font-mono text-[var(--accent)] bg-[var(--bg-surface2)] border border-[var(--border)] px-2 py-0.5 rounded-[2px]">
                          {String(si + 1).padStart(2, '0')}
                        </span>
                        <span>{sec.heading}</span>
                      </h3>
                    )}

                    {sec.text && (
                      <p className="text-[14.5px] text-[var(--text-secondary)] leading-[1.65]">
                        {renderBold(sec.text)}
                      </p>
                    )}

                    {sec.list && (
                      <ul className="space-y-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-[2px] p-4">
                        {sec.list.map((item, li) => (
                          <li key={li} className="flex items-start gap-2.5 text-[14.5px] text-[var(--text-secondary)] leading-[1.65]">
                            <span className="text-[var(--accent)] font-bold mt-0.5">›</span>
                            <span>{renderBold(item)}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {sec.code && (
                      <CodeBlock code={sec.code} label={sec.lang || 'code'} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
