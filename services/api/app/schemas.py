"""Pydantic models shared across routers. Mirrors db/schema.sql."""

from datetime import date, datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class ItemKind(str, Enum):
    photo = "photo"
    video = "video"
    audio = "audio"
    voice_note = "voice_note"
    message_thread = "message_thread"
    email = "email"
    document = "document"
    secret = "secret"
    recording = "recording"
    story = "story"
    time_capsule = "time_capsule"


class Sensitivity(str, Enum):
    normal = "normal"
    private = "private"
    secret = "secret"


class VaultItemCreate(BaseModel):
    kind: ItemKind
    title: str | None = None
    mime_type: str | None = None
    byte_size: int | None = None
    captured_at: datetime | None = None
    source_app: str | None = None
    sensitivity: Sensitivity = Sensitivity.normal
    # client-side encryption material
    content_key_wrapped: str | None = None  # base64
    envelope_text_enc: str | None = None  # base64, derived text produced on device


class VaultItem(VaultItemCreate):
    id: UUID
    blob_key: str | None
    status: str
    created_at: datetime


class PersonCreate(BaseModel):
    full_name: str
    relationship: str | None = None
    is_departed: bool = False
    born_on: date | None = None
    died_on: date | None = None


class PersonaKind(str, Enum):
    self_ = "self"
    departed = "departed"
    companion = "companion"


class PersonaCreate(BaseModel):
    kind: PersonaKind
    person_id: UUID | None = None


class ChatRequest(BaseModel):
    persona_id: UUID
    message: str
    want_audio: bool = True
    want_video: bool = False


class ChatResponse(BaseModel):
    text: str
    audio_ref: str | None = None
    video_ref: str | None = None
    cited_items: list[UUID] = []


class AskRequest(BaseModel):
    query: str


class AskResponse(BaseModel):
    answer: str
    citations: list[dict[str, Any]] = []


class LegacyRuleCreate(BaseModel):
    item_id: UUID | None = None
    collection: dict[str, Any] | None = None
    heir_person: UUID
    fallback_heir: UUID | None = None
    trigger: str = "on_death"
    trigger_arg: dict[str, Any] | None = None
    delivery: str = "raw"
