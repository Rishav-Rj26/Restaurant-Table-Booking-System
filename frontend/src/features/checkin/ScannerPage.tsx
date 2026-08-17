import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import Toast from '../../components/Toast';

export default function ScannerPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const restaurantId = (user as any)?.restaurants?.[0] ?? '';

  const checkinMutation = useMutation({
    mutationFn: async (bookingCode: string) => {
      const res = await api.post('/checkin/verify', { bookingCode, restaurantId });
      return res.data.data;
    },
    onSuccess: (data) => {
      setToast({ type: 'success', message: `Checked in: ${data.guestName ?? 'Guest'} at ${data.tableLabel}` });
      // Pause briefly then go back home
      setTimeout(() => navigate('/staff'), 2000);
    },
    onError: (e: any) => {
      setToast({ type: 'error', message: e.response?.data?.error?.message ?? 'Check-in failed. Invalid code?' });
      // Allow scanning again after error
      setTimeout(() => {
        hasScannedRef.current = false;
      }, 3000);
    },
  });

  useEffect(() => {
    if (!restaurantId) return;

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success callback
            if (!hasScannedRef.current) {
              hasScannedRef.current = true;
              // Usually the decodedText from our backend is just the booking code
              checkinMutation.mutate(decodedText);
            }
          },
          (error) => {
            // Ignore scan failures (happens every frame it doesn't see a QR)
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Failed to start scanner', err);
        setToast({ type: 'error', message: 'Could not access camera. Please check permissions.' });
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [restaurantId]);

  return (
    <div className="h-full min-h-[calc(100vh-64px)] flex flex-col bg-black text-white p-4">
      <h1 className="font-serif text-2xl font-bold mb-6 pt-4 text-center">Scan QR Code</h1>
      
      {!restaurantId ? (
        <div className="text-center p-4">No restaurant assigned.</div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl overflow-hidden relative shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <div id="qr-reader" className="w-full h-full object-cover" />
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/50">Initializing camera...</span>
              </div>
            )}
            
            {/* Overlay guidelines */}
            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40" />
            <div className="absolute inset-0 pointer-events-none border-2 border-white/50 m-[40px] rounded-xl" />
          </div>
          
          <p className="text-center text-white/70 mt-8 max-w-xs font-medium">
            Point the camera at the guest's booking QR code to check them in.
          </p>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
