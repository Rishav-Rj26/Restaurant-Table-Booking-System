import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import Toast from '../../components/Toast';

export default function NoShowListPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const restaurantId = (user as any)?.restaurants?.[0] ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['no-show-candidates', restaurantId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      // Get today's bookings, we'll filter client-side for unconfirmed past slots
      const res = await api.get(`/restaurants/${restaurantId}/bookings?date=${today}&status=confirmed`);
      return res.data.data;
    },
    enabled: !!restaurantId,
  });

  const noShowMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await api.post(`/checkin/no-show/${bookingId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['no-show-candidates'] });
      setToast({ type: 'success', message: 'Marked as No-Show.' });
    },
    onError: () => setToast({ type: 'error', message: 'Could not mark no-show.' }),
  });

  const now = new Date().getTime();
  
  // A booking is a "no show candidate" if it's confirmed but the slot has already started (or is past some threshold)
  const candidates = data?.bookings?.filter((b: any) => {
    const slotTime = new Date(b.slotStart).getTime();
    // Assuming 15 mins grace period
    const gracePeriodEnd = slotTime + 15 * 60 * 1000;
    return now > gracePeriodEnd;
  }) || [];

  return (
    <div className="p-4 pb-24">
      <h1 className="font-serif text-2xl font-bold mb-2">No-Show List</h1>
      <p className="text-outline text-sm mb-6">Unconfirmed bookings past their grace period</p>

      {!restaurantId ? (
        <div className="p-4 text-center text-outline bg-white rounded-xl shadow-sm">
          No restaurant assigned.
        </div>
      ) : isLoading ? (
        <div className="p-4 text-center text-outline">Loading…</div>
      ) : candidates.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant text-center">
          <div className="text-outline mb-2">All caught up!</div>
          <div className="text-sm text-outline-variant">No unconfirmed bookings past their grace period.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {candidates.map((b: any) => (
            <div key={b._id} className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant flex justify-between items-center">
              <div>
                <div className="font-bold">{b.userId?.name ?? 'Guest'}</div>
                <div className="text-sm text-outline">
                  {new Date(b.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' • '}
                  {b.tableId?.label ?? 'Table'} ({b.partySize} pax)
                </div>
              </div>
              <button
                onClick={() => noShowMutation.mutate(b._id)}
                disabled={noShowMutation.isPending}
                className="bg-error-container text-error px-4 py-2 rounded-lg text-sm font-semibold hover:bg-error/20 disabled:opacity-50"
              >
                Mark No-Show
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
