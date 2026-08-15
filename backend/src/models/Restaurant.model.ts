import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  CUISINE_TYPES,
  AMBIANCE_TYPES,
  DIETARY_OPTIONS,
  RESTAURANT_STATUSES,
  AmbianceType,
  RestaurantStatus,
} from '../config/constants.js';

// ──────────────────────────────────────────────────────────────────────────────
// Interface
// ──────────────────────────────────────────────────────────────────────────────

export interface IOperatingHour {
  day: number; // 0=Sun … 6=Sat
  openTime: string; // "17:00"
  closeTime: string; // "23:00"
}

export interface IRestaurant extends Document {
  name: string;
  /** URL-safe unique identifier — used in booking codes */
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  contact: {
    phone?: string;
    email?: string;
  };
  cuisineTypes: string[];
  ambiance: AmbianceType;
  dietaryOptions: string[];
  operatingHours: IOperatingHour[];
  bookingFee: {
    amount: number;
    currency: string;
  };
  cancellationPolicy: {
    hoursBeforeForRefund: number;
  };
  photos: string[];
  ratingAvg: number;
  ratingCount: number;
  status: RestaurantStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────────────────────────────────

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true, default: 'US' },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
        },
      },
    },
    contact: {
      phone: { type: String },
      email: { type: String },
    },
    cuisineTypes: {
      type: [String],
      enum: CUISINE_TYPES,
      default: [],
    },
    ambiance: {
      type: String,
      enum: AMBIANCE_TYPES,
      required: true,
    },
    dietaryOptions: {
      type: [String],
      enum: DIETARY_OPTIONS,
      default: [],
    },
    operatingHours: [
      {
        day: { type: Number, min: 0, max: 6, required: true },
        openTime: { type: String, required: true },
        closeTime: { type: String, required: true },
      },
    ],
    bookingFee: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'usd' },
    },
    cancellationPolicy: {
      hoursBeforeForRefund: { type: Number, default: 24 },
    },
    photos: { type: [String], default: [] },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: RESTAURANT_STATUSES,
      default: 'pending',
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

// 2dsphere for geo-search (FR-3.1)
restaurantSchema.index({ 'address.location': '2dsphere' });

// Compound filter index to speed up search-by-cuisine/ambiance/dietary
restaurantSchema.index({ cuisineTypes: 1, ambiance: 1, dietaryOptions: 1 });

// ──────────────────────────────────────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────────────────────────────────────

export const Restaurant: Model<IRestaurant> = mongoose.model<IRestaurant>(
  'Restaurant',
  restaurantSchema
);
