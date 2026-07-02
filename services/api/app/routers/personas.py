"""Personas — Digital Minds for self and for departed people (Eternal Garden)."""

from uuid import UUID, uuid4

from fastapi import APIRouter, UploadFile

from app import engine
from app.schemas import PersonaCreate

router = APIRouter()


@router.get("")
async def list_personas() -> dict:
    """Registry the app renders: Garden cards, chat headers, voice status."""
    out = []
    for pid, p in engine.personas().items():
        card = p.get("card") or {}
        out.append({
            "id": pid,
            "name": p["name"],
            "relationship": p.get("relationship"),
            "kind": p["kind"],
            "mode": p["mode"],
            "has_voice": bool(p.get("voice_ref")),
            "has_card": bool(card),
        })
    return {"personas": out}


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


@router.post("/{persona_id}/voice/clone")
async def clone_voice(persona_id: UUID, sample: UploadFile) -> dict:
    """Instant voice clone from one uploaded sample (30s–3min of clean speech).

    Today: ElevenLabs instant cloning (fastest path to a speaking persona).
    Later: self-hosted Fish Speech behind the same endpoint. The resulting
    voice speaks in /chat replies immediately."""
    from ai.voice import clone_elevenlabs

    audio = await sample.read()
    voice_id = clone_elevenlabs(f"neverdie-{persona_id}", audio,
                                filename=sample.filename or "sample.mp3")
    ref = f"elevenlabs:{voice_id}"
    engine.set_persona_voice(str(persona_id), ref)
    return {"persona_id": str(persona_id), "voice_ref": ref, "status": "ready"}


@router.post("/{persona_id}/avatar")
async def build_avatar(persona_id: UUID) -> dict:
    """Build the avatar rig: LivePortrait idle loop + viseme bank from the best
    portrait photo(s)."""
    # TODO: queue.enqueue("avatar_rig", persona_id)
    return {"persona_id": str(persona_id), "job": "avatar_rig", "status": "queued"}


@router.post("/{persona_id}/seed")
async def seed_from_your_memories(persona_id: str, per_seed: int = 12) -> dict:
    """Bring a departed loved one to life from what you already wrote about them:
    semantically mine your own corpus for memories mentioning them and copy the
    closest into their corpus, so they can recall your real shared moments."""
    return engine.seed_departed_corpus(persona_id, per_seed=per_seed)


@router.post("/{persona_id}/card/recompile")
async def recompile_card(persona_id: UUID) -> dict:
    """Distill the persona's corpus into a new Persona Card version
    (style, values, affection map). See services/ai/persona.py."""
    # TODO: queue.enqueue("persona_card", persona_id)
    return {"persona_id": str(persona_id), "job": "persona_card", "status": "queued"}
