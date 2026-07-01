# Roadmap

## Phase 0 — Foundation ✅ (this repository)
Product vision, architecture, data model, legacy protocol design, tech-stack selection (licensed for commercial use), DB schema, FastAPI skeleton with AI adapter seams, Expo app scaffold with all core screens.

## Phase 1 — The Vault (MVP, ~8 weeks)
The second brain must be genuinely useful *before* any death-related feature.
- Auth (passkeys), E2E encryption, photo/document/voice-note capture, share-sheet import.
- Ingest pipeline v1: Whisper transcription, OCR, face clustering, embeddings.
- **Ask Anything** search with cited answers.
- Daily Companion v1 (text questions, gap engine for faces/dates).
- Live listening v1: record + on-device transcribe + auto-filing of meetings.

## Phase 2 — The Digital Mind (~6 weeks)
- Voice-print creation (Fish Speech) from 60 s guided reading + companion answers.
- Portrait avatar (LivePortrait idle loop + viseme playback).
- Persona Card compiler v1 (style from messages + interviews).
- Mirror mode chat (talk with yourself, voice in/voice out).

## Phase 3 — The Eternal Garden (~8 weeks) — the flagship
- Guided departed-persona creation flow (photos → audio → letters → interview mode).
- Memory Circle: invitations, contributions, guardianship, family governance.
- Voice isolation from mixed recordings (pyannote) for the departed's voice-print.
- Progressive persona quality tiers; grief-safety guardrails; memorial lock.

## Phase 4 — The Legacy Protocol (~6 weeks)
- Check-ins, verifier quorum, grace period state machine, coercion PIN.
- Shamir key escrow; LegacyRules editor; avatar delivery of inherited items; time capsules.
- Executor role; audit log; export format v1.

## Phase 5 — Scale & wow (v2)
- **LiveAvatar real-time video conversations** with any persona.
- Email/WhatsApp/Google Photos bulk importers; desktop companion.
- Memorial films (Hallo2 long-form renders); family tree view across Gardens.
- On-prem/self-host tier (Llama persona LLM); Forever endowment tier; 100-year continuity foundation.

## North-star metrics
- DAU/MAU driven by Companion streaks; Memory Completeness per persona; Gardens per family (viral coefficient); Legacy Protocol activation rate; and the one that matters: **heirs still talking to their people a year after the funeral.**
