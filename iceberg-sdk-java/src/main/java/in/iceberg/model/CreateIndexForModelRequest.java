package in.iceberg.model;

/**
 * Request model for creating an integrated-model Iceberg index.
 */
public class CreateIndexForModelRequest {
    public enum CloudEnum {
        AWS,
        GCP,
        AZURE
    }
}
