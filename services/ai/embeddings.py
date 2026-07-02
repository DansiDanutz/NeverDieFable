"""Embeddings adapter — pluggable, defaults to a local multilingual model.

Provider is chosen by NEVERDIE_EMBED_PROVIDER:
  * local   (default) — sentence-transformers BAAI/bge-m3, 1024-dim, multilingual
                        (handles Eva's Romanian + English), runs on CPU, no key.
  * voyage             — Voyage AI (Anthropic's recommended embeddings) if
                        VOYAGE_API_KEY is set; voyage-3 is 1024-dim.

Output vectors are L2-normalized so cosine distance == dot product, matching the
pgvector `vector_cosine_ops` index on neverdie.memory_chunk.embedding.
The dimension is 1024 to match db/schema.sql.
"""

from __future__ import annotations

import os

DIM = 1024
_model = None


def _local():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        name = os.environ.get("NEVERDIE_EMBED_MODEL", "BAAI/bge-m3")
        _model = SentenceTransformer(name)
    return _model


def embed(texts: list[str]) -> list[list[float]]:
    provider = os.environ.get("NEVERDIE_EMBED_PROVIDER", "local")
    if provider == "voyage":
        import httpx

        r = httpx.post(
            "https://api.voyageai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {os.environ['VOYAGE_API_KEY']}"},
            json={"model": os.environ.get("NEVERDIE_EMBED_MODEL", "voyage-3"),
                  "input": texts},
            timeout=60,
        )
        r.raise_for_status()
        return [d["embedding"] for d in r.json()["data"]]

    model = _local()
    return model.encode(texts, normalize_embeddings=True, batch_size=32).tolist()


def embed_query(text: str) -> list[float]:
    return embed([text])[0]


def to_pgvector(vec: list[float]) -> str:
    """pgvector accepts the text form '[0.1,0.2,...]' cast to ::vector."""
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"
