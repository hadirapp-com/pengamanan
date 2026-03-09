import { z } from "zod";

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(5, "Nama customer harus diisi, minimal 5 karakter"),
  alias: z.string().min(3, "Alias harus diisi, minimal 3 karakter"),
  address: z.string(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export const customerFormSchema = customerSchema.pick({
  id: true,
  name: true,
  alias: true,
  address: true,
});

export type CustomerForm = z.infer<typeof customerFormSchema>;
export type Customer = z.infer<typeof customerSchema>;
