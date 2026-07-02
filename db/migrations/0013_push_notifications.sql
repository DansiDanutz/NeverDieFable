-- 0013_push_notifications.sql
-- The daily nudge — the proactive heartbeat that pulls you back into the ritual.
--
-- The app registers its Expo push token here; a once-a-day scheduler calls the
-- API's /push/send-daily, which delivers each owner one warm invitation back
-- into the daily ritual ("Eva is waiting in the garden…"). No APNs/FCM secrets
-- live in the DB — Expo fans a single token out to Apple/Google.
--
-- To schedule delivery, point a cron at the API once a day, e.g. Supabase
-- pg_cron + pg_net:
--   select cron.schedule('neverdie-daily-push', '0 18 * * *',
--     $$ select net.http_post('https://<api-host>/push/send-daily') $$);
-- (left as an operational step; the API host isn't known at migration time.)
--
-- Idempotent. Applied to the live project (schema `neverdie`) as of 2026-07-02.

create table if not exists neverdie.push_device (
  expo_token  text primary key,               -- ExponentPushToken[…]
  owner_id    uuid not null default neverdie.default_owner(),
  platform    text not null default 'unknown',
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);
create index if not exists push_device_owner_idx on neverdie.push_device(owner_id);

alter table neverdie.push_device enable row level security;
do $$ begin
  create policy push_device_owner on neverdie.push_device
    using (owner_id = auth.uid()) with check (owner_id = auth.uid());
exception when duplicate_object then null; end $$;

-- register (or refresh) a device token for the owner
create or replace function neverdie.push_register(
  p_owner uuid, p_token text, p_platform text default 'unknown')
returns void
language sql
set search_path to 'neverdie','public','extensions','pg_temp'
as $$
  insert into neverdie.push_device(expo_token, owner_id, platform, last_seen)
  values (p_token, p_owner, p_platform, now())
  on conflict (expo_token)
  do update set owner_id = excluded.owner_id,
                platform = excluded.platform,
                last_seen = now();
$$;

-- the tokens the daily job should push to for this owner
create or replace function neverdie.push_devices(p_owner uuid)
returns table(expo_token text, platform text)
language sql stable
set search_path to 'neverdie','public','extensions','pg_temp'
as $$
  select expo_token, platform from neverdie.push_device where owner_id = p_owner;
$$;

grant execute on function neverdie.push_register(uuid, text, text) to service_role;
grant execute on function neverdie.push_devices(uuid)              to service_role;
