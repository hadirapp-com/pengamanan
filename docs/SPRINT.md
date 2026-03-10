# Sprint Planning
## Aplikasi Pengamanan Lebaran 2026

**Version**: 1.0
**Date**: 10 Maret 2026
**Project Duration**: Target selesai sebelum Lebaran 2026

---

## Overview

Project ini dibagi menjadi 3 sprints utama dengan deliverables yang jelas:

1. **Sprint 1**: API Backend & Database Setup
2. **Sprint 2**: Web Admin Dashboard
3. **Sprint 3**: Android Mobile Application

---

## Sprint 1: API Backend & Database (Week 1-2)

### Goal
Membangun REST API dengan database, authentication, dan semua endpoint yang dibutuhkan.

### Stories & Tasks

#### Story 1.1: Database Setup & Migration
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Setup PostgreSQL database connection (Drizzle ORM)
- [ ] Create database schema migration files
- [ ] Create all tables: users, petugas_jaga, pos_jaga, qr_codes, pengumuman, scan_logs, pengumuman_reads
- [ ] Add audit trail fields (created_by, updated_by)
- [ ] Setup soft delete pattern
- [ ] Create database seed file
- [ ] Test database migration up/down

**Definition of Done**:
- Migration files can run successfully
- All tables created with correct schema
- Seed data can be inserted
- Can rollback migration

---

#### Story 1.2: Authentication & Authorization
**Points**: 5
**Status**: ⬜ To Do

**Tasks**:
- [ ] Implement password hashing (bcrypt)
- [ ] Create JWT token generation & validation
- [ ] Build login endpoint `/api/auth/login`
- [ ] Build logout endpoint `/api/auth/logout`
- [ ] Build `/api/auth/me` endpoint
- [ ] Create auth middleware for protected routes
- [ ] Implement role-based access control (RBAC)
- [ ] Add refresh token mechanism (optional)

**Definition of Done**:
- Can login with valid credentials
- Invalid credentials rejected with proper error
- Protected routes require valid JWT
- Role check works correctly

---

#### Story 1.3: User Management API
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] GET `/api/users` - List users with pagination
- [ ] POST `/api/users` - Create user (superadmin only)
- [ ] GET `/api/users/:id` - Get user detail
- [ ] PUT `/api/users/:id` - Update user
- [ ] DELETE `/api/users/:id` - Soft delete user
- [ ] POST `/api/users/:id/reset-password` - Reset password
- [ ] Add validation with Zod
- [ ] Add audit trail logging

**Definition of Done**:
- All CRUD endpoints working
- Only superadmin can create users
- Password is hashed before storing
- Audit trail recorded

---

#### Story 1.4: Petugas Jaga API
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] GET `/api/petugas` - List petugas jaga
- [ ] POST `/api/petugas` - Create petugas jaga
- [ ] GET `/api/petugas/:id` - Get detail
- [ ] PUT `/api/petugas/:id` - Update petugas jaga
- [ ] DELETE `/api/petugas/:id` - Soft delete
- [ ] Add filter by is_active
- [ ] Add validation with Zod
- [ ] Add audit trail logging

**Definition of Done**:
- All CRUD endpoints working
- Filter works correctly
- Validation prevents invalid data

---

#### Story 1.5: Pos Jaga API
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] GET `/api/pos` - List pos jaga
- [ ] POST `/api/pos` - Create pos jaga
- [ ] GET `/api/pos/:id` - Get detail
- [ ] PUT `/api/pos/:id` - Update pos jaga
- [ ] DELETE `/api/pos/:id` - Soft delete
- [ ] Add filter by is_active
- [ ] Add validation with Zod
- [ ] Add audit trail logging

**Definition of Done**:
- All CRUD endpoints working
- Filter works correctly

---

#### Story 1.6: QR Code Management API
**Points**: 5
**Status**: ⬜ To Do

**Tasks**:
- [ ] GET `/api/qr` - List QR with filters
- [ ] POST `/api/qr` - Create QR with auto-generated UUID dan nama
- [ ] GET `/api/qr/:id` - Get detail
- [ ] PUT `/api/qr/:id` - Update QR (nama, penanggung_jawab, validity period)
- [ ] DELETE `/api/qr/:id` - Soft delete
- [ ] POST `/api/qr/generate` - Generate new UUID
- [ ] GET `/api/qr/:id/image` - Generate QR image (PNG)
- [ ] POST `/api/qr/pdf` - Generate PDF untuk multiple QR
  - Accept array of QR IDs
  - Generate grid layout
  - QR image on top, nama & penanggung jawab below
