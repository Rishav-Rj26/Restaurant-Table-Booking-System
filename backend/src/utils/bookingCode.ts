import { Booking } from '../models/Booking.model.js';

/**
 * Generates a unique alphanumeric booking code in the format: XX-SLUG-XXXX
 */
export const generateBookingCode = async (restaurantSlug: string): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  const getRandomString = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const cleanSlug = restaurantSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) || 'RESTAURANT';
  
  // Retry loop for collisions
  // A collision is exceptionally unlikely, but keep the operation bounded so a
  // damaged index or an adversarial data set can never hang a request.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const prefix = getRandomString(2);
    const suffix = getRandomString(4);
    
    const code = `${prefix}-${cleanSlug}-${suffix}`;
    
    // Check if code exists
    const existing = await Booking.findOne({ bookingCode: code });
    if (!existing) {
      return code;
    }
  }

  throw new Error('Could not generate a unique booking code');
};
