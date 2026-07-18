// ============================================================
// src/routes/auth.routes.ts
// ============================================================

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validations/auth.validation';

const router = Router();

import { prisma } from '../prisma/client';

// Public routes
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);

// Protected routes (require valid access token)
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), authController.changePassword);

export default router;
