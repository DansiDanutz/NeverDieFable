"""Live Supabase-backed memory store + persona registry.

Same `retrieve` contract as store.InMemoryStore, but querying the real
neverdie schema via PostgREST with the service key (server-side only).
Retrieval today: Postgres FTS via the neverdie.search_memory RPC
(migration 0006). The pgvector path replaces the RPC internals when the
embedding job lands — this interface doesn't change.
"""

from __future__ import annotations

import httpx

from .store import Hit, Memory


class SupabaseStore:
    def __init__(self, url: str, service_key: str) -> None:
        self.base = f"{url.rstrip('/')}/rest/v1"
        self.headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Accept-Profile": "neverdie",
            "Content-Profile": "neverdie",
        }

    def retrieve(self, query: str, person_id: str, k: int = 6) -> list[Hit]:
        """person_id: 'self' (the owner's corpus, person_id NULL) or a person uuid."""
        p_person = None if person_id == "self" else person_id
        r = httpx.post(
            f"{self.base}/rpc/search_memory",
            headers=self.headers,
            json={"q": query, "p_person": p_person, "k": k},
            timeout=15,
        )
        r.raise_for_status()
        hits = []
        for row in r.json():
            meta = row.get("meta") or {}
            when = str(meta.get("at") or "")[:10]
            sender = meta.get("sender") or meta.get("source") or "memory"
            hits.append(Hit(
                Memory(
                    id=row["id"],
                    person_id=person_id,
                    text=row["content"],
                    source=f"{sender} · {when}" if when else str(sender),
                ),
                float(row.get("rank") or 0),
            ))
        return hits

    def list_personas(self) -> dict[str, dict]:
        """Personas + latest card + person info, keyed by persona id."""
        r = httpx.get(
            f"{self.base}/persona",
            headers=self.headers,
            params={"select": "id,kind,mode,person_id,card_version,"
                              "person:person_id(full_name,relationship,is_departed),"
                              "persona_card(version,card)"},
            timeout=15,
        )
        r.raise_for_status()
        out: dict[str, dict] = {}
        for row in r.json():
            cards = sorted(row.get("persona_card") or [], key=lambda c: c["version"])
            person = row.get("person") or {}
            out[row["id"]] = {
                "name": person.get("full_name", "Unknown"),
                "relationship": person.get("relationship"),
                "kind": row["kind"],
                "mode": row["mode"],
                "person_id": row.get("person_id") or "self",
                "card": (cards[-1]["card"] if cards else None),
            }
        return out
