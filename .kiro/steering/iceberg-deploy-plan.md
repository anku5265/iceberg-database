---
inclusion: manual
---

# Iceberg — Deployment Plan
## Last Updated: July 4, 2026

---

## CURRENT SITUATION

### Abhi kya chal raha hai (Local)
- Backend: http://localhost:8000 ✅ (FastAPI + Qdrant + SQLite)
- Dashboard: http://localhost:5173 ✅ (React + Vite)
- DB: SQLite (local file — production ke liye nahi chalega)
- railway.toml: Already configured ✅
- Dockerfile: Already configured ✅

### Blocker
- Oracle Cloud Free chahiye (best option — Mumbai DC, 24GB RAM, FREE)
- Oracle ke liye Visa/Mastercard chahiye
- User ke paas sirf RuPay hai
- **Kal bank jaana hai — RuPay → Visa convert karne ke liye**

---

## PLAN A — Oracle Cloud (Best, agar Visa mil jaaye)

### Step 1: Oracle Account Banana
- oracle.com/cloud/free pe jaao
- Visa/Mastercard se signup karo
- India West (Mumbai) region choose karo
- Always Free ARM instance: 4 core, 24GB RAM

### Step 2: Server Setup (Oracle pe)
```bash
# PostgreSQL install
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo -u postgres createdb Iceberg
sudo -u postgres createuser iceberg_user

# Docker install (Qdrant ke liye)
sudo apt install docker.io -y
sudo systemctl start docker

# Qdrant run karo
sudo docker run -d -p 6333:6333 -v /data/qdrant:/qdrant/storage qdrant/qdrant
```

### Step 3: Backend Code Update
- database.py mein PostgreSQL support add karna (abhi sirf SQLite hai)
- SQLite → PostgreSQL migration (automatic on first run)

### Step 4: Backend Deploy
```bash
git clone <repo>
cd Iceberg-backend
pip install -r requirements.txt
# .env set karo (DATABASE_URL, MASTER_API_KEY etc)
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 5: Dashboard + Landing → Vercel
- vercel.com pe GitHub se connect karo (no card needed)
- Iceberg-dashboard folder deploy karo
- Iceberg-landing folder deploy karo
- VITE_API_URL = Oracle server ka IP set karo

### Step 6: Domain (Baad mein)
- icebergdb.io ya useicebergdb.io check karo
- BigRock.in pe kharido (~₹500-800/yr, RuPay works)
- Vercel pe domain connect karo

### Total Cost: ₹0/month (sirf domain ₹500-800/yr)

---

## PLAN B — Railway (Agar Visa nahi mila)

### Step 1: Railway Account
- railway.app pe GitHub se signup (no card)
- New project → GitHub repo connect karo

### Step 2: Services Add Karo
```
Railway project mein:
1. Backend service → Iceberg-backend folder
2. PostgreSQL plugin → add karo (DATABASE_URL auto milega)
3. Qdrant → Docker image se (qdrant/qdrant)
```

### Step 3: Environment Variables Set Karo
```
MASTER_API_KEY=ib_xxxxxxxxxxxx
DATABASE_URL=(Railway auto dega)
QDRANT_URL=http://qdrant:6333
```

### Step 4: Deploy
- Push to GitHub → Railway auto deploy karega

### Step 5: Dashboard + Landing → Vercel (same as Plan A)

### Total Cost: $5 credit/mo free, phir ~$10-20/mo

---

## WHAT'S LEFT AFTER SERVER + DB READY

Ye 5 kaam baaki hain:

### 1. database.py — PostgreSQL Support Add Karna
**Status:** ❌ Pending
**Kya karna hai:** Abhi sirf SQLite hai. PostgreSQL support add karna.
**Estimated time:** 30 minutes
**Note:** Kiro se karwao — "database.py mein PostgreSQL support add karo"

### 2. Environment Variables Setup
**Status:** ❌ Pending
**Kya set karna hai:**
```
MASTER_API_KEY=ib_<long_random_string>
DATABASE_URL=postgresql://user:pass@localhost/Iceberg
QDRANT_URL=http://localhost:6333
R2_ACCOUNT_ID= (optional, backup ke liye)
R2_ACCESS_KEY= (optional)
R2_SECRET_KEY= (optional)
```

### 3. Backend Deploy (Server pe)
**Status:** ❌ Pending
**Depends on:** Server ready hona

### 4. Dashboard + Landing Deploy (Vercel)
**Status:** ❌ Pending
**Kya set karna hai:**
```
VITE_API_URL=https://api.Iceberg.in (ya server IP)
VITE_DASHBOARD_URL=https://dashboard.Iceberg.in
```

### 5. Domain (Optional, baad mein)
**Status:** ❌ Pending
**Check karna hai:** icebergdb.io ya useicebergdb.io available hai kya
**Kahan kharido:** BigRock.in (RuPay works)
**Price:** ~₹500-800/yr

---

## DATABASE DECISION

### Abhi use ho raha hai: SQLite
- File: Iceberg-backend/data/Iceberg.db
- Local dev ke liye theek hai
- Production mein nahi chalega (ephemeral storage)

### Production ke liye: PostgreSQL
- Kahan: Oracle ke same server pe install karo (direct, free)
- Ya Railway ka built-in PostgreSQL
- Ya Neon (free, no card, never pauses)
- **Andar se sab PostgreSQL hi hain — koi fark nahi**

### Why PostgreSQL over SQLite for production:
- Concurrent users handle karta hai
- Ephemeral storage issue nahi
- Industry standard
- Free (open source)

---

## HOSTING FINAL DECISION

| Option | Cost | Card | India DC | RAM | Status |
|---|---|---|---|---|---|
| Oracle Cloud Free | FREE | Visa/MC | ✅ Mumbai | 24GB | ⏳ Kal bank jaana hai |
| Railway | $5 credit | ❌ No card | ❌ US | 8GB | Backup option |
| Hetzner CX22 | €4.51/mo | RuPay ✅ | ❌ Germany | 4GB | If Oracle fails |

**Primary:** Oracle Cloud Free Mumbai (FREE + India DC + 24GB RAM)
**Backup:** Railway (no card, deploy in 15 min, railway.toml ready)

---

## TIMELINE

```
Today (July 4): Code ready, local testing done ✅
Tomorrow: Bank jaana — RuPay → Visa convert karne ki koshish
If Visa: Oracle signup → server setup → deploy (2-3 hours)
If no Visa: Railway deploy (15 min) → later migrate to Oracle
Week 1: Live hona
Week 2-3: 10 beta users dhundna (Indian AI Discord, LinkedIn)
Month 1: First paying customer
```

---

## CHECKLIST (Deploy ke time check karna)

- [ ] Oracle account created (Mumbai region)
- [ ] PostgreSQL installed on server
- [ ] Qdrant running on server (Docker)
- [ ] database.py — PostgreSQL support added
- [ ] .env production set kiya
- [ ] Backend deployed and running
- [ ] Health check: curl https://api.Iceberg.in/health → {"status":"ok"}
- [ ] Dashboard deployed on Vercel
- [ ] Landing page deployed on Vercel
- [ ] Signup flow tested end-to-end
- [ ] Domain connected (optional)
