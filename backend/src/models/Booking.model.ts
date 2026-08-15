import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  BOOKING_STATUSES,
  BOOKING_SOURCES,
  BookingStatus,
  BookingSource,
} from '../config/constants.js';

// ──────────────────────────────────────────────────────────────────────────────
// Interface
// ──────────────────────────────────────────────────────────────────────────────

export interface IBooking extends Document {
  /** Unique human-readable code, e.g. "LA-BISTRO-8F3K" */
  bookingCode: string;
  /** Base64 data URL or stored URL of the QR image */
  qrCodeUrl: string;
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  slotStart: Date;
  slotEnd: Date;
  partySize: number;
  status: BookingStatus;
  paymentId?: mongoose.Types.ObjectId;
  checkedInAt?: Date;
  cancelledAt?: Date;
  source: BookingSource;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────────────────────────────────

const bookingSchema = new Schema<IBooking>(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    qrCodeUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    slotStart: { type: Date, required: true },
    slotEnd: { type: Date, required: true },
    partySize: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'confirmed',
      index: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    checkedInAt: { type: Date },
    cancelledAt: { type: Date },
    source: {
      type: String,
      enum: BOOKING_SOURCES,
      default: 'web',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Authoritative double-booking guard (database.md §4).
 * Only one confirmed/present booking may exist per {tableId, slotStart}.
 * E11000 on insert → translate to 409.
 */
bookingSchema.index(
  { tableId: 1, slotStart: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['confirmed', 'present'] } },
    name: 'booking_active_unique',
  }
);

// Dashboard / restaurant owner queries
bookingSchema.index({ restaurantId: 1, slotStart: 1 });

// "My bookings" user queries — newest first
bookingSchema.index({ userId: 1, slotStart: -1 });

// ──────────────────────────────────────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────────────────────────────────────

export const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);
