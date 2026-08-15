import { z } from 'zod';
import { CUISINE_TYPES, AMBIANCE_TYPES, DIETARY_OPTIONS } from '../config/constants.js';

// Reusable schemas
const addressSchema = z.object({
  line1: z.string().min(1, 'Line 1 is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'Zip code is required'),
  country: z.string().default('US'),
  location: z.object({
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)    // latitude
    ])
  })
});

const operatingHourSchema = z.object({
  day: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
});

export const createRestaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  address: addressSchema,
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional(),
  }).optional(),
  cuisineTypes: z.array(z.enum(CUISINE_TYPES)).default([]),
  ambiance: z.enum(AMBIANCE_TYPES),
  dietaryOptions: z.array(z.enum(DIETARY_OPTIONS)).default([]),
  operatingHours: z.array(operatingHourSchema).min(1, 'At least one operating hour must be provided'),
  bookingFee: z.object({
    amount: z.number().min(0),
    currency: z.string().default('usd')
  }).optional().default({ amount: 0, currency: 'usd' }),
  cancellationPolicy: z.object({
    hoursBeforeForRefund: z.number().min(0)
  }).optional().default({ hoursBeforeForRefund: 24 }),
  photos: z.array(z.string().url('Invalid URL')).default([]),
  tables: z.array(z.object({
    label: z.string().min(1, 'Table label is required'),
    capacity: z.number().int().min(1)
  })).min(1, 'At least one table must be provided')
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: addressSchema.optional(),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  cuisineTypes: z.array(z.enum(CUISINE_TYPES)).optional(),
  ambiance: z.enum(AMBIANCE_TYPES).optional(),
  dietaryOptions: z.array(z.enum(DIETARY_OPTIONS)).optional(),
  operatingHours: z.array(operatingHourSchema).optional(),
  bookingFee: z.object({
    amount: z.number().min(0),
    currency: z.string().default('usd')
  }).optional(),
  cancellationPolicy: z.object({
    hoursBeforeForRefund: z.number().min(0)
  }).optional(),
  photos: z.array(z.string().url()).optional(),
});

export const createTableSchema = z.object({
  label: z.string().min(1, 'Table label is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1')
});

export const updateTableSchema = z.object({
  label: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  isActive: z.boolean().optional()
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  partySize: z.coerce.number().int().min(1),
});
