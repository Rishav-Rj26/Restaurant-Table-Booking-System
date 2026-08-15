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

  let isUnique = false;
  let code = '';
  
  // Retry loop for collisions
  while (!isUnique) {
    const prefix = getRandomString(2);
    const suffix = getRandomString(4);
    
    // Ensure slug is uppercase and truncated if it's too long
    const cleanSlug = restaurantSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
    
    code = `${prefix}-${cleanSlug}-${suffix}`;
    
    // Check if code exists
    const existing = await Booking.findOne({ bookingCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};
