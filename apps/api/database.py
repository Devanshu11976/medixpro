from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool, QueuePool
from config import settings
import logging

logger = logging.getLogger(__name__)

engine_args = {}
if settings.async_database_url.startswith("postgresql") and settings.environment != "development":
    engine_args["connect_args"] = {"ssl": "require"}

# Create async engine with connection pooling for production
engine = create_async_engine(
    settings.async_database_url,
    echo=settings.environment == "development",
    pool_size=10 if settings.environment == "production" else 5,
    max_overflow=20 if settings.environment == "production" else 10,
    pool_pre_ping=True,
    pool_recycle=3600,
    poolclass=QueuePool if settings.environment == "production" else NullPool,
    **engine_args
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    """Dependency for database session with error handling."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def check_database_connection() -> bool:
    """Check if database connection is healthy."""
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False
