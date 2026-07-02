"""Chat — converse with any persona (yourself, a departed loved one, the Companion)."""

from fastapi import APIRouter

from app import engine
from app.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """One conversational turn.

    Flow (services/ai/):
      1. Guardrails: persona mode (mirror/legacy/memorial_locked), listener scope.
      2. Retrieve memories scoped to the persona's corpus + this listener
         (affection map: how this persona talks to *this* person).
      3. Persona LLM (Persona Card as system prompt) → reply text + citations.
      4. want_audio: sentence-chunked TTS (Chatterbox) → audio_ref.
      5. want_video: enqueue EchoMimicV3 render → video_ref delivered async.
    """
    # Guardrails, retrieval, and the persona LLM live in services/ai/persona.py.
    # Voice/video (want_audio/want_video) attach in Phase 2/3 via services/ai/{voice,avatar}.py.
    turn = engine.chat_turn(str(req.persona_id), req.message, history=[])
    return ChatResponse(
        text=turn.text,
        audio_ref=None,
        video_ref=None,
        cited_items=[],
        citations=turn.cited,
    )
