"""
No-code RAG Assistant — Upload docs, get a chatbot instantly.
Better than Pinecone Assistant:
  - WhatsApp channel support
  - Website embed widget
  - Custom branding
  - Any LLM (OpenAI, Gemini, future: Qora's own model)
  - India hosted
"""
import uuid
import time
import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional
from core.auth import verify_api_key
from core.database import get_conn
from core.config import settings
from services.embeddings import embed, embed_query, chunk_text
from services import qdrant as qdrant_svc

router = APIRouter(prefix="/assistant", tags=["Assistant"])

# ── Assistant CRUD ────────────────────────────────────────────────────────────

class AssistantCreate(BaseModel):
    name: str
    description: str = ""
    greeting: str = "Hi! How can I help you?"
    llm_provider: str = "openai"   # openai, gemini, custom
    llm_api_key: str = ""
    llm_model: str = "gpt-3.5-turbo"
    color: str = "#2563eb"

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

def _get_asst_collection(asst_id: str) -> str:
    return f"_asst_{asst_id}"

@router.post("")
async def create_assistant(body: AssistantCreate, user_id: str = Depends(verify_api_key)):
    asst_id = str(uuid.uuid4())[:8]
    col = _get_asst_collection(asst_id)
    qdrant_svc.create_collection(col)

    conn = get_conn()
    conn.execute(
        "INSERT INTO assistants (id, user_id, name, description, greeting, llm_provider, llm_model, llm_api_key, color, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (asst_id, user_id, body.name, body.description, body.greeting, body.llm_provider, body.llm_model, body.llm_api_key, body.color, int(time.time()))
    )
    conn.commit()
    conn.close()

    return {
        "id": asst_id,
        "name": body.name,
        "chat_url": f"http://localhost:8000/assistant/{asst_id}/chat",
        "embed_code": f'<script src="http://localhost:8000/assistant/{asst_id}/widget.js"></script>',
        "whatsapp_webhook": f"http://localhost:8000/assistant/{asst_id}/whatsapp",
        "message": "Assistant created. Upload documents to train it."
    }

@router.get("")
async def list_assistants(user_id: str = Depends(verify_api_key)):
    conn = get_conn()
    rows = conn.execute("SELECT id, name, description, created_at FROM assistants WHERE user_id=?", (user_id,)).fetchall()
    conn.close()
    return {"assistants": [dict(r) for r in rows]}

@router.delete("/{asst_id}")
async def delete_assistant(asst_id: str, user_id: str = Depends(verify_api_key)):
    conn = get_conn()
    conn.execute("DELETE FROM assistants WHERE id=? AND user_id=?", (asst_id, user_id))
    conn.commit()
    conn.close()
    qdrant_svc.delete_collection(_get_asst_collection(asst_id))
    return {"deleted": True}

# ── Upload docs to assistant ──────────────────────────────────────────────────

@router.post("/{asst_id}/upload")
async def upload_to_assistant(
    asst_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(verify_api_key)
):
    """Upload a document to train the assistant."""
    import io
    content = await file.read()
    text = ""

    if file.filename.endswith(".pdf"):
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join(p.extract_text() or "" for p in reader.pages)
    else:
        text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(400, "No text extracted")

    col = _get_asst_collection(asst_id)
    chunks = chunk_text(text)
    vectors = embed(chunks)
    metadata = [{"source": file.filename, "chunk_index": i} for i in range(len(chunks))]
    count = qdrant_svc.upsert_vectors(col, chunks, vectors, metadata)

    return {"indexed": count, "filename": file.filename}

# ── Chat endpoint ─────────────────────────────────────────────────────────────

@router.post("/{asst_id}/chat")
async def chat(asst_id: str, body: ChatRequest):
    """Chat with the assistant — no auth needed (public endpoint)."""
    conn = get_conn()
    asst = conn.execute("SELECT * FROM assistants WHERE id=?", (asst_id,)).fetchone()
    conn.close()

    if not asst:
        raise HTTPException(404, "Assistant not found")

    asst = dict(asst)
    col = _get_asst_collection(asst_id)

    # Search relevant docs
    qvec = embed_query(body.message)
    results = qdrant_svc.search_vectors(col, qvec, top_k=4, score_threshold=0.3)
    context = "\n\n".join([r["text"] for r in results])

    if not context:
        return {
            "reply": "I don't have enough information to answer that. Please ask something related to the uploaded documents.",
            "sources": []
        }

    # Call LLM — pluggable (future: replace with Qora's own model)
    reply = await _call_llm(
        provider=asst["llm_provider"],
        api_key=asst["llm_api_key"],
        model=asst["llm_model"],
        context=context,
        question=body.message,
        greeting=asst["greeting"],
    )

    return {
        "reply": reply,
        "sources": [r["metadata"].get("source", "") for r in results],
        "session_id": body.session_id or str(uuid.uuid4()),
    }

async def _call_llm(provider: str, api_key: str, model: str, context: str, question: str, greeting: str) -> str:
    """
    Pluggable LLM caller.
    Future: when Qora has own AI model, add provider='qora' here.
    """
    system_prompt = f"""You are a helpful assistant. Answer questions based on the provided context only.
If the answer is not in the context, say you don't know.
Context:
{context[:3000]}"""

    if provider == "openai" and api_key:
        try:
            r = httpx.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"model": model, "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ]},
                timeout=30,
            )
            return r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            pass

    if provider == "gemini" and api_key:
        try:
            r = httpx.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}",
                json={"contents": [{"parts": [{"text": f"{system_prompt}\n\nQuestion: {question}"}]}]},
                timeout=30,
            )
            return r.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass

    # Fallback — no LLM configured, return context snippet
    return f"Based on the documents: {context[:500]}..."

