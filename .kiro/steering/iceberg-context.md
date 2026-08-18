---
inclusion: always
---

# Iceberg — Master Context File
## Last Updated: August 13, 2026

---

## WHO IS THE USER
- Age 20, Himachal Pradesh (Kullu area)
- Building Iceberg Vector DB as a Service — India-first Pinecone alternative
- Also building: Overlay AI app (Flutter, 80% done), Voice Call Agent
- Goal: naam banana, future mein billion dollar company
- Has RuPay card + SBI Visa debit card (new)
- Has ADHD — keep things focused and clear
- Style: Hinglish conversation, direct answers preferred
- GitHub: anku5265
- Email: anku4104@gmail.com

---

## CURRENT STATUS (August 13, 2026)

### Live Deployments ✅
- **Backend:** https://Iceberg-database-production.up.railway.app (Railway, FastAPI + Qdrant Cloud)
- **Landing:** https://database-bice-phi.vercel.app (Vercel)
- **Dashboard:** https://database-dashboard-mu.vercel.app (Vercel)
- **Qdrant Cloud:** https://9d2df814-00ee-4045-b1db-d41f1af49c6f.us-east-1-1.aws.cloud.qdrant.io (Free tier, US East)

### Infrastructure
- Backend: Railway (free $5/month credit, new account)
- Frontend: Vercel (free, no card)
- Vector DB: Qdrant Cloud (free 1GB, no card)
- SQLite for user/auth data (local on Railway)
- Oracle Cloud: Tried but failed — SBI debit card not accepted (credit facility needed)

---

## SESSION LOG — August 8-13, 2026

### Code Changes Done

1. **HomePageNew.jsx** — Hero right panel replaced with Option 1 (Auto-typing Live Search Demo)
   - Single dark terminal window
   - Character-by-character auto-typing
   - Score bars with blue-purple gradient
   - ~14ms badge, 4s auto-cycle
   - slideIn keyframe added to index.css
   - selectedCollection state added

2. **Login.jsx** — Password show/hide eye button added

3. **Dockerfile** — Fixed Railway PORT env variable:
   `CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]`

4. **railway.toml** — Healthcheck timeout increased to 120s

5. **requirements.txt** — boto3==1.35.0 added (was missing, caused deploy failure)

### Deployment Journey (Full)

**Railway deploy steps:**
- New account banaya (old account trial expired)
- repo: anku5265/Iceberg-database-
- Root Directory: /Iceberg-backend
- Variables set: MASTER_API_KEY, BYOC_MODE, PORT, QDRANT_URL, QDRANT_API_KEY
- Build ✅ Deploy ✅ → Healthcheck fail tha
- Fix 1: PORT env var in Dockerfile
- Fix 2: boto3 missing in requirements.txt
- Final result: ACTIVE ✅

**Vercel deploy steps:**
- Landing: Iceberg-database- repo → root: Iceberg-landing → VITE_API_URL set
- Dashboard: Iceberg-database- repo → root: Iceberg-dashboard → VITE_API_URL set
- Both deployed successfully

### Platforms Tried for Free Backend Hosting
| Platform | Result |
|----------|--------|
| Oracle Cloud | Card rejected — needs credit facility |
| Railway (old account) | Trial expired |
| Render | Card required for free tier |
| Koyeb | Joining Mistral, deployment stopped |
| HuggingFace Spaces | Docker = Paid |
| GCP | 1GB RAM — not enough for Qdrant |
| Railway (new account) | ✅ Works — $5/month free credit |

### Qdrant Cloud Credentials
- URL: https://9d2df814-00ee-4045-b1db-d41f1af49c6f.us-east-1-1.aws.cloud.qdrant.io
- API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (stored in Railway env vars)

---

## WHAT WAS DISCUSSED THIS SESSION

### Hero Panel Options (HomePageNew.jsx)
Three options were discussed and Option 1 was implemented:
- **Option 1 (CURRENT):** Single dark terminal, auto-typing, score bars, ~14ms badge
- **Option 2:** Split panel — code left, results right
- **Option 3 (old):** Dashboard + Search combo

### Website Size vs Qdrant Discussion
- Qdrant has 20-30 pages, 50+ blog posts, case studies = Google ranking
- Iceberg abhi: 1 homepage + product pages
- Conclusion: Website design problem nahi, pehle ship karo, users lao

