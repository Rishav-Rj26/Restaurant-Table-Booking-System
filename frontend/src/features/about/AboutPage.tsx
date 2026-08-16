
import BottomNav from '../../components/BottomNav';

export default function AboutPage() {
  return (
    <div className="p-4 pb-20">
      <h1 className="font-serif text-3xl font-bold mb-6">About TableGuard</h1>
      <div className="prose">
        <p>TableGuard is a premium restaurant booking platform ensuring no double-bookings and a seamless experience from reservation to check-in.</p>
      </div>
      <BottomNav />
    </div>
  );
}
