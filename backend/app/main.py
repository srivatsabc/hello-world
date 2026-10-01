# Date: October 1, 2026
# Name: Sri
# Desc: Builds the FastAPI app: CORS for local dev, one router per feature
#       under /api/v1, and a redirect from / to /docs. Also runnable directly
#       so the start script needs no CLI flags; host and port live here.
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.config import get_settings
from app.routers import agent, calc, weather
from app.utils.logger import setup_logging

setup_logging()
get_settings()

app = FastAPI(title="Hello World: Conventional vs AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calc.router, prefix="/api/v1")
app.include_router(weather.router, prefix="/api/v1")
app.include_router(agent.router, prefix="/api/v1")


@app.get("/")
async def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8430)
