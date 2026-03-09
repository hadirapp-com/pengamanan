# Product Requirement Document (PRD)
## Aplikasi Pengamanan Lebaran 2026

**Version**: 1.1
**Date**: 10 Maret 2026
**Status**: Draft

---

## 1. Executive Summary

Aplikasi Pengamanan Lebaran 2026 adalah sistem manajemen keamanan lingkungan untuk memantau warga yang masuk dan keluar melalui pos penjagaan menggunakan QR Code. Sistem terdiri dari 3 komponen:

1. **API Backend** - REST API untuk integrasi semua sistem
2. **Web Admin** - Dashboard admin untuk master data dan reporting
3. **Mobile App** - Aplikasi Android untuk petugas keamanan melakukan scan QR

---

## 2. Problem Statement

Selama periode Lebaran, keamanan lingkungan menjadi prioritas tinggi. Saat ini pendataan warga yang masuk/keluar masih dilakukan secara manual yang memiliki beberapa masalah:

- Data tidak realtime dan sulit dilacak
- Tidak ada histori lengkap siapa saja yang masuk/keluar
- Sulit membuat laporan statistik keamanan
- Tidak ada sistem validasi QR untuk warga yang berhak masuk

---

## 3. Solution Overview

Sistem terintegrasi dengan fitur utama:

### 3.1 Core Features
- **QR Code System** - QR unik untuk setiap warga/keluarga dengan validity period
- **Scan Gateway** - Mobile app untuk petugas scan QR warga
- **Real-time Logging** - Catat semua aktivitas masuk/keluar
- **Dashboard & Reporting** - Statistik dan export laporan
- **Offline Support** - Mobile app dapat bekerja tanpa internet
- **Pengumuman System** - Informasi dari admin ke petugas

### 3.2 User Roles
| Role | Deskripsi | Access |
|------|-----------|--------|
| **Superadmin** | Administrator utama | Web Admin - Full Access |
| **Admin** | Operator sistem | Web Admin - Limited Access |
| **Keamanan** | Petugas jaga gerbang | Mobile App - No Login Required |

---

## 4. Functional Requirements

### 4.1 API Backend

#### 4.1.1 Authentication & Authorization
- **FR-API-001**: Sistem login dengan username/password untuk Superadmin dan Admin
- **FR-API-002**: JWT token based authentication
- **FR-API-003**: Role-based access control (RBAC)

#### 4.1.2 Master Data Management
- **FR-API-004**: CRUD User (Superadmin, Admin)
- **FR-API-005**: CRUD Petugas Jaga
- **FR-API-006**: CRUD Pos Jaga
- **FR-API-007**: CRUD QR (UUID, nama, penanggung jawab, validity period, status)
- **FR-API-008**: CRUD Pengumuman

#### 4.1.3 Transaction & Logging
- **FR-API-009**: API untuk sync data master ke mobile
- **FR-API-010**: API untuk receive scan results dari mobile
- **FR-API-011**: API untuk get logs masuk/keluar
- **FR-API-012**: API untuk mark pengumuman as read

#### 4.1.4 Reporting
- **FR-API-013**: Dashboard statistics (total masuk/keluar per hari)
- **FR-API-014**: Export logs ke Excel
- **FR-API-015**: Audit trail untuk semua perubahan master data

### 4.2 Web Admin

#### 4.2.1 Authentication
- **FR-WEB-001**: Halaman login dengan username/password
- **FR-WEB-002**: Session management dengan auto logout
- **FR-WEB-003**: Halaman logout

#### 4.2.2 User Management
- **FR-WEB-004**: List user dengan filter dan search
- **FR-WEB-005**: Create user (Superadmin only)
- **FR-WEB-006**: Edit user profile
- **FR-WEB-007**: Delete user (Soft delete)
- **FR-WEB-008**: Reset password

#### 4.2.3 Petugas Jaga Management
- **FR-WEB-009**: List petugas jaga dengan filter
- **FR-WEB-010**: Create petugas jaga
- **FR-WEB-011**: Edit petugas jaga
- **FR-WEB-012**: Delete petugas jaga (Soft delete)

#### 4.2.4 Pos Jaga Management
- **FR-WEB-013**: List pos jaga
- **FR-WEB-014**: Create pos jaga
- **FR-WEB-015**: Edit pos jaga
- **FR-WEB-016**: Delete pos jaga (Soft delete)

#### 4.2.5 QR Management
- **FR-WEB-017**: List QR dengan filter status dan validity
- **FR-WEB-018**: Create QR dengan auto-generated UUID dan nama
- **FR-WEB-019**: Edit QR (nama, penanggung jawab, validity period)
- **FR-WEB-020**: Activate/Deactivate QR
- **FR-WEB-021**: Delete QR (Soft delete)
- **FR-WEB-022**: Download QR Code image (PNG) untuk dicetak
- **FR-WEB-023**: Select multiple QR dan generate PDF untuk print
  - Format: QR image di atas, nama & penanggung jawab di bawah
  - Grid layout (multiple QR per page)
