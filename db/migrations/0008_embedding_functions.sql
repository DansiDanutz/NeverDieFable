-- Semantic memory functions (applied to the live project 2026-07-02).
-- Requires the pgvector `vector` type; search_path includes public/extensions
-- so the type resolves inside SECURITY-safe function bodies.

create or replace function neverdie.chunks_without_embedding(p_person uuid default null, lim int default 500)
returns table(id uuid, content text)
language sql stable set search_path = neverdie, public, extensions, pg_temp
as $$
  select mc.id, convert_from(mc.text_enc, 'UTF8')
  from neverdie.memory_chunk mc
  where mc.embedding is null
    and ((p_person is null and mc.person_id is null) or mc.person_id = p_person)
  limit lim;
$$;

create or replace function neverdie.set_embeddings(items jsonb)
returns int language plpgsql set search_path = neverdie, public, extensions, pg_temp
as $$
declare r jsonb; n int := 0;
begin
  for r in select * from jsonb_array_elements(items) loop
    update neverdie.memory_chunk set embedding = (r->>'emb')::vector
     where id = (r->>'id')::uuid;
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function neverdie.search_memory_vec(q text, p_person uuid default null, k int default 8)
returns table(id uuid, content text, meta jsonb, score real)
language sql stable set search_path = neverdie, public, extensions, pg_temp
as $$
  select mc.id, convert_from(mc.text_enc, 'UTF8'), mc.chunk_meta,
         (1 - (mc.embedding <=> q::vector))::real
  from neverdie.memory_chunk mc
  where mc.embedding is not null
    and ((p_person is null and mc.person_id is null) or mc.person_id = p_person)
  order by mc.embedding <=> q::vector
  limit k;
$$;

grant execute on function neverdie.chunks_without_embedding(uuid, int) to service_role;
grant execute on function neverdie.set_embeddings(jsonb) to service_role;
grant execute on function neverdie.search_memory_vec(text, uuid, int) to service_role, authenticated;
