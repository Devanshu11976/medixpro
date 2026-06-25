from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool, QueuePool
from sqlalchemy import text
from config import settings
import logging
import os

logger = logging.getLogger(__name__)

# Lazy initialization - engine will be created on first use
engine = None
AsyncSessionLocal = None

def get_engine():
    """Get or create the database engine with lazy initialization."""
    global engine, AsyncSessionLocal
    if engine is None:
        engine_args = {}
        if settings.async_database_url.startswith("postgresql") and settings.environment != "development":
            engine_args["connect_args"] = {"ssl": "require"}

        # Determine pool class based on environment
        use_pooling = settings.environment == "production"
        
        # Build engine arguments - only add pooling params if using QueuePool
        if use_pooling:
            engine_args.update({
                "pool_size": 10,
                "max_overflow": 20,
                "pool_pre_ping": True,
                "pool_recycle": 3600,
                "poolclass": QueuePool
            })
        else:
            engine_args["poolclass"] = NullPool

        # Create async engine
        engine = create_async_engine(
            settings.async_database_url,
            echo=settings.environment == "development",
            **engine_args
        )

        AsyncSessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False
        )
        logger.info("Database engine initialized")
    return engine

class Base(DeclarativeBase):
    pass

async def get_db():
    """Dependency for database session with error handling."""
    eng = get_engine()
    # Ensure AsyncSessionLocal is initialized
    global AsyncSessionLocal
    if AsyncSessionLocal is None:
        raise RuntimeError("AsyncSessionLocal not initialized. Call get_engine() first.")
    
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
    """Check if database connection is healthy with retry logic."""
    import asyncio
    max_retries = 5
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            eng = get_engine()
            async with eng.begin() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Database connection check successful")
            return True
        except Exception as e:
            logger.warning(f"Database connection check attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                logger.error(f"Database connection check failed after {max_retries} attempts: {e}")
                return False
