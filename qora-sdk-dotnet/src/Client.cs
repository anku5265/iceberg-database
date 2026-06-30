using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Qora;

/// <summary>
/// Official .NET client for the Qora Vector Database API.
/// </summary>
/// <example>
/// <code>
/// using Qora;
///
/// var client = new Client("your_api_key");
///
/// await client.CreateCollectionAsync("my_docs");
/// await client.IndexTextAsync("my_docs", "Qora is a vector database for Indian AI teams.");
///
/// var results = await client.SearchAsync("my_docs", "Indian AI");
/// foreach (var r in results)
///     Console.WriteLine($"{r.Score:F3} {r.Text}");
/// </code>
/// </example>
public class Client : IDisposable
{
    public const string DefaultBaseUrl = "https://api.qora.in";

    private readonly HttpClient _http;
    private readonly JsonSerializerOptions _json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    public Client(string apiKey, string baseUrl = DefaultBaseUrl)
    {
        _http = new HttpClient { BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/") };
        _http.DefaultRequestHeaders.Add("X-API-Key", apiKey);
        _http.Timeout = TimeSpan.FromSeconds(30);
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    private async Task<T> RequestAsync<T>(HttpMethod method, string path, object? body = null)
    {
        var req = new HttpRequestMessage(method, path);
        if (body != null)
        {
            req.Content = new StringContent(JsonSerializer.Serialize(body, _json), Encoding.UTF8, "application/json");
        }

        var resp = await _http.SendAsync(req);
        var content = await resp.Content.ReadAsStringAsync();

        if (!resp.IsSuccessStatusCode)
        {
            string detail = content;
            try
            {
                using var doc = JsonDocument.Parse(content);
                if (doc.RootElement.TryGetProperty("detail", out var d))
                    detail = d.GetString() ?? content;
            }
            catch { }
            throw new QoraError((int)resp.StatusCode, detail);
        }

        return JsonSerializer.Deserialize<T>(content, _json)
               ?? throw new QoraError(0, "Empty response");
    }

    private async Task<T> MultipartPostAsync<T>(string path, Dictionary<string, string> fields,
                                                  Stream? fileStream = null, string? fileName = null)
    {
        using var form = new MultipartFormDataContent();
        foreach (var (key, value) in fields)
            form.Add(new StringContent(value), key);

        if (fileStream != null && fileName != null)
        {
            var fileContent = new StreamContent(fileStream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            form.Add(fileContent, "file", fileName);
        }

        var resp = await _http.PostAsync(path, form);
        var content = await resp.Content.ReadAsStringAsync();

        if (!resp.IsSuccessStatusCode)
            throw new QoraError((int)resp.StatusCode, content);

        return JsonSerializer.Deserialize<T>(content, _json)
               ?? throw new QoraError(0, "Empty response");
    }

    // ── Collections ───────────────────────────────────────────────────────────

    /// <summary>Create a new vector collection.</summary>
    public Task CreateCollectionAsync(string name, string description = "") =>
        RequestAsync<JsonElement>(HttpMethod.Post, "collections", new { name, description });

    /// <summary>List all collection names.</summary>
    public async Task<List<string>> ListCollectionsAsync()
    {
        var data = await RequestAsync<CollectionsResponse>(HttpMethod.Get, "collections");
        return data.Collections;
    }

    /// <summary>Delete a collection and all its vectors.</summary>
    public Task DeleteCollectionAsync(string name) =>
        RequestAsync<JsonElement>(HttpMethod.Delete, $"collections/{name}");

    /// <summary>Get collection info (vector count, status).</summary>
    public Task<JsonElement> CollectionInfoAsync(string name) =>
        RequestAsync<JsonElement>(HttpMethod.Get, $"collections/{name}");

    // ── Indexing ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Index plain text into a collection.
    /// Text is automatically chunked and embedded.
    /// </summary>
    /// <param name="collection">Collection name</param>
    /// <param name="text">Text to index (Hindi/English/Hinglish supported)</param>
    /// <param name="source">Label for this content (for filtering later)</param>
    public async Task<int> IndexTextAsync(string collection, string text, string source = "sdk")
    {
        var result = await MultipartPostAsync<IndexResponse>("documents/text",
            new() { ["collection"] = collection, ["text"] = text, ["source"] = source });
        return result.ChunksIndexed;
    }

    /// <summary>Upload and index a file (PDF, TXT, MD).</summary>
    /// <param name="collection">Collection name</param>
    /// <param name="filePath">Path to file on disk</param>
    public async Task<int> UploadAsync(string collection, string filePath)
    {
        await using var stream = File.OpenRead(filePath);
        var result = await MultipartPostAsync<IndexResponse>("documents/upload",
            new() { ["collection"] = collection },
            stream, Path.GetFileName(filePath));
        return result.ChunksIndexed;
    }

    /// <summary>Upload and index from a stream.</summary>
    public async Task<int> UploadStreamAsync(string collection, Stream stream, string fileName)
    {
        var result = await MultipartPostAsync<IndexResponse>("documents/upload",
            new() { ["collection"] = collection }, stream, fileName);
        return result.ChunksIndexed;
    }

    // ── Search ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Semantic search in a collection (hybrid mode, top 5 results).
    /// </summary>
    public Task<List<SearchResult>> SearchAsync(string collection, string query, int topK = 5) =>
        SearchWithOptionsAsync(collection, query, topK);

    /// <summary>
    /// Search with full control over parameters.
    /// </summary>
    /// <param name="collection">Collection name</param>
    /// <param name="query">Search query</param>
    /// <param name="topK">Number of results</param>
    /// <param name="searchType">"hybrid" | "semantic" | "keyword"</param>
    /// <param name="alpha">0.0=keyword only, 1.0=semantic only</param>
    /// <param name="filters">Metadata filters</param>
    /// <param name="namespaceName">Optional namespace filter</param>
    public async Task<List<SearchResult>> SearchWithOptionsAsync(
        string collection,
        string query,
        int topK = 5,
        string searchType = "hybrid",
        double alpha = 0.5,
        Dictionary<string, object>? filters = null,
        string? namespaceName = null)
    {
        var body = new Dictionary<string, object>
        {
            ["collection"] = collection,
            ["query"] = query,
            ["top_k"] = topK,
            ["search_type"] = searchType,
            ["alpha"] = alpha,
        };
        if (filters != null) body["filters"] = filters;
        if (namespaceName != null) body["namespace"] = namespaceName;

        var data = await RequestAsync<SearchResponse>(HttpMethod.Post, "search", body);
        return data.Results;
    }

    // ── Agent Memory ──────────────────────────────────────────────────────────

    /// <summary>Store a memory for an AI agent.</summary>
    /// <param name="agentId">Unique agent/user identifier</param>
    /// <param name="content">Memory content</param>
    /// <param name="memoryType">"long_term" | "short_term" | "episodic" | "semantic"</param>
    public Task RememberAsync(string agentId, string content, string memoryType = "long_term") =>
        RequestAsync<JsonElement>(HttpMethod.Post, $"memory/{agentId}/remember",
            new { content, memory_type = memoryType });

    /// <summary>Recall memories for an AI agent.</summary>
    public async Task<List<MemoryResult>> RecallAsync(string agentId, string query, int topK = 5)
    {
        var data = await RequestAsync<MemoryResponse>(HttpMethod.Post, $"memory/{agentId}/recall",
            new { query, top_k = topK });
        return data.Memories;
    }

    // ── Usage ─────────────────────────────────────────────────────────────────

    /// <summary>Get usage statistics for your account.</summary>
    public Task<JsonElement> UsageStatsAsync() =>
        RequestAsync<JsonElement>(HttpMethod.Get, "usage/stats");

    // ── Backup ────────────────────────────────────────────────────────────────

    /// <summary>Create a backup of a collection. Returns backup ID.</summary>
    public async Task<string> BackupAsync(string collection)
    {
        var result = await RequestAsync<JsonElement>(HttpMethod.Post, $"backup/{collection}");
        return result.GetProperty("backup_id").GetString() ?? "";
    }

    public void Dispose() => _http.Dispose();
}
