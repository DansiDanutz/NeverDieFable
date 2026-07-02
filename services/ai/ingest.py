"""Ingest pipeline — everything you keep becomes memory you can recall.

An uploaded vault item (photo, voice note, document…) is turned into one or more
memory_chunk rows, tagged to the right person's corpus, then embedded so it's
semantically recallable. This is the concrete engine behind the promise:
"develop our memory and their memory based on files, images and voices."

Per kind:
  photo / video-frame : Claude vision writes a warm, specific caption
                        ("Eva at home in Florești, holding the cake she made…")
  audio / voice_note  : faster-whisper transcript (optional dep) → memory,
                        and the clip is a candidate for voice-print cloning
  document / message  : text extraction → chunked memories

Tag a photo of a departed loved one to THEIR persona and it grows their garden.
"""

from __future__ import annotations

import base64
import os

from . import embeddings, llm

_CAPTION_SYSTEM = (
    "You are helping someone preserve a precious memory. Look at this photo and "
    "write ONE warm, specific memory in third person — who/what is shown, the "
    "setting, mood, clothing, objects, and any date/place hints. Concrete and "
    "tender, not flowery. This will be kept forever and recalled later."
)


def caption_image(image_bytes: bytes, media_type: str = "image/jpeg",
                  subject_hint: str | None = None) -> str:
    prompt = "Describe this photo as a keepsake memory."
    if subject_hint:
        prompt += f" The person shown is {subject_hint}."
    b64 = base64.b64encode(image_bytes).decode()
    return llm.complete_vision(_CAPTION_SYSTEM, prompt, b64, media_type=media_type).strip()


def transcribe_audio(path: str) -> str:
    """Local transcription (faster-whisper). Returns '' if the dep is absent so
    ingest degrades gracefully."""
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return ""
    model = WhisperModel(os.environ.get("NEVERDIE_ASR_MODEL", "base"), device="cpu", compute_type="int8")
    segments, _ = model.transcribe(path)
    return " ".join(s.text.strip() for s in segments).strip()


def chunk_text(text: str, size: int = 800) -> list[str]:
    words, out, cur = text.split(), [], []
    n = 0
    for w in words:
        cur.append(w); n += len(w) + 1
        if n >= size:
            out.append(" ".join(cur)); cur, n = [], 0
    if cur:
        out.append(" ".join(cur))
    return out


def ingest_item(store, item: dict, blob: bytes | None, person_id: str | None) -> list[str]:
    """Turn one vault item into embedded memories. `store` is a SupabaseStore.
    Returns the created memory ids. Also flips the item to 'ready'."""
    kind = item.get("kind")
    mime = item.get("mime_type") or ""
    source = item.get("title") or kind
    memories: list[str] = []

    if kind in ("photo", "video") and blob:
        caption = caption_image(blob, media_type=mime or "image/jpeg")
        if caption and not caption.startswith("〔"):
            memories.append(store.add_memory(person_id, caption,
                                             source=f"photo · {source}", kind="photo_memory"))

    elif kind in ("audio", "voice_note", "recording") and blob:
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".audio", delete=False) as f:
            f.write(blob); tmp = f.name
        text = transcribe_audio(tmp)
        os.unlink(tmp)
        for c in chunk_text(text):
            memories.append(store.add_memory(person_id, c, source=f"recording · {source}", kind="transcript"))

    elif blob:  # document / message / text
        try:
            text = blob.decode("utf-8", errors="ignore")
        except Exception:
            text = ""
        for c in chunk_text(text):
            memories.append(store.add_memory(person_id, c, source=f"document · {source}", kind="document"))

    # embed the freshly added memories so they're recallable immediately
    if memories:
        _embed_new(store, person_id)
    try:
        store.update_vault_item(item["id"], {"status": "ready"})
    except Exception:
        pass
    return memories


def _embed_new(store, person_id: str | None) -> None:
    rows = store.chunks_without_embedding(person_id, 64)
    if not rows:
        return
    vecs = embeddings.embed([r["content"] for r in rows])
    store.set_embeddings([{"id": r["id"], "emb": embeddings.to_pgvector(v)}
                          for r, v in zip(rows, vecs)])
