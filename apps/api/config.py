from pydantic_settings import BaseSettings
from pydantic import computed_field, field_validator
import os
from typing import Literal

class Settings(BaseSettings):
    # Database (Required)
    database_url: str
    
    # Redis (Required for production)
    redis_url: str = ""
    
    # Auth (Required)
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    
    # Supabase (Required for retailer Google OAuth)
    supabase_url: str = ""
    supabase_publishable_key: str = ""
    supabase_key: str = ""  # Service role key for storage operations
    
    # AI (Optional)
    groq_api_key: str = ""
    
    # WhatsApp (Optional)
    whatsapp_api_url: str = ""
    whatsapp_api_key: str = ""
    
    # Storage (Optional - can use Supabase Storage)
    storage_endpoint: str = ""
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_bucket: str = ""
    
    # Environment
    environment: Literal["development", "staging", "production"] = "development"
    
    # Business config
    invoice_prefix: str = "INV"
    order_prefix: str = "ORD"
    low_stock_threshold: int = 50
    expiry_alert_days: int = 60
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"
    max_file_size_mb: int = 20
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    
    # Postgres credentials (used by Docker Compose for the container)
    postgres_db: str = ""
    postgres_user: str = ""
    postgres_password: str = ""
    
    # Railway/Production
    port: int = 8000

    @field_validator('database_url')
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            raise ValueError('DATABASE_URL is required')
        if not v.startswith(('postgresql://', 'postgres://')):
            raise ValueError('DATABASE_URL must start with postgresql:// or postgres://')
        return v
    
    @field_validator('secret_key')
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters long')
        return v
    
    @field_validator('redis_url')
    @classmethod
    def validate_redis_url(cls, v: str, info) -> str:
        # Redis is optional - log warning if missing in production but don't fail
        if info.data.get('environment') == 'production' and not v:
            import logging
            logging.warning("REDIS_URL not configured - caching will be disabled")
        return v
    
    @field_validator('supabase_url', 'supabase_publishable_key')
    @classmethod
    def validate_supabase(cls, v: str, info) -> str:
        # Supabase is optional - log warning if missing in production but don't fail
        if info.data.get('environment') == 'production' and not v:
            import logging
            logging.warning("Supabase credentials not configured - some features will be disabled")
        return v

    @computed_field
    @property
    def async_database_url(self) -> str:
        """Convert standard postgresql:// URL to asyncpg format for SQLAlchemy async engine."""
        url = self.database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    class Config:
        env_file = ".env"
        extra = "ignore"  # ignore unknown env vars without crashing
        case_sensitive = False

def get_settings() -> Settings:
    """Get settings instance with validation."""
    try:
        return Settings()
    except Exception as e:
        print(f"❌ Configuration Error: {e}")
        print("Please check your environment variables.")
        raise

settings = get_settings()
