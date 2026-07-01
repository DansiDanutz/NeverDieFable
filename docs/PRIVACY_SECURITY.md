# Privacy, Security & Ethics

NeverDie stores the most intimate data a person has, forever, across their death. Trust is not a feature — it is the product.

## Encryption model

- **Client-held master key**, generated on-device, stored in Secure Enclave / Android Keystore, backed up via the Shamir shares of the Legacy Protocol (never by the server alone).
- **Per-item content keys** (AES-256-GCM), wrapped by the master key. Blobs are encrypted before upload; the server stores ciphertext + minimal routing metadata.
- **Derived text** (transcripts, OCR, captions) is also encrypted; the RAG index stores embeddings computed client-side or in a short-lived processing enclave with immediate plaintext disposal — embeddings, not plaintext, live server-side.
- **Secrets tier:** never processed by AI, never indexed, never leaves client-side encryption. Surfaces only via LegacyRules or explicit unlock.
- Live-listening raw audio stays **on-device** by default (whisper.cpp local transcription); cloud sync of raw audio is per-recording opt-in.

## Consent & ethics (the Garden rules)

1. **Departed personas:** creator attests a personal relationship and death; any Memory Circle guardian can contest, memorial-lock, or request deletion. Family-vote governance for disputes.
2. **Living third parties** appearing in the vault are fine (it's the user's own memory), but creating a *conversational persona of a living person* requires that person's in-app consent. No exceptions.
3. **No identity fraud:** avatars always self-identify as digital memories on first contact per listener; cloned voices are watermarked (Chatterbox watermarking + our provenance tags); export of raw cloned-voice models is blocked.
4. **Children:** heir access rules support age gates; a minor's own vault requires guardian setup.
5. **Right to be forgotten — even in death:** users can pre-sign deletion ("shred everything if X"), and legal heirs can request estate deletion through a verified process.

## Grief safety

- Avatars never claim to be alive, never make new promises on behalf of the dead, never advise on money/medical/legal matters, and encourage remembrance over dependence (session nudges, optional gentle mode co-designed with grief counselors).
- Conversation content with a departed persona is private to each listener by default — a granddaughter's chats with Grandpa are hers.

## Platform security

- Supabase Auth + passkeys; device binding; per-device revocation.
- Row-level security on every table (`user_id` scoping; circle-scoped read grants).
- Full audit log on legacy-relevant actions (rule edits, verifier changes, protocol stage transitions) — immutable, heir-visible after unseal.
- Compliance path: GDPR (incl. post-mortem data provisions), CCPA, and jurisdiction-specific digital-inheritance law review before launch.
