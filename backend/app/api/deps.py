from typing import AsyncGenerator, Optional
import jwt
from fastapi import Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
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
    Supports Supabase Auth Bearer JWT tokens or falls back to 'default_user' for MVP/local use.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            if settings.SUPABASE_JWT_SECRET:
                payload = jwt.decode(
                    token,
                    settings.SUPABASE_JWT_SECRET,
                    algorithms=["HS256"],
                    audience="authenticated"
                )
                return str(payload.get("sub", f"user_{token[:8]}"))
            else:
                # If secret not set, read sub claim if present, else fallback
                payload = jwt.decode(token, options={"verify_signature": False})
                if "sub" in payload:
                    return str(payload["sub"])
        except Exception:
            return f"user_{token[:8]}"
    return "default_user"
