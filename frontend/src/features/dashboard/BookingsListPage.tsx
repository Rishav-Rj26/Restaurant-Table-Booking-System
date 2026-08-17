import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import StatusBadge, { type BadgeStatus } from '../../components/StatusBadge';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function BookingsListPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // In real usage, restaurantId comes from the owner's profile/selected restaurant
  const restaurantId = (user as any)?.restaurantId ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-bookings', restaurantId, statusFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      const res = await api.get(`/restaurants/${restaurantId}/bookings?${params.toString()}`);
      return res.data.data;
    },
    enabled: !!restaurantId,
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await api.post(`/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurant-bookings'] });
      setToast({ type: 'success', message: 'Booking cancelled.' });
    },
    onError: () => setToast({ type: 'error', message: 'Could not cancel booking.' }),
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-6">Bookings</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="present">Present</option>
          <option value="no_show">No Show</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setStatusFilter(''); setDateFilter(''); }}
        >
          Clear
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-outline">Loading bookings…</div>
        ) : !restaurantId ? (
          <div className="p-8 text-center text-outline">
            No restaurant linked to this account. Complete onboarding first.
          </div>
        ) : data?.bookings?.length === 0 ? (
          <div className="p-8 text-center text-outline">No bookings found for the selected filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-outline-variant">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-outline">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-outline">Guest</th>
                <th className="text-left px-4 py-3 font-semibold text-outline">Date & Time</th>
                <th className="text-left px-4 py-3 font-semibold text-outline">Table / Pax</th>
                <th className="text-left px-4 py-3 font-semibold text-outline">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-outline">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.bookings?.map((b: any) => (
                <tr key={b._id} className="border-b border-outline-variant/50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{b.bookingCode}</td>
                  <td className="px-4 py-3">{b.userId?.name ?? 'Guest'}</td>
                  <td className="px-4 py-3">
                    {new Date(b.slotStart).toLocaleString([], {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">{b.tableId?.label ?? '—'} · {b.partySize} pax</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status as BadgeStatus} />
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => cancelMutation.mutate(b._id)}
                        disabled={cancelMutation.isPending}
                        className="text-error text-xs font-semibold hover:underline disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
