package in.iceberg.model;

import java.util.Map;

/**
 * Index statistics response from Iceberg DB.
 */
public class DescribeIndexStatsResponse {
    private final Map<String, Object> stats;

    public DescribeIndexStatsResponse(Map<String, Object> stats) {
        this.stats = stats;
    }

    public Map<String, Object> getStats() {
        return stats;
    }
}
