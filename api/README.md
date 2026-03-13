# Pengamanan API

Backend API untuk sistem pengamanan Lebaran Blok F RT 024. Dibangun dengan Bun, Hono, dan PostgreSQL.

## 🚀 Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: JWT
- **Deployment**: Docker

## 📁 Struktur Project

```
api/
├── src/
│   ├── routes/
│   │   ├── auth.ts         # Authentication routes
│   │   ├── configs.ts      # Config management
│   │   ├── logs.ts         # Scan logs
│   │   ├── mobile.ts       # Mobile API (PIN auth, scan, sync)
│   │   ├── pengumuman.ts   # Announcements
│   │   ├── petugas.ts      # Security guards
│   │   ├── pos.ts          # Security posts
│   │   └── qr.ts           # QR codes
│   ├── lib/
│   │   ├── auth.ts         # Auth utilities (JWT, PIN verification)
│   │   ├── db.ts           # Database connection
│   │   └── schema.ts       # Drizzle schema definitions
│   ├── middleware/
│   │   └── auth.ts         # JWT authentication middleware
│   ├── index.ts            # Main app entry point
│   └── seed.ts             # Database seeder
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker configuration
└── package.json
```

## 🔧 Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Variables

Copy .env.example to .env:

```bash
cp .env.example .env
```

Edit .env:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pengamanan

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=90d  # 90 days for mobile

# CORS
CORS_ORIGINS=http://localhost:5173,https://blokf.hadirapp.com

# Server
PORT=5000
```

### 3. Database Setup

Create database:
```sql
CREATE DATABASE pengamanan;
```

Run migrations (if available):
```bash
bun run migrate
```

Seed database:
```bash
bun run seed
```

### 4. Start Development Server

```bash
bun run dev
```

Server will run on http://localhost:5000

## 📡 API Endpoints

### Authentication

#### POST /api/auth/login
Login untuk admin web.

#### POST /api/auth/me
Get current user info (requires JWT).

#### POST /api/auth/pin
Login untuk mobile app dengan PIN.

### Mobile API (Protected)

#### POST /api/mobile/scan
Scan QR code.

#### POST /api/mobile/sync-logs
Sync offline logs from mobile.

#### POST /api/mobile/sync-data
Sync master data (QR codes, petugas, pos, pengumuman).

#### POST /api/mobile/read-announce
Mark pengumuman as read.

### Configs

#### GET /api/configs
Get all configs (paginated).

#### GET /api/configs/:key
Get config by key.

Example: GET /api/configs/APP_TITLE

#### POST /api/configs
Create new config (admin only).

#### PUT /api/configs/:id
Update config (admin only).

#### DELETE /api/configs/:id
Delete config (admin only).

### Petugas, Pos, QR, Pengumuman, Logs

Standard CRUD operations for each resource.

## 🗄️ Database Schema

**users** - Admin users
**configs** - App configurations
**petugas_jaga** - Security guards
**pos_jaga** - Security posts
**qr_codes** - QR codes for each house/block
**pengumuman** - Announcements
**scan_logs** - Scan history
**pengumuman_reads** - Read receipts

## 🧪 Testing

Test health endpoint:
```bash
curl http://localhost:5000/health
```

Test login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
```

## 🐳 Docker

### Build and Run

```bash
docker-compose up -d
```

## 📝 Default Credentials

- superadmin / admin123
- admin / admin123
- Mobile PIN: 123456

## 📄 License

Copyright © 2026 Blok F RT 024
