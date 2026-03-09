# Docker Deployment Guide

This guide explains how to deploy the Pokayoke API using Docker containers.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)
- Git repository cloned locally

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start all services (production)
docker-compose up --build

# Build and start with development API (includes hot reload)
docker-compose --profile dev up --build

# Run in background
docker-compose up -d --build
```

### 2. Access the Application

- **API**: http://localhost:3000
- **Development API**: http://localhost:3001 (when using dev profile)
- **Database**: localhost:5432

## Manual Docker Commands

### Build the Image

```bash
# Build production image
docker build -t pokayoke-api:latest .

# Build with specific tag
docker build -t pokayoke-api:v1.0.0 .

# Build development image
docker build --target base -t pokayoke-api:dev .
```

### Run the Container

```bash
# Run production container
docker run -d \
  --name pokayoke-api \
  -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e JWT_REFRESH_SECRET="your-jwt-refresh-secret" \
  pokayoke-api:latest

# Run with environment file
docker run -d \
  --name pokayoke-api \
  -p 3000:3000 \
  --env-file .env \
  pokayoke-api:latest
```

## Environment Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Application
NODE_ENV=production
PORT=3000
```

### Docker Compose Environment

Update the `docker-compose.yml` file with your environment variables:

```yaml
environment:
  DATABASE_URL: "your-production-database-url"
  JWT_SECRET: "your-production-jwt-secret"
  JWT_REFRESH_SECRET: "your-production-jwt-refresh-secret"
```

## Database Setup

### Using Docker Compose (Recommended)

The `docker-compose.yml` includes a PostgreSQL database:

```bash
# Start only the database
docker-compose up postgres

# Run migrations
docker-compose exec api bun run db:migrate

# Generate Prisma client
docker-compose exec api bun run db:generate
```

### Using External Database

Update the `DATABASE_URL` in your environment variables to point to your external database.

## Production Deployment

### 1. Build Production Image

```bash
docker build -t pokayoke-api:production .
```

### 2. Deploy to Production Server

```bash
# Pull image on production server
docker pull your-registry/pokayoke-api:production

# Run with production environment
docker run -d \
  --name pokayoke-api \
  -p 3000:3000 \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e DATABASE_URL="your-production-db-url" \
  -e JWT_SECRET="your-production-jwt-secret" \
  -e JWT_REFRESH_SECRET="your-production-refresh-secret" \
  your-registry/pokayoke-api:production
```

### 3. Using Docker Compose in Production

```bash
# Create production compose file
cp docker-compose.yml docker-compose.prod.yml

# Edit docker-compose.prod.yml with production settings
# Then run:
docker-compose -f docker-compose.prod.yml up -d
```

## Development with Docker

### Hot Reload Development

```bash
# Start development environment
docker-compose --profile dev up --build

# The API will be available at http://localhost:3001
# Changes to your code will automatically reload
```

### Debugging

```bash
# View logs
docker-compose logs -f api

# Access container shell
docker-compose exec api sh

# Run commands inside container
docker-compose exec api bun run db:generate
```

## Health Checks

The Docker setup includes health checks:

```bash
# Check container health
docker ps

# View health check logs
docker inspect pokayoke-api | grep Health -A 10
```

## Monitoring and Logs

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs api

# Follow logs in real-time
docker-compose logs -f api

# View last 100 lines
docker-compose logs --tail=100 api
```

### Container Management

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# Scale services
docker-compose up --scale api=3
```

## Security Considerations

### 1. Non-Root User

The Dockerfile runs the application as a non-root user for security.

### 2. Environment Variables

- Never commit sensitive environment variables to version control
- Use Docker secrets or external secret management in production
- Rotate JWT secrets regularly

### 3. Network Security

```bash
# Create custom network
docker network create pokayoke-network

# Run with custom network
docker run --network pokayoke-network pokayoke-api:latest
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Use different port
   docker run -p 3001:3000 pokayoke-api:latest
   ```

2. **Database Connection Issues**
   ```bash
   # Check database connectivity
   docker-compose exec api bun run db:generate
   
   # View database logs
   docker-compose logs postgres
   ```

3. **Build Failures**
   ```bash
   # Clean build cache
   docker builder prune
   
   # Rebuild without cache
   docker build --no-cache -t pokayoke-api:latest .
   ```

### Debug Commands

```bash
# Inspect container
docker inspect pokayoke-api

# View container resources
docker stats pokayoke-api

# Access container filesystem
docker exec -it pokayoke-api sh

# Check environment variables
docker exec pokayoke-api env
```

## Performance Optimization

### 1. Multi-Stage Build

The Dockerfile uses multi-stage builds to reduce image size.

### 2. Layer Caching

Dependencies are installed before copying source code for better caching.

### 3. Production Optimizations

```bash
# Build with production optimizations
docker build --target production -t pokayoke-api:prod .

# Use specific platform
docker build --platform linux/amd64 -t pokayoke-api:latest .
```

## CI/CD Integration

### GitHub Actions with Docker

Add this to your GitHub Actions workflow:

```yaml
- name: Build and push Docker image
  run: |
    docker build -t your-registry/pokayoke-api:${{ github.sha }} .
    docker push your-registry/pokayoke-api:${{ github.sha }}
```

### Automated Deployment

```bash
# Deploy with rolling updates
docker-compose up -d --no-deps --build api
``` 