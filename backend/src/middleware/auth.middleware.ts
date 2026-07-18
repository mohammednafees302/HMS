// ============================================================
// src/middleware/auth.middleware.ts
// JWT authentication guard.
// Attaches decoded payload to req.user when token is valid.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { UserRole } from '../types';

/**
 * Require a valid Bearer token.
 * Sets req.user on success, returns 401 otherwise.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendUnauthorized(res, 'Authorization header missing or malformed.');
    return;
  }

  const token = authHeader.slice(7); // remove "Bearer "

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    sendUnauthorized(res, 'Invalid or expired access token.');
  }
};

/**
 * Require the authenticated user to have one of the given roles.
 * Must be used AFTER authenticate middleware.
 */
export const authorize = (...roles: (UserRole | UserRole[])[]) => {
  const allowedRoles = roles.flat();
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Not authenticated.');
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      sendForbidden(
        res,
        `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      );
      return;
    }

    next();
  };
};
