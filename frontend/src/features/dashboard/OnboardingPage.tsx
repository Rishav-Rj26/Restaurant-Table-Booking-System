import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

const CUISINE_OPTIONS = ['Italian', 'French', 'Japanese', 'Chinese', 'Indian', 'American', 'Mediterranean', 'Mexican', 'Thai', 'Korean', 'Fusion'];
const AMBIANCE_OPTIONS = ['fine_dining', 'casual', 'family_friendly', 'romantic', 'business'];
const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STEPS = ['Profile', 'Location & Hours', 'Cuisine & Tags', 'Tables', 'Fees'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    // Step 0 — Profile
    name: '',
    contactPhone: '',
    contactEmail: '',
    // Step 1 — Location & Hours
    line1: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    lat: '',
    lng: '',
    operatingHours: DAYS.map((_, day) => ({
      day,
      openTime: '11:00',
      closeTime: '22:00',
      enabled: day > 0 && day < 6,
    })),
    // Step 2 — Cuisine & Tags
    cuisineTypes: [] as string[],
    ambiance: 'casual',
    dietaryOptions: [] as string[],
    // Step 3 — Tables
    tables: [{ label: 'T-1', capacity: '2' }, { label: 'T-2', capacity: '4' }],
    // Step 4 — Fees
    bookingFeeAmount: '5',
    bookingFeeCurrency: 'usd',
    cancellationHours: '24',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        contact: { phone: form.contactPhone, email: form.contactEmail },
        address: {
          line1: form.line1,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          location: {
            type: 'Point',
            coordinates: [parseFloat(form.lng) || 0, parseFloat(form.lat) || 0],
          },
        },
        operatingHours: form.operatingHours
          .filter(h => h.enabled)
          .map(h => ({ day: h.day, openTime: h.openTime, closeTime: h.closeTime })),
        cuisineTypes: form.cuisineTypes,
        ambiance: form.ambiance,
        dietaryOptions: form.dietaryOptions,
        tables: form.tables.map(t => ({ label: t.label, capacity: parseInt(t.capacity) })),
        bookingFee: { amount: parseFloat(form.bookingFeeAmount), currency: form.bookingFeeCurrency },
        cancellationPolicy: { hoursBeforeForRefund: parseInt(form.cancellationHours) },
      };
      const res = await api.post('/restaurants', payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      setToast({ type: 'success', message: 'Restaurant created successfully!' });
      setTimeout(() => navigate('/dashboard'), 1500);
    },
    onError: (e: any) => {
      setToast({ type: 'error', message: e.response?.data?.error?.message ?? 'Creation failed.' });
    },
  });

  const toggleCuisine = (c: string) => {
    setForm(f => ({
      ...f,
      cuisineTypes: f.cuisineTypes.includes(c)
        ? f.cuisineTypes.filter(x => x !== c)
        : [...f.cuisineTypes, c],
    }));
  };

  const toggleDietary = (d: string) => {
    setForm(f => ({
      ...f,
      dietaryOptions: f.dietaryOptions.includes(d)
        ? f.dietaryOptions.filter(x => x !== d)
        : [...f.dietaryOptions, d],
    }));
  };

  const addTable = () => {
    const n = form.tables.length + 1;
    setForm(f => ({ ...f, tables: [...f.tables, { label: `T-${n}`, capacity: '2' }] }));
  };

  const removeTable = (i: number) => {
    setForm(f => ({ ...f, tables: f.tables.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl font-bold mb-2">Restaurant Setup</h1>
      <p className="text-outline mb-8">Configure your restaurant in {STEPS.length} steps</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-outline'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-outline-variant" />}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
        {/* Step 0: Profile */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-xl font-bold">Restaurant Profile</h2>
            <Input label="Restaurant Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth required />
            <Input label="Contact Phone" type="tel" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} fullWidth />
            <Input label="Contact Email" type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} fullWidth />
          </div>
        )}

        {/* Step 1: Location & Hours */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-xl font-bold">Location & Hours</h2>
            <Input label="Street Address" value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} fullWidth />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} fullWidth />
              <Input label="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} fullWidth />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="ZIP" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} fullWidth />
              <Input label="Country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} fullWidth />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Latitude (optional)" type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} fullWidth />
              <Input label="Longitude (optional)" type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} fullWidth />
            </div>
            <h3 className="font-semibold mt-2">Operating Hours</h3>
            {form.operatingHours.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={h.enabled} onChange={e => {
                  const updated = [...form.operatingHours];
                  updated[i] = { ...updated[i], enabled: e.target.checked };
                  setForm(f => ({ ...f, operatingHours: updated }));
                }} />
                <span className="w-8 font-medium">{DAYS[i]}</span>
                <input type="time" value={h.openTime} disabled={!h.enabled}
                  onChange={e => { const u = [...form.operatingHours]; u[i] = { ...u[i], openTime: e.target.value }; setForm(f => ({ ...f, operatingHours: u })); }}
                  className="border border-outline-variant rounded px-2 py-1 disabled:opacity-40"
                />
                <span>→</span>
                <input type="time" value={h.closeTime} disabled={!h.enabled}
                  onChange={e => { const u = [...form.operatingHours]; u[i] = { ...u[i], closeTime: e.target.value }; setForm(f => ({ ...f, operatingHours: u })); }}
                  className="border border-outline-variant rounded px-2 py-1 disabled:opacity-40"
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Cuisine & Tags */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-xl font-bold">Cuisine & Vibe</h2>
            <div>
              <label className="text-sm font-semibold mb-2 block">Cuisine Types</label>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map(c => (
                  <button key={c} type="button" onClick={() => toggleCuisine(c)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.cuisineTypes.includes(c) ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-on-surface hover:border-outline'}`}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Ambiance</label>
              <div className="flex flex-wrap gap-2">
                {AMBIANCE_OPTIONS.map(a => (
                  <button key={a} type="button" onClick={() => setForm(f => ({ ...f, ambiance: a }))}
                    className={`px-3 py-1.5 rounded-full text-sm border capitalize transition-colors ${form.ambiance === a ? 'bg-secondary text-white border-secondary' : 'bg-surface border-outline-variant text-on-surface hover:border-outline'}`}
                  >{a.replace('_', ' ')}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Dietary Options</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(d => (
                  <button key={d} type="button" onClick={() => toggleDietary(d)}
                    className={`px-3 py-1.5 rounded-full text-sm border capitalize transition-colors ${form.dietaryOptions.includes(d) ? 'bg-secondary text-white border-secondary' : 'bg-surface border-outline-variant text-on-surface hover:border-outline'}`}
                  >{d.replace('_', '-')}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tables */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-xl font-bold">Table Configuration</h2>
            <p className="text-sm text-outline">Define your tables. You can add more later.</p>
            {form.tables.map((t, i) => (
              <div key={i} className="flex gap-3 items-end">
                <Input label={i === 0 ? 'Label' : ''} value={t.label}
                  onChange={e => { const u = [...form.tables]; u[i] = { ...u[i], label: e.target.value }; setForm(f => ({ ...f, tables: u })); }}
                  fullWidth
                />
                <Input label={i === 0 ? 'Capacity' : ''} type="number" min="1" value={t.capacity}
                  onChange={e => { const u = [...form.tables]; u[i] = { ...u[i], capacity: e.target.value }; setForm(f => ({ ...f, tables: u })); }}
                  fullWidth
                />
                <button type="button" onClick={() => removeTable(i)} className="text-error text-sm mb-1 hover:underline">Remove</button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTable}>
              <span className="mr-1">+</span> Add Table
            </Button>
          </div>
        )}

        {/* Step 4: Fees */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-xl font-bold">Booking Fees & Policy</h2>
            <div className="flex gap-3">
              <Input label="Booking Fee ($)" type="number" min="0" step="0.01"
                value={form.bookingFeeAmount}
                onChange={e => setForm(f => ({ ...f, bookingFeeAmount: e.target.value }))}
                fullWidth
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Currency</label>
                <select value={form.bookingFeeCurrency} onChange={e => setForm(f => ({ ...f, bookingFeeCurrency: e.target.value }))}
                  className="h-12 border border-outline-variant rounded-lg px-3 bg-surface"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="inr">INR</option>
                </select>
              </div>
            </div>
            <Input
              label="Free Cancellation Window (hours before slot)"
              type="number"
              min="0"
              value={form.cancellationHours}
              onChange={e => setForm(f => ({ ...f, cancellationHours: e.target.value }))}
              fullWidth
              helperText="Bookings cancelled more than this many hours in advance get a full refund"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
            Create Restaurant
          </Button>
        )}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
