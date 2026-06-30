from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from core.database import add_waitlist

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])

class WaitlistRequest(BaseModel):
    email: str

@router.post("")
async def join_waitlist(body: WaitlistRequest):
    added = add_waitlist(body.email)
    if added:
        return {"message": "You're on the list! We'll reach out soon."}
    return {"message": "You're already on the list."}
