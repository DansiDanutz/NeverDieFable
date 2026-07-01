"""Daily Companion — the proactive agent's question queue."""

from uuid import UUID

from fastapi import APIRouter

router = APIRouter()


@router.get("/today")
async def today() -> dict:
    """Today's ranked questions (max few/day) + streak + housekeeping proposals."""
    # TODO: select pending companion_question order by priority; compute streak
    return {
        "streak_days": 0,
        "questions": [],
        "housekeeping": [],
    }


@router.post("/questions/{question_id}/answer")
async def answer(question_id: UUID, text: str | None = None,
                 audio_item_id: UUID | None = None) -> dict:
    """An answer becomes a 'story' vault item: transcribed, embedded, linked to
    the gap that produced the question. Voice answers also feed voice-print training."""
    # TODO: create story item; resolve gap (tag face, label voice, ...); mark answered
    return {"question_id": str(question_id), "status": "answered"}


@router.post("/questions/{question_id}/skip")
async def skip(question_id: UUID, snooze_days: int = 0) -> dict:
    # TODO: mark skipped/snoozed; grief-aware rate limiting for departed-person topics
    return {"question_id": str(question_id), "status": "snoozed" if snooze_days else "skipped"}
