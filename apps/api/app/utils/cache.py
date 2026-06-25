"""Caching utilities using Redis for performance optimization."""
from typing import Optional, Any, Callable
from functools import wraps
import json
import hashlib
import logging
from app.services.redis_service import redis_service

logger = logging.getLogger(__name__)

def cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Generate a cache key from function arguments.
    
    Args:
        prefix: Key prefix
        *args: Function arguments
        **kwargs: Function keyword arguments
    
    Returns:
        Cache key string
    """
    # Create a hash of the arguments
    key_data = f"{prefix}:{str(args)}:{str(sorted(kwargs.items()))}"
    return hashlib.md5(key_data.encode()).hexdigest()

async def get_cached(key: str) -> Optional[Any]:
    """
    Get value from cache.
    
    Args:
        key: Cache key
    
    Returns:
        Cached value or None
    """
    try:
        cached = await redis_service.get(key)
        if cached:
            return json.loads(cached)
        return None
    except Exception as e:
        logger.error(f"Cache get error for key {key}: {str(e)}")
        return None

async def set_cached(key: str, value: Any, expire: int = 3600) -> bool:
    """
    Set value in cache.
    
    Args:
        key: Cache key
        value: Value to cache
        expire: Expiration time in seconds
    
    Returns:
        True if successful, False otherwise
    """
    try:
        await redis_service.set(key, json.dumps(value), expire)
        return True
    except Exception as e:
        logger.error(f"Cache set error for key {key}: {str(e)}")
        return False

async def delete_cached(key: str) -> bool:
    """
    Delete value from cache.
    
    Args:
        key: Cache key
    
    Returns:
        True if successful, False otherwise
    """
    try:
        return await redis_service.delete(key)
    except Exception as e:
        logger.error(f"Cache delete error for key {key}: {str(e)}")
        return False

async def invalidate_pattern(pattern: str) -> int:
    """
    Invalidate all keys matching a pattern.
    
    Args:
        pattern: Key pattern (e.g., "user:*")
    
    Returns:
        Number of keys deleted
    """
    try:
        return await redis_service.delete_pattern(pattern)
    except Exception as e:
        logger.error(f"Cache pattern delete error for {pattern}: {str(e)}")
        return 0

def cached(prefix: str, expire: int = 3600):
    """
    Decorator for caching function results.
    
    Args:
        prefix: Cache key prefix
        expire: Expiration time in seconds
    
    Usage:
        @cached("user_profile", expire=300)
        async def get_user_profile(user_id: int):
            # Function logic
            return user_data
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            key = cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = await get_cached(key)
            if cached_value is not None:
                logger.debug(f"Cache hit for key: {key}")
                return cached_value
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache the result
            await set_cached(key, result, expire)
            logger.debug(f"Cache miss for key: {key}")
            
            return result
        return wrapper
    return decorator

class CacheManager:
    """Manager for cache operations with invalidation strategies."""
    
    @staticmethod
    async def get_or_set(
        key: str,
        factory: Callable,
        expire: int = 3600
    ) -> Any:
        """
        Get value from cache or set using factory function.
        
        Args:
            key: Cache key
            factory: Function to generate value if not cached
            expire: Expiration time in seconds
        
        Returns:
        Cached or generated value
        """
        cached = await get_cached(key)
        if cached is not None:
            return cached
        
        value = await factory()
        await set_cached(key, value, expire)
        return value
    
    @staticmethod
    async def warm_up(keys_values: dict, expire: int = 3600):
        """
        Warm up cache with multiple key-value pairs.
        
        Args:
            keys_values: Dictionary of keys and values
            expire: Expiration time in seconds
        """
        await redis_service.set_many(
            {k: json.dumps(v) for k, v in keys_values.items()},
            expire
        )
    
    @staticmethod
    async def invalidate_user_cache(user_id: int):
        """Invalidate all cache entries for a specific user."""
        patterns = [
            f"user:{user_id}:*",
            f"user_profile:{user_id}:*",
            f"user_permissions:{user_id}:*"
        ]
        for pattern in patterns:
            await invalidate_pattern(pattern)
    
    @staticmethod
    async def invalidate_medicine_cache(medicine_id: str):
        """Invalidate all cache entries for a specific medicine."""
        patterns = [
            f"medicine:{medicine_id}:*",
            f"medicine_stock:{medicine_id}:*",
            f"medicines_list:*"
        ]
        for pattern in patterns:
            await invalidate_pattern(pattern)
    
    @staticmethod
    async def invalidate_retailer_cache(retailer_id: str):
        """Invalidate all cache entries for a specific retailer."""
        patterns = [
            f"retailer:{retailer_id}:*",
            f"retailer_orders:{retailer_id}:*",
            f"retailer_balance:{retailer_id}:*"
        ]
        for pattern in patterns:
            await invalidate_pattern(pattern)
    
    @staticmethod
    async def clear_all():
        """Clear all cached data (use with caution)."""
        await redis_service.delete_pattern("*")

cache_manager = CacheManager()
