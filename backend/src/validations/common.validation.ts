// ============================================================
// src/validations/common.validation.ts
// Shared Zod schemas reused across multiple modules.
// ============================================================

import { z } from 'zod';

// ---- Pagination Query ----
export const paginationSchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  sortBy:    z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search:    z.string().trim().optional(),
});

// ---- UUID param ----
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

// ---- Date range query ----
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate:   z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'startDate must be before or equal to endDate' },
);

// ---- Phone Number ----
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number format');

// ---- Email ----
export const emailSchema = z.string().trim().email('Invalid email address').toLowerCase();

// ---- Password (strong) ----
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ---- Blood Type ----
export const bloodTypeSchema = z.enum(
  ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'] as const,
);

// ---- Gender ----
export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER'] as const);

// ---- User Role ----
export const userRoleSchema = z.enum(
  ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] as const,
);

// ---- Status enums ----
export const patientStatusSchema     = z.enum(['ACTIVE', 'DISCHARGED', 'CRITICAL', 'DECEASED'] as const);
export const appointmentStatusSchema = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const);
export const invoiceStatusSchema     = z.enum(['PAID', 'PENDING', 'OVERDUE', 'CANCELLED'] as const);

// ---- Inferred types ----
export type PaginationInput = z.infer<typeof paginationSchema>;
export type UuidParam       = z.infer<typeof uuidParamSchema>;
export type DateRangeInput  = z.infer<typeof dateRangeSchema>;
