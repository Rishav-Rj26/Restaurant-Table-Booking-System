import mongoose, { Document, Schema, Model } from 'mongoose';
import { STAFF_ROLES, StaffRole } from '../config/constants.js';

// ──────────────────────────────────────────────────────────────────────────────
// Interface
// ──────────────────────────────────────────────────────────────────────────────

export interface IStaff extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
  /** Restaurants this staff member belongs to (ref → Restaurant._id) */
  restaurants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────────────────────────────────

const staffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: STAFF_ROLES,
      required: true,
    },
    restaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────────────────────────────────────

export const Staff: Model<IStaff> = mongoose.model<IStaff>('Staff', staffSchema);
