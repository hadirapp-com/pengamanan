# pokayoke-web

Web admin application for Pokayoke Quality Control system.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Git Hooks

This project uses a pre-commit hook to ensure the build passes before committing.

### Initial Setup

After cloning the repository, run the setup script to install git hooks:

```bash
./scripts/setup-hooks.sh
```

### What it does

- **pre-commit**: Runs `npm run build` before each commit
  - If build fails, commit is rejected
  - Helps catch TypeScript/build errors early

### Manually reinstall hooks

If you need to reinstall hooks:

```bash
./scripts/setup-hooks.sh
```

## Tech Stack
## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **State Management**:
  - Zustand for global state
  - TanStack Query (React Query) for server state
- **Form Management**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Date Handling**: date-fns, dayjs
- **Barcode/QR**: jsbarcode, qrcode, react-qr-code

## Project Structure

```
src/
├── assets/              # Static assets (images, fonts)
├── components/          # Reusable UI components
│   ├── barcode/        # Barcode-related components
│   ├── file-upload/    # File upload components
│   ├── print/          # Printing components
│   └── ui/             # Base UI components (buttons, inputs, etc.)
├── config/             # Configuration files
│   └── api.ts          # API configuration
├── lib/                # Utility functions
│   ├── axios.ts        # Axios instance configuration
│   ├── react-query.ts  # React Query setup
│   └── utils.ts        # General utilities
├── pages/              # Page components
│   ├── auth/           # Authentication pages (login)
│   ├── deliveries/     # Delivery management pages
│   ├── parts/          # Parts management pages
│   ├── users/          # User management pages
│   ├── customers/      # Customer management pages
│   ├── menus/          # Menu management pages
│   └── scan-logs/      # Scan logs pages
├── store/              # Zustand stores
│   └── use-store.ts    # Global state management
├── types/              # TypeScript type definitions
├── App.tsx             # Root app component
├── router.tsx          # Route definitions
├── index.css           # Global styles
└── main.tsx            # Application entry point
```

## Key Features

### Authentication
- Login page with JWT token management
- Role-based access control (admin, user, supervisor, sales)
- Auto-logout on token expiration

### Deliveries Management
- List deliveries with pagination and filtering
- Import deliveries from CSV, TXT, or Excel files (admin, sales)
- Update delivery information (admin, sales)
- Scan delivery barcodes (location 1 & 2)
- View delivery details and history
- Export delivery data

### Parts Management
- List parts with search and filtering
- Create, edit, delete parts (admin)
- Import parts from Excel files (admin)
- Print labels for parts
- View print history

### Users Management (Admin)
- Create, edit, delete users
- Assign roles (admin, user, supervisor, sales)
- View user list with pagination

### Customers Management (Admin)
- Create, edit, delete customers
- Manage customer information
- Associate parts and deliveries with customers

### Scan Logs
- View scan logs with filtering by date, customer, lot
- Track preparation and delivery scans
- Monitor scan status (match/mismatch)

### Menu Management (Admin)
- Configure sidebar menu structure
- Set allowed roles per menu
- Manage menu hierarchy

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

## State Management

### Zustand Store
```typescript
import { useStore } from './store/use-store';

// Access global state
const { user, token, setAuth } = useStore();
```

### React Query
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['deliveries'],
  queryFn: () => api.get('/deliveries'),
});

// Mutate data
const mutation = useMutation({
  mutationFn: (data) => api.post('/deliveries', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
  },
});
```

## API Integration

The application uses a configured Axios instance for API calls:

```typescript
import api from '@/lib/axios';

// GET request
const response = await api.get('/deliveries');

// POST request
const response = await api.post('/deliveries/import', formData);

// PUT request
const response = await api.put(`/deliveries/${id}`, data);
```

## File Upload

For importing files (CSV, Excel, TXT):

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('customerId', customerId);
formData.append('deliveryYear', '2026');

await api.post('/deliveries/import', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

## Barcode & QR Code

### Generate Barcode
```typescript
import { Barcode } from '@/components/barcode';

<Barcode value="123456" format="CODE128" />
```

### Generate QR Code
```typescript
import { QRCode } from '@/components/barcode';

<QRCode value="https://example.com" size={200} />
```

## Printing

```typescript
import { handlePrint } from '@/components/print';

// Print component content
<ReactToPrint
  trigger={() => <button>Print</button>}
  content={() => componentRef}
/>
```

## Styling

### Using Tailwind CSS
```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded">Action</button>
</div>
```

### Using UI Components
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';

<Button variant="default">Click me</Button>
<Input placeholder="Enter text..." />
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  {/* Dialog content */}
</Dialog>
```

## Routing

Protected routes are defined in `src/router.tsx`:

```tsx
<Route path="/" element={<ProtectedRoute />}>
  <Route path="deliveries" element={<DeliveriesPage />} />
  <Route path="parts" element={<PartsPage />} />
  {/* Other routes */}
</Route>
```

## Error Handling

The app uses Sonner for toast notifications:

```typescript
import { toast } from 'sonner';

// Success toast
toast.success('Data saved successfully');

// Error toast
toast.error('Something went wrong');

// Promise toast
toast.promise(mutation.mutateAsync(data), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
});
```

## Development Guidelines

### Component Structure
```tsx
// 1. Imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Types (if needed)
interface Props {
  id: string;
}

// 3. Component
export function ComponentName({ id }: Props) {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Queries/Mutations
  const { data } = useQuery({
    queryKey: ['key', id],
    queryFn: () => fetchData(id),
  });

  // 6. Event handlers
  const handleClick = () => {
    // handle event
  };

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### File Naming
- Components: PascalCase (e.g., `DeliveryList.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useDeliveries.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase (e.g., `Delivery.ts`)

### Best Practices
- Use React Query for all server state
- Implement optimistic updates where appropriate
- Handle loading and error states
- Use TypeScript for type safety
- Follow existing component patterns
- Write clean, self-documenting code

## Common Issues & Solutions

### CORS errors
- Check `VITE_API_URL` in `.env`
- Ensure API CORS is configured correctly

### Build errors
- Clear node_modules: `rm -rf node_modules && bun install`
- Clear Vite cache: `rm -rf .vite && bun run dev`

### Hot module replacement not working
- Restart dev server
- Check Vite version compatibility

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

---

Last updated: 2026-01-25
