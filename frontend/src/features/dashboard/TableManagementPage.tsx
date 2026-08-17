import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

export default function TableManagementPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const restaurantId = (user as any)?.restaurantId ?? '';

  const [showModal, setShowModal] = useState(false);
  const [editTable, setEditTable] = useState<any | null>(null);
  const [form, setForm] = useState({ label: '', capacity: '' });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tables', restaurantId],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${restaurantId}/tables`);
      return res.data.data;
    },
    enabled: !!restaurantId,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.post(`/restaurants/${restaurantId}/tables`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      setShowModal(false);
      setForm({ label: '', capacity: '' });
      setToast({ type: 'success', message: 'Table added.' });
    },
    onError: () => setToast({ type: 'error', message: 'Could not add table.' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ tableId, payload }: { tableId: string; payload: any }) => {
      await api.patch(`/restaurants/${restaurantId}/tables/${tableId}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      setShowModal(false);
      setEditTable(null);
      setToast({ type: 'success', message: 'Table updated.' });
    },
    onError: () => setToast({ type: 'error', message: 'Could not update table.' }),
  });

  const openAdd = () => {
    setEditTable(null);
    setForm({ label: '', capacity: '' });
    setShowModal(true);
  };

  const openEdit = (table: any) => {
    setEditTable(table);
    setForm({ label: table.label, capacity: String(table.capacity) });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { label: form.label, capacity: Number(form.capacity) };
    if (editTable) {
      updateMutation.mutate({ tableId: editTable._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleActive = (table: any) => {
    updateMutation.mutate({ tableId: table._id, payload: { isActive: !table.isActive } });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-bold">Table Management</h1>
        <Button onClick={openAdd} disabled={!restaurantId}>
          <Plus className="w-4 h-4 mr-2" /> Add Table
        </Button>
      </div>

      {!restaurantId && (
        <div className="p-6 text-outline bg-white rounded-xl border border-outline-variant">
          No restaurant linked. Complete onboarding first.
        </div>
      )}

      {isLoading && <div className="text-outline p-6">Loading tables…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.tables?.map((table: any) => (
          <div
            key={table._id}
            className={`bg-white rounded-xl border-2 shadow-sm p-5 flex flex-col gap-3 transition-opacity ${!table.isActive ? 'opacity-50 border-gray-200' : 'border-outline-variant'}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-serif text-2xl font-bold">{table.label}</span>
              <button onClick={() => toggleActive(table)} className="text-outline hover:text-secondary transition-colors">
                {table.isActive ? <ToggleRight className="w-7 h-7 text-secondary" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>
            <div className="text-sm text-outline">{table.capacity} pax capacity</div>
            <div className={`text-xs font-semibold px-2 py-1 rounded-full self-start ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {table.isActive ? 'Active' : 'Inactive'}
            </div>
            <button
              onClick={() => openEdit(table)}
              className="flex items-center gap-1 text-sm text-secondary hover:underline mt-1"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTable ? 'Edit Table' : 'Add New Table'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Table Label (e.g. T-1)"
            value={form.label}
            onChange={e => setForm({ ...form, label: e.target.value })}
            required
            fullWidth
          />
          <Input
            label="Capacity (persons)"
            type="number"
            min="1"
            max="30"
            value={form.capacity}
            onChange={e => setForm({ ...form, capacity: e.target.value })}
            required
            fullWidth
          />
          <Button type="submit" fullWidth isLoading={createMutation.isPending || updateMutation.isPending}>
            {editTable ? 'Save Changes' : 'Add Table'}
          </Button>
        </form>
      </Modal>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
