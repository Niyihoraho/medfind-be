// ─── FACILITY ACCESS MIDDLEWARE ──────────────────────────────────
// Checks if the current user is an admin of the specified facility.
// Super admins bypass this check.
// Must be used AFTER authenticate middleware.

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const requireFacilityAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 401 });
  }

  // Super admins can access any facility
  if (req.user.role === 'super_admin') {
    return next();
  }

  const facilityId = parseInt(String(req.params.id), 10);
  if (isNaN(facilityId)) {
    return res.status(400).json({ success: false, error: 'Invalid facility ID', code: 400 });
  }

  // Check if user is listed in facility_admins for this facility
  const assignment = await prisma.facilityAdmin.findUnique({
    where: {
      unique_facility_user: {
        facilityId: BigInt(facilityId),
        userId: BigInt(req.user.id),
      },
    },
  });

  if (!assignment) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden — you are not an admin of this facility',
      code: 403,
    });
  }

  next();
};
