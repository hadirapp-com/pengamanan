# Requirements
## Aplikasi Pengamanan Lebaran 2026

---

## Overview
Aplikasi ini terdiri dari 3 komponen utama untuk sistem pengamanan lingkungan:
1. **API Backend** - REST API untuk integrasi semua sistem
2. **Aplikasi Admin** - Dashboard web untuk manage master data dan laporan
3. **Aplikasi Mobile** - Aplikasi Android untuk petugas keamanan scan QR warga

---

## Role Aplikasi

| Role | Deskripsi | Access |
|------|-----------|--------|
| **Superadmin** | Administrator utama | Web Admin - Full Access |
| **Admin** | Operator sistem | Web Admin - Limited Access |
| **Keamanan** | Petugas jaga gerbang | Mobile App - No Login Required |

---

## Fitur Web Admin

### Authentication
- Login, Logout dengan username/password
- Session management dengan JWT
- Auto logout saat token expiry

### Master Data Management
1. **Manage User** (Superadmin only)
   - List, Create, Edit, Delete user
   - Reset password
   - Role assignment

2. **Manage Petugas Jaga**
   - List, Create, Edit, Delete petugas jaga
   - Filter: active/inactive

3. **Manage Pos Jaga**
   - List, Create, Edit, Delete pos jaga
   - Filter: active/inactive

4. **Manage QR**
   - List, Create, Edit, Delete QR
   - Activate/Deactivate QR
   - Download QR Code image (PNG)
   - Select multiple QR dan generate PDF untuk print
     - Format: QR image di atas, nama & penanggung jawab di bawah
     - Grid layout (multiple QR per page)
   - Bulk upload via CSV/Excel
   - Filter: status, validity period
   - Fields: UUID (auto-generated), nama (nama block/rumah), penanggung_jawab, valid_from, valid_until, is_active
   - Catatan: UUID hanya digunakan internal untuk matching scan, yang ditampilkan di log adalah nama

5. **Manage Pengumuman**
   - List, Create, Edit, Delete pengumuman
   - Priority: normal, important, urgent

### Dashboard & Reporting
1. **Dashboard**
   - Statistik total masuk hari ini
   - Statistik total keluar hari ini
   - Grafik 7 hari terakhir
   - 10 scan terakhir

2. **Logs Masuk/Keluar**
   - List dengan filter: tanggal, pos, petugas, tipe
   - Export ke Excel
   - Pagination

3. **Audit Trail**
   - Log siapa yang create/update/delete data master

---

## Fitur Mobile (Android)

### Sync & Offline
- Manual sync untuk download data master dari server:
  - Petugas jaga
  - Pos jaga
  - QR warga
  - Pengumuman
- Local SQLite dengan struktur sama dengan backend
- Offline queue: simpan scan result ketika offline
- Sync queued data ke server saat online
- Delete synced data dari local (hemat memori)

### Configuration
- Set petugas jaga aktif
- Set pos jaga aktif
- Display current configuration di home

### QR Scanning
- Camera scan QR Code
- Toggle tipe scan:
  - **Default**: Masuk
  - **Optional**: Keluar
- Auto-detect berdasarkan scan terakhir
- Validasi QR:
  - ✅ QR terdaftar
  - ✅ QR active (is_active = true)
  - ✅ QR dalam validity period
- Audio/visual feedback:
  - 🎵 Suara success → scan berhasil
  - 🎵 Suara error + vibration → scan gagal
- Error messages:
  - "QR tidak terdaftar"
  - "QR tidak aktif"
  - "QR sudah kadaluarsa"
- Simpan ke database lokal: qr_data, petugas, pos, timestamp, tipe

### Logs & History
- Halaman log masuk (list scan berhasil)
- Status indicator:
  - ⏳ Pending sync
  - ✓ Synced
- Filter tabs: All, Pending, Synced

### Pengumuman
- Halaman pengumuman
- Display 10 pengumuman terbaru
- Mark as read pada tap
- Sync read status ke server
- Bell indicator dengan badge count (unread)
- Priority color coding

### Sync Status
- Display last sync timestamp
- Display pending sync count
- Manual sync button

---

## Database

### Name
`pengamanan_db`

### Schema

#### users
```sql
- id (PK, UUID)
- username (Unique, String)
- password_hash (String)
- role (Enum: superadmin, admin)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, nullable)
- created_by (FK users.id)
- updated_by (FK users.id)
```

#### petugas_jaga
```sql
- id (PK, UUID)
- nama (String)
- nik (String, nullable)
- no_hp (String, nullable)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, nullable)
- created_by (FK users.id)
- updated_by (FK users.id)
```

#### pos_jaga
```sql
- id (PK, UUID)
- nama (String)
- lokasi (String, nullable)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, nullable)
- created_by (FK users.id)
- updated_by (FK users.id)
```

