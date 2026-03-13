# Pengamanan Mobile

Aplikasi Android untuk petugas jaga sistem pengamanan Lebaran Blok F RT 024. Dibangun dengan Kotlin dan Jetpack Compose.

## 🚀 Tech Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM + Clean Architecture
- **DI**: Hilt
- **Async**: Coroutines + Flow
- **Local Database**: SQLDelight
- **Networking**: Retrofit + OkHttp
- **QR Scanner**: ML Kit
- **Image Loading**: Coil
- **Navigation**: Compose Navigation

## 📁 Struktur Project

```
mobile/app/src/main/java/com/hadirapp/pengamanan/
├── data/
│   ├── local/
│   │   └── PreferencesStore.kt    # DataStore for preferences
│   ├── model/
│   │   ├── ErrorResponse.kt       # API error models
│   │   ├── LogModel.kt            # Scan log model
│   │   ├── QrCodeModel.kt         # QR code model
│   │   ├── ScanModel.kt           # Scan request/response
│   │   └── ...
│   ├── remote/
│   │   ├── api/
│   │   │   ├── AuthApi.kt         # Auth endpoints
│   │   │   ├── ConfigApi.kt       # Config endpoints
│   │   │   ├── LogApi.kt          # Log endpoints
│   │   │   ├── MobileAuthApi.kt   # Mobile PIN auth
│   │   │   ├── PengumumanApi.kt   # Announcement endpoints
│   │   │   ├── ScanApi.kt         # Scan endpoint
│   │   │   └── SyncApi.kt         # Sync endpoints
│   │   ├── NetworkModule.kt       # Retrofit setup
│   │   └── TokenProvider.kt       # JWT token management
│   └── repository/
│       ├── AuthRepository.kt      # Auth logic
│       ├── LogRepository.kt       # Scan + sync logic
│       └── SyncRepository.kt      # Master data sync
├── db/
│   └── PengamananDatabase.sq      # SQLDelight schema
├── di/
│   ├── AppModule.kt               # Hilt modules
│   └── WorkManagerModule.kt       # WorkManager setup
├── presentation/
│   ├── home/
│   │   ├── HomeScreen.kt          # Home/dashboard
│   │   └── HomeViewModel.kt
│   ├── logs/
│   │   ├── LogsScreen.kt          # Scan history
│   │   └── LogsViewModel.kt
│   ├── pengumuman/
│   │   ├── PengumumanScreen.kt    # Announcements list
│   │   └── PengumumanViewModel.kt
│   ├── qrscanner/
│   │   ├── CameraPreview.kt       # Camera + ML Kit
│   │   ├── QRScannerScreen.kt     # Scanner UI
│   │   └── QRScannerViewModel.kt
│   ├── settings/
│   │   ├── SettingsScreen.kt      # App settings
│   │   └── SettingsViewModel.kt
│   ├── splash/
│   │   └── SplashScreen.kt         # Splash screen
│   ├── theme/
│   │   ├── Color.kt               # App colors
│   │   └── Theme.kt               # App theme
│   └── MainActivity.kt            # Main activity
└── util/
    ├── SoundManager.kt            # Sound effects (beep)
    └── SyncManager.kt             # WorkManager sync
```

## 🔧 Setup

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 35
- Minimum SDK: 24 (Android 7.0)

### 1. Open Project

```bash
cd mobile
# Open in Android Studio
```

### 2. Sync Gradle

Android Studio will automatically sync Gradle. If not:
```bash
./gradlew sync
```

### 3. Configure API URL

Edit `NetworkModule.kt`:
```kotlin
@Provides
@BaseUrl
fun provideBaseUrl(): String = "http://your-ip:5000/api/"
```

For production, use:
```kotlin
fun provideBaseUrl(): String = "https://blokf.hadirapp.com/api/"
```

### 4. Build Debug APK

```bash
./gradlew assembleDebug
```

APK location: `app/build/outputs/apk/debug/app-debug.apk`

### 5. Build Release APK

```bash
./gradlew assembleRelease
```

APK location: `app/build/outputs/apk/release/app-release.apk`

## 📱 Features

### Authentication
- PIN-based login (6 digits)
- JWT token storage
- Auto token refresh
- Secure token management

