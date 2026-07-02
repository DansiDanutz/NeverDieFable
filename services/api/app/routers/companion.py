"""Daily Companion — the proactive agent's question queue and the growth loop."""

from uuid import UUID

from fastapi import APIRouter

from app import engine

router = APIRouter()


@router.get("/today")
async def today(limit: int = 3) -> dict:
    """Today's ranked questions. If the queue is empty, generate a fresh batch
    by interviewing against what the Mind already knows."""
    qs = engine.companion_today(limit)
    if not qs:
        qs = engine.generate_companion_questions("self", n=limit)
    return {"questions": qs}


@router.post("/generate")
async def generate(persona_id: str = "self", n: int = 3) -> dict:
    """Generate interview questions for a persona (self or a departed loved one)
    to grow their corpus — the engine of the daily habit."""
    return {"questions": engine.generate_companion_questions(persona_id, n=n)}


@router.post("/questions/{question_id}/answer")
async def answer(question_id: UUID, text: str, persona_id: str = "self") -> dict:
    """An answer becomes durable memory of the subject — transcribed voice or
    typed — then gets embedded so it's recallable tomorrow."""
    return engine.answer_companion(str(question_id), text, person_id=persona_id)
