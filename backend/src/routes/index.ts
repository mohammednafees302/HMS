// ============================================================
// src/routes/index.ts
// Central route registry.
// All feature routers are mounted here and imported in app.ts.
// ============================================================

import { Router, Request, Response } from 'express';
import healthRoutes    from './health.routes';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import dashboardRoutes from './dashboard.routes';
import clinicalRoutes from './clinical.routes';
import departmentRoutes from './department.routes';
import doctorRoutes from './doctor.routes';
import appointmentRoutes from './appointment.routes';
import billingRoutes from './billing.routes';
import userRoutes from './user.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import { env } from '../config/env';

const router = Router();

// ---- Mounted routes ----
router.use('/health',    healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/billing', billingRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
// Clinical routes are nested under /patients/:patientId/clinical/*
router.use('/patients/:patientId/clinical', clinicalRoutes);

// ---- Future feature routes (uncomment when modules are built) ----
// router.use('/users',        userRoutes);
// router.use('/doctors',      doctorRoutes);
// router.use('/appointments', appointmentRoutes);
// router.use('/departments',  departmentRoutes);
// router.use('/billing',      billingRoutes);
// router.use('/reports',      reportRoutes);
// router.use('/uploads',      uploadRoutes);

// ---- API Root ----
router.get('/', (_req: Request, res: Response) => {
  res.json({
    name:        'HMS Backend API',
    version:     '1.0.0',
    environment: env.NODE_ENV,
    status:      'running',
    docs:        `${env.API_PREFIX}/health`,
    timestamp:   new Date().toISOString(),
  });
});

export default router;
