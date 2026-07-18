import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { notificationService } from '../services/notification.service';

export const getInvoices = async (req: Request, res: Response) => {
  const { page = '1', limit = '20', patientId, status } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        patient: { select: { id: true, name: true, patientCode: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.invoice.count({ where })
  ]);

  sendSuccess(res, {
    invoices,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
};

export const getInvoiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, patientCode: true, phone: true } },
    }
  });

  if (!invoice) throw new AppError('Invoice not found', 404);
  sendSuccess(res, { invoice });
};

// Generate a sequential invoice code
const generateInvoiceCode = async () => {
  const count = await prisma.invoice.count();
  return `INV-${String(count + 1).padStart(5, '0')}`;
};

export const createInvoice = async (req: Request, res: Response) => {
  const data = req.body;
  
  // Verify patient exists
  const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
  if (!patient) throw new AppError('Patient not found', 404);

  // Calculate amount based on items
  let amount = 0;
  for (const item of data.items) {
    amount += Number(item.total);
  }

  const invoiceCode = await generateInvoiceCode();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceCode,
      patientId: data.patientId,
      amount,
      paidAmount: 0,
      status: data.status || 'PENDING',
      items: data.items,
      notes: data.notes,
      dueAt: data.dueAt,
    },
    include: {
      patient: { select: { name: true, userId: true } }
    }
  });

  notificationService.broadcast({
    title: 'Invoice Generated',
    message: `Invoice ${invoice.invoiceCode} for ₹${invoice.amount} has been generated for patient ${invoice.patient.name}.`,
    type: 'INFO',
    entityType: 'INVOICE',
    entityId: invoice.id,
    targetRoles: ['RECEPTIONIST'],
    targetUserIds: invoice.patient.userId ? [invoice.patient.userId] : []
  }).catch((err: any) => console.warn('[notify] billing create failed:', err?.message));

  sendCreated(res, { invoice });
};

export const updateInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw new AppError('Invoice not found', 404);

  // If status is changed to PAID, optionally update paidAmount and paidAt
  const updateData: any = { ...data };
  if (data.status === 'PAID' && existing.status !== 'PAID') {
    updateData.paidAt = new Date();
    if (data.paidAmount === undefined) {
      updateData.paidAmount = existing.amount;
    }
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      patient: { select: { name: true, userId: true } }
    }
  });

  // If status is changed to PAID, trigger "Payment Completed" notification
  if (invoice.status === 'PAID' && existing.status !== 'PAID') {
    notificationService.broadcast({
      title: 'Payment Completed',
      message: `Payment of ₹${invoice.amount} for invoice ${invoice.invoiceCode} (${invoice.patient.name}) has been received.`,
      type: 'SUCCESS',
      entityType: 'INVOICE',
      entityId: invoice.id,
      targetRoles: ['RECEPTIONIST'],
      targetUserIds: invoice.patient.userId ? [invoice.patient.userId] : []
    }).catch((err: any) => console.warn('[notify] billing update failed:', err?.message));
  }

  sendSuccess(res, { invoice });
};

export const deleteInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw new AppError('Invoice not found', 404);

  await prisma.invoice.delete({ where: { id } });
  sendSuccess(res, null, 'Invoice deleted');
};
