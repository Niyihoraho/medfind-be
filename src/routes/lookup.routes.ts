// ─── LOOKUP ROUTES ───────────────────────────────────────────────
// Public endpoints for services and insurance schemes.

import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function serialize(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

// GET /api/services
router.get('/services', async (_req: Request, res: Response) => {
  const services = await prisma.service.findMany({ orderBy: { category: 'asc' } });
  res.json({ success: true, data: serialize(services), message: 'Services retrieved' });
});

// GET /api/insurance-schemes
router.get('/insurance-schemes', async (_req: Request, res: Response) => {
  const schemes = await prisma.insuranceScheme.findMany({ orderBy: { type: 'asc' } });
  res.json({ success: true, data: serialize(schemes), message: 'Insurance schemes retrieved' });
});

export default router;
