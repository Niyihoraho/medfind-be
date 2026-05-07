// ─── ADMIN ROUTES ────────────────────────────────────────────────
// Super admin only endpoints.

import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All admin routes require super_admin role
router.use(authenticate, requireRole('super_admin'));

router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Organization management
router.get('/organizations', adminController.getOrganizations);
router.post('/organizations', adminController.createOrganization);
router.put('/organizations/:id', adminController.updateOrganization);
router.delete('/organizations/:id', adminController.deleteOrganization);
router.post('/organizations/:id/insurances', adminController.addOrganizationInsurance);
router.delete('/organizations/:id/insurances/:iid', adminController.removeOrganizationInsurance);

// Service management
router.post('/services', adminController.createService);
router.put('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Insurance management
router.post('/insurances', adminController.createInsurance);
router.put('/insurances/:id', adminController.updateInsurance);
router.delete('/insurances/:id', adminController.deleteInsurance);

// Location management
router.post('/provinces', adminController.createProvince);
router.delete('/provinces/:id', adminController.deleteProvince);
router.post('/districts', adminController.createDistrict);
router.delete('/districts/:id', adminController.deleteDistrict);
router.post('/sectors', adminController.createSector);
router.delete('/sectors/:id', adminController.deleteSector);

// Facility admin management
router.get('/facilities/:id/admins', adminController.getFacilityAdmins);
router.post('/facilities/:id/admins', adminController.assignFacilityAdmin);
router.delete('/facilities/:id/admins/:uid', adminController.removeFacilityAdmin);

// Facility assets management
router.post('/facilities/:id/services', adminController.addFacilityService);
router.delete('/facilities/:id/services/:sid', adminController.removeFacilityService);
router.post('/facilities/:id/insurances', adminController.addFacilityInsurance);
router.delete('/facilities/:id/insurances/:iid', adminController.removeFacilityInsurance);

export default router;
