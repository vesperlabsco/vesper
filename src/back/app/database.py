from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config.settings import settings
from app.core.logger import logger

DATABASE_URL_ASYNC = f"postgresql+asyncpg://{settings.DATABASE_MAIN_USER}:{settings.DATABASE_MAIN_PASSWORD}@{settings.DATABASE_MAIN_URL}/{settings.DATABASE_MAIN_NAME}"
DATABASE_URL_SYNC = DATABASE_URL_ASYNC.replace(
    "postgresql+asyncpg", "postgresql+psycopg2"
)


# Base pour tous les modèles
class Base(DeclarativeBase):
    pass


engine_async = create_async_engine(DATABASE_URL_ASYNC, echo=settings.DATABASE_MAIN_ECHO)
engine_sync = create_engine(DATABASE_URL_SYNC, echo=settings.DATABASE_MAIN_ECHO)


session_maker = async_sessionmaker(engine_async, expire_on_commit=False)
sync_session_maker = sessionmaker(engine_sync, expire_on_commit=False)


async def init_db():
    try:
        async with engine_async.begin():
            logger.info("CONNECTION TO DATABASE SUCCESSFULL")
    except SQLAlchemyError:
        logger.exception("ERROR : CONNECTION TO DATABASE ERROR")


def get_sync_session():
    """Generate sync session (for Alembic or scripts)."""
    with sync_session_maker() as session:
        yield session


async def get_session():
    """Generate async session (for FastAPI)."""
    async with session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
