// ============================================================================
// PENGAMANAN LEBARAN 2026 - VALIDATION SCHEMAS
// ============================================================================

import { z } from "zod";

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userFormSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().max(255).optional(),
  role: z.enum(["superadmin", "admin"], {
    message: "Role harus dipilih",
  }),
  fullName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().regex(/^62\d{8,12}$/, "Nomor HP harus diawali dengan 62 dan memiliki 10-14 digit").optional().or(z.literal("")),
}).refine((data) => {
  // Password is required for create, optional for update (empty string means no change)
  return typeof data.password === 'undefined' || data.password === '' || data.password.length >= 6;
}, {
  message: "Password minimal 6 karakter",
  path: ["password"],
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password harus diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// PETUGAS JAGA SCHEMAS
// ============================================================================

export const petugasFormSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  nik: z.string().length(16, "NIK harus 16 digit"),
  noHp: z.string().regex(/^62\d{8,12}$/, "Nomor HP harus diawali dengan 62 dan memiliki 10-14 digit"),
  isActive: z.boolean().default(true),
});

export type PetugasFormValues = z.infer<typeof petugasFormSchema>;

// ============================================================================
// POS JAGA SCHEMAS
// ============================================================================

export const posFormSchema = z.object({
  nama: z.string().min(1, "Nama pos harus diisi"),
  lokasi: z.string().min(1, "Lokasi harus diisi"),
  isActive: z.boolean().default(true),
});

export type PosFormValues = z.infer<typeof posFormSchema>;

// ============================================================================
// QR CODE SCHEMAS
// ============================================================================

export const qrFormSchema = z.object({
  nama: z.string().min(1, "Nama (block/rumah) harus diisi"),
  penanggungJawab: z.string().min(1, "Penanggung jawab harus diisi"),
  urutan: z.number().int().positive().optional(),
  validFrom: z.string().min(1, "Tanggal mulai berlaku harus diisi"),
  validUntil: z.string().min(1, "Tanggal selesai berlaku harus diisi"),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    const start = new Date(data.validFrom);
    const end = new Date(data.validUntil);
    return start < end;
  },
  {
    message: "Tanggal selesai harus lebih besar dari tanggal mulai",
    path: ["validUntil"],
  }
);

export type QrFormValues = z.infer<typeof qrFormSchema>;

// ============================================================================
// PENGUMUMAN SCHEMAS
// ============================================================================

export const pengumumanSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  content: z.string().min(1, "Isi pengumuman harus diisi"),
  priority: z.enum(["normal", "important", "urgent"], {
    message: "Prioritas harus dipilih",
  }),
  isActive: z.boolean().default(true),
});

export type PengumumanFormValues = z.infer<typeof pengumumanSchema>;

// ============================================================================
// CONFIG SCHEMAS
// ============================================================================

export const configFormSchema = z.object({
  key: z.string().min(1, "Key harus diisi")
    .max(100, "Key maksimal 100 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Key hanya boleh mengandung huruf, angka, dan underscore"),
  value: z.string().min(1, "Value harus diisi"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;

// ============================================================================
// LOGS FILTER SCHEMAS
// ============================================================================

export const logsFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  posId: z.string().optional(),
  petugasId: z.string().optional(),
  tipeScan: z.enum(["masuk", "keluar"]).optional(),
});

export type LogsFilterValues = z.infer<typeof logsFilterSchema>;
