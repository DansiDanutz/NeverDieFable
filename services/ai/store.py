"""Memory store abstraction with an in-memory demo backend.

`InMemoryStore` lets persona chat and Ask-Anything work end-to-end with no
database — seeded with a small demo corpus. The Postgres/pgvector backend
implements the same interface (see db/schema.sql) and is selected when
DATABASE_URL is set.

Retrieval here is a simple keyword/overlap score; the pgvector backend swaps
in BGE-M3 cosine + BM25 + graph expansion (services/ai/memory.py) behind the
same `retrieve` signature.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Memory:
    id: str
    person_id: str          # 'self' or a departed person's id
    text: str
    source: str             # human-facing citation label
    tags: list[str] = field(default_factory=list)


@dataclass
class Hit:
    memory: Memory
    score: float


class InMemoryStore:
    def __init__(self, memories: list[Memory] | None = None) -> None:
        self._m: list[Memory] = memories or list(_DEMO)

    def add(self, m: Memory) -> None:
        self._m.append(m)

    def retrieve(self, query: str, person_id: str, k: int = 6) -> list[Hit]:
        q = {w for w in _norm(query) if len(w) > 2}
        hits: list[Hit] = []
        for m in self._m:
            if m.person_id != person_id:
                continue
            words = set(_norm(m.text)) | set(m.tags)
            overlap = len(q & words)
            if overlap:
                hits.append(Hit(m, overlap / (len(q) or 1)))
        hits.sort(key=lambda h: h.score, reverse=True)
        return hits[:k]


def _norm(s: str) -> list[str]:
    return "".join(c.lower() if c.isalnum() or c.isspace() else " " for c in s).split()


# A tiny, evocative demo corpus so the app feels alive before real data exists.
_DEMO = [
    Memory("m1", "self", "I proposed to Ana on the pebble beach in Vama Veche at sunset; I was so nervous I dropped the ring in the sand.", "Voice note · 2019", ["ana", "proposal", "beach", "sea"]),
    Memory("m2", "self", "My rule in business: never sign anything the same day you first read it. Sleep on it.", "Interview · values", ["business", "advice", "rule"]),
    Memory("m3", "self", "Sunday lunches at Mom's are sacred. Sarmale, and Dad's plum brandy afterward.", "Companion answer", ["family", "sunday", "food", "mom"]),
    Memory("p1", "p1", "Grandpa Ion always said: 'The land remembers who works it.' He woke at five to tend the vines.", "Family story · told by Dan", ["grandpa", "vines", "land", "wisdom"]),
    Memory("p1b", "p1", "He called Ana 'steluța mea' — my little star — every single time she visited.", "Family story · told by Maria", ["grandpa", "ana", "steluța", "nickname"]),
    Memory("p1c", "p1", "His laugh started silent, shoulders shaking, then boomed. You heard it across the whole yard.", "Companion answer", ["grandpa", "laugh"]),
]
