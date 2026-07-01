"""Personas — Digital Minds for self and for departed people (Eternal Garden)."""

from uuid import UUID, uuid4

from fastapi import APIRouter

from app.schemas import PersonaCreate

router = APIRouter()


@router.post("")
async def create_persona(req: PersonaCreate) -> dict:
    """Create a persona shell. Consent gate: kind=departed requires attesting a
    personal relationship; personas of living third parties require their consent
    (see docs/PRIVACY_SECURITY.md)."""
    # TODO: insert persona; create memory_circle when kind=departed
    return {"id": str(uuid4()), "kind": req.kind, "card_version": 0}


@router.post("/{persona_id}/voice")
async def build_voice(persona_id: UUID) -> dict:
    """Build/refresh the voice print from this persona's audio corpus.
    Pipeline: pyannote isolates the target speaker → Fish Speech voice print."""
    # TODO: queue.enqueue("voice_print", persona_id)
    return {"persona_id": str(persona_id), "job": "voice_print", "status": "queued"}


@router.post("/{persona_id}/avatar")
async def build_avatar(persona_id: UUID) -> dict:
    """Build the avatar rig: LivePortrait idle loop + viseme bank from the best
    portrait photo(s)."""
    # TODO: queue.enqueue("avatar_rig", persona_id)
    return {"persona_id": str(persona_id), "job": "avatar_rig", "status": "queued"}


@router.post("/{persona_id}/card/recompile")
async def recompile_card(persona_id: UUID) -> dict:
    """Distill the persona's corpus into a new Persona Card version
    (style, values, affection map). See services/ai/persona.py."""
    # TODO: queue.enqueue("persona_card", persona_id)
    return {"persona_id": str(persona_id), "job": "persona_card", "status": "queued"}
