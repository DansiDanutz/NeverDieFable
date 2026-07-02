"""Companion engine — the daily habit that grows the brain.

Two jobs, both real:

1. `generate` — look at what the app already knows (recent memories retrieved
   for a seed topic) and ask the LLM for warm, specific interview questions that
   would ADD the most: fill gaps, capture untold stories, deepen a loved one's
   garden. Questions are written into the companion_question queue with a
   priority, ready for the phone's Today screen.

2. Answers flow back through growth.add_memory → embedding → recall, so tomorrow
   the Mind knows what you told it today. That loop is the addiction: every day
   you talk, both you and the people you love become more present.

The design goal (docs/DAILY_COMPANION.md): one gentle, high-value touch per day.
"""

from __future__ import annotations

import json

from . import llm

_GEN_SYSTEM = (
    "You are NeverDie's daily companion — a warm, curious interviewer helping "
    "someone preserve their life and the memory of people they love. Given a "
    "few things already remembered, propose {n} NEW questions that would capture "
    "the most precious, specific, still-untold memories. Favor stories, senses, "
    "relationships, turning points, and the little rituals people forget. Keep "
    "each question short, warm, and answerable in a voice note. "
    "For a person who has passed away, ask the family to recall them tenderly. "
    "Return ONLY a JSON array of objects: "
    '[{{"question": str, "gap_kind": "story|person|period|ritual|values", "priority": 0.0-1.0}}]'
)


def generate(subject_name: str, is_departed: bool, known_memories: list[str], n: int = 3) -> list[dict]:
    ctx = "\n".join(f"- {m}" for m in known_memories[:12]) or "- (almost nothing yet — this garden is new)"
    who = f"the late {subject_name}" if is_departed else f"{subject_name} (the user themselves)"
    system = _GEN_SYSTEM.format(n=n)
    prompt = f"Subject: {who}\nAlready remembered:\n{ctx}\n\nPropose {n} questions."
    raw = llm.complete(system, [{"role": "user", "content": prompt}], tier="fast", max_tokens=500).strip()
    if raw.startswith("〔offline"):
        return []
    # tolerate markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1].lstrip("json").strip()
    try:
        items = json.loads(raw)
        out = []
        for it in items[:n]:
            out.append({
                "question": str(it["question"]).strip(),
                "gap_kind": str(it.get("gap_kind", "story")),
                "priority": float(it.get("priority", 0.5)),
            })
        return out
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        return []
