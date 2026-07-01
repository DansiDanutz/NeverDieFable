"""Voice adapter — cloning and synthesis.

Engines (see docs/TECH_STACK.md for licenses):
  * Fish Speech / OpenAudio (Apache 2.0) — voice-print creation, highest fidelity.
      setup: https://github.com/fishaudio/fish-speech
  * Chatterbox (MIT, Resemble AI) — low-latency conversational synthesis with
      built-in watermarking. setup: https://github.com/resemble-ai/chatterbox

Both are wrapped behind the same interface so tiers/languages can route freely.
Every synthesized clip is watermarked and tagged with provenance metadata —
this is a product requirement (docs/PRIVACY_SECURITY.md), not an option.
"""

from dataclasses import dataclass


@dataclass
class VoicePrint:
    ref: str            # storage key of the serialized print
    engine: str         # 'fish_speech'
    seconds_of_audio: float
    quality_score: float


def create_voice_print(audio_paths: list[str], target_speaker_hint: str | None = None) -> VoicePrint:
    """Build a reusable voice print from one or more recordings.

    For departed people the audio is often mixed (home videos, voicemails):
    run pyannote diarization first and keep only the target speaker's segments
    (`target_speaker_hint` = an enrolled sample or human-confirmed segment id).
    ~60s of clean speech is the quality knee; we accept from 10s with a
    lower quality_score that the UI surfaces honestly.
    """
    raise NotImplementedError("wire to Fish Speech worker")


def synthesize(text: str, voice: VoicePrint, *, streaming: bool = True) -> bytes:
    """Text → watermarked audio in the cloned voice.

    Conversational path: Chatterbox, sentence-chunked, first chunk < 500ms.
    Quality path (time capsules, memorial films): Fish Speech full render.
    """
    raise NotImplementedError("wire to Chatterbox/Fish Speech worker")
