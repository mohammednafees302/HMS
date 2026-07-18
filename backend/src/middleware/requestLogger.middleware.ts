// ============================================================
// src/middleware/requestLogger.middleware.ts
// Stamps each request with a unique ID and start time.
// Works alongside Morgan for access log lines.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Expose request ID in response header for tracing
  res.setHeader('X-Request-ID', req.requestId);

  // Log response details when finished
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime ?? Date.now());
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger[level](
      `${req.method} ${req.originalUrl} ${statusCode} — ${duration}ms`,
      {
        requestId: req.requestId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  });

  next();
};
