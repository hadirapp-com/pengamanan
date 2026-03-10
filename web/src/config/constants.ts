// ============================================================================
// PENGAMANAN LEBARAN 2026 - CONSTANTS
// ============================================================================

export const GENERAL_SUCCESS_TEXT = 'Sukses';
export const GENERAL_ERROR_TEXT = 'Terjadi kesalahan';

export const DATA_TABLE_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

export const TOKEN_EXPIRED = 'TOKEN_EXPIRED';

// ============================================================================
// COLOR PALETTE
// ============================================================================
export const COLORS = {
  primary: '#060273',      // Biru Tua
  secondary: '#5F5DA6',    // Biru Medium
  accent: '#040959',       // Biru Gelap
  background: '#F2F2F2',   // Putih Abu
  text: '#0D0D0D',         // Hitam
  success: '#22C55E',      // Green
  error: '#EF4444',        // Red
  warning: '#F59E0B',      // Yellow
} as const;

// ============================================================================
// USER ROLES
// ============================================================================
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
} as const;

export const USER_ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin: 'Admin',
} as const;

// ============================================================================
// PETUGAS & POS STATUS
// ============================================================================
export const ACTIVE_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

// ============================================================================
// PENGUMUMAN PRIORITY
// ============================================================================
export const PENGUMUMAN_PRIORITY = {
  NORMAL: 'normal',
  IMPORTANT: 'important',
  URGENT: 'urgent',
} as const;

export const PENGUMUMAN_PRIORITY_LABELS = {
  normal: 'Normal',
  important: 'Penting',
  urgent: 'Urgent',
} as const;

export const PENGUMUMAN_PRIORITY_COLORS = {
  normal: 'default',
  important: 'warning',
  urgent: 'error',
} as const;

// ============================================================================
// SCAN TYPE
// ============================================================================
export const SCAN_TYPE = {
  MASUK: 'masuk',
  KELUAR: 'keluar',
} as const;

export const SCAN_TYPE_LABELS = {
  masuk: 'Masuk',
  keluar: 'Keluar',
} as const;

export const SCAN_TYPE_COLORS = {
  masuk: 'success',
  keluar: 'error',
} as const;

// ============================================================================
// SIDEBAR MENUS
// ============================================================================
export const superadminMenus = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: 'LayoutDashboard',
    label: 'Dashboard',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Users',
    href: '/app/users',
    icon: 'Users',
    label: 'Users',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Petugas Jaga',
    href: '/app/petugas',
    icon: 'Shield',
    label: 'Petugas Jaga',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Pos Jaga',
    href: '/app/pos',
    icon: 'MapPin',
    label: 'Pos Jaga',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'QR Codes',
    href: '/app/qr',
    icon: 'QrCode',
    label: 'QR Codes',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Pengumuman',
    href: '/app/pengumuman',
    icon: 'Bell',
    label: 'Pengumuman',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Logs',
    href: '/app/logs',
    icon: 'ScrollText',
    label: 'Logs',
    disabled: false,
    hasChildren: false,
  },
] as const;

export const adminMenus = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: 'LayoutDashboard',
    label: 'Dashboard',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Petugas Jaga',
    href: '/app/petugas',
    icon: 'Shield',
    label: 'Petugas Jaga',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Pos Jaga',
    href: '/app/pos',
    icon: 'MapPin',
    label: 'Pos Jaga',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'QR Codes',
    href: '/app/qr',
    icon: 'QrCode',
    label: 'QR Codes',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Pengumuman',
    href: '/app/pengumuman',
    icon: 'Bell',
    label: 'Pengumuman',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Logs',
    href: '/app/logs',
    icon: 'ScrollText',
    label: 'Logs',
    disabled: false,
    hasChildren: false,
  },
] as const;

export type TNavItems = typeof superadminMenus;
