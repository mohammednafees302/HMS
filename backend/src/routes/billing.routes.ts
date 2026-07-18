import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../controllers/billing.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  getInvoicesSchema,
} from '../validations/management.validation';
import { uuidParamSchema } from '../validations/common.validation';

const router = Router();

router.use(authenticate);

router.get('/', validate(getInvoicesSchema), getInvoices);
router.get('/:id', validate(uuidParamSchema), getInvoiceById);

// Only ADMIN and RECEPTIONIST can manage billing
router.use(authorize(['ADMIN', 'RECEPTIONIST']));

router.post('/', validate(createInvoiceSchema), createInvoice);
router.put('/:id', validate(uuidParamSchema), validate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', validate(uuidParamSchema), deleteInvoice);

export default router;
