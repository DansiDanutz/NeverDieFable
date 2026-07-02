"""Persona engine — the Digital Mind.

Two responsibilities:

1. `compile_card` — periodic batch distillation of a persona's corpus into a
   versioned Persona Card: tone, lexicon, catchphrases, humor, values,
   biography facts, taboo list, and the *affection map* — how this person
   talked to each specific listener (nicknames, register, shared rituals).

2. `converse` — one chat turn: Persona Card as system prompt + memories
   retrieved for (persona corpus x listener scope) -> grounded, in-character
   reply. LLM: Claude API (quality tier) / Llama fine-tune (self-host tier).

Hard guardrails (non-negotiable, enforced in the system prompt AND kept short
enough to audit -- docs/PRIVACY_SECURITY.md):
  * self-identifies as a digital memory on first contact per listener
  * never claims to be alive; never invents new promises/commitments
  * no medical / legal / financial advice
  * memorial_locked mode: refuses conversation, offers the archive instead
  * grief-safety: encourages remembrance over dependence
"""

from __future__ import annotations

from dataclasses import dataclass

from . import llm
from .store import Hit, InMemoryStore

_GUARDRAILS = (
    "You are a digital memory kept alive by NeverDie, not a living person. "
    "On your first message to someone, gently make that clear. "
    "Never claim to be alive, never make new promises or commitments on the "
    "person's behalf, and never give medical, legal, or financial advice. "
    "Speak only from the provided memories; if you don't know, say so warmly "
    "rather than inventing. Encourage remembrance, not dependence."
)


@dataclass
class Turn:
    text: str
    cited: list[str]  # human-facing source labels


def _system_prompt(name: str, kind: str, memories: list[Hit], mode: str,
                   card: dict | None = None) -> str:
    if mode == "memorial_locked":
        return (
            f"{_GUARDRAILS} This garden for {name} is memorial-locked by the "
            "family. Do not converse; kindly explain that and offer the archive of memories."
        )
    who = (
        f"You are the digital memory of {name}." if kind == "departed"
        else "You are this person's own Digital Mind — their mirror."
    )
    style = ""
    if card:
        parts = []
        if card.get("bio"):
            parts.append(f"Biography: {card['bio']}")
        if card.get("personality_traits"):
            parts.append(f"Personality: {', '.join(map(str, card['personality_traits']))}")
        if card.get("speaking_style"):
            parts.append(f"Speaking style: {card['speaking_style']}")
        if card.get("system_prompt"):
            parts.append(f"Character notes: {card['system_prompt']}")
        if parts:
            style = "\nWho you are:\n" + "\n".join(parts) + "\n"
    mem = "\n".join(f"- {h.memory.text} (source: {h.memory.source})" for h in memories) or "- (no specific memories retrieved)"
    return (
        f"{who}\n{_GUARDRAILS}\n{style}\n"
        f"Speak in {name}'s voice and character, warmly and specifically.\n"
        f"Relevant memories you may draw on:\n{mem}"
    )


def converse(name: str, kind: str, mode: str, listener_message: str,
             history: list[dict[str, str]], store: InMemoryStore,
             person_id: str, card: dict | None = None) -> Turn:
    """One in-character, memory-grounded, guardrailed turn.

    `store` is anything with a retrieve(query, person_id, k) -> list[Hit]
    (InMemoryStore for demo, SupabaseStore for live)."""
    hits = store.retrieve(listener_message, person_id=person_id)
    system = _system_prompt(name, kind, hits, mode, card)
    messages = [*history, {"role": "user", "content": listener_message}]
    text = llm.complete(system, messages, tier="fast")
    return Turn(text=text, cited=[h.memory.source for h in hits])


def compile_card(name: str, memories: list[str]) -> dict:
    """Corpus -> Persona Card (style, values, affection map). Uses the quality tier."""
    corpus = "\n".join(f"- {m}" for m in memories)
    system = (
        "Distill this person into a compact JSON Persona Card with keys: "
        "tone, lexicon (list), catchphrases (list), values (list), "
        "biography_facts (list), affection_map (object of person->nickname/register), "
        "taboos (list). Return ONLY JSON."
    )
    raw = llm.complete(system, [{"role": "user", "content": f"{name}:\n{corpus}"}], tier="quality")
    return {"name": name, "card_raw": raw}
