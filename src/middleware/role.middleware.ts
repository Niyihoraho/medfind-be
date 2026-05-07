// ─── ROLE MIDDLEWARE ─────────────────────────────────────────────
// Restricts access to specified roles.
// Must be used AFTER authenticate middleware.

import { Request, Response, NextFunction } from 'express';

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized', code: 401 });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden — requires one of: ${roles.join(', ')}`,
        code: 403,
      });
    }

    next();
  };
};
