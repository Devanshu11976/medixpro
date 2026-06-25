# Medixpro Developer Guide

This guide covers development setup, architecture, and best practices for contributing to Medixpro.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Database](#database)
- [Testing](#testing)
- [Code Style](#code-style)
- [Contributing](#contributing)

## Development Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- Docker and Docker Compose (optional but recommended)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/medixpro.git
   cd medixpro
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your local development values
   ```

3. **Start services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Install API dependencies:**
   ```bash
   cd apps/api
   pip install -r requirements.txt
   ```

5. **Install web dependencies:**
   ```bash
   cd apps/web
   npm install
   ```

6. **Run database migrations:**
   ```bash
   cd apps/api
   alembic upgrade head
   ```

7. **Start development servers:**
   ```bash
   # Terminal 1 - API
   cd apps/api
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2 - Web
   cd apps/web
   npm run dev
   ```

8. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Project Structure

```
medixpro/
├── apps/
│   ├── api/                 # FastAPI backend
│   │   ├── app/
│   │   │   ├── middleware/   # Custom middleware
│   │   │   ├── models/      # SQLAlchemy models
│   │   │   ├── routers/     # API route handlers
│   │   │   ├── schemas/     # Pydantic schemas
│   │   │   ├── services/    # Business logic
│   │   │   ├── repositories/# Data access layer
│   │   │   └── utils/       # Utility functions
│   │   ├── alembic/         # Database migrations
│   │   ├── main.py          # Application entry point
│   │   └── requirements.txt
│   └── web/                 # Next.js frontend
│       ├── src/
│       │   ├── app/         # Next.js app directory
│       │   ├── components/  # React components
│       │   ├── lib/         # Utilities and helpers
│       │   └── types/       # TypeScript types
│       ├── public/          # Static assets
│       └── package.json
├── nginx/                   # Nginx configuration
├── docs/                    # Documentation
├── docker-compose.yml       # Development Docker Compose
├── docker-compose.prod.yml  # Production Docker Compose
└── .env.example            # Environment variables template
```

## Architecture

### Backend Architecture

Medixpro follows a clean architecture pattern with separation of concerns:

- **Controllers (Routers):** Handle HTTP requests and responses
- **Services:** Contain business logic
- **Repositories:** Handle data access using SQLAlchemy
- **Models:** Define database schema
- **Schemas:** Define API request/response shapes using Pydantic
- **Middleware:** Cross-cutting concerns (auth, logging, security)

### Frontend Architecture

The frontend uses Next.js 16 with App Router:

- **App Router:** File-based routing in `src/app/`
- **Components:** Reusable React components in `src/components/`
- **Server Components:** Default for better performance
- **Client Components:** Marked with `"use client"` directive
- **API Client:** Axios-based API client in `src/lib/api.ts`

### Data Flow

1. **Request Flow:**
   - HTTP Request → Middleware → Router → Service → Repository → Database
   - Response flows back through the same layers

2. **Frontend to Backend:**
   - React Component → API Client → HTTP Request → Backend API
   - Response → Component State Update

## API Development

### Creating a New Endpoint

1. **Define the schema:**
   ```python
   # apps/api/app/schemas/your_schema.py
   from pydantic import BaseModel, EmailStr
   from typing import Optional

   class YourCreateSchema(BaseModel):
       name: str
       email: EmailStr
       description: Optional[str] = None

   class YourResponseSchema(BaseModel):
       id: int
       name: str
       email: str
       description: Optional[str]

       class Config:
           from_attributes = True
   ```

2. **Create the repository:**
   ```python
   # apps/api/app/repositories/your_repository.py
   from app.repositories.base import BaseRepository
   from app.models.models import YourModel

   class YourRepository(BaseRepository[YourModel]):
       def __init__(self, session):
           super().__init__(YourModel, session)
       
       async def get_by_name(self, name: str):
           result = await self.session.execute(
               select(YourModel).where(YourModel.name == name)
           )
           return result.scalar_one_or_none()
   ```

3. **Create the service:**
   ```python
   # apps/api/app/services/your_service.py
   from app.repositories.your_repository import YourRepository
   from app.schemas.your_schema import YourCreateSchema

   class YourService:
       def __init__(self, session):
           self.repo = YourRepository(session)
       
       async def create(self, data: YourCreateSchema):
           return await self.repo.create(**data.dict())
   ```

4. **Create the router:**
   ```python
   # apps/api/app/routers/your_router.py
   from fastapi import APIRouter, Depends
   from sqlalchemy.ext.asyncio import AsyncSession
   from database import get_db
   from app.services.your_service import YourService
   from app.schemas.your_schema import YourCreateSchema, YourResponseSchema
   from app.utils.response import APIResponse

   router = APIRouter(prefix="/api/your-endpoint", tags=["Your Resource"])

   @router.post("/", response_model=YourResponseSchema)
   async def create_your_resource(
       data: YourCreateSchema,
       db: AsyncSession = Depends(get_db)
   ):
       service = YourService(db)
       result = await service.create(data)
       return APIResponse.success(data=result, status_code=201)
   ```

5. **Register the router:**
   ```python
   # apps/api/app/routers/routes.py
   from app.routers.your_router import router as your_router

   api_router.include_router(your_router)
   ```

### Using the Repository Pattern

```python
from database import AsyncSessionLocal, get_db
from app.repositories.user_repository import UserRepository
from app.utils.transaction import transaction

async def example_usage():
    async with AsyncSessionLocal() as session:
        user_repo = UserRepository(session)
        
        # Create user
        user = await user_repo.create(
            email="user@example.com",
            name="John Doe",
            role="RETAILER"
        )
        
        # Get user by email
        user = await user_repo.get_by_email("user@example.com")
        
        # Update user
        await user_repo.update_status(user.id, "ACTIVE")
        
        # Transaction example
        async with transaction(session):
            # Multiple operations that will commit together
            await user_repo.create(...)
            await user_repo.update(...)
```

### Using Caching

```python
from app.utils.cache import cached, cache_manager

# Decorator-based caching
@cached("user_profile", expire=300)
async def get_user_profile(user_id: int):
    # Expensive operation
    return user_data

# Manual caching
async def manual_cache_example():
    # Get or set
    data = await cache_manager.get_or_set(
        "key",
        lambda: expensive_operation(),
        expire=3600
    )
    
    # Invalidate
    await cache_manager.invalidate_user_cache(user_id)
```

## Frontend Development

### Creating a New Page

1. **Create the page file:**
   ```typescript
   // apps/web/src/app/your-page/page.tsx
   import type { Metadata } from "next";

   export const metadata: Metadata = {
     title: "Your Page",
     description: "Page description",
   };

   export default function YourPage() {
     return (
       <div>
         <h1>Your Page</h1>
       </div>
     );
   }
   ```

2. **Add loading state (optional):**
   ```typescript
   // apps/web/src/app/your-page/loading.tsx
   export default function Loading() {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
       </div>
     );
   }
   ```

### Creating a Component

```typescript
// apps/web/src/components/your-component.tsx
import { cn } from "@/lib/utils";

interface YourComponentProps {
  title: string;
  className?: string;
}

export function YourComponent({ title, className }: YourComponentProps) {
  return (
    <div className={cn("p-4 rounded-lg", className)}>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
}
```

### API Calls

```typescript
// Using the API client
import api from "@/lib/api";

async function fetchData() {
  try {
    const response = await api.get("/api/endpoint");
    return response.data;
  } catch (error) {
    console.error("API error:", error);
  }
}
```

### State Management

Use React hooks for local state:

```typescript
import { useState, useEffect } from "react";

export function YourComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

## Database

### Creating a Migration

```bash
cd apps/api
alembic revision --autogenerate -m "description of changes"
```

### Running Migrations

```bash
alembic upgrade head
```

### Rolling Back

```bash
alembic downgrade -1
```

### Database Models

```python
from sqlalchemy import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
import datetime

class YourModel(Base):
    __tablename__ = "your_table"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
```

## Testing

### API Tests

```python
# tests/test_api.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_create_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/users",
            json={
                "email": "test@example.com",
                "name": "Test User",
                "password": "test123"
            }
        )
        assert response.status_code == 201
        assert response.json()["success"] is True
```

### Frontend Tests

```bash
cd apps/web
npm test
```

## Code Style

### Python

- Follow PEP 8
- Use type hints
- Write docstrings for functions and classes
- Maximum line length: 100 characters

### TypeScript/React

- Use functional components with hooks
- Prefer server components over client components
- Use TypeScript for type safety
- Follow ESLint rules

### Git Commit Messages

Use conventional commits:

```
feat: add new feature
fix: fix bug in authentication
docs: update deployment guide
style: format code
refactor: restructure code
test: add tests for user service
chore: update dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Write tests for your changes
5. Ensure all tests pass
6. Commit your changes with conventional commit messages
7. Push to your fork: `git push origin feature/your-feature`
8. Create a pull request

### Pull Request Guidelines

- Describe what your PR does
- Link to related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

## Useful Commands

### API Development

```bash
# Run API server
uvicorn main:app --reload

# Run tests
pytest tests/ -v

# Create migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Check code style
flake8 app/
```

### Frontend Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up -d --build
```

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

## Getting Help

- GitHub Issues: https://github.com/yourusername/medixpro/issues
- Documentation: https://docs.medixpro.com
- Email: dev@medixpro.com
