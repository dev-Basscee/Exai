from typing import AsyncGenerator, Optional
from fastapi import Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async SQLAlchemy session."""
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_current_user_id(
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Returns the authenticated user ID.
    Supports Bearer tokens (e.g. from Supabase Auth) or falls back to 'default_user' for MVP.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        # In full production with Supabase Auth, verify JWT token here:
        # payload = jwt.decode(token, ...)
        # return payload["sub"]
        return f"user_{token[:8]}"
    return "default_user"
