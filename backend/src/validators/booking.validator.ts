import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');

export const createHoldSchema = z.object({
  restaurantId: objectId,
  tableId: objectId,
  slotStart: z.string().datetime({ offset: true }).refine(
    (value) => new Date(value) > new Date(),
    'Booking time must be in the future'
  ),
  partySize: z.coerce.number().int().min(1).max(20),
});

export const bookingIdParamSchema = z.object({ id: objectId });

export const bookingListQuerySchema = z.object({
  status: z.enum(['upcoming', 'past']).optional(),
});
