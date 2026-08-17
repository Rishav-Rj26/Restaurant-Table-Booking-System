import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';

export default function ManualEntryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [code, setCode] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const restaurantId = (user as any)?.restaurants?.[0] ?? '';

  const checkinMutation = useMutation({
    mutationFn: async (bookingCode: string) => {
      const res = await api.post(`/checkin/${restaurantId}/verify`, { bookingCode });
      return res.data.data;
    },
    onSuccess: (data) => {
      setToast({ type: 'success', message: `Checked in: ${data.guestName ?? 'Guest'} at ${data.tableLabel}` });
      setTimeout(() => navigate('/checkin'), 2000);
    },
    onError: (e: any) => {
      setToast({ type: 'error', message: e.response?.data?.error?.message ?? 'Check-in failed. Invalid code?' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    checkinMutation.mutate(code.trim().toUpperCase());
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant w-full max-w-sm">
        <h1 className="font-serif text-2xl font-bold mb-2 text-center">Manual Entry</h1>
        <p className="text-outline text-sm text-center mb-6">Enter the guest's booking code</p>

        {!restaurantId ? (
          <div className="text-center text-outline">No restaurant assigned.</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. XX-REST-XXXX"
              className="text-center font-mono text-xl tracking-wider uppercase"
              fullWidth
              required
            />
            <Button
              type="submit"
              size="lg"
              isLoading={checkinMutation.isPending}
              disabled={!code.trim()}
              fullWidth
            >
              Verify & Check In
            </Button>
          </form>
        )}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
