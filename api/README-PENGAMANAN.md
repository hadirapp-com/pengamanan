# Pengamanan API - Deployment Guide

## Quick Start

### Option 1: Docker (Recommended)

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

2. **Build & Run with Docker**
   ```bash
   docker build -t pengamanan-api:latest .
   docker run -d --name pengamanan-api -p 3000:3000 --env-file .env -e API_TYPE=pengamanan pengamanan-api:latest
   ```

3. **Seed Database**
   ```bash
   docker exec pengamanan-api bun run db:seed:pengamanan
   ```

### Option 2: Docker Compose

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.pengamanan.yml up -d
   ```

3. **Seed Database**
   ```bash
   docker-compose -f docker-compose.pengamanan.yml exec pengamanan-api bun run db:seed:pengamanan
   ```

### Option 3: Local Development

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Run Database Migrations**
   ```bash
   bun run db:push
   ```

4. **Seed Database**
   ```bash
   bun run db:seed:pengamanan
   ```

5. **Start Development Server**
   ```bash
   bun run dev:pengamanan
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login (superadmin/admin)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Mobile Authentication (PIN-based)
- `POST /api/mobile/auth/pin` - Authenticate with PIN (returns JWT valid for 3 months)

### Mobile Sync (Requires JWT)
- `GET /api/mobile/sync` - Get all master data
- `POST /api/mobile/sync-logs` - Submit scan logs
- `POST /api/mobile/read-announce` - Mark pengumuman as read
- `GET /api/mobile/pengumuman` - Get 10 latest pengumuman

### Master Data Management (Requires Admin Auth)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/petugas` - List petugas jaga
- `POST /api/petugas` - Create petugas jaga
- `GET /api/pos` - List pos jaga
- `POST /api/pos` - Create pos jaga
- `GET /api/qr` - List QR codes
- `POST /api/qr` - Create QR code
- `GET /api/qr/:id/image` - Download QR image (PNG)
- `POST /api/qr/pdf` - Generate PDF for multiple QR
- `GET /api/pengumuman` - List pengumuman

### Reports (Requires Admin Auth)
- `GET /api/logs` - List scan logs with filters
- `GET /api/logs/stats` - Get dashboard statistics
- `GET /api/logs/export` - Export to Excel

## Default Credentials

### Web Admin
- Username: `superadmin`
- Password: `admin123`

### Mobile App (PIN-based)
- Default PIN for all petugas: `123456`

**IMPORTANT**: Change immediately after first login!

## Managed Database Services

| Service | Free Tier | Notes |
|---------|-----------|-------|
| [Supabase](https://supabase.com) | ✅ 500MB | PostgreSQL 15, excellent UI |
| [Neon](https://neon.tech) | ✅ 3GB | Serverless PostgreSQL |
| [Railway](https://railway.app) | ✅ $5 free credit | Simple setup |
| [ElephantSQL](https://elephantsql.com) | ✅ 20GB | PostgreSQL 14 |

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
│  • API_TYPE=pengamanan                                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Managed PostgreSQL (Supabase/Neon/etc)             │
│  • pengamanan_db                                            │
│  • Managed backups                                          │
└─────────────────────────────────────────────────────────────┘
```
