import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { notificationService } from '../services/notification.service';

export const getAppointments = async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search, patientId, doctorId, status } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (patientId) where.patientId = patientId;
  if (doctorId) where.doctorId = doctorId;
  if (status) where.status = status;
  
  if (search) {
    where.OR = [
      { patient: { name: { contains: search as string, mode: 'insensitive' } } },
      { doctor: { user: { name: { contains: search as string, mode: 'insensitive' } } } }
    ];
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, user: { select: { name: true } } } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'desc' }
    }),
    prisma.appointment.count({ where })
  ]);

  sendSuccess(res, {
    appointments,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
};

export const getAppointmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      doctor: { select: { id: true, user: { select: { name: true } } } },
      department: { select: { id: true, name: true } },
    }
  });

  if (!appointment) throw new AppError('Appointment not found', 404);
  sendSuccess(res, { appointment });
};

export const createAppointment = async (req: Request, res: Response) => {
  // Extract body
  const data = req.body;
  
  // Ensure patient exists
  const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
  if (!patient) throw new AppError('Patient not found', 404);

  // Ensure doctor exists
  const doctor = await prisma.doctor.findUnique({ 
    where: { id: data.doctorId },
    include: { user: { select: { name: true } } }
  });
  if (!doctor) throw new AppError('Doctor not found', 404);

  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      departmentId: data.departmentId || doctor.departmentId,
      scheduledAt: data.scheduledAt,
      type: data.type,
      reason: data.reason,
      status: data.status || 'SCHEDULED'
    }
  });

  notificationService.broadcast({
    title: 'Appointment Booked',
    message: `Appointment booked for ${patient.name} with Dr. ${doctor.user.name}.`,
    type: 'INFO',
    entityType: 'APPOINTMENT',
    entityId: appointment.id,
    targetRoles: ['RECEPTIONIST'],
    targetUserIds: [patient.userId, doctor.userId].filter(Boolean) as string[]
  }).catch((err: any) => console.warn('[notify] appt create failed:', err?.message));

  sendCreated(res, { appointment });
};

export const updateAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new AppError('Appointment not found', 404);

  const appointment = await prisma.appointment.update({
    where: { id },
    data,
    include: {
      patient: { select: { name: true, userId: true } },
      doctor: { select: { userId: true, user: { select: { name: true } } } },
    }
  });

  notificationService.broadcast({
    title: 'Appointment Updated',
    message: `Appointment for ${appointment.patient.name} with Dr. ${appointment.doctor.user.name} was updated.`,
    type: 'INFO',
    entityType: 'APPOINTMENT',
    entityId: appointment.id,
    targetRoles: ['RECEPTIONIST'],
    targetUserIds: [appointment.patient.userId, appointment.doctor.userId].filter(Boolean) as string[]
  }).catch((err: any) => console.warn('[notify] appt update failed:', err?.message));

  sendSuccess(res, { appointment });
};

export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.appointment.findUnique({ 
    where: { id },
    include: {
      patient: { select: { name: true, userId: true } },
      doctor: { select: { userId: true, user: { select: { name: true } } } },
    }
  });
  if (!existing) throw new AppError('Appointment not found', 404);

  await prisma.appointment.delete({ where: { id } });

  notificationService.broadcast({
    title: 'Appointment Cancelled',
    message: `Appointment for ${existing.patient.name} with Dr. ${existing.doctor.user.name} was cancelled.`,
    type: 'WARNING',
    entityType: 'APPOINTMENT',
    entityId: existing.id,
    targetRoles: ['RECEPTIONIST'],
    targetUserIds: [existing.patient.userId, existing.doctor.userId].filter(Boolean) as string[]
  }).catch((err: any) => console.warn('[notify] appt delete failed:', err?.message));

  sendSuccess(res, null, 'Appointment deleted');
};
