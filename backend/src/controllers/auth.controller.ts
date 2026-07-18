import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt';
import { sendSuccess, sendCreated, sendUnauthorized, sendBadRequest, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { UserRole } from '@prisma/client';
import { notificationService } from '../services/notification.service';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, phone } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const passwordHash = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role ?? UserRole.PATIENT,
      phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    }
  });

  // Fire notification in background - don't let it fail the registration
  notificationService.broadcast({
    title: 'User Registered',
    message: `New user ${user.name} (${user.email}) registered with role ${user.role}.`,
    type: 'INFO',
    entityType: 'USER',
    entityId: user.id,
    targetUserIds: [user.id]
  }).catch((err) => console.warn('[notify] register broadcast failed:', err?.message));

  sendCreated(res, { user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Exclude sensitive fields from response
  const { passwordHash, resetToken, resetTokenExp, tokenVersion, ...userProfile } = user;

  sendSuccess(res, {
    user: userProfile,
    accessToken,
    refreshToken,
  }, 'Login successful');
};

export const logout = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated', 401);

  // Invalidate refresh tokens by incrementing the version
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { tokenVersion: { increment: 1 } },
  });

  sendSuccess(res, null, 'Logged out successfully');
};

export const refresh = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Refresh token missing', 401);
  }

  const token = authHeader.split(' ')[1];
  
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.tokenVersion !== payload.tokenVersion || !user.isActive) {
    throw new AppError('Token invalid or revoked', 401);
  }

  const newPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  sendSuccess(res, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }, 'Token refreshed');
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return success anyway to prevent email enumeration
    return sendSuccess(res, null, 'If an account exists, a reset token will be provided');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const exp = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExp: exp,
    },
  });

  // Simulated email send by returning token in response
  sendSuccess(res, { resetToken }, 'Reset token generated (simulated email)');
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExp: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExp: null,
      tokenVersion: { increment: 1 }, // invalidate old sessions
    },
  });

  notificationService.broadcast({
    title: 'Password Changed',
    message: 'Your password has been reset successfully.',
    type: 'SUCCESS',
    entityType: 'USER',
    entityId: user.id,
    targetUserIds: [user.id]
  }).catch((err: any) => console.warn('[notify] reset password failed:', err?.message));

  sendSuccess(res, null, 'Password reset successful');
};

export const changePassword = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated', 401);
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Incorrect current password', 401);
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      tokenVersion: { increment: 1 }, // force re-login on other devices
    },
  });

  notificationService.broadcast({
    title: 'Password Changed',
    message: 'Your password has been changed successfully.',
    type: 'SUCCESS',
    entityType: 'USER',
    entityId: user.id,
    targetUserIds: [user.id]
  }).catch((err: any) => console.warn('[notify] change password failed:', err?.message));

  sendSuccess(res, null, 'Password changed successfully');
};
