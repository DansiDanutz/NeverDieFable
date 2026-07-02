-- Vault storage (applied to the live project 2026-07-02).
-- Private bucket for vault blobs (client-encrypted at Phase-1 crypto rollout).
insert into storage.buckets (id, name, public)
values ('neverdie-vault', 'neverdie-vault', false)
on conflict (id) do nothing;

-- Single-user phase helper: the sole account owns ingested items until real
-- auth is wired into the API. security definer because service_role cannot
-- read auth.users directly; anon/public execution is revoked.
create or replace function neverdie.default_owner()
returns uuid language sql stable
security definer
set search_path = neverdie, pg_temp
as $$ select id from auth.users order by created_at limit 1 $$;
revoke execute on function neverdie.default_owner() from anon, public;
grant execute on function neverdie.default_owner() to service_role;

-- Function grants for the schema (search_memory et al).
grant execute on all functions in schema neverdie to authenticated, service_role;
alter default privileges in schema neverdie grant execute on functions to authenticated, service_role;
