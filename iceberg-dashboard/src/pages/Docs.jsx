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
    ]
  },
  {
    group: 'API Reference',
    items: [
      { id: 'memory', title: 'Cognitive Memory (v1)' },
      { id: 'collections', title: 'Collections' },
      { id: 'indexing', title: 'Indexing & Files' },
      { id: 'search', title: 'Hybrid Search' },
      { id: 'assistants', title: 'No-Code Assistants' },
    ]
  },
  {
    group: 'Official SDKs (6)',
    items: [
      { id: 'python', title: 'Python (PyPI)' },
      { id: 'javascript', title: 'JavaScript / TS (npm)' },
      { id: 'go', title: 'Go SDK' },
      { id: 'rust', title: 'Rust Crate' },
      { id: 'java', title: 'Java / Spring' },
      { id: 'dotnet', title: '.NET / C#' },
      { id: 'frameworks', title: 'LangChain & LlamaIndex' },
      { id: 'rest', title: 'REST API & cURL' },
    ]
  },
]

const CONTENT = {
  quickstart: {
    title: 'Quickstart — Zero to AI Memory in 2 Minutes',
    desc: 'Install the official SDK, store cognitive memories or vectors, and recall them with sub-10ms latency.',
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
        code: `client.index_text(\n    collection="my_docs",\n    text="IcebergDB provides sub-10ms hybrid vector search.",\n    source="architecture_guide"\n)`,
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
    title: 'Official Python SDK (PyPI: icebergdb)',
    desc: 'Published on PyPI — supports both Cognitive Memory (IcebergMemory) and RAG Collections (Client).',
    sections: [
      {
        heading: 'Installation',
        code: `pip install --upgrade icebergdb`,
        lang: 'bash',
      },
      {
        heading: 'Complete Python Example',
        code: `from icebergdb import IcebergMemory
from iceberg import Client

# 1. Cognitive Memory API
mem = IcebergMemory(api_key="ib_your_key")
mem.remember("User is building an AI SaaS in Python", user_id="u_1", importance=0.9)
print(mem.recall("What is the user building?", user_id="u_1"))

# 2. Vector Collections & Hybrid RAG API
client = Client(api_key="ib_your_key")
client.create_collection("knowledge_base")
client.index_text("knowledge_base", "IcebergDB supports 6 official language SDKs.")
hits = client.search("knowledge_base", "supported languages", top_k=3)
for h in hits:
    print(h.score, h.text)`,
        lang: 'python',
      }
    ]
  },

  javascript: {
    title: 'Official JavaScript / TypeScript SDK (npm: icebergdb)',
    desc: 'Zero-dependency TypeScript client for Node.js, Next.js, Cloudflare Workers, Deno, and Bun.',
    sections: [
      {
        heading: 'Installation',
        code: `npm install icebergdb`,
        lang: 'bash',
      },
      {
        heading: 'TypeScript / Node.js Usage',
        code: `import { IcebergMemory } from 'icebergdb';

const memory = new IcebergMemory({
  apiKey: process.env.ICEBERG_API_KEY,
});

// Store cognitive memory
await memory.remember({
  text: 'Customer prefers dark mode and monthly GST invoices.',
  userId: 'cust_99',
  importance: 0.9,
});

// Recall relevant memories
const res = await memory.recall({
  query: 'billing and UI preferences',
  userId: 'cust_99',
  limit: 5,
});
console.log(res.memories);`,
        lang: 'javascript',
      }
    ]
  },

  go: {
    title: 'Official Go SDK (iceberg-sdk-go)',
    desc: 'High-concurrency, zero-dependency Go client for backend microservices.',
    sections: [
      {
        heading: 'Installation',
        code: `go get github.com/anku5265/iceberg-database/iceberg-sdk-go`,
        lang: 'bash',
      },
      {
        heading: 'Go Example',
        code: `package main

import (
    "context"
    "fmt"
    iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"
)

func main() {
    client := iceberg.NewClient("ib_your_api_key")
    ctx := context.Background()

    // Remember a fact
    _, _ = client.Remember(ctx, iceberg.RememberRequest{
        Text:       "Service latency SLA is under 10ms p99",
        UserID:     "infra_team",
        Importance: 0.95,
    })

    // Recall memories
    res, _ := client.Recall(ctx, iceberg.RecallRequest{
        Query:  "What is our latency SLA?",
        UserID: "infra_team",
        Limit:  3,
    })
    fmt.Printf("Top Memory: %+v\\n", res.Memories)
}`,
        lang: 'go',
      }
    ]
  },

  rust: {
    title: 'Official Rust SDK (icebergdb crate)',
    desc: 'Async Tokio + Reqwest strongly-typed Rust SDK for ultra-low-latency systems.',
    sections: [
      {
        heading: 'Installation (Cargo.toml)',
        code: `[dependencies]\nicebergdb = "0.1"\ntokio = { version = "1", features = ["full"] }`,
        lang: 'toml',
      },
      {
        heading: 'Rust Usage',
        code: `use icebergdb::{IcebergClient, RememberRequest, RecallRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = IcebergClient::new("ib_your_api_key");

    client.remember(RememberRequest {
        text: "Rust worker node connected to India (ap-south-1) cluster".into(),
        user_id: Some("sys_rust".into()),
        importance: Some(0.9),
        ..Default::default()
    }).await?;

    let hits = client.recall(RecallRequest {
        query: "which cluster is connected?".into(),
        user_id: Some("sys_rust".into()),
        limit: Some(3),
        ..Default::default()
    }).await?;

    println!("Recalled: {:?}", hits.memories);
    Ok(())
}`,
        lang: 'rust',
      }
    ]
  },

  java: {
    title: 'Official Java SDK (Java 11+ / Spring Boot)',
    desc: 'Native HttpClient-based Java SDK for enterprise Spring Boot and JVM backends.',
    sections: [
      {
        heading: 'Maven Dependency',
        code: `<dependency>\n  <groupId>in.icebergdb</groupId>\n  <artifactId>iceberg-sdk-java</artifactId>\n  <version>1.0.0</version>\n</dependency>`,
        lang: 'xml',
      },
      {
        heading: 'Java Example',
        code: `import in.iceberg.Client;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        IcebergClient client = new IcebergClient("ib_your_api_key");

        client.remember("Enterprise banking user verified KYC", "user_404", 0.95);
        Map<String, Object> result = client.recall("KYC verification status", "user_404", 5);
        System.out.println(result);
    }
}`,
        lang: 'java',
      }
    ]
  },

  dotnet: {
    title: 'Official .NET / C# SDK (IcebergDb)',
    desc: 'Async/await .NET 8.0+ client for C# enterprise applications.',
    sections: [
      {
        heading: 'Installation',
        code: `dotnet add package IcebergDb`,
        lang: 'bash',
      },
      {
        heading: 'C# Usage',
        code: `using IcebergDb;

var client = new IcebergClient("ib_your_api_key");

await client.RememberAsync(
    text: "User prefers C# minimal APIs and Azure deployments",
    userId: "dotnet_dev",
    importance: 0.9
);

var recall = await client.RecallAsync("deployment preferences", userId: "dotnet_dev");
Console.WriteLine(recall);`,
        lang: 'csharp',
      }
    ]
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
store.add_texts(["IcebergCore delivers 32x binary quantization compression."])
results = store.query("quantization compression ratio", top_k=3)`,
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans text-[var(--text-primary)]">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Documentation &amp; SDK Reference</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {doc?.title?.split('—')[0] || 'Guides'}
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Official guides, Practical AI Cookbook, Cognitive Memory API, and 6 Native Language SDKs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`${API_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            <span>Open Interactive Swagger Docs</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── 2. Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Official SDKs</span>
            <span className="text-blue-400">Native</span>
          </div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">6 Languages</div>
          <p className="text-[11px] text-[var(--text-dim)]">Python, JS, Go, Rust, Java, .NET</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Backend Host</span>
            <span className="text-emerald-400">Live</span>
          </div>
          <div className="text-xs font-bold font-mono text-[var(--text-primary)] truncate" title={API_URL}>
            {API_URL.replace('https://', '')}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">Cognitive Memory + Vector API</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Cognitive Engine</span>
            <span className="text-purple-400">v1.0.0</span>
          </div>
          <div className="text-base font-bold font-mono text-[var(--text-primary)]">Decay + Conflict</div>
          <p className="text-[11px] text-[var(--text-dim)]">Auto-fact extraction &amp; scoring</p>
        </div>

        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Hybrid Pipeline</span>
            <span className="text-amber-400">RRF</span>
          </div>
          <div className="text-base font-bold font-mono text-[var(--text-primary)]">Dense + BM25</div>
          <p className="text-[11px] text-[var(--text-dim)]">Single-pass rank fusion</p>
        </div>
      </div>

      {/* ── 3. Main Split Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 space-y-5 shadow-sm">
          {NAV.map((group, gi) => (
            <div key={gi} className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] px-3 font-semibold">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                      active === item.id
                        ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent'
                    }`}
                  >
                    <span>{item.title}</span>
                    {active === item.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
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
              className="flex items-center justify-between px-3 py-2 text-xs text-blue-400 hover:text-blue-300 font-medium transition rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20"
            >
              <span>Swagger UI Playground</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="lg:col-span-9 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          {doc && (
            <>
              <div className="pb-4 border-b border-[var(--border)]">
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {doc.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {doc.desc}
                </p>
              </div>

              <div className="space-y-8">
                {doc.sections.map((sec, si) => (
                  <div key={si} className="space-y-3">
                    {sec.heading && (
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                          {String(si + 1).padStart(2, '0')}
                        </span>
                        <span>{sec.heading}</span>
                      </h3>
                    )}

                    {sec.text && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {renderBold(sec.text)}
                      </p>
                    )}

                    {sec.list && (
                      <ul className="space-y-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
                        {sec.list.map((item, li) => (
                          <li key={li} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                            <span className="text-blue-400 font-bold mt-0.5">›</span>
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
