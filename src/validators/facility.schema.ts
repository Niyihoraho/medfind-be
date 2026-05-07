// ─── FACILITY VALIDATORS ─────────────────────────────────────────

import { z } from 'zod';

export const createFacilitySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(191),
    type: z.enum(['hospital', 'health_center', 'clinic', 'dispensary', 'polyclinic']),
    address: z.string().max(255).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    sector_id: z.coerce.number().int().positive(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional().or(z.literal('')),
    opening_hours: z.record(z.string()).optional(),
  }),
});

export const updateFacilitySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(191).optional(),
    type: z.enum(['hospital', 'health_center', 'clinic', 'dispensary', 'polyclinic']).optional(),
    address: z.string().max(255).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
    longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
    sector_id: z.coerce.number().int().positive().optional(),
    phone: z.string().max(20).optional().nullable(),
    email: z.string().email().optional().nullable().or(z.literal('')),
    opening_hours: z.record(z.string()).optional().nullable(),
  }),
});

export const addServiceSchema = z.object({
  body: z.object({
    service_id: z.number().int().positive(),
  }),
});

export const addInsuranceSchema = z.object({
  body: z.object({
    insurance_id: z.number().int().positive(),
  }),
});
