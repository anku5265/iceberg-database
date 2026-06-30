namespace Qora;

/// <summary>Thrown when the Qora API returns an error response.</summary>
public class QoraError : Exception
{
    public int StatusCode { get; }

    public QoraError(int statusCode, string message)
        : base($"HTTP {statusCode}: {message}")
    {
        StatusCode = statusCode;
    }
}
