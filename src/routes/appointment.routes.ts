// ─── APPOINTMENT ROUTES ──────────────────────────────────────────

import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../lib/validate';
import { createAppointmentSchema, updateAppointmentSchema } from '../validators/appointment.schema';

const router = Router();

router.get('/', authenticate, appointmentController.getMyAppointments);
router.get('/:id', authenticate, appointmentController.getById);
router.post('/', optionalAuthenticate, validate(createAppointmentSchema), appointmentController.create);
router.patch('/:id', authenticate, requireRole('facility_admin', 'super_admin'), validate(updateAppointmentSchema), appointmentController.updateStatus);
router.delete('/:id', authenticate, appointmentController.cancel);

export default router;
