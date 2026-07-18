// ============================================================
// src/controllers/clinical.controller.ts
// Handles EHR records, prescriptions, lab tests, documents
// for a given patient.
// ============================================================

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../prisma/client';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import {
  PrescriptionStatus,
  LabTestStatus,
  LabTestCategory,
  DocumentCategory,
} from '@prisma/client';

// ─────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────

async function ensurePatient(id: string) {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) throw new AppError('Patient not found', 404);
  return patient;
}

// ─────────────────────────────────────────────────────────
// MEDICAL RECORDS (EHR)
// ─────────────────────────────────────────────────────────

export const getMedicalRecords = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  await ensurePatient(patientId);

  const records = await prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { visitDate: 'desc' },
  });

  sendSuccess(res, { records });
};

export const createMedicalRecord = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  await ensurePatient(patientId);

  const record = await prisma.medicalRecord.create({
    data: {
      ...req.body,
      patientId,
      doctorName: req.body.doctorName || (req.user?.name ?? null),
      doctorId: req.body.doctorId || req.user?.userId || null,
    },
  });

  sendCreated(res, { record });
};

export const updateMedicalRecord = async (req: Request, res: Response) => {
  const { patientId, recordId } = req.params;
  await ensurePatient(patientId);

  const existing = await prisma.medicalRecord.findFirst({ where: { id: recordId, patientId } });
  if (!existing) throw new AppError('Medical record not found', 404);

  const record = await prisma.medicalRecord.update({
    where: { id: recordId },
    data: req.body,
  });

  sendSuccess(res, { record });
};

export const deleteMedicalRecord = async (req: Request, res: Response) => {
  const { patientId, recordId } = req.params;
  await ensurePatient(patientId);

  const existing = await prisma.medicalRecord.findFirst({ where: { id: recordId, patientId } });
  if (!existing) throw new AppError('Medical record not found', 404);

  await prisma.medicalRecord.delete({ where: { id: recordId } });
  sendSuccess(res, null, 'Medical record deleted');
};

// ─────────────────────────────────────────────────────────
// PRESCRIPTIONS
// ─────────────────────────────────────────────────────────

export const getPrescriptions = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  await ensurePatient(patientId);

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId },
    orderBy: { issuedAt: 'desc' },
  });

  sendSuccess(res, { prescriptions });
};

export const createPrescription = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  await ensurePatient(patientId);

  const prescription = await prisma.prescription.create({
    data: {
      ...req.body,
      patientId,
      doctorName: req.body.doctorName || (req.user?.name ?? null),
      doctorId: req.body.doctorId || req.user?.userId || null,
    },
  });

  sendCreated(res, { prescription });
};

export const updatePrescription = async (req: Request, res: Response) => {
  const { patientId, prescriptionId } = req.params;
  await ensurePatient(patientId);

  const existing = await prisma.prescription.findFirst({ where: { id: prescriptionId, patientId } });
  if (!existing) throw new AppError('Prescription not found', 404);

  const prescription = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: req.body,
  });

  sendSuccess(res, { prescription });
};

export const deletePrescription = async (req: Request, res: Response) => {
  const { patientId, prescriptionId } = req.params;
  await ensurePatient(patientId);

  const existing = await prisma.prescription.findFirst({ where: { id: prescriptionId, patientId } });
  if (!existing) throw new AppError('Prescription not found', 404);

  await prisma.prescription.delete({ where: { id: prescriptionId } });
  sendSuccess(res, null, 'Prescription deleted');
};

// ─────────────────────────────────────────────────────────
// LAB TESTS
// ─────────────────────────────────────────────────────────

export const getLabTests = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  await ensurePatient(patientId);

  const tests = await prisma.labTest.findMany({
    where: { patientId },
    orderBy: { orderedAt: 'desc' },
  });

  sendSuccess(res, { tests });
};

