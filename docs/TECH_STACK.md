# Tech Stack — Chosen Open-Source Models & Frameworks

Research date: July 2026. Every AI component is chosen with **license** in mind — NeverDie is a commercial product, so non-commercial weights are only acceptable as dev-time fallbacks.

## Voice cloning (TTS)

> Note: Meta's **Voicebox** (mentioned in the original brief) was never open-sourced — Meta withheld the weights. The models below are the actual state of the art that we can ship.

| Model | License | Why / why not |
|---|---|---|
| **Fish Speech / OpenAudio** ✅ primary | Apache 2.0 (weights open) | Best-in-class zero-shot cloning (TTS-Arena ELO ~1339), multilingual, DualAR architecture, commercially usable. |
| **Chatterbox (Resemble AI)** ✅ secondary | MIT | Preferred over ElevenLabs 65% in blind tests; zero commercial restrictions; built-in watermarking (useful for our provenance requirements). |
| XTTS-v2 (Coqui) | CPML — **non-commercial** | Excellent quality + streaming, 17 languages from 6 s of audio — dev/eval fallback only. |
| F5-TTS | CC-BY-NC — **non-commercial** | 3-second reference cloning, great naturalness — dev/eval fallback only. |

Strategy: **Fish Speech** for the cloning pipeline (one-time voice-print creation per persona), **Chatterbox** for fast conversational synthesis; abstract both behind `services/ai/voice.py` so models can be swapped per language/quality tier. Optional commercial API tier (ElevenLabs) as a premium fallback for rare languages.

## Talking avatars

| Model | Use |
|---|---|
| **LivePortrait** ✅ | One photo → animated portrait with expression control. Our default "bring a photo to life" engine — highest quality per unit of input, which matters because for deceased people we often have only photos. |
| **EchoMimicV3** ✅ | Audio-driven talking head, unified architecture (lips + expression + pose). Server-side rendering of avatar replies. |
| **Hallo2/3** | Long-duration, high-resolution audio-driven generation — used for Time Capsule videos and memorial films. |
| **LiveAvatar (Alibaba, ECCV 2026)** | Streaming real-time audio-driven avatars (FP8, ~real-time on 48 GB GPUs). Target engine for **live conversation mode** in v2. |

Strategy: pre-render a persona "idle loop" + viseme bank with LivePortrait for instant playback; EchoMimicV3 renders full replies asynchronously; migrate live mode to LiveAvatar when GPU economics allow.

## Speech-to-text & understanding

- **Whisper large-v3 / faster-whisper** — server transcription of imported audio.
- **whisper.cpp** — on-device transcription for live listening (privacy: raw meeting audio can stay on the phone; only encrypted text syncs).
- **pyannote.audio** — speaker diarization ("who said what") for meetings and for isolating the deceased's voice in mixed home videos. Voice-print matching auto-tags speakers across the vault.

## Memory engine (the "mind")

- **PostgreSQL + pgvector** (Supabase-ready) — one store for entities *and* embeddings.
- **BGE-M3** embeddings (open, multilingual, MIT) — semantic search across all modalities' text representations.
- **Hybrid retrieval:** vector + BM25 + knowledge-graph hops (people ↔ events ↔ items), reranked. Every answer cites vault sources.
- **Persona LLM:** Claude API (quality tier) with a persona system prompt compiled from style analysis + retrieved memories; **Llama-3.x fine-tune** as the self-hostable/on-prem tier. The persona layer is model-agnostic.
- **Style extraction:** periodic batch job distills each persona's lexicon, humor, values, catchphrases, and per-relationship affection map ("what he called each grandchild") into a versioned *Persona Card*.

## Vision / organization

- **SigLIP / OpenCLIP** image embeddings + face clustering (InsightFace) → automatic people albums, "every photo with Mom at the sea".
- OCR (PaddleOCR) for documents; layout-aware chunking for RAG.

## Application stack

| Layer | Choice |
|---|---|
| Mobile | **Expo / React Native + TypeScript** (one codebase, iOS + Android; expo-router, expo-av, expo-secure-store, on-device SQLite cache) |
| Backend | **FastAPI (Python)** — same language as the AI pipeline; async; typed with Pydantic |
| DB | **Postgres + pgvector** (Supabase for auth, storage, realtime) |
| Blob storage | S3-compatible, client-side encrypted (AES-256-GCM per item; keys wrapped by user master key) |
| Crypto | libsodium; **Shamir Secret Sharing** for legacy key escrow (see PRIVACY_SECURITY.md) |
| Jobs | Redis + worker queue for transcription / cloning / rendering pipelines |
| GPU inference | Modal/RunPod-style serverless GPU for EchoMimic & Fish Speech; batch windows for cost control |

## Sources

- [Best Open-Source TTS 2026 (FindSkill)](https://findskill.ai/blog/best-open-source-tts-2026/)
- [Best Local TTS Models 2026 (Local AI Master)](https://localaimaster.com/blog/best-local-tts-models)
- [Best models for voice cloning (SiliconFlow)](https://www.siliconflow.com/articles/en/best-open-source-models-for-voice-cloning)
- [Best TTS for Voice Cloning — quality, data, ethics (CodeSOTA)](https://www.codesota.com/speech/best-for-voice-cloning)
- [Open-source TTS overview (BentoML)](https://www.bentoml.com/blog/exploring-the-world-of-open-source-text-to-speech-models)
- [8 Best Open Source Lip-Sync Models 2026 (Pixazo)](https://www.pixazo.ai/blog/best-open-source-lip-sync-models)
- [LiveAvatar — real-time streaming avatars, ECCV 2026 (GitHub)](https://github.com/Alibaba-Quark/LiveAvatar)
- [Awesome Talking-Head Synthesis (GitHub)](https://github.com/Kedreamix/Awesome-Talking-Head-Synthesis)
