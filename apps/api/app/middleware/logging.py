"""Request logging middleware for API monitoring."""
from fastapi import Request
import logging
import time
import uuid

logger = logging.getLogger(__name__)

async def log_requests(request: Request, call_next):
    """Log all incoming requests with timing information."""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Add request ID to request state for use in endpoints
    request.state.request_id = request_id
    
    # Log request details
    logger.info(
        f"Request started | ID: {request_id} | "
        f"Method: {request.method} | Path: {request.url.path} | "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )
    
    try:
        response = await call_next(request)
        
        # Calculate duration
        process_time = time.time() - start_time
        
        # Add custom headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log response details
        logger.info(
            f"Request completed | ID: {request_id} | "
            f"Status: {response.status_code} | "
            f"Duration: {process_time:.3f}s"
        )
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"Request failed | ID: {request_id} | "
            f"Error: {str(e)} | "
            f"Duration: {process_time:.3f}s"
        )
        raise
