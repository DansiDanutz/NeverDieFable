"""Anthropic client wrapper with a graceful offline fallback.

If ANTHROPIC_API_KEY is unset, `complete` returns a clearly-marked canned
response so the whole app still runs (CI, demos, no-network). The moment the
key is present, real Claude responses flow with zero other changes.
"""

from __future__ import annotations

import os


def _model(tier: str) -> str:
    if tier == "quality":
        return os.environ.get("NEVERDIE_MODEL_QUALITY", "claude-opus-4-8")
    return os.environ.get("NEVERDIE_MODEL_FAST", "claude-sonnet-5")


def complete(system: str, messages: list[dict[str, str]], *, tier: str = "fast",
             max_tokens: int = 1024) -> str:
    """messages: [{'role': 'user'|'assistant', 'content': str}, ...]"""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        last = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return (
            "〔offline mode — set ANTHROPIC_API_KEY for real responses〕 "
            f"I heard: “{last[:120]}”. When my key is set I'll answer from your memories."
        )

    # Imported lazily so the package works without the dependency installed.
    from anthropic import Anthropic

    client = Anthropic(api_key=key)
    resp = client.messages.create(
        model=_model(tier),
        max_tokens=max_tokens,
        system=system,
        messages=messages,
    )
    return "".join(block.text for block in resp.content if block.type == "text")


def complete_vision(system: str, text: str, image_b64: str,
                    media_type: str = "image/jpeg", *, tier: str = "fast",
                    max_tokens: int = 400) -> str:
    """Describe/answer about an image with Claude's multimodal models.
    Used by the ingest pipeline to caption photos into memories."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return "〔offline — set ANTHROPIC_API_KEY to caption images〕"

    from anthropic import Anthropic

    client = Anthropic(api_key=key)
    resp = client.messages.create(
        model=_model(tier),
        max_tokens=max_tokens,
        system=system,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image",
                 "source": {"type": "base64", "media_type": media_type, "data": image_b64}},
                {"type": "text", "text": text},
            ],
        }],
    )
    return "".join(b.text for b in resp.content if b.type == "text")
