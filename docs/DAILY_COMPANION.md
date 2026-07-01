# The Daily Companion

The proactive agent that makes NeverDie a *daily habit* and makes the memory graph *complete*. It contacts the user every day and has exactly three jobs.

## Job 1 — Fill the gaps (curiosity engine)

The ingest pipeline emits **gap records** whenever AI confidence is low:

- unidentified face in a photo → "Who is standing next to you here?"
- unlabeled voice in a recording → "Is this your brother Dan?"
- orphan document → "Is this contract still important? Where does it belong?"
- sparse period in the timeline → "You have almost nothing from 1998–2002. Tell me about those years?"
- thin persona corpus → "Tell me a story about how your father laughed." (for Garden personas, questions go to the whole Memory Circle)

Questions are ranked by **emotional value × graph impact × freshness**, throttled to a few per day, and asked at the user's preferred moment. Every answer becomes a `story` VaultItem — transcribed, embedded, linked. Answering by voice doubles as ongoing voice-print training.

## Job 2 — Capture today

A 2-minute evening exchange (text or a voice chat with your own avatar): "How was today? Anything worth keeping?" — plus smart prompts from context (calendar events, new photos, detected meeting recordings: "Should I file today's call with the notary under *Dad's house*?").

## Job 3 — Maintain the vault

Weekly housekeeping proposals, never silent actions: duplicate clusters to merge, screenshots that look disposable, expiring documents detected by OCR ("passport expires in 3 months"), storage suggestions, and a **Legacy health check** ("Your daughter turned 18 — the birthday rule delivered. Do you want to add a new one?", "Verifier Maria hasn't opened the app in a year — replace her?").

## Interaction contract

- **One notification per day max** by default; user tunes cadence, time, and channel (push / avatar call / silent inbox).
- Streaks and a **Memory Completeness score** per person ("Your mother's garden is 68% — 3 stories and 1 voicemail would unlock her voice") drive the habit loop without dark patterns: everything is skippable, snoozable, and the score never shames.
- Grief-aware: questions about departed people arrive gently, are rate-limited, and stop instantly on "not today".

## Implementation

`CompanionThread` table (see DATA_MODEL.md) + a nightly job: scan gap records → generate candidate questions (LLM with the gap + graph context) → rank → schedule. The chat surface is the same persona chat UI pointed at the "Companion" system persona.
