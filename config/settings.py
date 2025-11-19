# config/settings.py
from pydantic import BaseSettings, Field, AnyUrl
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "hotel-monorepo-api"
    ENV: str = Field("development", env="ENV")
    DATABASE_URL: Optional[str] = Field(None, env="DATABASE_URL")
    # add other keys like SECRET_KEY, SMTP settings, etc.

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"

settings = Settings()
