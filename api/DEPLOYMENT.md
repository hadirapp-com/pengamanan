# Deployment Guide - Cloudflare Functions

This guide explains how to deploy the Pokayoke API to Cloudflare Functions using GitHub Actions.

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with Workers enabled
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: A PostgreSQL database (can be Cloudflare D1, Neon, Supabase, etc.)

## Setup Steps

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
# or
bun add -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `DATABASE_URL`: Your PostgreSQL database connection string
- `JWT_SECRET`: Secret key for JWT access tokens
- `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens

### 4. Get Cloudflare Credentials

#### API Token
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "My Profile" → "API Tokens"
3. Create a new token with the following permissions:
   - Account: Workers Scripts:Edit
   - Zone: Workers Routes:Edit
   - Account: Workers Routes:Edit

#### Account ID
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Look at the URL or go to "Workers & Pages" → "Overview"
3. Copy your Account ID from the URL or dashboard

### 5. Configure Environment Variables

Update the `wrangler.toml` file with your environment-specific variables:

```toml
[env.production.vars]
DATABASE_URL = "your-production-database-url"
JWT_SECRET = "your-production-jwt-secret"
JWT_REFRESH_SECRET = "your-production-refresh-secret"

[env.staging.vars]
DATABASE_URL = "your-staging-database-url"
JWT_SECRET = "your-staging-jwt-secret"
JWT_REFRESH_SECRET = "your-staging-refresh-secret"
```

## Deployment

### Automatic Deployment (GitHub Actions)

The GitHub Actions workflow will automatically deploy when you push to `main` or `master` branch.

### Manual Deployment

```bash
# Deploy to default environment
bun run deploy

# Deploy to staging
bun run deploy:staging

# Deploy to production
bun run deploy:production
```

## Environment Configuration

### Development
```bash
bun run dev
```

### Staging
- URL: `https://pokayoke-api-staging.your-subdomain.workers.dev`
- Environment: Staging database and configurations

### Production
- URL: `https://pokayoke-api-prod.your-subdomain.workers.dev`
- Environment: Production database and configurations

## Database Setup

### Prisma Migrations

Before deploying, ensure your database is properly set up:

```bash
# Generate Prisma client
bun run db:generate

# Push schema changes (for development)
bun run db:push

# Run migrations (for production)
bun run db:migrate
```

### Database Requirements

- PostgreSQL database
- Connection string format: `postgresql://username:password@host:port/database`
- Ensure the database is accessible from Cloudflare Workers

## Monitoring and Logs

### View Logs
```bash
# View real-time logs
wrangler tail

# View logs for specific environment
wrangler tail --env production
```

### Health Check
The API includes a health check endpoint:
```
GET https://your-api-url.workers.dev/
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure your database allows connections from Cloudflare Workers IP ranges
2. **Environment Variables**: Verify all secrets are properly set in GitHub
3. **Prisma Client**: Make sure the Prisma client is generated before deployment
4. **CORS Issues**: The API includes CORS middleware, but you may need to configure it for your frontend domain

### Debug Commands

```bash
# Test locally with Wrangler
wrangler dev

# Check configuration
wrangler whoami

# List deployments
wrangler deployments list
```

## Security Considerations

1. **JWT Secrets**: Use strong, unique secrets for JWT tokens
2. **Database**: Use connection pooling and SSL for database connections
3. **CORS**: Configure CORS properly for your frontend domains
4. **Rate Limiting**: Consider implementing rate limiting for production

## Cost Optimization

- Cloudflare Workers have a generous free tier
- Monitor usage in the Cloudflare dashboard
- Consider using Cloudflare D1 for database to reduce latency 