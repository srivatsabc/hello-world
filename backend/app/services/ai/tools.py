# Date: October 1, 2026
# Name: Sri
# Desc: The three tools the agent is allowed to use, each a thin wrapper over
#       the same service functions the REST routes call. The docstrings
#       below are tool descriptions read by the LLM, so they are left
#       untouched by any comment cleanup. A tool failure comes back as a
#       string the model can relay, not a raised exception.
from __future__ import annotations

from fastapi import HTTPException
from langchain.tools import tool

from app.services import calc_service, weather_service


@tool
def add(first_number: float, second_number: float) -> float:
    """Adds two numbers and returns the sum."""
    return calc_service.add_numbers(first_number, second_number)


@tool
def subtract(first_number: float, second_number: float) -> float:
    """Subtracts the second number from the first and returns the difference."""
    return calc_service.subtract_numbers(first_number, second_number)


@tool
def get_weather(city: str) -> str:
    """Gets the current weather for a given city."""
    try:
        weather = weather_service.get_current_weather(city)
    except HTTPException as exc:
        return f"Weather lookup failed: {exc.detail}"
    return (
        f"{weather.city}, {weather.country}: {weather.condition}, "
        f"{weather.temperature_c} C, wind {weather.wind_speed_kmh} km/h."
    )


# The one registry of tools the agent may call; nothing else is ever exposed.
AGENT_TOOLS = [add, subtract, get_weather]
