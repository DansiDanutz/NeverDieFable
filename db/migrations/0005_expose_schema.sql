-- Make the neverdie schema reachable through the Supabase API (applied 2026-07-02).
-- RLS policies remain the actual guard on every row; anon gets no table grants.
grant usage on schema neverdie to anon, authenticated, service_role;
grant all on all tables in schema neverdie to authenticated, service_role;
grant all on all sequences in schema neverdie to authenticated, service_role;
alter default privileges in schema neverdie grant all on tables to authenticated, service_role;
alter default privileges in schema neverdie grant all on sequences to authenticated, service_role;

alter role authenticator set pgrst.db_schemas = 'public, graphql_public, neverdie';
notify pgrst, 'reload config';
