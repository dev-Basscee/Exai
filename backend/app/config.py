from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ExamPredict AI Backend"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database: Async SQLite by default, easily swapped to PostgreSQL/Supabase
    DATABASE_URL: str = "sqlite+aiosqlite:///./exam_predict.db"

    # Storage
    STORAGE_TYPE: str = "local"  # "local" or "supabase"
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # "gemini", "anthropic", "openai", "mock"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    # Supabase (Optional for direct integration)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def upload_path(self) -> Path:
        p = Path(self.UPLOAD_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