### Product Launch Research
| Company | Strategy | Result |
|---------|----------|--------|
| Supabase | Accidental HN post | 30K visitors, 1400 signups week 1 |
| Pinecone | Stealth → press release + $10M funding | ChatGPT ke baad explode kiya |
| Qdrant | GitHub README only | Organic HN front page, $28M Series A |
| Weaviate | Open source + Discord | $16M Series A |

**3-Phase Launch Playbook:**
- Phase 1 (4-8 weeks before): Build in public, waitlist, community
- Phase 2 (launch day): Product Hunt + HN + Twitter thread
- Phase 3 (after): Weekly updates, blog posts, Launch Week

### Name Change Discussion ⚠️
- Iceberg too similar to Quora (trademark risk)
- Name options: Vekta, Vectra, Embr, Nexvec, Gravio, Axvec
- Domain check: BigRock.in (RuPay works, ~Rs.799/year)
- **Status: Still undecided**

### Build in Public Strategy (Pre-launch)
Card aane ka wait hai Oracle ke liye — 10 din mein Visa aayega.
Tab tak Twitter pe:
- Village + startup contrast posts (most viral potential)
- Founder problems posts (vague, no product reveal)
- India AI insight posts (hint without revealing)
- Launch day pe full reveal thread

### HP Govt Website
- Sent email to sio-hp@nic.in about performance issues
- Issues identified: single server, no CDN, no mobile-responsive
- Also sent to himseva contact form
- Status: Waiting for reply

### Oracle Cloud Issues
- SBI debit card: needs "credit facility enabled" 
- Tried multiple times, card blocked by SBI fraud protection
- Scam call received (NOT from Oracle) — careful agar dobara aaye
- Solution: Railway kaam kar raha hai — Oracle baad mein jab credit card mile

### SBI Card Tips
- International e-commerce: YONO → Services → Debit Card → Channel Management → International E-commerce ON
- Agar multiple failed transactions → card block ho sakta hai
- Unblock: YONO → Block/Unblock → Unblock

---

## PENDING (Priority order)

1. **Name change decide karo** — Vekta/Vectra/Embr mein se ek
2. **Domain book karo** — BigRock.in pe check karo
3. **VITE_DASHBOARD_URL** landing pe set karna hai Vercel env vars mein
4. **Signup test karo** — dashboard live hai, test karo
5. **database.py** — PostgreSQL support add karna (abhi SQLite)
6. **Twitter account** — build in public start karo
7. **Oracle account** — jab credit card mile
8. **10 beta users** dhundna

---

## CURRENT LIVE URLS
- Backend API: https://Iceberg-database-production.up.railway.app
- Backend health: https://Iceberg-database-production.up.railway.app/health
- Backend docs: https://Iceberg-database-production.up.railway.app/docs
- Landing: https://database-bice-phi.vercel.app
- Dashboard: https://database-dashboard-mu.vercel.app

---

## KEY FILES
- Iceberg-backend/main.py, routers/auth.py, core/database.py
- Iceberg-backend/railway.toml, Dockerfile, requirements.txt
- Iceberg-dashboard/src/pages/Signup.jsx, Login.jsx, LoginKey.jsx
- Iceberg-dashboard/src/App.jsx, lib/api.js, vite.config.js
- Iceberg-landing/src/App.jsx, src/HomePageNew.jsx

---

## BUSINESS MODEL
See: .kiro/steering/Iceberg-pricing.md

## PINECONE COMPARISON
See: .kiro/steering/Iceberg-vs-pinecone.md

## TECH STACK + HOSTING + DB
See: .kiro/steering/Iceberg-tech-stack.md

---

## ⚠️ NAME CHANGE REQUIRED — CRITICAL
- Quora trademark risk — Iceberg too similar
- Options: Vekta, Vectra, Embr, Nexvec, Gravio, Axvec
- Once decided → full codebase rename needed

---

## CURRENT STATUS (July 4, 2026 — End of Session)

### Local Development — All Running
- Backend: http://localhost:8000 ✅ (FastAPI + Qdrant + SQLite)
- Dashboard: http://localhost:5173 ✅ (React + Vite)
- Landing: http://localhost:5174 ✅ (React + Vite)
- Signup/Login: Tested and working ✅
- Proxy /api → backend: Working ✅

### Code Changes Done This Session
1. Iceberg-dashboard/src/pages/Signup.jsx — api_key + project_id auto-saved
2. Iceberg-dashboard/src/pages/Login.jsx — simplified, no manual API key step
3. Iceberg-dashboard/src/pages/LoginKey.jsx — created (new device login)
4. Iceberg-dashboard/src/App.jsx — LoginKey route added
5. Iceberg-dashboard/vite.config.js — created (proxy /api to backend)
6. Iceberg-landing/src/App.jsx — pricing updated (500K free, unlimited collections, never pauses, comparison banner, vendor lock-in feature card)

