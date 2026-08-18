package in.iceberg;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.*;

/**
 * Official Java client for the Iceberg Vector Database API.
 *
 * <p>Usage:
 * <pre>{@code
 * import in.iceberg.Client;
 * import in.iceberg.SearchResult;
 *
 * Client client = new Client("your_api_key");
 *
 * // Create a collection
 * client.createCollection("my_docs");
 *
 * // Index text
 * client.indexText("my_docs", "Iceberg is a vector database for Indian AI teams.", "manual");
 *
 * // Search
 * List<SearchResult> results = client.search("my_docs", "Indian AI", 5);
 * for (SearchResult r : results) {
 *     System.out.println(r.getScore() + " " + r.getText());
 * }
 * }</pre>
 *
 * <p>Spring Boot usage:
 * <pre>{@code
 * @Bean
 * public Client icebergClient(@Value("${iceberg.api-key}") String apiKey) {
 *     return new Client(apiKey);
 * }
 * }</pre>
 */
public class Client {

    public static final String DEFAULT_BASE_URL = "https://api.icebergdb.io";

    private final String apiKey;
    private final String baseUrl;
    private final HttpClient http;
    private final ObjectMapper mapper;

    public Client(String apiKey) {
        this(apiKey, DEFAULT_BASE_URL);
    }

    public Client(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replaceAll("/$", "");
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.mapper = new ObjectMapper();
    }

