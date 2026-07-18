import { Router } from 'express';
import { getReports } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Only admin can access reports
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getReports);

export default router;
