# Date: October 1, 2026
# Name: Sri
# Desc: Builds the FastAPI app: CORS for local dev, one router per feature
#       under /api/v1, and a redirect from / to /docs. Also runnable directly
#       so the start script needs no CLI flags; host and port live here.
#
# Date: October 1, 2026
# Name: Sri
# Desc: When frontend/dist exists (copied in by the Dockerfile's build stage)
#       it is also served as static files plus a catch-all SPA route, so the
#       whole app runs as one container on Azure App Service. In local dev
#       the frontend runs separately via Vite, so that check finds nothing
#       and only the API is served.
from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import agent, calc, weather
from app.utils.logger import setup_logging

setup_logging()
get_settings()

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = REPO_ROOT / "frontend" / "dist"
DIAGRAM_BACKEND = REPO_ROOT / "diagram" / "backend"

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


# The architecture diagram service (diagram/) normally runs on its own; when
# its folder is present in the same container it is mounted here under
# /diagram so the Architecture tab works from one deployment. Mounted before
# the SPA catch-all below so that route never swallows /diagram.
if DIAGRAM_BACKEND.exists():
    sys.path.insert(0, str(DIAGRAM_BACKEND))
    from diagram_app.main import app as diagram_app  # noqa: E402

    app.mount("/diagram", diagram_app)

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="frontend-assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str) -> FileResponse:
        candidate = FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")

else:

    @app.get("/")
    async def root() -> RedirectResponse:
        return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8430)
