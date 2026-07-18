// ============================================================
// src/config/env.ts
// Validates and exports all environment variables at startup.
// The app will crash fast if any required variable is missing.
// ============================================================

import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  API_PREFIX: z.string().default('/api'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // bcrypt
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // Uploads
  UPLOAD_DIR: z.string().default('src/uploads'),
  MAX_FILE_SIZE_MB: z.string().default('10').transform(Number),
  ALLOWED_MIME_TYPES: z
    .string()
    .default('image/jpeg,image/png,image/webp,application/pdf'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // Logging
  LOG_LEVEL: z.string().default('debug'),
  LOG_FORMAT: z.string().default('dev'),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _parsed.data;

// Derived helpers
export const isDev  = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

export const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
export const allowedMimeTypes = env.ALLOWED_MIME_TYPES.split(',').map((m) => m.trim());
export const maxFileSizeBytes = env.MAX_FILE_SIZE_MB * 1024 * 1024;
