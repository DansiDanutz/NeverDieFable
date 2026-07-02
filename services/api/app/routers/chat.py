"""Chat — converse with any persona (yourself, a departed loved one, the Companion)."""

import base64
import os

from fastapi import APIRouter

from app import engine
from app.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """One conversational turn.

    Guardrails, retrieval, and the persona LLM live in services/ai/persona.py.
    If the persona has a cloned voice (voice_model_ref = 'elevenlabs:<id>') and
    want_audio is set, the reply is also spoken and returned as base64 MP3.
    Video (want_video) attaches in Phase 3 via services/ai/avatar.py.
    """
    turn = engine.chat_turn(str(req.persona_id), req.message, history=[])

    audio_b64 = None
    if req.want_audio and os.environ.get("ELEVENLABS_API_KEY"):
        p = engine.personas().get(str(req.persona_id)) or {}
        ref = p.get("voice_ref") or ""
        if ref.startswith("elevenlabs:"):
            from ai.voice import synthesize_elevenlabs

            try:
                audio = synthesize_elevenlabs(turn.text, ref.split(":", 1)[1])
                audio_b64 = base64.b64encode(audio).decode()
            except Exception:
                audio_b64 = None  # voice is best-effort; text always arrives

    return ChatResponse(
        text=turn.text,
        audio_b64=audio_b64,
        audio_ref=None,
        video_ref=None,
        cited_items=[],
        citations=turn.cited,
    )
