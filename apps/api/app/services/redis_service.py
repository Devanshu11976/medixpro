"""Redis service with Upstash integration and retry logic."""
import asyncio
import logging
from typing import Optional, Any, List
import redis.asyncio as redis
from redis.asyncio import Redis
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from config import settings

logger = logging.getLogger(__name__)

class RedisService:
    """Redis service with connection pooling and retry logic."""
    
    def __init__(self):
        self.redis_client: Optional[Redis] = None
        self._lock = asyncio.Lock()
    
    async def get_client(self) -> Redis:
        """Get or create Redis client with connection pooling."""
        if self.redis_client is None:
            async with self._lock:
                if self.redis_client is None:
                    await self._create_client()
        return self.redis_client
    
    async def _create_client(self):
        """Create Redis client with Upstash configuration."""
        try:
            if settings.redis_url:
                # Upstash Redis URL
                self.redis_client = redis.from_url(
                    settings.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    ssl=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    max_connections=10
                )
                # Test connection
                await self.redis_client.ping()
                logger.info("Redis client connected successfully")
            else:
                # Fallback to local Redis
                self.redis_client = redis.Redis(
                    host=settings.redis_host if hasattr(settings, 'redis_host') else 'localhost',
                    port=settings.redis_port if hasattr(settings, 'redis_port') else 6379,
                    db=0,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    max_connections=10
                )
                await self.redis_client.ping()
                logger.info("Local Redis client connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            self.redis_client = None
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis with retry logic."""
        try:
            client = await self.get_client()
            if client:
                return await client.get(key)
            return None
        except Exception as e:
            logger.error(f"Redis GET error for key {key}: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def set(
        self,
        key: str,
        value: str,
        expire: Optional[int] = None
    ) -> bool:
        """Set value in Redis with optional expiration."""
        try:
            client = await self.get_client()
            if client:
                if expire:
                    return await client.setex(key, expire, value)
                return await client.set(key, value)
            return False
        except Exception as e:
            logger.error(f"Redis SET error for key {key}: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def delete(self, key: str) -> bool:
        """Delete key from Redis."""
        try:
            client = await self.get_client()
            if client:
                return await client.delete(key) > 0
            return False
        except Exception as e:
            logger.error(f"Redis DELETE error for key {key}: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis."""
        try:
            client = await self.get_client()
            if client:
                return await client.exists(key) > 0
            return False
        except Exception as e:
            logger.error(f"Redis EXISTS error for key {key}: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration time for key."""
        try:
            client = await self.get_client()
            if client:
                return await client.expire(key, seconds)
            return False
        except Exception as e:
            logger.error(f"Redis EXPIRE error for key {key}: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def incr(self, key: str, amount: int = 1) -> int:
        """Increment value by amount."""
        try:
            client = await self.get_client()
            if client:
                return await client.incrby(key, amount)
            return 0
        except Exception as e:
            logger.error(f"Redis INCR error for key {key}: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def get_many(self, keys: List[str]) -> dict:
        """Get multiple values from Redis."""
        try:
            client = await self.get_client()
            if client:
                values = await client.mget(keys)
                return dict(zip(keys, values))
            return {}
        except Exception as e:
            logger.error(f"Redis MGET error: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def set_many(self, mapping: dict, expire: Optional[int] = None) -> bool:
        """Set multiple key-value pairs in Redis."""
        try:
            client = await self.get_client()
            if client:
                if expire:
                    # Use pipeline for multiple operations with expiration
                    pipe = client.pipeline()
                    for key, value in mapping.items():
                        pipe.setex(key, expire, value)
                    await pipe.execute()
                else:
                    await client.mset(mapping)
                return True
            return False
        except Exception as e:
            logger.error(f"Redis MSET error: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((redis.ConnectionError, redis.TimeoutError)),
    )
    async def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern."""
        try:
            client = await self.get_client()
            if client:
                keys = []
                async for key in client.scan_iter(match=pattern):
                    keys.append(key)
                if keys:
                    return await client.delete(*keys)
                return 0
            return 0
        except Exception as e:
            logger.error(f"Redis DELETE_PATTERN error for pattern {pattern}: {str(e)}")
            raise
    
    async def close(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
            self.redis_client = None
            logger.info("Redis connection closed")

# Global Redis service instance
redis_service = RedisService()
