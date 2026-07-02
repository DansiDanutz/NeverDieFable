# Migrations

These are the exact migrations applied to the live Supabase project
(schema `neverdie`, isolated from the other apps sharing that database).

| Order | File | What |
|---|---|---|
| 1 | `0001_enable_pgvector.sql` | Enables the `vector` extension for semantic memory |
| 2 | `0002_core_schema.sql` | The full `neverdie` schema: people, vault, memory graph, personas, circles, legacy protocol, companion |
| 3 | `0003_rls_policies.sql` | Enables Row Level Security with owner-scoped policies on every table |

`db/schema.sql` is the human-readable, schema-qualified reference for the same
model. Apply migrations in order; all are idempotent where practical.

**Existing data:** the project already had an `nd_avatars`/`nd_memories`
avatar model and 94k rows of `chat_history` from earlier work. Those are left
untouched. A future `0004_backfill_from_nd.sql` can migrate `nd_avatars` →
`neverdie.person` + `neverdie.persona` when ready (mapping documented in
docs/CONSOLIDATION.md).
