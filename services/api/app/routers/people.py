"""People — the humans in the user's life, living and departed."""

from uuid import UUID, uuid4

from fastapi import APIRouter

from app.schemas import PersonCreate

router = APIRouter()


@router.post("")
async def create_person(person: PersonCreate) -> dict:
    # TODO: insert; if is_departed, offer Eternal Garden creation flow
    return {"id": str(uuid4()), **person.model_dump()}


@router.get("")
async def list_people(departed: bool | None = None) -> dict:
    return {"people": []}


@router.get("/{persona_id}/completeness")
async def memory_completeness(persona_id: str) -> dict:
    """Live Memory Completeness score from the real corpus — the number that
    drives the daily habit loop ('3 more stories unlock her voice')."""
    from app import engine

    stats = engine.completeness(persona_id)
    return {
        "persona_id": persona_id,
        **stats,
        "unlocks": [
            {"tier": "voice", "needs": "60+ seconds of clean audio"},
            {"tier": "avatar", "needs": "1 clear frontal photo"},
            {"tier": "richer recall", "needs": "keep answering the daily questions"},
        ],
    }
