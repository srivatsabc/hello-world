# Date: October 1, 2026
# Name: Sri
# Desc: The Conventional tab's weather endpoint, a direct call to the free
#       weather API through the weather service.
from __future__ import annotations

from fastapi import APIRouter, Query

from app.models.weather import WeatherResponse
from app.services import weather_service

router = APIRouter(prefix="/weather-management/weather-reports", tags=["weather-management"])


@router.get("/current-report", response_model=WeatherResponse)
def get_weather(city: str = Query(..., description="City name, e.g. London")) -> WeatherResponse:
    return weather_service.get_current_weather(city)
