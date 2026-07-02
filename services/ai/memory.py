"""Memory engine — hybrid retrieval over the vault, and grounded answers.

One engine, many masks: Ask Anything, self-persona recall, garden-persona
recall, and heir queries all call `retrieve`/`answer` with different scopes.

Demo backend: keyword overlap over an in-memory corpus (services/ai/store.py).
Production backend: pgvector cosine (BGE-M3) + BM25 + one-hop graph expansion,
reciprocal-rank fused and cross-encoder reranked — same signatures.
Every answer carries citations back to vault items; no uncited claims.
"""

from __future__ import annotations

from . import llm
from .store import InMemoryStore


def answer(query: str, store: InMemoryStore, person_id: str = "self") -> tuple[str, list[str]]:
    """Ask Anything: retrieve -> synthesize a grounded answer with citations."""
    hits = store.retrieve(query, person_id=person_id, k=6)
    if not hits:
        return ("I don't have a memory about that yet. Tell me, and I'll keep it.", [])
    context = "\n".join(f"- {h.memory.text} (source: {h.memory.source})" for h in hits)
    system = (
        "Answer the user's question using ONLY the memories below. Be warm and "
        "specific. Cite naturally. If the memories don't answer it, say so.\n\n"
        f"Memories:\n{context}"
    )
    text = llm.complete(system, [{"role": "user", "content": query}], tier="fast")
    return text, [h.memory.source for h in hits]
