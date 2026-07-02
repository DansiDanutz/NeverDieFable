-- Row Level Security. anon key can touch nothing; the service_role key used by
-- the backend bypasses RLS. Every table is scoped to the owning auth.uid().
alter table neverdie.person enable row level security;
create policy person_owner on neverdie.person
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

alter table neverdie.vault_item enable row level security;
create policy vault_owner on neverdie.vault_item
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

alter table neverdie.event enable row level security;
create policy event_owner on neverdie.event
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

alter table neverdie.memory_chunk enable row level security;
create policy memory_owner on neverdie.memory_chunk
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

alter table neverdie.persona enable row level security;
create policy persona_owner on neverdie.persona
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

alter table neverdie.legacy_state enable row level security;
create policy legacy_state_owner on neverdie.legacy_state
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table neverdie.verifier enable row level security;
create policy verifier_owner on neverdie.verifier
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table neverdie.key_share enable row level security;
create policy key_share_owner on neverdie.key_share
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table neverdie.legacy_rule enable row level security;
create policy legacy_rule_owner on neverdie.legacy_rule
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table neverdie.legacy_audit enable row level security;
create policy legacy_audit_owner on neverdie.legacy_audit
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table neverdie.companion_question enable row level security;
create policy companion_owner on neverdie.companion_question
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

alter table neverdie.item_person enable row level security;
create policy item_person_via_item on neverdie.item_person
  using (exists (select 1 from neverdie.vault_item v where v.id = item_id and v.owner_id = auth.uid()))
  with check (exists (select 1 from neverdie.vault_item v where v.id = item_id and v.owner_id = auth.uid()));

alter table neverdie.persona_card enable row level security;
create policy persona_card_via_persona on neverdie.persona_card
  using (exists (select 1 from neverdie.persona p where p.id = persona_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from neverdie.persona p where p.id = persona_id and p.owner_id = auth.uid()));

alter table neverdie.chat_message enable row level security;
create policy chat_listener_or_persona_owner on neverdie.chat_message
  using (
    listener_id = auth.uid()
    or exists (select 1 from neverdie.persona p where p.id = persona_id and p.owner_id = auth.uid())
  )
  with check (listener_id = auth.uid());

alter table neverdie.memory_circle enable row level security;
create policy circle_creator_or_member on neverdie.memory_circle
  using (
    created_by = auth.uid()
    or exists (select 1 from neverdie.circle_member m where m.circle_id = id and m.user_id = auth.uid())
  )
  with check (created_by = auth.uid());

alter table neverdie.circle_member enable row level security;
create policy circle_member_self_or_creator on neverdie.circle_member
  using (
    user_id = auth.uid()
    or exists (select 1 from neverdie.memory_circle c where c.id = circle_id and c.created_by = auth.uid())
  )
  with check (
    exists (select 1 from neverdie.memory_circle c where c.id = circle_id and c.created_by = auth.uid())
  );
