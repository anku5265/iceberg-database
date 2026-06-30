package in.qora;

import java.util.Map;

/**
 * A single search result returned by {@link Client#search}.
 */
public class SearchResult {
    private String text;
    private double score;
    private Map<String, Object> metadata;

    public SearchResult() {}

    public SearchResult(String text, double score, Map<String, Object> metadata) {
        this.text = text;
        this.score = score;
        this.metadata = metadata;
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    @Override
    public String toString() {
        return "SearchResult{score=" + String.format("%.3f", score) +
               ", text=" + (text != null ? text.substring(0, Math.min(60, text.length())) : "null") + "}";
    }
}
