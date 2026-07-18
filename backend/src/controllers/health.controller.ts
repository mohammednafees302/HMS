// ============================================================
// src/controllers/health.controller.ts
// GET /api/health — liveness & readiness probe.
// Returns database connectivity status and system metrics.
// ============================================================

import { Request, Response } from 'express';
import os from 'os';
import { pingDatabase } from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { env } from '../config/env';
import { HealthCheckResult, ServiceHealth } from '../types';

// Timestamp the server started
const SERVER_START = Date.now();

export const healthCheck = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const startTime = Date.now();

  // ---- Check database ----
  let dbHealth: ServiceHealth;
  try {
    const dbStart = Date.now();
    const dbOk = await pingDatabase();
    const dbLatency = Date.now() - dbStart;
    dbHealth = dbOk
      ? { status: 'ok', latency: dbLatency }
      : { status: 'down', message: 'Database ping failed' };
  } catch (err) {
    dbHealth = {
      status: 'down',
      message: err instanceof Error ? err.message : 'Unknown database error',
    };
  }

  // ---- Memory health ----
  const totalMem = os.totalmem();
  const freeMem  = os.freemem();
  const usedPct  = ((totalMem - freeMem) / totalMem) * 100;
  const memHealth: ServiceHealth = {
    status: usedPct > 90 ? 'degraded' : 'ok',
    message: `${usedPct.toFixed(1)}% used (${(freeMem / 1024 / 1024).toFixed(0)} MB free)`,
  };

  // ---- Overall status ----
  const overallStatus =
    dbHealth.status === 'down'       ? 'down'
    : dbHealth.status === 'degraded' ? 'degraded'
    : memHealth.status === 'degraded'? 'degraded'
    : 'ok';

  const result: HealthCheckResult = {
    status:      overallStatus,
    version:     process.env['npm_package_version'] ?? '1.0.0',
    environment: env.NODE_ENV,
    uptime:      Math.round((Date.now() - SERVER_START) / 1000),
    timestamp:   new Date().toISOString(),
    services: {
      database: dbHealth,
      memory:   memHealth,
    },
  };

  const httpStatus = overallStatus === 'down' ? 503 : 200;

  res.status(httpStatus).json({
    success: httpStatus === 200,
    message: `HMS Backend is ${overallStatus.toUpperCase()}`,
    data: result,
    timestamp: result.timestamp,
    requestId: req.requestId,
  });
};

// ---- Simple ping (no DB check) for load balancers ----
export const ping = (_req: Request, res: Response): void => {
  res.status(200).json({ pong: true, ts: Date.now() });
};
