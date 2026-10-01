# Date: October 1, 2026
# Name: Sri
# Desc: The diagram microservice's API: the full diagram definition, and a
#       health check for the start script and any caller to poll.
from __future__ import annotations

from fastapi import APIRouter

from diagram_app.models.diagram import Diagram
from diagram_app.services import diagram_service

router = APIRouter(prefix="/diagram-management/diagrams", tags=["diagram-management"])
health_router = APIRouter(prefix="/system-management/health-checks", tags=["system-management"])


@router.get("/architecture", response_model=Diagram)
def get_diagram() -> Diagram:
    return diagram_service.get_diagram()


@health_router.get("/status")
def health() -> dict[str, str]:
    return {"status": "ok"}
