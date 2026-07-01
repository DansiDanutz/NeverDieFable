"""Memory engine — hybrid retrieval over the vault.

One engine, many masks: Ask Anything, self-persona recall, garden-persona
recall, and heir queries all call `retrieve` with different scopes.

Retrieval: pgvector cosine (BGE-M3) + BM25 + one-hop graph expansion
(person/event neighbors), reciprocal-rank fused, cross-encoder reranked.
Every answer carries citations back to vault items — no uncited claims.
"""

from dataclasses import dataclass
from uuid import UUID


@dataclass
class Scope:
    owner_id: UUID
    person_id: UUID | None = None        # persona corpus scope
    listener_id: UUID | None = None      # heir permission scope (legacy rules)
    include_private: bool = False        # 'secret' tier is NEVER retrievable


@dataclass
class Hit:
    chunk_id: UUID
    item_id: UUID
    text: str
    score: float


def retrieve(query: str, scope: Scope, k: int = 12) -> list[Hit]:
    raise NotImplementedError("wire to pgvector + BM25 + graph")


def answer(query: str, scope: Scope) -> tuple[str, list[Hit]]:
    """Ask Anything: retrieve → synthesize grounded answer with citations."""
    raise NotImplementedError("wire retrieve + LLM synthesis")
