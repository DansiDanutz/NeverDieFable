# Data Model

Full DDL in [`db/schema.sql`](../db/schema.sql). The graph below is the mental model.

```
User ──owns──> VaultItem ──about──> Person
  │                │                   │
  │                └─derived─> MemoryChunk (embedding) ──cites──> answers
  │                                    │
  ├──creates──> Persona (self | departed) ──has──> PersonaCard vN
  │                │                                VoicePrint · AvatarRig
  │                └──scoped to── corpus (MemoryChunks of that Person)
  │
  ├──defines──> LegacyRule (item/collection → heir, trigger, delivery mode)
  ├──joins────> MemoryCircle (per departed Person: contributors + guardians)
  └──has──────> LegacyState (check-ins, verifiers, protocol stage)
```

## Core entities

- **VaultItem** — anything stored: `photo · video · audio · voice_note · message_thread · email · document · secret · recording(live) · story(companion answer) · time_capsule`. Carries encrypted blob ref, capture time, source app, and processing status.
- **Person** — a human in the user's life (living or departed, app user or not). Face-print & voice-print refs enable auto-tagging. `is_departed`, `died_on`.
- **MemoryChunk** — retrieval unit derived from items (transcript segment, OCR block, caption, story paragraph) with `embedding vector(1024)`, links to item + persons + event.
- **Event / Place / Topic** — graph nodes for timeline and thematic browsing.
- **Persona** — a conversational being. `kind: self | departed`. Points to VoicePrint, AvatarRig, current PersonaCard, and its corpus scope.
- **PersonaCard** — versioned distillation: tone, lexicon, values, humor, biography facts, **affection map** (per-relationship greetings/nicknames/register), taboo list, provenance stats.
- **MemoryCircle** — the group around a departed Persona: `contributor` (adds material), `guardian` (moderates, can memorial-lock), `listener` (can converse). Guardianship auto-passes down on a guardian's death.
- **LegacyRule** — `what` (item, collection, secret, persona access) → `whom` (person/circle) → `when` (on_death | date | heir_age | manual by executor) → `how` (raw files | delivered_by_avatar | time_capsule playback).
- **LegacyState** — per-user protocol machine: check-in cadence, verifier set + quorum, current stage (`active → unreachable → verification → grace → unsealed`), audit log.
- **CompanionThread** — the daily agent's queue: generated questions (with the memory gap that produced them), answers (which become `story` VaultItems), streaks.

## Storage & encryption columns

Every VaultItem: `blob_key` (S3), `content_key_wrapped` (item key wrapped by user master key), `envelope_text` (encrypted derived text), `sensitivity: normal | private | secret` (secrets never leave client-side encryption, are excluded from RAG unless explicitly unlocked, and surface only through LegacyRules).
