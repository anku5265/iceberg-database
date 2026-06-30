// Package qora provides a Go client for the Qora Vector Database API.
//
// Usage:
//
//	client := qora.New("your_api_key")
//	client.CreateCollection("my_docs")
//	client.IndexText("my_docs", "Your document text here", "source_name")
//	results, _ := client.Search("my_docs", "your query", 5)
package qora

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

const DefaultBaseURL = "https://api.qora.in"

type Client struct {
	APIKey  string
	BaseURL string
	http    *http.Client
}

func New(apiKey string) *Client {
	return &Client{APIKey: apiKey, BaseURL: DefaultBaseURL, http: &http.Client{}}
}

func NewWithURL(apiKey, baseURL string) *Client {
	return &Client{APIKey: apiKey, BaseURL: baseURL, http: &http.Client{}}
}

type SearchResult struct {
	Text     string                 `json:"text"`
	Score    float64                `json:"score"`
	Metadata map[string]interface{} `json:"metadata"`
}

type SearchResponse struct {
	Results    []SearchResult `json:"results"`
	Query      string         `json:"query"`
	Collection string         `json:"collection"`
	Total      int            `json:"total"`
}

func (c *Client) do(method, path string, body interface{}) ([]byte, error) {
	var reqBody io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, c.BaseURL+path, reqBody)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-API-Key", c.APIKey)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(data))
	}
	return data, nil
}

// CreateCollection creates a new vector collection.
func (c *Client) CreateCollection(name string) error {
	_, err := c.do("POST", "/collections", map[string]string{"name": name})
	return err
}

// DeleteCollection deletes a collection.
func (c *Client) DeleteCollection(name string) error {
	_, err := c.do("DELETE", "/collections/"+name, nil)
	return err
}

// ListCollections returns all collection names.
func (c *Client) ListCollections() ([]string, error) {
	data, err := c.do("GET", "/collections", nil)
	if err != nil {
		return nil, err
	}
	var resp struct {
		Collections []string `json:"collections"`
	}
	err = json.Unmarshal(data, &resp)
	return resp.Collections, err
}

// IndexText indexes plain text into a collection with optional namespace.
func (c *Client) IndexText(collection, text, source string) (int, error) {
	return c.IndexTextWithNamespace(collection, text, source, "")
}

func (c *Client) IndexTextWithNamespace(collection, text, source, namespace string) (int, error) {
	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	w.WriteField("collection", collection)
	w.WriteField("text", text)
	w.WriteField("source", source)
	if namespace != "" {
		w.WriteField("namespace", namespace)
	}
	w.Close()
	req, _ := http.NewRequest("POST", c.BaseURL+"/documents/text", &buf)
	req.Header.Set("X-API-Key", c.APIKey)
	req.Header.Set("Content-Type", w.FormDataContentType())
	resp, err := c.http.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	var result struct {
		ChunksIndexed int `json:"chunks_indexed"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	return result.ChunksIndexed, nil
}

// Upload uploads and indexes a file.
func (c *Client) Upload(collection, filePath string) (int, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer f.Close()
	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	w.WriteField("collection", collection)
	fw, _ := w.CreateFormFile("file", filepath.Base(filePath))
	io.Copy(fw, f)
	w.Close()
	req, _ := http.NewRequest("POST", c.BaseURL+"/documents/upload", &buf)
	req.Header.Set("X-API-Key", c.APIKey)
	req.Header.Set("Content-Type", w.FormDataContentType())
	resp, err := c.http.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	var result struct {
		ChunksIndexed int `json:"chunks_indexed"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	return result.ChunksIndexed, nil
}

// Search performs hybrid search (default) in a collection.
func (c *Client) Search(collection, query string, topK int) ([]SearchResult, error) {
	return c.SearchWithOptions(collection, query, topK, "hybrid", 0.5, nil, "")
}

// SearchWithOptions allows full control over search parameters.
func (c *Client) SearchWithOptions(collection, query string, topK int, searchType string, alpha float64, filters map[string]interface{}, namespace string) ([]SearchResult, error) {
	payload := map[string]interface{}{
		"collection":  collection,
		"query":       query,
		"top_k":       topK,
		"search_type": searchType,
		"alpha":       alpha,
	}
	if filters != nil {
		payload["filters"] = filters
	}
	if namespace != "" {
		payload["namespace"] = namespace
	}
	data, err := c.do("POST", "/search", payload)
	if err != nil {
		return nil, err
	}
	var resp SearchResponse
	err = json.Unmarshal(data, &resp)
	return resp.Results, err
}

// Remember stores a memory for an agent.
func (c *Client) Remember(agentID, content, memType string) error {
	_, err := c.do("POST", "/memory/"+agentID+"/remember", map[string]string{
		"content":     content,
		"memory_type": memType,
	})
	return err
}

// Recall searches agent memory.
func (c *Client) Recall(agentID, query string, topK int) ([]SearchResult, error) {
	data, err := c.do("POST", "/memory/"+agentID+"/recall", map[string]interface{}{
		"query":  query,
		"top_k":  topK,
	})
	if err != nil {
		return nil, err
	}
	var resp struct {
		Memories []SearchResult `json:"memories"`
	}
	err = json.Unmarshal(data, &resp)
	return resp.Memories, err
}

// Backup creates a backup of a collection.
func (c *Client) Backup(collection string) (string, error) {
	data, err := c.do("POST", "/backup/"+collection, nil)
	if err != nil {
		return "", err
	}
	var resp struct {
		BackupID string `json:"backup_id"`
	}
	err = json.Unmarshal(data, &resp)
	return resp.BackupID, err
}
