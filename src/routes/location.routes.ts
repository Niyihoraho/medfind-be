// ─── LOCATION ROUTES ─────────────────────────────────────────────

import { Router } from 'express';
import { locationController } from '../controllers/location.controller';

const router = Router();

router.get('/provinces', locationController.getProvinces);
router.get('/provinces/:id/districts', locationController.getDistricts);
router.get('/districts/:id/sectors', locationController.getSectors);
router.get('/sectors/:id/cells', locationController.getCells);
router.get('/cells/:id/villages', locationController.getVillages);
router.get('/place-centers/:type/:id', locationController.getPlaceCenter);

export default router;
