import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';
import { TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [restaurantId] = useState('mock-restaurant-id'); // In real use, get from auth context

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', restaurantId, from, to],
    queryFn: async () => {
      const res = await api.get(`/analytics/${restaurantId}/overview?from=${from}&to=${to}`);
      return res.data.data;
    },
    retry: false,
  });

  const turnoverData = data?.turnoverByHour?.map((d: any) => ({
    hour: `${d.hour}:00`,
    bookings: d.count,
  })) ?? [];

  const revenueData = data?.revenue?.map((d: any) => ({
    date: d.date?.slice(5), // MM-DD
    revenue: (d.totalAmount / 100).toFixed(2),
  })) ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-bold">Analytics & Reports</h1>
        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium text-outline">From</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface"
          />
          <label className="text-sm font-medium text-outline">To</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-20 text-outline">Loading analytics…</div>
      )}

      {isError && (
        <div className="bg-error-container text-error p-4 rounded-xl mb-6">
          Could not load analytics. Make sure the backend is running and you have access.
        </div>
      )}

      {/* Stat cards — use mock values if no data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Bookings"
          value={data?.totalBookings ?? '—'}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Party Size"
          value={data?.avgPartySize ? `${data.avgPartySize} pax` : '—'}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Lead Time"
          value={data?.avgLeadTimeHours ? `${data.avgLeadTimeHours}h` : '—'}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="No-Show Rate"
          value={data?.noShowRate !== undefined ? `${data.noShowRate}%` : '—'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Turnover by Hour */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
          <h2 className="font-serif text-lg font-bold mb-4">Bookings by Hour</h2>
          {turnoverData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-outline text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dcc1b7" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#99411c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
          <h2 className="font-serif text-lg font-bold mb-4">Daily Revenue</h2>
          {revenueData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-outline text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dcc1b7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} unit="$" />
                <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#99411c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Peak Hours Table */}
      {data?.peakHours?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm mb-6">
          <h2 className="font-serif text-lg font-bold mb-4">Top Peak Hours</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-2 pr-4 font-semibold text-outline">Day</th>
                  <th className="text-left py-2 pr-4 font-semibold text-outline">Hour</th>
                  <th className="text-left py-2 font-semibold text-outline">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {data.peakHours.map((ph: any, i: number) => (
                  <tr key={i} className="border-b border-outline-variant/50">
                    <td className="py-2 pr-4">{DAY_NAMES[ph.dayOfWeek - 1] ?? ph.dayOfWeek}</td>
                    <td className="py-2 pr-4">{ph.hour}:00</td>
                    <td className="py-2 font-semibold text-primary">{ph.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staffing Recommendation */}
      {data?.staffingRecommendation && (
        <div className="bg-secondary-container border border-secondary/20 p-6 rounded-xl">
          <h2 className="font-serif text-lg font-bold mb-3 text-secondary">Staffing Recommendation</h2>
          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-bold text-secondary">{data.staffingRecommendation.hosts}</div>
              <div className="text-sm text-outline">Host(s) recommended</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">{data.staffingRecommendation.servers}</div>
              <div className="text-sm text-outline">Server(s) recommended</div>
            </div>
          </div>
          {data.staffingRecommendation.peakHourReference && (
            <p className="text-xs text-outline mt-3">
              Based on peak: {DAY_NAMES[data.staffingRecommendation.peakHourReference.dayOfWeek - 1]} at {data.staffingRecommendation.peakHourReference.hour}:00 ({data.staffingRecommendation.peakHourReference.bookings} bookings)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
