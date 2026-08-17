import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, Calendar } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';
import StatCard from '../../components/StatCard';
import TableStatusGrid from '../../components/TableStatusGrid';
import StatusBadge from '../../components/StatusBadge';

export default function DashboardHomePage() {
  const { user } = useAuthStore();
  const restaurantId = (user as any)?.restaurantId ?? '';
  const today = new Date().toISOString().split('T')[0];

  const [tableStatuses, setTableStatuses] = useState<Record<string, 'available' | 'held' | 'occupied' | 'present'>>({});

  // 1. Fetch Analytics Overview for today
  const { data: analytics } = useQuery({
    queryKey: ['analytics', restaurantId, 'today'],
    queryFn: async () => {
      const res = await api.get(`/analytics/${restaurantId}/overview?from=${today}&to=${today}`);
      return res.data.data;
    },
    enabled: !!restaurantId,
  });

  // 2. Fetch Tables
  const { data: tablesData } = useQuery({
    queryKey: ['tables', restaurantId],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${restaurantId}/tables`);
      return res.data.data?.tables || res.data.data || [];
    },
    enabled: !!restaurantId,
  });

  // 3. Fetch Recent Bookings
  const { data: recentBookings } = useQuery({
    queryKey: ['bookings', restaurantId, 'recent'],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${restaurantId}/bookings?date=${today}&limit=5`);
      return res.data.data?.bookings || [];
    },
    enabled: !!restaurantId,
  });

  // Socket.io for live updates
  useEffect(() => {
    if (!restaurantId) return;

    const socket = socketService.connect();
    socketService.joinRestaurantRoom(restaurantId);

    const handleStatusChange = ({ tableId, status }: { tableId: string, status: any }) => {
      setTableStatuses(prev => ({ ...prev, [tableId]: status }));
    };

    socket?.on('table:status_changed', handleStatusChange);

    return () => {
      socket?.off('table:status_changed', handleStatusChange);
      socketService.leaveRestaurantRoom(restaurantId);
    };
  }, [restaurantId]);

  // Map tables with live statuses
  const tables = (tablesData || []).map((t: any) => ({
    id: t._id,
    label: t.label,
    capacity: t.capacity,
    status: tableStatuses[t._id] || (t.isActive ? 'available' : 'held'),
  }));

  const revenue = analytics?.revenue?.[0]?.totalAmount 
    ? (analytics.revenue[0].totalAmount / 100).toFixed(2) 
    : '0.00';

  return (
    <div className="pb-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      {!restaurantId ? (
        <div className="p-6 text-outline bg-white rounded-xl border border-outline-variant">
          No restaurant linked. Complete onboarding first.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Today's Bookings" 
              value={analytics?.totalBookings ?? 0} 
              icon={<Calendar className="w-5 h-5" />} 
            />
            <StatCard 
              title="Revenue (Today)" 
              value={`$${revenue}`} 
              icon={<DollarSign className="w-5 h-5" />} 
            />
            <StatCard 
              title="Avg Party Size" 
              value={analytics?.avgPartySize ?? 0} 
              icon={<Users className="w-5 h-5" />} 
            />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant mb-8">
            <h2 className="font-serif text-xl font-bold mb-4">Live Table Status</h2>
            <TableStatusGrid tables={tables} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
            <h2 className="font-serif text-xl font-bold mb-4">Recent Bookings Today</h2>
            {recentBookings?.length === 0 ? (
              <p className="text-outline text-sm py-4">No recent bookings today.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="pb-3 font-semibold text-outline">Time</th>
                      <th className="pb-3 font-semibold text-outline">Party</th>
                      <th className="pb-3 font-semibold text-outline">Code</th>
                      <th className="pb-3 font-semibold text-outline">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings?.map((b: any) => (
                      <tr key={b._id} className="border-b border-outline-variant/50 last:border-0">
                        <td className="py-3 font-medium text-on-surface">
                          {new Date(b.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3">{b.partySize} pax</td>
                        <td className="py-3 font-mono">{b.bookingCode}</td>
                        <td className="py-3">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
