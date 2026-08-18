namespace Iceberg;

/// <summary>Thrown when the Iceberg API returns an error response.</summary>
public class IcebergError : Exception
{
    public int StatusCode { get; }

    public IcebergError(int statusCode, string message)
        : base($"HTTP {statusCode}: {message}")
    {
        StatusCode = statusCode;
    }
}
