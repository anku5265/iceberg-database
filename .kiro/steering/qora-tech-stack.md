---
inclusion: manual
---

# Qora Tech Stack + Hosting + Database Guide
## Last Updated: July 4, 2026

---

## PART 1 — TECH STACK (What & Why)

### 1.1 Backend — FastAPI (Python)

**Kya hai:** Python web framework — handles all API requests

**Kyun FastAPI:**
- Django: Heavy, too much included, slow
- Flask: Simple but manual sab karna padta
- FastAPI: ✅ Auto API docs, ✅ Type checking, ✅ Async, ✅ Fast startup

**Kaam:**
- User request aata hai (search, upload, login)
- FastAPI process karta hai
- Qdrant se search ya SQLite/PostgreSQL se data laata hai
- Response return karta hai

**Cost:** Free (open source)

---

### 1.2 Vector Engine — Qdrant

**Kya hai:** Vectors store + search engine. Qora ka core product engine.

**Why Qdrant over alternatives:**
| | Qdrant | Pinecone | Chroma | Milvus | Weaviate |
|---|---|---|---|---|---|
| Open source | ✅ | ❌ | ✅ | ✅ | ✅ |
| Language | Rust | Proprietary | Python | C++/Go | Go |
| Performance | ✅ Fastest | Medium | Slow | Fast | Medium |
| Self-host | ✅ Easy | ❌ | ✅ | Complex | Complex |
| Production ready | ✅ | ✅ | ❌ | ✅ | ✅ |
| India hosting | ✅ | ❌ | ✅ | ✅ | ✅ |

**Qdrant kaise kaam karta hai:**
```
Document aaya → FastAPI chunks karta hai → embed karta hai → Qdrant mein store
Query aayi → FastAPI embed karta hai → Qdrant similar vectors dhundhta hai → result
```

**Cost:** Free (self-hosted)

---

### 1.3 Embedding Model — fastembed (all-MiniLM-L6-v2)

**Kya hai:** Text → vector conversion model. 384 dimensions.

**Why this model:**
| | all-MiniLM-L6-v2 | OpenAI ada-002 | multilingual-e5 |
|---|---|---|---|
| Cost | Free | $0.0001/1K tokens | Free |
| Dimensions | 384 | 1536 | 768 |
| Hindi support | Partial | ❌ | ✅ Best |
| Speed | Fast | API call needed | Medium |
| Quality | 90% of OpenAI | 100% | 95% + Hindi |

**Future:** Switch to multilingual-e5-large for better Hindi support

---

### 1.4 Relational DB — SQLite → PostgreSQL

**SQLite (local dev):**
- Single file, no server needed
- Perfect for development and testing
- Limitation: concurrent writes slow

**PostgreSQL (production):**
- Proper production DB
- Handles concurrent users
- Industry standard, free (open source)

**What's stored:**
```
users: id, email, password_hash, plan, created_at
projects: id, user_id, name, description
api_keys: id, user_id, key_hash, role, is_active, last_used
usage_logs: user_id, action, collection, duration_ms
assistants: id, user_id, name, llm_provider, llm_model
waitlist: email, created_at
```

---

### 1.5 Frontend — React + Tailwind + Vite

**React:** UI framework (Facebook). Industry standard.
**Tailwind:** CSS with classes. Fast to write, consistent design.
**Vite:** Build tool. Much faster than webpack. Dev server + production build.

---

### 1.6 Payments — Razorpay (Future)
- India #1 payment gateway
- UPI + cards + netbanking + RuPay ✅
- GST invoice automatic
- Indian companies trust it

---

## PART 2 — DATABASE COMPARISON

### 2.1 Relational DB (For users, API keys, billing)

| | Supabase | Neon | Railway PostgreSQL | Self-hosted |
|---|---|---|---|---|
| Free tier | 500MB, 2 projects | 0.5GB, unlimited | $5 credit/mo | Free |
| Card needed | ❌ No | ❌ No | ❌ No | ❌ No |
| RuPay | ✅ | ✅ | ✅ | N/A |
| Sleep on idle | ⚠️ Pauses after 1 week | ❌ Never | ❌ Never | ❌ Never |
| India region | ❌ US/EU | ❌ US | ❌ US | ✅ Hetzner |
| Best for | Full-stack + auth | Pure serverless DB | Simple deploy | Full control |
| 2026 verdict | Good but pauses | Best serverless free | Easy | Best for production |

**Recommendation:**
- MVP: Neon (free, never pauses, no card, simple connection string)
- Growth: DigitalOcean Managed PostgreSQL (~$15/mo, RuPay, Bangalore DC)

**Why Neon over Supabase:**
- Supabase pauses after 7 days inactive → production risk
- Neon serverless = always on, scales automatically
- Source: selfhost.hashnode.dev comparison 2026

### 2.2 Vector DB (For documents, search)

