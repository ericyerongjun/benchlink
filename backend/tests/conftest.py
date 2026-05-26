"""Shared test fixtures."""
import pytest
import pytest_asyncio

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from httpx import ASGITransport, AsyncClient

TEST_DB_URL = "sqlite+aiosqlite:///./test.db"


@pytest_asyncio.fixture
async def test_engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def test_session(test_engine):
    from app.db.base import Base

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def app():
    """Create a FastAPI app with test overrides."""
    import os
    os.environ["DEEPSEEK_API_KEY"] = "sk-test"
    os.environ["DATABASE_URL"] = TEST_DB_URL
    os.environ["DEBUG"] = "false"

    from app.main import app as fastapi_app
    yield fastapi_app


@pytest_asyncio.fixture
async def client(app, test_session):
    """Client with DB tables ensured by test_session dependency."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
