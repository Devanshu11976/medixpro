"""Health check utilities for monitoring system components."""
import logging
from typing import Dict, Any
from database import check_database_connection
from config import settings

logger = logging.getLogger(__name__)

async def check_redis_connection() -> bool:
    """Check if Redis connection is healthy."""
    if not settings.redis_url:
        return False
    
    try:
        import redis.asyncio as redis
        client = redis.from_url(settings.redis_url)
        await client.ping()
        await client.close()
        return True
    except Exception as e:
        logger.error(f"Redis connection check failed: {e}")
        return False

async def check_storage_connection() -> bool:
    """Check if Supabase Storage is accessible."""
    if not settings.supabase_url or not settings.supabase_publishable_key:
        return False
    
    try:
        from supabase import create_client
        client = create_client(settings.supabase_url, settings.supabase_publishable_key)
        # Try to list buckets to verify connection
        client.storage.list_buckets()
        return True
    except Exception as e:
        logger.error(f"Storage connection check failed: {e}")
        return False

async def get_health_status() -> Dict[str, Any]:
    """Get comprehensive health status of all components."""
    health_status = {
        "status": "healthy",
        "database": "disconnected",
        "redis": "disconnected",
        "storage": "disconnected",
        "version": "1.0.0",
        "environment": settings.environment
    }
    
    # Check database
    db_healthy = await check_database_connection()
    health_status["database"] = "connected" if db_healthy else "disconnected"
    
    # Check Redis
    redis_healthy = await check_redis_connection()
    health_status["redis"] = "connected" if redis_healthy else "disconnected"
    
    # Check Storage
    storage_healthy = await check_storage_connection()
    health_status["storage"] = "connected" if storage_healthy else "disconnected"
    
    # Determine overall health
    if not db_healthy:
        health_status["status"] = "unhealthy"
    elif settings.environment == "production" and not redis_healthy:
        health_status["status"] = "degraded"
    elif settings.environment == "production" and not storage_healthy:
        health_status["status"] = "degraded"
    
    return health_status
