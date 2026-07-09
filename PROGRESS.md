# Qora DB — Project Progress
## Last Updated: June 2026

---

## Project Structure

```
qora-db/
├── qora-landing/        # React landing page (port 5173)
├── qora-dashboard/      # React dashboard (port 3000)
├── qora-backend/        # FastAPI backend (port 8000)
├── qora-sdk-python/     # Python SDK (pip install qora)
├── qora-sdk-js/         # JavaScript SDK (npm install qora)
├── qora-sdk-go/         # Go SDK (go get)
├── qora-terraform/      # Terraform BYOC module (AWS)
```

---

## How to Run

```bash
# Backend
cd qora-backend
venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000

# Dashboard
cd qora-dashboard
node node_modules/vite/bin/vite.js --port 3000

# Landing
cd qora-landing
node node_modules/vite/bin/vite.js --port 5173
```

Default API Key: `qr_dev_test123`

---

## Backend — Completed Features

### Auth & Users
- POST /auth/signup — creates user + default project + admin API key
- POST /auth/login — returns user info + all API keys
- POST /auth/keys — create additional key with role (admin/read_write/read_only)
- DELETE /auth/keys/{prefix} — revoke key

### Collections
- POST /collections — create
- GET /collections — list
- GET /collections/{name} — info (vector count, status)
- DELETE /collections/{name} — delete

### Documents
- POST /documents/text — index plain text (with namespace support)
- POST /documents/upload — upload PDF/TXT/MD (auto-chunking)

### Search (HYBRID)
- POST /search — hybrid search (Dense + BM25 via RRF)
  - search_type: "hybrid" | "semantic" | "keyword"
  - alpha: 0.0 (keyword) → 1.0 (semantic)
  - namespace: filter within namespace
  - filters: metadata filters e.g. {"source": "file.pdf"}

### Agent Memory
- POST /memory/{agent_id}/remember — store memory (long_term/short_term/episodic/semantic)
- POST /memory/{agent_id}/recall — semantic search in memories
- GET /memory/{agent_id} — list memories
- DELETE /memory/{agent_id} — clear all memories

### Assistants (No-code RAG)
- POST /assistant — create assistant
- GET /assistant — list all
- DELETE /assistant/{id} — delete
- POST /assistant/{id}/upload — upload docs to train
- POST /assistant/{id}/chat — chat (public endpoint)
- POST /assistant/{id}/whatsapp — WhatsApp webhook
- GET /assistant/{id}/widget.js — embed widget JS

### Backup & Restore
- POST /backup/{collection} — create backup (local or R2)
- GET /backup — list backups
- POST /backup/{collection}/restore/{backup_id} — restore

### Read Nodes
- GET /nodes — node pool status

### Admin
- GET /admin/status — instance info, tunnel, storage
- POST /admin/tunnel/open — open Cloudflare tunnel (4hr)
- DELETE /admin/tunnel — close tunnel
- GET /admin/billing — plan limits
- GET /admin/analytics — searches/day graph

### Usage
- GET /usage/stats — searches today, chunks indexed
- GET /usage/logs — recent activity

### Projects
- GET /projects — list
- POST /projects — create
- DELETE /projects/{id} — delete

### Waitlist
- POST /waitlist — add email

### Status/SLA
- GET /status — uptime, SLA info (99.9% target)
- GET /health — quick health check

---

## Dashboard Pages (9 total)

| Page | URL | Description |
|---|---|---|
| Overview | / | Stats, API status, quick actions |
| Collections | /collections | Create/delete collections |
| Explorer | /explorer | Search (hybrid/semantic/keyword), upload, index |
| Assistants | /assistants | No-code RAG chatbot builder |
| Memory | /memory | Agent memory store/recall |
| API Keys | /apikeys | RBAC keys management |
| Logs | /logs | Real-time activity |
| Docs | /docs | Built-in documentation |
| Admin | /admin | Instance, billing, tunnel, analytics |

---

## Landing Page
- Supabase-style navbar with Product dropdown
- Product dropdown: Qora Database, SDK, Dashboard, Assistant (coming soon)
- Capabilities: Security, Integrations
- Hero: "Build in a weekend / Scale to millions"
- Code block with Python/JS/cURL tabs
- Features: India Hosted, Hybrid Search, Namespaces, RBAC, Backup, SDKs
- Pricing: Free/Starter(₹799)/Growth(₹3,999)/Scale(₹12,999) with yearly
- Waitlist form (saves to backend)

---

## SDKs

### Python (qora-sdk-python/)
```python
from qora import Client
client = Client(api_key="qr_your_key")
client.create_collection("docs")
client.upload("docs", "file.pdf")
results = client.search("docs", "your query")
```

### JavaScript (qora-sdk-js/)
```js
import { Client } from 'qora'
const client = new Client({ apiKey: "qr_your_key" })
await client.createCollection("docs")
const results = await client.search("docs", "query")
```

### Go (qora-sdk-go/)
```go
client := qora.New("qr_your_key")
client.CreateCollection("docs")
results, _ := client.Search("docs", "query", 5)
```

---

## BYOC (qora-terraform/)
- `curl https://install.qora.in | bash` — one-command Linux install
- Terraform module for AWS Mumbai auto-deploy
- Cloudflare tunnel for remote access (zero inbound access)

---

## Comparison vs Pinecone & Weaviate

### Qora has that competitors don't:
- India hosting (DPDP compliant)
- ₹799/mo (vs $20-25/mo)
- PDF auto-chunking built-in
- WhatsApp channel for assistants
- Website embed widget (1 line JS)
- Free BYOC (Pinecone charges $500+/mo)
- Free tier forever (Weaviate only 14-day trial)
- Agent memory (4 types)
- Cloudflare R2 storage (zero egress)

### Done features:
- ✅ Core DB
- ✅ Read nodes (auto pool)
- ✅ BYOC (installer + Terraform)
- ✅ Remote access (Cloudflare tunnel)
- ✅ Agent memory
- ✅ No-code RAG + WhatsApp
- ✅ Hybrid search (Dense + BM25 + RRF)
- ✅ Namespaces
- ✅ RBAC + Multiple API keys
- ✅ Backup/restore
- ✅ Uptime SLA (99.9%)
- ✅ Go SDK

### Remaining (low priority):
- Java SDK
- SOC2/HIPAA (future, needs audit)
- Marketplace (future)

---

## Pricing

| Plan | Monthly | Yearly | Vectors | Queries/day |
|---|---|---|---|---|
| Free | ₹0 | — | 200K | 2,000 |
| Starter | ₹799 | ₹7,990 | 2M | 20,000 |
| Growth | ₹3,999 | ₹39,990 | 15M | 100,000 |
| Scale | ₹12,999 | ₹1,29,990 | 100M | 1,000,000 |

Free tier pauses after 1 week inactivity.

---

## Next Steps (new conversation mein karo)

1. Deploy on server (Railway/Render/Hetzner)
2. Domain setup (qora.in)
3. Cloudflare R2 credentials add karein (.env mein)
4. Business email (Zoho Mail free)
5. Razorpay payment integration
6. 10 beta users dhundho
7. Java SDK (optional)
