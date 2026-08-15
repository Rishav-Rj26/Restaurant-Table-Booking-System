/**
 * Development seed script.
 *
 * Run with:  npm run seed
 *
 * Creates:
 *  - 2 diner users
 *  - 2 restaurant owners + 1 host
 *  - 3 restaurants (each with tables)
 *  - Sample bookings in various statuses (for analytics testing)
 *  - Sample payments tied to bookings
 *
 * Safe to run multiple times — drops all seeded collections first.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { Staff } from '../models/Staff.model.js';
import { Restaurant } from '../models/Restaurant.model.js';
import { Table } from '../models/Table.model.js';
import { Booking } from '../models/Booking.model.js';
import { Payment } from '../models/Payment.model.js';
import { Hold } from '../models/Hold.model.js';
import { BCRYPT_SALT_ROUNDS, DEFAULT_SLOT_DURATION_MINUTES } from '../config/constants.js';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(19, 0, 0, 0); // 7 PM
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(19, 0, 0, 0);
  return d;
}

/** Generate a short booking code: XX-SLUG-XXXX */
function makeBookingCode(slug: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const shortSlug = slug.split('-')[0].toUpperCase().slice(0, 8);
  return `${prefix}-${shortSlug}-${suffix}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Seed
// ──────────────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  await connectDB();
  console.log('\n🌱 Starting seed...\n');

  // ── Wipe existing data ─────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Staff.deleteMany({}),
    Restaurant.deleteMany({}),
    Table.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Hold.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', BCRYPT_SALT_ROUNDS);

  const [dana, alex] = await User.insertMany([
    {
      name: 'Dana Lee',
      email: 'dana@example.com',
      passwordHash,
      phone: '+1-555-0101',
      preferences: { cuisines: ['Italian', 'French'], dietary: ['vegetarian'] },
    },
    {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      passwordHash,
      phone: '+1-555-0102',
      preferences: { cuisines: ['Japanese', 'Korean'], dietary: [] },
    },
  ]);
  console.log(`👤 Users: ${dana.name}, ${alex.name}`);

  // ── Staff ──────────────────────────────────────────────────────────────────
  const [omar, priya, hana] = await Staff.insertMany([
    { name: 'Omar Hassan', email: 'omar@example.com', passwordHash, role: 'owner', restaurants: [] },
    { name: 'Priya Patel', email: 'priya@example.com', passwordHash, role: 'owner', restaurants: [] },
    { name: 'Hana Kim', email: 'hana@example.com', passwordHash, role: 'host', restaurants: [] },
  ]);
  console.log(`👨‍💼 Staff: ${omar.name}, ${priya.name}, ${hana.name}`);

  // ── Restaurants ────────────────────────────────────────────────────────────
  const restaurantDefs = [
    {
      name: 'La Maison',
      ownerId: omar._id,
      address: {
        line1: '123 Vine Street',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90028',
        country: 'US',
        location: { type: 'Point' as const, coordinates: [-118.3267, 34.1019] },
      },
      contact: { phone: '+1-555-0201', email: 'hello@lamaison.com' },
      cuisineTypes: ['French', 'Mediterranean'],
      ambiance: 'fine_dining' as const,
      dietaryOptions: ['vegetarian', 'gluten_free'],
      operatingHours: [
        { day: 1, openTime: '17:00', closeTime: '23:00' },
        { day: 2, openTime: '17:00', closeTime: '23:00' },
        { day: 3, openTime: '17:00', closeTime: '23:00' },
        { day: 4, openTime: '17:00', closeTime: '23:00' },
        { day: 5, openTime: '17:00', closeTime: '00:00' },
        { day: 6, openTime: '12:00', closeTime: '00:00' },
      ],
      bookingFee: { amount: 10, currency: 'usd' },
      cancellationPolicy: { hoursBeforeForRefund: 24 },
      photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
      status: 'active' as const,
      slug: '',
    },
    {
      name: 'Sakura Garden',
      ownerId: priya._id,
      address: {
        line1: '456 Blossom Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
        country: 'US',
        location: { type: 'Point' as const, coordinates: [-122.4194, 37.7749] },
      },
      contact: { phone: '+1-555-0202', email: 'info@sakuragarden.com' },
      cuisineTypes: ['Japanese'],
      ambiance: 'casual' as const,
      dietaryOptions: ['vegetarian', 'vegan', 'gluten_free'],
      operatingHours: [
        { day: 0, openTime: '11:00', closeTime: '22:00' },
        { day: 1, openTime: '11:00', closeTime: '22:00' },
        { day: 2, openTime: '11:00', closeTime: '22:00' },
        { day: 3, openTime: '11:00', closeTime: '22:00' },
        { day: 4, openTime: '11:00', closeTime: '22:00' },
        { day: 5, openTime: '11:00', closeTime: '23:00' },
        { day: 6, openTime: '11:00', closeTime: '23:00' },
      ],
      bookingFee: { amount: 5, currency: 'usd' },
      cancellationPolicy: { hoursBeforeForRefund: 12 },
      photos: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800'],
      status: 'active' as const,
      slug: '',
    },
    {
      name: 'The Rustic Table',
      ownerId: omar._id,
      address: {
        line1: '789 Oak Road',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'US',
        location: { type: 'Point' as const, coordinates: [-97.7431, 30.2672] },
      },
      contact: { phone: '+1-555-0203', email: 'hello@rustictable.com' },
      cuisineTypes: ['American', 'Fusion'],
      ambiance: 'family_friendly' as const,
      dietaryOptions: ['vegetarian', 'halal'],
      operatingHours: [
        { day: 1, openTime: '11:00', closeTime: '21:00' },
        { day: 2, openTime: '11:00', closeTime: '21:00' },
        { day: 3, openTime: '11:00', closeTime: '21:00' },
        { day: 4, openTime: '11:00', closeTime: '21:00' },
        { day: 5, openTime: '11:00', closeTime: '22:00' },
        { day: 6, openTime: '11:00', closeTime: '22:00' },
        { day: 0, openTime: '12:00', closeTime: '20:00' },
      ],
      bookingFee: { amount: 3, currency: 'usd' },
      cancellationPolicy: { hoursBeforeForRefund: 6 },
      photos: ['https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800'],
      status: 'active' as const,
      slug: '',
    },
  ];

  // Assign slugs
  for (const r of restaurantDefs) {
    r.slug = slugify(r.name);
  }

  const [lamaison, sakura, rustic] = await Restaurant.insertMany(restaurantDefs);
  console.log(`🏠 Restaurants: ${lamaison.name}, ${sakura.name}, ${rustic.name}`);

  // Link staff → restaurants
  await Staff.findByIdAndUpdate(omar._id, { restaurants: [lamaison._id, rustic._id] });
  await Staff.findByIdAndUpdate(priya._id, { restaurants: [sakura._id] });
  await Staff.findByIdAndUpdate(hana._id, { restaurants: [lamaison._id] });

  // ── Tables ─────────────────────────────────────────────────────────────────
  const tableDefs = [
    // La Maison — upscale, smaller tables
    { restaurantId: lamaison._id, label: 'T-1', capacity: 2 },
    { restaurantId: lamaison._id, label: 'T-2', capacity: 2 },
    { restaurantId: lamaison._id, label: 'T-3', capacity: 4 },
    { restaurantId: lamaison._id, label: 'T-4', capacity: 4 },
    { restaurantId: lamaison._id, label: 'T-5', capacity: 6 },
    // Sakura Garden — mix
    { restaurantId: sakura._id, label: 'S-1', capacity: 2 },
    { restaurantId: sakura._id, label: 'S-2', capacity: 4 },
    { restaurantId: sakura._id, label: 'S-3', capacity: 4 },
    { restaurantId: sakura._id, label: 'S-4', capacity: 6 },
    { restaurantId: sakura._id, label: 'S-5', capacity: 8 },
    // Rustic Table — family friendly, larger tables
    { restaurantId: rustic._id, label: 'R-1', capacity: 4 },
    { restaurantId: rustic._id, label: 'R-2', capacity: 4 },
    { restaurantId: rustic._id, label: 'R-3', capacity: 6 },
    { restaurantId: rustic._id, label: 'R-4', capacity: 8 },
    { restaurantId: rustic._id, label: 'R-5', capacity: 8 },
  ];

  const tables = await Table.insertMany(tableDefs);
  console.log(`🪑 Tables: ${tables.length} created`);

  const lamaisonTables = tables.filter(t => t.restaurantId.equals(lamaison._id));
  const sakuraTables = tables.filter(t => t.restaurantId.equals(sakura._id));
  const rusticTables = tables.filter(t => t.restaurantId.equals(rustic._id));

  // ── Bookings + Payments (historical for analytics) ─────────────────────────
  const bookingDocs: Parameters<typeof Booking.insertMany>[0] = [];
  const paymentDocs: Parameters<typeof Payment.insertMany>[0] = [];

  const statuses = ['confirmed', 'present', 'present', 'present', 'no_show'] as const;

  // 30 days of historical bookings across all restaurants
  for (let day = 30; day >= 1; day--) {
    const slots = [
      daysAgo(day),
      (() => { const d = daysAgo(day); d.setHours(20, 0, 0, 0); return d; })(),
    ];

    for (const slot of slots) {
      // La Maison — 2 bookings per slot
      for (let i = 0; i < 2; i++) {
        const table = lamaisonTables[i % lamaisonTables.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentId = new mongoose.Types.ObjectId();
        const bookingId = new mongoose.Types.ObjectId();
        const code = makeBookingCode(lamaison.slug);

        bookingDocs.push({
          _id: bookingId,
          bookingCode: `${code}-${day}-${i}`,
          qrCodeUrl: `data:image/png;base64,PLACEHOLDER`,
          userId: i % 2 === 0 ? dana._id : alex._id,
          restaurantId: lamaison._id,
          tableId: table._id,
          slotStart: slot,
          slotEnd: addMinutes(slot, DEFAULT_SLOT_DURATION_MINUTES),
          partySize: 2 + (i % 3),
          status,
          paymentId,
          checkedInAt: status === 'present' ? addMinutes(slot, -5) : undefined,
          source: 'web',
          createdAt: new Date(slot.getTime() - 48 * 60 * 60 * 1000), // booked 2 days ahead
          updatedAt: slot,
        });

        paymentDocs.push({
          _id: paymentId,
          bookingId,
          holdId: new mongoose.Types.ObjectId(),
          userId: i % 2 === 0 ? dana._id : alex._id,
          restaurantId: lamaison._id,
          stripePaymentIntentId: `pi_seed_lamaison_${day}_${i}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          amount: 1000, // $10 in cents
          currency: 'usd',
          status: 'succeeded',
        });
      }

      // Sakura — 1 booking per slot
      {
        const table = sakuraTables[day % sakuraTables.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentId = new mongoose.Types.ObjectId();
        const bookingId = new mongoose.Types.ObjectId();
        const code = makeBookingCode(sakura.slug);

        bookingDocs.push({
          _id: bookingId,
          bookingCode: `${code}-${day}`,
          qrCodeUrl: `data:image/png;base64,PLACEHOLDER`,
          userId: dana._id,
          restaurantId: sakura._id,
          tableId: table._id,
          slotStart: slot,
          slotEnd: addMinutes(slot, DEFAULT_SLOT_DURATION_MINUTES),
          partySize: 2,
          status,
          paymentId,
          checkedInAt: status === 'present' ? addMinutes(slot, -3) : undefined,
          source: 'web',
          createdAt: new Date(slot.getTime() - 24 * 60 * 60 * 1000),
          updatedAt: slot,
        });

        paymentDocs.push({
          _id: paymentId,
          bookingId,
          holdId: new mongoose.Types.ObjectId(),
          userId: dana._id,
          restaurantId: sakura._id,
          stripePaymentIntentId: `pi_seed_sakura_${day}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          amount: 500,
          currency: 'usd',
          status: 'succeeded',
        });
      }
    }
  }

  // Upcoming bookings (next 7 days)
  for (let day = 1; day <= 7; day++) {
    const slot = daysFromNow(day);
    const table = lamaisonTables[day % lamaisonTables.length];
    const paymentId = new mongoose.Types.ObjectId();
    const bookingId = new mongoose.Types.ObjectId();

    bookingDocs.push({
      _id: bookingId,
      bookingCode: `UP-LAMAISON-${day}00${day}`,
      qrCodeUrl: `data:image/png;base64,PLACEHOLDER`,
      userId: dana._id,
      restaurantId: lamaison._id,
      tableId: table._id,
      slotStart: slot,
      slotEnd: addMinutes(slot, DEFAULT_SLOT_DURATION_MINUTES),
      partySize: 2,
      status: 'confirmed',
      paymentId,
      source: 'web',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    paymentDocs.push({
      _id: paymentId,
      bookingId,
      holdId: new mongoose.Types.ObjectId(),
      userId: dana._id,
      restaurantId: lamaison._id,
      stripePaymentIntentId: `pi_seed_upcoming_${day}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
    });
  }

  await Booking.insertMany(bookingDocs, { ordered: false });
  await Payment.insertMany(paymentDocs, { ordered: false });
  console.log(`📋 Bookings: ${bookingDocs.length} created`);
  console.log(`💳 Payments: ${paymentDocs.length} created`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Test credentials (password: Password123!)');
  console.log('─────────────────────────────────────────');
  console.log('  Diner:  dana@example.com');
  console.log('  Diner:  alex@example.com');
  console.log('  Owner:  omar@example.com  (La Maison, The Rustic Table)');
  console.log('  Owner:  priya@example.com (Sakura Garden)');
  console.log('  Host:   hana@example.com  (La Maison)');
  console.log('─────────────────────────────────────────\n');

  await disconnectDB();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
