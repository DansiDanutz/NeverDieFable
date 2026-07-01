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

## Rule of thumb

Port **ideas and assets**, not architecture. Anything that duplicates a pillar in this repo (vault, mind, garden, legacy, companion) should be treated as a reference implementation to mine, then archived. Archive both old repos (GitHub → Settings → Archive) once harvested so there is exactly one source of truth.
