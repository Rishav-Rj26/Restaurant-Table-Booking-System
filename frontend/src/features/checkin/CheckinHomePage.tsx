import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import StatusBadge, { type BadgeStatus } from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import { useSocket } from '../../hooks/useSocket';

export default function CheckinHomePage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // For a staff member, they might have multiple restaurants, but we'll assume they select one or just take the first
  const restaurantId = (user as any)?.restaurants?.[0] ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['today-bookings', restaurantId],
    queryFn: async () => {
      // In a real app, backend might have a dedicated endpoint for "today's bookings"
      // or we use the standard list and filter by date.
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/restaurants/${restaurantId}/bookings?date=${today}`);
      return res.data.data;
    },
    enabled: !!restaurantId,
  });

  const checkinMutation = useMutation({
    mutationFn: async (bookingCode: string) => {
      const res = await api.post('/checkin/verify', { bookingCode, restaurantId });
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['today-bookings'] });
      setToast({ type: 'success', message: `Checked in: ${data.guestName ?? 'Guest'} at ${data.tableLabel}` });
    },
    onError: (e: any) => {
      setToast({ type: 'error', message: e.response?.data?.error?.message ?? 'Check-in failed.' });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await api.post(`/checkin/no-show/${bookingId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today-bookings'] });
      setToast({ type: 'success', message: 'Marked as No-Show.' });
    },
    onError: () => setToast({ type: 'error', message: 'Could not mark no-show.' }),
  });

  // Listen for real-time table status changes
  const socket = useSocket(restaurantId);
  useEffect(() => {
    if (!socket) return;
    const handleStatusChanged = () => {
      qc.invalidateQueries({ queryKey: ['today-bookings'] });
    };
    socket.on('tableStatusChanged', handleStatusChanged);
    return () => {
      socket.off('tableStatusChanged', handleStatusChanged);
    };
  }, [socket, qc]);

  const upcomingBookings = data?.bookings?.filter((b: any) => b.status === 'confirmed') || [];
  const checkedInBookings = data?.bookings?.filter((b: any) => b.status === 'present') || [];

  return (
    <div className="p-4 pb-24">
      <h1 className="font-serif text-2xl font-bold mb-6">Today's Arrivals</h1>

      {!restaurantId ? (
        <div className="p-4 text-center text-outline bg-white rounded-xl shadow-sm">
          No restaurant assigned.
        </div>
      ) : isLoading ? (
        <div className="p-4 text-center text-outline">Loading today's arrivals…</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Upcoming */}
          <div>
            <h2 className="font-semibold text-lg mb-3">Expected ({upcomingBookings.length})</h2>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-outline">No expected arrivals right now.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingBookings.map((b: any) => (
                  <div key={b._id} className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant flex justify-between items-center">
                    <div>
                      <div className="font-bold">{b.userId?.name ?? 'Guest'}</div>
                      <div className="text-sm text-outline">
                        {new Date(b.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' • '}
                        {b.tableId?.label ?? 'Table'} ({b.partySize} pax)
                      </div>
                      <div className="text-xs font-mono text-primary mt-1">{b.bookingCode}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => checkinMutation.mutate(b.bookingCode)}
                        disabled={checkinMutation.isPending}
                        className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        Check In
                      </button>
                      <button
                        onClick={() => noShowMutation.mutate(b._id)}
                        disabled={noShowMutation.isPending}
                        className="text-error text-xs font-semibold hover:underline disabled:opacity-50 text-center"
                      >
                        No Show
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checked In */}
          <div>
            <h2 className="font-semibold text-lg mb-3">Present ({checkedInBookings.length})</h2>
            <div className="flex flex-col gap-3">
              {checkedInBookings.map((b: any) => (
                <div key={b._id} className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant flex justify-between items-center opacity-70">
                  <div>
                    <div className="font-bold">{b.userId?.name ?? 'Guest'}</div>
                    <div className="text-sm text-outline">
                      {b.tableId?.label ?? 'Table'} ({b.partySize} pax)
                    </div>
                  </div>
                  <StatusBadge status="present" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
