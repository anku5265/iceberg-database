"""
Qora Voice Agent — Hindi + English AI Call Agent
Free stack: Vapi + Groq + Deepgram + ElevenLabs
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
import json
import re
from dotenv import load_dotenv
from database import (
    init_db, create_client, get_client, list_clients,
    update_vapi_id, save_appointment, get_appointments,
    save_call_log, get_call_logs
)

load_dotenv()

app = FastAPI(title="Qora Voice Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.on_event("startup")
async def startup():
    init_db()
    print("Qora Voice Agent ready")


# ── System Prompt ─────────────────────────────────────────────────────────────

def get_system_prompt(business_name: str, business_type: str, business_info: str) -> str:
    return f"""You are a professional AI receptionist for {business_name}, a {business_type}.

BUSINESS INFORMATION:
{business_info}

LANGUAGE RULES:
- If customer speaks Hindi → respond in Hindi (Devanagari script)
- If customer speaks English → respond in English
- If customer mixes Hindi/English (Hinglish) → match their style naturally
- Always be warm, professional, and helpful

YOUR TASKS:
1. Greet caller warmly on first message
2. Understand their need (appointment, information, complaint, query)
3. For appointments: collect name, preferred date/time, reason
4. For queries: answer from business info provided
5. For things you don't know: say you'll have someone call back and take their number
6. End call warmly

APPOINTMENT BOOKING FLOW:
- Ask caller's name
- Ask preferred date and time
- Ask reason/purpose of visit
- Confirm all details back
- Say: "Aapka appointment book ho gaya hai. Aapko WhatsApp pe confirmation milega."

RESPONSE RULES:
- Keep responses SHORT — max 2-3 sentences (phone call, not chat)
- Sound natural and warm, not robotic
- Never say you are an AI unless directly asked
- If asked if AI → say "Main {business_name} ka digital assistant hoon"

