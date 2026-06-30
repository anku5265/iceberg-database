# Qora Java SDK

Official Java client for [Qora](https://qora.in) — vector search for Indian AI teams.

## Requirements

- Java 11+
- Maven or Gradle

## Installation

**Maven:**
```xml
<dependency>
  <groupId>in.qora</groupId>
  <artifactId>qora-sdk</artifactId>
  <version>0.1.0</version>
</dependency>
```

**Gradle:**
```groovy
implementation 'in.qora:qora-sdk:0.1.0'
```

## Quickstart

```java
import in.qora.Client;
import in.qora.SearchResult;

Client client = new Client("your_api_key");

// Create a collection
client.createCollection("my_docs");

// Index text
client.indexText("my_docs", "Qora is a vector database for Indian AI teams.");

// Upload a PDF
client.upload("my_docs", "knowledge_base.pdf");

// Search
List<SearchResult> results = client.search("my_docs", "Indian AI", 5);
for (SearchResult r : results) {
    System.out.println(r.getScore() + " " + r.getText());
}
```

## Spring Boot

```java
@Configuration
public class QoraConfig {
    @Bean
    public Client qoraClient(@Value("${qora.api-key}") String apiKey) {
        return new Client(apiKey);
    }
}
```

```yaml
# application.yml
qora:
  api-key: ${QORA_API_KEY}
```

## Hybrid Search

```java
// Full control: hybrid, semantic, or keyword
List<SearchResult> results = client.searchWithOptions(
    "my_docs",
    "affordable phone",
    10,
    "hybrid",   // searchType
    0.7,        // alpha: 0.0=keyword, 1.0=semantic
    null,       // filters
    null        // namespace
);
```

## Agent Memory

```java
// Store memory
client.remember("user_123", "User prefers dark mode. Lives in Delhi.", "long_term");

// Recall
List<SearchResult> memories = client.recall("user_123", "user preferences", 5);
```

## API Reference

| Method | Description |
|--------|-------------|
| `createCollection(name)` | Create a new collection |
| `listCollections()` | List all collections |
| `deleteCollection(name)` | Delete a collection |
| `indexText(collection, text)` | Index text content |
| `upload(collection, filePath)` | Upload PDF/TXT/MD |
| `search(collection, query, topK)` | Semantic search |
| `searchWithOptions(...)` | Full search control |
| `remember(agentId, content, type)` | Store agent memory |
| `recall(agentId, query, topK)` | Recall agent memory |
| `usageStats()` | Get usage stats |
| `backup(collection)` | Backup a collection |
