"""Vault — store everything, ask anything."""

from uuid import UUID, uuid4

from fastapi import APIRouter

from app import engine
from app.schemas import AskRequest, AskResponse, VaultItemCreate

router = APIRouter()


@router.post("/items")
async def create_item(item: VaultItemCreate) -> dict:
    """Register a vault item and return a one-time signed upload URL for the
    blob (client-encrypted at the Phase-1 crypto rollout). The ingest pipeline
    picks the item up after upload completes."""
    if not engine.LIVE:
        item_id = uuid4()
        return {"id": str(item_id), "upload_url": None, "blob_key": f"vault/{item_id}",
                "note": "demo mode — set SUPABASE_URL/SERVICE_KEY for real storage"}

    owner = engine.STORE.default_owner()
    blob_key = f"{owner}/{uuid4()}"
    row = engine.STORE.create_vault_item(owner, {
        "kind": item.kind.value,
        "title": item.title,
        "mime_type": item.mime_type,
        "byte_size": item.byte_size,
        "captured_at": item.captured_at.isoformat() if item.captured_at else None,
        "source_app": item.source_app,
        "sensitivity": item.sensitivity.value,
        "blob_key": blob_key,
    })
    return {
        "id": row["id"],
        "blob_key": blob_key,
        "upload_url": engine.STORE.signed_upload_url(blob_key),
    }


@router.post("/items/{item_id}/uploaded")
async def mark_uploaded(item_id: UUID, persona_id: str | None = None) -> dict:
    """Client signals the blob is in storage → ingest turns it into embedded
    memory. Pass persona_id to tag a photo/voice of a departed loved one to
    their corpus (grows their garden)."""
    if not engine.LIVE:
        return {"id": str(item_id), "status": "processing"}
    engine.STORE.update_vault_item(str(item_id), {"status": "processing"})
    result = engine.ingest_uploaded(str(item_id), persona_id=persona_id)
    return {"id": str(item_id), **result}


@router.get("/items")
async def list_items(kind: str | None = None, limit: int = 50, offset: int = 0) -> dict:
    if not engine.LIVE:
        return {"items": [], "total": 0}
    owner = engine.STORE.default_owner()
    items = engine.STORE.list_vault_items(owner, kind=kind, limit=limit, offset=offset)
    return {"items": items, "total": len(items)}


@router.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest) -> AskResponse:
    """Ask Anything: retrieval over the user's memory chunks, answer with
    citations. See services/ai/memory.py."""
    text, sources = engine.ask(req.query)
    return AskResponse(answer=text, citations=[{"source": s} for s in sources])
