// Canonical Single Source of Truth for Iceberg DB (v1.0.0)
// Used across Homepage, Pricing, Documentation, Benchmarks, Product pages, and Status.

export const CANONICAL_SPEC = {
  version: '1.0.0',
  displayVersion: 'v1.0.0',
  region: 'Hosted in India (ap-south-1)',
  regionShort: 'India (ap-south-1)',
  positioning: {
    title: 'Vector Database, Hybrid Search & AI Agent Memory — Hosted in India (ap-south-1)',
    summary:
      'Serverless vector search infrastructure, hybrid retrieval (Dense 384d Cosine + Okapi BM25 via RRF), built-in server-side CPU embeddings (ONNX all-MiniLM-L6-v2), and 4-tier persistent AI agent memory hosted in India (ap-south-1).',
  },
  latency: {
    denseMin: '1.42 ms',
    denseP50: '1.95 ms',
    denseP95: '3.80 ms',
    bm25Min: '4.85 ms',
    bm25P50: '6.93 ms',
    bm25P95: '11.20 ms',
    hybridMin: '6.40 ms',
    hybridP50: '8.73 ms',
    hybridP95: '13.39 ms',
    embedMin: '48.25 ms',
    embedP50: '112.34 ms',
    embedP95: '145.10 ms',
  },
  plans: [
    {
      id: 'free',
      name: 'Free',
      priceInr: '₹0',
      priceUsd: '$0',
      period: '',
      yearlyInr: null,
      yearlyUsd: null,
      vectors: '100,000',
      vectorsShort: '100K',
      queriesPerDay: '1,000 / day',
      queriesShort: '1K queries/day',
      burstLimit: '60 req/min',
      storage: '1 GB',
      projects: '1 project',
      maxUpload: '10 MB',
      support: 'Community support',
      popular: false,
      features: [
        '100,000 vectors (384d)',
        '1,000 queries/day (60 req/min)',
        '1 GB storage · 1 project',
        'Unlimited collections',
        'Free built-in CPU embeddings',
        'Never pauses (zero cold starts)',
        'Community support',
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      priceInr: '₹799',
      priceUsd: '$10',
      period: '/mo',
      yearlyInr: '₹7,990/yr',
      yearlyUsd: '$100/yr',
      vectors: '1,000,000',
      vectorsShort: '1M',
      queriesPerDay: '20,000 / day',
      queriesShort: '20K queries/day',
      burstLimit: '300 req/min',
      storage: '5 GB',
      projects: '5 projects',
      maxUpload: '25 MB',
      support: 'Email support',
      popular: false,
      features: [
        '1,000,000 vectors (384d)',
        '20,000 queries/day (300 req/min)',
        '5 GB storage · 5 projects',
        'Unlimited collections',
        'Free built-in CPU embeddings',
        'Never pauses (always active)',
        'Email support',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      priceInr: '₹3,499',
      priceUsd: '$42',
      period: '/mo',
      yearlyInr: '₹34,990/yr',
      yearlyUsd: '$420/yr',
      vectors: '5,000,000',
      vectorsShort: '5M',
      queriesPerDay: '100,000 / day',
      queriesShort: '100K queries/day',
      burstLimit: '1,000 req/min',
      storage: '25 GB',
      projects: '15 projects',
      maxUpload: '50 MB',
      support: 'Priority support',
      popular: true,
      features: [
        '5,000,000 vectors (384d)',
        '100,000 queries/day (1,000 req/min)',
        '25 GB storage · 15 projects',
        'Unlimited collections',
        'Metadata filters & Hybrid RRF',
        'Point-in-time snapshot backups',
        'Priority engineering support',
      ],
    },
    {
      id: 'scale',
      name: 'Scale',
      priceInr: '₹9,999',
      priceUsd: '$119',
      period: '/mo',
      yearlyInr: '₹99,990/yr',
      yearlyUsd: '$1,190/yr',
      vectors: '20,000,000',
      vectorsShort: '20M',
      queriesPerDay: '500,000 / day',
      queriesShort: '500K queries/day',
      burstLimit: '3,000 req/min',
      storage: '100 GB',
      projects: 'Unlimited projects',
      maxUpload: '100 MB',
      support: 'Dedicated Slack & WhatsApp',
      popular: false,
      features: [
        '20,000,000 vectors (384d)',
        '500,000 queries/day (3,000 req/min)',
        '100 GB storage · Unlimited projects',
        'Unlimited collections',
        'CMEK & IP allowlist controls',
        'Dedicated Slack & WhatsApp support',
      ],
    },
  ],
  overage: {
    vectorsInr: '₹100 per 100K extra vectors',
    queriesInr: '₹50 per 50K extra queries',
  },
  sdkDeprecationNote:
    'Official v1.0.0 Package Disambiguation: Only icebergdb (PyPI, npm, Crates.io), IcebergDb (NuGet), github.com/anku5265/iceberg-database/iceberg-sdk-go (Go), io.icebergdb:iceberg-sdk:1.0.0 (Maven), and iceberg-mcp (npm MCP) are official v1.0.0 releases. Legacy pre-release beta names (iceberg-db, iceberg-js-sdk, iceberg-Vector-db, Iceberg.VectorDB) are permanently deprecated and must not be used.',
  sdks: [
    {
      id: 'python',
      language: 'Python',
      packageName: 'icebergdb',
      version: '1.0.0',
      displayVersion: 'v1.0.0',
      installCmd: 'pip install icebergdb',
      pinnedInstallCmd: 'pip install icebergdb==1.0.0',
      importLine: 'from iceberg import Client',
      registryName: 'PyPI',
      registryUrl: 'https://pypi.org/project/icebergdb/',
      deprecatedNames: ['iceberg-db', 'iceberg-python'],
      verifiedEnv: 'Python 3.9+ (clean venv)',
      codeExample: `from iceberg import Client

client = Client(api_key="ib_your_key")

# 1. Create collection & index raw text (384d CPU embedding)
client.create_collection("my_docs")
client.index_text("my_docs", "Our return policy allows 30 day returns.")

# 2. Hybrid RRF Search (Dense 384d + Okapi BM25)
results = client.search("my_docs", "can I return my order?", search_type="hybrid", top_k=5)
for r in results:
    print(f"{r.score:.3f} — {r.text}")

# 3. 4-Tier Agent Memory
client.remember("agent_001", "User prefers dark mode", memory_type="long_term")
memories = client.recall("agent_001", "what does user prefer?", top_k=3)`,
    },
    {
      id: 'javascript',
      language: 'JavaScript / TypeScript',
      packageName: 'icebergdb',
      version: '1.0.0',
      displayVersion: 'v1.0.0',
      installCmd: 'npm install icebergdb',
      pinnedInstallCmd: 'npm install icebergdb@1.0.0',
      importLine: "import { Client } from 'icebergdb'",
      registryName: 'npm',
      registryUrl: 'https://www.npmjs.com/package/icebergdb',
      deprecatedNames: ['iceberg-js-sdk', 'iceberg-db'],
      verifiedEnv: 'Node.js 18+, Next.js, Deno, Bun',
      codeExample: `import { Client } from 'icebergdb'

const client = new Client({ apiKey: 'ib_your_key' })

// 1. Create collection & index raw text
await client.createCollection('my_docs')
await client.indexText('my_docs', 'Our return policy allows 30 day returns.')

// 2. Hybrid RRF Search
const results = await client.search('my_docs', 'return order', {
  topK: 5,
  searchType: 'hybrid',
  alpha: 0.5,
})
results.forEach(r => console.log(r.score, r.text))`,
    },
    {
      id: 'rust',
      language: 'Rust',
      packageName: 'icebergdb',
      version: '1.0.0',
      displayVersion: 'v1.0.0',
      installCmd: 'cargo add icebergdb',
      pinnedInstallCmd: 'cargo add icebergdb@1.0.0',
      importLine: 'use icebergdb::Client;',
      registryName: 'Crates.io',
      registryUrl: 'https://crates.io/crates/icebergdb',
      deprecatedNames: ['iceberg-Vector-db', 'iceberg-rs'],
      verifiedEnv: 'Rust 1.75+ (Tokio 1.x)',
      codeExample: `use icebergdb::Client;

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
    },
    {
      id: 'dotnet',
      language: '.NET / C#',
      packageName: 'IcebergDb',
      version: '1.0.0',
      displayVersion: 'v1.0.0',
      installCmd: 'dotnet add package IcebergDb',
      pinnedInstallCmd: 'dotnet add package IcebergDb --version 1.0.0',
      importLine: 'using IcebergDb;',
      registryName: 'NuGet',
      registryUrl: 'https://www.nuget.org/packages/IcebergDb',
      deprecatedNames: ['Iceberg.VectorDB', 'Iceberg.Net'],
      verifiedEnv: '.NET 8.0+ / C# 12',
      codeExample: `using IcebergDb;

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
    },
    {
      id: 'go',
      language: 'Go',
      packageName: 'github.com/anku5265/iceberg-database/iceberg-sdk-go',
      version: '1.0.0',
      displayVersion: 'v1.0.0',
      installCmd: 'go get github.com/anku5265/iceberg-database/iceberg-sdk-go',
      pinnedInstallCmd: 'go get github.com/anku5265/iceberg-database/iceberg-sdk-go@v1.0.0',
      importLine: 'import iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"',
      registryName: 'pkg.go.dev',
      registryUrl: 'https://pkg.go.dev/github.com/anku5265/iceberg-database/iceberg-sdk-go',
      deprecatedNames: ['iceberg-go'],
      verifiedEnv: 'Go 1.21+',
      codeExample: `package main

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
    },
    {
      id: 'java',
      language: 'Java',
      packageName: 'io.icebergdb:iceberg-sdk:1.0.0',
      version: '1.0.0',
      displayVersion: 'v1.0.0',
      installCmd: 'io.icebergdb:iceberg-sdk:1.0.0',
      pinnedInstallCmd: '<dependency><groupId>io.icebergdb</groupId><artifactId>iceberg-sdk</artifactId><version>1.0.0</version></dependency>',
      importLine: 'import in.iceberg.Client;',
      registryName: 'Maven',
      registryUrl: 'https://github.com/anku5265/iceberg-database/tree/main/iceberg-sdk-java',
      deprecatedNames: ['in.icebergdb:iceberg-sdk-java'],
      verifiedEnv: 'Java 17+ / Spring Boot 3.x',
      codeExample: `import in.iceberg.Client;
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
    },
    {
      id: 'mcp',
      language: 'MCP Server (Claude / Cursor / Copilot)',
      packageName: 'iceberg-mcp',
      version: '1.0.0',
      displayVersion: 'v1.0.0',
      installCmd: 'npx -y iceberg-mcp',
      pinnedInstallCmd: 'npx -y iceberg-mcp@1.0.0',
      importLine: 'claude mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp',
      registryName: 'npm',
      registryUrl: 'https://www.npmjs.com/package/iceberg-mcp',
      deprecatedNames: ['iceberg-mcp-server'],
      verifiedEnv: 'Node.js 18+ (Claude Code / Cursor / Windsurf / Copilot)',
      codeExample: `{
  "mcpServers": {
    "icebergdb": {
      "command": "npx",
      "args": ["-y", "iceberg-mcp"],
      "env": {
        "ICEBERG_API_KEY": "ib_your_key",
        "ICEBERG_API_URL": "https://api.icebergdb.in"
      }
    }
  }
}`,
    },
  ],
}