- **FR-WEB-024**: Bulk upload QR via CSV/Excel

#### 4.2.6 Pengumuman Management
- **FR-WEB-025**: List pengumuman
- **FR-WEB-026**: Create pengumuman (title, content, priority)
- **FR-WEB-027**: Edit pengumuman
- **FR-WEB-028**: Delete pengumuman (Soft delete)

#### 4.2.7 Dashboard
- **FR-WEB-029**: Statistik total warga masuk hari ini
- **FR-WEB-030**: Statistik total warga keluar hari ini
- **FR-WEB-031**: Grafik masuk/keluar 7 hari terakhir
- **FR-WEB-032**: List 10 scan terakhir

#### 4.2.8 Logs & Reporting
- **FR-WEB-033**: List log masuk/keluar dengan filter tanggal, pos, petugas
- **FR-WEB-034**: Export logs ke Excel
- **FR-WEB-035**: Pagination untuk logs

### 4.3 Mobile App (Android)

#### 4.3.1 Sync & Offline
- **FR-MOB-001**: Manual sync data master dari server
- **FR-MOB-002**: Local SQLite database dengan struktur sama dengan backend
- **FR-MOB-003**: Queue scan results ketika offline
- **FR-MOB-004**: Sync queued data ke server saat online
- **FR-MOB-005**: Delete synced data dari local untuk hemat memori

#### 4.3.2 Configuration
- **FR-MOB-006**: Set petugas jaga aktif
- **FR-MOB-007**: Set pos jaga aktif
- **FR-MOB-008**: Display current petugas dan pos

#### 4.3.3 QR Scanning
- **FR-MOB-009**: Camera scan QR Code
- **FR-MOB-010**: Toggle button untuk tipe scan (Masuk/Keluar)
  - Default: Masuk
  - Keluar opsional
- **FR-MOB-011**: Auto-detect berdasarkan scan terakhir
- **FR-MOB-012**: Validasi QR:
  - QR terdaftar
  - QR active
  - QR dalam validity period
- **FR-MOB-013**: Display hasil scan dengan:
  - Nama QR (Block/Rumah)
  - Penanggung jawab
  - Tipe scan (Masuk/Keluar)
  - Timestamp
  - UUID hanya digunakan internal untuk matching
- **FR-MOB-014**: Audio feedback:
  - Suara success untuk scan berhasil
  - Suara error + vibration untuk scan gagal
- **FR-MOB-015**: Error messages:
  - "QR tidak terdaftar"
  - "QR tidak aktif"
  - "QR sudah kadaluarsa"

#### 4.3.4 Logs & History
- **FR-MOB-016**: Halaman log masuk (list scan berhasil)
- **FR-MOB-017**: Display status sync untuk setiap log
  - Pending sync (icon)
  - Synced (icon)

#### 4.3.5 Pengumuman
- **FR-MOB-018**: Halaman pengumuman
- **FR-MOB-019**: Display 10 pengumuman terbaru
- **FR-MOB-020**: Mark pengumuman as read
- **FR-MOB-021**: Bell indicator dengan badge count untuk pengumuman unread

#### 4.3.6 Sync Status
- **FR-MOB-022**: Display last sync timestamp
- **FR-MOB-023**: Display pending sync count
- **FR-MOB-024**: Manual sync button

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-001**: Mobile scan QR response < 1 detik
- **NFR-002**: API response < 500ms untuk endpoint critical
- **NFR-003**: Web dashboard load < 2 detik
- **NFR-004**: Support 16KB page size untuk Android

### 5.2 Security
- **NFR-005**: Password hashing menggunakan bcrypt/argon2
- **NFR-006**: JWT token expiry 24 jam
- **NFR-007**: HTTPS untuk production
- **NFR-008**: SQL injection prevention dengan parameterized queries
- **NFR-009**: XSS prevention di web admin

### 5.3 Reliability
- **NFR-010**: Mobile app tetap berfungsi offline
- **NFR-011**: Data integrity saat sync (conflict handling)
- **NFR-012**: Auto-retry untuk sync gagal
- **NFR-013**: Database backup harian

### 5.4 Compatibility
- **NFR-014**: Android API 21+ (Lollipop) dengan target SDK 35
- **NFR-015**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-016**: PostgreSQL 14+

### 5.5 Usability
- **NFR-017**: Intuitive UI untuk petugas keamanan
- **NFR-018**: Clear error messages
- **NFR-019**: Audio dan visual feedback untuk scan