    // ── Internal HTTP helpers ─────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> request(String method, String path, Object body) {
        try {
            String json = body != null ? mapper.writeValueAsString(body) : null;
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .header("X-API-Key", apiKey)
                    .timeout(Duration.ofSeconds(30));

            if ("GET".equals(method)) {
                builder.GET();
            } else if ("DELETE".equals(method)) {
                builder.DELETE();
            } else {
                builder.header("Content-Type", "application/json")
                       .method(method, HttpRequest.BodyPublishers.ofString(json != null ? json : "{}"));
            }

            HttpResponse<String> resp = http.send(builder.build(), HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() >= 400) {
                String detail = resp.body();
                try {
                    Map<?, ?> err = mapper.readValue(detail, Map.class);
                    detail = (String) err.getOrDefault("detail", detail);
                } catch (Exception ignored) {}
                throw new IcebergError(resp.statusCode(), detail);
            }

            return mapper.readValue(resp.body(), Map.class);
        } catch (IcebergError e) {
            throw e;
        } catch (Exception e) {
            throw new IcebergError(0, e.getMessage());
        }
    }

    private Map<String, Object> multipartPost(String path, Map<String, String> fields,
                                               Path filePath, String fileName) {
        try {
            String boundary = "----IcebergBoundary" + System.currentTimeMillis();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            for (Map.Entry<String, String> entry : fields.entrySet()) {
                baos.write(("--" + boundary + "\r\n").getBytes());
                baos.write(("Content-Disposition: form-data; name=\"" + entry.getKey() + "\"\r\n\r\n").getBytes());
                baos.write((entry.getValue() + "\r\n").getBytes());
            }

            if (filePath != null) {
                byte[] fileBytes = Files.readAllBytes(filePath);
                baos.write(("--" + boundary + "\r\n").getBytes());
                baos.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n").getBytes());
                baos.write(("Content-Type: application/octet-stream\r\n\r\n").getBytes());
                baos.write(fileBytes);
                baos.write("\r\n".getBytes());
            }

            baos.write(("--" + boundary + "--\r\n").getBytes());

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .header("X-API-Key", apiKey)
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofByteArray(baos.toByteArray()))
                    .build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() >= 400) {
                throw new IcebergError(resp.statusCode(), resp.body());
            }

            return mapper.readValue(resp.body(), Map.class);
        } catch (IcebergError e) {
            throw e;
        } catch (Exception e) {
            throw new IcebergError(0, e.getMessage());
        }
    }

    // ── Collections ───────────────────────────────────────────────────────────

    public void createCollection(String name) {
        createCollection(name, "");
    }

    public void createCollection(String name, String description) {
        Map<String, String> body = new HashMap<>();
        body.put("name", name);
        body.put("description", description);
        request("POST", "/collections", body);
    }

    @SuppressWarnings("unchecked")
    public List<String> listCollections() {
        Map<String, Object> data = request("GET", "/collections", null);
        return (List<String>) data.getOrDefault("collections", Collections.emptyList());
    }

    public void deleteCollection(String name) {
        request("DELETE", "/collections/" + name, null);
    }

    public Map<String, Object> collectionInfo(String name) {
        return request("GET", "/collections/" + name, null);
    }

    // ── Indexing ──────────────────────────────────────────────────────────────

    public int indexText(String collection, String text, String source) {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("collection", collection);
        fields.put("text", text);
        fields.put("source", source);
        Map<String, Object> result = multipartPost("/documents/text", fields, null, null);
        Object chunks = result.get("chunks_indexed");
        return chunks instanceof Number ? ((Number) chunks).intValue() : 0;
    }

    public int indexText(String collection, String text) {
        return indexText(collection, text, "sdk");
    }

    public int upload(String collection, String filePath) {
        Path path = Path.of(filePath);
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("collection", collection);
        Map<String, Object> result = multipartPost("/documents/upload", fields, path, path.getFileName().toString());
        Object chunks = result.get("chunks_indexed");
        return chunks instanceof Number ? ((Number) chunks).intValue() : 0;
    }

    // ── Search ────────────────────────────────────────────────────────────────

    public List<SearchResult> search(String collection, String query) {
        return search(collection, query, 5);
    }

    public List<SearchResult> search(String collection, String query, int topK) {
        return searchWithOptions(collection, query, topK, "hybrid", 0.5, null, null);
    }

    @SuppressWarnings("unchecked")
    public List<SearchResult> searchWithOptions(String collection, String query, int topK,
                                                 String searchType, double alpha,
                                                 Map<String, Object> filters, String namespace) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("collection", collection);
        body.put("query", query);
        body.put("top_k", topK);
        body.put("search_type", searchType);
        body.put("alpha", alpha);
        if (filters != null) body.put("filters", filters);
        if (namespace != null && !namespace.isEmpty()) body.put("namespace", namespace);

        Map<String, Object> data = request("POST", "/search", body);
        List<Map<String, Object>> raw = (List<Map<String, Object>>) data.getOrDefault("results", Collections.emptyList());

        List<SearchResult> results = new ArrayList<>();
        for (Map<String, Object> r : raw) {
            results.add(new SearchResult(
                (String) r.get("text"),
                ((Number) r.getOrDefault("score", 0.0)).doubleValue(),
                (Map<String, Object>) r.getOrDefault("metadata", Collections.emptyMap())
            ));
        }
        return results;
    }

    // ── Agent Memory ──────────────────────────────────────────────────────────

    public void remember(String agentId, String content, String memoryType) {
        Map<String, String> body = new HashMap<>();
        body.put("content", content);
        body.put("memory_type", memoryType);
        request("POST", "/memory/" + agentId + "/remember", body);
    }

    @SuppressWarnings("unchecked")
    public List<SearchResult> recall(String agentId, String query, int topK) {
        Map<String, Object> body = new HashMap<>();
        body.put("query", query);
        body.put("top_k", topK);
        Map<String, Object> data = request("POST", "/memory/" + agentId + "/recall", body);
        List<Map<String, Object>> raw = (List<Map<String, Object>>) data.getOrDefault("memories", Collections.emptyList());
        List<SearchResult> results = new ArrayList<>();
        for (Map<String, Object> r : raw) {
            results.add(new SearchResult(
                (String) r.getOrDefault("content", ""),
                ((Number) r.getOrDefault("score", 0.0)).doubleValue(),
                Collections.emptyMap()
            ));
        }
        return results;
    }

    // ── Usage ─────────────────────────────────────────────────────────────────

    public Map<String, Object> usageStats() {
        return request("GET", "/usage/stats", null);
    }

    // ── Backup ────────────────────────────────────────────────────────────────

    public String backup(String collection) {
        Map<String, Object> result = request("POST", "/backup/" + collection, null);
        return (String) result.getOrDefault("backup_id", "");
    }
}
