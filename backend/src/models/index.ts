/**
 * Barrel export for all Mongoose models.
 * Import from here instead of individual model files to avoid circular deps.
 */
export { User } from './User.model.js';
export { Staff } from './Staff.model.js';
export { Restaurant } from './Restaurant.model.js';
export { Table } from './Table.model.js';
export { Hold } from './Hold.model.js';
export { Booking } from './Booking.model.js';
export { Payment } from './Payment.model.js';

// Re-export interfaces for convenience
export type { IUser } from './User.model.js';
export type { IStaff } from './Staff.model.js';
export type { IRestaurant, IOperatingHour } from './Restaurant.model.js';
export type { ITable } from './Table.model.js';
export type { IHold } from './Hold.model.js';
export type { IBooking } from './Booking.model.js';
export type { IPayment } from './Payment.model.js';
