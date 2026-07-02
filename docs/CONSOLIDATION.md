# Consolidation: DigitalMind + NeverDie → NeverDieFable

This repository is the single home for the product going forward. It was designed to absorb the two predecessor repositories:

- `DansiDanutz/DigitalMind` — the "second brain / AI twin" line of work
- `DansiDanutz/NeverDie` — the "legacy / life vault" line of work

> **Status:** this build session had GitHub access scoped to `NeverDieFable` only, so the predecessor code could not be read or copied here. The foundation was therefore built fresh — which is also the recommendation: both concepts are redesigned here as one coherent system (see ARCHITECTURE.md) rather than two glued apps. What follows is the checklist for harvesting anything still valuable from the old repos.

## How to migrate

```bash
git clone https://github.com/DansiDanutz/DigitalMind
git clone https://github.com/DansiDanutz/NeverDie
```

Then review each against this map:

| If the old repo has… | Bring it into… |
|---|---|
| Persona / prompt engineering for the AI twin | `services/ai/persona.py` — merge into the Persona Card compiler |
| Voice cloning experiments or model configs | `services/ai/voice.py` — keep only engines compatible with TECH_STACK.md licenses |
| Avatar / talking-head experiments | `services/ai/avatar.py` |
| Chat memory / RAG code | `services/ai/memory.py` — Postgres+pgvector is the target store |
| Any UI screens or design assets worth keeping | `apps/mobile/src/` — restyle to `src/theme` |
| Storage / vault schemas | reconcile with `db/schema.sql` (this schema wins; port data, not structure) |
| API keys, .env files | **do not commit** — move values to your secret manager |
| Docs, notes, brand assets, domain ideas | `docs/legacy-notes/` |

## Live database discovery (the real backend was in Supabase)

The GitHub repos were unreachable, but the actual backend of the earlier work
turned out to live in the shared Supabase project **"Memory"**
(`gvuuauzsucvhghmpdpxf`). It already contained:

- **`nd_avatars`** — the deceased-person digital mind: `name, relationship,
  birth_date, death_date, bio, personality_traits, speaking_style,
  system_prompt, voice_id, avatar_image_url, avatar_3d_url, llm_provider/model`.
  Plus `nd_memories, nd_media, nd_conversations, nd_messages`.
- A second, older model: `memories, entities, contacts, conversations,
  messages, categories` (phone-number `users`).
- A voice layer: `voice_settings` (browser/ElevenLabs), `conversation_recordings`
  (transcript + participants + follow-up questions), `voice_interactions`.
- `chat_history` — **94,530 rows**, the real corpus.
- No pgvector; no legacy/inheritance; no memory circles; no companion queue.

**What was done:** the full consolidated model was applied to the same project
in an isolated `neverdie` schema (see `db/migrations/`), with pgvector enabled
and RLS locked down — **without touching** any existing table or the 94k rows.

**Mapping to port existing data (future `0004_backfill_from_nd.sql`):**

| Existing | → | New (`neverdie.*`) |
|---|---|---|
| `nd_avatars` (a departed person) | → | one `person` (is_departed, died_on, born_on) + one `persona` (kind=departed, voice_model_ref=voice_id) + `persona_card` (personality_traits, speaking_style, system_prompt) |
| `nd_memories` | → | `vault_item` (+ derived `memory_chunk`) |
| `nd_media` | → | `vault_item` (photo/video) + `item_person` |
| `nd_conversations` / `nd_messages` | → | `chat_message` |
| `conversation_recordings` | → | `vault_item` (kind=recording) + `memory_chunk` from transcript |
| `chat_history` (94k) | → | `memory_chunk` corpus for the self-persona (biggest single win) |
| `relationship_events` | → | `companion_question` seeds + `legacy_rule` dates |

## Rule of thumb

Port **ideas and assets**, not architecture. Anything that duplicates a pillar in this repo (vault, mind, garden, legacy, companion) should be treated as a reference implementation to mine, then archived. Archive both old repos (GitHub → Settings → Archive) once harvested so there is exactly one source of truth.
