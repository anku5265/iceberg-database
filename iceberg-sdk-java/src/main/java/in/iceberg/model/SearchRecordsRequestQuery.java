package in.iceberg.model;

/**
 * Query specification for hybrid or semantic search on an Iceberg index.
 */
public class SearchRecordsRequestQuery {
    private String input;
    private int topK = 5;

    public SearchRecordsRequestQuery input(String input) {
        this.input = input;
        return this;
    }

    public SearchRecordsRequestQuery topK(int topK) {
        this.topK = topK;
        return this;
    }

    public String getInput() { return input; }
    public int getTopK() { return topK; }
}
