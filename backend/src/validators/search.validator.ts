import { z } from 'zod';
import { CUISINE_TYPES, AMBIANCE_TYPES, DIETARY_OPTIONS } from '../config/constants.js';

export const searchRestaurantsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(100).default(10).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)').optional(),
  partySize: z.coerce.number().int().min(1).optional(),
  cuisine: z.union([
    z.array(z.enum(CUISINE_TYPES)),
    z.enum(CUISINE_TYPES).transform(val => [val])
  ]).optional(),
  ambiance: z.enum(AMBIANCE_TYPES).optional(),
  dietary: z.union([
    z.array(z.enum(DIETARY_OPTIONS)),
    z.enum(DIETARY_OPTIONS).transform(val => [val])
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
