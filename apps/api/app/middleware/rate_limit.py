"""Rate limiting middleware for API protection."""
from fastapi import Request, HTTPException, status
from collections import defaultdict
from typing import Dict
import time
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
        self.max_requests = 100  # Max requests per window
        self.window = 60  # Time window in seconds
    
    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed for given key."""
        now = time.time()
        
        # Clean old requests
        self.requests[key] = [
            timestamp for timestamp in self.requests[key]
            if now - timestamp < self.window
        ]
        
        # Check if under limit
        if len(self.requests[key]) >= self.max_requests:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True

rate_limiter = RateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware."""
    # Get client identifier
    client_ip = request.client.host if request.client else "unknown"
    
    # Skip rate limiting for health endpoints
    if request.url.path in ["/health", "/readiness", "/liveness", "/version"]:
        return await call_next(request)
    
    # Check rate limit
    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )
    
    return await call_next(request)
