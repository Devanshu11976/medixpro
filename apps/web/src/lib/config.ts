// Central API configuration for the application
// This ensures all API requests use the correct base URL based on environment

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Validate that API URL is set in production
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
  console.log('🔗 API Base URL:', process.env.NEXT_PUBLIC_API_URL);
} else if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using fallback:', API_BASE_URL);
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
