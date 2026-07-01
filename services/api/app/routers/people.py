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


@router.get("/{person_id}/completeness")
async def memory_completeness(person_id: UUID) -> dict:
    """Memory Completeness score: how much material exists for this person and
    what would unlock the next persona quality tier (voice, avatar, stories)."""
    # TODO: compute from item_person + memory_chunk counts and modality coverage
    return {
        "person_id": str(person_id),
        "score": 0.0,
        "unlocks": [
            {"tier": "voice", "needs": "60+ seconds of clean audio"},
            {"tier": "avatar", "needs": "1 clear frontal photo"},
            {"tier": "stories", "needs": "10 answered circle questions"},
        ],
    }
