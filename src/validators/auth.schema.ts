// ─── AUTH VALIDATORS ─────────────────────────────────────────────

import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').max(191),
    email: z.string().email('Invalid email address'),
    phone: z.string().max(20).optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(255),
    preferred_language: z.enum(['en', 'rw', 'fr']).default('en'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});
