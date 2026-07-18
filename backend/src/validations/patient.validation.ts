import { z } from 'zod';
import { phoneSchema } from './common.validation';

export const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().or(z.string().transform(v => parseInt(v, 10))),
  gender: z.string().default('Male'),
  bloodType: z.string().optional(),
  phone: phoneSchema,
  department: z.string().optional(),
  doctor: z.string().optional(),
  diagnosis: z.string().optional(),
  roomNumber: z.string().optional(),
  status: z.enum(['ACTIVE', 'DISCHARGED', 'CRITICAL']).default('ACTIVE'),
  admittedAt: z.string().optional().transform(v => v ? new Date(v) : new Date()),
});
