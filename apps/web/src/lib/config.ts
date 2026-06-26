// Central API configuration for the application
// This ensures all API requests use the correct base URL based on environment

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 
  (isDevelopment ? 'http://localhost:8080' : '');

// Validate that API URL is set in production
if (typeof window !== 'undefined') {
  if (isProduction && !process.env.NEXT_PUBLIC_API_URL) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_API_URL is not set in production!');
    console.error('❌ This will cause all API requests to fail.');
    console.error('❌ Please set NEXT_PUBLIC_API_URL in your Vercel project settings.');
    throw new Error('NEXT_PUBLIC_API_URL is required in production but not set. Please configure this environment variable in Vercel.');
  } else if (isDevelopment && !process.env.NEXT_PUBLIC_API_URL) {
    console.warn('⚠️ NEXT_PUBLIC_API_URL not set in development, using fallback: http://localhost:8080');
    console.warn('⚠️ Set NEXT_PUBLIC_API_URL in .env.local to override.');
  } else if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('✅ API Base URL:', process.env.NEXT_PUBLIC_API_URL);
  }
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
