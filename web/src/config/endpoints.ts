// ============================================================================
// PENGAMANAN LEBARAN 2026 - API ENDPOINTS
// ============================================================================

export const authEndpoint = {
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
};

export const usersEndpoint = {
  root: "/api/users",
  detail: "/api/users/:id",
  resetPassword: "/api/users/:id/reset-password",
};

export const petugasEndpoint = {
  root: "/api/petugas",
  detail: "/api/petugas/:id",
};

export const posEndpoint = {
  root: "/api/pos",
  detail: "/api/pos/:id",
};

export const qrEndpoint = {
  root: "/api/qr",
  detail: "/api/qr/:id",
  generate: "/api/qr/generate",
  image: "/api/qr/:id/image",
  pdf: "/api/qr/pdf",
  bulkUpload: "/api/qr/bulk-upload",
};

export const pengumumanEndpoint = {
  root: "/api/pengumuman",
  detail: "/api/pengumuman/:id",
};

export const logsEndpoint = {
  root: "/api/logs",
  stats: "/api/logs/stats",
  export: "/api/logs/export",
};

export const mobileEndpoint = {
  sync: "/api/mobile/sync",
  syncLogs: "/api/mobile/sync-logs",
  readAnnounce: "/api/mobile/read-announce",
  pengumuman: "/api/mobile/pengumuman",
  authPin: "/api/mobile/auth/pin",
};
