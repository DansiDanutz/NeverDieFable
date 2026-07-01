-- NeverDie — PostgreSQL schema (Supabase-ready)
-- Requires: pgcrypto (uuids), vector (pgvector)

create extension if not exists pgcrypto;
create extension if not exists vector;

-- ============================================================ users & people

create table app_user (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  display_name  text not null,
  locale        text not null default 'en',
  -- client-held crypto: server stores only public material
  master_pubkey bytea,
  created_at    timestamptz not null default now()
);

create table person (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references app_user(id) on delete cascade,
  full_name     text not null,
  relationship  text,                          -- 'mother', 'friend', ...
  is_departed   boolean not null default false,
  born_on       date,
  died_on       date,
  linked_user   uuid references app_user(id),  -- if this person is also an app user
  face_print    bytea,                         -- embedding for auto-tagging
  voice_print_ref text,                        -- blob key of enrolled voice print
  created_at    timestamptz not null default now()
);

-- ============================================================ vault

create type item_kind as enum (
  'photo','video','audio','voice_note','message_thread','email',
  'document','secret','recording','story','time_capsule'
);
create type sensitivity as enum ('normal','private','secret');
create type processing_status as enum ('pending','processing','ready','failed');

create table vault_item (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references app_user(id) on delete cascade,
  kind               item_kind not null,
  title              text,
  blob_key           text,                    -- S3 key of client-encrypted blob
  content_key_wrapped bytea,                  -- item key wrapped by user's master key
  envelope_text_enc  bytea,                   -- encrypted derived text (transcript/ocr/caption)
  mime_type          text,
  byte_size          bigint,
  captured_at        timestamptz,
  source_app         text,                    -- 'camera','whatsapp','gmail','live_listen',...
  sensitivity        sensitivity not null default 'normal',
  status             processing_status not null default 'pending',
  created_at         timestamptz not null default now()
);
create index on vault_item (owner_id, kind);
create index on vault_item (owner_id, captured_at);

create table item_person (
  item_id    uuid references vault_item(id) on delete cascade,
  person_id  uuid references person(id) on delete cascade,
  role       text default 'appears_in',       -- 'appears_in','speaker','author','recipient'
  confidence real,                            -- null = human-confirmed
  primary key (item_id, person_id, role)
);

create table event (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references app_user(id) on delete cascade,
  name       text not null,
  started_at timestamptz,
  place      text
);

-- ============================================================ memory engine

create table memory_chunk (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references app_user(id) on delete cascade,
  item_id    uuid references vault_item(id) on delete cascade,
  person_id  uuid references person(id),      -- primary subject, for persona corpora
  event_id   uuid references event(id),
  text_enc   bytea not null,                  -- encrypted chunk text
  embedding  vector(1024),                    -- BGE-M3
  chunk_meta jsonb not null default '{}',     -- offsets, speaker, page, ...
  created_at timestamptz not null default now()
);
create index on memory_chunk using hnsw (embedding vector_cosine_ops);
create index on memory_chunk (owner_id, person_id);

-- ============================================================ personas

create type persona_kind as enum ('self','departed','companion');
create type persona_mode as enum ('mirror','rehearsal','legacy','memorial_locked');

create table persona (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references app_user(id) on delete cascade,
  person_id     uuid references person(id),
  kind          persona_kind not null,
  mode          persona_mode not null default 'mirror',
  voice_model_ref  text,                      -- Fish Speech voice-print ref
  avatar_rig_ref   text,                      -- LivePortrait idle loop + viseme bank
  card_version  int not null default 0,
  created_at    timestamptz not null default now()
);

create table persona_card (
  persona_id   uuid references persona(id) on delete cascade,
  version      int not null,
  card         jsonb not null,  -- tone, lexicon, values, humor, biography,
                                -- affection_map: {person_id: {nickname, register, rituals}},
                                -- taboos, provenance stats
  created_at   timestamptz not null default now(),
  primary key (persona_id, version)
);

create table chat_message (
  id          uuid primary key default gen_random_uuid(),
  persona_id  uuid not null references persona(id) on delete cascade,
  listener_id uuid not null references app_user(id),  -- chats are private per listener
  role        text not null check (role in ('listener','persona')),
  content_enc bytea not null,
  audio_ref   text,
  video_ref   text,
  cited_items uuid[],
  created_at  timestamptz not null default now()
);
create index on chat_message (persona_id, listener_id, created_at);

-- ============================================================ memory circles (gardens)

create type circle_role as enum ('guardian','contributor','listener');

create table memory_circle (
  id          uuid primary key default gen_random_uuid(),
  persona_id  uuid unique not null references persona(id) on delete cascade,
  created_by  uuid not null references app_user(id)
);

create table circle_member (
  circle_id  uuid references memory_circle(id) on delete cascade,
  user_id    uuid references app_user(id) on delete cascade,
  role       circle_role not null,
  succession_rank int,                        -- guardianship inheritance order
  primary key (circle_id, user_id)
);

-- ============================================================ legacy protocol

create type legacy_stage as enum ('active','unreachable','verification','grace','unsealed');
create type rule_trigger as enum ('on_death','on_date','heir_age','manual');
create type delivery_mode as enum ('raw','by_avatar','time_capsule');

create table legacy_state (
  user_id        uuid primary key references app_user(id) on delete cascade,
  stage          legacy_stage not null default 'active',
  checkin_days   int not null default 30,
  quorum         int not null default 2,
  grace_days     int not null default 14,
  last_seen_at   timestamptz not null default now(),
  stage_since    timestamptz not null default now()
);

create table verifier (
  user_id     uuid references app_user(id) on delete cascade,
  person_id   uuid references person(id),
  contact     text not null,
  confirmed_death_at timestamptz,
  coercion_flag boolean not null default false,
  primary key (user_id, person_id)
);

create table key_share (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references app_user(id) on delete cascade,
  holder_kind text not null check (holder_kind in ('heir','verifier','service')),
  holder_id   uuid,
  share_enc   bytea not null,                 -- Shamir share, wrapped by holder's key
  threshold_k int not null,
  total_n     int not null
);

create table legacy_rule (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references app_user(id) on delete cascade,
  item_id     uuid references vault_item(id) on delete cascade,
  collection  jsonb,                          -- alternative: query-defined collection
  heir_person uuid not null references person(id),
  fallback_heir uuid references person(id),
  trigger     rule_trigger not null default 'on_death',
  trigger_arg jsonb,                          -- date, age, ...
  delivery    delivery_mode not null default 'raw',
  note_enc    bytea,                          -- personal note delivered with the item
  executed_at timestamptz,
  created_at  timestamptz not null default now()
);

create table legacy_audit (
  id         bigserial primary key,
  user_id    uuid not null references app_user(id) on delete cascade,
  action     text not null,
  detail     jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================ daily companion

create type question_status as enum ('pending','asked','answered','skipped','snoozed');

create table companion_question (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references app_user(id) on delete cascade,
  circle_id   uuid references memory_circle(id),  -- garden questions go to the circle
  gap_kind    text not null,                  -- 'unknown_face','unlabeled_voice','sparse_period',...
  gap_ref     jsonb not null default '{}',    -- item/person/event the gap points at
  question    text not null,
  priority    real not null default 0,
  status      question_status not null default 'pending',
  answer_item uuid references vault_item(id), -- the 'story' item created by the answer
  created_at  timestamptz not null default now()
);
create index on companion_question (owner_id, status, priority desc);
