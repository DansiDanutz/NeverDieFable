"""NeverDie API — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat, circle, companion, legacy, people, personas, push, vault

app = FastAPI(
    title="NeverDie API",
    version="0.1.0",
    description="Vault, Digital Mind, Eternal Garden, Legacy Protocol.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to app origins before launch
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vault.router, prefix="/vault", tags=["vault"])
app.include_router(people.router, prefix="/people", tags=["people"])
app.include_router(personas.router, prefix="/personas", tags=["personas"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(legacy.router, prefix="/legacy", tags=["legacy"])
app.include_router(companion.router, prefix="/companion", tags=["companion"])
app.include_router(circle.router, prefix="/circle", tags=["circle"])
app.include_router(push.router, prefix="/push", tags=["push"])


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
