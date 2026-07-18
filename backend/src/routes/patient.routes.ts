import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { validate } from '../middleware/validate.middleware';
import { patientSchema } from '../validations/patient.validation';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all patient routes
router.use(authenticate);

router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.post('/', validate({ body: patientSchema }), patientController.createPatient);
router.put('/:id', validate({ body: patientSchema.partial() }), patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

export default router;
