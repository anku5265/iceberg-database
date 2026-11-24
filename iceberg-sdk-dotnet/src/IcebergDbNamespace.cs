namespace IcebergDb;

public class Client : Iceberg.Client
{
    public Client(string apiKey, string baseUrl = DefaultBaseUrl, string? sourceTag = null)
        : base(apiKey, baseUrl, sourceTag) { }
}

public class IcebergClient : Iceberg.IcebergClient
{
    public IcebergClient(string apiKey, string baseUrl = DefaultBaseUrl, string? sourceTag = null)
        : base(apiKey, baseUrl, sourceTag) { }
}
