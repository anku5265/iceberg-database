"""
Email service using Resend.
Free tier: 3000 emails/month, no card needed.
Sign up at resend.com → get API key → add RESEND_API_KEY to Railway env vars.
"""
import resend
from core.config import settings

def _configured() -> bool:
    return bool(settings.resend_api_key)

def _init():
    if _configured():
        resend.api_key = settings.resend_api_key

def send_welcome_email(email: str, api_key: str) -> bool:
    """Send welcome email after signup."""
    if not _configured():
        print(f"[email] Resend not configured — skipping welcome email to {email}")
        return False

    _init()
    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": email,
            "subject": "Welcome to Iceberg — your API key is inside",
            "html": f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Inter',Arial,sans-serif;color:#f2f2f2;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">

    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#7c3aed);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-weight:900;font-size:13px;">IB</span>
        </div>
        <span style="font-size:18px;font-weight:700;color:#f2f2f2;">Iceberg</span>
      </div>
    </div>

    <!-- Heading -->
    <h1 style="font-size:24px;font-weight:800;margin:0 0 8px;color:#f2f2f2;">Welcome to Iceberg 🎉</h1>
    <p style="color:#888;font-size:15px;margin:0 0 32px;line-height:1.6;">
      India's vector database is ready for you. Here's everything you need to get started.
    </p>

    <!-- API Key box -->
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#666;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Your API Key</p>
      <code style="color:#60a5fa;font-size:14px;font-family:monospace;word-break:break-all;">{api_key}</code>
      <p style="color:#555;font-size:12px;margin:8px 0 0;">Save this — it won't be shown again.</p>
    </div>

    <!-- Quick start -->
    <div style="background:#0d1117;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#666;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Quick Start</p>
      <pre style="color:#a6accd;font-size:13px;font-family:monospace;margin:0;line-height:1.7;overflow-x:auto;"><span style="color:#c792ea;">from</span> iceberg <span style="color:#c792ea;">import</span> Client

client = Client(api_key=<span style="color:#c3e88d;">"{api_key[:20]}..."</span>)
client.create_collection(<span style="color:#c3e88d;">"my_docs"</span>)
client.index_text(<span style="color:#c3e88d;">"my_docs"</span>, <span style="color:#c3e88d;">"Hello India!"</span>)
results = client.search(<span style="color:#c3e88d;">"my_docs"</span>, <span style="color:#c3e88d;">"query"</span>)</pre>
    </div>

    <!-- CTA buttons -->
    <div style="display:flex;gap:12px;margin-bottom:32px;">
      <a href="https://dashboard.icebergdb.io" style="background:#2563eb;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Open Dashboard</a>
      <a href="https://dashboard.icebergdb.io/docs" style="background:#111;color:#888;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;border:1px solid #222;">Read Docs</a>
    </div>

    <!-- What's included -->
    <div style="border-top:1px solid #1a1a1a;padding-top:24px;margin-bottom:32px;">
      <p style="color:#666;font-size:13px;margin:0 0 12px;font-weight:600;">Free tier includes:</p>
      <ul style="color:#888;font-size:13px;margin:0;padding-left:20px;line-height:2;">
        <li>500K vectors — forever</li>
        <li>Unlimited collections</li>
        <li>Hybrid search (semantic + keyword)</li>
        <li>Agent memory API</li>
        <li>Never pauses</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1a1a1a;padding-top:20px;">
      <p style="color:#444;font-size:12px;margin:0;">
        Questions? Reply to this email or reach us at
        <a href="mailto:hello@icebergdb.io" style="color:#3b82f6;">hello@icebergdb.io</a>
      </p>
      <p style="color:#333;font-size:11px;margin:8px 0 0;">© 2026 Iceberg — India's vector database</p>
    </div>

  </div>
</body>
</html>
""",
        })
        print(f"[email] Welcome email sent to {email}")
        return True
    except Exception as e:
        print(f"[email] Failed to send welcome email: {e}")
        return False
