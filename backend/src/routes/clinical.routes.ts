// ============================================================
// src/routes/clinical.routes.ts
// All clinical feature routes (EHR, Prescriptions, Lab, Docs)
// ============================================================

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { authenticate } from '../middleware/auth.middleware';
import {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  uploadLabTestResult,
  getDocuments,
  uploadDocument,
  deleteDocument,
  getPatientSummary,
} from '../controllers/clinical.controller';

const router = Router({ mergeParams: true });

// ---- Multer Configuration ----
const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// All routes require authentication
router.use(authenticate);

// ---- Patient Summary ----
router.get('/summary', getPatientSummary);

// ---- Medical Records (EHR) ----
router.get('/records', getMedicalRecords);
router.post('/records', createMedicalRecord);
router.put('/records/:recordId', updateMedicalRecord);
router.delete('/records/:recordId', deleteMedicalRecord);

// ---- Prescriptions ----
router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', createPrescription);
router.put('/prescriptions/:prescriptionId', updatePrescription);
router.delete('/prescriptions/:prescriptionId', deletePrescription);

// ---- Lab Tests ----
router.get('/lab-tests', getLabTests);
router.post('/lab-tests', createLabTest);
router.put('/lab-tests/:testId', updateLabTest);
router.delete('/lab-tests/:testId', deleteLabTest);
router.post('/lab-tests/:testId/upload', upload.single('file'), uploadLabTestResult);

// ---- Documents ----
router.get('/documents', getDocuments);
router.post('/documents', upload.single('file'), uploadDocument);
router.delete('/documents/:documentId', deleteDocument);

export default router;
