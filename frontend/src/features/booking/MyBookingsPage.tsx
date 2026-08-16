
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';

export default function MyBookingsPage() {
  return (
    <div className="pb-20 p-4">
      <h1 className="font-serif text-2xl font-bold mb-6">My Bookings</h1>
      
      <div className="space-y-4">
        {/* Mock Booking Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-serif font-bold text-lg">The Rusty Spoon</h3>
            <StatusBadge status="confirmed" />
          </div>
          <p className="text-sm text-outline mb-4">Tonight at 7:30 PM • 2 Guests</p>
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-primary font-bold tracking-wider">XX-REST-1234</span>
            <button className="text-secondary hover:underline">View details</button>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
