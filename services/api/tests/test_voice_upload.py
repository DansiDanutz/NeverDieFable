"""Voice uploads must be bounded before external cloning begins."""

import asyncio
from io import BytesIO

import pytest
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

from app.routers.personas import MAX_VOICE_SAMPLE_BYTES, read_voice_sample


def upload(content: bytes, content_type: str = "audio/mpeg") -> UploadFile:
    return UploadFile(
        file=BytesIO(content),
        filename="sample.mp3",
        headers=Headers({"content-type": content_type}),
    )


def test_reads_supported_audio_sample() -> None:
    assert asyncio.run(read_voice_sample(upload(b"audio"))) == b"audio"


def test_rejects_non_audio_before_reading() -> None:
    sample = upload(b"not audio", content_type="text/plain")

    with pytest.raises(HTTPException) as error:
        asyncio.run(read_voice_sample(sample))

    assert error.value.status_code == 415


def test_rejects_oversized_audio() -> None:
    sample = upload(b"a" * (MAX_VOICE_SAMPLE_BYTES + 1))

    with pytest.raises(HTTPException) as error:
        asyncio.run(read_voice_sample(sample))

    assert error.value.status_code == 413


def test_rejects_empty_audio() -> None:
    with pytest.raises(HTTPException) as error:
        asyncio.run(read_voice_sample(upload(b"")))

    assert error.value.status_code == 400
