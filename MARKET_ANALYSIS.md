# Market Analysis — Qora, Overlay AI, Voice Call Agent
## Last Updated: July 2026

---

## 1. VECTOR DB / QORA

### Market Size
- 2025: $2.58B
- 2030: $8.95B (27.5% CAGR)
- 2034: $17.9B

### Demand Reality
- "Pinecone alternative" searches growing every month since 2023
- Pinecone exploring sale — customer churn high (bill $50 → $2847/month same dataset)
- NASSCOM 2025: 67% Indian enterprise GenAI systems use RAG = direct vector DB need
- "Pinecone alternatives 2026" — 11+ comparison articles on Google top
- "Affordable vector database India" — zero good results = GAP

### India Market
- India SaaS: $9.14B (2025) → $102B (2035)
- Indian B2B DOES pay — Salesforce India $1B+ revenue, 35% YoY growth
- Indian consumers don't pay, but developers and startups do
- DPDP Act = data must stay in India = local hosted DB advantage

### Competitors
| Company | Pricing | Problem |
|---|---|---|
| Pinecone | $70/mo+ | Expensive, US only, exploring sale |
| Qdrant Cloud | Pay-as-you-go | No India region, complex setup |
| Weaviate | $500+/mo | Complex, no Hindi support |
| pgvector | Free | No UI, full DevOps yourself |

### Qora Advantages
- Hybrid search free (Pinecone charges extra)
- Built-in embeddings (no OpenAI extra cost)
- India data residency (DPDP compliance)
- INR pricing (6x cheaper than Pinecone)
- Assistant + Memory feature (Pinecone has neither)
- More SDKs (Rust, .NET also)

### Pricing Suggested
| Plan | Price | Vectors |
|---|---|---|
| Free | ₹0 | 50K |
| Starter | ₹999/mo | 500K |
| Growth | ₹4,999/mo | 5M |
| Scale | ₹14,999/mo | 50M |
| Enterprise | Custom | Unlimited |

### Break-even
- 3-4 paying customers = profitable
- Infrastructure cost: ~₹7,000/month (Railway + Qdrant)

### Verdict
✅ Real demand, real gap, code 90% ready, B2B = stable money
❌ Slow sales cycle (B2B), brand trust takes time

---

## 2. OVERLAY AI

### Market Size
- Personal AI Assistant: $3.4B (2025) → $19.6B (2030) — 42% CAGR
- India AI app downloads: 602M in 2025 (3x jump)

### What's Working
- Cluely (US): $20.3M raised — real-time screen overlay
- Equal AI (India): $42M raised, 1M+ users (call screening only)
- Rewind/Limitless: Acquired by Meta Dec 2025

### India Gap
- No proper Hindi + screen overlay product
- Equal AI only does call screening — no full assistant
- 602M AI app downloads = massive demand

### Tech Stack (Already 80% Ready)
- Flutter (cross-platform)
- Groq API: llama-3.3-70b (free tier)
- Gemini API: vision/video analysis
- Hive: local storage
- Android Accessibility Service: screen reading

### Risks
- Play Store removing "cheating" apps — positioning must be legitimate
- B2C monetization hard — need freemium → premium model
- Privacy concerns with screen reading

### Verdict
✅ Massive market, fast downloads, code mostly ready
❌ Play Store risk, hard monetization, B2C = slow revenue

---

## 3. VOICE CALL AGENT ⭐ IMMEDIATE OPPORTUNITY

### Market Size
- Voice AI Agents: $2.14B (2025) → $14.37B (2035) — 18.3% CAGR
- AI Agents overall: $7.84B (2025) → $52.62B (2030) — 46.3% CAGR
- Conversational AI: $17B (2025) → $49.8B (2031)

### LIVE DEMAND (Reddit — Right Now)
- 3 people already responded to Reddit post wanting voice call agent
- This is REAL validated demand — not hypothetical

### Who Needs It (India)
- Doctors/Clinics: Appointment booking 24/7, no receptionist needed
- Restaurants: Table booking, menu queries
- Coaching Centers: Fee inquiry, schedule info, admission queries
- Real Estate: Property inquiry, site visit booking
- E-commerce: Order status, returns
- Banks/NBFCs: Basic FAQ, account info

### How It Works
```
Customer calls → AI picks up → Understands Hindi/English
→ Books appointment / answers query / escalates to human
→ Owner gets WhatsApp summary
```

### Tech Stack (What to Build With)
- Twilio / Vapi / Bland.ai — call handling
- Whisper (OpenAI) — speech to text
- GPT-4o / Claude — understanding + response
- ElevenLabs / Google TTS — voice output
- Qora — memory/knowledge base (tera own product!)
- WhatsApp API — summary to owner

### Pricing Model
- Per minute: ₹2-5/minute (Twilio charges ~$0.01/min = ₹0.83/min)
- Monthly subscription: ₹2,000-5,000/month per business
- Setup fee: ₹5,000 one-time

### Revenue Potential
- 10 clients × ₹3,000/month = ₹30,000/month
- 30 clients × ₹3,000/month = ₹90,000/month
- 100 clients × ₹3,000/month = ₹3,00,000/month

### Competitors
| Product | Where | Problem |
|---|---|---|
| Bland.ai | US | English only, expensive |
| Vapi | US | English only, no India support |
| Retell AI | US | English only |
| Koi Indian player | India | NONE serious |

### India Advantage
- Hindi + English bilingual = no competitor
- Local pricing = affordable for small businesses
- WhatsApp integration = Indian businesses love it
- Direct sales = no marketing needed (go to clinic, demo, close)

### How to Sell (No Marketing Needed)
1. Build MVP in 1 week
2. Go to 5 local clinics/restaurants physically
3. Demo: "Sir, aapke number pe call karta hoon, AI answer dega"
4. Close: ₹2,000/month, no setup fee first month
5. 3 clients = break-even

### Connection to Qora
Voice agent needs memory → Qora provides it
= tera own product ka first real use case
= proof of concept for investors

### Verdict
✅ VALIDATED DEMAND (3 Reddit responses)
✅ No Indian competitor
✅ Fast revenue (direct sales, 1 week build)
✅ Feeds into Qora ecosystem
✅ Hindi support = moat

---

## PRIORITY ORDER

| # | Product | Time to Money | Effort | Do When |
|---|---|---|---|---|
| 1 | Voice Call Agent | 1-2 weeks | 1 week build | NOW |
| 2 | Qora Live | 1 day (deploy) | Already built | This week |
| 3 | Overlay AI | 1-2 months | 20% pending | After voice agent |

---

## STRATEGY

**Week 1:** Voice call agent MVP — Hindi + English, appointment booking
**Week 2:** Close 3 clients locally (clinic/restaurant/coaching)
**Week 3:** Qora live on Oracle + connect voice agent to Qora memory
**Week 4:** Overlay AI finish + Play Store

Voice agent revenue → fund Qora marketing + Oracle costs → build portfolio
