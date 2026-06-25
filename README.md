# Medixpro

**Medixpro** is a production-ready Wholesale Medical Store ERP system that transforms how wholesale medical distributors manage their operations. It replaces manual inventory books, spreadsheets, and paper invoices with a centralized intelligent platform — built for wholesale medical distributors to manage medicines, inventory, retailers, orders, billing, and AI-powered invoice processing.

## 🎯 The Problem It Solves

Wholesale medical distributors face critical operational challenges:

- **Manual Inventory Management**: Tracking stock across multiple batches, expiry dates, and rack locations using spreadsheets or physical books
- **Inefficient Order Processing**: Phone-based orders, manual entry errors, and lack of real-time stock visibility
- **Paper-Based Invoicing**: Physical invoices prone to loss, difficult to track, and time-consuming to process
- **Retailer Management**: No centralized system to track retailer accounts, balances, and payment histories
- **Lack of Analytics**: No insights into sales trends, low stock alerts, or expiring medicines
- **Security Risks**: No proper access controls, audit trails, or data protection measures

**Medixpro solves all these problems** with a unified, intelligent platform that automates workflows, provides real-time insights, and ensures data security.

## ✨ What Makes Medixpro Unique

- **AI-Powered Invoice Processing**: Uses Groq API (LLaMA 3) and PaddleOCR for intelligent invoice extraction and processing
- **Role-Based Access Control**: Separate dashboards for Admins, Staff, and Retailers with appropriate permissions
- **Real-Time Inventory Tracking**: Live stock updates with low stock alerts and expiry notifications
- **Integrated WhatsApp Notifications**: Planned automated order confirmations and payment reminders
- **Clean Architecture**: Repository pattern, transaction support, and separation of concerns
- **Enterprise-Grade Security**: CSRF protection, XSS prevention, SQL injection detection, rate limiting
- **Production-Ready**: Comprehensive CI/CD, Docker containers, structured logging, and monitoring
- **Modern Tech Stack**: Next.js 16, FastAPI, PostgreSQL, Redis with latest best practices

## 🚀 Tech Stack & Purposes

### Frontend Layer
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router for server-side rendering, SEO optimization, and file-based routing |
| **TypeScript** | Type safety and improved developer experience with compile-time error checking |
| **Tailwind CSS v4** | Utility-first CSS framework for rapid UI development and consistent styling |
| **shadcn/ui** | Pre-built, accessible React components built on Radix UI primitives |
| **Lucide React** | Beautiful, consistent icon library for the interface |
| **Recharts** | Data visualization library for charts and graphs in dashboards |
| **React Query** | Data fetching and caching library for efficient API calls |
| **Axios** | HTTP client for API communication with interceptors and error handling |

### Backend Layer
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Modern, fast Python web framework for building APIs with automatic documentation |
| **Python 3.11** | Programming language with extensive libraries and async support |
| **SQLAlchemy 2.0** | Python SQL toolkit and ORM with async support for database operations |
| **Alembic** | Database migration tool for version control of schema changes |
| **Pydantic** | Data validation using Python type annotations with automatic API documentation |
| **Pydantic Settings** | Configuration management with environment variable validation |

### Database & Caching
| Technology | Purpose |
|------------|---------|
| **PostgreSQL 16** | Relational database for persistent data storage with ACID compliance |
| **Redis 7** | In-memory data store for caching, session management, and rate limiting |
| **Upstash Redis** | Cloud-native Redis with automatic retry logic and connection pooling |
| **Tenacity** | Retry library for resilient Redis operations with exponential backoff |

### Storage & File Management
| Technology | Purpose |
|------------|---------|
| **Supabase Storage** | Cloud storage for file uploads (invoices, documents) with CDN integration |
| **Supabase Auth** | Authentication service supporting Google OAuth for retailers |

### AI & OCR
| Technology | Purpose |
|------------|---------|
| **Groq API (LLaMA 3)** | Fast inference for AI-powered invoice processing and natural language tasks |
| **PaddleOCR** | OCR engine for extracting text from invoice images |
| **OpenCV** | Computer vision library for image preprocessing before OCR |