- [ ] POST `/api/qr/bulk-upload` - Bulk upload via CSV/Excel
- [ ] Add validation: check validity period overlap
- [ ] Add audit trail logging
- [ ] Test QR uniqueness constraint

**Definition of Done**:
- QR UUIDs are unique
- QR image can be generated (PNG)
- PDF can be generated for multiple QR
- Bulk upload works
- Validity period validation works
- nama field displays correctly in logs

---

#### Story 1.7: Pengumuman API
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] GET `/api/pengumuman` - List pengumuman
- [ ] POST `/api/pengumuman` - Create pengumuman
- [ ] GET `/api/pengumuman/:id` - Get detail
- [ ] PUT `/api/pengumuman/:id` - Update pengumuman
- [ ] DELETE `/api/pengumuman/:id` - Soft delete
- [ ] Add filter by is_active and priority
- [ ] Add validation with Zod
- [ ] Add audit trail logging

**Definition of Done**:
- All CRUD endpoints working
- Priority filtering works

---

#### Story 1.8: Mobile Sync API
**Points**: 5
**Status**: ⬜ To Do

**Tasks**:
- [ ] GET `/api/mobile/sync` - Get all master data for mobile
  - Return: petugas_jaga, pos_jaga, qr_codes, pengumuman
  - Filter only active records
- [ ] POST `/api/mobile/sync-logs` - Receive scan logs from mobile
  - Accept array of scan logs
  - Validate each log
  - Insert with proper timestamp
  - Mark synced_at timestamp
- [ ] POST `/api/mobile/read-announce` - Mark pengumuman as read
  - Create pengumuman_reads record
  - Check for duplicates
- [ ] GET `/api/mobile/pengumuman` - Get 10 latest active pengumuman
  - Sort by created_at DESC
  - Limit 10
- [ ] Add validation for scan logs
- [ ] Add error handling for partial sync failures

**Definition of Done**:
- Mobile can download all master data
- Scan logs can be uploaded in batch
- Pengumuman read status tracked
- No auth required (mobile public endpoints)

---

#### Story 1.9: Logging & Reporting API
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] GET `/api/logs` - List scan logs with filters
  - Filter: date range, pos_id, petugas_id, tipe_scan
  - Pagination support
  - Sort by scanned_at DESC
- [ ] GET `/api/logs/stats` - Get dashboard statistics
  - Total masuk today
  - Total keluar today
  - Last 7 days data
- [ ] GET `/api/logs/export` - Export to Excel
  - Use ExcelJS
  - Include all filtered data
  - Format: readable columns
- [ ] Optimize query with proper indexes

**Definition of Done**:
- Logs can be filtered correctly
- Statistics query returns correct data
- Excel export works with proper formatting
- Query performance < 500ms

---

#### Story 1.10: Database Seeding
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create superadmin account (username: superadmin, password: admin123)
- [ ] Create sample admin account
- [ ] Create 3-5 sample petugas jaga
- [ ] Create 2-3 sample pos jaga
- [ ] Create 10-20 sample QR codes with validity dates
- [ ] Create sample pengumuman
- [ ] Add documentation how to run seed

**Definition of Done**:
- Can run seed command
- Default accounts work for login
- Sample data adequate for testing

---

#### Story 1.11: Docker Setup
**Points**: 1
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create Dockerfile for API
- [ ] Add environment configuration
- [ ] Add healthcheck endpoint
- [ ] Test build and run container
- [ ] Create deployment documentation for:
  - Managed database service (Supabase/Neon/Railway)
  - Cloudflare Pages for web admin

**Definition of Done**:
- `docker build` runs successfully
- API container runs successfully
- Deployment documentation complete

---

#### Story 1.12: API Documentation
**Points**: 1
**Status**: ⬜ To Do

**Tasks**:
- [ ] Setup OpenAPI/Swagger documentation
- [ ] Document all endpoints
- [ ] Add request/response examples
- [ ] Add authentication details
- [ ] Test OpenAPI UI

**Definition of Done**:
- OpenAPI JSON generated
- Swagger UI accessible
- All endpoints documented

---

### Sprint 1 Summary

