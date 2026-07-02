-- Full-text search over memory chunks until the embedding pipeline lands
-- (applied to the live project 2026-07-02).
-- NOTE: search_tsv indexes plaintext-era content and is DROPPED at the Phase-1
-- client-side-crypto rollout (replaced by client-held search indexes).
alter table neverdie.memory_chunk add column if not exists search_tsv tsvector;

update neverdie.memory_chunk
set search_tsv = to_tsvector('simple', left(convert_from(text_enc, 'UTF8'), 100000))
where search_tsv is null;

create index if not exists memory_search_idx
  on neverdie.memory_chunk using gin (search_tsv);

create or replace function neverdie.memory_chunk_tsv()
returns trigger language plpgsql
set search_path = neverdie, pg_temp
as $$
begin
  new.search_tsv := to_tsvector('simple', left(convert_from(new.text_enc, 'UTF8'), 100000));
  return new;
end $$;

drop trigger if exists memory_chunk_tsv_trg on neverdie.memory_chunk;
create trigger memory_chunk_tsv_trg
  before insert or update of text_enc on neverdie.memory_chunk
  for each row execute function neverdie.memory_chunk_tsv();

-- RPC used by the backend: rank-ordered keyword retrieval, scoped to a persona
-- corpus (p_person null = the self corpus).
create or replace function neverdie.search_memory(q text, p_person uuid default null, k int default 12)
returns table(id uuid, content text, meta jsonb, rank real)
language sql stable
set search_path = neverdie, pg_temp
as $$
  select mc.id,
         convert_from(mc.text_enc, 'UTF8'),
         mc.chunk_meta,
         ts_rank(mc.search_tsv, websearch_to_tsquery('simple', q))::real
  from neverdie.memory_chunk mc
  where mc.search_tsv @@ websearch_to_tsquery('simple', q)
    and ((p_person is null and mc.person_id is null) or mc.person_id = p_person)
  order by 4 desc
  limit k;
$$;
