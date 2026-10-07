<p align="center">
  <h1 align="center">⚡ Iceberg Database</h1>
  <p align="center"><strong>High-performance serverless vector database built for AI agents and real-time RAG.</strong></p>
</p>

<p align="center">
  <a href="https://icebergdb.in"><img src="https://img.shields.io/badge/Status-Active-22c55e?style=flat-square" alt="Status"></a>
  <a href="https://pypi.org/project/icebergdb/"><img src="https://img.shields.io/badge/pypi-v0.1.0-38bdf8?style=flat-square" alt="PyPI"></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/python-3.9+-blue?style=flat-square" alt="Python"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple?style=flat-square" alt="License"></a>
</p>

---

## 🚀 Quick Install

```bash
pip install icebergdb
```

---

## ⚡ 30-Second Quickstart

```python
import iceberg

# 1. Connect to Iceberg (reads ICEBERG_API_KEY from environment by default)
db = iceberg.connect(api_key="your_api_key")

# 2. Create an isolated vector collection
db.create_collection("ai_agent_memory", description="Real-time context memory")

# 3. Index text documents or chunks (supports English, Hindi, and multilingual text)
db.index_text("ai_agent_memory", "Iceberg delivers sub-5ms vector queries with zero cold starts.")
db.index_text("ai_agent_memory", "Autonomous AI agents require persistent, low-latency recall memory.")

# 4. Perform hybrid semantic search
results = db.search("ai_agent_memory", query="low-latency agent recall", top_k=3)

for match in results:
    print(f"[{match.score:.3f}] {match.text}")
```

---

## 📁 Uploading Documents Directly (PDF, TXT, Markdown)

```python
# Upload and auto-chunk entire documents in one line
db.upload("ai_agent_memory", "product_spec.pdf")
```

---

## 🔍 Filtered & Scoped Search

```python
results = db.search(
    "ai_agent_memory",
    query="vector benchmarks",
    top_k=5,
    score_threshold=0.4,
    filters={"source": "product_spec.pdf"}
)
```

---

## 🌐 Cloud & Self-Hosted Endpoints

To connect to your local dev engine or dedicated cluster:

```python
db = iceberg.connect(
    api_key="iceberg_secret_key",
    base_url="http://localhost:8000"  # or https://api.icebergdb.in
)
```

---

## 👤 Author & Creator

Crafted with ❤️ by **Ankush** ([@anku5265](https://github.com/anku5265)) & the **Iceberg DB** team.

---

## 🛡️ License

MIT License © 2026 Iceberg DB (Ankush).
