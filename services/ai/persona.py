"""Persona engine — the Digital Mind.

Two responsibilities:

1. `compile_card` — periodic batch distillation of a persona's corpus into a
   versioned Persona Card: tone, lexicon, catchphrases, humor, values,
   biography facts, taboo list, and the *affection map* — how this person
   talked to each specific listener (nicknames, register, shared rituals).

2. `converse` — one chat turn: Persona Card as system prompt + memories
   retrieved for (persona corpus × listener scope) → grounded, in-character
   reply. LLM: Claude API (quality tier) / Llama fine-tune (self-host tier).

Hard guardrails (non-negotiable, enforced in the system prompt AND a
post-filter — docs/PRIVACY_SECURITY.md):
  * self-identifies as a digital memory on first contact per listener
  * never claims to be alive; never invents new promises/commitments
  * no medical / legal / financial advice
  * memorial_locked mode: refuses conversation, offers the archive instead
  * grief-safety: encourages remembrance over dependence
"""

from dataclasses import dataclass
from typing import Any
from uuid import UUID


@dataclass
class Turn:
    text: str
    cited_items: list[UUID]


def compile_card(persona_id: UUID) -> dict[str, Any]:
    """Corpus → Persona Card vN (stored in persona_card table)."""
    raise NotImplementedError("wire distillation batch job")


def converse(persona_id: UUID, listener_id: UUID, message: str,
             history: list[dict[str, str]]) -> Turn:
    """One in-character, memory-grounded, guardrailed turn."""
    raise NotImplementedError("wire card + retrieval + LLM")
