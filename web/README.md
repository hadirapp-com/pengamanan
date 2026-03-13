# Pengamanan Web

Admin dashboard untuk sistem pengamanan Lebaran Blok F RT 024. Dibangun dengan React, TypeScript, dan TailwindCSS.

## 🚀 Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Form Handling**: React Hook Form + Zod
- **Table**: TanStack Table
- **PDF Generation**: jsPDF
- **QR Code**: qrcode.react

## 📁 Struktur Project

```
web/
├── src/
│   ├── components/
│   │   └── ui/             # Reusable UI components
│   ├── config/
│   │   ├── constants.ts    # App constants
│   │   └── endpoints.ts    # API endpoints
│   ├── lib/
│   │   ├── react-query/    # Query client setup
│   │   └── utils.ts        # Utility functions
│   ├── pages/
│   │   ├── auth/           # Login page
│   │   ├── configs/        # Config management
│   │   ├── dashboard/      # Dashboard
│   │   ├── logs/           # Scan logs
│   │   ├── pengumuman/     # Announcements
│   │   ├── petugas/        # Security guards
│   │   ├── pos/            # Security posts
│   │   ├── qr/             # QR codes
│   │   └── users/          # User management
│   ├── store/
│   │   └── data-table.ts   # Global table state
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html
├── package.json
└── vite.config.ts
```

## 🔧 Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENVIRONMENT=development
```

### 3. Start Development Server

```bash
pnpm dev
```

Server will run on http://localhost:5173

## 🏗️ Build for Production

```bash
pnpm build
```

Output will be in `dist/` directory.

## 📱 Features

### Dashboard
- Real-time statistics
- Recent scan activities
- Quick access to all features

### User Management
- Create, update, delete users
- Role-based access (superadmin, admin)
- Secure password handling

### Petugas Jaga (Security Guards)
- Manage security personnel
- Add name, NIK, phone number

### Pos Jaga (Security Posts)
- Manage security posts
- Add name and location

### QR Codes
- Generate QR codes for each house/block
- Set validity period
- Assign responsible person (penanggung jawab)
- Export QR codes as image/PDF

### Pengumuman (Announcements)
- Create announcements
- Set priority (normal, important, urgent)
- Mark as read/unread

### Logs (Scan History)
- View all scan activities
- Filter by date range, pos, scan type
- Search functionality
- Sort by any column
- Export to CSV
- Real-time refresh (15 seconds)

### Config Management
- APP_TITLE: App title for mobile
- HOME_SCREEN_BANNER: Banner image URL
- mobile_pin: Global PIN for mobile authentication

## 🎨 UI Components

### Shadcn/UI Style
- Button
- Input
- Select
- Table
- Dialog
- AlertDialog
- Badge
- Card
- And more...

### Custom Components
- DataTable with pagination, sorting, filtering
- Form layouts with validation
- QR code generator
- PDF export
- Date range picker

## 🔐 Authentication

- JWT-based authentication
- Protected routes
- Auto token refresh
- Logout functionality

Default credentials:
- Username: `superadmin` / Password: `admin123`
- Username: `admin` / Password: `admin123`

## 📊 Data Table Features

- **Pagination**: 10, 25, 50, 100 items per page
- **Sorting**: Click column header to sort
- **Filtering**: Search and filter functionality
- **Global State**: Shared filter state across pages
- **Auto-refresh**: Real-time data updates

## 🎯 API Integration

All API calls use TanStack Query with:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

## 🌐 Deployment

### Cloudflare Pages

The web app is deployed on Cloudflare Pages with automatic CI/CD:

```bash
# Triggered on push to main branch
# .github/workflows/deploy-web.yml
```

### Manual Deployment

```bash
pnpm build
# Upload dist/ folder to your hosting
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `http://localhost:5000/api` |
| `VITE_APP_ENVIRONMENT` | App environment | `development` or `production` |

## 🐛 Troubleshooting

### Port Already in Use

```bash
lsof -ti:5173 | xargs kill -9
```

### API Connection Error

Check:
1. API server is running on port 5000
2. VITE_API_URL is correct in `.env`
3. CORS is configured in API

### Build Error

```bash
rm -rf node_modules dist
pnpm install
pnpm build
```

## 📝 Development Tips

### Add New Page

1. Create page in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item if needed

### Add New API Endpoint

1. Add endpoint in `src/config/endpoints.ts`
2. Create query/mutation hook in `src/lib/react-query/`
3. Use in your component

### Update UI Components

All UI components are in `src/components/ui/`. Modify as needed.

## 🧪 Testing

Run linter:
```bash
pnpm lint
```

Build test:
```bash
pnpm build
```

## 📄 License

Copyright © PT Hadir Bersama Teknolog
i
