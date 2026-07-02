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


def chat_turn(persona_id: str, message: str, history: list[dict[str, str]]):
    reg = personas()
    p = reg.get(persona_id) or reg["self"]
    return persona_engine.converse(
        name=p["name"], kind=p["kind"], mode=p["mode"],
        listener_message=message, history=history,
        store=STORE, person_id=p["person_id"], card=p.get("card"),
    )


def ask(query: str, person_id: str = "self"):
    return memory_engine.answer(query, STORE, person_id=person_id)
