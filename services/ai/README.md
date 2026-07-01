# services/ai — the AI pipeline

Thin, swappable adapters around the open-source engines chosen in
[docs/TECH_STACK.md](../../docs/TECH_STACK.md). These run on GPU workers,
consuming jobs from the queue the API enqueues.

| Module | Engine(s) | Job |
|---|---|---|
| `voice.py` | Fish Speech (clone) + Chatterbox (fast synth) | voice prints, speech synthesis |
| `avatar.py` | LivePortrait (rig) + EchoMimicV3 (render) + Hallo2 (long-form) | avatar rigs, reply videos, memorial films |
| `ingest.py` | faster-whisper, pyannote, InsightFace, SigLIP, PaddleOCR, BGE-M3 | everything → memory chunks + graph links + gap records |
| `memory.py` | pgvector hybrid retrieval | Ask Anything, persona corpus retrieval |
| `persona.py` | Claude API / Llama | Persona Card compiler + conversational turns |
| `companion.py` | Claude API | gap → question generation, ranking |

Model weights are NOT vendored here — each adapter documents its `pip`/checkpoint
setup at the top of the file. All adapters are pure-python interfaces with the
heavy imports deferred, so the API service can import types without GPU deps.
