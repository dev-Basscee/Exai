import os
import tempfile
from pathlib import Path
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Point test database to a temp SQLite db
test_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
test_db_url = f"sqlite+aiosqlite:///{test_db_file.name}"

os.environ["DATABASE_URL"] = test_db_url
os.environ["LLM_PROVIDER"] = "mock"

from app.database import Base, get_db
from app.api.deps import get_db_session
from app.main import app

test_engine = create_async_engine(test_db_url, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def init_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    try:
        Path(test_db_file.name).unlink(missing_ok=True)
    except Exception:
        pass


@pytest_asyncio.fixture
async def db_session():
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    async def override_get_db():
        async with TestSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_db_session] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