### What Was Discussed & Decided
- Free tier: 500K vectors, 1K queries/day, unlimited collections, never pauses
- Pricing: 3 revenue streams (subscription + overage + add-ons)
- DB: SQLite now → PostgreSQL production (Oracle server pe install)
- Hosting: Oracle Cloud Free Mumbai (agar Visa mile) → Railway backup
- Cloudflare: R2 for backups (optional, already in code), Tunnel for BYOC
- Full Pinecone comparison done and saved

### APIs Tested & Working (July 5, 2026)
- Health ✅, Signup ✅, Login ✅, Collections ✅, Search ✅
- Dashboard: localhost:5173 ✅
- Landing: localhost:5174 ✅ (dark/light toggle + 7 SDK tabs added)

### Next Session — "haan oye krte kam start"
1. Browser mein har feature manually test karo
2. Railway deploy karo
3. Bank — Visa card try karna tha Oracle ke liye

## FIXES DONE THIS SESSION
1. Signup flow — api_key + project_id auto-saved, no extra step
2. Login simplified — no manual API key on same device
3. LoginKey page — /login/key for new device
4. vite.config.js — /api proxy to backend
5. Landing page pricing updated — 500K free, unlimited collections

## PENDING (In order)
1. ~~Kal bank jaana — RuPay → Visa convert karne ki koshish~~
2. Oracle account banana (Mumbai region, Always Free)
3. database.py — PostgreSQL support add karna
4. Server pe PostgreSQL + Qdrant install karna
5. Backend deploy karna
6. Dashboard + Landing → Vercel deploy
7. **NAME CHANGE — Iceberg rename karna (see below)**
8. Domain lena naye naam ka (BigRock.in, RuPay works)
9. 10 beta users dhundna

## CLOUDFLARE USAGE IN Iceberg
1. **Cloudflare R2** — File storage + backups (services/storage.py)
   - User PDF upload → R2 mein save
   - Collection backup → R2 mein JSON
   - AWS S3 se better: egress FREE (S3 = $0.09/GB, R2 = ₹0)
   - 10GB free storage
   - Optional — agar .env mein R2 keys nahi toh local disk mode
   - Abhi launch ke liye skip karo, baad mein add karo

2. **Cloudflare Tunnel** — BYOC secure access (core/remote_access.py)
   - Bank/hospital ke server pe Iceberg install hai
   - Iceberg team ko support dena ho → outbound tunnel
   - Bank khud close kar sakta hai anytime
   - Sirf BYOC customers ke liye — abhi zarurat nahi

## SESSION SUMMARY — July 4, 2026
Aaj ka poora kaam:
- Signup/Login flow fix kiya
- Free tier update kiya (500K vectors, unlimited collections, never pauses)
- Pinecone vs Iceberg complete comparison kiya (research verified)
- Pricing strategy finalize ki (3 revenue streams)
- Tech stack explain kiya
- DB comparison kiya (SQLite → PostgreSQL needed)
- Hosting comparison kiya (Oracle best, Railway backup)
- Vendor lock-in strategy finalize ki
- Infrastructure explain kiya (Qdrant, LRU, Always-on, BYOC)
- Cloudflare usage clear kiya (R2 + Tunnel)
- Deploy plan banaya
- Sab 5 files mein save kiya

---

## KEY FILES
- Iceberg-backend/main.py, routers/auth.py, core/database.py
- Iceberg-backend/railway.toml, Dockerfile
- Iceberg-dashboard/src/pages/Signup.jsx, Login.jsx, LoginKey.jsx
- Iceberg-dashboard/src/App.jsx, lib/api.js, vite.config.js
- Iceberg-landing/src/App.jsx, src/HomePageNew.jsx

---

## BUSINESS MODEL
See: .kiro/steering/Iceberg-pricing.md

## PINECONE COMPARISON
See: .kiro/steering/Iceberg-vs-pinecone.md

## TECH STACK + HOSTING + DB
See: .kiro/steering/Iceberg-tech-stack.md

---

## SESSION LOG — July 13, 2026

