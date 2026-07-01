"""Vault — store everything, ask anything."""

from uuid import UUID, uuid4

from fastapi import APIRouter

from app.schemas import AskRequest, AskResponse, VaultItemCreate

router = APIRouter()


@router.post("/items")
async def create_item(item: VaultItemCreate) -> dict:
    """Register a vault item and return a pre-signed upload URL for the
    client-encrypted blob. Ingest pipeline picks it up after upload completes."""
    item_id = uuid4()
    # TODO: insert row (status=pending), presign S3 PUT for blob_key
    return {
        "id": str(item_id),
        "upload_url": f"https://storage.example/put/{item_id}",  # placeholder
        "blob_key": f"vault/{item_id}",
    }


@router.post("/items/{item_id}/uploaded")
async def mark_uploaded(item_id: UUID) -> dict:
    """Client signals the encrypted blob is in storage → enqueue ingest job
    (transcribe / diarize / OCR / faces / embed / graph-link)."""
    # TODO: queue.enqueue("ingest", item_id)
    return {"id": str(item_id), "status": "processing"}


@router.get("/items")
async def list_items(kind: str | None = None, person_id: UUID | None = None,
                     limit: int = 50, offset: int = 0) -> dict:
    # TODO: query with RLS scoping
    return {"items": [], "total": 0}


@router.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest) -> AskResponse:
    """Ask Anything: hybrid retrieval over the user's memory chunks,
    answer with citations. See services/ai/memory.py."""
    # TODO: memory.answer(user_id, req.query)
    return AskResponse(answer="(memory engine not yet wired)", citations=[])
