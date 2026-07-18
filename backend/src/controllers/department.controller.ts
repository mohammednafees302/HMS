import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { notificationService } from '../services/notification.service';

export const getDepartments = async (req: Request, res: Response) => {
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { doctors: true, appointments: true }
      }
    }
  });
  
  sendSuccess(res, { departments });
};

export const getDepartmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      doctors: {
        select: { id: true, user: { select: { name: true, email: true } }, specialization: true }
      }
    }
  });

  if (!department) throw new AppError('Department not found', 404);
  sendSuccess(res, { department });
};

export const createDepartment = async (req: Request, res: Response) => {
  const { name, description, headId, totalBeds } = req.body;
  
  const existing = await prisma.department.findUnique({ where: { name } });
  if (existing) throw new AppError('Department with this name already exists', 400);

  const department = await prisma.department.create({
    data: { name, description, headId, totalBeds }
  });

  notificationService.broadcast({
    title: 'Department Created',
    message: `Department ${department.name} has been created.`,
    type: 'SUCCESS',
    entityType: 'DEPARTMENT',
    entityId: department.id,
    targetRoles: []
  }).catch((err: any) => console.warn('[notify] dept create failed:', err?.message));

  sendCreated(res, { department });
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw new AppError('Department not found', 404);

  if (req.body.name && req.body.name !== existing.name) {
    const nameConflict = await prisma.department.findUnique({ where: { name: req.body.name } });
    if (nameConflict) throw new AppError('Department with this name already exists', 400);
  }

  const department = await prisma.department.update({
    where: { id },
    data: req.body
  });

  notificationService.broadcast({
    title: 'Department Updated',
    message: `Department ${department.name} details have been updated.`,
    type: 'INFO',
    entityType: 'DEPARTMENT',
    entityId: department.id,
    targetRoles: []
  }).catch((err: any) => console.warn('[notify] dept update failed:', err?.message));

  sendSuccess(res, { department });
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw new AppError('Department not found', 404);

  // Prisma will cascade delete or throw foreign key error depending on schema.
  // Our schema doesn't have cascade for department, so we might need to handle it.
  const doctorCount = await prisma.doctor.count({ where: { departmentId: id } });
  if (doctorCount > 0) throw new AppError('Cannot delete department with assigned doctors', 400);

  await prisma.department.delete({ where: { id } });

  notificationService.broadcast({
    title: 'Department Deleted',
    message: `Department ${existing.name} has been deleted.`,
    type: 'WARNING',
    entityType: 'DEPARTMENT',
    entityId: existing.id,
    targetRoles: []
  }).catch((err: any) => console.warn('[notify] dept delete failed:', err?.message));

  sendSuccess(res, null, 'Department deleted');
};
