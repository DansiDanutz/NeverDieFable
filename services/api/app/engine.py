"""Bridge from the API to the AI pipeline (services/ai).

Holds a process-wide demo store + persona registry so chat and Ask-Anything
work end-to-end with no database. When DATABASE_URL is set, these are replaced
by the Postgres-backed store and persona rows.
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

STORE = InMemoryStore()

# Minimal persona registry mirroring apps/mobile/src/mock.ts for the demo.
PERSONAS: dict[str, dict] = {
    "self": {"name": "You", "kind": "self", "mode": "mirror", "person_id": "self"},
    "p1": {"name": "Grandpa Ion", "kind": "departed", "mode": "legacy", "person_id": "p1"},
    "p2": {"name": "Aunt Maria", "kind": "departed", "mode": "legacy", "person_id": "p2"},
}


def chat_turn(persona_id: str, message: str, history: list[dict[str, str]]):
    p = PERSONAS.get(persona_id, PERSONAS["self"])
    return persona_engine.converse(
        name=p["name"], kind=p["kind"], mode=p["mode"],
        listener_message=message, history=history,
        store=STORE, person_id=p["person_id"],
    )


def ask(query: str, person_id: str = "self"):
    return memory_engine.answer(query, STORE, person_id=person_id)