WHEN APPOINTMENT IS BOOKED, include this JSON in your response (hidden from user):
[APPOINTMENT: {{"name": "...", "date": "...", "time": "...", "reason": "..."}}]
"""


# ── Groq LLM ──────────────────────────────────────────────────────────────────

async def get_ai_response(messages: list, system_prompt: str) -> str:
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            *messages
        ],
        "max_tokens": 200,
        "temperature": 0.7,
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(GROQ_URL, json=payload, headers=headers)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]


def extract_appointment(text: str) -> dict | None:
    """Extract appointment JSON if present in AI response."""
    match = re.search(r'\[APPOINTMENT:\s*({.*?})\]', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except:
            return None
    return None

def clean_response(text: str) -> str:
    """Remove hidden JSON from spoken response."""
    return re.sub(r'\[APPOINTMENT:.*?\]', '', text, flags=re.DOTALL).strip()


# ── Vapi Webhook ──────────────────────────────────────────────────────────────

@app.post("/vapi/webhook")
async def vapi_webhook(request: Request):
    try:
        body = await request.json()
        msg_type = body.get("message", {}).get("type", "")

        # Every conversation turn
        if msg_type == "assistant-request":
            call = body.get("message", {}).get("call", {})
            metadata = call.get("metadata", {})
            client_id = metadata.get("client_id", "")

            # Get business info
            client = get_client(client_id) if client_id else None
            if client:
                business_name = client["business_name"]
                business_type = client["business_type"]
                business_info = client["business_info"]
            else:
                business_name = metadata.get("business_name", "Our Business")
                business_type = metadata.get("business_type", "business")
                business_info = metadata.get("business_info", "We provide quality services.")

            system_prompt = get_system_prompt(business_name, business_type, business_info)

            # Get conversation history
            messages = body.get("message", {}).get("artifact", {}).get("messages", [])
            formatted = [
                {"role": m.get("role", "user"), "content": m.get("message", m.get("content", ""))}
                for m in messages
                if m.get("role") in ["user", "assistant"] and m.get("message", m.get("content"))
            ]

            # Get AI response
            raw_response = await get_ai_response(formatted, system_prompt)

            # Extract appointment if booked
            appt_data = extract_appointment(raw_response)
            if appt_data and client_id:
                call_id = call.get("id", "")
                caller_number = call.get("customer", {}).get("number", "")
                save_appointment(
                    client_id, call_id,
                    appt_data.get("name", ""),
                    caller_number,
                    appt_data.get("date", ""),
                    appt_data.get("time", ""),
                    appt_data.get("reason", "")
                )

            spoken_response = clean_response(raw_response)

            return JSONResponse({"assistant": {"firstMessage": spoken_response}})

        # Call ended
        elif msg_type == "end-of-call-report":
            call_data = body.get("message", {})
            artifact = call_data.get("artifact", {})
            call = call_data.get("call", {})
            metadata = call.get("metadata", {})
            client_id = metadata.get("client_id", "")
            owner_whatsapp = metadata.get("owner_whatsapp", "")
            transcript = artifact.get("transcript", "")
            duration = call_data.get("durationSeconds", 0)
            call_id = call.get("id", "")
            caller_number = call.get("customer", {}).get("number", "")

            summary = ""
            if transcript:
                summary = await summarize_call(transcript)
                if client_id:
                    appts = get_appointments(client_id)
                    appointment_booked = any(a["call_id"] == call_id for a in appts)
                    save_call_log(client_id, call_id, caller_number, duration, transcript, summary, appointment_booked)

            if owner_whatsapp and summary:
                await send_whatsapp_summary(owner_whatsapp, summary, call_id)

            return JSONResponse({"status": "ok"})

        return JSONResponse({"status": "ok"})

    except Exception as e:
        print(f"Webhook error: {e}")
        return JSONResponse({"status": "error"}, status_code=200)


# ── Client Management ─────────────────────────────────────────────────────────

@app.post("/client/create")
async def api_create_client(request: Request):
    """Register a new business client."""
    body = await request.json()
    client_id = create_client(
        business_name=body.get("business_name", ""),
        business_type=body.get("business_type", ""),
        business_info=body.get("business_info", ""),
        owner_whatsapp=body.get("owner_whatsapp", ""),
        owner_phone=body.get("owner_phone", ""),
        language=body.get("language", "hi-IN")
    )
    return {"client_id": client_id, "status": "created"}

@app.get("/client/list")
async def api_list_clients():
    return {"clients": list_clients()}

@app.get("/client/{client_id}")
async def api_get_client(client_id: str):
    client = get_client(client_id)
    if not client:
        raise HTTPException(404, "Client not found")
    return client

@app.get("/client/{client_id}/appointments")
async def api_get_appointments(client_id: str):
    return {"appointments": get_appointments(client_id)}

@app.get("/client/{client_id}/calls")
async def api_get_calls(client_id: str):
    return {"calls": get_call_logs(client_id)}


# ── Vapi Assistant Creator ────────────────────────────────────────────────────

@app.post("/agent/create")
async def create_agent(request: Request):
    """Create a Vapi assistant for a client."""
    body = await request.json()
    client_id = body.get("client_id", "")
    
    client = get_client(client_id) if client_id else None
    if not client:
        # Create new client on the fly
        client_id = create_client(
            business_name=body.get("business_name", ""),
            business_type=body.get("business_type", ""),
            business_info=body.get("business_info", ""),
            owner_whatsapp=body.get("owner_whatsapp", ""),
            language=body.get("language", "hi-IN")
        )
        client = get_client(client_id)

    vapi_key = os.getenv("VAPI_API_KEY", "")
    if not vapi_key:
        raise HTTPException(400, "VAPI_API_KEY not set in .env")

    server_url = os.getenv("SERVER_URL", "http://localhost:8001")

    assistant_config = {
        "name": f"{client['business_name']} Receptionist",
        "model": {
            "provider": "custom-llm",
            "url": f"{server_url}/vapi/webhook",
            "model": "llama-3.3-70b-versatile",
        },
        "voice": {
            "provider": "11labs",
            "voiceId": "pNInz6obpgDQGcFmaJgB",
        },
        "transcriber": {
            "provider": "deepgram",
            "model": "nova-2",
            "language": "hi",
            "keywords": ["appointment", "booking", "नमस्ते", "धन्यवाद", "appointment"]
        },
        "firstMessage": f"नमस्ते! {client['business_name']} में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?",
        "metadata": {
            "client_id": client_id,
            "owner_whatsapp": client.get("owner_whatsapp", "")
        },
        "endCallMessage": "धन्यवाद! Have a great day!",
        "silenceTimeoutSeconds": 30,
        "maxDurationSeconds": 600,
    }

    async with httpx.AsyncClient() as c:
        r = await c.post(
            "https://api.vapi.ai/assistant",
            json=assistant_config,
            headers={"Authorization": f"Bearer {vapi_key}"}
        )
        if r.status_code not in [200, 201]:
            raise HTTPException(400, f"Vapi error: {r.text}")

        assistant = r.json()
        update_vapi_id(client_id, assistant["id"])

        return {
            "client_id": client_id,
            "assistant_id": assistant["id"],
            "business_name": client["business_name"],
            "status": "ready",
            "next_step": "Go to vapi.ai dashboard → Phone Numbers → Assign this assistant_id to a number"
        }


# ── WhatsApp Summary ──────────────────────────────────────────────────────────

async def summarize_call(transcript: str) -> str:
    prompt = f"""Summarize this call in 3-4 lines.
