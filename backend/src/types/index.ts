// ============================================================
// src/types/index.ts
// Shared types used across the entire backend.
// ============================================================

// ---- HTTP Response Envelope ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: ValidationError[];
  timestamp: string;
  requestId?: string;
}

// ---- Pagination ----
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ---- Validation Errors ----
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ---- User Roles ----
export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'STAFF';

// ---- Patient Status ----
export type PatientStatus = 'ACTIVE' | 'DISCHARGED' | 'CRITICAL' | 'DECEASED';

// ---- Appointment Status ----
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// ---- Appointment Type ----
export type AppointmentType = 'CONSULTATION' | 'FOLLOW_UP' | 'CHECKUP' | 'EMERGENCY' | 'NEW_PATIENT';

// ---- Invoice Status ----
export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';

// ---- Gender ----
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// ---- Blood Type ----
export type BloodType = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';

// ---- Service health ----
export interface ServiceHealth {
  status: 'ok' | 'degraded' | 'down';
  latency?: number;
  message?: string;
}

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
  services: {
    database: ServiceHealth;
    memory: ServiceHealth;
  };
}
