import mongoose from 'mongoose';
import { Booking } from '../models/Booking.model.js';
import { Payment } from '../models/Payment.model.js';
import { createAppError } from '../middleware/errorHandler.js';

export const getOverview = async (
  restaurantId: string,
  fromDate: string,
  toDate: string
) => {
  const restId = new mongoose.Types.ObjectId(restaurantId);
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  const dateMatch = {
    restaurantId: restId,
    slotStart: { $gte: from, $lte: to },
  };

  // Run all aggregation pipelines in parallel
  const [
    turnoverByHour,
    peakHours,
    revenue,
    avgPartySize,
    avgLeadTime,
    noShowRate,
    statusBreakdown,
    totalBookings,
  ] = await Promise.all([
    // ── Turnover by hour ──
    Booking.aggregate([
      { $match: { ...dateMatch, status: { $in: ['confirmed', 'present', 'no_show'] } } },
      {
        $group: {
          _id: { $hour: '$slotStart' },
          count: { $sum: 1 },
          avgDurationMin: {
            $avg: {
              $divide: [{ $subtract: ['$slotEnd', '$slotStart'] }, 60000],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { hour: '$_id', count: 1, avgDurationMin: { $round: ['$avgDurationMin', 0] }, _id: 0 } },
    ]),

    // ── Peak hours (by day-of-week + hour) ──
    Booking.aggregate([
      { $match: { ...dateMatch, status: { $in: ['confirmed', 'present'] } } },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$slotStart' }, // 1=Sun … 7=Sat
            hour: { $hour: '$slotStart' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { dayOfWeek: '$_id.dayOfWeek', hour: '$_id.hour', count: 1, _id: 0 } },
    ]),

    // ── Revenue by day ──
    Payment.aggregate([
      {
        $lookup: {
          from: 'holds',
          localField: 'holdId',
          foreignField: '_id',
          as: 'hold',
        },
      },
      { $unwind: '$hold' },
      {
        $match: {
          'hold.restaurantId': restId,
          status: 'succeeded',
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', totalAmount: { $round: ['$totalAmount', 2] }, count: 1, _id: 0 } },
    ]),

    // ── Avg party size ──
    Booking.aggregate([
      { $match: { ...dateMatch, status: { $in: ['confirmed', 'present', 'no_show'] } } },
      { $group: { _id: null, avg: { $avg: '$partySize' } } },
    ]),

    // ── Avg lead time (hours between createdAt → slotStart) ──
    Booking.aggregate([
      { $match: { ...dateMatch, status: { $in: ['confirmed', 'present'] } } },
      {
        $group: {
          _id: null,
          avg: {
            $avg: {
              $divide: [{ $subtract: ['$slotStart', '$createdAt'] }, 3600000],
            },
          },
        },
      },
    ]),

    // ── No-show rate ──
    Booking.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] },
          },
        },
      },
    ]),

    // ── Status breakdown ──
    Booking.aggregate([
      { $match: dateMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]),

    // ── Total bookings ──
    Booking.countDocuments(dateMatch),
  ]);

  // ── Staffing recommendation heuristic ──
  // 1 host per 10 bookings/hr peak, 1 server per 4 active tables
  const peakHourCount = peakHours.length > 0 ? peakHours[0].count : 0;
  const staffingRecommendation = {
    hosts: Math.max(1, Math.ceil(peakHourCount / 10)),
    servers: Math.max(1, Math.ceil(peakHourCount / 4)),
    peakHourReference: peakHours.length > 0
      ? { dayOfWeek: peakHours[0].dayOfWeek, hour: peakHours[0].hour, bookings: peakHours[0].count }
      : null,
  };

  return {
    period: { from: fromDate, to: toDate },
    totalBookings,
    turnoverByHour,
    peakHours,
    revenue,
    avgPartySize: avgPartySize.length > 0 ? Math.round(avgPartySize[0].avg * 10) / 10 : 0,
    avgLeadTimeHours: avgLeadTime.length > 0 ? Math.round(avgLeadTime[0].avg * 10) / 10 : 0,
    noShowRate: noShowRate.length > 0 && noShowRate[0].total > 0
      ? Math.round((noShowRate[0].noShows / noShowRate[0].total) * 1000) / 10 // percentage with 1 decimal
      : 0,
    statusBreakdown,
    staffingRecommendation,
  };
};
