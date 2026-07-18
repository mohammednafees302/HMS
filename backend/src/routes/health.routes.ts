// ============================================================
// src/routes/health.routes.ts
// ============================================================

import { Router } from 'express';
import { healthCheck, ping } from '../controllers/health.controller';

const router = Router();

/** GET /api/health — full health check with DB ping */
router.get('/', healthCheck);

/** GET /api/health/ping — lightweight ping for load balancers */
router.get('/ping', ping);

export default router;
