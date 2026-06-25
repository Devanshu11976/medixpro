"""Security middleware for comprehensive protection."""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# XSS protection patterns
XSS_PATTERNS = [
    r'<script[^>]*>.*?</script>',
    r'javascript:',
    r'on\w+\s*=',
    r'<iframe[^>]*>.*?</iframe>',
    r'<object[^>]*>.*?</object>',
    r'<embed[^>]*>.*?</embed>',
]

# SQL injection patterns
SQL_INJECTION_PATTERNS = [
    r"(\s|^)(union|select|insert|update|delete|drop|alter|create|exec|execute)(\s|$)",
    r"('|\").*('|\")",
    r";\s*(union|select|insert|update|delete|drop)",
    r"--",
    r"/\*.*\*/",
]

def sanitize_input(input_data: str) -> str:
    """Sanitize input to prevent XSS attacks."""
    if not input_data:
        return input_data
    
    sanitized = input_data
    
    # Remove potential XSS patterns
    for pattern in XSS_PATTERNS:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    
    return sanitized

def check_sql_injection(input_data: str) -> bool:
    """Check for SQL injection patterns."""
    if not input_data:
        return False
    
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, input_data, flags=re.IGNORECASE):
            return True
    
    return False

async def security_middleware(request: Request, call_next):
    """Security middleware for input validation and sanitization."""
    
    # Skip security checks for health endpoints
    if request.url.path in ["/health", "/readiness", "/liveness", "/version"]:
        return await call_next(request)
    
    # Check query parameters for injection attempts
    for key, value in request.query_params.items():
        if isinstance(value, str):
            if check_sql_injection(value):
                logger.warning(f"SQL injection attempt detected in query param: {key}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input detected"
                )
    
    # Check request body if present
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.json()
            
            def check_dict(data: dict):
                """Recursively check dictionary values."""
                for key, value in data.items():
                    if isinstance(value, str):
                        if check_sql_injection(value):
                            logger.warning(f"SQL injection attempt detected in body: {key}")
                            return True
                    elif isinstance(value, dict):
                        if check_dict(value):
                            return True
                    elif isinstance(value, list):
                        for item in value:
                            if isinstance(item, (dict, str)):
                                if isinstance(item, str):
                                    if check_sql_injection(item):
                                        logger.warning(f"SQL injection attempt detected in list")
                                        return True
                                elif isinstance(item, dict):
                                    if check_dict(item):
                                        return True
                return False
            
            if check_dict(body):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input detected"
                )
                
        except Exception:
            # If body parsing fails, just continue
            pass
    
    response = await call_next(request)
    
    # Add additional security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    
    return response

async def csrf_protection_middleware(request: Request, call_next):
    """CSRF protection middleware for state-changing requests."""
    
    # Skip CSRF for GET, HEAD, OPTIONS, TRACE
    if request.method in ["GET", "HEAD", "OPTIONS", "TRACE"]:
        return await call_next(request)
    
    # Skip for health endpoints
    if request.url.path in ["/health", "/readiness", "/liveness", "/version"]:
        return await call_next(request)
    
    # Skip for API endpoints that use JWT authentication (they have their own protection)
    if request.url.path.startswith("/api/"):
        # Check for Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return await call_next(request)
    
    # For other state-changing requests, check CSRF token
    csrf_token = request.headers.get("X-CSRF-Token")
    if not csrf_token:
        logger.warning(f"CSRF token missing for {request.method} {request.url.path}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing"
        )
    
    # Validate CSRF token (in production, this should validate against session)
    # For now, we'll just check it exists and is not empty
    if len(csrf_token) < 32:
        logger.warning(f"Invalid CSRF token for {request.method} {request.url.path}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token"
        )
    
    return await call_next(request)
