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
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role: z.enum(["superadmin", "admin"], {
    message: "Role harus dipilih",
  }),
  fullName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
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
  nik: z.string().min(1, "NIK harus diisi"),
  noHp: z.string().min(1, "Nomor HP harus diisi"),
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
  validityStart: z.string().min(1, "Tanggal mulai berlaku harus diisi"),
  validityEnd: z.string().min(1, "Tanggal selesai berlaku harus diisi"),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    const start = new Date(data.validityStart);
    const end = new Date(data.validityEnd);
    return start < end;
  },
  {
    message: "Tanggal selesai harus lebih besar dari tanggal mulai",
    path: ["validityEnd"],
  }
);

export type QrFormValues = z.infer<typeof qrFormSchema>;

// ============================================================================
// PENGUMUMAN SCHEMAS
// ============================================================================

export const pengumumanSchema = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  isi: z.string().min(1, "Isi pengumuman harus diisi"),
  priority: z.enum(["normal", "important", "urgent"], {
    message: "Prioritas harus dipilih",
  }),
  isActive: z.boolean().default(true),
});

export type PengumumanFormValues = z.infer<typeof pengumumanSchema>;

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
