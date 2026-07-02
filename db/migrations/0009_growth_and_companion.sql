-- Memory growth + daily companion (applied to the live project 2026-07-02).
-- add_memory: interactions/answers/files become memory_chunk rows (embedding
--   NULL so the embed job picks them up) — the brain grows every day it's used.
-- corpus_stats: powers the Memory Completeness score.
-- companion_add/today/answered: the daily question queue.
create or replace function neverdie.add_memory(
    p_owner uuid, p_person uuid, p_text text, p_source text, p_kind text default 'interaction')
returns uuid language plpgsql set search_path = neverdie, public, extensions, pg_temp
as $$
declare new_id uuid;
begin
  insert into neverdie.memory_chunk (owner_id, person_id, text_enc, chunk_meta)
  values (p_owner, p_person, convert_to(p_text, 'UTF8'),
          jsonb_build_object('source', p_source, 'kind', p_kind))
  returning id into new_id;
  return new_id;
end $$;

create or replace function neverdie.corpus_stats(p_owner uuid, p_person uuid default null)
returns table(total bigint, embedded bigint)
language sql stable set search_path = neverdie, public, extensions, pg_temp
as $$
  select count(*), count(*) filter (where embedding is not null)
  from neverdie.memory_chunk
  where owner_id = p_owner
    and ((p_person is null and person_id is null) or person_id = p_person);
$$;

create or replace function neverdie.companion_add(
    p_owner uuid, p_circle uuid, p_gap_kind text, p_gap jsonb, p_question text, p_priority real)
returns uuid language plpgsql set search_path = neverdie, public, extensions, pg_temp
as $$
declare new_id uuid;
begin
  insert into neverdie.companion_question (owner_id, circle_id, gap_kind, gap_ref, question, priority)
  values (p_owner, p_circle, p_gap_kind, coalesce(p_gap,'{}'::jsonb), p_question, p_priority)
  returning id into new_id;
  return new_id;
end $$;

create or replace function neverdie.companion_today(p_owner uuid, p_limit int default 3)
returns table(id uuid, question text, gap_kind text, gap_ref jsonb, priority real)
language sql stable set search_path = neverdie, public, extensions, pg_temp
as $$
  select id, question, gap_kind, gap_ref, priority
  from neverdie.companion_question
  where owner_id = p_owner and status = 'pending'
  order by priority desc, created_at limit p_limit;
$$;

create or replace function neverdie.companion_answered(p_question uuid, p_answer_item uuid)
returns void language sql set search_path = neverdie, public, extensions, pg_temp
as $$
  update neverdie.companion_question set status='answered', answer_item=p_answer_item
   where id = p_question;
$$;

grant execute on function neverdie.add_memory(uuid, uuid, text, text, text) to service_role;
grant execute on function neverdie.corpus_stats(uuid, uuid) to service_role, authenticated;
grant execute on function neverdie.companion_add(uuid, uuid, text, jsonb, text, real) to service_role;
grant execute on function neverdie.companion_today(uuid, int) to service_role, authenticated;
grant execute on function neverdie.companion_answered(uuid, uuid) to service_role;
