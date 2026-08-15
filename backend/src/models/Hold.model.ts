import mongoose, { Document, Schema, Model } from 'mongoose';
import { HOLD_STATUSES, HoldStatus, HOLD_TTL_MS } from '../config/constants.js';

// ──────────────────────────────────────────────────────────────────────────────
// Interface
// ──────────────────────────────────────────────────────────────────────────────

export interface IHold extends Document {
  tableId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  slotStart: Date;
  slotEnd: Date;
  partySize: number;
  status: HoldStatus;
  createdAt: Date;
  /** Auto-deleted by MongoDB TTL index after this timestamp */
  expiresAt: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────────────────────────────────

const holdSchema = new Schema<IHold>(
  {
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slotStart: { type: Date, required: true },
    slotEnd: { type: Date, required: true },
    partySize: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: HOLD_STATUSES,
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + HOLD_TTL_MS),
    },
  },
  {
    timestamps: false, // manual createdAt
    versionKey: false,
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────────────────────────────────────

/**
 * TTL index: MongoDB auto-deletes hold documents after expiresAt (NFR-10).
 * expireAfterSeconds: 0 means "delete at the expiresAt date itself".
 */
holdSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Partial unique index — the double-booking guard for the hold phase.
 * Only one pending hold may exist per {tableId, slotStart}.
 * Inserting a second one throws E11000 → translate to 409 slot_unavailable.
 *
 * See database.md §4 and architecture.md §4.1.
 */
holdSchema.index(
  { tableId: 1, slotStart: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
    name: 'hold_pending_unique',
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────────────────────────────────────

export const Hold: Model<IHold> = mongoose.model<IHold>('Hold', holdSchema);
