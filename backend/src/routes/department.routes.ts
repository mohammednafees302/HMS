import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from '../validations/management.validation';
import { uuidParamSchema } from '../validations/common.validation';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.get('/:id', validate(uuidParamSchema), getDepartmentById);

// Only ADMIN can manage departments
router.use(authorize(['ADMIN']));

router.post('/', validate(createDepartmentSchema), createDepartment);
router.put('/:id', validate(uuidParamSchema), validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', validate(uuidParamSchema), deleteDepartment);

export default router;
