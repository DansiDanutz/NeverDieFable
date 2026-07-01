"""Ingest pipeline — everything → organized memory.

Stages (each engine per docs/TECH_STACK.md):
  audio/video : faster-whisper transcription → pyannote diarization →
                voice-print matching to auto-tag known speakers
  images      : InsightFace face detect/cluster → SigLIP caption/embedding
  documents   : PaddleOCR → layout-aware chunking
  all text    : chunk → BGE-M3 embed → memory_chunk rows → graph links
                (item ↔ person ↔ event ↔ place ↔ topic)

Anything below confidence thresholds becomes a *gap record* that the Daily
Companion turns into a human question (services/ai/companion.py).

Privacy: this worker receives plaintext only inside a short-lived processing
context; it writes back encrypted text + embeddings and drops plaintext
(docs/PRIVACY_SECURITY.md).
"""

from dataclasses import dataclass, field
from typing import Any
from uuid import UUID


@dataclass
class GapRecord:
    kind: str                 # 'unknown_face' | 'unlabeled_voice' | 'undated_item' | ...
    item_id: UUID
    detail: dict[str, Any] = field(default_factory=dict)


def ingest_item(item_id: UUID) -> list[GapRecord]:
    """Run the full pipeline for one vault item. Idempotent per item version."""
    raise NotImplementedError("wire pipeline stages")
