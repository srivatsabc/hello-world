# Date: October 1, 2026
# Name: Sri
# Desc: Loads the diagram definition from data/diagram.json and validates it
#       against the Pydantic model. Cached, so the file is read once per
#       process and every request gets the same object.
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from app.models.diagram import Diagram

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "diagram.json"


@lru_cache
def get_diagram() -> Diagram:
    return Diagram.model_validate(json.loads(DATA_PATH.read_text(encoding="utf-8")))
