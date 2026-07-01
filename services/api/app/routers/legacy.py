"""Legacy Protocol — check-ins, verifiers, rules, the unseal state machine."""

from uuid import UUID, uuid4

from fastapi import APIRouter

from app.schemas import LegacyRuleCreate

router = APIRouter()


@router.post("/checkin")
async def checkin() -> dict:
    """Any authenticated call resets last_seen_at. A login during
    unreachable/verification/grace ABORTS the protocol back to active."""
    # TODO: update legacy_state; audit log if aborting a later stage
    return {"stage": "active"}


@router.get("/state")
async def get_state() -> dict:
    # TODO: read legacy_state + verifier statuses
    return {"stage": "active", "checkin_days": 30, "quorum": 2, "grace_days": 14}


@router.post("/rules")
async def create_rule(rule: LegacyRuleCreate) -> dict:
    # TODO: insert legacy_rule; audit log
    return {"id": str(uuid4()), **rule.model_dump(mode="json")}


@router.get("/rules")
async def list_rules() -> dict:
    return {"rules": []}


@router.post("/verify/{user_id}")
async def verifier_confirm(user_id: UUID, coercion_pin: str | None = None) -> dict:
    """A trusted verifier confirms the user's death. Quorum of confirmations
    moves the protocol to grace. A coercion PIN silently flags the confirmation."""
    # TODO: record confirmation; check quorum; schedule grace expiry job
    return {"recorded": True}


@router.post("/unseal/{user_id}")
async def unseal(user_id: UUID) -> dict:
    """Grace period expired → execute rules. Heir clients combine their Shamir
    shares locally; the server only releases wrapped shares and ciphertext."""
    # TODO: transition to unsealed; execute legacy_rules; switch personas to
    # legacy mode; transfer garden guardianships; write audit trail
    return {"stage": "unsealed"}
