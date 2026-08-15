import mongoose from 'mongoose';
import { Restaurant, IRestaurant } from '../models/Restaurant.model.js';
import { Table } from '../models/Table.model.js';
import { Staff } from '../models/Staff.model.js';
import { Booking } from '../models/Booking.model.js';
import { generateSlug } from '../utils/slug.js';
import { createAppError } from '../middleware/errorHandler.js';

export const createRestaurant = async (data: any, ownerId: string): Promise<IRestaurant> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug uniqueness
    while (await Restaurant.findOne({ slug }).session(session)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const { tables, ...restaurantData } = data;

    const restaurant = new Restaurant({
      ...restaurantData,
      slug,
      ownerId,
      status: 'active', // or 'pending' if approval is needed
    });

    await restaurant.save({ session });

    // Link owner to restaurant
    await Staff.findByIdAndUpdate(
      ownerId,
      { $addToSet: { restaurants: restaurant._id } },
      { session }
    );

    // Bulk create tables
    if (tables && tables.length > 0) {
      const tableDocs = tables.map((t: any) => ({
        restaurantId: restaurant._id,
        label: t.label,
        capacity: t.capacity,
        isActive: true,
      }));
      await Table.insertMany(tableDocs, { session });
    }

    await session.commitTransaction();
    return restaurant;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getRestaurant = async (id: string): Promise<IRestaurant> => {
  // Support lookup by both ID and slug
  const query = mongoose.Types.ObjectId.isValid(id) 
    ? { _id: id } 
    : { slug: id };

  const restaurant = await Restaurant.findOne(query);
  if (!restaurant) {
    throw createAppError(404, 'not_found', 'Restaurant not found');
  }

  return restaurant;
};

export const updateRestaurant = async (id: string, data: any): Promise<IRestaurant> => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    throw createAppError(404, 'not_found', 'Restaurant not found');
  }

  return restaurant;
};

export const getRestaurantBookings = async (
  restaurantId: string, 
  filters: { page?: number; limit?: number; status?: string; date?: string }
) => {
  const { page = 1, limit = 20, status, date } = filters;
  const skip = (page - 1) * limit;

  const query: any = { restaurantId };

  if (status) {
    query.status = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.slotStart = { $gte: startOfDay, $lte: endOfDay };
  }

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('tableId', 'label capacity')
      .sort({ slotStart: 1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query)
  ]);

  return {
    bookings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
