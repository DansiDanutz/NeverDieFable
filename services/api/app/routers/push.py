"""Push notifications — the daily nudge that keeps the brain growing.

The app registers its Expo push token here; a once-a-day scheduler hits
/push/send-daily to deliver each owner one warm invitation back into the ritual.
"""

from fastapi import APIRouter

from app import engine

router = APIRouter()


@router.post("/register")
async def register(token: str, platform: str = "unknown") -> dict:
    """Enroll this device's Expo push token for the daily ritual nudge."""
    return engine.register_push(token, platform)


@router.post("/send-daily")
async def send_daily() -> dict:
    """Deliver today's ritual invitation to every enrolled device.
    Intended to be called by a daily scheduler (cron / Supabase pg_cron)."""
    return engine.send_daily_push()
