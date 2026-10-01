# Date: October 1, 2026
# Name: Sri
# Desc: The diagram backend. Exposes the architecture diagram's data as an API
#       under /api/v1 and serves the diagram frontend (../frontend) from the
#       same process. Fully separate from the main hello-world app (own port,
#       own requirements); the main frontend only embeds its page on the
#       Architecture tab. Runnable directly, host and port live here.
from __future__ import annotations

import logging
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import Response

from diagram_app.routers import diagram

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"



class RevalidatingStaticFiles(StaticFiles):
    # Without a Cache-Control header a browser may reuse a stale copy of the
    # page for a long while (it guesses from Last-Modified), so edits to the
    # diagram frontend would not show up. no-cache makes it revalidate each
    # time, which is cheap because the ETag still gives a 304.
    async def get_response(self, path: str, scope) -> Response:
        response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "no-cache"
        return response


app = FastAPI(title="Hello World: diagram service")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(diagram.router, prefix="/api/v1")
app.include_router(diagram.health_router, prefix="/api/v1")

# Mounted last so it never shadows the API routes; html=True serves index.html at /.
app.mount("/", RevalidatingStaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8440)
