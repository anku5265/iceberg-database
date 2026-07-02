# Qora Voice Agent

Hindi + English AI receptionist for Indian businesses.
Appointment booking, FAQ handling, WhatsApp summary to owner.

## Free Stack
- Groq (LLM) — Free tier
- Vapi (calls) — $10 free credit (~60 min)
- Deepgram (STT) — Free tier
- ElevenLabs (TTS) — Free tier
- FastAPI — Free

## Setup (5 minutes)

### 1. Get Free API Keys
- Groq: https://console.groq.com (free)
- Vapi: https://vapi.ai (free $10 credit)
- WhatsApp: https://developers.facebook.com (free)

### 2. Install
```bash
pip install -r requirements.txt
cp .env.example .env
# Fill in your API keys in .env
```

### 3. Run
```bash
uvicorn main:app --port 8001 --reload
```

### 4. Test (no phone needed)
```bash
python test_agent.py
```

### 5. Public URL (for Vapi webhook)
```bash
# Install ngrok (free)
ngrok http 8001
# Copy the https URL → set as SERVER_URL in .env
```

### 6. Create agent for a client
```bash
curl -X POST http://localhost:8001/agent/create \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Dr. Sharma Clinic",
    "business_type": "medical clinic",
    "business_info": "Open Mon-Sat 9am-6pm. Dr. Sharma available. Fee: Rs 300",
    "owner_whatsapp": "919876543210",
    "language": "hi-IN"
  }'
```

## Pricing for Clients
- Setup: ₹5,000 one-time
- Monthly: ₹2,000-5,000/month
- 10 clients = ₹20,000-50,000/month

## Supported Business Types
- Medical clinics (appointment booking)
- Restaurants (table booking)
- Coaching centers (admission/fee queries)
- Real estate (property inquiry)
- Any business with repetitive calls
