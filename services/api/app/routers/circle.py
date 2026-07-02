"""Memory Circle — the family gathers around a departed loved one's garden.
Invite family, and everyone's stories/photos/voices grow the same person."""

from fastapi import APIRouter

router = APIRouter()

from app import engine  # noqa: E402


@router.post("/{persona_id}/invite")
async def invite(persona_id: str, role: str = "contributor") -> dict:
    """Create a shareable invite link for a loved one's garden."""
    return engine.circle_invite(persona_id, role)


@router.post("/join")
async def join(token: str, name: str) -> dict:
    """Join a garden with an invite token."""
    return engine.circle_join(token, name)


@router.post("/{persona_id}/contribute")
async def contribute(persona_id: str, contributor: str, text: str, kind: str = "story") -> dict:
    """Add your story about them — it becomes a memory they can recall."""
    return engine.circle_contribute(persona_id, contributor, text, kind)


@router.get("/{persona_id}/members")
async def members(persona_id: str) -> dict:
    """Who has gathered in this garden, and how much each has contributed."""
    return {"members": engine.circle_members(persona_id)}
