// ===== Cuisine Types =====
export const CUISINE_TYPES = [
  'Italian',
  'French',
  'Indian',
  'Chinese',
  'Japanese',
  'Mexican',
  'Thai',
  'Mediterranean',
  'American',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'Middle Eastern',
  'Ethiopian',
  'Caribbean',
  'British',
  'German',
  'Brazilian',
  'Fusion',
] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];

// ===== Ambiance Types =====
export const AMBIANCE_TYPES = [
  'fine_dining',
  'casual',
  'family_friendly',
  'cafe',
  'bar',
] as const;

export type AmbianceType = (typeof AMBIANCE_TYPES)[number];

// ===== Dietary Options =====
export const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten_free',
  'halal',
  'kosher',
  'nut_free',
  'dairy_free',
] as const;

export type DietaryOption = (typeof DIETARY_OPTIONS)[number];

// ===== Booking Statuses =====
export const BOOKING_STATUSES = [
  'confirmed',
  'present',
  'no_show',
  'cancelled',
  'refunded',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// ===== Hold Statuses =====
export const HOLD_STATUSES = [
  'pending',
  'converted',
  'expired',
] as const;

export type HoldStatus = (typeof HOLD_STATUSES)[number];

// ===== Payment Statuses =====
export const PAYMENT_STATUSES = [
  'pending',
  'succeeded',
  'failed',
  'refunded',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ===== Staff Roles =====
export const STAFF_ROLES = [
  'owner',
  'manager',
  'host',
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

// ===== Account Types =====
export const ACCOUNT_TYPES = [
  'user',
  'staff',
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

// ===== Restaurant Statuses =====
export const RESTAURANT_STATUSES = [
  'active',
  'pending',
  'suspended',
] as const;

export type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number];

// ===== Booking Sources =====
export const BOOKING_SOURCES = [
  'web',
  'mobile',
] as const;

export type BookingSource = (typeof BOOKING_SOURCES)[number];

// ===== Time Constants =====
/** Hold TTL in milliseconds (10 minutes) */
export const HOLD_TTL_MS = 10 * 60 * 1000;

/** Default slot duration in minutes */
export const DEFAULT_SLOT_DURATION_MINUTES = 90;

/** Hold expiry warning threshold in seconds (warn at 60s before expiry) */
export const HOLD_EXPIRY_WARNING_SECONDS = 60;

// ===== Pagination Defaults =====
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ===== Bcrypt =====
export const BCRYPT_SALT_ROUNDS = 12;
