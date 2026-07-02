-- Daily Ritual — streak tracking for the habit loop (applied live 2026-07-02).
create table if not exists neverdie.companion_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null,
  primary key (user_id, day)
);
alter table neverdie.companion_activity enable row level security;
do $$ begin
  create policy activity_owner on neverdie.companion_activity
    using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create or replace function neverdie.companion_touch(p_user uuid)
returns void language sql set search_path = neverdie, public, extensions, pg_temp
as $$
  insert into neverdie.companion_activity(user_id, day) values (p_user, current_date)
  on conflict do nothing;
$$;

create or replace function neverdie.companion_streak(p_user uuid)
returns int language plpgsql stable set search_path = neverdie, public, extensions, pg_temp
as $$
declare d date; streak int := 0; probe date;
begin
  select max(day) into d from neverdie.companion_activity where user_id = p_user;
  if d is null or d < current_date - 1 then return 0; end if;
  probe := d;
  loop
    exit when not exists (select 1 from neverdie.companion_activity where user_id = p_user and day = probe);
    streak := streak + 1;
    probe := probe - 1;
  end loop;
  return streak;
end $$;

grant execute on function neverdie.companion_touch(uuid) to service_role, authenticated;
grant execute on function neverdie.companion_streak(uuid) to service_role, authenticated;
grant all on neverdie.companion_activity to service_role, authenticated;
