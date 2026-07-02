"""Bridge from the API to the AI pipeline (services/ai).

Live mode (SUPABASE_URL + SUPABASE_SERVICE_KEY set): retrieval runs over the
real neverdie schema — 92k+ memory chunks — and personas (e.g. Eva) come from
the database with their real Persona Cards.

Demo mode (no credentials): in-memory store with a seeded corpus, so the whole
app still works end-to-end.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Make the sibling `services/ai` package importable.
_SERVICES = Path(__file__).resolve().parents[2]
if str(_SERVICES) not in sys.path:
    sys.path.insert(0, str(_SERVICES))

from ai import companion as companion_engine  # noqa: E402
from ai import growth  # noqa: E402
from ai import memory as memory_engine  # noqa: E402
from ai import persona as persona_engine  # noqa: E402
from ai.store import InMemoryStore  # noqa: E402
from ai.supastore import SupabaseStore  # noqa: E402
from app.config import get_settings  # noqa: E402

_DEMO_PERSONAS: dict[str, dict] = {
    "self": {"name": "You", "kind": "self", "mode": "mirror", "person_id": "self", "card": None},
    "p1": {"name": "Grandpa Ion", "kind": "departed", "mode": "legacy", "person_id": "p1", "card": None},
    "p2": {"name": "Aunt Maria", "kind": "departed", "mode": "legacy", "person_id": "p2", "card": None},
}

_settings = get_settings()

if _settings.supabase_url and _settings.supabase_service_key:
    STORE = SupabaseStore(_settings.supabase_url, _settings.supabase_service_key)
    LIVE = True
else:
    STORE = InMemoryStore()
    LIVE = False

_persona_cache: dict[str, dict] | None = None


def personas() -> dict[str, dict]:
    """Persona registry: live rows (+ a virtual 'self') or the demo set."""
    global _persona_cache
    if not LIVE:
        return _DEMO_PERSONAS
    if _persona_cache is None:
        _persona_cache = {
            "self": {"name": "You", "kind": "self", "mode": "mirror",
                     "person_id": "self", "card": None},
            **STORE.list_personas(),
        }
    return _persona_cache


def chat_turn(persona_id: str, message: str, history: list[dict[str, str]],
              learn: bool = True):
    reg = personas()
    p = reg.get(persona_id) or reg["self"]
    turn = persona_engine.converse(
        name=p["name"], kind=p["kind"], mode=p["mode"],
        listener_message=message, history=history,
        store=STORE, person_id=p["person_id"], card=p.get("card"),
    )
    # The brain grows: distill this exchange into a durable memory of the
    # subject, so tomorrow the Mind remembers what was said today.
    if learn and LIVE:
        try:
            mem = growth.distill(message, turn.text)
            if mem:
                STORE.add_memory(p["person_id"], mem,
                                 source=f"conversation · {p['name']}", kind="interaction")
        except Exception:
            pass  # never let learning break a reply
    return turn


def ask(query: str, person_id: str = "self"):
    return memory_engine.answer(query, STORE, person_id=person_id)


def legacy_state() -> dict:
    if not LIVE:
        return {"stage": "active", "checkin_days": 30, "quorum": 2, "grace_days": 14,
                "verifiers": 0, "confirmations": 0, "rules": 0}
    return STORE.legacy_get()


def legacy_checkin() -> str:
    return STORE.legacy_checkin() if LIVE else "active"


def legacy_config(checkin_days: int, quorum: int, grace_days: int) -> dict:
    if LIVE:
        STORE.legacy_set_config(checkin_days, quorum, grace_days)
    return legacy_state()


def add_verifier(person_id: str, contact: str) -> dict:
    if LIVE:
        STORE.verifier_add(person_id, contact)
    return {"status": "added"}


def confirm_death(person_id: str, coercion: bool = False) -> dict:
    return STORE.verifier_confirm(person_id, coercion) if LIVE else {"status": "demo"}


def add_legacy_rule(heir_person: str, trigger: str, delivery: str,
                    note: str | None = None, item_id: str | None = None,
                    collection: dict | None = None) -> dict:
    if not LIVE:
        return {"status": "demo"}
    rid = STORE.legacy_rule_add(heir_person, trigger, delivery, note, item_id, collection)
    return {"id": rid}


def legacy_rules() -> list[dict]:
    return STORE.legacy_rules_list() if LIVE else []


def unseal() -> dict:
    return STORE.legacy_unseal() if LIVE else {"status": "demo"}


def circle_invite(persona_id: str, role: str = "contributor") -> dict:
    """Create a shareable invite so family can join a loved one's garden."""
    if not LIVE:
        return {"status": "demo"}
    c = STORE.circle_for_persona(persona_id)
    if not c:
        return {"status": "no_circle"}
    token = STORE.circle_invite_create(c["circle_id"], role)
    return {"token": token, "persona": c.get("persona_name"),
            "join_url": f"neverdie://join/{token}"}