### 5.6 Deployability
- **NFR-020**: Docker container untuk API Backend saja
- **NFR-021**: Database menggunakan managed database service
- **NFR-022**: Web Admin di-deploy ke Cloudflare Pages
- **NFR-023**: Environment-based configuration

---

## 6. Data Model

### 6.1 Database Schema (PostgreSQL)

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
- scanned_at (Timestamp) - Waktu di mobile
- synced_at (Timestamp, nullable) - Waktu sukses sync ke server
- created_at (Timestamp)
```

#### pengumuman_reads
```sql
- id (PK, UUID)
- pengumuman_id (FK pengumuman.id)
- device_id (String) - Identifier device mobile
- read_at (Timestamp)
- created_at (Timestamp)
```

### 6.2 Mobile Database (SQLite)
Struktur sama dengan backend untuk tabel yang perlu di-sync:
- `petugas_jaga` (read-only from server)
- `pos_jaga` (read-only from server)
- `qr_codes` (read-only from server)
- `pengumuman` (read-only from server)
- `scan_logs` (create on mobile, sync to server)
- `pengumuman_reads` (create on mobile, sync to server)

---

## 7. API Endpoints

### 7.1 Authentication
```
POST   /api/auth/login          - Login superadmin/admin
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Get current user info
```

### 7.2 Users (Superadmin only)
```
GET    /api/users               - List users dengan pagination
POST   /api/users               - Create user
GET    /api/users/:id           - Get user detail
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Soft delete user
POST   /api/users/:id/reset-password - Reset password
```

### 7.3 Petugas Jaga
```
GET    /api/petugas             - List petugas jaga
POST   /api/petugas             - Create petugas jaga
GET    /api/petugas/:id         - Get detail
PUT    /api/petugas/:id         - Update petugas jaga
DELETE /api/petugas/:id         - Soft delete
```

### 7.4 Pos Jaga
```
GET    /api/pos                 - List pos jaga
POST   /api/pos                 - Create pos jaga
GET    /api/pos/:id             - Get detail
PUT    /api/pos/:id             - Update pos jaga
DELETE /api/pos/:id             - Soft delete
```

### 7.5 QR Codes
```
GET    /api/qr                  - List QR dengan filter
POST   /api/qr                  - Create QR
GET    /api/qr/:id              - Get detail
PUT    /api/qr/:id              - Update QR
DELETE /api/qr/:id              - Soft delete
POST   /api/qr/generate         - Generate new UUID
GET    /api/qr/:id/image        - Generate QR image (PNG)
POST   /api/qr/pdf             - Generate PDF untuk multiple QR
POST   /api/qr/bulk-upload      - Bulk upload QR
```

### 7.6 Pengumuman
```
GET    /api/pengumuman          - List pengumuman
POST   /api/pengumuman          - Create pengumuman
GET    /api/pengumuman/:id      - Get detail
PUT    /api/pengumuman/:id      - Update pengumuman
DELETE /api/pengumuman/:id      - Soft delete
```

### 7.7 Mobile Sync (No auth required)
```
GET    /api/mobile/sync         - Get all master data for sync
POST   /api/mobile/sync-logs    - Submit scan logs from mobile
POST   /api/mobile/read-announce - Mark pengumuman as read
GET    /api/mobile/pengumuman   - Get 10 latest pengumuman
```

### 7.8 Logs & Reporting
```
GET    /api/logs                - List scan logs dengan filter
GET    /api/logs/stats          - Get statistics for dashboard
GET    /api/logs/export         - Export to Excel
```

---

## 8. User Interface Design

### 8.1 Color Palette
```
Primary     : #060273 (Biru Tua)
Secondary   : #5F5DA6 (Biru Medium)
Accent      : #040959 (Biru Gelap)
Background  : #F2F2F2 (Putih Abu)
Text        : #0D0D0D (Hitam)
Success     : #22C55E (Green)
Error       : #EF4444 (Red)
Warning     : #F59E0B (Yellow)
```

### 8.2 Mobile Screen Flow

```
┌─────────────────────────────────────────────────────────┐
│  Home Screen                                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Petugas Jaga: [Dropdown/Pilih]                   │  │
│  │  Pos Jaga: [Dropdown/Pilih]                       │  │
│  │  Scan Type: ◉ Masuk ○ Keluar                      │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐     │  │
│  │  │     [Camera Preview Area]               │     │  │
│  │  │                                         │     │  │
│  │  │     [Scan QR Code]                      │     │  │
│  │  └─────────────────────────────────────────┘     │  │
│  │                                                   │  │
│  │  Status Sync: Last sync 2 jam lalu               │  │
│  │           Pending: 3 logs                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Bottom Nav: [Scan] [Logs] [Pengumuman] [Sync]         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Scan Result Screen (Success)                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ✓ SUCCESS                                       │  │
│  │                                                   │  │
│  │  QR: Block A-123                                 │  │
│  │  Penanggung Jawab: Bpk. Ahmad                    │  │
│  │  Tipe: MASUK                                      │  │
│  │  Waktu: 10/03/2026 14:30:25                      │  │
│  │                                                   │  │
│  │  [OK]                                             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Logs Screen                                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Filter: [All] [Pending Sync] [Synced]           │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐     │  │
│  │  │ Block A-123 | Masuk  | 14:30  | ⏳ Pending│     │  │
│  │  │ Block B-456 | Keluar | 13:15  | ✓ Synced │     │  │
│  │  │ Block C-789 | Masuk  | 12:00  | ✓ Synced │     │  │
│  │  └─────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Pengumuman Screen (with bell badge)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  🔔 Penting: Jam malam dimulai pukul 22:00        │  │
│  │  10/03/2026 - Baru                                │  │
│  │                                                   │  │
│  │  ─────────────────────────────────────────────    │  │
│  │                                                   │  │
│  │  📢 Pos 1 ditutup sementara                       │  │
│  │  09/03/2026 - Dibaca                             │  │
│  │                                                   │  │
│  │  ─────────────────────────────────────────────    │  │
│  │                                                   │  │
│  │  ℹ️ Ganti jaga jam 08:00                          │  │
│  │  08/03/2026 - Dibaca                             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 8.3 Web Admin Pages

**Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│  Logo | Pengamanan Lebaran 2026  | Admin | Logout      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ Masuk Hari   │  │ Keluar Hari  │                    │
│  │     127      │  │      95      │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                         │
│  [Grafik 7 hari terakhir]                              │
│                                                         │
│  Scan Terakhir:                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Block A-123 | Masuk | Bpk. Joko | Pos 1 | 14:30 │   │
│  │ Block B-456 | Keluar| Ibu Siti | Pos 2 | 13:15 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Technical Specifications

### 9.1 Technology Stack

#### API Backend
- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Export**: ExcelJS
- **Auth**: JWT
- **Deployment**: Docker

#### Web Admin
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **UI Library**: Radix UI + Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Routing**: React Router v7
- **Form**: React Hook Form + Zod
- **HTTP**: Axios
- **PDF Generation**: jsPDF + qrcode
- **Deployment**: Cloudflare Pages

#### Mobile App
- **Language**: Kotlin
- **Min SDK**: 21 (Lollipop)
- **Target SDK**: 35
- **Database**: SQLite (SQLDelight)
- **Camera**: ML Kit QR Scanner
- **HTTP**: Retrofit + OkHttp
- **Async**: Kotlin Coroutines + Flow
- **DI**: Koin
- **UI**: Jetpack Compose

### 9.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                        │
│                    (Web Admin - React)                      │
│  • Static site deployment                                   │
│  • Auto-deploy from git push                               │
│  • Global CDN                                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers / External Server       │
│                   (API Backend - Bun/Hono)                  │
│  • Docker container on VPS/Cloud service                   │
│  • REST API endpoints                                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Managed Database Service                       │
│                    (PostgreSQL 14+)                         │
│  • Supabase / Neon / Railway / etc                         │
│  • Managed backups                                         │
│  • Connection pooling                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Testing Strategy

### 10.1 Unit Testing
- API: Test semua endpoint dan business logic
- Web: Test komponen dan hooks
- Mobile: Test ViewModel dan Repository

### 10.2 Integration Testing
- API integration dengan database
- Web integration dengan API
- Mobile sync API

### 10.3 E2E Testing
- Flow login → create QR → scan → view logs
- Offline sync flow

---

## 11. Success Metrics

- [ ] 100+ QR codes terdaftar
- [ ] 500+ scan transactions per day
- [ ] < 1 detik response time untuk scan
- [ ] 99% uptime selama periode Lebaran
- [ ] Zero data loss pada sync

---

## 12. Future Enhancements (Phase 2)

- [ ] Real-time notifications ke admin untuk activity mencurigakan
- [ ] Face recognition sebagai alternative QR
- [ ] Multi-lingual support
- [ ] Mobile app untuk iOS
- [ ] Advanced analytics dan reporting
- [ ] Integration dengan CCTV system

---

## 13. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Internet down di pos jaga | High | Offline mode + queue sync |
| Camera tidak bisa scan QR | High | Fallback manual entry |
| Database crash | Critical | Daily backup + replication |
| Mobile battery drain | Medium | Optimize camera usage |
| Petugas salah pilih tipe scan | Medium | Auto-detect + confirmation |

---

## 14. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
| Security | | | |

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 10/03/2026 | Claude | Initial PRD |
