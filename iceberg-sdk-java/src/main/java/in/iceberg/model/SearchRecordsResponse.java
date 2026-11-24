package in.iceberg.model;

import in.iceberg.SearchResult;
import java.util.List;

/**
 * Search response wrapper containing matched records from Iceberg DB.
 */
public class SearchRecordsResponse {
    private final List<SearchResult> hits;

    public SearchRecordsResponse(List<SearchResult> hits) {
        this.hits = hits;
    }

    public List<SearchResult> getHits() {
        return hits;
    }
}
