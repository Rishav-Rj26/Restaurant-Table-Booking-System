import React, { useState, useEffect, forwardRef } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
  
  // Dummy data for hold UI until integrated with backend hold creation
  const dummyExpiresAt = new Date(Date.now() + 10 * 60000).toISOString();
  
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    
    // In real flow: 1. Create Hold 2. Create Payment Intent 3. Confirm Card
    // Mocking success here:
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/confirmation/mock-booking-id`);
    }, 2000);
  };

  if (!state?.restaurantId) return <div>Invalid state</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="font-serif text-2xl font-bold mb-6">Complete Booking</h1>
      
      <HoldCountdown expiresAt={dummyExpiresAt} onExpire={() => navigate(-1)} />
      
      <div className="mt-8 bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
        <h2 className="font-serif text-lg font-bold mb-4">Payment Details</h2>
        <form onSubmit={handlePayment}>
          <div className="p-4 border rounded-lg mb-6 bg-surface">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          </div>
          <Button type="submit" fullWidth isLoading={isProcessing} disabled={!stripe}>
            Pay & Confirm
          </Button>
        </form>
      </div>
      
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
    </div>
  );
}