| | Qdrant self-hosted | Qdrant Cloud | Pinecone | Weaviate | Chroma |
|---|---|---|---|---|---|
| Cost | Free | 1GB free | 300K free | 14-day trial | Free |
| India DC | ✅ your server | ❌ | ❌ | ❌ | N/A |
| Performance | ✅ Fastest | ✅ | Medium | Medium | Slow |
| Self-host | ✅ | N/A | ❌ | ✅ | ✅ |
| Production | ✅ | ✅ | ✅ | ✅ | ❌ |

**Recommendation:** Qdrant self-hosted on India server — free, fastest, full control, DPDP compliant.

---

## PART 3 — HOSTING COMPARISON

### 3.1 Backend + Qdrant Server

| | Railway | Render | Hetzner VPS | DigitalOcean | Oracle Cloud Free |
|---|---|---|---|---|---|
| Cost | $5/mo credit then paid | Free | €4.51/mo (~₹400) | $12/mo (~₹1,000) | FREE forever |
| RAM | 8GB | 512MB ❌ | 4GB (CX22) | 2GB+ | 24GB ✅ |
| India DC | ❌ US/EU | ❌ US | ❌ Germany | ✅ Bangalore | ✅ Mumbai |
| Card needed | ❌ No (initially) | ❌ No | ✅ RuPay works | ✅ RuPay works | ❌ Visa/MC only |
| Docker | ✅ | ✅ | ✅ | ✅ | ✅ |
| Always on | ✅ | ❌ Sleeps | ✅ | ✅ | ✅ |
| Qdrant RAM ok | ✅ | ❌ Too little | ✅ | ✅ | ✅ |
| railway.toml | ✅ Already configured | — | — | — | — |

**Phase 1 (Now — no card):** Railway
- railway.toml already configured in project
- No card needed
- Deploy in 15 minutes

**Phase 2 (Month 1-2):** Hetzner CX22 (~₹400/mo, RuPay)
- 4GB RAM, Germany (EU)
- Good for Qdrant + FastAPI together

**Phase 3 (When revenue):** DigitalOcean Bangalore
- India DC = DPDP compliant
- RuPay works
- Managed PostgreSQL available same platform

**Dream option:** Oracle Cloud Free Mumbai
- 24GB RAM, FREE forever
- India DC = perfect
- Only blocker: needs Visa/Mastercard once for verification

### 3.2 Dashboard + Landing Page

| | Vercel | Netlify | Cloudflare Pages |
|---|---|---|---|
| Cost | Free | Free | Free |
| Card | ❌ No | ❌ No | ❌ No |
| Custom domain | ✅ Free SSL | ✅ Free SSL | ✅ Free SSL |
| React/Vite support | ✅ Best | ✅ | ✅ |

**Recommendation:** Vercel — best React support, zero config, no card.

---

## PART 4 — DOMAIN

### qora.in Status
- Search results show domain exists but SSL error on fetch
- Likely TAKEN or parked
- Must verify on Namecheap/GoDaddy directly

### Alternative Domains to Check
| Domain | Est. Price/yr | Likely Available |
|---|---|---|
| qora.in | ₹500-800 | ❌ Likely taken |
| qoradb.in | ₹500-800 | ✅ Likely available |
| useqora.in | ₹500-800 | ✅ Likely available |
| getqora.in | ₹500-800 | ✅ Likely available |
| qoravector.in | ₹500-800 | ✅ Likely available |
| qora.ai | ~₹5,000-8,000 | Available but expensive |

### Where to Buy
- **Namecheap.com** — Cheapest, ~$1.99/yr first year (~₹166), no card for .in sometimes
- **BigRock.in** — Indian registrar, ₹1 first year offers, RuPay works
- **GoDaddy.in** — ₹179-199 + GST promo (May 2026 offer), RuPay works

**Recommendation:** BigRock.in — Indian company, RuPay works, competitive pricing.

---

## RECOMMENDED FINAL SETUP (Free tier, no Visa card)

```
Landing page → Vercel (free, no card)
Dashboard    → Vercel (free, no card)
                    ↓
Backend API  → Railway (free $5 credit, no card)
                    ↓
Vector DB    → Qdrant (same Railway service)
                    ↓
Relational   → Neon PostgreSQL (free, no card, never pauses)
                    ↓
Domain       → qoradb.in or useqora.in → BigRock.in (~₹500-800/yr, RuPay)

Total monthly cost: ₹0
Total yearly cost: ₹500-800 (domain only)
```

---

## UPGRADE PATH (When revenue comes)

```
Month 2-3: Hetzner CX32 (€8/mo = ~₹750, 8GB RAM, RuPay)
Month 3-6: DigitalOcean Bangalore ($24/mo, India DC, RuPay, managed PostgreSQL)
Month 6+:  If Oracle card available → migrate to Oracle Cloud Free Mumbai (free forever)
Year 1+:   Own dedicated server India if scale demands
```
