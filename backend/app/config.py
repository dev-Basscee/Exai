from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ExamPredict AI Backend"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database: Async SQLite by default, easily swapped to PostgreSQL/Supabase
    DATABASE_URL: str = "sqlite+aiosqlite:///./exam_predict.db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 300

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

    # Supabase (Database, Auth, Storage)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None  # Anon / publishable key
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None  # Service role secret key (backend only)
    SUPABASE_STORAGE_BUCKET: str = "exam-uploads"
    SUPABASE_JWT_SECRET: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    def get_async_database_url(self) -> str:
        """
        Normalizes the database URL so that standard Postgres connection strings
        (e.g., copied from the Supabase dashboard) use the asyncpg async driver.
        """
        url = self.DATABASE_URL.strip()
        if url.startswith("postgres://"):
            url = "postgresql+asyncpg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://"):]
        elif url.startswith("sqlite://") and not url.startswith("sqlite+aiosqlite://"):
            url = "sqlite+aiosqlite://" + url[len("sqlite://"):]

        # Normalize sslmode to ssl for asyncpg compatibility
        if "sslmode=" in url:
            url = url.replace("sslmode=", "ssl=")

        return url

    @property
    def upload_path(self) -> Path:
        p = Path(self.UPLOAD_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
