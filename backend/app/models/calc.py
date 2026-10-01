# Date: October 1, 2026
# Name: Sri
# Desc: Request and response shapes for the add/subtract endpoints. JSON
#       fields stay snake_case end to end, the frontend types mirror them.
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class CalcRequest(BaseModel):
    first_number: float
    second_number: float


class CalcResponse(BaseModel):
    operation: Literal["add", "subtract"]
    first_number: float
    second_number: float
    result: float