| Story | Points | Status |
|-------|--------|--------|
| 1.1 Database Setup | 3 | ⬜ To Do |
| 1.2 Auth & JWT | 5 | ⬜ To Do |
| 1.3 User Management | 3 | ⬜ To Do |
| 1.4 Petugas Jaga | 2 | ⬜ To Do |
| 1.5 Pos Jaga | 2 | ⬜ To Do |
| 1.6 QR Codes | 5 | ⬜ To Do |
| 1.7 Pengumuman | 2 | ⬜ To Do |
| 1.8 Mobile Sync | 5 | ⬜ To Do |
| 1.9 Logging & Reports | 3 | ⬜ To Do |
| 1.10 Seeding | 2 | ⬜ To Do |
| 1.11 Docker | 1 | ⬜ To Do |
| 1.12 Documentation | 1 | ⬜ To Do |
| **Total** | **36** | |

**Sprint 1 Deliverables**:
- ✅ REST API dengan semua endpoint
- ✅ Database PostgreSQL dengan schema lengkap
- ✅ Authentication & Authorization
- ✅ Docker deployment ready
- ✅ API Documentation

---

## Sprint 2: Web Admin Dashboard (Week 3-4)

### Goal
Membangun dashboard admin untuk mengelola semua master data dan melihat laporan.

### Stories & Tasks

#### Story 2.1: Project Setup & Base Layout
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Setup React 19 + Vite project structure
- [ ] Configure Tailwind CSS v4
- [ ] Setup Radix UI components
- [ ] Create base layout with header/sidebar
- [ ] Setup routing structure
- [ ] Create color theme configuration
- [ ] Setup Axios instance with interceptors
- [ ] Setup TanStack Query
- [ ] Setup Zustand store

**Definition of Done**:
- Project runs with `npm run dev`
- Base layout displays correctly
- Routing works
- Theme uses defined color palette

---

#### Story 2.2: Authentication UI
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create login page UI
- [ ] Implement login form with validation
- [ ] Handle login API call
- [ ] Store JWT token securely
- [ ] Implement auth state management
- [ ] Create protected route wrapper
- [ ] Handle auto-logout on token expiry
- [ ] Create logout functionality
- [ ] Add loading states and error handling

**Definition of Done**:
- Can login with valid credentials
- Invalid login shows error
- Protected pages redirect to login
- Logout works correctly

---

#### Story 2.3: Dashboard Home
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create dashboard statistics cards
  - Total masuk hari ini
  - Total keluar hari ini
- [ ] Create 7-day chart (use chart library)
- [ ] Create recent scans table
- [ ] Add refresh button
- [ ] Implement real-time updates (optional)
- [ ] Handle loading and error states

**Definition of Done**:
- Statistics display correctly
- Chart renders with proper data
- Recent scans show latest data
- Data refreshes on button click

---

#### Story 2.4: User Management UI
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create user list page with table
- [ ] Add search and filter functionality
- [ ] Add pagination
- [ ] Create add user dialog/form
- [ ] Create edit user dialog/form
- [ ] Implement delete confirmation
- [ ] Create reset password functionality
- [ ] Add form validation with Zod
- [ ] Handle success/error toasts

**Definition of Done**:
- Can list, search, filter users
- Can create new user
- Can edit existing user
- Can delete user with confirmation
- Can reset password

---

#### Story 2.5: Petugas Jaga UI
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create petugas list page with table
- [ ] Add filter by is_active
- [ ] Add search functionality
- [ ] Create add petugas dialog/form
- [ ] Create edit petugas dialog/form
- [ ] Implement delete confirmation
- [ ] Add form validation
- [ ] Handle success/error toasts

**Definition of Done**:
- CRUD operations work
- Filter works correctly
- Form validation prevents invalid data

---

#### Story 2.6: Pos Jaga UI
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create pos list page with table
- [ ] Add filter by is_active
- [ ] Add search functionality
- [ ] Create add pos dialog/form
- [ ] Create edit pos dialog/form
- [ ] Implement delete confirmation
- [ ] Add form validation
- [ ] Handle success/error toasts

**Definition of Done**:
- CRUD operations work
- Filter works correctly

---

#### Story 2.7: QR Code Management UI
**Points**: 5
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create QR list page with table
- [ ] Add filters: is_active, validity period
- [ ] Add search functionality
- [ ] Add checkbox for multi-select QR
- [ ] Create add QR dialog/form
  - Auto-generate UUID on save
  - Input nama (block/rumah)
  - Input penanggung jawab
