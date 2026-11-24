package in.iceberg.model;

/**
 * Metadata descriptor for an Iceberg index.
 */
public class IndexModel {
    private final String name;
    private final String model;
    private final String cloud;
    private final String region;

    public IndexModel(String name, String model, String cloud, String region) {
        this.name = name;
        this.model = model;
        this.cloud = cloud;
        this.region = region;
    }

    public String getName() { return name; }
    public String getModel() { return model; }
    public String getCloud() { return cloud; }
    public String getRegion() { return region; }
}
