// ============================================================
// src/config/multer.ts
// Multer configuration for file uploads.
// Validates file type and size. Saves to src/uploads/.
// ============================================================

import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { env, allowedMimeTypes, maxFileSizeBytes } from './env';

// ---- Ensure upload directory exists ----
const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---- Disk Storage ----
const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${uuidv4()}${ext}`;
    cb(null, name);
  },
});

// ---- File Filter ----
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" is not allowed. Allowed: ${allowedMimeTypes.join(', ')}`,
      ),
    );
  }
};

// ---- Multer instance ----
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeBytes,
    files: 5,
  },
});

// ---- Convenience middlewares ----
export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadArray  = (fieldName: string, max = 5) => upload.array(fieldName, max);
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);
