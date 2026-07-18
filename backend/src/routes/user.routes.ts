import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar, getUsers, updateSettings } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/settings', updateSettings);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

// Admin routes
router.get('/', authorize(['ADMIN']), getUsers);

export default router;
