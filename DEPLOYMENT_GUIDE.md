# Iceberg Deployment Guide

Complete guide to deploy Iceberg — Backend (Railway), Dashboard (Vercel), Landing (Vercel).

## Architecture Overview

```
User Browser
    ↓
Landing Page (Vercel) → icebergdb.io
    ↓
Dashboard (Vercel) → dashboard.icebergdb.io
    ↓
Backend API (Railway) → iceberg-api.railway.app
    ↓
Qdrant (embedded) + SQLite + Cloudflare R2
```

---

## Prerequisites

1. GitHub account
2. Railway account (sign up with GitHub)
3. Vercel account (sign up with GitHub)
4. Domain (optional but recommended): `icebergdb.io`
5. Cloudflare R2 account (optional — for file storage)

---

## Part 1: Backend Deployment (Railway)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Iceberg v0.1.0"

git remote add origin https://github.com/YOUR_USERNAME/iceberg.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `iceberg` repo
4. Root Directory: `iceberg-backend`
5. Railway will auto-detect Dockerfile and deploy
6. Wait for build (5-10 minutes first time)

### Step 3: Configure Environment Variables

In Railway dashboard → Your Project → Variables:

```
MASTER_API_KEY=ib_prod_CHANGE_THIS_TO_RANDOM_STRING_32_CHARS
```

Optional (for R2 backups):
```
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY=your_r2_access_key
R2_SECRET_KEY=your_r2_secret_key
R2_BUCKET=iceberg-storage
```

### Step 4: Get Railway URL

- Railway auto-generates URL like: `iceberg-production-abc123.up.railway.app`
- Copy this URL — needed for frontend deployment
- Test: `curl https://YOUR_RAILWAY_URL.railway.app/health`

---

## Part 2: Dashboard Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Root Directory: `iceberg-dashboard`
5. Framework Preset: Vite
6. Click "Deploy"

### Step 2: Configure Environment Variables

In Vercel → Project Settings → Environment Variables:

```
VITE_API_URL=https://YOUR_RAILWAY_URL.railway.app
```

### Step 3: Redeploy

After adding env vars, trigger redeploy:
- Vercel Dashboard → Deployments → Click "..." → Redeploy

### Step 4: Custom Domain (Optional)

- Vercel Dashboard → Settings → Domains
- Add `dashboard.icebergdb.io`
- Update DNS records as shown by Vercel

---

## Part 3: Landing Page Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Vercel Dashboard → "Add New" → "Project"
2. Select same GitHub repo
3. Root Directory: `iceberg-landing`
4. Framework Preset: Vite
5. Click "Deploy"

### Step 2: Configure Environment Variables

```
VITE_DASHBOARD_URL=https://dashboard.icebergdb.io
VITE_API_URL=https://YOUR_RAILWAY_URL.railway.app
```

### Step 3: Custom Domain

- Add `icebergdb.io` and `www.icebergdb.io`
- Update DNS records

---

## Part 4: Backend CORS Update

Update `iceberg-backend/main.py` with your actual domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://dashboard.icebergdb.io",
        "https://icebergdb.io",
        "https://www.icebergdb.io",
        "https://*.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push — Railway will auto-redeploy.

---

## Part 5: DNS Configuration

### If using Cloudflare (recommended):

```
Type    Name          Content
----    ----          -------
A       @             76.76.21.21   (Vercel IP from their dashboard)
CNAME   dashboard     cname.vercel-dns.com
CNAME   www           cname.vercel-dns.com
```

---

## Verification Checklist

- [ ] Backend health check: `curl https://YOUR_RAILWAY_URL/health`
- [ ] Landing page loads: `https://icebergdb.io`
- [ ] Dashboard loads: `https://dashboard.icebergdb.io`
- [ ] Signup works on dashboard
- [ ] Create collection works
- [ ] Search works
- [ ] Waitlist form works on landing page

---

## Local Development Setup

### Backend:
```bash
cd iceberg-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn main:app --reload --port 8000
```

### Dashboard:
```bash
cd iceberg-dashboard
npm install
npm run dev
# Runs on http://localhost:3000
```

### Landing:
```bash
cd iceberg-landing
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Costs (Monthly)

- Railway: $5/mo (Hobby plan) or $20/mo (Pro)
- Vercel: Free (100GB bandwidth) or $20/mo (Pro)
- Domain: ₹800-1500/year
- Cloudflare R2: Free (10GB storage, no egress fees)

**Total: ~$5-10/mo to start**

---

## Troubleshooting

### Issue: CORS errors in browser console
**Fix:** Update CORS origins in `main.py`, push, wait for Railway redeploy.

### Issue: 502 Bad Gateway
**Fix:** Railway container crashed. Check Railway logs. Usually means missing env vars or startup error.

### Issue: Dashboard shows "Failed to fetch"
**Fix:** Check `VITE_API_URL` is set correctly in Vercel env vars.

### Issue: Embedding model taking too long to load
**Fix:** Railway free tier has slow cold starts. Upgrade to Hobby plan for persistent containers.

---

## Support

- Issues: Create GitHub issue
- Email: hello@icebergdb.io
