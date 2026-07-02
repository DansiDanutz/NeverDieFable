"""Embedding backfill job — fills neverdie.memory_chunk.embedding.

Resumable and idempotent: only touches rows where embedding IS NULL, so it can
be stopped and restarted, and re-running after new memories arrive just embeds
the new ones. Turns keyword retrieval into semantic recall (docs/ROADMAP Phase 1).

Run:
    cd services/api && set -a && source ../../.env && set +a
    PYTHONPATH=. python -m ai.embed_job            # embed the self corpus
    PYTHONPATH=. python -m ai.embed_job --limit 2000
"""

from __future__ import annotations

import argparse
import sys

from . import embeddings
from .supastore import SupabaseStore


def run(store: SupabaseStore, person_id: str | None = None,
        batch: int = 64, max_rows: int | None = None) -> int:
    done = 0
    while True:
        want = batch if max_rows is None else min(batch, max_rows - done)
        if want <= 0:
            break
        rows = store.chunks_without_embedding(person_id, want)
        if not rows:
            break
        vectors = embeddings.embed([r["content"] for r in rows])
        items = [{"id": r["id"], "emb": embeddings.to_pgvector(v)}
                 for r, v in zip(rows, vectors)]
        done += store.set_embeddings(items)
        print(f"embedded {done} chunks", flush=True)
    return done


def main() -> None:
    import os

    ap = argparse.ArgumentParser()
    ap.add_argument("--person", default=None, help="person uuid; omit for self corpus")
    ap.add_argument("--limit", type=int, default=None, help="max rows this run")
    ap.add_argument("--batch", type=int, default=64)
    args = ap.parse_args()

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not (url and key):
        sys.exit("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    os.environ.setdefault("NEVERDIE_EMBED_PROVIDER", "local")

    store = SupabaseStore(url, key)
    total = run(store, person_id=args.person, batch=args.batch, max_rows=args.limit)
    print(f"done — {total} chunks embedded this run")


if __name__ == "__main__":
    main()
