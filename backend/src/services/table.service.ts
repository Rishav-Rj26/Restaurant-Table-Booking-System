import mongoose from 'mongoose';
import { Table, ITable } from '../models/Table.model.js';
import { Restaurant } from '../models/Restaurant.model.js';
import { createAppError } from '../middleware/errorHandler.js';

export const getTables = async (restaurantId: string): Promise<ITable[]> => {
  return Table.find({ restaurantId }).sort({ label: 1 });
};

export const addTable = async (restaurantId: string, data: { label: string; capacity: number }): Promise<ITable> => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw createAppError(404, 'not_found', 'Restaurant not found');
  }

  // Check if table with same label already exists for this restaurant
  const existingTable = await Table.findOne({ restaurantId, label: data.label });
  if (existingTable) {
    throw createAppError(400, 'bad_request', 'A table with this label already exists');
  }

  const table = new Table({
    restaurantId,
    label: data.label,
    capacity: data.capacity,
    isActive: true
  });

  await table.save();
  return table;
};

export const updateTable = async (
  restaurantId: string,
  tableId: string,
  data: { label?: string; capacity?: number; isActive?: boolean }
): Promise<ITable> => {
  const table = await Table.findOne({ _id: tableId, restaurantId });
  
  if (!table) {
    throw createAppError(404, 'not_found', 'Table not found for this restaurant');
  }

  if (data.label && data.label !== table.label) {
    const existingTable = await Table.findOne({ restaurantId, label: data.label });
    if (existingTable) {
      throw createAppError(400, 'bad_request', 'A table with this label already exists');
    }
    table.label = data.label;
  }

  if (data.capacity !== undefined) {
    table.capacity = data.capacity;
  }

  if (data.isActive !== undefined) {
    table.isActive = data.isActive;
  }

  await table.save();
  return table;
};
