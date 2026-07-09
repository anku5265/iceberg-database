# Qora Session Log — Complete Work Done

All changes, fixes, and decisions made across all conversations.

---

## BUGS FIXED

### 1. auth.py — Duplicate Routes (CRITICAL)
- Problem: `signup` and `login` routes defined twice — FastAPI silently ignores second definition
- Fix: Rewrote `qora-backend/routers/auth.py` — single clean definitions
- Added: `GET /auth/keys` endpoint to list all keys for logged-in user
- Added: `Depends(verify_api_key)` on create/revoke key endpoints (was missing)
- Added: Auto-fetches user's project_id if none provided on key creation

### 2. Sidebar.jsx — Syntax Error (CRITICAL)
- Problem: `LogoutIcon` function was defined OUTSIDE the module (dangling code after last export)
- Fix: Rewrote `qora-dashboard/src/components/Sidebar.jsx` — all icon functions properly inside module

### 3. Login.jsx — API Key Not Saved (CRITICAL)
- Problem: On login, stored `data.api_keys[0].key_prefix + '...'` (just prefix, not real key)
- Fix: Rewrote as 2-step login:
  - Step 1: Verify email + password
  - Step 2: User enters their full API key (they got it on signup)
- Reason: Login API only returns prefix (security), full key shown only at signup

### 4. ApiKeys.jsx — Not Loading from API
- Problem: Was reading keys only from localStorage `qora_user`, not from API
- Problem 2: Create key endpoint missing auth header
- Fix: Rewrote — now calls `GET /api/auth/keys` to load live keys
- Fix: Create key uses `H()` helper with proper auth headers

### 5. Hardcoded localhost:8000 URLs (ALL PAGES)
- Files fixed: Overview.jsx, Docs.jsx, Assistants.jsx, ApiKeys.jsx, Memory.jsx, Admin.jsx
- Fix: Created `qora-dashboard/src/lib/config.js` with `export const API_URL`
- All pages now import `API_URL` from config instead of hardcoding

### 6. Assistants.jsx — API calls using /api proxy instead of direct URL
- Problem: fetch('/api/assistant/...') — works in dev, breaks in production
- Fix: All fetch calls now use `${API_URL}/assistant/...`

### 7. vite.config.js — Hardcoded backend URL
- Problem: Dev proxy always pointed to `localhost:8000`
- Fix: Now reads `VITE_API_URL` env var, falls back to `localhost:8000`

### 8. api.js — BASE URL logic
- Problem: Always used `/api` proxy path
- Fix: Uses `VITE_API_URL` if set (production), falls back to `/api` (dev proxy)

### 9. CORS — Only localhost allowed
- Problem: Production domains blocked
- Fix: Added `dashboard.qora.in`, `qora.in`, `*.vercel.app` to allowed origins

---

## NEW FILES CREATED

### Deployment Config
- `qora-backend/Dockerfile` — Updated: added g++, pre-downloads embedding model
- `qora-backend/railway.toml` — Railway deployment config
- `qora-backend/.env.example` — Clean template
- `qora-dashboard/vercel.json` — SPA rewrite rules
- `qora-landing/vercel.json` — SPA rewrite rules
- `qora-dashboard/.env.example` — Template
- `qora-landing/.env.example` — Template
- `.gitignore` — Excludes .env, venv, qdrant data, SQLite DB, node_modules

### Config
- `qora-dashboard/src/lib/config.js` — Central `API_URL` export

### Documentation
- `DEPLOYMENT_GUIDE.md` — Step by step Railway + Vercel deploy
- `PROGRESS.md` — Full feature list and architecture
- `SESSION_LOG.md` — This file

### SDKs (New)
- `qora-sdk-java/` — Full Java SDK (Java 11+, Maven, Spring Boot ready)
  - `pom.xml`
  - `src/main/java/in/qora/Client.java`
  - `src/main/java/in/qora/SearchResult.java`
  - `src/main/java/in/qora/QoraError.java`
  - `README.md`
- `qora-sdk-dotnet/` — Full .NET SDK (.NET 6+, NuGet, async/await)
  - `QoraSdk.csproj`
  - `src/Client.cs`
  - `src/Models.cs`
  - `src/QoraError.cs`
  - `README.md`
- `qora-sdk-rust/` — Full Rust SDK (tokio, reqwest, thiserror)
  - `Cargo.toml`
  - `src/lib.rs`
  - `README.md`

---

## FEATURES ADDED / UPDATED

### Landing Page (qora-landing/src/App.jsx)
- Added `const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'`
- Added `const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'`
- Waitlist form uses `${API}/waitlist` instead of hardcoded URL
- Added Java tab to CodeBlock component
- Updated SDK description: "Python, JS, Go, Java, .NET, Rust"
- Updated Features: "SDKs for Every Stack" with all 6 languages

### Backend (qora-backend/routers/auth.py)
- Complete rewrite — removed duplicate routes
- `POST /auth/signup` — single clean version
- `POST /auth/login` — returns keys with role field
- `POST /auth/keys` — create key with `Depends(verify_api_key)`
- `DELETE /auth/keys/{prefix}` — revoke with ownership check
- `GET /auth/keys` — list all active keys for user

### requirements.txt
- Added `fastembed==0.2.7` (was missing, caused import errors)

---

## SDK FEATURE MATRIX

All 6 SDKs implement the same interface:

