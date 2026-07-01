# System Architecture

```
┌─────────────────────────── PHONE (Expo React Native) ───────────────────────────┐
│  Capture layer          Vault UI         Chat/Avatar UI        Legacy UI        │
│  camera·mic·share-sheet  timeline/search  voice+face playback   rules editor    │
│  live-listening (whisper.cpp on-device)   local SQLite cache    check-ins       │
│  crypto: libsodium — master key in Secure Enclave / Keystore                    │
└──────────────┬────────────────────────────────────────────┬─────────────────────┘
               │ E2E-encrypted blobs + metadata             │ streaming chat (WS)
┌──────────────▼──────────────── BACKEND (FastAPI) ─────────▼─────────────────────┐
│  /vault  /people  /memories  /personas  /chat  /legacy  /companion  /circle     │
│  AuthN (Supabase) · rules engine · Legacy Protocol state machine · job queue    │
└───────┬───────────────────────┬──────────────────────────┬──────────────────────┘
        │                       │                          │
┌───────▼───────┐   ┌───────────▼───────────┐   ┌──────────▼───────────────────────┐
│ Postgres      │   │ S3 blob store         │   │ AI PIPELINE (GPU workers)        │
│ + pgvector    │   │ (client-encrypted)    │   │ ingest: whisper·pyannote·OCR·CLIP│
│ entities,     │   │ originals + renders   │   │ voice:  Fish Speech / Chatterbox │
│ embeddings,   │   └───────────────────────┘   │ avatar: LivePortrait·EchoMimicV3 │
│ graph, rules  │                               │ mind:   RAG + Persona Card + LLM │
└───────────────┘                               └──────────────────────────────────┘
```

## Key flows

### Ingest (everything → organized memory)
1. Client encrypts blob, uploads; posts metadata + a *derived-text envelope* (transcript/OCR/caption produced on-device when possible).
2. Pipeline workers: transcribe (Whisper) → diarize (pyannote) → extract faces/objects (InsightFace/SigLIP) → OCR → chunk → embed (BGE-M3) → link into the **memory graph** (item ↔ person ↔ event ↔ place ↔ topic).
3. Anything ambiguous becomes a **Companion question** ("Who is this?" / "When was this taken?") — humans resolve what AI cannot.

### Ask anything
Query → hybrid retrieval (vector + BM25 + graph expansion) → rerank → answer with citations → optionally spoken by your own avatar. Same engine powers self-chat, heir-chat, and Garden personas — only the Persona Card and permission scope change.

### Persona build (self or deceased)
Materials → voice-print (Fish Speech) → portrait rig (LivePortrait idle loop + viseme bank) → style distillation into **Persona Card v N** → conversational persona = Persona Card + scoped RAG over that person's corpus + guardrails (never claims to be alive; per-listener affection map).

### Live conversation
Text/voice in → ASR → persona LLM (streaming) → sentence-chunked TTS (Chatterbox) → viseme-driven avatar playback on device (pre-rendered banks make it feel instant); full-render replies (EchoMimicV3) delivered async for "video message" moments.

### Death → Legacy (see LEGACY_PROTOCOL.md)
Missed check-ins → verifier quorum → grace period → estate unsealed per rules → heirs' Shamir shares reconstruct the vault keys → personas switch to Legacy mode → Gardens' guardianship transfers.

## Design decisions

- **On-device first for raw audio/video of live listening** — only encrypted transcripts sync by default; raw audio sync is opt-in. This is both a privacy stance and a bandwidth/cost win.
- **One memory engine, many masks.** Self-mind, heir-view, and Garden personas are the same RAG + Persona Card machinery with different corpora and permission scopes — no duplicated pipelines.
- **Pre-render + stream hybrid for avatars.** Real-time full-video generation is still GPU-expensive; viseme banks give sub-second perceived latency today, LiveAvatar upgrades this in v2 without changing the client contract.
- **Everything is swappable.** Voice/avatar/LLM engines sit behind thin adapters in `services/ai/` — model churn in this space is fast and licenses change.
