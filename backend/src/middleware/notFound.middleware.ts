// ============================================================
// src/middleware/notFound.middleware.ts
// 404 handler — catches any route that didn't match.
// ============================================================

import { Request, Response } from 'express';
import { sendNotFound } from '../utils/response';

export const notFoundMiddleware = (req: Request, res: Response): void => {
  sendNotFound(res, `Route not found: ${req.method} ${req.originalUrl}`);
};
