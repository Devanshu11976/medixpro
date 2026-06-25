"""Standardized response utilities for API consistency."""
from typing import Any, Optional, List
from fastapi import status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class APIResponse:
    """Standardized API response format."""
    
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success",
        status_code: int = status.HTTP_200_OK
    ) -> JSONResponse:
        """
        Create a success response.
        
        Args:
            data: Response data
            message: Success message
            status_code: HTTP status code
        
        Returns:
            JSONResponse with standardized format
        """
        return JSONResponse(
            status_code=status_code,
            content={
                "success": True,
                "message": message,
                "data": data,
                "errors": None
            }
        )
    
    @staticmethod
    def created(
        data: Any = None,
        message: str = "Resource created successfully"
    ) -> JSONResponse:
        """Create a 201 Created response."""
        return APIResponse.success(
            data=data,
            message=message,
            status_code=status.HTTP_201_CREATED
        )
    
    @staticmethod
    def no_content(message: str = "Request processed successfully") -> JSONResponse:
        """Create a 204 No Content response."""
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content={
                "success": True,
                "message": message,
                "data": None,
                "errors": None
            }
        )
    
    @staticmethod
    def error(
        message: str = "An error occurred",
        errors: Optional[List[dict]] = None,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    ) -> JSONResponse:
        """
        Create an error response.
        
        Args:
            message: Error message
            errors: List of error details
            status_code: HTTP status code
        
        Returns:
            JSONResponse with standardized error format
        """
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "message": message,
                "data": None,
                "errors": errors or []
            }
        )
    
    @staticmethod
    def bad_request(
        message: str = "Bad request",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 400 Bad Request response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @staticmethod
    def unauthorized(
        message: str = "Unauthorized access",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 401 Unauthorized response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    @staticmethod
    def forbidden(
        message: str = "Access forbidden",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 403 Forbidden response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    @staticmethod
    def not_found(
        message: str = "Resource not found",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 404 Not Found response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @staticmethod
    def conflict(
        message: str = "Resource conflict",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 409 Conflict response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_409_CONFLICT
        )
    
    @staticmethod
    def validation_error(
        message: str = "Validation failed",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 422 Unprocessable Entity response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
    
    @staticmethod
    def too_many_requests(
        message: str = "Too many requests",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 429 Too Many Requests response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    @staticmethod
    def server_error(
        message: str = "Internal server error",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 500 Internal Server Error response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    @staticmethod
    def service_unavailable(
        message: str = "Service unavailable",
        errors: Optional[List[dict]] = None
    ) -> JSONResponse:
        """Create a 503 Service Unavailable response."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )

class PaginatedResponse:
    """Standardized paginated response format."""
    
    @staticmethod
    def create(
        data: List[Any],
        total: int,
        page: int,
        page_size: int,
        message: str = "Success"
    ) -> JSONResponse:
        """
        Create a paginated response.
        
        Args:
            data: List of items
            total: Total number of items
            page: Current page number
            page_size: Number of items per page
            message: Success message
        
        Returns:
            JSONResponse with pagination metadata
        """
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        has_next = page < total_pages
        has_prev = page > 1
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": message,
                "data": data,
                "errors": None,
                "pagination": {
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": total_pages,
                    "has_next": has_next,
                    "has_prev": has_prev
                }
            }
        )
