# Android Mobile App - Build & Release Guide

## Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK API 34
- Gradle 8.7

## Setup

1. **Install Dependencies**
   ```bash
   cd mobile
   ```

2. **Configure local.properties**
   ```bash
   cp local.properties.example local.properties
   # Edit local.properties and set:
   # - sdk.dir=/path/to/your/android/sdk
   # - api.base.url=http://your-api-url:3000
   ```

3. **Configure google-services.json** (Optional - for Firebase/ML Kit)
   ```bash
   cp app/google-services.json.example app/google-services.json
   # Edit with your Firebase configuration
   ```

## Building

### Debug Build
```bash
./gradlew assembleDebug
```

### Release Build
```bash
./gradlew assembleRelease
```

## Running on Device/Emulator

### Via Android Studio
1. Open project in Android Studio
2. Select device/emulator
3. Click Run button

### Via Command Line
```bash
# Install debug build
./gradlew installDebug

# Install release build
./gradlew installRelease
```

## Testing

### Unit Tests
```bash
./gradlew test
```

### Instrumentation Tests
```bash
./gradlew connectedAndroidTest
```

## Architecture

### Clean Architecture
- **presentation**: UI layer with Compose screens and ViewModels
- **data**: Data layer with repositories, API clients, and local database
- **domain**: Business logic (minimal in this project)

### Key Technologies
- **Jetpack Compose**: Modern UI toolkit
- **Hilt**: Dependency injection
- **CameraX**: Camera access
- **ML Kit**: QR code scanning
- **SQLDelight**: Local database
- **Retrofit**: API client
- **Kotlin Coroutines & Flow**: Async operations

### Offline Support
- All scans are saved to local database
- Sync happens when network is available
- Offline scans are marked with cloud icon

## Troubleshooting

### Build Errors
- **"sdk.dir not set"**: Configure local.properties
- **"Could not resolve dependencies"**: Run `./gradlew build --refresh-dependencies`
- **"Failed to install ML Kit"**: Add google-services.json or disable ML Kit

### Runtime Errors
- **"Camera permission denied"**: Grant camera permission in app settings
- **"Network error"**: Check API_BASE_URL in local.properties
- **"QR scan not working"**: Ensure adequate lighting and QR code focus

## Signing Release APK

1. **Generate keystore**
   ```bash
   keytool -genkey -v -keystore pengamanan-release.keystore -alias pengamanan -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in app/build.gradle.kts**
   ```kotlin
   signingConfigs {
       create("release") {
           storeFile = file("path/to/pengamanan-release.keystore")
           storePassword = "your-store-password"
           keyAlias = "pengamanan"
           keyPassword = "your-key-password"
       }
   }
   ```

3. **Build signed APK**
   ```bash
   ./gradlew assembleRelease
   ```

## Release Checklist

- [ ] Update versionCode and versionName in app/build.gradle.kts
- [ ] Update API_BASE_URL for production
- [ ] Test all features on physical device
- [ ] Test offline functionality
- [ ] Test camera permissions
- [ ] Generate signed APK/AAB
- [ ] Upload to Play Console (for production)
