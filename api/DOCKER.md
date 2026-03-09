# Docker Compose - Local Development

This setup provides a complete local development environment with PostgreSQL 17 and hot-reload support.

## Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose v2+

## Quick Start

### 1. Start all services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- **PostgreSQL 17** on port `5432`
- **API** on port `3000` with hot-reload enabled

### 2. View logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### 3. Stop services

```bash
docker-compose -f docker-compose.dev.yml down
```

### 4. Stop and remove volumes (clean slate)

```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Services

### PostgreSQL 17

- **Host**: localhost
- **Port**: 5432
- **Database**: pokayoke
- **Username**: pokayoke
- **Password**: pokayoke_dev
- **Connection String**: `postgres://pokayoke:pokayoke_dev@localhost:5432/pokayoke`

Connect with your favorite PostgreSQL client:
```bash
# Using psql (if installed locally)
psql -h localhost -U pokayoke -d pokayoke

# Or from within the container
docker exec -it pokayoke-postgres-dev psql -U pokayoke -d pokayoke
```

### API Service

- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/
- **Hot Reload**: Enabled (changes to code will auto-restart)

## Database Management

### Run Migrations

```bash
# From host machine (requires DATABASE_URL in .env)
bun run db:push

# Or from within the container
docker exec -it pokayoke-api-dev bun run db:push
```

### Open Drizzle Studio (Database GUI)

```bash
# Start studio service
docker-compose -f docker-compose.dev.yml --profile studio up -d studio

# Access at: http://localhost:4983
```

### Seed Database

```bash
# From host machine
bun run db:seed

# Or from within the container
docker exec -it pokayoke-api-dev bun run db:seed
```

### Reset Database

```bash
# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Start services again
docker-compose -f docker-compose.dev.yml up -d

# Run migrations and seed
docker exec -it pokayoke-api-dev bun run db:push
docker exec -it pokayoke-api-dev bun run db:seed
```

## Development Workflow

### 1. Make code changes
The API service has hot-reload enabled, so changes to your code will automatically restart the server.

### 2. View changes
Check logs to see when the server restarts:
```bash
docker-compose -f docker-compose.dev.yml logs -f api
```

### 3. Debugging
Attach to the running container:
```bash
docker exec -it pokayoke-api-dev sh
```

## Environment Variables

Default development variables are set in `docker-compose.dev.yml`. To override:

1. Copy `.env.development` to `.env.local`:
```bash
cp .env.development .env.local
```

2. Edit `.env.local` with your values

3. Docker Compose will automatically pick up `.env` file

## Troubleshooting

### Port already in use
If port 3000 or 5432 is already in use, modify the ports in `docker-compose.dev.yml`:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Database connection issues
1. Ensure PostgreSQL container is healthy:
```bash
docker-compose -f docker-compose.dev.yml ps
```

2. Check PostgreSQL logs:
```bash
docker-compose -f docker-compose.dev.yml logs postgres
```

3. Restart services:
```bash
docker-compose -f docker-compose.dev.yml restart
```

### Container keeps restarting
Check logs for errors:
```bash
docker-compose -f docker-compose.dev.yml logs -f api
```

### Rebuild containers
After significant changes:
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## Production Deployment

For production, use the main `docker-compose.yml` file:
```bash
docker-compose up -d
```

Note: Production setup uses an external PostgreSQL database (not included in docker-compose).

## Useful Commands

```bash
# Show running containers
docker-compose -f docker-compose.dev.yml ps

# Execute command in container
docker exec -it pokayoke-api-dev <command>

# Follow logs for specific service
docker-compose -f docker-compose.dev.yml logs -f <service_name>

# Restart specific service
docker-compose -f docker-compose.dev.yml restart <service_name>

# Remove all containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# View resource usage
docker stats
```

## Data Persistence

PostgreSQL data is stored in a Docker volume named `postgres_data`. This persists even after containers are removed. To completely reset:
```bash
docker-compose -f docker-compose.dev.yml down -v
docker volume rm pokayoke-api_postgres_data
```