Include: what caller wanted, any appointment booked, follow-up needed.
Use same language as the conversation (Hindi/English).

Transcript:
{transcript[:2000]}"""

    return await get_ai_response(
        [{"role": "user", "content": prompt}],
        "You are a call summarizer. Be brief and clear."
    )


async def send_whatsapp_summary(owner_number: str, summary: str, call_id: str):
    token = os.getenv("WHATSAPP_TOKEN", "")
    phone_id = os.getenv("WHATSAPP_PHONE_ID", "")

    if not token or not phone_id:
        print(f"[WhatsApp not configured] Summary:\n{summary}")
        return

    msg = f"📞 *New Call — Qora Agent*\n\n{summary}\n\nCall ID: {call_id}"

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://graph.facebook.com/v18.0/{phone_id}/messages",
                json={
                    "messaging_product": "whatsapp",
                    "to": owner_number,
                    "type": "text",
                    "text": {"body": msg}
                },
                headers={"Authorization": f"Bearer {token}"}
            )
    except Exception as e:
        print(f"WhatsApp error: {e}")


# ── Health + Test ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "groq": bool(GROQ_API_KEY),
        "vapi": bool(os.getenv("VAPI_API_KEY")),
        "whatsapp": bool(os.getenv("WHATSAPP_TOKEN"))
    }


@app.post("/test/chat")
async def test_chat(request: Request):
    """Test agent without a real phone call."""
    body = await request.json()
    client_id = body.get("client_id", "")
    client = get_client(client_id) if client_id else None

    if client:
        business_name = client["business_name"]
        business_type = client["business_type"]
        business_info = client["business_info"]
    else:
        business_name = body.get("business_name", "Demo Clinic")
        business_type = body.get("business_type", "clinic")
        business_info = body.get("business_info", "Open Mon-Sat 9am-6pm.")

    system_prompt = get_system_prompt(business_name, business_type, business_info)
    message = body.get("message", "Hello")
    history = body.get("history", [])
    
    messages = history + [{"role": "user", "content": message}]
    raw = await get_ai_response(messages, system_prompt)
    spoken = clean_response(raw)
    appt = extract_appointment(raw)

    return {
        "response": spoken,
        "appointment_detected": appt
    }