| Method | Python | JS | Go | Java | .NET | Rust |
|--------|--------|----|----|------|------|------|
| createCollection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| listCollections | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| deleteCollection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| indexText | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| upload (file) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| searchWithOptions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| remember (memory) | ✅ | - | ✅ | ✅ | ✅ | ✅ |
| recall (memory) | ✅ | - | ✅ | ✅ | ✅ | ✅ |
| usageStats | ✅ | ✅ | - | ✅ | ✅ | ✅ |
| backup | - | - | ✅ | ✅ | ✅ | ✅ |

---

## DEPLOYMENT PLAN

| Component | Platform | URL |
|-----------|----------|-----|
| Backend (FastAPI) | Railway | `https://qora-api.up.railway.app` |
| Dashboard (React) | Vercel | `https://dashboard.qora.in` |
| Landing (React) | Vercel | `https://qora.in` |
| Storage (files) | Cloudflare R2 | (bucket: qora-storage) |
| DB (vectors) | Qdrant embedded | (local in Railway container) |
| DB (users/keys) | SQLite | (local in Railway container) |

### Cost: ~$5-10/month to start
- Railway Hobby: $5/mo
- Vercel: Free
- R2: Free (10GB)
- Domain: ₹1000/year

---

## CURRENT FILE STATE (Key Files)

```
qora-backend/
  main.py                    ✅ CORS updated for production
  requirements.txt           ✅ fastembed added
  Dockerfile                 ✅ Updated with g++
  railway.toml               ✅ New
  .env.example               ✅ Updated
  routers/auth.py            ✅ Fixed — no duplicates, full RBAC
  routers/search.py          ✅ Hybrid/semantic/keyword + namespace
  routers/collections.py     ✅ OK
  routers/documents.py       ✅ OK
  routers/memory.py          ✅ OK
  routers/assistant.py       ✅ OK
  routers/backup.py          ✅ OK
  routers/admin.py           ✅ OK
  routers/status.py          ✅ OK
  routers/usage.py           ✅ OK
  core/auth.py               ✅ OK
  core/database.py           ✅ OK
  core/config.py             ✅ OK
  services/qdrant.py         ✅ Read node routing
  services/hybrid_search.py  ✅ BM25 + RRF
  services/embeddings.py     ✅ fastembed
  services/read_nodes.py     ✅ Connection pool

qora-dashboard/
  src/App.jsx                ✅ Protected routes
  src/lib/api.js             ✅ VITE_API_URL aware
  src/lib/config.js          ✅ New — central API_URL
  src/components/Sidebar.jsx ✅ Fixed syntax error
  src/pages/Login.jsx        ✅ 2-step login
  src/pages/Signup.jsx       ✅ OK
  src/pages/Overview.jsx     ✅ Uses API_URL
  src/pages/Collections.jsx  ✅ OK
  src/pages/Explorer.jsx     ✅ OK
  src/pages/ApiKeys.jsx      ✅ Loads from API
  src/pages/Logs.jsx         ✅ OK
  src/pages/Assistants.jsx   ✅ Uses API_URL
  src/pages/Memory.jsx       ✅ OK
  src/pages/Admin.jsx        ✅ OK
  src/pages/Docs.jsx         ✅ Uses API_URL
  vite.config.js             ✅ VITE_API_URL aware
  vercel.json                ✅ New

qora-landing/
  src/App.jsx                ✅ Env vars, Java tab added
  vercel.json                ✅ New
  .env.example               ✅ New
```

---

## REMAINING TODO

### Before Launch
- [ ] GitHub repo banana — push all code
- [ ] Railway pe backend deploy karna
- [ ] Vercel pe dashboard deploy karna
- [ ] Vercel pe landing deploy karna
- [ ] Domain lena — qora.in
- [ ] End-to-end test: signup → create collection → index → search

### Post Launch
- [ ] Reranking API
- [ ] Email on signup (welcome email)
- [ ] Stripe payment integration
- [ ] Collection vector count in dashboard
- [ ] UptimeRobot monitoring setup
- [ ] Product Hunt launch preparation

### Marketing
- [ ] Twitter/X account setup (@qora_db)
- [ ] First tweet — "building in public"
- [ ] IndieHackers post
- [ ] Dev.to tutorial article

---

## MARKET CONTEXT (Summary)

- Vector DB market: $2.58B → $8.95B by 2030
- Pinecone: expensive ($20-50+/mo), US only, reportedly exploring sale
- Weaviate: complex, no India region
- Gap: No affordable India-hosted managed vector DB
- Qora positioning: "Pinecone at ₹799/mo, India hosted, DPDP compliant"
- Target: Indian AI developers, early stage startups, dev agencies

---

## DECISIONS MADE

| Decision | Reason |
|----------|--------|
| Railway for backend | Docker support, easy GitHub integration, $5/mo |
| Vercel for frontend | Free, instant deploys, perfect for React/Vite |
| Cloudflare R2 for storage | Zero egress cost vs S3 |
| fastembed for embeddings | No OpenAI cost, runs locally |
| SQLite for user DB | Simple, zero ops, good enough for 1000 users |
| Qdrant embedded | No separate Qdrant server needed |
| INR pricing | 6x cheaper positioning vs Pinecone |
| 6 SDKs | More than Pinecone (4) and Weaviate (5) — competitive advantage |
| Java SDK priority | Enterprise India — TCS, Infosys, Spring Boot shops |
| 2-step login | Security: full API key never returned after creation |