- [ ] Create edit QR dialog/form (nama, penanggung_jawab, validity period)
- [ ] Implement activate/deactivate toggle
- [ ] Implement delete confirmation
- [ ] Create QR code preview dialog
- [ ] Add download QR image button (PNG)
- [ ] Add print to PDF button for selected QRs
  - Generate PDF with grid layout
  - QR image on top, nama & penanggung jawab below
  - Show preview before download
- [ ] Create bulk upload dialog
  - Drag & drop CSV/Excel
  - Preview before import
  - Progress indicator
- [ ] Add form validation
- [ ] Handle success/error toasts

**Definition of Done**:
- Can create single QR with nama field
- Can edit QR details
- Can generate and download QR image (PNG)
- Can generate PDF for multiple QR
- Can bulk upload QR
- Activate/deactivate works
- nama displays correctly in all views

---

#### Story 2.8: Pengumuman UI
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create pengumuman list page with table
- [ ] Add filter by priority and is_active
- [ ] Create add pengumuman dialog/form
- [ ] Create edit pengumuman dialog/form
- [ ] Implement delete confirmation
- [ ] Add priority indicator (color coding)
- [ ] Add form validation (rich text or textarea)
- [ ] Handle success/error toasts

**Definition of Done**:
- CRUD operations work
- Priority shows correct color
- Form validation works

---

#### Story 2.9: Logs & Reporting UI
**Points**: 4
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create logs list page with table
- [ ] Add filters: date range, pos, petugas, tipe_scan
- [ ] Add search functionality
- [ ] Add pagination
- [ ] Implement export to Excel button
  - Call export API
  - Download file
  - Show progress
- [ ] Display log details: QR info, petugas, pos, timestamp
- [ ] Add color indicator for masuk/keluar
- [ ] Handle loading states

**Definition of Done**:
- Can filter logs by all criteria
- Export to Excel works
- Pagination works correctly
- Data displays correctly

---

#### Story 2.10: Audit Trail UI (Optional)
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create audit trail page
- [ ] Show who created/updated each record
- [ ] Add filters: entity, date range, user
- [ ] Display in readable format
- [ ] Add pagination

**Definition of Done**:
- Audit trail displays correctly
- Filters work

---

#### Story 2.11: Responsive Design & Polish
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Make all pages responsive
- [ ] Optimize for mobile screens
- [ ] Add loading skeletons
- [ ] Improve error messages
- [ ] Add empty states
- [ ] Fix any UI inconsistencies
- [ ] Cross-browser testing

**Definition of Done**:
- Works on desktop and tablet
- Loading states look good
- Error messages are helpful
- No visual bugs

---

#### Story 2.12: Cloudflare Pages Deployment
**Points**: 1
**Status**: ⬜ To Do

**Tasks**:
- [ ] Configure build command for Cloudflare Pages
- [ ] Add environment variables for API URL
- [ ] Create production build configuration
- [ ] Test production build locally
- [ ] Create deployment documentation

**Definition of Done**:
- Production build works
- Environment variables configured
- Deployment documentation complete

---

### Sprint 2 Summary

| Story | Points | Status |
|-------|--------|--------|
| 2.1 Project Setup | 2 | ⬜ To Do |
| 2.2 Authentication | 3 | ⬜ To Do |
| 2.3 Dashboard | 3 | ⬜ To Do |
| 2.4 User Management | 3 | ⬜ To Do |
| 2.5 Petugas Jaga | 2 | ⬜ To Do |
| 2.6 Pos Jaga | 2 | ⬜ To Do |
| 2.7 QR Codes | 5 | ⬜ To Do |
| 2.8 Pengumuman | 2 | ⬜ To Do |
| 2.9 Logs & Reports | 4 | ⬜ To Do |
| 2.10 Audit Trail | 2 | ⬜ To Do |
| 2.11 Responsive | 2 | ⬜ To Do |
| 2.12 Cloudflare Pages | 1 | ⬜ To Do |
| **Total** | **36** | |

**Sprint 2 Deliverables**:
- ✅ Full admin dashboard web application
- ✅ Authentication with login/logout
- ✅ CRUD untuk semua master data
- ✅ Dashboard dengan statistik
- ✅ Logs view dengan export Excel
- ✅ Responsive design

---

## Sprint 3: Android Mobile Application (Week 5-7)

