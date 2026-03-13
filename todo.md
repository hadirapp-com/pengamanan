# Pengamanan Lebaran 2026 - Development Log

## Completed Features ✅

### Mobile App

#### Core Features
- [x] **QR Code Scanning**
  - Single scan endpoint integration
  - Real-time validation with server
  - Offline mode support (save locally, sync later)
  - Background sync via WorkManager

- [x] **Authentication**
  - PIN-based authentication (6 digits)
  - JWT token management (3 months expiry)
  - Auto-refresh token

- [x] **Data Management**
  - Manual sync from settings
  - Auto-sync on app start if no data
  - Periodic background sync
  - Unsynced logs tracking

- [x] **User Management**
  - Logout with data cleanup
  - Auto-sync before logout
  - Delete all local data on logout

#### UI/UX
- [x] **Home Screen**
  - Dynamic app title from API config (APP_TITLE)
  - Current petugas & pos selection display
  - Quick access buttons (FAB scan, settings)
  - Pengumuman cards (latest 3)
  - Warning card if petugas/pos not selected

- [x] **Settings Screen**
  - Petugas selection with white text on selected card
  - Pos selection with white text on selected card
  - Manual sync button
  - Logout button with confirmation
  - Unsynced logs warning card

- [x] **Logs/History Screen**
  - Log cards with scan details
  - QR info display (nama, penanggung jawab)
  - Delete button (48x48) for synced logs
  - Auto-refresh after delete
  - No swipe-to-delete (explicit delete button)

- [x] **Theme**
  - Primary color: #050272 (HSL 242.12°, 96.58%, 22.94%)
  - White status bar icons (light & dark mode)
  - Consistent Material 3 design

#### API Integration
- [x] **Comprehensive Logging**
  - Request logging (endpoint, method, body)
  - Response logging (status, success, data)
  - Error logging (HTTP code, error body, stack trace)
  - Sync operation logging

- [x] **Error Handling**
  - Offline mode fallback
  - Detailed error messages
  - User-friendly error display

### API Changes

#### Mobile Endpoints
- [x] **POST /mobile/scan**
  - Remove auto-toggle validation
  - Allow multiple scans per QR
  - Request: `{ qrCode, petugasId, posId, tipeScan }`
  - Response: scan data, QR info, petugas, pos

- [x] **GET /mobile/config/:key**
  - Fetch public config values
  - Used for APP_TITLE, HOME_SCREEN_BANNER

#### Validation
- [x] Schema validation using Zod
- [x] Field name: `petugasId` (not `petugasJagaId`)
- [x] Required fields validation

### DevOps
- [x] **GitHub Actions**
  - Update Node.js: 20 → 24
  - Deploy API workflow
  - Deploy Web workflow

## Current Status

### Mobile
- Build: ✅ Successful
- APK: `mobile/app/build/outputs/apk/debug/app-debug.apk`
- Status: Ready for testing

### API
- Runtime: Bun
- Port: 5000
- Status: Running with updated code

### Web
- Build: ✅ Successful
- Deploy: Cloudflare Pages (via GitHub Actions)

## Known Issues
- None (as of latest commit)

## Next Steps
- [ ] Test QR scanning with real devices
- [ ] Test logout flow with unsynced data
- [ ] Test background sync functionality
- [ ] Monitor error logs in production

## Technical Notes

### Database Schema
- Logs table: synced flag (0 = unsynced, 1 = synced)
- Only synced logs can be deleted
- Unsynced logs: trigger sync before delete

### Sync Flow
1. Manual sync: Settings → Sync Data button
2. Auto-sync: On app start if no local data
3. Background sync: WorkManager (periodic)
4. Logout sync: Auto-sync before logout if unsynced data exists

### Logging Tags
- `API_CALL`: Scan operations
- `SYNC_LOGS`: Offline logs sync
- `SYNC_DATA`: Master data sync
- `SETTINGS`: Logout operations

### Config Keys
- `APP_TITLE`: Home screen title
- `HOME_SCREEN_BANNER`: Welcome popup image URL
- `mobile_pin`: 6-digit PIN for authentication

## Development Environment

### Mobile
- Kotlin, Jetpack Compose, Hilt
- SQLDelight for local database
- Retrofit for API calls
- WorkManager for background tasks

### API
- Bun runtime
- Hono framework
- Drizzle ORM
- PostgreSQL database
- Docker Compose

### Web
- React, TypeScript
- Zustand for state management
- Vite build tool
- Cloudflare Pages hosting
