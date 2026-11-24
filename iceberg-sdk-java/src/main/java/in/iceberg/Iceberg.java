package in.iceberg;

import in.iceberg.model.CreateIndexForModelRequest;
import in.iceberg.model.CreateIndexForModelRequestEmbed;
import in.iceberg.model.DeletionProtection;
import in.iceberg.model.IndexModel;

import java.util.Map;

/**
 * Official Java client for Iceberg Vector Database (Builder + Quickstart API).
 * Backed 100% by https://api.icebergdb.in.
 */
public class Iceberg extends Client {

    public Iceberg(String apiKey) {
        super(apiKey);
    }

    public Iceberg(String apiKey, String baseUrl) {
        super(apiKey, baseUrl);
    }

    public Iceberg(String apiKey, String baseUrl, String sourceTag) {
        super(apiKey, baseUrl, sourceTag);
    }

    public Index getIndex(String name) {
        return new Index(this, name);
    }

    public IndexModel createIndexForModel(
            String name,
            CreateIndexForModelRequest.CloudEnum cloud,
            String region,
            CreateIndexForModelRequestEmbed embed,
            DeletionProtection deletionProtection,
            Map<String, String> tags
    ) {
        String modelName = embed != null && embed.getModel() != null ? embed.getModel() : "all-MiniLM-L6-v2";
        String reg = region != null ? region : "ap-south-1";
        String cld = cloud != null ? cloud.name().toLowerCase() : "aws";
        String description = "Integrated model index (" + modelName + ", " + cld + "/" + reg + ")";
        createCollection(name, description);
        return new IndexModel(name, modelName, cld, reg);
    }

    public static class Builder {
        private final String apiKey;
        private String baseUrl = DEFAULT_BASE_URL;
        private String sourceTag = null;

        public Builder(String apiKey) {
            this.apiKey = apiKey;
        }

        public Builder withBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }

        public Builder withSourceTag(String sourceTag) {
            this.sourceTag = sourceTag;
            return this;
        }

        public Iceberg build() {
            return new Iceberg(apiKey, baseUrl, sourceTag);
        }
    }
}
