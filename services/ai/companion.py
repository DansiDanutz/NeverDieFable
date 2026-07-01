"""Companion engine — turns memory gaps into human questions.

Nightly job:
  1. collect open GapRecords + thin-corpus personas + sparse timeline periods
  2. generate candidate questions (LLM, with gap + graph context)
  3. rank by emotional_value * graph_impact * freshness
  4. schedule top few into companion_question (respecting cadence settings,
     grief-aware rate limits for departed-person topics)

Garden questions fan out to the whole Memory Circle — every relative can
answer "tell me a story about how he laughed".
"""

from uuid import UUID


def generate_daily_questions(owner_id: UUID, max_questions: int = 3) -> list[UUID]:
    """Returns created companion_question ids for tonight's batch."""
    raise NotImplementedError("wire gap scan + LLM question generation + ranking")
