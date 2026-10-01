# Date: October 1, 2026
# Name: Sri
# Desc: Response shape for the weather endpoint, built from Open-Meteo's
#       geocoding and current-conditions answers.
from __future__ import annotations

from pydantic import BaseModel


class WeatherResponse(BaseModel):
    city: str
    country: str
    temperature_c: float
    wind_speed_kmh: float
    condition: str
