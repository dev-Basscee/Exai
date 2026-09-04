import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("exampredict-database")

# Engine configuration
def create_engine_instance():
    db_url = settings.get_async_database_url()
    connect_args = {}
    engine_kwargs = {
        "echo": False,
        "future": True,
    }

    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    else:
        # Compatibility with Supabase PgBouncer / Supavisor connection pooling (port 6543)
        # Prepared statements must be disabled in transaction pooling mode
        connect_args["statement_cache_size"] = 0
        engine_kwargs.update({
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_timeout": settings.DB_POOL_TIMEOUT,
            "pool_recycle": settings.DB_POOL_RECYCLE,
            "pool_pre_ping": True,
        })

    engine_kwargs["connect_args"] = connect_args
    return create_async_engine(db_url, **engine_kwargs)


engine = create_engine_instance()

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining database sessions."""
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables on application startup."""
    # Ensure all models are registered on Base.metadata before creating tables
    import app.models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified and initialized.")
