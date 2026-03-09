import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(3, 'Password harus diisi'),
  source: z.enum(['web', 'mobile'], {
    message: 'Source must be either web or mobile',
  }),
});

export const loginFormSchema = loginSchema.pick({
  username: true,
  password: true,
});

export type UserLoginForm = z.infer<typeof loginFormSchema>;
export type UserLogin = z.infer<typeof loginSchema>;
