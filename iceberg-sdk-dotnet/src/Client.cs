using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Iceberg;

public class CreateIndexForModelEmbed
{
    public string Model { get; set; } = "all-MiniLM-L6-v2";
    public string? Metric { get; set; } = "cosine";
    public Dictionary<string, string>? FieldMap { get; set; }
}

public class CreateIndexForModelRequest
{
    public string Name { get; set; } = "";
    public string Cloud { get; set; } = "aws";
    public string Region { get; set; } = "ap-south-1";
    public CreateIndexForModelEmbed Embed { get; set; } = new();
}

/// <summary>
/// Official .NET client for the Iceberg Vector Database API.
/// </summary>
public class Client : IDisposable
{
    public const string DefaultBaseUrl = "https://api.icebergdb.in";

    private readonly HttpClient _http;
    private string? _sourceTag;
    private readonly JsonSerializerOptions _json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    public Client(string apiKey, string baseUrl = DefaultBaseUrl, string? sourceTag = null)
    {
        _http = new HttpClient { BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/") };
        _http.DefaultRequestHeaders.Add("X-API-Key", apiKey);
        _http.Timeout = TimeSpan.FromSeconds(30);
        ApplySourceTag(sourceTag);
    }

    public Client WithSourceTag(string sourceTag)
    {
        ApplySourceTag(sourceTag);
        return this;
    }

    private void ApplySourceTag(string? sourceTag)
    {
        _sourceTag = string.IsNullOrWhiteSpace(sourceTag) ? null : sourceTag.Trim();
        _http.DefaultRequestHeaders.Remove("X-Iceberg-Integration");
        _http.DefaultRequestHeaders.Remove("User-Agent");
        if (_sourceTag != null)
        {
            _http.DefaultRequestHeaders.TryAddWithoutValidation("X-Iceberg-Integration", _sourceTag);
            _http.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", $"iceberg-dotnet/1.0.0; source_tag={_sourceTag}");
        }
        else
        {
            _http.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "iceberg-dotnet/1.0.0");
        }
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
            throw new IcebergError((int)resp.StatusCode, detail);
        }

        return JsonSerializer.Deserialize<T>(content, _json)
               ?? throw new IcebergError(0, "Empty response");
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
            throw new IcebergError((int)resp.StatusCode, content);

        return JsonSerializer.Deserialize<T>(content, _json)
               ?? throw new IcebergError(0, "Empty response");
    }

    // ── Collections ───────────────────────────────────────────────────────────

    /// <summary>Create a new vector collection.</summary>
    public Task CreateCollectionAsync(string name, string description = "") =>
        RequestAsync<JsonElement>(HttpMethod.Post, "collections", new { name, description });

    /// <summary>Create an integrated-model collection on Iceberg DB.</summary>
    public Task CreateIndexForModelAsync(CreateIndexForModelRequest request)
    {
        var model = request.Embed?.Model ?? "all-MiniLM-L6-v2";
        var desc = $"Integrated model index ({model}, {request.Cloud}/{request.Region})";
        return CreateCollectionAsync(request.Name, desc);
    }

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

    public async Task<int> IndexTextAsync(string collection, string text, string source = "sdk")
    {
        var result = await MultipartPostAsync<IndexResponse>("documents/text",
            new() { ["collection"] = collection, ["text"] = text, ["source"] = source });
        return result.ChunksIndexed;
    }

    public async Task<int> UploadAsync(string collection, string filePath)
    {
        await using var stream = File.OpenRead(filePath);
        var result = await MultipartPostAsync<IndexResponse>("documents/upload",
            new() { ["collection"] = collection },
            stream, Path.GetFileName(filePath));
        return result.ChunksIndexed;
    }

    public async Task<int> UploadStreamAsync(string collection, Stream stream, string fileName)
    {
        var result = await MultipartPostAsync<IndexResponse>("documents/upload",
            new() { ["collection"] = collection }, stream, fileName);
        return result.ChunksIndexed;
    }

    // ── Search ────────────────────────────────────────────────────────────────

    public Task<List<SearchResult>> SearchAsync(string collection, string query, int topK = 5) =>
        SearchWithOptionsAsync(collection, query, topK);

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

    public Task RememberAsync(string agentId, string content, string memoryType = "long_term") =>
        RequestAsync<JsonElement>(HttpMethod.Post, $"memory/{agentId}/remember",
            new { content, memory_type = memoryType });

    public async Task<List<MemoryResult>> RecallAsync(string agentId, string query, int topK = 5)
    {
        var data = await RequestAsync<MemoryResponse>(HttpMethod.Post, $"memory/{agentId}/recall",
            new { query, top_k = topK });
        return data.Memories;
    }

    // ── Usage ─────────────────────────────────────────────────────────────────

    public Task<JsonElement> UsageStatsAsync() =>
        RequestAsync<JsonElement>(HttpMethod.Get, "usage/stats");

    // ── Backup ────────────────────────────────────────────────────────────────

    public async Task<string> BackupAsync(string collection)
    {
        var result = await RequestAsync<JsonElement>(HttpMethod.Post, $"backup/{collection}");
        return result.GetProperty("backup_id").GetString() ?? "";
    }

    public void Dispose() => _http.Dispose();
}

public class IcebergClient : Client
{
    public IcebergClient(string apiKey, string baseUrl = DefaultBaseUrl, string? sourceTag = null)
        : base(apiKey, baseUrl, sourceTag) { }
}
