---
inclusion: always
---

# Qora — Master Context File
## Last Updated: July 4, 2026

---

## WHO IS THE USER
- Age 20, Himachal Pradesh (Kullu area)
- Building Qora Vector DB as a Service — India-first Pinecone alternative
- Also building: Overlay AI app (Flutter, 80% done), Voice Call Agent
- Goal: naam banana, future mein billion dollar company
- Has RuPay card only (no Visa/Mastercard)
- Has ADHD — keep things focused and clear
- Style: Hinglish conversation, direct answers preferred

---

## CURRENT STATUS (July 4, 2026 — End of Session)

### Local Development — All Running
- Backend: http://localhost:8000 ✅ (FastAPI + Qdrant + SQLite)
- Dashboard: http://localhost:5173 ✅ (React + Vite)
- Landing: http://localhost:5174 ✅ (React + Vite)
- Signup/Login: Tested and working ✅
- Proxy /api → backend: Working ✅

### Code Changes Done This Session
1. qora-dashboard/src/pages/Signup.jsx — api_key + project_id auto-saved
2. qora-dashboard/src/pages/Login.jsx — simplified, no manual API key step
3. qora-dashboard/src/pages/LoginKey.jsx — created (new device login)
4. qora-dashboard/src/App.jsx — LoginKey route added
5. qora-dashboard/vite.config.js — created (proxy /api to backend)
6. qora-landing/src/App.jsx — pricing updated (500K free, unlimited collections, never pauses, comparison banner, vendor lock-in feature card)

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
1. Kal bank jaana — RuPay → Visa convert karne ki koshish
2. Oracle account banana (Mumbai region, Always Free)
3. database.py — PostgreSQL support add karna
4. Server pe PostgreSQL + Qdrant install karna
5. Backend deploy karna
6. Dashboard + Landing → Vercel deploy
7. Domain — qoradb.in check karo (BigRock.in, RuPay works)
8. 10 beta users dhundna

## CLOUDFLARE USAGE IN QORA
1. **Cloudflare R2** — File storage + backups (services/storage.py)
   - User PDF upload → R2 mein save
   - Collection backup → R2 mein JSON
   - AWS S3 se better: egress FREE (S3 = $0.09/GB, R2 = ₹0)
   - 10GB free storage
   - Optional — agar .env mein R2 keys nahi toh local disk mode
   - Abhi launch ke liye skip karo, baad mein add karo

2. **Cloudflare Tunnel** — BYOC secure access (core/remote_access.py)
   - Bank/hospital ke server pe Qora install hai
   - Qora team ko support dena ho → outbound tunnel
   - Bank khud close kar sakta hai anytime
   - Sirf BYOC customers ke liye — abhi zarurat nahi

## SESSION SUMMARY — July 4, 2026
Aaj ka poora kaam:
- Signup/Login flow fix kiya
- Free tier update kiya (500K vectors, unlimited collections, never pauses)
- Pinecone vs Qora complete comparison kiya (research verified)
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
- qora-backend/main.py, routers/auth.py, core/database.py
- qora-backend/railway.toml, Dockerfile
- qora-dashboard/src/pages/Signup.jsx, Login.jsx, LoginKey.jsx
- qora-dashboard/src/App.jsx, lib/api.js, vite.config.js
- qora-landing/src/App.jsx

---

## BUSINESS MODEL
See: .kiro/steering/qora-pricing.md

## PINECONE COMPARISON
See: .kiro/steering/qora-vs-pinecone.md

## TECH STACK + HOSTING + DB
See: .kiro/steering/qora-tech-stack.md
