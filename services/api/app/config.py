"""Runtime configuration, loaded from environment. Nothing secret is hardcoded.

The whole app runs in three degrading modes so it's useful before every key
is present:
  * full     — ANTHROPIC_API_KEY + DATABASE_URL set
  * demo     — no DB: an in-memory store with seeded memories (great for trying
               persona chat + Ask Anything end-to-end)
  * offline  — no ANTHROPIC_API_KEY: deterministic canned replies so the UI and
               plumbing still work in CI and on a plane
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    neverdie_model_fast: str = "claude-sonnet-5"
    neverdie_model_quality: str = "claude-opus-4-8"

    database_url: str = ""
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_anon_key: str = ""
    db_schema: str = "neverdie"  # isolated schema in the shared Supabase project

    elevenlabs_api_key: str = ""

    s3_endpoint: str = ""
    s3_bucket: str = "neverdie-vault"
    s3_access_key: str = ""
    s3_secret_key: str = ""

    redis_url: str = "redis://localhost:6379/0"

    @property
    def has_llm(self) -> bool:
        return bool(self.anthropic_api_key)

    @property
    def has_db(self) -> bool:
        return bool(self.database_url or self.supabase_url)

    @property
    def has_voice(self) -> bool:
        return bool(self.elevenlabs_api_key)

    @property
    def mode(self) -> str:
        if self.has_llm and self.has_db:
            return "full"
        return "demo" if not self.has_db else "offline"


@lru_cache
def get_settings() -> Settings:
    return Settings()