### Security & Authentication
| Technology | Purpose |
|------------|---------|
| **bcrypt** | Password hashing for secure credential storage |
| **PyJWT** | JWT token generation and validation for authentication |
| **python-dotenv** | Environment variable management for secure configuration |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization for consistent development and production environments |
| **Docker Compose** | Multi-container orchestration for local development and production |
| **Nginx** | Reverse proxy and load balancer for production deployments |
| **GitHub Actions** | CI/CD pipeline for automated testing, building, and deployment |
| **Vercel** | Frontend deployment platform with automatic SSL and CDN |
| **Railway** | Cloud platform for API deployment with managed databases |

### Monitoring & Logging
| Technology | Purpose |
|------------|---------|
| **python-json-logger** | Structured JSON logging for centralized log management |
| **GZip Middleware** | Response compression for improved performance |
| **Health Endpoints** | /health, /readiness, /liveness, /version for monitoring |

### Development Tools
| Technology | Purpose |
|------------|---------|
| **ESLint** | JavaScript/TypeScript linting for code quality |
| **pytest** | Python testing framework for unit and integration tests |
| **pytest-asyncio** | Async support for pytest testing |

## 📊 Key Features & Stats

### User Roles & Workflows

#### Admin Dashboard
- **Financial Overview**: Total sales, revenue trends, profit margins
- **Retailer Management**: Approve/reject registrations, view balances, track orders
- **Inventory Analytics**: Stock levels, low stock alerts, expiry tracking
- **Invoice Processing**: Upload and process supplier invoices with AI
- **Activity Logs**: Complete audit trail of all system activities
- **Quick Actions**: Rapid access to common tasks

#### Staff Dashboard
- **Order Management**: Process and fulfill retailer orders
- **Stock Updates**: Real-time inventory adjustments
- **Low Stock Alerts**: Immediate notifications for reordering
- **Expiring Medicines**: Track medicines approaching expiry
- **Recent Orders**: View and manage latest orders
- **Stock Updates**: Track inventory changes

#### Retailer Portal
- **Product Catalog**: Browse available medicines with real-time stock
- **Order Placement**: Add items to cart and place orders
- **Order History**: Track past orders and status
- **Balance Management**: View account balance and payment history
- **Google SSO**: Secure authentication with Google OAuth

### System Statistics
- **Multi-User Support**: Admins, Staff, and Retailers with role-based access
- **Real-Time Inventory**: Live stock tracking across all medicines
- **Order Processing**: Automated order workflow from placement to delivery
- **Invoice Automation**: AI-powered invoice extraction and processing
- **Security Layers**: CSRF, XSS, SQL injection protection, rate limiting
- **Caching Strategy**: Redis-based caching for improved performance
- **Audit Trail**: Complete activity logging for compliance
- **Health Monitoring**: Readiness, liveness, and version endpoints

## 🏗️ Architecture

### Clean Architecture Pattern
```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (FastAPI Routers / Next.js Pages)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Business Logic Layer            │
│       (Services / Use Cases)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Data Access Layer               │
│      (Repositories / SQLAlchemy)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Database Layer                 │
│         (PostgreSQL / Redis)            │
└─────────────────────────────────────────┘
```

### Repository Pattern Implementation
- **BaseRepository**: Generic CRUD operations with pagination
- **UserRepository**: User-specific operations (auth, roles, account locking)
- **MedicineRepository**: Medicine operations (search, stock, expiry tracking)
- **RetailerRepository**: Retailer operations (balance, status, orders)
- **OrderRepository**: Order management with item relationships
- **InvoiceRepository**: Invoice processing and tracking
- **ActivityRepository**: Audit logging and activity tracking

### Transaction Management
- Context managers for atomic operations
- Nested transaction support with savepoints
- Automatic rollback on errors
- Commit on successful completion

## 📁 Project Structure

