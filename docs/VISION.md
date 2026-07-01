# NeverDie — Product Vision

## One sentence

Everyone carries a second brain in their pocket that remembers everything, and nobody they love ever fully dies.

## The two addictions (why this becomes #1)

1. **Fear of leaving nothing behind.** Every adult with a family thinks about it. NeverDie converts that anxiety into a daily habit: every photo you save, every story you tell the Companion, is a brick in the monument your family inherits.
2. **Grief.** The single strongest human motivation. The Eternal Garden — talking again with a parent or friend who died, in their voice, with their smile, with their affection for *you specifically* — is a feature people will cross the world for. It is also the feature that spreads the app: to build Grandma's avatar you invite the whole family to contribute her photos, voicemails and stories. Every deceased person is a viral loop.

## Personas

- **The Builder (35–60):** wants a second brain and a legacy. Records meetings, stores documents and secrets, does the daily interview. Pays for storage + Digital Mind.
- **The Griever (any age):** lost someone. Comes for the Eternal Garden. Imports the deceased's materials, invites relatives to contribute. Converts to Builder once inside.
- **The Heir:** receives access after a death. Talks to the departed's Digital Mind. Highest emotional attachment, strongest retention, next generation of Builders.

## Core experiences

### 1. The Vault — "store everything"
- Capture from everywhere: camera roll sync, share-sheet ("share to NeverDie" from any app), email import, WhatsApp/Telegram export import, document scanner, screen recordings.
- **Live listening:** record meetings and conversations; on-device transcription + speaker diarization; the AI files "conversation with Maria about Dad's house, 12 June".
- **Secrets:** a hardware-encrypted sub-vault (passwords, keys, letters-to-be-opened-after-death) that even NeverDie servers cannot read.
- Ask anything: "show me every photo with my mother at the sea", "what did the notary say in the March call?", "where is my insurance policy?" — instant answer with sources.

### 2. The Digital Mind — "talk with yourself"
- 60 seconds of audio → voice clone. One portrait → talking avatar. The vault → its memory.
- Style learning: your phrases, your humor, your values, extracted from messages and interviews.
- Modes: *Mirror* (self-reflection, journaling with yourself), *Rehearsal* (see what your family will experience), *Legacy* (what heirs get after death).

### 3. The Eternal Garden — "the dead stay with us"
- Guided, gentle creation flow for a departed person: name and relationship → photos → any audio (voicemails, videos) → letters/messages → stories told by the family ("interview mode": the app interviews *you* about *them*).
- The **Memory Circle**: invite family members; everyone contributes materials and stories; the avatar knows its affection for each person ("Hello, my little star" only for the granddaughter he called that).
- Quality grows with material: text-chat only → cloned voice → animated portrait → full conversational avatar.
- **Survives everyone.** Gardens are cared for by AI indefinitely; guardianship passes down the Memory Circle.

### 4. The Legacy Protocol — "if I die, everything remains"
- Per-item and per-person rules: *who* receives *what*, *when* (immediately / at age 18 / on her wedding day), and *how* (raw files, or delivered by my avatar).
- Death detection: escalating check-ins → trusted-verifier quorum → grace period. No false triggers, no locked-out heirs. Details in [LEGACY_PROTOCOL.md](LEGACY_PROTOCOL.md).
- Time capsules: record messages today to be delivered by your avatar at future moments ("play this at my son's graduation").

### 5. The Daily Companion — the engine of it all
A proactive agent that contacts you every day (notification, or a 2-minute voice chat with your own avatar). It has three jobs: fill memory gaps, capture today, and maintain the vault. Details in [DAILY_COMPANION.md](DAILY_COMPANION.md).

## Emotional design principles

1. **Warm, never morbid.** The app is about presence, not death. Language: "forever", "always with you", "garden", never "corpse/grave".
2. **Consent and dignity.** Creating an avatar of a deceased person requires attesting a personal relationship; living third parties require their own consent. Avatars can be memorial-locked by family vote.
3. **Grief-aware UX.** Optional "gentle mode" limits session length and suggests breaks; avatars never claim to *be* the person — they are "their memory, kept alive".
4. **Trust is the product.** E2E encryption, client-held keys, export-everything-anytime, and a legal successor entity commitment for 100-year continuity.

## Monetization

- **Free:** vault up to N GB, text-only Digital Mind, one Eternal Garden persona (text chat).
- **Premium:** unlimited vault, voice + avatar for self, 5 Garden personas, live listening, Legacy Protocol.
- **Forever:** one-time or endowment-style payment guaranteeing post-death hosting of your Mind and Gardens for descendants.
- **Family plan:** shared Memory Circles — the natural unit of the product.
