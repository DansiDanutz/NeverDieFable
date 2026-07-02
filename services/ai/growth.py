"""Memory growth — the brain gets bigger every day it's used.

Two sources feed new memories, both landing as neverdie.memory_chunk rows that
the embedding job then makes semantically recallable:

1. Conversations — a meaningful exchange with your own Mind (or a loved one's)
   is distilled into a durable memory ("Dan remembered proposing to Ana in Vama
   Veche"). This is what makes talking to the app *compound* instead of vanish.
2. Companion answers & imported files — every story you tell, every document or
   voice note, becomes memory of the person it's about.

`distill` uses the LLM to turn raw exchange text into a clean, first-person
memory statement worth keeping; trivial small-talk returns None and is skipped.
"""

from __future__ import annotations

from . import llm

_DISTILL_SYSTEM = (
    "You extract durable, first-person MEMORIES from a short exchange. "
    "Return ONE sentence capturing a fact, feeling, story, preference, or "
    "relationship worth remembering forever — in the speaker's own voice. "
    "If the exchange is trivial small-talk with nothing worth keeping, return "
    "exactly the word SKIP. No preamble, just the memory or SKIP."
)


def distill(listener_msg: str, persona_reply: str) -> str | None:
    exchange = f"Person said: {listener_msg}\nReply: {persona_reply}"
    out = llm.complete(_DISTILL_SYSTEM, [{"role": "user", "content": exchange}], tier="fast", max_tokens=120)
    out = out.strip()
    if not out or out.upper().startswith("SKIP") or out.startswith("〔offline"):
        return None
    return out
