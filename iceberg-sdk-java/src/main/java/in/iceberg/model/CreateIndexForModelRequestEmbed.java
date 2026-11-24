package in.iceberg.model;

import java.util.Map;

/**
 * Embedding model configuration for an Iceberg index.
 */
public class CreateIndexForModelRequestEmbed {
    private String model = "all-MiniLM-L6-v2";
    private Map<String, String> fieldMap;

    public CreateIndexForModelRequestEmbed() {}

    public CreateIndexForModelRequestEmbed model(String model) {
        this.model = model;
        return this;
    }

    public CreateIndexForModelRequestEmbed fieldMap(Map<String, String> fieldMap) {
        this.fieldMap = fieldMap;
        return this;
    }

    public String getModel() {
        return model;
    }

    public Map<String, String> getFieldMap() {
        return fieldMap;
    }
}
