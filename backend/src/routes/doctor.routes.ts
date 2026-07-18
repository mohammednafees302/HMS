import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createDoctorSchema,
  updateDoctorSchema,
  getDoctorsSchema,
} from '../validations/management.validation';
import { uuidParamSchema } from '../validations/common.validation';

const router = Router();

router.use(authenticate);

router.get('/', validate(getDoctorsSchema), getDoctors);
router.get('/:id', validate(uuidParamSchema), getDoctorById);

// Only ADMIN can manage doctors
router.use(authorize(['ADMIN']));

router.post('/', validate(createDoctorSchema), createDoctor);
router.put('/:id', validate(uuidParamSchema), validate(updateDoctorSchema), updateDoctor);
router.delete('/:id', validate(uuidParamSchema), deleteDoctor);

export default router;
