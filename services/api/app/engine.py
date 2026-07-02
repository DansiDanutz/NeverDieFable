"""Bridge from the API to the AI pipeline (services/ai).

Live mode (SUPABASE_URL + SUPABASE_SERVICE_KEY set): retrieval runs over the
real neverdie schema — 92k+ memory chunks — and personas (e.g. Eva) come from
the database with their real Persona Cards.

Demo mode (no credentials): in-memory store with a seeded corpus, so the whole
app still works end-to-end.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Make the sibling `services/ai` package importable.
_SERVICES = Path(__file__).resolve().parents[2]
if str(_SERVICES) not in sys.path:
    sys.path.insert(0, str(_SERVICES))

from ai import companion as companion_engine  # noqa: E402
from ai import growth  # noqa: E402
from ai import memory as memory_engine  # noqa: E402
from ai import persona as persona_engine  # noqa: E402
from ai.store import InMemoryStore  # noqa: E402
from ai.supastore import SupabaseStore  # noqa: E402
from app.config import get_settings  # noqa: E402

_DEMO_PERSONAS: dict[str, dict] = {
    "self": {"name": "You", "kind": "self", "mode": "mirror", "person_id": "self", "card": None},
    "p1": {"name": "Grandpa Ion", "kind": "departed", "mode": "legacy", "person_id": "p1", "card": None},
    "p2": {"name": "Aunt Maria", "kind": "departed", "mode": "legacy", "person_id": "p2", "card": None},
}

_settings = get_settings()

if _settings.supabase_url and _settings.supabase_service_key:
    STORE = SupabaseStore(_settings.supabase_url, _settings.supabase_service_key)
    LIVE = True
else:
    STORE = InMemoryStore()
    LIVE = False

_persona_cache: dict[str, dict] | None = None


def personas() -> dict[str, dict]:
    """Persona registry: live rows (+ a virtual 'self') or the demo set."""
    global _persona_cache
    if not LIVE:
        return _DEMO_PERSONAS
    if _persona_cache is None:
        _persona_cache = {
            "self": {"name": "You", "kind": "self", "mode": "mirror",
                     "person_id": "self", "card": None},
            **STORE.list_personas(),
        }
    return _persona_cache


def chat_turn(persona_id: str, message: str, history: list[dict[str, str]],
              learn: bool = True):
    reg = personas()
    p = reg.get(persona_id) or reg["self"]
    turn = persona_engine.converse(
        name=p["name"], kind=p["kind"], mode=p["mode"],
        listener_message=message, history=history,
        store=STORE, person_id=p["person_id"], card=p.get("card"),
    )
    # The brain grows: distill this exchange into a durable memory of the
    # subject, so tomorrow the Mind remembers what was said today.
    if learn and LIVE:
        try:
            mem = growth.distill(message, turn.text)
            if mem:
                STORE.add_memory(p["person_id"], mem,
                                 source=f"conversation · {p['name']}", kind="interaction")
        except Exception:
            pass  # never let learning break a reply
    return turn


def ask(query: str, person_id: str = "self"):
    return memory_engine.answer(query, STORE, person_id=person_id)


def completeness(person_id: str) -> dict:
    """Memory Completeness score that drives the daily habit loop."""
    if not LIVE:
        return {"total": 0, "embedded": 0, "score": 0.0}
    s = STORE.corpus_stats(person_id)
    total = int(s["total"])
    # a warm, non-shaming curve: meaningful at ~200 memories, rich past ~2000
    import math
    score = 0.0 if total == 0 else min(1.0, math.log10(1 + total) / math.log10(2001))
    return {**s, "score": round(score, 3)}


def generate_companion_questions(persona_id: str = "self", n: int = 3) -> list[dict]:
    """Interview the user (or family) to grow a corpus, queue the questions."""
    if not LIVE:
        return []
    reg = personas()
    p = reg.get(persona_id) or reg["self"]
    seed = "life story family love home childhood work"
    known = [h.memory.text for h in STORE.retrieve(seed, p["person_id"], k=12)]
    qs = companion_engine.generate(p["name"], p["kind"] == "departed", known, n=n)
    for q in qs:
        q["id"] = STORE.companion_add(q["question"], q["gap_kind"], q["priority"],
                                      gap_ref={"persona_id": persona_id})
    return qs


def companion_today(limit: int = 3) -> list[dict]:
    return STORE.companion_today(limit) if LIVE else []


def answer_companion(question_id: str, text: str, person_id: str = "self") -> dict:
    """A companion answer becomes durable, embeddable memory of the subject."""
    if not LIVE:
        return {"status": "demo"}
    mem_id = STORE.add_memory(person_id, text, source="companion answer", kind="story")
    STORE.companion_answered(question_id, mem_id)
    return {"status": "answered", "memory_id": mem_id}


def set_persona_voice(persona_id: str, voice_ref: str) -> None:
    """Persist a cloned voice and refresh the registry cache."""
    global _persona_cache
    if LIVE:
        STORE.set_voice(persona_id, voice_ref)
        _persona_cache = None
    else:
        _DEMO_PERSONAS.setdefault(persona_id, dict(_DEMO_PERSONAS["self"]))["voice_ref"] = voice_ref
