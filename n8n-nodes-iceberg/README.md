# `n8n-nodes-iceberg`

Official **n8n Community Node** for [Iceberg DB](https://icebergdb.in) (`ap-south-1`, Mumbai) — add **Iceberg Assistant**, **4-Tier Cognitive Agent Memory**, and **Hybrid RRF Vector Search** directly to any n8n workflow with zero boilerplate.

## Install in n8n (GUI — 1 Click)

1. Open your n8n instance and go to **Settings -> Community Nodes**.
2. Click **Install**.
3. Enter **`n8n-nodes-iceberg`** and click **Install**.
4. Open any workflow, click **`+`**, and search **"Iceberg Assistant"**.

## Capabilities Included

### 1. Assistant (`Resource: Assistant`)
- **Create** — Provision an isolated RAG Assistant (`_asst_{id}`) with 6 pluggable LLMs (`Iceberg Native AI`, `Groq Llama 3.3`, `Claude`, `OpenAI`, `Gemini`, `DeepSeek`), Website `widget.js`, and WhatsApp webhook.
- **Upload Document** — Train an assistant from plain text, Markdown, or upstream binary **PDF** files with Rs 0 in-process `384d ONNX` CPU embeddings.
- **Chat** — Send user messages and receive grounded answers + source citations (`usableAsTool: true` for n8n AI Agents).
- **List / Delete** — Manage assistants programmatically.

### 2. Agent Memory (`Resource: Agent Memory`)
- **Remember** / **Recall** across `short_term`, `episodic`, `long_term`, and `semantic` tiers.

### 3. Vector Search (`Resource: Vector Search`)
- **Search** (`hybrid`, `semantic`, `keyword`) and **Index Text** (`384d ONNX` CPU).

## Credentials
Create an API key at [https://dashboard.icebergdb.in](https://dashboard.icebergdb.in) and paste it into the **Iceberg DB API** credential inside n8n.

## License
MIT
