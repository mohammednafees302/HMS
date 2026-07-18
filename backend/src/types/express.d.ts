// ============================================================
// src/types/express.d.ts
// Augments the Express Request type with custom properties
// added by our middleware (auth user, requestId, etc.)
// ============================================================

import { JwtAccessPayload } from '../config/jwt';

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user payload (set by auth middleware) */
      user?: JwtAccessPayload;

      /** Unique request ID (set by requestLogger middleware) */
      requestId?: string;

      /** Request start time in ms (for latency calculation) */
      startTime?: number;
    }
  }
}

export {};
