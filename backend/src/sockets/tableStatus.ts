import { getIO } from '../config/socket.js';

/**
 * Emit a booking:confirmed event to the restaurant room.
 */
export const emitBookingConfirmed = (restaurantId: string, data: {
  bookingId: string;
  tableId: string;
  slotStart: Date;
  slotEnd: Date;
  partySize: number;
  status: string;
}) => {
  const io = getIO();
  io.to(`restaurant:${restaurantId}:tables`).emit('booking:confirmed', data);
};

/**
 * Emit a table:status_changed event to the restaurant room.
 * Used when a guest checks in, a booking is cancelled, or a no-show is marked.
 */
export const emitTableStatusChanged = (restaurantId: string, data: {
  tableId: string;
  tableLabel: string;
  bookingId: string;
  status: string;
  checkedInAt?: Date;
}) => {
  const io = getIO();
  io.to(`restaurant:${restaurantId}:tables`).emit('table:status_changed', data);
};

/**
 * Emit a hold:expiring_soon event to the specific user's room.
 */
export const emitHoldExpiringSoon = (userId: string, data: {
  holdId: string;
  expiresAt: Date;
  restaurantName: string;
}) => {
  const io = getIO();
  io.to(`user:${userId}`).emit('hold:expiring_soon', data);
};
