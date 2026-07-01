"""Chat — converse with any persona (yourself, a departed loved one, the Companion)."""

from fastapi import APIRouter

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
    # TODO: wire to services/ai/persona.py::converse
    return ChatResponse(
        text="(persona engine not yet wired)",
        audio_ref=None,
        video_ref=None,
        cited_items=[],
    )
