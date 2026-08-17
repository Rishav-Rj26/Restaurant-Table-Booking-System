import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import Button from '../../components/Button';
import HoldCountdown from '../../components/HoldCountdown';
import Toast from '../../components/Toast';

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [holdData, setHoldData] = useState<{ holdId: string; expiresAt: string } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // 1. Fetch Restaurant details for summary
  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', state?.restaurantId],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${state.restaurantId}`);
      return res.data.data;
    },
    enabled: !!state?.restaurantId
  });

  // 2. Create Hold
  const holdMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/bookings/hold', {
        restaurantId: state.restaurantId,
        tableId: state.tableId,
        slotStart: state.slotStart,
        partySize: state.partySize
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setHoldData(data);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to hold table. It may no longer be available.');
    }
  });

  // 3. Create Payment Intent
  const paymentIntentMutation = useMutation({
    mutationFn: async (holdId: string) => {
      const res = await api.post('/payments/intent', { holdId });
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        // No client secret means amount is 0, handled below
      }
    },
    onError: (err: any) => {
      setError('Failed to initialize payment.');
    }
  });

  useEffect(() => {
    if (state?.restaurantId && state?.tableId && state?.slotStart) {
      holdMutation.mutate();
    } else {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (holdData?.holdId) {
      paymentIntentMutation.mutate(holdData.holdId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdData?.holdId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      if (clientSecret && stripe && elements) {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('Card element not found');

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      }

      // If success or if no client secret (0 fee), wait for webhook to create booking
      // We'll poll /bookings/me to find the new booking
      pollForBooking();

    } catch (err: any) {
      setError(err.message || 'Payment failed.');
      setIsProcessing(false);
    }
  };

  const pollForBooking = async (attempts = 0) => {
    if (attempts > 10) {
      setIsProcessing(false);
      setError('Payment succeeded, but we could not confirm your booking yet. Please check your bookings page shortly.');
      setTimeout(() => navigate('/my-bookings'), 3000);
      return;
    }

    try {
      const res = await api.get('/bookings/me?status=upcoming');
      const bookings = res.data.data;
      const newBooking = bookings.find((b: any) => 
        b.restaurantId._id === state.restaurantId && 
        new Date(b.slotStart).toISOString() === new Date(state.slotStart).toISOString()
      );

      if (newBooking) {
        setIsProcessing(false);
        navigate(`/confirmation/${newBooking._id}`);
      } else {
        setTimeout(() => pollForBooking(attempts + 1), 2000);
      }
    } catch (e) {
      setTimeout(() => pollForBooking(attempts + 1), 2000);
    }
  };

  if (!state?.restaurantId) return null;

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 min-h-screen bg-background">
      <h1 className="font-serif text-3xl font-bold mb-6 text-on-surface">Complete Booking</h1>
      
      {holdData?.expiresAt && (
        <HoldCountdown 
          expiresAt={holdData.expiresAt} 
          onExpire={() => {
            setError('Your hold has expired. Please try booking again.');
            setTimeout(() => navigate(-1), 3000);
          }} 
        />
      )}

      {restaurant && (
        <div className="mt-6 bg-surface p-5 rounded-xl border border-outline-variant shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Booking Summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-outline">Restaurant</span>
              <span className="font-medium text-on-surface">{restaurant.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Date & Time</span>
              <span className="font-medium text-on-surface">
                {new Date(state.slotStart).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Party Size</span>
              <span className="font-medium text-on-surface">{state.partySize} pax</span>
            </div>
            <hr className="my-2 border-outline-variant" />
            <div className="flex justify-between font-bold text-base">
              <span className="text-on-surface">Booking Fee</span>
              <span className="text-on-surface">
                ${((restaurant.bookingFee || 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 bg-surface p-6 rounded-xl border border-outline-variant shadow-sm">
        <h2 className="font-serif text-lg font-bold mb-4">Payment Details</h2>
        
        {holdMutation.isPending || paymentIntentMutation.isPending ? (
          <div className="text-center py-8 text-outline">Securing your table...</div>
        ) : (
          <form onSubmit={handlePayment}>
            {clientSecret && (
              <div className="p-4 border border-outline rounded-lg mb-6 bg-white shadow-inner">
                <CardElement options={{ 
                  style: { 
                    base: { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } },
                    invalid: { color: '#ef4444' }
                  } 
                }} />
              </div>
            )}
            
            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              isLoading={isProcessing} 
              disabled={(!stripe && !!clientSecret) || !holdData}
            >
              Pay & Confirm
            </Button>
          </form>
        )}
      </div>
      
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
    </div>
  );
}
