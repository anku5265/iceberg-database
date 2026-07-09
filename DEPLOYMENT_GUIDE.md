# Qora Deployment Guide

Complete guide to deploy Qora — Backend (Railway), Dashboard (Vercel), Landing (Vercel).

## Architecture Overview

```
User Browser
    ↓
Landing Page (Vercel) → qora.in
    ↓
Dashboard (Vercel) → dashboard.qora.in
    ↓
Backend API (Railway) → qora-api.railway.app
    ↓
Qdrant (embedded) + SQLite + Cloudflare R2
```

---

## Prerequisites

1. GitHub account
2. Railway account (sign up with GitHub)
3. Vercel account (sign up with GitHub)
4. Domain (optional but recommended): `qora.in`
5. Cloudflare R2 account (optional — for file storage)

---

## Part 1: Backend Deployment (Railway)

### Step 1: Push to GitHub

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial commit - Qora v0.1.0"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/qora.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `qora` repo
4. Railway will auto-detect Dockerfile and deploy
5. Wait for build (5-10 minutes first time)

### Step 3: Configure Environment Variables

In Railway dashboard → Your Project → Variables:

```
MASTER_API_KEY=qr_prod_CHANGE_THIS_TO_RANDOM_STRING_32_CHARS
```

Optional (for R2 backups):
```
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY=your_r2_access_key
R2_SECRET_KEY=your_r2_secret_key
R2_BUCKET=qora-storage
```

### Step 4: Get Railway URL

- Railway auto-generates URL like: `qora-production-abc123.up.railway.app`
- Copy this URL — needed for frontend deployment
- Test: `curl https://YOUR_RAILWAY_URL.railway.app/health`

---

## Part 2: Dashboard Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Root Directory: `qora-dashboard`
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
- Add `dashboard.qora.in`
- Update DNS records as shown by Vercel

---

## Part 3: Landing Page Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Vercel Dashboard → "Add New" → "Project"
2. Select same GitHub repo
3. Root Directory: `qora-landing`
4. Framework Preset: Vite
5. Click "Deploy"

### Step 2: Configure Environment Variables

```
VITE_DASHBOARD_URL=https://dashboard.qora.in
VITE_API_URL=https://YOUR_RAILWAY_URL.railway.app
```

### Step 3: Custom Domain

- Add `qora.in` and `www.qora.in`
- Update DNS records

---

## Part 4: Backend CORS Update

Update `qora-backend/main.py` with your actual domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://dashboard.qora.in",     # Your dashboard domain
        "https://qora.in",                # Your landing domain
        "https://www.qora.in",
        "https://*.vercel.app",           # Vercel preview URLs
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push:
```bash
git add qora-backend/main.py
git commit -m "Update CORS for production domains"
git push
```

Railway will auto-redeploy.

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

### If using other DNS:

Follow Vercel's instructions in their dashboard.

---

## Verification Checklist

- [ ] Backend health check: `curl https://YOUR_RAILWAY_URL/health`
- [ ] Landing page loads: `https://qora.in`
- [ ] Dashboard loads: `https://dashboard.qora.in`
- [ ] Signup works on dashboard
- [ ] Create collection works
- [ ] Search works
- [ ] Waitlist form works on landing page

---

## Local Development Setup

### Backend:
```bash
cd qora-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn main:app --reload --port 8000
```

### Dashboard:
```bash
cd qora-dashboard
npm install
npm run dev
# Runs on http://localhost:3000
```

### Landing:
```bash
cd qora-landing
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Monitoring & Logs

### Railway Logs:
- Railway Dashboard → Your Project → Deployments → View Logs

### Vercel Logs:
- Vercel Dashboard → Your Project → Logs

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

## Production Hardening (Future)

- [ ] Add Redis for caching
- [ ] Switch to Postgres from SQLite
- [ ] Add Sentry for error tracking
- [ ] Set up Cloudflare WAF
- [ ] Configure Railway autoscaling
- [ ] Add health check monitoring (UptimeRobot)
- [ ] Set up automated backups schedule

---

## Support

- Issues: Create GitHub issue
- Email: hello@qora.in
- Twitter: @qora_db
