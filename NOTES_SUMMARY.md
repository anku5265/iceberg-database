# Iceberg — Complete Session Notes
## Saari important baatein ek jagah

---

## Startups Jo Build Kar Rahe Hain

### 1. Iceberg Vector DB
- India-first Vector DB as a Service
- Qdrant engine use karenge (open source)
- Python + FastAPI backend
- React dashboard
- Hindi/Indic language embedding support
- India hosting (DPDP compliance)
- Pricing: ₹999/month se start (vs Pinecone $70/month)
- Target: Indian AI startups jo RAG chatbot bana rahe hain
- Break-even: 3-4 paying customers

### 2. Overlay AI App (Iceberg AI)
- Flutter mein already 80% code ready hai (`overlay-ai/ai_companion/`)
- Transparent floating overlay on Android
- Groq API (free) + Gemini API (video analysis)
- Chat history Hive mein save hoti hai
- Hindi/Hinglish support
- Play Store launch plan

### 3. Tankri/Pahari Language Project
- Script digitization
- AI model for Mandeali/Pahari language
- Keyboard, dictionary, learning app
- Google proposal ready

---

## Market Research — Key Numbers

### India Tech
- VC funding 2025: $16B
- AI funding India: 58% jump — $1.22B
- Early stage funding: $4.8B (33% increase)
- India 4th highest funded globally

### Vector DB Market
- 2026: $3.73B
- 2030: $8.95B (27.5% CAGR)
- 68% enterprise AI apps use vector DB
- 67% Indian enterprise GenAI = RAG (NASSCOM 2025)
- Pinecone exploring sale — customer churn high

### Overlay AI Market
- Personal AI Assistant: $3.4B → $19.6B by 2030
- India AI downloads: 602M in 2025 (3x jump)
- Equal AI (India): 1M+ users, $42M raised
- Cluely (US): $20.3M raised, screen overlay

### India Cloud
- 2026: $26.43B
- 2031: $68.82B
- DPDP Act = data must stay in India

---

## Competitors

### Vector DB
| Player | Language | Status |
|---|---|---|
| Pinecone | Go/C++ | $750M valuation, exploring sale |
| Qdrant | Rust | $87M+ funded, open source |
| Weaviate | Go | Series B funded |
| Chroma | Python | Prototype only |
| Milvus | C++/Go | Enterprise, complex |
| pgvector | C | Free, no UI |

### Overlay AI
| Player | Status |
|---|---|
| Gemini (Google) | OS-level, premium phones only |
| Cluely | $20.3M raised, interview cheating pivot |
| Rewind/Limitless | Meta acquired Dec 2025 |
| Screenpipe | Open source, no Android |
| Equal AI | India, $42M, call screening only |

---

## Tech Stack Decisions

### Iceberg Vector DB
- Backend: Python + FastAPI
- Vector Engine: Qdrant (open source, Rust)
- Embedding: multilingual-e5-large (Hindi support)
- Database: PostgreSQL
- Frontend: React + Tailwind
- Payments: Razorpay
- Hosting: Hetzner (₹3,500-5,000/month)

### Overlay AI App
- Flutter (cross-platform)
- Groq API: llama-3.3-70b (chat)
- Gemini API: vision/video analysis
- Hive: local storage
- Android Accessibility Service: screen reading

---

## Build Plan

### Vector DB — 8 Weeks
- Week 1-2: FastAPI + Qdrant backend
- Week 3-4: Dashboard + SDK
- Week 5-6: Hindi embeddings + Razorpay
- Week 7-8: Launch + 10 beta users

### Overlay AI — Already in progress
- Code: `overlay-ai/ai_companion/`
- Status: Flutter installed, dependencies done
- Pending: Android licenses + phone connection

---

## Pinecone History (Why Wrapper is Smart)
- 2019: Started using FAISS (Facebook open source)
- After $10M: Hired ML engineers
- After $100M: Built proprietary architecture
- Lesson: Start with existing tools, build custom later

---

## Personal Context
- Age: 20, Himachal Pradesh (Kullu area)
- Already founder of one startup (naam banana goal)
- ADHD — focus ek cheez pe rakhna challenge
- Goal: Naam banana, future mein billion dollar company
- Strength: Can build with AI assistance

---

## Next Steps
1. Kal ground test (HP Homeguard bharti)
2. Vector DB ya Overlay — ek final pick
3. Agar Vector DB: FastAPI server banana shuru
4. Agar Overlay: Flutter Android license fix + phone connect
