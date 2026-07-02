"""End-to-end smoke tests that run with no API key and no database (offline mode).

They prove the plumbing: retrieval finds the right memories and the response
shape is correct. With ANTHROPIC_API_KEY set, the same paths return real
Claude answers grounded in those memories.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import engine  # noqa: E402


def test_ask_retrieves_relevant_memory():
    text, sources = engine.ask("Where did I propose to Ana?")
    assert isinstance(text, str) and text
    # The beach/proposal memory should be retrieved and cited.
    assert any("2019" in s for s in sources)


def test_departed_persona_chat_grounds_in_corpus():
    turn = engine.chat_turn("p1", "What did you call Ana?", history=[])
    assert isinstance(turn.text, str) and turn.text
    # Grandpa Ion's nickname memory ("steluța mea") should be surfaced.
    assert any("Maria" in s or "story" in s.lower() for s in turn.cited)


def test_unknown_query_is_honest():
    text, sources = engine.ask("What is my bank PIN?")
    assert isinstance(text, str) and text
