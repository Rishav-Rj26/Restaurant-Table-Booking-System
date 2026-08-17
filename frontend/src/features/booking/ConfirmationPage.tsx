import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Users, Info } from 'lucide-react';
import { api } from '../../services/api';
import QRDisplay from '../../components/QRDisplay';
import Button from '../../components/Button';

export default function ConfirmationPage() {
  const { id } = useParams();
  
  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-outline">Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center p-4">
        <h1 className="font-serif text-2xl font-bold mb-4">Booking Not Found</h1>
        <Link to="/my-bookings">
          <Button>View My Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-primary pt-12 pb-24 px-4 text-center rounded-b-[3rem] shadow-lg">
        <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-[bounce_1s_ease-out_1]">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2 text-white">Booking Confirmed!</h1>
        <p className="text-white/80 font-medium">We've sent a confirmation email with details.</p>
      </div>
      
      <div className="max-w-md mx-auto px-4 -mt-16 relative z-10">
        <QRDisplay dataUrl={booking.qrCodeUrl} bookingCode={booking.bookingCode} />
        
        <div className="bg-white mt-6 p-6 rounded-2xl shadow-sm border border-outline-variant">
          <h2 className="font-bold text-lg mb-4 text-on-surface">Reservation Details</h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-outline shrink-0" />
              <div>
                <div className="font-semibold text-on-surface">{booking.restaurantId?.name}</div>
                <div className="text-outline">{booking.restaurantId?.address?.street}, {booking.restaurantId?.address?.city}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-outline shrink-0" />
              <div>
                <div className="font-semibold text-on-surface">
                  {new Date(booking.slotStart).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div className="text-outline">
                  {new Date(booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Users className="w-5 h-5 text-outline shrink-0" />
              <div className="font-semibold text-on-surface">{booking.partySize} People</div>
            </div>
          </div>
          
          {booking.restaurantId?.cancellationPolicy && (
            <div className="mt-6 p-3 bg-secondary-container text-secondary rounded-xl text-xs flex gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Free cancellation up to {booking.restaurantId.cancellationPolicy.hoursBeforeForRefund} hours before the reservation.
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-8 space-y-3">
          <Link to="/my-bookings">
            <Button fullWidth variant="primary" size="lg">View My Bookings</Button>
          </Link>
          <Link to="/">
            <Button fullWidth variant="outline" size="lg">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
