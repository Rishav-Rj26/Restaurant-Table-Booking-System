import { describe, expect, it } from 'vitest';
import { bookingListQuerySchema, createHoldSchema } from './booking.validator.js';

describe('createHoldSchema', () => {
  const validHold = {
    restaurantId: '507f1f77bcf86cd799439011',
    tableId: '507f1f77bcf86cd799439012',
    slotStart: '2099-01-01T19:00:00.000Z',
    partySize: '4',
  };

  it('coerces party size and accepts a valid future hold', () => {
    expect(createHoldSchema.parse(validHold).partySize).toBe(4);
  });

  it('rejects malformed ids and past slots', () => {
    expect(createHoldSchema.safeParse({ ...validHold, tableId: 'bad', slotStart: '2020-01-01T19:00:00.000Z' }).success).toBe(false);
  });
});

describe('bookingListQuerySchema', () => {
  it('only accepts the supported booking filters', () => {
    expect(bookingListQuerySchema.safeParse({ status: 'upcoming' }).success).toBe(true);
    expect(bookingListQuerySchema.safeParse({ status: 'all' }).success).toBe(false);
  });
});
