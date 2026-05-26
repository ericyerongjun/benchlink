"""FastAPI application factory for Benchlink backend."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def _create_agent_engine():
    """Wire up the agent engine with tools that have DB access."""
    from app.db.session import async_session
    from app.agent.llm_client import LLMClient
    from app.agent.engine import AgentEngine
    from app.agent.tools import create_tools

    tools = create_tools(session_factory=async_session)
    llm_client = LLMClient()
    return AgentEngine(llm_client=llm_client, tools=tools)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    # Startup
    from app.db.session import engine, async_session
    from app.db.base import Base
    from app.db.seed import seed_database

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        await seed_database(session)

    app.state.agent_engine = _create_agent_engine()
    logger.info("Benchlink backend started. Agent engine ready.")

    yield

    # Shutdown
    await engine.dispose()
    logger.info("Benchlink backend shut down.")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }
