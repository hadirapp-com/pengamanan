# Pengamanan Lebaran Blok F RT 024

Sistem pengamanan berbasis QR Code untuk Lebaran 2026 di Blok F RT 024. Sistem ini terdiri dari 3 komponen utama: API (Backend), Web (Admin Dashboard), dan Mobile (Android App untuk petugas).

## 🏗️ Arsitektur

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Mobile App     │──────│                 │──────│  Admin Web      │
│  (Petugas)      │      │                 │      │  (Dashboard)    │
└─────────────────┘      │                 │      └─────────────────┘
                         │    API/Server   │
┌─────────────────┐      │   (Bun + Hono)  │
│  QR Code        │──────│                 │
│  (Warga)        │      │                 │
└─────────────────┘      └─────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   PostgreSQL    │
                          │   Database      │
                          └─────────────────┘
```

## 📁 Struktur Project

```
gcc2-blokf/
├── api/          # Backend API (Bun + Hono + Drizzle ORM)
├── web/          # Admin Dashboard (React + Vite + TailwindCSS)
├── mobile/       # Android App (Kotlin + Jetpack Compose)
└── README.md     # Root documentation
```

## 🚀 Fitur Utama

### Backend API
- RESTful API dengan Hono framework
- PostgreSQL database dengan Drizzle ORM
- JWT Authentication untuk mobile dan web
- QR Code management dan validation
- Scan logs dengan real-time sync
- Pengumuman system
- Auto-sync untuk mobile offline mode

### Admin Web
- Dashboard untuk monitoring scan activities
- Manajemen Petugas Jaga
- Manajemen Pos Jaga
- Manajemen QR Code per blok/rumah
- Pengumuman management
- Log viewing dengan filter dan export CSV
- Config management (APP_TITLE, Banner, PIN)

### Mobile App
- QR Code Scanner dengan ML Kit
- Login dengan PIN (6 digit global)
- Auto-sync offline scan logs
- Pengumuman viewer
- Real-time status
- Error handling dengan pesan bahasa Indonesia
- PWA Support

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Bun, Hono, Drizzle ORM, PostgreSQL, Zod |
| **Frontend** | React 19, TypeScript, TailwindCSS, Vite |
| **Mobile** | Kotlin, Jetpack Compose, Hilt, ML Kit, SQLDelight |
| **Deployment** | Docker, Cloudflare Pages, GitHub Actions |

## 📋 Prerequisites

- **Node.js**: 24.x
- **Bun**: Latest version
- **PostgreSQL**: 14+
- **Android Studio**: Latest (for mobile development)
- **Docker**: Latest (optional, for containerization)

## 🔧 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd gcc2-blokf
```

### 2. Setup API

```bash
cd api
cp .env.example .env
# Edit .env with your database credentials
bun install
bun run seed  # Seed database with initial data
bun run dev   # Start development server on port 5000
```

### 3. Setup Web

```bash
cd web
pnpm install
cp .env.example .env
# Edit .env with your API URL
pnpm dev      # Start development server on port 5173
```

### 4. Setup Mobile

```bash
cd mobile
# Open in Android Studio
# Sync Gradle
# Run on emulator or physical device
```

## 🔐 Environment Variables

### API (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pengamanan
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:5173,https://your-app.pages.dev
```

### Web (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENVIRONMENT=development
```

## 📱 Mobile Build

### Debug Build
```bash
cd mobile
./gradlew assembleDebug
```

### Release Build
```bash
cd mobile
./gradlew assembleRelease
```

APK output: `mobile/app/build/outputs/apk/`

## 🚀 Deployment

### API (Production)
- Deployed with Docker on VPS
- GitHub Actions CI/CD: `.github/workflows/deploy-api.yml`
- Auto-deploys on push to `main` branch

### Web (Production)
- Deployed on Cloudflare Pages
- GitHub Actions CI/CD: `.github/workflows/deploy-web.yml`
- Auto-deploys on push to `main` branch

### Mobile
- Manual release to Google Play Store
- Or distribute APK directly

## 📚 Documentation

- [API Documentation](./api/README.md)
- [Web Documentation](./web/README.md)
- [Mobile Documentation](./mobile/README.md)
- [Development Todo](./todo.md)

## 🧪 Testing

### API Testing
```bash
cd api
bun test  # Run tests (if available)
```

### Web Testing
```bash
cd web
pnpm test  # Run tests (if available)
```

## 📊 Default Credentials

Setelah menjalankan `bun run seed`, Anda dapat login dengan:

**Web Admin:**
- Username: `superadmin` / Password: `admin123`
- Username: `admin` / Password: `admin123`

**Mobile PIN:**
- Global PIN: `123456`

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Copyright © 2026 Blok F RT 024. All rights reserved.

## 👥 Team

- **Development**: Blok F RT 024 Tech Team
- **Year**: 2026

---

**Made with ❤️ for Blok F RT 024 Community**
