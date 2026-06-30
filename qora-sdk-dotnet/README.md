# Qora .NET SDK

Official .NET client for [Qora](https://qora.in) — vector search for Indian AI teams.

## Requirements

- .NET 6.0+

## Installation

```bash
dotnet add package Qora
```

## Quickstart

```csharp
using Qora;

var client = new Client("your_api_key");

// Create a collection
await client.CreateCollectionAsync("my_docs");

// Index text
await client.IndexTextAsync("my_docs", "Qora is a vector database for Indian AI teams.");

// Upload a PDF
await client.UploadAsync("my_docs", "knowledge_base.pdf");

// Search
var results = await client.SearchAsync("my_docs", "Indian AI", topK: 5);
foreach (var r in results)
    Console.WriteLine($"{r.Score:F3} {r.Text}");
```

## ASP.NET Core / Dependency Injection

```csharp
// Program.cs
builder.Services.AddSingleton(new Qora.Client(
    builder.Configuration["Qora:ApiKey"]!
));
```

```json
// appsettings.json
{
  "Qora": {
    "ApiKey": "your_api_key"
  }
}
```

## Hybrid Search

```csharp
var results = await client.SearchWithOptionsAsync(
    collection: "my_docs",
    query: "affordable phone",
    topK: 10,
    searchType: "hybrid",
    alpha: 0.7   // 0.0 = keyword only, 1.0 = semantic only
);
```

## Agent Memory

```csharp
// Store memory
await client.RememberAsync("user_123", "User prefers dark mode. Lives in Delhi.", "long_term");

// Recall
var memories = await client.RecallAsync("user_123", "user preferences");
```

## API Reference

| Method | Description |
|--------|-------------|
| `CreateCollectionAsync(name)` | Create a new collection |
| `ListCollectionsAsync()` | List all collections |
| `DeleteCollectionAsync(name)` | Delete a collection |
| `IndexTextAsync(collection, text)` | Index text content |
| `UploadAsync(collection, filePath)` | Upload PDF/TXT/MD |
| `SearchAsync(collection, query, topK)` | Semantic search |
| `SearchWithOptionsAsync(...)` | Full search control |
| `RememberAsync(agentId, content, type)` | Store agent memory |
| `RecallAsync(agentId, query, topK)` | Recall agent memory |
| `UsageStatsAsync()` | Get usage stats |
| `BackupAsync(collection)` | Backup a collection |
