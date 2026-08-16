
import StatCard from '../../components/StatCard';
import TableStatusGrid from '../../components/TableStatusGrid';
import { Users, DollarSign, Calendar } from 'lucide-react';

export default function DashboardHomePage() {
  // Mock data
  const tables = Array.from({ length: 12 }).map((_, i) => ({
    id: String(i),
    label: `T${i + 1}`,
    capacity: 2 + (i % 3) * 2,
    status: ['available', 'held', 'occupied', 'present'][i % 4] as any
  }));

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Today's Bookings" value="24" trend={12} icon={<Calendar className="w-5 h-5" />} />
        <StatCard title="Revenue (Today)" value=",240" trend={5} icon={<DollarSign className="w-5 h-5" />} />
        <StatCard title="Occupancy Rate" value="78%" trend={-2} icon={<Users className="w-5 h-5" />} />
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
        <h2 className="font-serif text-xl font-bold mb-4">Live Table Status</h2>
        <TableStatusGrid tables={tables} />
      </div>
    </div>
  );
}
