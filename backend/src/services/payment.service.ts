import mongoose from 'mongoose';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import { Hold } from '../models/Hold.model.js';
import { Payment } from '../models/Payment.model.js';
import { Restaurant } from '../models/Restaurant.model.js';
import { createAppError } from '../middleware/errorHandler.js';
import * as bookingService from './booking.service.js';

// Requires STRIPE_SECRET_KEY in env
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

export const createPaymentIntent = async (holdId: string, userId: string) => {
  const hold = await Hold.findById(holdId);
  if (!hold) {
    throw createAppError(404, 'not_found', 'Hold not found');
  }

  if (hold.userId.toString() !== userId) {
    throw createAppError(403, 'forbidden', 'Hold belongs to another user');
  }

  if (hold.status !== 'pending') {
    throw createAppError(400, 'bad_request', 'Hold is no longer pending');
  }

  const restaurant = await Restaurant.findById(hold.restaurantId);
  if (!restaurant) {
    throw createAppError(404, 'not_found', 'Restaurant not found');
  }

  const { amount, currency } = restaurant.bookingFee;

  // If amount is 0, we could skip Stripe entirely, but let's assume we still create a $0 or we just bypass.
  // Assuming booking fee is always > 0 for this flow, or we handle 0 as instant confirm.
  if (amount === 0) {
    // Instant confirmation if no fee
    return { clientSecret: null, amount: 0, currency };
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: {
      holdId: hold._id.toString(),
      userId: userId,
      restaurantId: restaurant._id.toString(),
    },
  });

  // Create local Payment record
  const payment = new Payment({
    holdId: hold._id,
    stripePaymentIntentId: paymentIntent.id,
    amount,
    currency,
    status: 'pending',
  });

  await payment.save();

  return {
    clientSecret: paymentIntent.client_secret,
    amount,
    currency,
  };
};

export const handleWebhook = async (body: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    throw createAppError(400, 'bad_request', `Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id }).session(session);
    if (!payment) {
      console.error(`Payment not found for Intent ${paymentIntent.id}`);
      return;
    }

    if (payment.status === 'succeeded') {
      // Already processed
      return;
    }

    payment.status = 'succeeded';
    await payment.save({ session });

    // Call booking service to confirm booking
    await bookingService.confirmBooking(payment.holdId.toString(), payment._id.toString(), session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in handlePaymentSuccess:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

const handlePaymentFailure = async (paymentIntent: Stripe.PaymentIntent) => {
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
  if (!payment) return;

  payment.status = 'failed';
  payment.failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';
  await payment.save();
};

export const refundPayment = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw createAppError(404, 'not_found', 'Payment not found');
  }

  if (payment.status !== 'succeeded') {
    throw createAppError(400, 'bad_request', 'Payment is not in succeeded state');
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    payment.status = 'refunded';
    payment.refundedAmount = payment.amount;
    await payment.save();

    return refund;
  } catch (error: any) {
    throw createAppError(400, 'bad_request', `Refund failed: ${error.message}`);
  }
};
