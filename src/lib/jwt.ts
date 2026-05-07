// ─── JWT HELPERS ─────────────────────────────────────────────────
// Sign and verify JWT tokens for authentication.

import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use';

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
