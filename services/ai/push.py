"""Push delivery — the nudge that pulls you back every day.

The daily ritual (services/api/app/engine.py) generates a warm question about
you or the loved one whose garden most needs tending; this module delivers it
to the phone. We use Expo's push service, so no APNs/FCM credentials live here —
the client hands us an ExponentPushToken and Expo fans out to Apple/Google.

Keep the copy gentle. This is a memorial companion, never a growth-hack buzzer:
one soft invitation a day, "Eva is waiting to remember with you," not a badge.
"""

from __future__ import annotations

import httpx

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_expo(tokens: list[str], title: str, body: str,
              data: dict | None = None) -> dict:
    """Deliver one notification to many device tokens. Best-effort: returns the
    Expo receipt payload; the caller logs but never fails the ritual on a push
    error (the questions are already queued in-app regardless)."""
    tokens = [t for t in tokens if isinstance(t, str) and t.startswith("ExponentPushToken")]
    if not tokens:
        return {"sent": 0, "reason": "no valid tokens"}

    messages = [
        {"to": t, "title": title, "body": body, "sound": "default",
         "data": data or {}}
        for t in tokens
    ]
    r = httpx.post(
        EXPO_PUSH_URL,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        json=messages,
        timeout=30,
    )
    r.raise_for_status()
    return {"sent": len(tokens), "receipts": r.json()}