### QR Scanner
- Real-time QR code scanning with ML Kit
- Camera preview with overlay
- Auto-focus and exposure
- Validation against local database
- Sound feedback (beep)
- Vibration feedback (error only)

### Home Screen
- Dynamic title from API config
- Show selected petugas and pos
- Pengumuman preview (latest 3)
- Quick access to settings
- Sync button

### Scan History (Logs)
- View all scan history
- Delete synced logs
- Filter by status
- Pull to refresh
- Auto-refresh (15 seconds)
- Indonesian date format

### Pengumuman (Announcements)
- List all announcements
- Priority badges (normal, important, urgent)
- Mark as read
- Auto-sync

### Settings
- Select Petugas Jaga
- Select Pos Jaga
- View app info
- Sync master data
- Logout

### Background Sync
- WorkManager for periodic sync
- Every 15 minutes when charging
- Auto-sync offline logs
- Sync master data

## 🎨 UI/UX

### Theme
- Primary color: `#050272` (dark blue)
- Material 3 design
- Light/Dark mode support
- Indonesian language
- Custom fonts

### Navigation
- Bottom navigation
- 4 tabs: Home, Scan, Riwayat, Pengumuman
- Settings in top bar

### Components
- Compose UI components
- Material 3 components
- Custom cards and dialogs
- Loading indicators
- Error handling with Indonesian messages

## 🔐 Security

- PIN hashed on server
- JWT tokens with expiration
- HTTPS for production
- Secure storage (DataStore)
- Certificate pinning (optional)

## 📡 API Integration

### Retrofit Setup
- Base URL: Configurable
- Converter: Kotlin serialization
- Call adapter: Response wrapper
- Interceptor: Auth token injection
- Timeout: 30 seconds

### Error Handling
- HTTP 400: Validation errors with details
- HTTP 401: Session expired
- HTTP 403: Forbidden
- HTTP 404: Not found
- HTTP 500: Server error with message
- Network error: Offline mode

### Offline Mode
- Save scan locally when offline
- Auto-sync when online
- WorkManager for background sync
- Conflict resolution

## 🗄️ Local Database

### SQLDelight
- `logs`: Scan history
- `petugas_jaga`: Security guards (synced)
- `pos_jaga`: Security posts (synced)
- `qr_codes`: QR codes (synced)
- `pengumuman`: Announcements (synced)

### DataStore
- JWT token
- Selected petugas ID
- Selected pos ID
- Petugas and pos names

## 🔔 Background Sync

### WorkManager
- Periodic sync: Every 15 minutes
- Constraints: Charging, Wi-Fi (optional)
- Sync offline logs
- Sync master data
- Notifications (optional)

## 🐛 Troubleshooting

### Build Errors

```bash
./gradlew clean
./gradlew build --stacktrace
```

### Camera Permission

1. Check `AndroidManifest.xml` for `CAMERA` permission
2. Runtime permission request in app
3. Handle permission denial

### API Connection

1. Check base URL in `NetworkModule.kt`
2. Test API endpoint with curl
3. Check network connectivity
4. Verify CORS on API

### Sync Issues

1. Check JWT token validity
2. Verify API server is running
3. Check WorkManager status
4. Force sync in settings

## 📊 Proguard

Release build uses ProGuard with R8 rules:
- Keep Retrofit models
- Keep Kotlin serialization
- Keep SQLDelight schemas
- Keep Hilt generated code

## 🧪 Testing

### Unit Tests

```bash
./gradlew test
```

### Instrumented Tests

```bash
./gradlew connectedAndroidTest
```

## 📦 Signing

### Debug
- Uses default debug keystore
- Password: `android`
- Key: `androiddebugkey`

### Release
Create `release.keystore` and configure in `app/build.gradle.kts`.

## 🚀 Deployment

### Google Play Store
1. Generate signed APK/AAB
2. Upload to Play Console
3. Fill store listing
4. Submit for review

### Direct Distribution
1. Build release APK
2. Distribute via website
3. Enable install from unknown sources

## 📝 Version

- Version: 1.0.0
- Version Code: 1
- Min SDK: 24
- Target SDK: 35

## 🔧 Dependencies

See `app/build.gradle.kts` for full list:
- Jetpack Compose BOM
- Hilt
- Retrofit
- SQLDelight
- ML Kit
- WorkManager
- And more...

## 📄 License

Copyright © 2026 Blok F RT 024
