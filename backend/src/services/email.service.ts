import nodemailer from 'nodemailer';
import { transporter } from '../config/email.js';
import { IUser } from '../models/User.model.js';
import { IBooking } from '../models/Booking.model.js';
import { IRestaurant } from '../models/Restaurant.model.js';

export const sendBookingConfirmation = async (
  user: Pick<IUser, 'email' | 'name'>,
  booking: IBooking,
  restaurant: IRestaurant,
  qrCodeDataUrl: string
) => {
  const mailOptions = {
    from: '"TableGuard" <noreply@tableguard.com>',
    to: user.email,
    subject: `Booking Confirmed: ${restaurant.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #151c27;">
        <h1 style="color: #99411c;">Booking Confirmed!</h1>
        <p>Hi ${user.name.split(' ')[0]},</p>
        <p>Your table at <strong>${restaurant.name}</strong> is confirmed.</p>
        
        <div style="background-color: #f9f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #556158;">Reservation Details</h2>
          <p><strong>Code:</strong> ${booking.bookingCode}</p>
          <p><strong>Date & Time:</strong> ${booking.slotStart.toLocaleString()}</p>
          <p><strong>Address:</strong> ${restaurant.address.line1}, ${restaurant.address.city}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p>Please present this QR code to the host upon arrival:</p>
          <img src="${qrCodeDataUrl}" alt="Booking QR Code" style="max-width: 250px; border-radius: 8px;" />
        </div>
        
        <p style="font-size: 0.9em; color: #556158;">
          Cancellation Policy: You can cancel for a full refund up to ${restaurant.cancellationPolicy.hoursBeforeForRefund} hours before your reservation.
        </p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Preview URL: %s', (nodemailer as any).getTestMessageUrl(info));
};

export const sendCancellationConfirmation = async (
  user: Pick<IUser, 'email' | 'name'>,
  booking: IBooking,
  restaurant: IRestaurant
) => {
  const mailOptions = {
    from: '"TableGuard" <noreply@tableguard.com>',
    to: user.email,
    subject: `Booking Cancelled: ${restaurant.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #151c27;">
        <h1 style="color: #ba1a1a;">Booking Cancelled</h1>
        <p>Hi ${user.name.split(' ')[0]},</p>
        <p>Your reservation at <strong>${restaurant.name}</strong> for ${booking.slotStart.toLocaleString()} has been cancelled.</p>
        <p>If applicable, your refund will be processed according to the restaurant's cancellation policy.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
