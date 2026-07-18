import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  getAppointmentsSchema,
} from '../validations/management.validation';
import { uuidParamSchema } from '../validations/common.validation';

const router = Router();

router.use(authenticate);

router.get('/', validate(getAppointmentsSchema), getAppointments);
router.get('/:id', validate(uuidParamSchema), getAppointmentById);

router.post('/', validate(createAppointmentSchema), createAppointment);
router.put('/:id', validate(uuidParamSchema), validate(updateAppointmentSchema), updateAppointment);
router.delete('/:id', validate(uuidParamSchema), deleteAppointment);

export default router;
