"""
Quick test � run this after server is running:
  python test_api.py
"""
import httpx

BASE = "http://localhost:8000"
KEY = "ib_dev_test123"
HEADERS = {"X-API-Key": KEY}

def test():
    print("\n=== Iceberg API Test ===\n")

    # 1. Health check
    r = httpx.get(f"{BASE}/health")
    print(f"[1] Health check: {r.json()}")

    # 2. Create collection
    r = httpx.post(f"{BASE}/collections", json={"name": "test_docs"}, headers=HEADERS)
    print(f"[2] Create collection: {r.json()}")

    # 3. Index some text
    r = httpx.post(f"{BASE}/documents/text", data={
        "collection": "test_docs",
        "text": "Iceberg is a vector database built for Indian AI teams. It supports Hindi and English search.",
        "source": "test"
    }, headers=HEADERS)
    print(f"[3] Index text: {r.json()}")

    # 4. Search in English
    r = httpx.post(f"{BASE}/search", json={
        "query": "Indian AI database",
        "collection": "test_docs",
        "top_k": 3
    }, headers=HEADERS)
    print(f"[4] Search (English): {r.json()}")

    # 5. Search in Hindi
    r = httpx.post(f"{BASE}/search", json={
        "query": "?????? AI ???",
        "collection": "test_docs",
        "top_k": 3
    }, headers=HEADERS)
    print(f"[5] Search (Hindi): {r.json()}")

    print("\n=== All tests passed! ===\n")

if __name__ == "__main__":
    test()
