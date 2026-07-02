"""Legacy Protocol — check-ins, verifiers, rules, the unseal state machine.
'If I die, everything remains — exactly as I chose.' (docs/LEGACY_PROTOCOL.md)"""

from uuid import UUID

from fastapi import APIRouter

from app import engine
from app.schemas import LegacyRuleCreate

router = APIRouter()


@router.get("/state")
async def get_state() -> dict:
    """Live protocol status: stage, verifier count, confirmations, rule count."""
    return engine.legacy_state()


@router.post("/checkin")
async def checkin() -> dict:
    """Any authenticated activity resets the clock. A check-in during a later
    stage ABORTS the protocol back to active."""
    return {"stage": engine.legacy_checkin()}


@router.post("/config")
async def config(checkin_days: int = 30, quorum: int = 2, grace_days: int = 14) -> dict:
    return engine.legacy_config(checkin_days, quorum, grace_days)


@router.post("/verifiers")
async def add_verifier(person_id: UUID, contact: str) -> dict:
    """Add a trusted verifier — one of the people who can confirm your death."""
    return engine.add_verifier(str(person_id), contact)


@router.post("/verify/{person_id}")
async def verifier_confirm(person_id: UUID, coercion_pin: bool = False) -> dict:
    """A verifier confirms the death. Reaching quorum moves the protocol to
    grace. A coercion flag silently records that the confirmation was coerced."""
    return engine.confirm_death(str(person_id), coercion=coercion_pin)


@router.post("/rules")
async def create_rule(rule: LegacyRuleCreate) -> dict:
    return engine.add_legacy_rule(
        heir_person=str(rule.heir_person), trigger=rule.trigger, delivery=rule.delivery,
        item_id=str(rule.item_id) if rule.item_id else None, collection=rule.collection,
    )


@router.get("/rules")
async def list_rules() -> dict:
    return {"rules": engine.legacy_rules()}


@router.post("/unseal")
async def unseal() -> dict:
    """Grace expired → execute all rules, switch the Mind to legacy mode. In
    production this is gated by the grace-period timer, never called directly."""
    return engine.unseal()