export const createLabTest = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  await ensurePatient(patientId);

  const test = await prisma.labTest.create({
    data: {
      ...req.body,
      patientId,
      orderedByName: req.body.orderedByName || (req.user?.name ?? null),
      orderedById: req.body.orderedById || req.user?.userId || null,
    },
  });

  sendCreated(res, { test });
};

export const updateLabTest = async (req: Request, res: Response) => {
  const { patientId, testId } = req.params;
  await ensurePatient(patientId);

  const existing = await prisma.labTest.findFirst({ where: { id: testId, patientId } });
  if (!existing) throw new AppError('Lab test not found', 404);

  // If marking as completed, set completedAt
  const data: any = { ...req.body };
  if (req.body.status === 'COMPLETED' && !existing.completedAt) {
    data.completedAt = new Date();
  }

  const test = await prisma.labTest.update({
    where: { id: testId },
    data,
  });

  sendSuccess(res, { test });
};

export const deleteLabTest = async (req: Request, res: Response) => {
  const { patientId, testId } = req.params;
  await ensurePatient(patientId);

  const existing = await prisma.labTest.findFirst({ where: { id: testId, patientId } });
  if (!existing) throw new AppError('Lab test not found', 404);

  // Delete associated file if exists
  if (existing.fileUrl) {
    const filePath = path.resolve(process.cwd(), existing.fileUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await prisma.labTest.delete({ where: { id: testId } });
  sendSuccess(res, null, 'Lab test deleted');
};

// Upload result for a lab test
export const uploadLabTestResult = async (req: Request, res: Response) => {
  const { patientId, testId } = req.params;
  await ensurePatient(patientId);

  const existing = await prisma.labTest.findFirst({ where: { id: testId, patientId } });
  if (!existing) throw new AppError('Lab test not found', 404);

  if (!req.file) throw new AppError('No file uploaded', 400);

  const fileUrl = `/uploads/${req.file.filename}`;

  const test = await prisma.labTest.update({
    where: { id: testId },
    data: {
      fileUrl,
      fileName: req.file.originalname,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  sendSuccess(res, { test });
};

// ─────────────────────────────────────────────────────────
// PATIENT DOCUMENTS
// ─────────────────────────────────────────────────────────

export const getDocuments = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  await ensurePatient(patientId);

  const documents = await prisma.patientDocument.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, { documents });
};

export const uploadDocument = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  await ensurePatient(patientId);

  if (!req.file) throw new AppError('No file uploaded', 400);

  const { title, category, notes } = req.body;
  if (!title) throw new AppError('Document title is required', 400);

  const document = await prisma.patientDocument.create({
    data: {
      patientId,
      uploadedById: req.user?.userId || null,
      title,
      category: (category as DocumentCategory) || 'OTHER',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      notes: notes || null,
    },
  });

  sendCreated(res, { document });
};

export const deleteDocument = async (req: Request, res: Response) => {
  const { patientId, documentId } = req.params;
  await ensurePatient(patientId);

  const existing = await prisma.patientDocument.findFirst({ where: { id: documentId, patientId } });
  if (!existing) throw new AppError('Document not found', 404);

  // Delete file from disk
  const filePath = path.resolve(process.cwd(), existing.fileUrl.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.patientDocument.delete({ where: { id: documentId } });
  sendSuccess(res, null, 'Document deleted');
};

// ─────────────────────────────────────────────────────────
// PATIENT FULL SUMMARY (for Overview tab)
// ─────────────────────────────────────────────────────────

export const getPatientSummary = async (req: Request, res: Response) => {
  const { patientId } = req.params;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        take: 5,
        include: { doctor: { include: { user: { select: { name: true } } } } },
      },
      invoices: {
        orderBy: { issuedAt: 'desc' },
        take: 5,
      },
      medicalRecords: {
        orderBy: { visitDate: 'desc' },
        take: 3,
      },
      prescriptions: {
        where: { status: 'ACTIVE' },
        orderBy: { issuedAt: 'desc' },
        take: 3,
      },
      labTests: {
        orderBy: { orderedAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!patient) throw new AppError('Patient not found', 404);
  sendSuccess(res, { patient });
};
