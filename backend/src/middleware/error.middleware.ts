// ============================================================
// src/middleware/error.middleware.ts
// Global error handler — must be the LAST middleware in app.ts.
// Converts thrown errors into consistent ApiResponse shape.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { isDev } from '../config/env';
import { ValidationError } from '../types';

// ---- Typed App Error ----
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Minimal Prisma error shape we need
interface PrismaError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}

// ---- Global Error Handler ----
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Always log the error
  logger.error(`[${req.requestId}] ${err.name}: ${err.message}`, {
    stack: isDev ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  // ---- Zod Validation Error ----
  if (err instanceof ZodError) {
    const validationErrors: ValidationError[] = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    sendError(res, 'Validation failed', 422, validationErrors);
    return;
  }

  // ---- JWT Errors ----
  if (err instanceof TokenExpiredError) {
    sendError(res, 'Token has expired. Please log in again.', 401);
    return;
  }

  if (err instanceof JsonWebTokenError) {
    sendError(res, 'Invalid token. Please log in again.', 401);
    return;
  }

  // ---- Prisma Known Errors (duck-typed) ----
  const prismaErr = err as PrismaError;
  if (prismaErr.code?.startsWith('P')) {
    switch (prismaErr.code) {
      case 'P2002': {
        const fields = (prismaErr.meta?.['target'] as string[])?.join(', ') ?? 'field';
        sendError(res, `A record with this ${fields} already exists.`, 409);
        return;
      }
      case 'P2025':
        sendError(res, 'Record not found.', 404);
        return;
      case 'P2003':
        sendError(res, 'Foreign key constraint failed.', 400);
        return;
      default:
        sendError(res, 'Database error occurred.', 500);
        return;
    }
  }

  // ---- Multer Errors ----
  if (err.name === 'MulterError') {
    const multerErr = err as Error & { code?: string };
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File size exceeds the allowed limit.', 400);
      return;
    }
    sendError(res, `File upload error: ${err.message}`, 400);
    return;
  }

  // ---- Operational App Errors ----
  if (err instanceof AppError && err.isOperational) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // ---- Unknown / Programming Errors ----
  const message = isDev ? err.message : 'An unexpected error occurred. Please try again.';
  sendError(res, message, 500);
};
