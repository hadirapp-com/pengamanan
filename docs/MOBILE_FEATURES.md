# Android Mobile App - Feature Documentation

## Features

### 1. Home Screen (Dashboard)
- **Welcome Card**: Shows app name and welcome message
- **Quick Actions**: Fast access to QR Scanner and Logs
- **Pengumuman Preview**: Shows latest 3 announcements
- **Priority Badges**: Color-coded by urgency (NORMAL/PENTING/URGENT)

### 2. QR Scanner (Story 3.6 - 5 points)
- **Camera Integration**: Uses CameraX for camera access
- **ML Kit**: Google ML Kit for QR code detection
- **Auto-Scan**: Automatically detects and scans QR codes
- **Visual Guide**: Overlay showing scan area
- **Processing Indicator**: Shows while processing scan
- **Offline Support**: Saves scans locally when offline

### 3. Scan Result Screen
- **Success Card**: Large success indicator with scan type (MASUK/KELUAR)
- **Guest Details**: Shows guest name, type, and QR code
- **Petugas Info**: Shows security guard who performed scan
- **Location**: Shows pos where scan occurred
- **Timestamp**: Exact scan time
- **Sync Status**: Shows if scan was synced to server

### 4. Logs Screen (History)
- **List View**: All scans in chronological order
- **Filter by Pos**: View scans by specific pos
- **Color-Coded**: Green for MASUK, Red for KELUAR
- **Offline Indicator**: Cloud icon for unsynced scans
- **Pull to Refresh**: Reload logs from server
- **Detail Cards**: Complete scan information

### 5. Pengumuman Screen
- **Full List**: All announcements
- **Priority Sorting**: Urgent shown first
- **Priority Badges**: Color-coded badges
- **Creator Info**: Shows who created announcement
- **Timestamp**: When announcement was created
- **Auto-Refresh**: Fetches latest on open

## Offline Support

### Local Storage (SQLDelight)
- **Logs Table**: All scan records
- **Pengumuman Table**: Cached announcements
- **UserPrefs Table**: Tokens and user info

### Sync Logic
1. **Scan QR**:
   - Online: Save to server immediately
   - Offline: Save locally with `synced = 0`

2. **Sync Process**:
   - Auto-sync on app start
   - Manual sync via refresh button
   - Background sync when network available

### Offline Indicators
- **Cloud Off Icon**: Shows unsynced scans
- **Error Handling**: Graceful degradation
- **Retry Logic**: Automatic retry on failure

## Navigation

### Navigation Graph
```
Home (Starting Screen)
├── QR Scanner
│   └── Scan Result
│       └── Logs (Optional)
├── Logs
└── Pengumuman
```

### Screen Transitions
- **Forward**: Navigate with parameters
- **Back**: Pop back stack
- **Deep Links**: Support for scan result navigation

## Data Flow

### Authentication
1. **Login**: Get JWT tokens from server
2. **Storage**: Save tokens to local preferences
3. **Usage**: Include tokens in API requests
4. **Refresh**: Auto-refresh expired tokens

### Scanning Flow
1. **Open Camera**: Start CameraX preview
2. **Detect QR**: ML Kit analyzes frames
3. **Process Scan**: Call API or save locally
4. **Show Result**: Display scan result screen
5. **Update Logs**: Add to local database

### Data Sync Flow
1. **App Start**: Load from local database
2. **API Call**: Fetch latest from server
3. **Merge Data**: Update local database
4. **UI Update**: Compose recomposes with new data
5. **Offline Queue**: Process pending uploads

## UI Design

### Material 3 Design
- **Dynamic Color**: Follows Material 3 guidelines
- **Primary Color**: PengamananBlue (#2563EB)
- **Success Color**: MasukGreen (#10B981)
- **Error Color**: KeluarRed (#EF4444)
- **Dark Mode**: Full dark theme support

### Components
- **Cards**: All content in cards
- **Icons**: Material Symbols
- **Badges**: Priority and status indicators
- **Progress**: Loading spinners and skeletons
- **Snackbars**: Error and success messages

## Permissions

### Required Permissions
- **CAMERA**: For QR code scanning
  - Rationale: Required to scan guest QR codes
  - Handling: Graceful fallback if denied

### Optional Permissions
- **INTERNET**: For API calls
- **ACCESS_NETWORK_STATE**: For offline detection

## Security

### Data Protection
- **HTTPS**: All API calls use HTTPS
- **Token Storage**: Encrypted local storage
- **Input Validation**: All inputs validated
- **SQL Injection**: Protected by SQLDelight

### Best Practices
- **No Hardcoded Secrets**: Use BuildConfig
- **Certificate Pinning**: Optional for production
- **ProGuard**: Code obfuscation in release
- **Root Detection**: Optional enhancement

## Performance

### Optimization
- **Lazy Loading**: Logs loaded incrementally
- **Image Caching**: QR codes cached locally
- **Database Indexing**: Fast lookups
- **Coroutine Dispatchers**: Proper thread usage

### Memory Management
- **Image Release**: Camera frames released promptly
- **Lifecycle Aware**: Stop camera when inactive
- **Flow Collection**: Proper collection lifecycle

## Accessibility

### Features
- **Screen Reader**: Content descriptions for all icons
- **Font Scaling**: Supports system font size
- **High Contrast**: Material 3 contrast ratios
- **Touch Targets**: Minimum 48dp touch targets