### Goal
Membangun aplikasi Android untuk petugas keamanan melakukan scan QR.

### Stories & Tasks

#### Story 3.1: Project Setup & Architecture
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create Kotlin Android project
- [ ] Configure build.gradle (SDK 21+, target 35)
- [ ] Setup Jetpack Compose
- [ ] Configure 16KB page size
- [ ] Setup project structure (clean architecture)
  - data layer
  - domain layer
  - presentation layer
- [ ] Setup DI with Koin
- [ ] Define color palette in theme
- [ ] Add icons from resources/android
- [ ] Setup SQLDelight for SQLite
- [ ] Setup Retrofit + OkHttp

**Definition of Done**:
- Project compiles successfully
- Architecture folders created
- Theme configured with correct colors
- All dependencies added

---

#### Story 3.2: Local Database Setup
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create SQLDelight schema for:
  - petugas_jaga
  - pos_jaga
  - qr_codes
  - pengumuman
  - scan_logs
  - pengumuman_reads
- [ ] Create database manager
- [ ] Create DAOs for each table
- [ ] Add indexes for performance
- [ ] Test database operations
- [ ] Create database migrations plan

**Definition of Done**:
- Database can be created
- CRUD operations work
- Migrations can be applied

---

#### Story 3.3: API Client & Sync Service
**Points**: 4
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create API service interfaces
- [ ] Create Retrofit client
- [ ] Create DTOs for API responses
- [ ] Create SyncService for:
  - Fetch master data
  - Upload scan logs
  - Upload pengumuman reads
- [ ] Implement sync strategy
- [ ] Add retry logic for failed sync
- [ ] Handle network errors
- [ ] Add sync status callbacks

**Definition of Done**:
- Can call API endpoints
- Sync service works correctly
- Error handling works
- Retry mechanism works

---

#### Story 3.4: Repository & Data Layer
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create Repositories:
  - PetugasRepository
  - PosRepository
  - QrRepository
  - PengumumanRepository
  - ScanLogRepository
- [ ] Implement local data source
- [ ] Implement remote data source
- [ ] Create data sync logic
- [ ] Add Flow/LiveData for reactive updates
- [ ] Add error handling

**Definition of Done**:
- Repositories work correctly
- Data flows from remote → local → UI
- Error handling implemented

---

#### Story 3.5: Home Screen
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create HomeScreen Compose
- [ ] Add petugas jaga dropdown/selector
- [ ] Add pos jaga dropdown/selector
- [ ] Add scan type toggle (Masuk/Keluar)
- [ ] Display current configuration
- [ ] Save configuration to local storage
- [ ] Add sync status indicator
  - Last sync timestamp
  - Pending count
- [ ] Handle loading states

**Definition of Done**:
- Home screen displays correctly
- Can select petugas and pos
- Scan type toggle works
- Sync status shows correctly

---

#### Story 3.6: QR Scanner
**Points**: 5
**Status**: ⬜ To Do

**Tasks**:
- [ ] Setup ML Kit QR Scanner
- [ ] Create camera permission handling
- [ ] Create CameraPreview Compose
- [ ] Implement QR scanning logic
- [ ] Validate scanned QR:
  - Check if exists in local DB
  - Check is_active
  - Check validity period
- [ ] Handle scan result
- [ ] Save scan to local database
- [ ] Implement auto-detect based on last scan
- [ ] Add vibration for error
- [ ] Add sound effects (success/error)
- [ ] Handle camera lifecycle

**Definition of Done**:
- Camera opens correctly
- QR can be scanned
- Validation works
- Scan result saved locally
- Audio/vibration feedback works

---

#### Story 3.7: Scan Result Screen
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create ScanResultScreen Compose
- [ ] Display success state with:
  - ✓ icon
  - Nama QR
  - Penanggung jawab
  - Tipe scan (Masuk/Keluar)
  - Timestamp
- [ ] Display error state with:
  - ✗ icon
  - Error message (QR tidak terdaftar, dll)
- [ ] Add OK button to return
- [ ] Auto-dismiss after 3 seconds (optional)

**Definition of Done**:
- Success state shows all info
- Error state shows message
- OK button works

---

#### Story 3.8: Logs Screen
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create LogsScreen Compose
- [ ] Display list of scan logs
- [ ] Add filter tabs: All, Pending, Synced
- [ ] Show sync status icon for each log
- [ ] Display log info: QR, tipe, timestamp
- [ ] Implement pull-to-refresh
- [ ] Handle empty state
- [ ] Add loading state

