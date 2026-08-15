import mongoose, { Document, Schema, Model } from 'mongoose';

// ──────────────────────────────────────────────────────────────────────────────
// Interface
// ──────────────────────────────────────────────────────────────────────────────

export interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId;
  label: string; // e.g. "T-12"
  capacity: number; // seats
  isActive: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────────────────────────────────

const tableSchema = new Schema<ITable>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: false, // tables are lightweight config — no timestamps needed
    versionKey: false,
  }
);

// Compound index to speed up availability queries filtered by capacity
tableSchema.index({ restaurantId: 1, capacity: 1 });

// ──────────────────────────────────────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────────────────────────────────────

export const Table: Model<ITable> = mongoose.model<ITable>('Table', tableSchema);
