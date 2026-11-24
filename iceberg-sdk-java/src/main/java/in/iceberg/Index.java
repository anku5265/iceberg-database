package in.iceberg;

import in.iceberg.model.DescribeIndexStatsResponse;
import in.iceberg.model.SearchRecordsRequestQuery;
import in.iceberg.model.SearchRecordsResponse;

import java.util.List;
import java.util.Map;

/**
 * Scoped index handle for an Iceberg collection.
 */
public class Index {
    private final Client client;
    private final String name;

    public Index(Client client, String name) {
        this.client = client;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public int upsertText(String text, String source) {
        return client.indexText(name, text, source);
    }

    public SearchRecordsResponse searchRecords(SearchRecordsRequestQuery query) {
        int topK = query != null && query.getTopK() > 0 ? query.getTopK() : 5;
        String q = query != null && query.getInput() != null ? query.getInput() : "";
        List<SearchResult> hits = client.search(name, q, topK);
        return new SearchRecordsResponse(hits);
    }

    public DescribeIndexStatsResponse describeIndexStats() {
        Map<String, Object> info = client.collectionInfo(name);
        return new DescribeIndexStatsResponse(info);
    }
}