**Definition of Done**:
- Logs display correctly
- Filter tabs work
- Sync status shows correctly
- Pull-to-refresh works

---

#### Story 3.9: Pengumuman Screen
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create PengumumanScreen Compose
- [ ] Display list of 10 latest pengumuman
- [ ] Mark pengumuman as read on tap
- [ ] Update read status to server
- [ ] Add priority indicator (color)
- [ ] Handle empty state
- [ ] Add pull-to-refresh
- [ ] Track unread count for bell badge

**Definition of Done**:
- Pengumuman displays correctly
- Read status updates
- Priority shows correct color
- Unread count tracked

---

#### Story 3.10: Sync Functionality
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create SyncScreen or Sync dialog
- [ ] Implement manual sync button
- [ ] Show sync progress
- [ ] Handle sync errors gracefully
- [ ] Implement background sync (optional)
- [ ] Add sync scheduling (optional)
- [ ] Display sync result (success/fail count)

**Definition of Done**:
- Manual sync works
- Progress shows correctly
- Errors handled gracefully

---

#### Story 3.11: Offline Support
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Implement offline detection
- [ ] Queue scan results when offline
- [ ] Sync queued data when online
- [ ] Show offline indicator
- [ ] Handle partial sync (some fail, some success)
- [ ] Add retry failed sync functionality

**Definition of Done**:
- App works without internet
- Data queued when offline
- Sync happens when online
- Partial sync handled

---

#### Story 3.12: Navigation & Polish
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Setup navigation with Compose Navigation
- [ ] Create bottom navigation bar
  - Scan (Home)
  - Logs
  - Pengumuman
  - Sync
- [ ] Add bell badge for unread pengumuman
- [ ] Handle back button correctly
- [ ] Add app icon and launcher
- [ ] Fix any UI issues
- [ ] Test on different screen sizes

**Definition of Done**:
- Navigation works
- Bottom nav shows correct active tab
- Bell badge shows unread count
- App looks polished

---

#### Story 3.13: Testing & Bug Fixes
**Points**: 3
**Status**: ⬜ To Do

**Tasks**:
- [ ] Test scan flow end-to-end
- [ ] Test offline/online transitions
- [ ] Test sync scenarios
- [ ] Test on different Android versions
- [ ] Fix any bugs found
- [ ] Optimize performance
- [ ] Check memory usage
- [ ] Test battery consumption

**Definition of Done**:
- No critical bugs
- Performance acceptable
- Memory usage reasonable

---

#### Story 3.14: Build & Release Preparation
**Points**: 2
**Status**: ⬜ To Do

**Tasks**:
- [ ] Create release build variant
- [ ] Configure app signing
- [ ] Set version number and name
- [ ] Generate APK/AAB
- [ ] Create screenshots for Play Store
- [ ] Write Play Store description
- [ ] Test install from APK

**Definition of Done**:
- Release APK/AAB generated
- Can be installed on device
- Ready for Play Store upload

---

### Sprint 3 Summary

| Story | Points | Status |
|-------|--------|--------|
| 3.1 Project Setup | 3 | ⬜ To Do |
| 3.2 Database | 3 | ⬜ To Do |
| 3.3 API Client | 4 | ⬜ To Do |
| 3.4 Repository | 3 | ⬜ To Do |
| 3.5 Home Screen | 3 | ⬜ To Do |
| 3.6 QR Scanner | 5 | ⬜ To Do |
| 3.7 Scan Result | 2 | ⬜ To Do |
| 3.8 Logs Screen | 3 | ⬜ To Do |
| 3.9 Pengumuman | 3 | ⬜ To Do |
| 3.10 Sync | 3 | ⬜ To Do |
| 3.11 Offline | 3 | ⬜ To Do |
| 3.12 Navigation | 2 | ⬜ To Do |
| 3.13 Testing | 3 | ⬜ To Do |
| 3.14 Release | 2 | ⬜ To Do |
| **Total** | **46** | |

**Sprint 3 Deliverables**:
- ✅ Android mobile application
- ✅ QR scanning with camera
- ✅ Offline support
- ✅ Sync functionality
- ✅ Logs view
- ✅ Pengumuman system
- ✅ Release APK/AAB

---

## Sprint Summary