```
medixpro/
├── apps/
│   ├── api/                          # FastAPI Backend
│   │   ├── app/
│   │   │   ├── middleware/          # Security, logging, rate limiting
│   │   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── routers/             # API route handlers
│   │   │   ├── schemas/             # Pydantic validation schemas
│   │   │   ├── services/            # Business logic (Redis, Storage)
│   │   │   ├── repositories/        # Data access layer
│   │   │   └── utils/               # Utilities (response, cache, logger)
│   │   ├── alembic/                 # Database migrations
│   │   ├── main.py                  # Application entry point
│   │   ├── config.py                # Configuration management
│   │   ├── database.py              # Database connection
│   │   └── requirements.txt         # Python dependencies
│   └── web/                         # Next.js Frontend
│       ├── src/
│       │   ├── app/                 # Next.js App Router pages
│       │   │   ├── admin/           # Admin dashboard pages
│       │   │   ├── dashboard/       # Staff dashboard pages
│       │   │   ├── retailer-home/   # Retailer portal
│       │   │   └── login/           # Authentication pages
│       │   ├── components/          # React components
│       │   │   ├── dashboard/       # Dashboard widgets
│       │   │   ├── login/           # Login components
│       │   │   └── ui/              # shadcn/ui components
│       │   ├── lib/                 # Utilities and API client
│       │   └── types/               # TypeScript type definitions
│       ├── public/                  # Static assets
│       ├── next.config.ts           # Next.js configuration
│       ├── package.json             # Node.js dependencies
│       └── Dockerfile               # Production Docker build
├── nginx/                           # Nginx reverse proxy config
├── docs/                            # Documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── DEVELOPER.md                 # Developer guide
├── .github/workflows/              # GitHub Actions CI/CD
├── docker-compose.yml              # Local development
├── docker-compose.prod.yml         # Production deployment
├── vercel.json                     # Vercel configuration
├── .env.example                     # Environment variables template
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- Python 3.11+
- PostgreSQL 16+
- Redis 7+

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medixpro.git
   cd medixpro
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec api alembic upgrade head
   ```

5. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

### Default Credentials
- **Admin**: admin@medixpro.com / Admin@123
- **Staff**: worker@medixpro.com / Worker@123

## 🔒 Security Features

- **CSRF Protection**: Token-based CSRF validation for state-changing requests
- **XSS Prevention**: Input sanitization and output encoding
- **SQL Injection Detection**: Pattern-based SQL injection prevention
- **Rate Limiting**: Configurable rate limits per IP address
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options
- **Password Hashing**: bcrypt with salt for secure credential storage
- **JWT Authentication**: Token-based authentication with expiration
- **Account Locking**: Automatic account locking after failed attempts
- **Audit Logging**: Complete activity trail for compliance

## 📈 Performance Optimizations

- **Redis Caching**: Frequently accessed data cached with TTL
- **Database Indexing**: Optimized indexes for common queries
- **Response Compression**: GZip compression for API responses
- **Image Optimization**: Next.js Image with WebP/AVIF support
- **Code Splitting**: Dynamic imports for reduced bundle size
- **Connection Pooling**: Database and Redis connection pooling
- **Lazy Loading**: Component and route-level lazy loading
- **CDN Integration**: Static assets served via CDN

## 🧪 Testing

```bash
# API Tests
cd apps/api
pytest tests/ -v

# Frontend Tests
cd apps/web
npm test

# Linting
cd apps/api
flake8 app/

cd apps/web
npm run lint
```

## 📚 Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)**: Complete deployment instructions for Docker, Vercel, and Railway
- **[Developer Guide](docs/DEVELOPER.md)**: Development setup, architecture, and contribution guidelines

## 🤝 Contributing

Contributions are welcome! Please read the [Developer Guide](docs/DEVELOPER.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastAPI team for the excellent web framework
- Next.js team for the React framework
- shadcn/ui for the beautiful component library
- Groq for fast AI inference
- Supabase for backend services

---

**Built with ❤️ for wholesale medical distributors**