### Code Changes Done
1. `Iceberg-landing/src/HomePageNew.jsx` — broken template literals fix kiye (previous session ke errors)
   - Pattern: `border: 1px solid ` → `` border: `1px solid ${cardBorder}` ``
   - `className={px-5...}` → proper template literals
   - `selectedCollection` state add kiya (was missing, used but undeclared)
   - `slideIn` keyframe `index.css` mein add kiya
2. Hero right panel — Option 1 (Auto-typing Live Search Demo) implement kiya
   - Previous: Dashboard + Search Combo (Option 3)
   - New: Single dark terminal window, character-by-character typing, score bars with blue-purple gradient, ~14ms badge, 4s auto-cycle

### Hero Panel Options Discussed (for reference)

**Option 1 — Auto-typing Live Search Demo (CURRENT)**
- Single dark terminal window
- Page load pe automatic query type hoti hai char by char
- Spinner → 3 results slide in → score bars 0% se fill → % flip
- Green ~14ms badge bottom right
- 4s baad clear → next query auto-start
- Chips: "return policy", "pricing plans", "agent memory"

**Option 2 — Split Panel (Code + Results)**
- Left: Python/JS/Go tabs with syntax highlighted code
- Right: search input + animated results
- Left mein query dynamically update hoti thi

**Option 3 — Dashboard + Search Combo (was live before)**
- Left 45%: mini dashboard (stats, collections list, live log)
- Right 55%: live search with auto-typing
- Title bar: dashboard.Iceberg.in

### What Was Discussed

**Why Qdrant's website looks "bigger":**
- 20-30 alag pages (use cases, solutions, blog, case studies)
- 50+ technical blog posts = Google ranking
- Social proof (GitHub stars, logo walls, case studies)
- 4-5 saal ki mehnat
- Conclusion: website design problem nahi hai abhi — ship karo pehle

**Product Launch Research — Real Data:**

| Company | Launch Style | Key Result |
|---------|-------------|-----------|
| Supabase | Accidental HN post (user ne share kiya) | 30K visitors, 1400 signups in 7 days |
| Pinecone | Stealth → press release + $10M funding same day (Jan 2021) | Slow growth until ChatGPT (Nov 2022), then exploded |
| Qdrant | GitHub README only, ML community ne khud dhundha | HN front page organically, $28M Series A 2024 |
| Weaviate | Open source + Discord community | $16M Series A 2022 |
| Neon | Waitlist → beta → Product Hunt → GA | Standard dev tool playbook |

**3-Phase Launch Playbook (for Iceberg/new name):**

Phase 1 — BEFORE (4-8 hafte pehle):
- Build in public — Twitter pe daily chhoti updates
- Waitlist landing page
- r/developersIndia, r/MachineLearning, Discord mein community build
- 10-20 beta users personally DM karo

Phase 2 — LAUNCH DAY:
- Product Hunt — Tuesday/Wednesday 12:01 AM PST
- Hacker News — "Show HN: [Name] — India's vector database, hosted in Mumbai"
- Twitter thread — story batao (kyun banaya, kya problem)
- Saara din online raho, sab comments ka jawab do

Phase 3 — AFTER:
- Weekly Twitter updates
- Technical blog posts ("How we handle hybrid search")
- Launch Week (Supabase style) — 3-4 mahine baad
- First user ki case study

**Timing Advantage:** India mein AI boom abhi aa raha hai + DPDP Act (data sovereignty) — narrative strong hai.

---

## ⚠️ NAME CHANGE REQUIRED — CRITICAL

### Problem
- **Quora** (Quora.com) — major social media company, trademarked name
- **Iceberg** — too similar, legal action risk
- Iceberg.com aur Iceberg.in both likely taken/squatted

### Name Options Suggested (July 13, 2026)

| Name | Logic | Domain Availability |
|------|-------|-------------------|
| **Vekta** | "Vec" from vector, unique spelling | High — check vekta.in |
| **Vectra** | Latin feel, premium, "spectra" jaisa | Medium — check vectra.in |
| **Embr** | Embeddings → Embr, punchy startup name | High — check embr.in |
| **Nexvec** | "Next Vector" | Medium — check nexvec.in |
| **Gravio** | Gravity + vector (direction/magnitude) | High — check gravio.in |
| **Axvec** | Axis + Vector, technical | High — check axvec.in |

### How to Check Domain
- BigRock.in pe check karo (RuPay works, ~Rs.799/year for .in)
- `.in` + `.io` + `.com` teeno check karo

### Decision Pending
User ne abhi naam confirm nahi kiya — next session mein decide hoga.
Once naam decide ho → full codebase rename karna hoga (sab folders, imports, branding).
