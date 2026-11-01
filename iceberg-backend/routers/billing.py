import os
import time
import uuid
import hmac
import hashlib
import requests
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from core.database import get_conn
from core.auth import verify_api_key

router = APIRouter(prefix="/billing", tags=["Billing"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_live_TpLwzfroLO9bKZ")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "1sWEnZzOl4B3LMtpEExm54Jo")

PRICING_PLANS = {
    "starter": {
        "name": "Starter",
        "amount_inr": 799,
        "amount_paise": 79900,
        "vectors": "1,000,000",
        "queries_per_day": 20000,
        "features": ["1M vectors", "20K queries/day", "5 GB storage", "Never pauses", "Email support"]
    },
    "growth": {
        "name": "Growth",
        "amount_inr": 3499,
        "amount_paise": 349900,
        "vectors": "5,000,000",
        "queries_per_day": 100000,
        "features": ["5M vectors", "100K queries/day", "25 GB storage", "Metadata filters & Hybrid search", "Priority support"]
    },
    "scale": {
        "name": "Scale",
        "amount_inr": 9999,
        "amount_paise": 999900,
        "vectors": "20,000,000",
        "queries_per_day": 500000,
        "features": ["20M vectors", "500K queries/day", "100 GB storage", "Unlimited projects", "Dedicated Slack & WhatsApp", "99.9% SLA"]
    }
}

class CreateOrderRequest(BaseModel):
    plan: str
    billing_type: Optional[str] = "one_time"  # "one_time" or "subscription"

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: str
    billing_type: Optional[str] = "one_time"

@router.get("/config")
def get_billing_config():
    """Public billing config for client checkout."""
    return {
        "key_id": RAZORPAY_KEY_ID,
        "currency": "INR",
        "plans": PRICING_PLANS
    }

@router.get("/status")
def get_user_billing_status(user_id: str = Depends(verify_api_key)):
    """Returns current user's plan and payment history."""
    conn = get_conn()
    user = conn.execute("SELECT id, email, plan FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    payments = conn.execute(
        "SELECT id, plan, amount, currency, payment_id, order_id, status, billing_type, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
        (user_id,)
    ).fetchall()
    conn.close()

    return {
        "plan": user["plan"] or "free",
        "email": user["email"],
        "payments": [dict(p) for p in payments]
    }

@router.post("/create-order")
def create_razorpay_order(body: CreateOrderRequest, user_id: str = Depends(verify_api_key)):
    """Creates a verified order with Razorpay."""
    plan_key = body.plan.lower()
    if plan_key not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {body.plan}. Available: {list(PRICING_PLANS.keys())}")

    plan_info = PRICING_PLANS[plan_key]
    receipt_id = f"rcpt_{user_id[:8]}_{int(time.time())}"

    # Call Razorpay API to create official order
    url = "https://api.razorpay.com/v1/orders"
    payload = {
        "amount": plan_info["amount_paise"],
        "currency": "INR",
        "receipt": receipt_id,
        "notes": {
            "user_id": user_id,
            "plan": plan_key,
            "billing_type": body.billing_type
        }
    }

    try:
        resp = requests.post(url, auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET), json=payload, timeout=15)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=500, detail=f"Razorpay order failed: {resp.text}")
        
        data = resp.json()
        return {
            "order_id": data["id"],
            "amount": data["amount"],
            "currency": data["currency"],
            "key_id": RAZORPAY_KEY_ID,
            "plan_name": plan_info["name"],
            "billing_type": body.billing_type,
            "receipt": receipt_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

@router.post("/verify-payment")
def verify_payment(body: VerifyPaymentRequest, user_id: str = Depends(verify_api_key)):
    """Verifies HMAC signature and upgrades user plan instantly."""
    plan_key = body.plan.lower()
    if plan_key not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {body.plan}")

    # Verify Razorpay signature
    data_to_sign = f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode("utf-8")
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        data_to_sign,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, body.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature. Verification failed.")

    plan_info = PRICING_PLANS[plan_key]

    # Update database
    conn = get_conn()
    conn.execute("UPDATE users SET plan = ? WHERE id = ?", (plan_key, user_id))
    payment_id_uuid = str(uuid.uuid4())
    conn.execute(
        """
        INSERT INTO payments (id, user_id, plan, amount, currency, payment_id, order_id, status, billing_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payment_id_uuid,
            user_id,
            plan_key,
            plan_info["amount_inr"],
            "INR",
            body.razorpay_payment_id,
            body.razorpay_order_id,
            "success",
            body.billing_type or "one_time",
            int(time.time())
        )
    )
    conn.commit()
    conn.close()

    return {
        "success": True,
        "plan": plan_key,
        "message": f"Payment verified! Upgraded to {plan_info['name']} plan.",
        "vectors_unlocked": plan_info["vectors"],
        "payment_id": body.razorpay_payment_id
    }

@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Handles automated background webhook events from Razorpay."""
    try:
        body_bytes = await request.body()
        signature = request.headers.get("X-Razorpay-Signature", "")

        # Verify webhook signature if present
        if signature:
            expected = hmac.new(RAZORPAY_KEY_SECRET.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected, signature):
                return {"status": "ignored", "reason": "signature mismatch"}

        import json
        event_data = json.loads(body_bytes.decode("utf-8"))
        event_type = event_data.get("event")

        # When payment is captured
        if event_type == "payment.captured":
            payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
            notes = payment_entity.get("notes", {})
            user_id = notes.get("user_id")
            plan = notes.get("plan")
            if user_id and plan:
                conn = get_conn()
                conn.execute("UPDATE users SET plan = ? WHERE id = ?", (plan, user_id))
                conn.commit()
                conn.close()
                print(f"[Razorpay Webhook] Successfully upgraded user {user_id} to {plan}")

        return {"status": "ok", "event": event_type}
    except Exception as e:
        print(f"[Razorpay Webhook Error] {e}")
        return {"status": "error", "message": str(e)}
