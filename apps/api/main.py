from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
import logging
import os
from config import settings
from app.utils.logger import setup_logging

# Configure structured logging
setup_logging()
logger = logging.getLogger(__name__)

# Import after logging is configured
from app.routers.routes import router as api_router
from app.utils.health import get_health_status
from app.middleware.exception_handler import (
    APIException,
    api_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler
)
from app.middleware.logging import log_requests
from app.middleware.rate_limit import rate_limit_middleware
from app.middleware.security import security_middleware, csrf_protection_middleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info(f"Starting Medixpro API in {settings.environment} mode")
    logger.info(f"Environment loaded: PORT={os.getenv('PORT', '8000')}, DATABASE_URL configured: {bool(settings.database_url)}")
    
    # Initialize database engine (lazy initialization)
    try:
        from database import get_engine
        engine = get_engine()
        logger.info("Database engine initialized successfully")
    except Exception as e:
        logger.error(f"Database engine initialization failed: {e}")
        # Don't fail startup - health check will report database as disconnected
    
    # Create database tables if they do not exist (with error handling)
    try:
        from database import get_engine, AsyncSessionLocal
        from app.models.models import User, Medicine, Retailer, Order, OrderItem, Invoice, ActivityLog
        from database import Base
        
        eng = get_engine()
        async with eng.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Database table creation failed: {e}")
        # Continue startup - tables may already exist
        
    # Database seeding logic (optional - don't fail if it errors)
    try:
        from database import get_engine
        import database
        from app.models.models import User
        from app.utils.security import get_password_hash
        from sqlalchemy.future import select

        # Ensure engine is initialized
        eng = get_engine()
        
        # Ensure AsyncSessionLocal is initialized
        if database.AsyncSessionLocal is None:
            logger.warning("AsyncSessionLocal not initialized, skipping seeding")
        else:
            async with database.AsyncSessionLocal() as session:
                # Check and seed Admin
                admin_res = await session.execute(select(User).where(User.email == "admin@medixpro.com"))
                admin = admin_res.scalar_one_or_none()
                if not admin:
                    admin = User(
                        email="admin@medixpro.com",
                        password_hash=get_password_hash("Admin@123"),
                        name="System Administrator",
                        role="ADMIN",
                        status="ACTIVE",
                        auth_provider="LOCAL"
                    )
                    session.add(admin)
                    logger.info("Admin user seeded")
                else:
                    admin.password_hash = get_password_hash("Admin@123")
                    logger.info("Admin password reset on startup")

                # Check and seed Worker
                worker_res = await session.execute(select(User).where(User.email == "worker@medixpro.com"))
                if not worker_res.scalar_one_or_none():
                    worker = User(
                        email="worker@medixpro.com",
                        password_hash=get_password_hash("Worker@123"),
                        name="Warehouse Operator",
                        role="WORKER",
                        status="ACTIVE",
                        auth_provider="LOCAL"
                    )
                    session.add(worker)
                    logger.info("Worker user seeded")
                    
                await session.commit()
    except Exception as e:
        logger.warning(f"Database seeding failed (non-critical): {e}")
    
    logger.info("Medixpro API startup complete - application ready for requests")
    yield
    
    # Shutdown logic
    logger.info("Shutting down Medixpro API")
    try:
        from database import get_engine
        eng = get_engine()
        await eng.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

app = FastAPI(
    title="Medixpro API",
    description="Wholesale Medical Store ERP — Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Register exception handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains" if settings.environment == "production" else ""
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

# Security middleware (input validation, XSS, SQL injection protection)
app.add_middleware(BaseHTTPMiddleware, dispatch=security_middleware)

# Request logging middleware
app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)

# Rate limiting middleware (only in production)
if settings.environment == "production":
    app.add_middleware(BaseHTTPMiddleware, dispatch=rate_limit_middleware)
    # CSRF protection for state-changing requests in production
    app.add_middleware(BaseHTTPMiddleware, dispatch=csrf_protection_middleware)

# Response compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration
allowed_origins = ["*"] if settings.environment == "development" else [
    "https://medixpro.vercel.app",
    "https://www.medixpro.vercel.app",
    "https://medixpro-pi.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring - never requires authentication."""
    try:
        return await get_health_status()
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        # Always return a response even if health check fails
        return {
            "status": "unhealthy",
            "database": "error",
            "redis": "unknown",
            "storage": "unknown",
            "version": "1.0.0",
            "environment": settings.environment,
            "error": str(e)
        }

@app.get("/readiness")
async def readiness_check():
    """Readiness check for Kubernetes/Railway."""
    health = await get_health_status()
    return {"ready": health["status"] in ["healthy", "degraded"]}

@app.get("/liveness")
async def liveness_check():
    """Liveness check for Kubernetes/Railway - never requires authentication."""
    return {"alive": True}

@app.get("/version")
async def version_check():
    """Version endpoint for monitoring."""
    return {
        "version": "1.0.0",
        "environment": settings.environment,
        "project": "medixpro"
    }
