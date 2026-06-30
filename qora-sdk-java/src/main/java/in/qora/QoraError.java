package in.qora;

/**
 * Thrown when the Qora API returns an error response.
 */
public class QoraError extends RuntimeException {
    private final int statusCode;

    public QoraError(int statusCode, String message) {
        super("HTTP " + statusCode + ": " + message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
