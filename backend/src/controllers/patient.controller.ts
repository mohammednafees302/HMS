import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { PatientStatus } from '@prisma/client';
import { notificationService } from '../services/notification.service';

export const getPatients = async (req: Request, res: Response) => {
  const { search, status, department, page = '1', limit = '50', sort = 'createdAt', order = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { patientCode: { contains: String(search), mode: 'insensitive' } },
      { diagnosis: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  if (status && status !== 'All') {
    where.status = String(status).toUpperCase() as PatientStatus;
  }

  if (department && department !== 'All') {
    where.department = String(department);
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take,
      orderBy: { [String(sort)]: String(order).toLowerCase() },
    }),
    prisma.patient.count({ where }),
  ]);

  sendSuccess(res, {
    patients,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  });
};

export const getPatientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = await prisma.patient.findUnique({ where: { id } });
  
  if (!patient) throw new AppError('Patient not found', 404);
  sendSuccess(res, { patient });
};

export const createPatient = async (req: Request, res: Response) => {
  // Generate a unique patient code (e.g., P013)
  const count = await prisma.patient.count();
  const patientCode = `P${String(count + 1).padStart(3, '0')}`;

  const patient = await prisma.patient.create({
    data: {
      ...req.body,
      patientCode,
    },
  });

  notificationService.broadcast({
    title: 'New Patient Registered',
    message: `${patient.name} (${patient.patientCode}) has been registered.`,
    type: 'SUCCESS',
    entityType: 'PATIENT',
    entityId: patient.id,
    targetRoles: ['RECEPTIONIST']
  }).catch((err: any) => console.warn('[notify] patient create failed:', err?.message));

  sendCreated(res, { patient });
};

export const updatePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.patient.findUnique({ where: { id } });
  if (!existing) throw new AppError('Patient not found', 404);

  const patient = await prisma.patient.update({
    where: { id },
    data: req.body,
  });

  notificationService.broadcast({
    title: 'Patient Updated',
    message: `${patient.name}'s record was updated.`,
    type: 'INFO',
    entityType: 'PATIENT',
    entityId: patient.id,
    targetRoles: ['RECEPTIONIST']
  }).catch((err: any) => console.warn('[notify] patient update failed:', err?.message));

  sendSuccess(res, { patient });
};

export const deletePatient = async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.patient.findUnique({ where: { id } });
  if (!existing) throw new AppError('Patient not found', 404);

  await prisma.patient.delete({ where: { id } });
  
  notificationService.broadcast({
    title: 'Patient Deleted',
    message: `${existing.name}'s record has been deleted.`,
    type: 'WARNING',
    entityType: 'PATIENT',
    entityId: existing.id,
    targetRoles: ['RECEPTIONIST']
  }).catch((err: any) => console.warn('[notify] patient delete failed:', err?.message));

  sendSuccess(res, null, 'Patient deleted successfully');
};
