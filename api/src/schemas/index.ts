import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  source: z.enum(["web", "mobile"], {
    message: "Source harus 'web' atau 'mobile'",
  }).default("web"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
});

// User Schemas
export const userSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  nik: z.string().optional(),
  role: z.enum(["admin", "supervisor", "sales", "preparation", "delivery", "production"]),
});

export const userUpdateSchema = z.object({
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .or(z.literal(""))
    .optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  nik: z.string().optional(),
  role: z.enum(["admin", "supervisor", "sales", "preparation", "delivery", "production"]).optional(),
});

// Customer Schemas
export const customerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan wajib diisi"),
  address: z.string().optional(),
  alias: z.string(),
});

export const scanDeliverySchema = z.object({
  scanLt1By: z.string().optional(),
  scanLt1ByName: z.string().optional(),
  scanLt2By: z.string().optional(),
  scanLt2ByName: z.string().optional(),
  customerId: z.string().min(1, "ID pelanggan wajib diisi"),
});

// Delivery Schemas
export const deliverySchema = z.object({
  customerId: z.string().min(1, "ID pelanggan wajib diisi"),
  orderNo: z.string().min(1, "Nomor order wajib diisi"),
  file: z.string().min(1, "File wajib diisi"),
  partNumberRaw: z.string().min(1, "Nomor part raw wajib diisi"),
  partNumber: z.string().min(1, "Nomor part wajib diisi"),
  partName: z.string().min(1, "Nama part wajib diisi"),
  colorCode: z.string().min(1, "Kode warna wajib diisi"),
  seqProd: z.string().min(1, "Sequence produksi wajib diisi"),
  kdLotNo: z.string().min(1, "Nomor KD lot wajib diisi"),
  qty: z.string().min(1, "Jumlah wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  time: z.string().min(1, "Waktu wajib diisi"),
  adjustDate: z.string().optional(),
  adjustTime: z.string().optional(),
  slipNumber: z.string().min(1, "Nomor slip wajib diisi"),
  remarksBawah: z.string().min(1, "Remarks bawah wajib diisi"),
  barcodeHpm: z.string().min(1, "Barcode HPM wajib diisi"),
  barcodeKasaiRaw: z.string().min(1, "Barcode Kasai raw wajib diisi"),
  barcodeKasai: z.string().min(1, "Barcode Kasai wajib diisi"),
  scanLt1By: z.string().optional(),
  scanLt1ByName: z.string().optional(),
  scanLt1At: z.string().datetime().optional(),
  scanLt2By: z.string().optional(),
  scanLt2ByName: z.string().optional(),
  scanLt2At: z.string().datetime().optional(),
});

// Menu Schemas
export const menuSchema = z.object({
  name: z.string().min(1, "Nama menu wajib diisi"),
  href: z.string().min(1, "Menu href wajib diisi"),
  icon: z.string().optional(),
  hasChildren: z.boolean().default(false),
  parentId: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  allowedRoles: z.string().default("admin,user"), // comma-separated roles
});

export const menuUpdateSchema = z.object({
  name: z.string().min(1, "Nama menu wajib diisi").optional(),
  href: z.string().min(1, "Menu href wajib diisi").optional(),
  icon: z.string().optional(),
  hasChildren: z.boolean().optional(),
  parentId: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  allowedRoles: z.string().optional(), // comma-separated roles
});

// Parts Schemas
export const partSchema = z.object({
  name: z.string().min(1, "Nama part wajib diisi"),
  no: z.string().min(1, "Nomor part wajib diisi"),
  colorCode: z.string().optional(),
  customerId: z.string().min(1, "ID pelanggan wajib diisi"),
  model: z.string().optional(),
  qtyPerPack: z.number().int().min(1, "Jumlah per pack wajib diisi"),
  labelSize: z.string().optional(),
  indication: z.string().optional(),
  leftHand: z.boolean().default(false),
  rightHand: z.boolean().default(false),
  lhRh: z.string().optional(),
  labelColor: z.string().optional(),
});

export const partUpdateSchema = z.object({
  name: z.string().min(1, "Nama part wajib diisi").optional(),
  no: z.string().min(1, "Nomor part wajib diisi").optional(),
  colorCode: z.string().optional(),
  customerId: z.string().min(1, "ID pelanggan wajib diisi").optional(),
  model: z.string().optional(),
  qtyPerPack: z
    .number()
    .int()
    .min(1, "Jumlah per pack wajib diisi")
    .optional(),
  labelSize: z.string().optional(),
  indication: z.string().optional(),
  leftHand: z.boolean().optional(),
  rightHand: z.boolean().optional(),
  lhRh: z.string().optional(),
  labelColor: z.string().optional(),
});

// Excel import schema for parts
export const partImportSchema = z.object({
  name: z.string().min(1, "Nama part wajib diisi"),
  no: z.string().min(1, "Nomor part wajib diisi"),
  colorCode: z.string().optional(),
  customerName: z.string().min(1, "Nama pelanggan wajib diisi"),
  model: z.string().optional(),
  qtyPerPack: z.number().int().min(1, "Jumlah per pack wajib diisi"),
  labelSize: z.string().optional(),
  indication: z.string().optional(),
  leftHand: z.boolean().default(false),
  rightHand: z.boolean().default(false),
  lhRh: z.string().optional(),
  labelColor: z.string().optional(),
});

// Print History Schemas
export const printHistorySchema = z.object({
  partId: z.string().min(1, "ID part wajib diisi"),
  qtyLabel: z.number().int().min(1, "Jumlah label wajib diisi"),
  qtyPart: z.number().int().min(1, "Jumlah part wajib diisi"),
  productionDate: z.string(),
  serialFrom: z.string().optional(),
  serialEnd: z.string().optional(),
  status: z.number().int().min(1).default(1), // Print status (1st print, 2nd print, etc.)
});

// Lot Scan Schemas
export const lotScanSchema = z.object({
  lot: z.string().min(1, "Nomor lot wajib diisi"),
  status: z.enum(["start", "completed"], {
    message: "Status harus 'start' atau 'completed'",
  }),
});

export const lotBypassSchema = z.object({
  lot: z.string().min(1, "Nomor lot wajib diisi"),
  bypassedReason: z.string().min(1, "Alasan bypass wajib diisi"),
});

// Scan Log Schemas
export const scanLogSchema = z.object({
  customerId: z.string().min(1, "ID pelanggan wajib diisi"),
  deliveryId: z.string().optional(),
  partNumber: z.string().min(1, "Nomor part wajib diisi"),
  partName: z.string().min(1, "Nama part wajib diisi"),
  colorCode: z.string().min(1, "Kode warna wajib diisi"),
  lot: z.string().min(1, "Lot wajib diisi"),
  deliveryYear: z.number().int().min(1, "Tahun pengiriman wajib diisi"),
  scanBy: z.string().min(1, "Dipindai oleh wajib diisi"),
  scanType: z.enum(["preparation", "delivery"], {
    message: "Tipe scan harus 'preparation' atau 'delivery'",
  }),
  kasaiBarcode: z.string().optional(),
  customerBarcode: z.string().optional(),
  firstScan: z.string().optional(),
  secondScan: z.string().optional(),
  scanStatus: z.enum(["match", "missmatch", "double scan","not found"], {
    message: "Status scan harus 'match', 'missmatch', atau 'double scan'",
  }),
});

// Local Scan Event Log Schemas
export const scanEventSchema = z.object({
  type: z.enum([
    "scan_start",
    "scan_1st",
    "scan_2nd",
    "scan_duplicate",
    "scan_blocked_processing",
    "scan_blocked_duplicate",
    "scan_blocked_completed",
    "validation_success",
    "validation_failed",
    "server_check_success",
    "server_check_failed",
    "alert_show",
    "scan_success",
    "scan_failed",
    "wrong_order",
    "barcode_not_found",
    "scan_duplicate_first",
    "data_not_found",
    "camera_scan_blocked",
    "recently_validated_failed",
  ]),
  data: z.record(z.string(), z.any()).optional(), // Flexible data field
  timestamp: z.string().datetime(),
});

export const localScanLogSchema = z.object({
  logId: z.string().uuid().optional(),
  customerId: z.string().min(1, "ID pelanggan wajib diisi"),
  userId: z.string().min(1, "ID user wajib diisi"),
  scanType: z.enum(["preparation", "delivery"], {
    message: "Tipe scan harus 'preparation' atau 'delivery'",
  }),
  deviceId: z.string().min(1, "Device ID wajib diisi"),
  lotNumber: z.string().min(1, "Nomor lot wajib diisi"),
  status: z.enum(["pending", "success", "failed"]).default("pending"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  events: z.array(scanEventSchema).min(1, "Minimal satu event wajib diisi"),
});

// Email Verification Schemas
export const sendVerificationEmailSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token verifikasi wajib diisi"),
});

// Password Reset Schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token reset wajib diisi"),
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
});

// Profile Email Schemas
export const profileEmailSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const profileEmailVerifySchema = z.object({
  email: z.string().email("Email tidak valid"),
  code: z.string().min(1, "Kode verifikasi wajib diisi"),
});

// Config Schemas
export const configSchema = z.object({
  key: z.string().min(1, "Key wajib diisi"),
  value: z.any(), // Accept any value (string, number, object, array, etc.)
  description: z.string().optional(),
});

export const configUpdateSchema = z.object({
  key: z.string().min(1, "Key wajib diisi").optional(),
  value: z.any().optional(), // Accept any value (string, number, object, array, etc.)
  description: z.string().optional(),
});

export type HonoContext = {
  userId: string;
};

