# Date: October 1, 2026
# Name: Sri
# Desc: One Settings object reading the project's own .env (hello-world/.env).
#       load_dotenv runs with override=True first so a stale shell export from
#       another project can never shadow the values in this file. Secrets
#       default to "" so a missing one fails at the call site with a clear
#       message rather than at import time.
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = REPO_ROOT / ".env"

load_dotenv(ENV_PATH, override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ENV_PATH), extra="ignore")

    azure_ai_foundry_endpoint: str = ""
    azure_ai_foundry_api_key: str = ""
    azure_ai_foundry_chat_deployment: str = "gpt-5.2"

    weather_geocoding_url: str = "https://geocoding-api.open-meteo.com/v1/search"
    weather_forecast_url: str = "https://api.open-meteo.com/v1/forecast"
    weather_timeout_seconds: float = 10.0


@lru_cache
def get_settings() -> Settings:
    return Settings()
