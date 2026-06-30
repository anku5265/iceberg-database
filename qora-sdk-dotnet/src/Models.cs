using System.Text.Json.Serialization;

namespace Qora;

public class SearchResult
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = "";

    [JsonPropertyName("score")]
    public double Score { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, object>? Metadata { get; set; }

    public override string ToString() =>
        $"SearchResult(score={Score:F3}, text={Text[..Math.Min(60, Text.Length)]})";
}

public class SearchResponse
{
    [JsonPropertyName("results")]
    public List<SearchResult> Results { get; set; } = new();

    [JsonPropertyName("query")]
    public string Query { get; set; } = "";

    [JsonPropertyName("collection")]
    public string Collection { get; set; } = "";

    [JsonPropertyName("total")]
    public int Total { get; set; }
}

public class CollectionsResponse
{
    [JsonPropertyName("collections")]
    public List<string> Collections { get; set; } = new();
}

public class IndexResponse
{
    [JsonPropertyName("chunks_indexed")]
    public int ChunksIndexed { get; set; }

    [JsonPropertyName("filename")]
    public string? Filename { get; set; }
}

public class MemoryResult
{
    [JsonPropertyName("content")]
    public string Content { get; set; } = "";

    [JsonPropertyName("score")]
    public double Score { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }
}

public class MemoryResponse
{
    [JsonPropertyName("memories")]
    public List<MemoryResult> Memories { get; set; } = new();

    [JsonPropertyName("query")]
    public string Query { get; set; } = "";
}
