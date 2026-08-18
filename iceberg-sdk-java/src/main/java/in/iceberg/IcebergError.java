package in.iceberg;

/**
 * Thrown when the Iceberg API returns an error response.
 */
public class IcebergError extends RuntimeException {
    private final int statusCode;

    public IcebergError(int statusCode, String message) {
        super("HTTP " + statusCode + ": " + message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
