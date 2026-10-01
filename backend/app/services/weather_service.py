# Date: October 1, 2026
# Name: Sri
# Desc: Looks up current weather for a city from Open-Meteo (free, no API
#       key): geocode the city name first, then fetch current conditions for
#       that latitude/longitude. The HTTP client is a cached singleton so
#       connections are reused across requests. Used by the REST route and
#       by the AI agent's weather tool.
from __future__ import annotations

import logging
from functools import lru_cache

import httpx
from fastapi import HTTPException

from app.config import get_settings
from app.models.weather import WeatherResponse

log = logging.getLogger("hello_world.weather_service")

# WMO weather interpretation codes, as documented by Open-Meteo.
WEATHER_CODE_LABELS: dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
}


@lru_cache
def get_http_client() -> httpx.Client:
    return httpx.Client(timeout=get_settings().weather_timeout_seconds)


def get_current_weather(city: str) -> WeatherResponse:
    settings = get_settings()
    client = get_http_client()
    city = city.strip()
    if not city:
        raise HTTPException(status_code=422, detail="City name is required.")

    try:
        geo = client.get(
            settings.weather_geocoding_url,
            params={"name": city, "count": 1, "language": "en", "format": "json"},
        )
        geo.raise_for_status()
        places = geo.json().get("results") or []
        if not places:
            raise HTTPException(status_code=404, detail=f"No city found named '{city}'.")
        place = places[0]

        forecast = client.get(
            settings.weather_forecast_url,
            params={
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "current": "temperature_2m,wind_speed_10m,weather_code",
            },
        )
        forecast.raise_for_status()
        current = forecast.json()["current"]
    except httpx.HTTPError as exc:
        log.warning("weather lookup failed for %s: %s", city, exc)
        raise HTTPException(status_code=502, detail="The weather service is unavailable.") from exc

    return WeatherResponse(
        city=place["name"],
        country=place.get("country", ""),
        temperature_c=current["temperature_2m"],
        wind_speed_kmh=current["wind_speed_10m"],
        condition=WEATHER_CODE_LABELS.get(current["weather_code"], "Unknown"),
    )