def circle_join(token: str, name: str) -> dict:
    return STORE.circle_join(token, name) if LIVE else {"status": "demo"}


def circle_contribute(persona_id: str, contributor: str, text: str, kind: str = "story") -> dict:
    """A family member's story becomes an embedded memory in the loved one's
    corpus — the garden grows from everyone who loved them."""
    if not LIVE:
        return {"status": "demo"}
    c = STORE.circle_for_persona(persona_id)
    if not c:
        return {"status": "no_circle"}
    mem = STORE.circle_contribute(c["circle_id"], contributor, text, kind)
    # embed the new memory so the loved one can recall it right away
    try:
        from ai import ingest
        ingest._embed_new(STORE, c.get("person_id"))
    except Exception:
        pass
    return {"status": "added", "memory_id": mem, "persona": c.get("persona_name")}


def circle_members(persona_id: str) -> list[dict]:
    if not LIVE:
        return []
    c = STORE.circle_for_persona(persona_id)
    return STORE.circle_members(c["circle_id"]) if c else []


def register_push(token: str, platform: str = "unknown") -> dict:
    """Enroll a device for the daily nudge. Idempotent per token."""
    if not LIVE:
        return {"status": "demo"}
    STORE.push_register(token, platform)
    return {"status": "registered"}


def send_daily_push() -> dict:
    """The proactive heartbeat: make sure today's ritual is queued, then deliver
    one gentle invitation to every enrolled device. Called by a scheduler (cron)
    once a day — the habit loop that keeps the brain growing without nagging.

    The copy leans on the loved one whose garden most needs tending, because
    "Eva is waiting to remember with you" pulls far harder than "you have 3
    pending questions." Best-effort: a push failure never breaks the queue."""
    if not LIVE:
        return {"status": "demo"}

    ritual = daily_ritual(3)
    streak = ritual.get("streak", 0)
    questions = ritual.get("questions", [])

    # find a departed loved one to center the invitation on
    reg = personas()
    departed = [p for p in reg.values() if p.get("kind") == "departed"]
    loved = departed[0]["name"] if departed else None

    if loved:
        title = f"{loved} is waiting in the garden"
        body = questions[0]["question"] if questions else \
            f"Come remember a moment with {loved} today."
    else:
        title = "Your mind is ready to remember"
        body = questions[0]["question"] if questions else \
            "Add one memory today — future you will thank you."

    if streak > 1:
        title = f"🔥 {streak}-day streak · {title}"

    from ai import push
    tokens = [d["expo_token"] for d in STORE.push_devices()]
    try:
        result = push.send_expo(tokens, title, body,
                                data={"kind": "daily_ritual", "streak": streak})
    except Exception as e:  # never let delivery break the ritual
        return {"status": "queued_no_push", "error": str(e), "streak": streak}
    return {"status": "sent", "streak": streak, **result}


def ingest_uploaded(item_id: str, persona_id: str | None = None) -> dict:
    """A newly-uploaded vault item becomes embedded memory of the right person.
    persona_id tags a photo/voice of a departed loved one to THEIR corpus."""
    if not LIVE:
        return {"status": "demo"}
    from ai import ingest

    item = STORE.get_vault_item(item_id)
    if not item:
        return {"status": "not_found"}
    person = None
    if persona_id:
        p = personas().get(persona_id)
        person = p["person_id"] if p else None
    blob = None
    if item.get("blob_key"):
        try:
            blob = STORE.download_blob(item["blob_key"])
        except Exception:
            blob = None
    ids = ingest.ingest_item(STORE, item, blob, person)
    return {"status": "ingested", "memories_added": len(ids)}


def completeness(persona_id: str) -> dict:
    """Memory Completeness score that drives the daily habit loop."""
    if not LIVE:
        return {"total": 0, "embedded": 0, "score": 0.0}
    p = personas().get(persona_id)
    corpus = p["person_id"] if p else persona_id
    s = STORE.corpus_stats(corpus)
    total = int(s["total"])
    # a warm, non-shaming curve: meaningful at ~200 memories, rich past ~2000
    import math
    score = 0.0 if total == 0 else min(1.0, math.log10(1 + total) / math.log10(2001))
    return {**s, "score": round(score, 3)}


