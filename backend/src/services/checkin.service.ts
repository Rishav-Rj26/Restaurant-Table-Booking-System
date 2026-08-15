import { Booking, IBooking } from '../models/Booking.model.js';
import { Table } from '../models/Table.model.js';
import { createAppError } from '../middleware/errorHandler.js';
import { emitTableStatusChanged } from '../sockets/tableStatus.js';

/**
 * Verify a booking by its code and check the guest in.
 */
export const verifyBooking = async (bookingCode: string, restaurantId: string) => {
  const booking = await Booking.findOne({ bookingCode: bookingCode.toUpperCase() })
    .populate('tableId', 'label capacity');

  if (!booking) {
    throw createAppError(404, 'not_found', 'Booking not found');
  }

  if (booking.restaurantId.toString() !== restaurantId) {
    throw createAppError(400, 'bad_request', 'Booking does not belong to this restaurant');
  }

  if (booking.status !== 'confirmed') {
    throw createAppError(400, 'bad_request', `Cannot check in: booking status is "${booking.status}"`);
  }

  // Validate date is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(booking.slotStart);
  bookingDate.setHours(0, 0, 0, 0);

  if (bookingDate.getTime() !== today.getTime()) {
    throw createAppError(400, 'bad_request', 'Booking is not for today');
  }

  // Mark as present
  booking.status = 'present';
  booking.checkedInAt = new Date();
  await booking.save();

  // Get table info for the event
  const table = booking.tableId as any; // populated

  // Emit real-time event
  try {
    emitTableStatusChanged(restaurantId, {
      tableId: table._id.toString(),
      tableLabel: table.label,
      bookingId: booking._id.toString(),
      status: 'present',
      checkedInAt: booking.checkedInAt,
    });
  } catch (err) {
    // Socket not initialized in tests — don't fail check-in
    console.warn('Socket emit failed (non-critical):', err);
  }

  return {
    bookingId: booking._id,
    bookingCode: booking.bookingCode,
    guestName: 'Guest', // Would come from user populate if needed
    partySize: booking.partySize,
    tableLabel: table.label,
    slotStart: booking.slotStart,
    slotEnd: booking.slotEnd,
    checkedInAt: booking.checkedInAt,
    status: booking.status,
  };
};

/**
 * Mark a confirmed booking as a no-show.
 */
export const markNoShow = async (bookingId: string, restaurantId: string) => {
  const booking = await Booking.findById(bookingId)
    .populate('tableId', 'label capacity');

  if (!booking) {
    throw createAppError(404, 'not_found', 'Booking not found');
  }

  if (booking.restaurantId.toString() !== restaurantId) {
    throw createAppError(400, 'bad_request', 'Booking does not belong to this restaurant');
  }

  if (booking.status !== 'confirmed') {
    throw createAppError(400, 'bad_request', `Cannot mark no-show: booking status is "${booking.status}"`);
  }

  booking.status = 'no_show';
  await booking.save();

  const table = booking.tableId as any;

  // Emit real-time event
  try {
    emitTableStatusChanged(restaurantId, {
      tableId: table._id.toString(),
      tableLabel: table.label,
      bookingId: booking._id.toString(),
      status: 'no_show',
    });
  } catch (err) {
    console.warn('Socket emit failed (non-critical):', err);
  }

  return {
    bookingId: booking._id,
    bookingCode: booking.bookingCode,
    status: booking.status,
  };
};
