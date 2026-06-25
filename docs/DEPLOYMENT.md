# Medixpro Deployment Guide

This guide covers deploying Medixpro to production using Docker, Vercel, or Railway.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (or use Docker Compose)
- Redis instance (local or Upstash)
- Supabase account (for storage and OAuth)
- Domain name configured (for production)

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medixpro
POSTGRES_DB=medixpro
POSTGRES_USER=medixpro_user
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_URL=redis://localhost:6379/0

# Authentication
SECRET_KEY=your_minimum_32_character_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_KEY=your_service_role_key

# Environment
ENVIRONMENT=production
LOG_LEVEL=INFO

# Business Configuration
INVOICE_PREFIX=INV
ORDER_PREFIX=ORD
LOW_STOCK_THRESHOLD=50
EXPIRY_ALERT_DAYS=60
CURRENCY=INR
TIMEZONE=Asia/Kolkata
MAX_FILE_SIZE_MB=20
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/medixpro.git
   cd medixpro
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec api alembic upgrade head
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Production Docker Compose

Use the production configuration:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

The production configuration includes:
- Nginx reverse proxy
- Optimized Docker builds
- Automatic restarts
- Health checks

## Vercel Deployment (Frontend Only)

### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd apps/web
   vercel
   ```

3. **Configure environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_API_URL`: Your API endpoint URL

### Automatic Deployment

Push to your main branch. The GitHub Actions workflow will automatically build and deploy.

## Railway Deployment

### Deploy API to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize:**
   ```bash
   cd apps/api
   railway init
   ```

4. **Add services:**
   ```bash
   railway add postgresql
   railway add redis
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Configure environment variables in Railway dashboard**

## Database Migrations

### Run Migrations

```bash
# In development
cd apps/api
alembic upgrade head

# In Docker
docker-compose exec api alembic upgrade head
```

### Create New Migration

```bash
cd apps/api
alembic revision --autogenerate -m "description"
```

### Rollback Migration

```bash
alembic downgrade -1
```

## Monitoring

### Health Checks

- **API Health:** `GET /health`
- **Readiness Check:** `GET /readiness`
- **Liveness Check:** `GET /liveness`
- **Version:** `GET /version`

### Logs

```bash
# Docker logs
docker-compose logs -f api
docker-compose logs -f web

# Railway logs
railway logs
```

## Security Best Practices

1. **Use strong secrets:** Generate secure random strings for SECRET_KEY
2. **Enable HTTPS:** Use SSL certificates in production
3. **Configure CORS:** Update allowed origins in production
4. **Rate limiting:** Enabled by default in production
5. **Security headers:** Automatically added by middleware
6. **Regular updates:** Keep dependencies updated

## Backup Strategy

### Database Backups

```bash
# Manual backup
docker-compose exec postgres pg_dump -U medixpro_user medixpro > backup.sql

# Restore
docker-compose exec -T postgres psql -U medixpro_user medixpro < backup.sql
```

### Automated Backups

Configure automated backups in your cloud provider (Railway, AWS RDS, etc.)

## Troubleshooting

### Common Issues

**Database connection failed:**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check network connectivity

**Redis connection failed:**
- Verify REDIS_URL is correct
- Check Redis is accessible
- For Upstash, ensure REST API is enabled

**Build failures:**
- Clear Docker cache: `docker system prune -a`
- Check Node.js version compatibility
- Verify all dependencies are installed

**Permission errors:**
- Ensure proper file permissions
- Check user ownership in Docker containers

## Performance Optimization

1. **Enable caching:** Redis caching is configured for frequently accessed data
2. **Database indexing:** Ensure proper indexes on frequently queried columns
3. **CDN:** Use CDN for static assets in production
4. **Compression:** GZip compression enabled by default
5. **Image optimization:** Next.js Image component with WebP/AVIF support

## Scaling

### Horizontal Scaling

Use Docker Swarm or Kubernetes for horizontal scaling:

```bash
# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.prod.yml medixpro
```

### Load Balancing

Configure Nginx or use cloud load balancers:
- Distribute traffic across multiple API instances
- Use sticky sessions if needed
- Configure health checks

## Maintenance

### Regular Tasks

1. **Update dependencies:**
   ```bash
   cd apps/api && pip install --upgrade -r requirements.txt
   cd apps/web && npm update
   ```

2. **Database maintenance:**
   ```bash
   # Vacuum and analyze
   docker-compose exec postgres psql -U medixpro_user -d medixpro -c "VACUUM ANALYZE;"
   ```

3. **Log rotation:** Configure log rotation to prevent disk space issues

### Update Procedure

1. Backup current deployment
2. Pull latest changes
3. Run migrations
4. Restart services
5. Verify health checks

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/medixpro/issues
- Documentation: https://docs.medixpro.com
- Email: support@medixpro.com
