from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_CANDIDATES = [
    Path(__file__).resolve().parents[3] / ".env",
    Path(__file__).resolve().parents[2] / ".env",
    Path.cwd() / ".env",
]
_ENV_FILE = next((path for path in _ENV_CANDIDATES if path.is_file()), None)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg://jeongtaegoon@127.0.0.1:5432/smart_city"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    weather_api_key: str = ""
    youtube_api_key: str = ""
    molit_api_key: str = ""
    weather_latitude: float = 37.3804
    weather_longitude: float = 126.8031
    realtime_interval_seconds: float = 8

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


settings = Settings()
