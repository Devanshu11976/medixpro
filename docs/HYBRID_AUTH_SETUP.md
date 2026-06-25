# Hybrid Authentication Setup for Medixpro

## Overview

Medixpro uses a hybrid authentication system:

- **Admin & Worker**: Email + Password with JWT issued by backend (LOCAL auth)
- **Retailers**: Google OAuth via Supabase Auth, then backend issues its own JWT

This approach keeps your ERP secure while making retailer onboarding simple.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Backend API    │    │   Supabase Auth  │
│  (FastAPI)      │    │  (Google OAuth)  │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL   │
│   Database     │
└─────────────────┘
```

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Note down:
   - Project URL
   - anon/public key

### 2. Configure Google OAuth in Supabase

1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URL:
   - `http://localhost:3000/login/google-sso/callback` (for development)
   - `https://your-domain.com/login/google-sso/callback` (for production)

### 3. Environment Variables

Add the following to your `.env` file:

```bash
# Frontend (apps/web/.env.local)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend (apps/api/.env)
SUPABASE_URL=your-supabase-project-url
SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 4. Install Dependencies

Frontend (already installed):
```bash
cd apps/web
npm install @supabase/supabase-js
```

Backend (already added to requirements.txt):
```bash
cd apps/api
pip install supabase
```

## Authentication Flows

### Admin/Worker Login (LOCAL Auth)

1. User enters email and password
2. Frontend sends to `/api/auth/login`
3. Backend verifies password against database
4. Backend issues JWT tokens (access + refresh)
5. Frontend stores tokens and user session

**Security**: Admin and Worker accounts cannot use Google OAuth. If someone tries to use Google auth with an Admin/Worker email, the backend will reject it.

### Retailer Login (Google OAuth)

1. User clicks "Continue with Google"
2. Frontend opens popup to `/login/google-sso`
3. Popup redirects to Supabase Google OAuth
4. User authenticates with Google
5. Supabase redirects to callback page with session
6. Callback extracts Supabase access token
7. Callback sends token to parent window
8. Frontend sends token to `/api/auth/google`
9. Backend verifies token with Supabase
10. Backend creates/updates user record with `auth_provider="GOOGLE"`
11. Backend issues its own JWT tokens
12. Frontend stores tokens and user session

**Security**: 
- Backend verifies Supabase token before issuing its own JWT
- Only RETAILER role can use Google auth
- New retailers start with PENDING status (awaiting admin approval)

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(200), -- NULL for Google auth users
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'WORKER', -- ADMIN, WORKER, RETAILER
    auth_provider VARCHAR(50) DEFAULT 'LOCAL', -- LOCAL, GOOGLE
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, PENDING, DISABLED
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Retailers Table

```sql
CREATE TABLE retailers (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(200) NOT NULL, -- Shop name
    contact_person VARCHAR(100), -- Owner name
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    balance FLOAT DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'PENDING', -- ACTIVE, PENDING, DISABLED
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### `/api/auth/login`
- **Method**: POST
- **Body**: `{ email, password }`
- **Use**: Admin and Worker login
- **Response**: JWT tokens + user info

### `/api/auth/google`
- **Method**: POST
- **Body**: `{ email, name, google_token }`
- **Use**: Retailer Google OAuth
- **Response**: JWT tokens + user info + profile_complete flag

### `/api/auth/complete-profile`
- **Method**: POST
- **Body**: `{ shop_name, owner_name, phone, address }`
- **Use**: Complete retailer profile after Google signup
- **Response**: Success message

### `/api/auth/me`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Use**: Get current user info
- **Response**: User details

## Security Considerations

1. **Role-Based Access**: Admin/Worker cannot use Google auth
2. **Token Verification**: Backend verifies Supabase tokens before issuing JWT
3. **Account Locking**: Failed login attempts lock accounts temporarily
4. **Status Checks**: DISABLED accounts cannot authenticate
5. **Pending Approval**: New retailers require admin approval

## Testing

### Test Admin Login
```bash
# Use seeded admin credentials
Email: admin@medixpro.com
Password: Admin@123
```

### Test Worker Login
```bash
# Use seeded worker credentials
Email: worker@medixpro.com
Password: Worker@123
```

### Test Retailer Google OAuth
1. Click "Continue with Google" on login page
2. Authenticate with Google
3. Complete profile if first time
4. Wait for admin approval

## Troubleshooting

### Supabase Not Configured Error
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart the development server after adding env vars

### Google OAuth Redirect Error
- Check that redirect URL is configured in Supabase
- Ensure URL matches exactly (including http/https and port)

### Admin Cannot Use Google Auth
- This is by design. Admin/Worker must use email/password
- If you need to change this, modify the backend validation logic

### Token Verification Failed
- Check that `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are set in backend
- Ensure Supabase project is active
