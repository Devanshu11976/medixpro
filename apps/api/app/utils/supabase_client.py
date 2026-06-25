from supabase import create_client, Client
from config import settings

def get_supabase_client() -> Client:
    """Get Supabase client for verifying Google OAuth tokens."""
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise ValueError("Supabase credentials not configured")
    return create_client(settings.supabase_url, settings.supabase_publishable_key)
