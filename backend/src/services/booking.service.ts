import mongoose from 'mongoose';
import { Hold } from '../models/Hold.model.js';
import { Booking } from '../models/Booking.model.js';
import { Restaurant } from '../models/Restaurant.model.js';
import { User } from '../models/User.model.js';
import { generateBookingCode } from '../utils/bookingCode.js';
import { generateQRCode } from './qrcode.service.js';
import { sendBookingConfirmation, sendCancellationConfirmation } from './email.service.js';
import { createAppError } from '../middleware/errorHandler.js';
import { DEFAULT_SLOT_DURATION_MINUTES, HOLD_TTL_MS } from '../config/constants.js';
import { emitBookingConfirmed } from '../sockets/tableStatus.js';

export const createHold = async (
  userId: string,
  restaurantId: string,
  tableId: string,
  slotStartStr: string,
  partySize: number
) => {
  const slotStart = new Date(slotStartStr);
  if (Number.isNaN(slotStart.getTime()) || slotStart <= new Date()) {
    throw createAppError(400, 'bad_request', 'Booking time must be a valid future date');
  }
  const slotEnd = new Date(slotStart.getTime() + DEFAULT_SLOT_DURATION_MINUTES * 60000);
  const expiresAt = new Date(Date.now() + HOLD_TTL_MS);

  try {
    const hold = new Hold({
      userId,
      restaurantId,
      tableId,
      slotStart,
      slotEnd,
      partySize,
      status: 'pending',
      expiresAt,
    });

    await hold.save();

    return {
      holdId: hold._id,
      expiresAt: hold.expiresAt,
    };
  } catch (error: any) {
    if (error.code === 11000) {
      // E11000 duplicate key error on the partial unique index
      throw createAppError(409, 'conflict', 'This slot is no longer available');
    }
    throw error;
  }
};

export const confirmBooking = async (
  holdId: string,
  paymentId: string | null,
  session?: mongoose.ClientSession
) => {
  const hold = await Hold.findById(holdId).session(session || null);
  
  if (!hold) {
    throw createAppError(404, 'not_found', 'Hold not found');
  }

  if (hold.status !== 'pending') {
    throw createAppError(400, 'bad_request', 'Hold is not pending');
  }

  const restaurant = await Restaurant.findById(hold.restaurantId).session(session || null);
  if (!restaurant) {
    throw createAppError(404, 'not_found', 'Restaurant not found');
  }

  const user = await User.findById(hold.userId).session(session || null);
  if (!user) {
    throw createAppError(404, 'not_found', 'User not found');
  }

  // Generate unique code
  const bookingCode = await generateBookingCode(restaurant.slug);

  // Generate QR Code
  // Note: Generate QR requires bookingId. We can generate an ObjectId first.
  const bookingId = new mongoose.Types.ObjectId();
  const qrCodeUrl = await generateQRCode(bookingId.toString(), bookingCode);

  const booking = new Booking({
    _id: bookingId,
    bookingCode,
    qrCodeUrl,
    userId: hold.userId,
    restaurantId: hold.restaurantId,
    tableId: hold.tableId,
    slotStart: hold.slotStart,
    slotEnd: hold.slotEnd,
    partySize: hold.partySize,
    status: 'confirmed',
    paymentId: paymentId || undefined,
  });

  try {
    await booking.save({ session });
  } catch (error: any) {
    if (error.code === 11000) {
      throw createAppError(409, 'conflict', 'This slot has already been booked');
    }
    throw error;
  }

  // Mark hold as converted
  hold.status = 'converted';
  await hold.save({ session });

  // Send confirmation email asynchronously (do not block transaction)
  sendBookingConfirmation(user, booking, restaurant, qrCodeUrl).catch(console.error);

  // Realtime updates are best-effort: a socket outage must not roll back a
  // successful, already-persisted reservation.
  try {
    emitBookingConfirmed(hold.restaurantId.toString(), {
      bookingId: booking._id.toString(),
      tableId: hold.tableId.toString(),
      slotStart: booking.slotStart,
      slotEnd: booking.slotEnd,
      partySize: booking.partySize,
      status: booking.status,
    });
  } catch (error) {
    console.error('Failed to broadcast booking confirmation:', error);
  }

  return booking;
};

export const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw createAppError(404, 'not_found', 'Booking not found');
  }

  if (booking.userId.toString() !== userId) {
    // Assuming we only allow the user to cancel their own booking via this function. 
    // Staff might have a different route/service or bypass this check.
    throw createAppError(403, 'forbidden', 'You cannot cancel this booking');
  }

  if (booking.status !== 'confirmed') {
    throw createAppError(400, 'bad_request', 'Booking cannot be cancelled');
  }

  const restaurant = await Restaurant.findById(booking.restaurantId);
  if (!restaurant) {
    throw createAppError(404, 'not_found', 'Restaurant not found');
  }

  // Check cancellation policy
  const hoursUntilBooking = (booking.slotStart.getTime() - Date.now()) / (1000 * 60 * 60);
  const eligibleForRefund = hoursUntilBooking >= restaurant.cancellationPolicy.hoursBeforeForRefund;

  booking.status = 'cancelled';
  await booking.save();

  // If eligible, trigger refund in payment service
  if (eligibleForRefund && booking.paymentId) {
    // Import dynamically to avoid circular dependencies if any
    const paymentService = await import('./payment.service.js');
    try {
      await paymentService.refundPayment(booking.paymentId.toString());
    } catch (error) {
      console.error('Failed to refund payment for cancelled booking:', error);
      // We don't fail the cancellation, but log the error for manual review.
    }
  }

  // Send cancellation email
  const user = await User.findById(booking.userId);
  if (user) {
    sendCancellationConfirmation(user, booking, restaurant).catch(console.error);
  }

  return { booking, eligibleForRefund };
};

export const getUserBookings = async (userId: string, status?: string) => {
  const query: any = { userId };
  
  if (status === 'upcoming') {
    query.status = 'confirmed';
    query.slotStart = { $gte: new Date() };
  } else if (status === 'past') {
    query.status = { $in: ['confirmed', 'present', 'no_show', 'cancelled'] };
    query.slotStart = { $lt: new Date() };
  }

  const bookings = await Booking.find(query)
    .populate('restaurantId', 'name address photos')
    .sort({ slotStart: status === 'upcoming' ? 1 : -1 });

  return bookings;
};
