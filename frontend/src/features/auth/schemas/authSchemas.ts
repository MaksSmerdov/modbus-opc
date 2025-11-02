import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен для заполнения')
    .email('Неверный формат email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен для заполнения')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Имя обязательно для заполнения')
    .min(2, 'Имя должно содержать минимум 2 символа'),
  email: z
    .string()
    .min(1, 'Email обязателен для заполнения')
    .email('Неверный формат email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен для заполнения')
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;