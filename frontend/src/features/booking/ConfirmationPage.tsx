
import { useParams, Link } from 'react-router-dom';
import QRDisplay from '../../components/QRDisplay';
import Button from '../../components/Button';

export default function ConfirmationPage() {
  const { id } = useParams();
  
  // Mock data for UI
  const dummyQR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  return (
    <div className="min-h-screen bg-surface p-4 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-outline mb-8">We've sent a confirmation email with details.</p>
      
      <QRDisplay dataUrl={dummyQR} bookingCode="XX-REST-1234" />
      
      <div className="mt-12 w-full max-w-sm space-y-4">
        <Link to="/my-bookings">
          <Button fullWidth variant="primary">View My Bookings</Button>
        </Link>
        <Link to="/">
          <Button fullWidth variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
