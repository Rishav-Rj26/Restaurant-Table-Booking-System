import mongoose, { Document, Schema, Model } from 'mongoose';
import { DIETARY_OPTIONS, CUISINE_TYPES } from '../config/constants.js';

// ──────────────────────────────────────────────────────────────────────────────
// Interface
// ──────────────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string | null;
  phone?: string;
  preferences: {
    cuisines: string[];
    dietary: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
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
    passwordHash: { type: String, default: null },
    phone: { type: String, trim: true },
    preferences: {
      cuisines: {
        type: [String],
        enum: CUISINE_TYPES,
        default: [],
      },
      dietary: {
        type: [String],
        enum: DIETARY_OPTIONS,
        default: [],
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────────────────────────────────────

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
