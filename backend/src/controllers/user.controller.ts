import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { notificationService } from '../services/notification.service';
import fs from 'fs';
import path from 'path';

export const getUsers = async (req: Request, res: Response) => {
  const { role } = req.query;
  const where: any = {};
  if (role) where.role = role;
  
  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' }
  });
  
  sendSuccess(res, { users });
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError('Unauthorized', 401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    }
  });

  if (!user) throw new AppError('User not found', 404);

  let profileData: any = { user };

  if (user.role === 'DOCTOR') {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: { department: { select: { name: true } } }
    });
    profileData.doctor = doctor;
  } else if (user.role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({
      where: { userId }
    });
    profileData.patient = patient;
  }

  sendSuccess(res, profileData);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { name, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, phone },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatarUrl: true,
    }
  });

  notificationService.broadcast({
    title: 'Profile Updated',
    message: 'Your profile information has been updated.',
    type: 'SUCCESS',
    entityType: 'PROFILE',
    entityId: user.id,
    targetUserIds: [user.id]
  }).catch((err: any) => console.warn('[notify] profile update failed:', err?.message));

  sendSuccess(res, { user });
};

export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError('Unauthorized', 401);

  if (!req.file) throw new AppError('No file uploaded', 400);

  // Generate a URL for the file (using the static uploads directory)
  const avatarUrl = `/uploads/${req.file.filename}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatarUrl: true,
    }
  });

  notificationService.broadcast({
    title: 'Profile Updated',
    message: 'Your profile avatar has been updated.',
    type: 'SUCCESS',
    entityType: 'PROFILE',
    entityId: user.id,
    targetUserIds: [user.id]
  }).catch((err: any) => console.warn('[notify] avatar update failed:', err?.message));

  sendSuccess(res, { user, message: 'Avatar updated successfully' });
};

export const updateSettings = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError('Unauthorized', 401);

  notificationService.broadcast({
    title: 'Settings Updated',
    message: 'Your system preferences and settings have been updated.',
    type: 'INFO',
    entityType: 'SETTINGS',
    entityId: userId,
    targetUserIds: [userId]
  }).catch((err: any) => console.warn('[notify] settings update failed:', err?.message));

  sendSuccess(res, null, 'Settings updated successfully');
};
