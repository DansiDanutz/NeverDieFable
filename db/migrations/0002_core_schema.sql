-- NeverDie core schema, isolated in the `neverdie` namespace and linked to
-- Supabase auth.users. Applied to project gvuuauzsucvhghmpdpxf ("Memory").
create schema if not exists neverdie;

create table if not exists neverdie.person (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  full_name     text not null,
  relationship  text,
  is_departed   boolean not null default false,
  born_on       date,
  died_on       date,
  linked_user   uuid references auth.users(id),
  face_print    bytea,
  voice_print_ref text,
  created_at    timestamptz not null default now()
);
create index if not exists person_owner_idx on neverdie.person(owner_id);

do $$ begin
  create type neverdie.item_kind as enum (
    'photo','video','audio','voice_note','message_thread','email',
    'document','secret','recording','story','time_capsule');
exception when duplicate_object then null; end $$;
do $$ begin
  create type neverdie.sensitivity as enum ('normal','private','secret');
exception when duplicate_object then null; end $$;
do $$ begin
  create type neverdie.processing_status as enum ('pending','processing','ready','failed');
exception when duplicate_object then null; end $$;

create table if not exists neverdie.vault_item (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references auth.users(id) on delete cascade,
  kind               neverdie.item_kind not null,
  title              text,
  blob_key           text,
  content_key_wrapped bytea,
  envelope_text_enc  bytea,
  mime_type          text,
  byte_size          bigint,
  captured_at        timestamptz,
  source_app         text,
  sensitivity        neverdie.sensitivity not null default 'normal',
  status             neverdie.processing_status not null default 'pending',
  created_at         timestamptz not null default now()
);
create index if not exists vault_owner_kind_idx on neverdie.vault_item(owner_id, kind);
create index if not exists vault_owner_time_idx on neverdie.vault_item(owner_id, captured_at);

create table if not exists neverdie.item_person (
  item_id    uuid references neverdie.vault_item(id) on delete cascade,
  person_id  uuid references neverdie.person(id) on delete cascade,
  role       text default 'appears_in',
  confidence real,
  primary key (item_id, person_id, role)
);

create table if not exists neverdie.event (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  started_at timestamptz,
  place      text
);

create table if not exists neverdie.memory_chunk (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  item_id    uuid references neverdie.vault_item(id) on delete cascade,
  person_id  uuid references neverdie.person(id),
  event_id   uuid references neverdie.event(id),
  text_enc   bytea not null,
  embedding  vector(1024),
  chunk_meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists memory_embed_idx on neverdie.memory_chunk using hnsw (embedding vector_cosine_ops);
create index if not exists memory_owner_person_idx on neverdie.memory_chunk(owner_id, person_id);

do $$ begin
  create type neverdie.persona_kind as enum ('self','departed','companion');
exception when duplicate_object then null; end $$;
do $$ begin
  create type neverdie.persona_mode as enum ('mirror','rehearsal','legacy','memorial_locked');
exception when duplicate_object then null; end $$;

create table if not exists neverdie.persona (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  person_id     uuid references neverdie.person(id),
  kind          neverdie.persona_kind not null,
  mode          neverdie.persona_mode not null default 'mirror',
  voice_model_ref  text,
  avatar_rig_ref   text,
  card_version  int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists neverdie.persona_card (
  persona_id   uuid references neverdie.persona(id) on delete cascade,
  version      int not null,
  card         jsonb not null,
  created_at   timestamptz not null default now(),
  primary key (persona_id, version)
);

create table if not exists neverdie.chat_message (
  id          uuid primary key default gen_random_uuid(),
  persona_id  uuid not null references neverdie.persona(id) on delete cascade,
  listener_id uuid not null references auth.users(id),
  role        text not null check (role in ('listener','persona')),
  content_enc bytea not null,
  audio_ref   text,
  video_ref   text,
  cited_items uuid[],
  created_at  timestamptz not null default now()
);
create index if not exists chat_persona_listener_idx on neverdie.chat_message(persona_id, listener_id, created_at);

do $$ begin
  create type neverdie.circle_role as enum ('guardian','contributor','listener');
exception when duplicate_object then null; end $$;

create table if not exists neverdie.memory_circle (
  id          uuid primary key default gen_random_uuid(),
  persona_id  uuid unique not null references neverdie.persona(id) on delete cascade,
  created_by  uuid not null references auth.users(id)
);

create table if not exists neverdie.circle_member (
  circle_id  uuid references neverdie.memory_circle(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  role       neverdie.circle_role not null,
  succession_rank int,
  primary key (circle_id, user_id)
);

do $$ begin
  create type neverdie.legacy_stage as enum ('active','unreachable','verification','grace','unsealed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type neverdie.rule_trigger as enum ('on_death','on_date','heir_age','manual');
exception when duplicate_object then null; end $$;
do $$ begin
  create type neverdie.delivery_mode as enum ('raw','by_avatar','time_capsule');
exception when duplicate_object then null; end $$;

create table if not exists neverdie.legacy_state (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  stage          neverdie.legacy_stage not null default 'active',
  checkin_days   int not null default 30,
  quorum         int not null default 2,
  grace_days     int not null default 14,
  last_seen_at   timestamptz not null default now(),
  stage_since    timestamptz not null default now()
);

create table if not exists neverdie.verifier (
  user_id     uuid references auth.users(id) on delete cascade,
  person_id   uuid references neverdie.person(id),
  contact     text not null,
  confirmed_death_at timestamptz,
  coercion_flag boolean not null default false,
  primary key (user_id, person_id)
);

create table if not exists neverdie.key_share (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  holder_kind text not null check (holder_kind in ('heir','verifier','service')),
  holder_id   uuid,
  share_enc   bytea not null,
  threshold_k int not null,
  total_n     int not null
);

create table if not exists neverdie.legacy_rule (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     uuid references neverdie.vault_item(id) on delete cascade,
  collection  jsonb,
  heir_person uuid not null references neverdie.person(id),
  fallback_heir uuid references neverdie.person(id),
  trigger     neverdie.rule_trigger not null default 'on_death',
  trigger_arg jsonb,
  delivery    neverdie.delivery_mode not null default 'raw',
  note_enc    bytea,
  executed_at timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists neverdie.legacy_audit (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  action     text not null,
  detail     jsonb not null default '{}',
  created_at timestamptz not null default now()
);

do $$ begin
  create type neverdie.question_status as enum ('pending','asked','answered','skipped','snoozed');
exception when duplicate_object then null; end $$;

create table if not exists neverdie.companion_question (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  circle_id   uuid references neverdie.memory_circle(id),
  gap_kind    text not null,
  gap_ref     jsonb not null default '{}',
  question    text not null,
  priority    real not null default 0,
  status      neverdie.question_status not null default 'pending',
  answer_item uuid references neverdie.vault_item(id),
  created_at  timestamptz not null default now()
);
create index if not exists companion_owner_status_idx on neverdie.companion_question(owner_id, status, priority desc);
