// ============================================================
// src/validations/auth.validation.ts
// Zod schemas for Authentication endpoints.
// ============================================================

import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema, userRoleSchema } from './common.validation';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional(),
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});
