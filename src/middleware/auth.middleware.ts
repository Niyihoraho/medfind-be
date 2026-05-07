// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────
// Verifies JWT from Authorization header and attaches user to req.

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized — no token provided', code: 401 });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized — invalid token', code: 401 });
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) return next();

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next();
  }
};
