# Migrations

These are the exact migrations applied to the live Supabase project
(schema `neverdie`, isolated from the other apps sharing that database).

| Order | File | What |
|---|---|---|
| 1 | `0001_enable_pgvector.sql` | Enables the `vector` extension for semantic memory |
| 2 | `0002_core_schema.sql` | The full `neverdie` schema: people, vault, memory graph, personas, circles, legacy protocol, companion |
| 3 | `0003_rls_policies.sql` | Enables Row Level Security with owner-scoped policies on every table |
| 4 | `0004_backfill_from_nd.sql` | Ports the earlier work: `nd_avatars` ("Eva") → person + persona + card + memory circle; `chat_history` → 92,446 `memory_chunk` rows |
| 5 | `0005_expose_schema.sql` | Grants for `authenticated`/`service_role`, exposes `neverdie` to PostgREST (`anon` gets usage only; RLS guards every row) |
| 6 | `0006_fts_search.sql` | Full-text search: `search_tsv` + GIN index + trigger on `memory_chunk`, and the `search_memory(q, person, k)` RPC the backend uses until embeddings land |
| 7 | `0007_vault_storage.sql` | Private `neverdie-vault` storage bucket, `default_owner()` helper (security definer), function grants |
| 8 | `0008_embedding_functions.sql` | Semantic memory: `chunks_without_embedding`, `set_embeddings`, and `search_memory_vec` (pgvector cosine) — powers the embedding backfill and vector retrieval |
| 9 | `0009_growth_and_companion.sql` | Memory growth (`add_memory`, `corpus_stats`) + daily companion queue (`companion_add/today/answered`) — the loop that grows the brain every day |

`db/schema.sql` is the human-readable, schema-qualified reference for the same
model. Apply migrations in order; all are idempotent where practical.
All eight are **applied to the live project** as of 2026-07-02.

**Existing data:** the project already had an `nd_avatars`/`nd_memories`
avatar model and 94k rows of `chat_history` from earlier work. Those tables are
left untouched; 0004 *copies* them into the new model (mapping documented in
docs/CONSOLIDATION.md). Backfilled `memory_chunk.embedding` stays NULL until
the BGE-M3 embedding job runs (Phase 1 of docs/ROADMAP.md).
