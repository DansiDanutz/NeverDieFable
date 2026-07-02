-- Backfill (already executed against the live project on 2026-07-02).
-- Non-destructive: reads the legacy public.* tables, writes only neverdie.*.
--
-- 1) nd_avatars -> person + persona + persona_card v1 + memory_circle
--    (executed for avatar 'Eva' / 60a98a6d-...; generalized form below)
-- 2) chat_history -> memory_chunk self-corpus (92,446 rows)
--    text_enc holds UTF-8 bytes today; client-side encryption re-wraps them at
--    the Phase-1 crypto rollout. embedding stays NULL until the embedding job.

with owner as (select id from auth.users limit 1),
av as (select * from public.nd_avatars),
new_person as (
  insert into neverdie.person (owner_id, full_name, relationship, is_departed, born_on, died_on, voice_print_ref)
  select o.id, av.name, av.relationship, true, av.birth_date, av.death_date, av.voice_id
  from owner o, av
  returning id
),
new_persona as (
  insert into neverdie.persona (owner_id, person_id, kind, mode, voice_model_ref, avatar_rig_ref, card_version)
  select o.id, p.id, 'departed', 'legacy', av.voice_id, av.avatar_image_url, 1
  from owner o, new_person p, av
  returning id, owner_id
),
new_card as (
  insert into neverdie.persona_card (persona_id, version, card)
  select np.id, 1, jsonb_build_object(
    'source', 'backfill:nd_avatars',
    'name', av.name,
    'relationship', av.relationship,
    'bio', av.bio,
    'personality_traits', to_jsonb(av.personality_traits),
    'speaking_style', av.speaking_style,
    'system_prompt', av.system_prompt,
    'language', av.language,
    'country', av.country)
  from new_persona np, av
  returning persona_id
)
insert into neverdie.memory_circle (persona_id, created_by)
select np.id, np.owner_id from new_persona np;

insert into neverdie.memory_chunk (owner_id, person_id, text_enc, chunk_meta)
select
  (select id from auth.users limit 1),
  null,
  convert_to(ch.message_text, 'UTF8'),
  jsonb_build_object(
    'source', 'backfill:chat_history',
    'src_id', ch.id,
    'sender', ch.sender,
    'contact_id', ch.contact_id,
    'message_type', ch.message_type,
    'at', ch.timestamp)
from public.chat_history ch
where ch.message_text is not null
  and length(trim(ch.message_text)) > 0
  and ch.is_deleted = false;
