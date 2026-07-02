-- 0012_memory_circle.sql
-- The Memory Circle — the family gathers around a departed loved one's garden.
--
-- 0002 already created `memory_circle` (one circle per departed persona) and the
-- `circle_role` enum. This migration adds the *viral family loop* on top:
--   • `circle_invite`      — shareable, expiring tokens the owner hands to family
--   • `circle_contributor` — a family member who joined by token (no auth account
--                            needed; identified by a display name, not auth.uid())
-- and the RPCs the backend calls so everyone's stories/photos/voices grow the
-- SAME person's corpus — the loved one can then recall a memory contributed by a
-- cousin who lives on the other side of the world.
--
-- Idempotent. Applied to the live project (schema `neverdie`) as of 2026-07-02.

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists neverdie.circle_invite (
  token       text primary key default encode(gen_random_bytes(6), 'hex'),
  circle_id   uuid not null references neverdie.memory_circle(id) on delete cascade,
  role        neverdie.circle_role not null default 'contributor',
  created_at  timestamptz not null default now(),
  expires_at  timestamptz            -- null = never expires; RPC sets +30 days
);

create table if not exists neverdie.circle_contributor (
  id            uuid primary key default gen_random_uuid(),
  circle_id     uuid not null references neverdie.memory_circle(id) on delete cascade,
  display_name  text not null,       -- how family signs their memories ("Cristina")
  role          neverdie.circle_role not null default 'contributor',
  joined_at     timestamptz not null default now(),
  contributions int not null default 0
);

create index if not exists circle_invite_circle_idx
  on neverdie.circle_invite(circle_id);
create index if not exists circle_contributor_circle_idx
  on neverdie.circle_contributor(circle_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Both tables are reached only through security-definer RPCs (below) invoked with
-- the service key. Enable RLS with owner-scoped policies so that, should a client
-- ever query directly, only the circle's creator can see its invites/members.

alter table neverdie.circle_invite enable row level security;
alter table neverdie.circle_contributor enable row level security;

do $$ begin
  create policy circle_invite_owner on neverdie.circle_invite
    using (exists (select 1 from neverdie.memory_circle c
                   where c.id = circle_id and c.created_by = auth.uid()))
    with check (exists (select 1 from neverdie.memory_circle c
                        where c.id = circle_id and c.created_by = auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy circle_contributor_owner on neverdie.circle_contributor
    using (exists (select 1 from neverdie.memory_circle c
                   where c.id = circle_id and c.created_by = auth.uid()))
    with check (exists (select 1 from neverdie.memory_circle c
                        where c.id = circle_id and c.created_by = auth.uid()));
exception when duplicate_object then null; end $$;

-- ── RPCs ────────────────────────────────────────────────────────────────────

-- Resolve the circle (and the loved one's corpus) behind a persona.
create or replace function neverdie.circle_for_persona(p_persona uuid)
returns table(circle_id uuid, persona_name text, person_id uuid)
language sql stable
set search_path to 'neverdie', 'public', 'extensions', 'pg_temp'
as $$
  select c.id, per.full_name, pr.person_id
  from neverdie.memory_circle c
  join neverdie.persona pr on pr.id = c.persona_id
  left join neverdie.person per on per.id = pr.person_id
  where c.persona_id = p_persona;
$$;

-- Mint a shareable invite token (valid 30 days) for a circle.
create or replace function neverdie.circle_invite_create(
  p_circle uuid, p_role neverdie.circle_role default 'contributor')
returns text
language sql
set search_path to 'neverdie', 'public', 'extensions', 'pg_temp'
as $$
  insert into neverdie.circle_invite(circle_id, role, expires_at)
  values (p_circle, p_role, now() + interval '30 days')
  returning token;
$$;

-- Family joins a garden with a token. Returns the new contributor + the loved
-- one's name so the app can greet them. (Local vars avoid the OUT-column vs
-- table-column ambiguity that a bare `select ... into` would hit.)
create or replace function neverdie.circle_join(p_token text, p_name text)
returns table(contributor_id uuid, circle_id uuid, persona_name text)
language plpgsql
set search_path to 'neverdie', 'public', 'extensions', 'pg_temp'
as $$
declare inv record; v_contrib uuid; v_circle uuid; v_name text;
begin
  select * into inv from neverdie.circle_invite where token = p_token
    and (expires_at is null or expires_at > now());
  if inv is null then raise exception 'invalid or expired invite'; end if;
  insert into neverdie.circle_contributor(circle_id, display_name, role)
  values (inv.circle_id, p_name, inv.role)
  returning id into v_contrib;
  v_circle := inv.circle_id;
  select per.full_name into v_name
    from neverdie.memory_circle c join neverdie.persona pr on pr.id = c.persona_id
    left join neverdie.person per on per.id = pr.person_id where c.id = inv.circle_id;
  return query select v_contrib, v_circle, v_name;
end $$;

-- A family member's story becomes an embedded memory in the loved one's corpus.
-- The chunk is owned by the circle creator and tagged with the contributor so
-- retrieval can cite "story by Cristina". contributions counter ticks up.
create or replace function neverdie.circle_contribute(
  p_circle uuid, p_contributor text, p_text text, p_kind text default 'story')
returns uuid
language plpgsql
set search_path to 'neverdie', 'public', 'extensions', 'pg_temp'
as $$
declare owner uuid; person uuid; mem uuid;
begin
  select c.created_by, pr.person_id into owner, person
    from neverdie.memory_circle c join neverdie.persona pr on pr.id = c.persona_id
   where c.id = p_circle;
  insert into neverdie.memory_chunk(owner_id, person_id, text_enc, chunk_meta)
  values (owner, person, convert_to(p_text, 'UTF8'),
          jsonb_build_object('source', 'story by '||p_contributor,
                             'kind', p_kind, 'contributor', p_contributor))
  returning id into mem;
  update neverdie.circle_contributor set contributions = contributions + 1
   where circle_id = p_circle and display_name = p_contributor;
  return mem;
end $$;

-- Who has gathered in this garden, and how much each has contributed.
create or replace function neverdie.circle_members(p_circle uuid)
returns table(display_name text, role neverdie.circle_role,
              contributions int, joined_at timestamptz)
language sql stable
set search_path to 'neverdie', 'public', 'extensions', 'pg_temp'
as $$
  select display_name, role, contributions, joined_at
  from neverdie.circle_contributor where circle_id = p_circle order by joined_at;
$$;

-- The backend calls these with the service key.
grant execute on function neverdie.circle_for_persona(uuid)        to service_role;
grant execute on function neverdie.circle_invite_create(uuid, neverdie.circle_role) to service_role;
grant execute on function neverdie.circle_join(text, text)         to service_role;
grant execute on function neverdie.circle_contribute(uuid, text, text, text) to service_role;
grant execute on function neverdie.circle_members(uuid)            to service_role;