def generate_companion_questions(persona_id: str = "self", n: int = 3) -> list[dict]:
    """Interview the user (or family) to grow a corpus, queue the questions."""
    if not LIVE:
        return []
    reg = personas()
    p = reg.get(persona_id) or reg["self"]
    seed = "life story family love home childhood work"
    known = [h.memory.text for h in STORE.retrieve(seed, p["person_id"], k=12)]
    qs = companion_engine.generate(p["name"], p["kind"] == "departed", known, n=n)
    for q in qs:
        q["id"] = STORE.companion_add(q["question"], q["gap_kind"], q["priority"],
                                      gap_ref={"persona_id": persona_id})
    return qs


def companion_today(limit: int = 3) -> list[dict]:
    return STORE.companion_today(limit) if LIVE else []


def daily_ritual(limit: int = 3) -> dict:
    """The proactive daily batch. Mixes a question for YOU with one about the
    loved one whose garden is thinnest — so every day both your mind and theirs
    grow. Returns the queued questions + your streak. This is the habit loop."""
    if not LIVE:
        return {"streak": 0, "questions": companion_today(limit)}

    pending = STORE.companion_today(limit)
    if len(pending) < limit:
        reg = personas()
        # find the departed persona with the least memory — most in need of love
        departed = [(pid, p) for pid, p in reg.items() if p["kind"] == "departed"]
        thinnest = None
        if departed:
            scored = [(pid, completeness(pid)["total"]) for pid, _ in departed]
            thinnest = min(scored, key=lambda x: x[1])[0]

        made = list(pending)
        # a garden question about the thinnest loved one (for the whole family)
        if thinnest and len([q for q in made if (q.get("gap_ref") or {}).get("persona_id") == thinnest]) == 0:
            made += generate_companion_questions(thinnest, n=1)
        # fill the rest with questions for the user's own mind
        if len(made) < limit:
            made += generate_companion_questions("self", n=limit - len(made))
        pending = STORE.companion_today(limit)

    return {"streak": STORE.companion_streak(), "questions": pending}


def answer_companion(question_id: str, text: str, person_id: str = "self") -> dict:
    """A companion answer becomes durable, embeddable memory of the subject,
    and advances the daily streak."""
    if not LIVE:
        return {"status": "demo"}
    mem_id = STORE.add_memory(person_id, text, source="companion answer", kind="story")
    # answer_item FKs to vault_item; the answer is a memory_chunk, so we mark the
    # question answered without that link (the memory itself is already stored).
    STORE.companion_answered(question_id, None)
    STORE.companion_touch()
    return {"status": "answered", "memory_id": mem_id, "streak": STORE.companion_streak()}


def seed_departed_corpus(persona_id: str, per_seed: int = 12) -> dict:
    """Bring a departed loved one to life from what you already wrote about them.

    Semantically mines YOUR self corpus for memories that mention this person
    (by name, relationship, and endearments), and copies the closest matches into
    THEIR corpus — so they can immediately recall your actual shared moments.
    Requires embeddings; run the embed job first for best coverage."""
    if not LIVE:
        return {"status": "demo"}
    reg = personas()
    p = reg.get(persona_id)
    if not p or p["kind"] != "departed":
        return {"status": "skipped", "reason": "not a departed persona"}

    name = p["name"]
    rel = (p.get("relationship") or "").lower()
    seeds = [name, rel, f"{name} {rel}", "mama mother mom", "my mother",
             "memories of her", "her voice her smile", "family home childhood"]
    seen: set[str] = set()
    copied = 0
    for seed in seeds:
        for h in STORE.retrieve(seed, "self", k=per_seed):
            key = h.memory.text.strip()
            if len(key) < 8 or key in seen:
                continue
            seen.add(key)
            STORE.add_memory(p["person_id"], key,
                             source=f"about {name} · from your memories", kind="shared_memory")
            copied += 1
    return {"status": "seeded", "persona": name, "memories_added": copied}


def set_persona_voice(persona_id: str, voice_ref: str) -> None:
    """Persist a cloned voice and refresh the registry cache."""
    global _persona_cache
    if LIVE:
        STORE.set_voice(persona_id, voice_ref)
        _persona_cache = None
    else:
        _DEMO_PERSONAS.setdefault(persona_id, dict(_DEMO_PERSONAS["self"]))["voice_ref"] = voice_ref
