"""Global exception handler for consistent error responses."""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

class APIException(Exception):
    """Base API exception."""
    def __init__(self, message: str, status_code: int = 500, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class NotFoundException(APIException):
    """Resource not found exception."""
    def __init__(self, message: str = "Resource not found", details: dict = None):
        super().__init__(message, status_code=404, details=details)

class BadRequestException(APIException):
    """Bad request exception."""
    def __init__(self, message: str = "Bad request", details: dict = None):
        super().__init__(message, status_code=400, details=details)

class UnauthorizedException(APIException):
    """Unauthorized exception."""
    def __init__(self, message: str = "Unauthorized", details: dict = None):
        super().__init__(message, status_code=401, details=details)

class ForbiddenException(APIException):
    """Forbidden exception."""
    def __init__(self, message: str = "Forbidden", details: dict = None):
        super().__init__(message, status_code=403, details=details)

class ConflictException(APIException):
    """Conflict exception."""
    def __init__(self, message: str = "Resource conflict", details: dict = None):
        super().__init__(message, status_code=409, details=details)

async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """Handle custom API exceptions."""
    logger.error(f"API Exception: {exc.message} - Path: {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "data": None,
            "errors": [exc.details] if exc.details else []
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    logger.warning(f"Validation error: {errors} - Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation failed",
            "data": None,
            "errors": errors
        }
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle database errors."""
    logger.error(f"Database error: {str(exc)} - Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Database error occurred",
            "data": None,
            "errors": [{"detail": "An internal database error occurred"}]
        }
    )

async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all other exceptions."""
    logger.error(f"Unhandled exception: {str(exc)} - Path: {request.url.path}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error",
            "data": None,
            "errors": [{"detail": "An unexpected error occurred"}]
        }
    )
