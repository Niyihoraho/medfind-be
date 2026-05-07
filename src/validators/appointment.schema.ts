// ─── APPOINTMENT VALIDATORS ──────────────────────────────────────

import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    facility_id: z.number().int().positive(),
    service_name: z.string().max(191).optional(),
    appointment_date: z.string().min(1, 'Appointment date is required'),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  }),
});