| Sprint | Duration | Points | Focus |
|--------|----------|--------|-------|
| 1 | Week 1-2 | 36 | API Backend & Database |
| 2 | Week 3-4 | 36 | Web Admin Dashboard |
| 3 | Week 5-7 | 46 | Android Mobile App |
| **Total** | **7 weeks** | **118** | |

---

## Tracking Progress

### Sprint 1 Progress
- [ ] Story 1.1 - Database Setup (3 pts)
- [ ] Story 1.2 - Authentication (5 pts)
- [ ] Story 1.3 - User Management (3 pts)
- [ ] Story 1.4 - Petugas Jaga (2 pts)
- [ ] Story 1.5 - Pos Jaga (2 pts)
- [ ] Story 1.6 - QR Codes (5 pts)
- [ ] Story 1.7 - Pengumuman (2 pts)
- [ ] Story 1.8 - Mobile Sync (5 pts)
- [ ] Story 1.9 - Logging (3 pts)
- [ ] Story 1.10 - Seeding (2 pts)
- [ ] Story 1.11 - Docker (1 pts)
- [ ] Story 1.12 - Documentation (1 pts)

**Sprint 1 Status**: 🔄 Not Started
**Completed**: 0 / 36 pts (0%)

---

### Sprint 2 Progress
- [ ] Story 2.1 - Project Setup (2 pts)
- [ ] Story 2.2 - Authentication (3 pts)
- [ ] Story 2.3 - Dashboard (3 pts)
- [ ] Story 2.4 - User Management (3 pts)
- [ ] Story 2.5 - Petugas Jaga (2 pts)
- [ ] Story 2.6 - Pos Jaga (2 pts)
- [ ] Story 2.7 - QR Codes (5 pts)
- [ ] Story 2.8 - Pengumuman (2 pts)
- [ ] Story 2.9 - Logs (4 pts)
- [ ] Story 2.10 - Audit Trail (2 pts)
- [ ] Story 2.11 - Responsive (2 pts)
- [ ] Story 2.12 - Cloudflare Pages (1 pts)

**Sprint 2 Status**: 🔄 Not Started
**Completed**: 0 / 36 pts (0%)

---

### Sprint 3 Progress
- [ ] Story 3.1 - Project Setup (3 pts)
- [ ] Story 3.2 - Database (3 pts)
- [ ] Story 3.3 - API Client (4 pts)
- [ ] Story 3.4 - Repository (3 pts)
- [ ] Story 3.5 - Home (3 pts)
- [ ] Story 3.6 - Scanner (5 pts)
- [ ] Story 3.7 - Result (2 pts)
- [ ] Story 3.8 - Logs (3 pts)
- [ ] Story 3.9 - Pengumuman (3 pts)
- [ ] Story 3.10 - Sync (3 pts)
- [ ] Story 3.11 - Offline (3 pts)
- [ ] Story 3.12 - Navigation (2 pts)
- [ ] Story 3.13 - Testing (3 pts)
- [ ] Story 3.14 - Release (2 pts)

**Sprint 3 Status**: 🔄 Not Started
**Completed**: 0 / 46 pts (0%)

---

## Backlog Items

### Post-MVP / Enhancement Stories

These items need to be implemented after the main sprint completion:

#### Story B.1: Mobile PIN Authentication
**Points**: 3
**Priority**: High
**Status**: ⬜ Backlog

**Tasks**:
- [ ] Create POST `/api/mobile/auth/pin` endpoint
- [ ] Validate PIN from mobile request
- [ ] Generate JWT token with 3-month expiry
- [ ] Store PIN in database (need to add pin field to petugas_jaga or create separate table)
- [ ] Return token response with expiresIn
- [ ] Document PIN authentication flow
- [ ] Add PIN validation schema with Zod

**Definition of Done**:
- PIN endpoint accepts valid PIN and returns JWT
- Invalid PIN returns proper error
- JWT token valid for 3 months
- Mobile can use token for Authorization header

---

#### Story B.2: Mobile Auth Middleware
**Points**: 2
**Priority**: High
**Status**: ⬜ Backlog

**Tasks**:
- [ ] Create mobile-specific auth middleware
- [ ] Apply JWT validation to mobile sync endpoints:
  - [ ] GET `/api/mobile/sync`
  - [ ] POST `/api/mobile/sync-logs`
  - [ ] POST `/api/mobile/read-announce`
  - [ ] GET `/api/mobile/pengumuman`
