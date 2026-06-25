"""Transaction management utilities for database operations."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def transaction(session: AsyncSession) -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for database transactions with automatic rollback on error.
    
    Usage:
        async with transaction(session) as sess:
            # Perform database operations
            user_repo = UserRepository(sess)
            await user_repo.create(...)
            # If no exception occurs, transaction commits automatically
    """
    try:
        yield session
        await session.commit()
        logger.info("Transaction committed successfully")
    except Exception as e:
        await session.rollback()
        logger.error(f"Transaction rolled back due to error: {str(e)}")
        raise

@asynccontextmanager
async def nested_transaction(session: AsyncSession) -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for nested transactions (savepoints).
    Useful for operations that may need to be rolled back independently.
    
    Usage:
        async with nested_transaction(session) as sess:
            # Perform operations that can be independently rolled back
    """
    try:
        nested = session.begin_nested()
        yield session
        await session.commit()
        logger.info("Nested transaction committed successfully")
    except Exception as e:
        await session.rollback()
        logger.error(f"Nested transaction rolled back due to error: {str(e)}")
        raise

async def run_in_transaction(session: AsyncSession, func) -> any:
    """
    Run a function within a transaction.
    
    Args:
        session: AsyncSession instance
        func: Async function to execute within transaction
    
    Returns:
        Result of the function
    
    Example:
        result = await run_in_transaction(session, lambda sess: some_operation(sess))
    """
    async with transaction(session):
        return await func(session)
