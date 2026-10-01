# Date: October 1, 2026
# Name: Sri
# Desc: The Conventional tab's add and subtract endpoints. Each route makes
#       one call into the calc service.
from __future__ import annotations

from fastapi import APIRouter

from app.models.calc import CalcRequest, CalcResponse
from app.services import calc_service

router = APIRouter(prefix="/calculation-management/calculations", tags=["calculation-management"])


@router.post("/addition", response_model=CalcResponse)
def add(body: CalcRequest) -> CalcResponse:
    return CalcResponse(
        operation="add",
        **body.model_dump(),
        result=calc_service.add_numbers(body.first_number, body.second_number),
    )


@router.post("/subtraction", response_model=CalcResponse)
def subtract(body: CalcRequest) -> CalcResponse:
    return CalcResponse(
        operation="subtract",
        **body.model_dump(),
        result=calc_service.subtract_numbers(body.first_number, body.second_number),
    )
