# NeverDie — Your Second Brain. Your Forever Voice.

**NeverDie** is a personal memory vault and digital-immortality app. It stores *everything* a person wants to keep — photos, messages, emails, documents, secrets, voice notes, live conversations and meetings — organizes it with AI, and turns it into a living **Digital Mind**: a clone of your voice, your face, and your way of thinking.

While you live, it is your **second brain** — ask it anything, it answers from your own life.
When you die, it becomes your **legacy** — your family keeps talking to *you*.
And for the people you have already lost, NeverDie lets you **bring them back as digital avatars**, built from their photos, voices, letters and memories — kept alive forever, even after you are gone.

> This repository consolidates and supersedes the earlier `DansiDanutz/DigitalMind` and `DansiDanutz/NeverDie` repositories. See [docs/CONSOLIDATION.md](docs/CONSOLIDATION.md) for the migration map.

---

## The Four Pillars

| Pillar | What it is |
|---|---|
| 🗄️ **The Vault** | End-to-end-encrypted storage for everything: images, messages, emails, documents, secrets, voice memos, live meeting recordings. Auto-organized by AI into people, places, topics and a life timeline. |
| 🧠 **The Digital Mind** | Your AI twin. Cloned voice + talking avatar + a memory engine trained on your vault. You talk with *yourself*; after death, your family talks with you. |
| 🌳 **The Eternal Garden** | Avatars for people who already died. Import their photos, voice recordings, letters and stories; NeverDie rebuilds their voice, face, style and affection. They stay alive after *you* die too — managed forever by AI. |
| 🕊️ **The Legacy Protocol** | Death detection (check-ins + trusted verifiers), per-person inheritance rules ("my daughter gets these letters, my son gets the business documents"), and post-death continuity of every avatar. |

Plus the glue that makes it all work: the **Daily Companion** — a proactive agent that talks to you every day, asks the questions that fill the gaps in your memory graph ("Who is the woman next to you in yesterday's photo?", "Tell me the story of this letter from your father"), and keeps the whole vault perfectly organized.

## Documentation

| Doc | Contents |
|---|---|
| [docs/VISION.md](docs/VISION.md) | Full product vision, personas, emotional design, monetization |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture: mobile, backend, AI pipeline, storage |
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | Chosen open-source models for voice cloning, avatars, ASR, RAG — with licenses |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Entities: vault items, people, memories, personas, legacy rules |
| [docs/LEGACY_PROTOCOL.md](docs/LEGACY_PROTOCOL.md) | Death verification, key escrow (Shamir), inheritance distribution |
| [docs/DAILY_COMPANION.md](docs/DAILY_COMPANION.md) | The proactive daily agent: question engine, memory-gap detection |
| [docs/PRIVACY_SECURITY.md](docs/PRIVACY_SECURITY.md) | E2E encryption, client-held keys, secrets vault, consent & ethics |
| [docs/CONSOLIDATION.md](docs/CONSOLIDATION.md) | What to carry over from DigitalMind + NeverDie repos |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phased build plan from MVP to v3 |

## Repository layout

```
apps/mobile/        Expo React Native app (iOS + Android) — the product
services/api/       FastAPI backend — vault, people, personas, chat, legacy
services/ai/        AI pipeline — voice cloning, avatar rendering, transcription, memory RAG
db/schema.sql       PostgreSQL schema (Supabase-ready, pgvector)
docs/               Product & engineering documentation
```

## Quick start

```bash
# Backend
cd services/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Mobile
cd apps/mobile
npm install
npx expo start
```

## Status

Foundation release: full product plan, database schema, backend API skeleton with AI-pipeline integration points, and the mobile app scaffold (all core screens). See [docs/ROADMAP.md](docs/ROADMAP.md) for what ships next.