# ── WhatsApp webhook ──────────────────────────────────────────────────────────

@router.post("/{asst_id}/whatsapp")
async def whatsapp_webhook(asst_id: str, request: dict):
    """
    WhatsApp Business API webhook.
    User sends WhatsApp message → bot answers from documents.
    Setup: point your WhatsApp Business webhook to this URL.
    """
    try:
        message_text = request.get("entry", [{}])[0].get("changes", [{}])[0].get("value", {}).get("messages", [{}])[0].get("text", {}).get("body", "")
        phone = request.get("entry", [{}])[0].get("changes", [{}])[0].get("value", {}).get("messages", [{}])[0].get("from", "")

        if not message_text:
            return {"status": "no_message"}

        # Get answer from assistant
        chat_resp = await chat(asst_id, ChatRequest(message=message_text, session_id=phone))
        reply_text = chat_resp["reply"]

        # Send reply via WhatsApp Business API
        conn = get_conn()
        asst = dict(conn.execute("SELECT * FROM assistants WHERE id=?", (asst_id,)).fetchone() or {})
        conn.close()

        wa_token = asst.get("whatsapp_token", "")
        wa_phone_id = asst.get("whatsapp_phone_id", "")

        if wa_token and wa_phone_id:
            httpx.post(
                f"https://graph.facebook.com/v18.0/{wa_phone_id}/messages",
                headers={"Authorization": f"Bearer {wa_token}"},
                json={"messaging_product": "whatsapp", "to": phone, "type": "text", "text": {"body": reply_text}},
                timeout=10,
            )

        return {"status": "replied", "to": phone, "reply": reply_text}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@router.get("/{asst_id}/whatsapp")
async def whatsapp_verify(asst_id: str, hub_mode: str = "", hub_verify_token: str = "", hub_challenge: str = ""):
    """WhatsApp webhook verification."""
    if hub_mode == "subscribe" and hub_verify_token == asst_id:
        return int(hub_challenge)
    raise HTTPException(403, "Verification failed")

# ── Embed widget ──────────────────────────────────────────────────────────────

@router.get("/{asst_id}/widget.js")
async def widget_js(asst_id: str):
    """JavaScript embed widget — paste one line in any website."""
    conn = get_conn()
    asst = conn.execute("SELECT name, greeting, color FROM assistants WHERE id=?", (asst_id,)).fetchone()
    conn.close()

    if not asst:
        return HTMLResponse("// Assistant not found", media_type="application/javascript")

    asst = dict(asst)
    js = f"""
(function() {{
  var color = "{asst['color']}";
  var name = "{asst['name']}";
  var greeting = "{asst['greeting']}";
  var apiUrl = "http://localhost:8000/assistant/{asst_id}/chat";

  // Create chat button
  var btn = document.createElement('div');
  btn.id = 'qora-chat-btn';
  btn.innerHTML = '<svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>';
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:56px;height:56px;background:' + color + ';border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;';
  document.body.appendChild(btn);

  // Create chat window
  var win = document.createElement('div');
  win.id = 'qora-chat-win';
  win.style.cssText = 'display:none;position:fixed;bottom:90px;right:20px;width:360px;height:480px;background:#111;border:1px solid #222;border-radius:16px;flex-direction:column;z-index:9999;overflow:hidden;';
  win.innerHTML = '<div style="background:' + color + ';padding:16px;color:white;font-family:sans-serif;"><strong>' + name + '</strong></div>' +
    '<div id="qora-msgs" style="flex:1;overflow-y:auto;padding:16px;font-family:sans-serif;font-size:14px;color:#ccc;height:350px;"></div>' +
    '<div style="padding:12px;border-top:1px solid #222;display:flex;gap:8px;">' +
    '<input id="qora-input" placeholder="Ask a question..." style="flex:1;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:8px 12px;color:white;font-size:14px;outline:none;" />' +
    '<button id="qora-send" style="background:' + color + ';color:white;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:14px;">Send</button></div>';
  document.body.appendChild(win);

  // Add greeting
  var msgs = document.getElementById('qora-msgs');
  msgs.innerHTML = '<div style="background:#1a1a1a;border-radius:8px;padding:10px;margin-bottom:8px;">' + greeting + '</div>';

  // Toggle
  btn.onclick = function() {{ win.style.display = win.style.display === 'none' ? 'flex' : 'none'; win.style.flexDirection = 'column'; }};

  // Send message
  function send() {{
    var input = document.getElementById('qora-input');
    var msg = input.value.trim();
    if (!msg) return;
    msgs.innerHTML += '<div style="text-align:right;margin-bottom:8px;"><span style="background:{color};color:white;border-radius:8px;padding:8px 12px;display:inline-block;">' + msg + '</span></div>';
    input.value = '';
    fetch(apiUrl, {{method:'POST',headers:{{'Content-Type':'application/json'}},body:JSON.stringify({{message:msg}})}})
      .then(r=>r.json()).then(d=>{{
        msgs.innerHTML += '<div style="background:#1a1a1a;border-radius:8px;padding:10px;margin-bottom:8px;">' + d.reply + '</div>';
        msgs.scrollTop = msgs.scrollHeight;
      }});
  }}
  document.getElementById('qora-send').onclick = send;
  document.getElementById('qora-input').onkeydown = function(e) {{ if(e.key==='Enter') send(); }};
}})();
"""
    return HTMLResponse(js, media_type="application/javascript")
