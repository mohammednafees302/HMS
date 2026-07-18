import { z } from 'zod';
import { paginationSchema } from './common.validation';

// ------------------------------------------------
// Department
// ------------------------------------------------
export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional().nullable(),
    headId: z.string().uuid().optional().nullable(),
    totalBeds: z.number().int().min(0).optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    headId: z.string().uuid().optional().nullable(),
    totalBeds: z.number().int().min(0).optional(),
  }),
});

// ------------------------------------------------
// Doctor
// ------------------------------------------------
export const createDoctorSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    departmentId: z.string().uuid(),
    specialization: z.string().min(2),
    qualification: z.string().min(2),
    experience: z.number().int().min(0).optional(),
    availability: z.string().optional().nullable(),
  }),
});

export const updateDoctorSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid().optional(),
    specialization: z.string().min(2).optional(),
    qualification: z.string().min(2).optional(),
    experience: z.number().int().min(0).optional(),
    availability: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const getDoctorsSchema = z.object({
  query: paginationSchema.extend({
    departmentId: z.string().uuid().optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

// ------------------------------------------------
// Appointment
// ------------------------------------------------
export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    departmentId: z.string().uuid().optional().nullable(),
    scheduledAt: z.string().datetime(),
    type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'CHECKUP', 'EMERGENCY', 'NEW_PATIENT']),
    reason: z.string().max(500).optional().nullable(),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional().nullable(),
    scheduledAt: z.string().datetime().optional(),
    type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'CHECKUP', 'EMERGENCY', 'NEW_PATIENT']).optional(),
    reason: z.string().max(500).optional().nullable(),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  }),
});

export const getAppointmentsSchema = z.object({
  query: paginationSchema.extend({
    patientId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  }),
});

// ------------------------------------------------
// Invoice (Billing)
// ------------------------------------------------
export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    items: z.array(invoiceItemSchema).min(1),
    notes: z.string().optional().nullable(),
    dueAt: z.string().datetime(),
    status: z.enum(['PAID', 'PENDING', 'OVERDUE', 'CANCELLED']).optional(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    status: z.enum(['PAID', 'PENDING', 'OVERDUE', 'CANCELLED']).optional(),
    paidAmount: z.number().min(0).optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const getInvoicesSchema = z.object({
  query: paginationSchema.extend({
    patientId: z.string().uuid().optional(),
    status: z.enum(['PAID', 'PENDING', 'OVERDUE', 'CANCELLED']).optional(),
  }),
});
