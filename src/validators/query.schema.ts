// ─── QUERY VALIDATORS ────────────────────────────────────────────

import { z } from 'zod';

export const facilityQuerySchema = z.object({
  query: z.object({
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    radius: z.coerce.number().default(10),
    sector_id: z.coerce.number().optional(),
    district_id: z.coerce.number().optional(),
    province_id: z.coerce.number().optional(),
    service_id: z.coerce.number().optional(),
    insurance_id: z.coerce.number().optional(),
    type: z.enum(['hospital', 'health_center', 'clinic', 'dispensary', 'polyclinic']).optional(),
    verified: z.coerce.number().default(1),
    search: z.string().optional(),
    sort: z.enum(['distance', 'name']).default('name'),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  }),
});
