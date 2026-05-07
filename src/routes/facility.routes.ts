// ─── FACILITY ROUTES ─────────────────────────────────────────────

import { Router } from 'express';
import { facilityController } from '../controllers/facility.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { requireFacilityAccess } from '../middleware/facilityAccess';
import { validate } from '../lib/validate';
import { createFacilitySchema, updateFacilitySchema, addServiceSchema, addInsuranceSchema } from '../validators/facility.schema';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', facilityController.search);
router.get('/:id', facilityController.getById);

// Super admin only
router.post('/', authenticate, requireRole('super_admin'), upload.single('image'), validate(createFacilitySchema), facilityController.create);
router.delete('/:id', authenticate, requireRole('super_admin'), facilityController.remove);
router.patch('/:id/verify', authenticate, requireRole('super_admin'), facilityController.verify);

// Facility admin + super admin
router.put('/:id', authenticate, requireFacilityAccess, upload.single('image'), validate(updateFacilitySchema), facilityController.update);

// Facility services
router.post('/:id/services', authenticate, requireFacilityAccess, validate(addServiceSchema), facilityController.addService);
router.delete('/:id/services/:sid', authenticate, requireFacilityAccess, facilityController.removeService);
router.patch('/:id/services/:sid', authenticate, requireFacilityAccess, facilityController.toggleServiceAvailability);

// Facility insurances
router.post('/:id/insurances', authenticate, requireFacilityAccess, validate(addInsuranceSchema), facilityController.addInsurance);
router.delete('/:id/insurances/:iid', authenticate, requireFacilityAccess, facilityController.removeInsurance);

export default router;
