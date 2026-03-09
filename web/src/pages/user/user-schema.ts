import { z } from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string(),
  nik: z.string().optional(),
  password: z.string(),
  fullName: z.string().min(3, "Nama siswa harus diisi, minimal 3 karakter"),
  role: z.string(),
  createdBy: z.string(),
  updatedBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const userFormSchema = userSchema.pick({
  id: true,
  username: true,
  password: true,
  nik: true,
  fullName: true,
  role: true,
});

export type UserForm = z.infer<typeof userFormSchema>;
export type User = z.infer<typeof userSchema>;
