# Pengamanan API - Deployment Guide

## Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

2. **Build & Run with Docker**
   ```bash
   docker build -t pengamanan-api:latest .
   docker run -d --name pengamanan-api -p 3000:3000 --env-file .env pengamanan-api:latest
   ```

3. **Seed Database**
   ```bash
   docker exec pengamanan-api bun run db:seed:pengamanan
   ```

## Managed Database Services

| Service | Free Tier | Notes |
|---------|-----------|-------|
| [Supabase](https://supabase.com) | ✅ 500MB | PostgreSQL 15, excellent UI |
| [Neon](https://neon.tech) | ✅ 3GB | Serverless PostgreSQL |
| [Railway](https://railway.app) | ✅ $5 free credit | Simple setup |
| [ElephantSQL](https://elephantsql.com) | ✅ 20GB | PostgreSQL 14 |

## Web Deployment (Cloudflare Pages)

The Web Admin will be deployed to Cloudflare Pages separately.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Pages (Web Admin)                   │
│  • Static site (React + Vite)                               │
│  • Auto-deploy from git                                     │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            API Server (Docker)                              │
│  • Hono + Bun                                                │
│  • Port 3000                                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Managed PostgreSQL (Supabase/Neon/etc)             │
│  • pengamanan_db                                            │
│  • Managed backups                                          │
└─────────────────────────────────────────────────────────────┘
```

## Default Credentials

After seeding:
- Username: `superadmin`
- Password: `admin123`

**IMPORTANT**: Change immediately after first login!