#### qr_codes
```sql
- id (PK, UUID)
- qr_code (Unique, String) - Auto-generated UUID untuk scan
- nama (String) - Nama block/rumah untuk display
- penanggung_jawab (String)
- valid_from (Date)
- valid_until (Date)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, nullable)
- created_by (FK users.id)
- updated_by (FK users.id)
```

#### pengumuman
```sql
- id (PK, UUID)
- title (String)
- content (Text)
- priority (Enum: normal, important, urgent)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, nullable)
- created_by (FK users.id)
- updated_by (FK users.id)
```

#### scan_logs
```sql
- id (PK, UUID)
- qr_id (FK qr_codes.id)
- petugas_id (FK petugas_jaga.id)
- pos_id (FK pos_jaga.id)
- tipe_scan (Enum: masuk, keluar)
- scanned_at (Timestamp)
- synced_at (Timestamp, nullable)
- created_at (Timestamp)
```

#### pengumuman_reads
```sql
- id (PK, UUID)
- pengumuman_id (FK pengumuman.id)
- device_id (String)
- read_at (Timestamp)
- created_at (Timestamp)
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Users (Superadmin)
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
POST   /api/users/:id/reset-password
```

### Petugas Jaga
```
GET    /api/petugas
POST   /api/petugas
GET    /api/petugas/:id
PUT    /api/petugas/:id
DELETE /api/petugas/:id
```

### Pos Jaga
```
GET    /api/pos
POST   /api/pos
GET    /api/pos/:id
PUT    /api/pos/:id
DELETE /api/pos/:id
```

### QR Codes
```
GET    /api/qr
POST   /api/qr
GET    /api/qr/:id
PUT    /api/qr/:id
DELETE /api/qr/:id
POST   /api/qr/generate
GET    /api/qr/:id/image
POST   /api/qr/pdf
POST   /api/qr/bulk-upload
```

### Pengumuman
```
GET    /api/pengumuman
POST   /api/pengumuman
GET    /api/pengumuman/:id
PUT    /api/pengumuman/:id
DELETE /api/pengumuman/:id
```

### Mobile Sync (No auth)
```
GET    /api/mobile/sync
POST   /api/mobile/sync-logs
POST   /api/mobile/read-announce
GET    /api/mobile/pengumuman
```

### Logs & Reporting
```
GET    /api/logs
GET    /api/logs/stats
GET    /api/logs/export
```

---

## Tech Stack

### API Backend
- Runtime: Bun
- Framework: Hono
- Database: PostgreSQL
- ORM: Drizzle ORM
- Validation: Zod
- Export: ExcelJS
- PDF: jsPDF + qrcode
- Auth: JWT
- Deploy: Docker

### Web Admin
- Framework: React 19 + Vite
- Language: TypeScript
- UI: Tailwind CSS v4 + Radix UI
- State: Zustand
- Data Fetching: TanStack Query
- Routing: React Router v7
- Form: React Hook Form + Zod
- HTTP: Axios
- PDF: jsPDF + qrcode
- Deploy: Cloudflare Pages

### Mobile App
- Language: Kotlin
- Min SDK: 21 (Lollipop)
- Target SDK: 35
- 16KB Page Size: Enabled
- Database: SQLite (SQLDelight)
- Camera: ML Kit QR Scanner
- HTTP: Retrofit + OkHttp
- Async: Coroutines + Flow
- DI: Koin
- UI: Jetpack Compose

---

## Design

### Color Palette
```
Primary     : #060273 (Biru Tua)
Secondary   : #5F5DA6 (Biru Medium)
Accent      : #040959 (Biru Gelap)
Background  : #F2F2F2 (Putih Abu)
Text        : #0D0D0D (Hitam)
Success     : #22C55E (Green)
Error       : #EF4444 (Red)
```

### Resources
- Icons: `/resources/android`
- Icons available in mipmap-hdpi s/d xxxhdpi

---

## Deployment

### API Backend
- Docker container on VPS/Cloud service
- Environment-based configuration

### Web Admin
- Cloudflare Pages deployment
- Static site with auto-deploy from git push
- Global CDN

### Database
- Managed PostgreSQL service (Supabase/Neon/Railway/etc)
- Connection pooling
- Managed backups

---

## Seeding Data

### Default Account
- Username: `superadmin`
- Password: `admin123`
- Role: superadmin

### Sample Data
- 3-5 petugas jaga
- 2-3 pos jaga
- 10-20 QR codes
- Sample pengumuman

---

## Documents

- [PRD](./PRD.md) - Product Requirement Document
- [SPRINT](./SPRINT.md) - Sprint Planning & Tracking
- USER_GUIDE.md - User Guide (to be created)

---

**Last Updated**: 10 Maret 2026
