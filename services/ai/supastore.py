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
            params={"select": "id,kind,mode,person_id,card_version,voice_model_ref,"
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
                "voice_ref": row.get("voice_model_ref"),
            }
        return out

    def set_voice(self, persona_id: str, voice_ref: str) -> None:
        """Persist a cloned voice on the persona ('elevenlabs:<voice_id>')."""
        r = httpx.patch(
            f"{self.base}/persona",
            headers=self.headers,
            params={"id": f"eq.{persona_id}"},
            json={"voice_model_ref": voice_ref},
            timeout=15,
        )
        r.raise_for_status()

    # ── vault ──────────────────────────────────────────────────────────

    def default_owner(self) -> str:
        r = httpx.post(f"{self.base}/rpc/default_owner", headers=self.headers,
                       json={}, timeout=15)
        r.raise_for_status()
        return r.json()

    def create_vault_item(self, owner_id: str, fields: dict) -> dict:
        r = httpx.post(
            f"{self.base}/vault_item",
            headers={**self.headers, "Prefer": "return=representation"},
            json={"owner_id": owner_id, **fields},
            timeout=15,
        )
        r.raise_for_status()
        return r.json()[0]

    def update_vault_item(self, item_id: str, fields: dict) -> None:
        r = httpx.patch(
            f"{self.base}/vault_item",
            headers=self.headers,
            params={"id": f"eq.{item_id}"},
            json=fields,
            timeout=15,
        )
        r.raise_for_status()

    def list_vault_items(self, owner_id: str, kind: str | None = None,
                         limit: int = 50, offset: int = 0) -> list[dict]:
        params = {
            "owner_id": f"eq.{owner_id}",
            "select": "id,kind,title,blob_key,mime_type,byte_size,captured_at,source_app,sensitivity,status,created_at",
            "order": "created_at.desc",
            "limit": str(limit),
            "offset": str(offset),
        }
        if kind:
            params["kind"] = f"eq.{kind}"
        r = httpx.get(f"{self.base}/vault_item", headers=self.headers,
                      params=params, timeout=15)
        r.raise_for_status()
        return r.json()

    def signed_upload_url(self, blob_key: str) -> str:
        """One-time signed URL the client PUTs the (encrypted) blob to."""
        storage = self.base.replace("/rest/v1", "/storage/v1")
        r = httpx.post(
            f"{storage}/object/upload/sign/neverdie-vault/{blob_key}",
            headers=self.headers,
            timeout=15,
        )
        r.raise_for_status()
        return f"{storage}{r.json()['url']}"
