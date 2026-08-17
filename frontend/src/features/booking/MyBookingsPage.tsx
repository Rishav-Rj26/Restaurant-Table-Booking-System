import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { QrCode, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import QRDisplay from '../../components/QRDisplay';
import Toast from '../../components/Toast';

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedQR, setSelectedQR] = useState<{ url: string; code: string } | null>(null);
  const [cancelError, setCancelError] = useState('');
  
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings', activeTab],
    queryFn: async () => {
      const res = await api.get(`/bookings/me?status=${activeTab}`);
      return res.data.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/bookings/${id}/cancel`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err: any) => {
      setCancelError(err.response?.data?.error?.message || 'Could not cancel booking.');
    }
  });

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? Cancellation policies may apply.')) {
      cancelMutation.mutate(id);
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-background">
      <div className="bg-primary text-white p-6 pb-8 rounded-b-[2rem] shadow-md">
        <h1 className="font-serif text-3xl font-bold mb-4">My Bookings</h1>
        <div className="flex bg-white/20 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={clsx(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-colors",
              activeTab === 'upcoming' ? "bg-white text-primary shadow-sm" : "text-white hover:bg-white/10"
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={clsx(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-colors",
              activeTab === 'past' ? "bg-white text-primary shadow-sm" : "text-white hover:bg-white/10"
            )}
          >
            Past
          </button>
        </div>
      </div>
      
      <div className="p-4 mt-2 space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-outline">Loading bookings...</div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-outline-variant">
            <div className="text-outline mb-2">No {activeTab} bookings</div>
            <p className="text-sm text-outline-variant">When you book a table, it will appear here.</p>
          </div>
        ) : (
          bookings?.map((b: any) => (
            <div key={b._id} className="bg-white p-5 rounded-xl shadow-sm border border-outline-variant flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif font-bold text-lg text-on-surface">{b.restaurantId?.name || 'Restaurant'}</h3>
                  <p className="text-sm text-outline font-medium mt-0.5">
                    {new Date(b.slotStart).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(b.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-outline font-medium">{b.partySize} Guests</p>
                </div>
                <StatusBadge status={b.status as any} />
              </div>
              
              <hr className="border-outline-variant my-1" />
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-mono text-primary font-bold tracking-widest">{b.bookingCode}</span>
                
                <div className="flex gap-2">
                  {b.status === 'confirmed' && b.qrCodeUrl && (
                    <button 
                      onClick={() => setSelectedQR({ url: b.qrCodeUrl, code: b.bookingCode })}
                      className="flex items-center gap-1 text-secondary hover:text-secondary-container font-semibold transition-colors bg-secondary/10 px-3 py-1.5 rounded-lg"
                    >
                      <QrCode className="w-4 h-4" /> QR Code
                    </button>
                  )}
                  {b.status === 'confirmed' && activeTab === 'upcoming' && (
                    <button 
                      onClick={() => handleCancel(b._id)}
                      disabled={cancelMutation.isPending}
                      className="flex items-center gap-1 text-error hover:text-error/80 font-semibold transition-colors bg-error/10 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <Modal isOpen={!!selectedQR} onClose={() => setSelectedQR(null)} title="Check-in QR Code">
        {selectedQR && <QRDisplay dataUrl={selectedQR.url} bookingCode={selectedQR.code} />}
        <p className="text-center text-sm text-outline mt-4 pb-4">
          Show this code to the host when you arrive at the restaurant.
        </p>
      </Modal>

      {cancelError && <Toast type="error" message={cancelError} onClose={() => setCancelError('')} />}
      <BottomNav />
    </div>
  );
}
