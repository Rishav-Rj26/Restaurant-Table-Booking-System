import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.model.js';
import { Table } from '../models/Table.model.js';
import { Hold } from '../models/Hold.model.js';
import { Booking } from '../models/Booking.model.js';
import { DEFAULT_SLOT_DURATION_MINUTES } from '../config/constants.js';

export const getAvailableSlots = async (
  restaurantId: string,
  dateStr: string, // YYYY-MM-DD
  partySize: number
) => {
  // Query tables with capacity >= partySize
  const tables = await Table.find({ 
    restaurantId, 
    capacity: { $gte: partySize },
    isActive: true 
  });

  if (tables.length === 0) {
    return []; // No tables big enough
  }

  const tableIds = tables.map(t => t._id);

  // Parse start and end of the date
  const startDate = new Date(dateStr);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateStr);
  endDate.setHours(23, 59, 59, 999);

  // Find all active holds and confirmed/present bookings for these tables on this date
  const [holds, bookings] = await Promise.all([
    Hold.find({
      tableId: { $in: tableIds },
      status: 'pending',
      slotStart: { $gte: startDate, $lt: endDate }
    }),
    Booking.find({
      tableId: { $in: tableIds },
      status: { $in: ['confirmed', 'present'] },
      slotStart: { $gte: startDate, $lt: endDate }
    })
  ]);

  // For this basic implementation, we will just return fixed slots for the operating hours
  // of the restaurant for the given date.
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return [];

  const dayOfWeek = startDate.getDay();
  const operatingHour = restaurant.operatingHours.find(h => h.day === dayOfWeek);
  
  if (!operatingHour) return []; // Closed on this day

  const [openHour, openMin] = operatingHour.openTime.split(':').map(Number);
  const [closeHour, closeMin] = operatingHour.closeTime.split(':').map(Number);

  const availableSlots: { time: string; tableId: string; }[] = [];
  
  let currentSlot = new Date(startDate);
  currentSlot.setHours(openHour, openMin, 0, 0);

  const closeTime = new Date(startDate);
  closeTime.setHours(closeHour, closeMin, 0, 0);

  // Generate slots every 30 minutes
  while (currentSlot < closeTime) {
    const slotEnd = new Date(currentSlot.getTime() + DEFAULT_SLOT_DURATION_MINUTES * 60000);
    
    // Find an available table for this slot
    for (const table of tables) {
      // Check if table is occupied by a hold
      const hasHold = holds.some(h => 
        h.tableId.toString() === table._id.toString() &&
        (h.slotStart < slotEnd && h.slotEnd > currentSlot)
      );

      // Check if table is occupied by a booking
      const hasBooking = bookings.some(b => 
        b.tableId.toString() === table._id.toString() &&
        (b.slotStart < slotEnd && b.slotEnd > currentSlot)
      );

      if (!hasHold && !hasBooking) {
        // Table is available
        const timeStr = currentSlot.toTimeString().substring(0, 5); // HH:mm
        // Prevent duplicate times in the available slots list
        if (!availableSlots.some(s => s.time === timeStr)) {
           availableSlots.push({ time: timeStr, tableId: table._id.toString() });
        }
        break; // Only need one available table per time slot
      }
    }
    
    // Move to next 30-min interval
    currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
  }

  return availableSlots;
};

export const searchRestaurants = async (filters: any) => {
  const { lat, lng, radiusKm, cuisine, ambiance, dietary, page, limit } = filters;
  const skip = (page - 1) * limit;

  const query: any = { status: 'active' };

  if (lat !== undefined && lng !== undefined) {
    query['address.location'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: (radiusKm || 10) * 1000 // Convert km to meters
      }
    };
  }

  if (cuisine && cuisine.length > 0) {
    query.cuisineTypes = { $in: cuisine };
  }

  if (ambiance) {
    query.ambiance = ambiance;
  }

  if (dietary && dietary.length > 0) {
    query.dietaryOptions = { $all: dietary };
  }

  const [restaurants, total] = await Promise.all([
    Restaurant.find(query).skip(skip).limit(limit),
    Restaurant.countDocuments(query)
  ]);

  // Note: True availability checking per restaurant during search is complex and resource-intensive.
  // In a full production app, we would use Elasticsearch or complex aggregations.
  // For this MVP, we return restaurants that match the static filters.

  return {
    restaurants,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