- [ ] Handle token expiry gracefully
- [ ] Return appropriate error codes
- [ ] Update API documentation

**Definition of Done**:
- All mobile endpoints require valid JWT
- Token expiry returns 401 with clear message
- API documentation updated

---

#### Story B.3: Hadirapp Signature on Web Admin
**Points**: 1
**Priority**: Medium
**Status**: ⬜ Backlog

**Tasks**:
- [ ] Add footer component to web admin layout
- [ ] Display "Supported by hadirapp.com"
- [ ] Add link to http://www.hadirapp.com
- [ ] Style signature to match app theme
- [ ] Ensure footer appears on all pages

**Definition of Done**:
- Signature visible on all web admin pages
- Link opens in new tab
- Styling matches app theme

---

#### Story B.4: Hadirapp Signature on Mobile
**Points**: 1
**Priority**: Medium
**Status**: ⬜ Backlog

**Tasks**:
- [ ] Add footer/signature component to mobile screens
- [ ] Display "Supported by hadirapp.com"
- [ ] Add link to http://www.haddirapp.com
- [ ] Ensure signature appears on bottom of all screens
- [ ] Handle link opening in browser

**Definition of Done**:
- Signature visible on all mobile screens
- Link opens in external browser
- Signature doesn't interfere with UI

---

#### Story B.5: Mobile First Launch Popup
**Points**: 2
**Priority**: Medium
**Status**: ⬜ Backlog

**Tasks**:
- [ ] Add popup.webp to mobile resources
- [ ] Create first launch detection logic
- [ ] Create popup dialog/screen component
- [ ] Display popup.webp image
- [ ] Add acknowledgment button
- [ ] Store first launch flag locally
- [ ] Only show popup on first app open

**Definition of Done**:
- Popup shows on first app launch
- Popup doesn't show on subsequent launches
- User must acknowledge to continue
- Image displays correctly

---

#### Story B.6: API Code Cleanup
**Points**: 2
**Priority**: Low
**Status**: ⬜ Backlog

**Tasks**:
- [ ] Review all API schemas for unused tables/fields
- [ ] Remove unused schema definitions
- [ ] Review all API routes
- [ ] Remove unused endpoints
- [ ] Remove unused middleware
- [ ] Update API documentation
- [ ] Test API after cleanup

**Definition of Done**:
- No unused code in API
- API tests still pass
- Documentation updated

---

#### Story B.7: Web Admin Code Cleanup
**Points**: 1
**Priority**: Low
**Status**: ⬜ Backlog

**Tasks**:
- [ ] Review all web pages
- [ ] Remove unused/placeholder pages
- [ ] Remove unused components
- [ ] Remove unused routes
- [ ] Clean up imports
- [ ] Test web app after cleanup

**Definition of Done**:
- No unused pages or components
- Web app works correctly
- Navigation only shows valid pages

---

### Backlog Summary

| Story | Points | Priority | Status |
|-------|--------|----------|--------|
| B.1 Mobile PIN Auth | 3 | High | ⬜ Backlog |
| B.2 Mobile Auth Middleware | 2 | High | ⬜ Backlog |
| B.3 Web Signature | 1 | Medium | ⬜ Backlog |
| B.4 Mobile Signature | 1 | Medium | ⬜ Backlog |
| B.5 First Launch Popup | 2 | Medium | ⬜ Backlog |
| B.6 API Cleanup | 2 | Low | ⬜ Backlog |
| B.7 Web Cleanup | 1 | Low | ⬜ Backlog |
| **Total** | **12** | | |

---

## Notes

### Definition of Done (General)
Untuk setiap story, item dianggap "Done" jika:
- [ ] Code completed and committed
- [ ] Code reviewed (if applicable)
- [ ] Tested manually
- [ ] No known bugs
- [ ] Documentation updated (if needed)

### Definition of Ready
Story masuk Sprint jika:
- [ ] Requirements clear
- [ ] Dependencies identified
- [ ] Acceptance criteria defined
- [ ] Story estimated

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API design changes | High | Medium | Keep API flexible, versioning |
| Mobile camera issues | High | Medium | Test on multiple devices early |
| Offline sync complexity | Medium | High | Simplify sync strategy, test thoroughly |
| Database performance | Medium | Low | Add indexes, optimize queries early |
| UI/UX rework | Low | Medium | Get design approval early |

---

**Last Updated**: 10 Maret 2026
