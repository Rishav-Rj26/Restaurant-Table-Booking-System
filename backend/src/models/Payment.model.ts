import mongoose, { Document, Schema, Model } from 'mongoose';
import { PAYMENT_STATUSES, PaymentStatus } from '../config/constants.js';

// ──────────────────────────────────────────────────────────────────────────────
// Interface
// ──────────────────────────────────────────────────────────────────────────────

export interface IPayment extends Document {
  bookingId?: mongoose.Types.ObjectId;
  holdId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  amount: number;   // in cents for Stripe; divide by 100 for display
  currency: string; // e.g. "usd"
  status: PaymentStatus;
  failureReason?: string;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────────────────────────────────

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },
    holdId: { type: Schema.Types.ObjectId, ref: 'Hold', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'usd' },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
      index: true,
    },
    failureReason: { type: String },
    refundedAmount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────────────────────────────────────

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
