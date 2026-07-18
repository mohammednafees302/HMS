import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { notificationService } from '../services/notification.service';

export const getDoctors = async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search, departmentId, isActive } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (departmentId) where.departmentId = departmentId;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  
  if (search) {
    where.OR = [
      { user: { name: { contains: search as string, mode: 'insensitive' } } },
      { specialization: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.doctor.count({ where })
  ]);

  sendSuccess(res, {
    doctors,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
};

export const getDoctorById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
      department: { select: { name: true } },
    }
  });

  if (!doctor) throw new AppError('Doctor not found', 404);
  sendSuccess(res, { doctor });
};

export const createDoctor = async (req: Request, res: Response) => {
  const { userId, departmentId, specialization, qualification, experience, availability } = req.body;
  
  const existing = await prisma.doctor.findUnique({ where: { userId } });
  if (existing) throw new AppError('User is already assigned as a doctor', 400);

  const doctor = await prisma.doctor.create({
    data: { userId, departmentId, specialization, qualification, experience, availability },
    include: { user: { select: { name: true } } }
  });

  // Ensure user has DOCTOR role
  await prisma.user.update({ where: { id: userId }, data: { role: 'DOCTOR' } });

  notificationService.broadcast({
    title: 'New Doctor Registered',
    message: `Dr. ${doctor.user.name} has been added to the system.`,
    type: 'SUCCESS',
    entityType: 'DOCTOR',
    entityId: doctor.id,
    targetRoles: []
  }).catch((err: any) => console.warn('[notify] doctor create failed:', err?.message));

  sendCreated(res, { doctor });
};

export const updateDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.doctor.findUnique({ where: { id } });
  if (!existing) throw new AppError('Doctor not found', 404);

  const doctor = await prisma.doctor.update({
    where: { id },
    data: req.body,
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true } },
    }
  });

  notificationService.broadcast({
    title: 'Doctor Profile Updated',
    message: `Dr. ${doctor.user.name}'s profile was updated.`,
    type: 'INFO',
    entityType: 'DOCTOR',
    entityId: doctor.id,
    targetRoles: []
  }).catch((err: any) => console.warn('[notify] doctor update failed:', err?.message));

  sendSuccess(res, { doctor });
};

export const deleteDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.doctor.findUnique({ 
    where: { id },
    include: { user: { select: { name: true } } } 
  });
  if (!existing) throw new AppError('Doctor not found', 404);

  // Set user role back to PATIENT ?
  // For now, let's just delete the doctor record
  await prisma.doctor.delete({ where: { id } });
  
  notificationService.broadcast({
    title: 'Doctor Deleted',
    message: `Dr. ${existing.user.name} has been removed from the system.`,
    type: 'WARNING',
    entityType: 'DOCTOR',
    entityId: existing.id,
    targetRoles: []
  }).catch((err: any) => console.warn('[notify] doctor delete failed:', err?.message));

  sendSuccess(res, null, 'Doctor deleted');
};
