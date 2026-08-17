import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Info, Users, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import SlotPicker from '../../components/SlotPicker';
import Button from '../../components/Button';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialPartySize = searchParams.get('partySize') || '2';

  const [selectedSlotStr, setSelectedSlotStr] = useState<string | null>(null);
  const [date, setDate] = useState(initialDate);
  const [partySize, setPartySize] = useState(initialPartySize);

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${id}`);
      return res.data.data;
    }
  });

  const { data: availability, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['availability', id, date, partySize],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${id}/availability?date=${date}&partySize=${partySize}`);
      // Backend returns: [{ time: "HH:mm", tableId: "..." }]
      const rawSlots = res.data.data || [];
      return rawSlots.map((s: any) => {
        const [hour, minute] = s.time.split(':');
        const d = new Date(date);
        d.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
        return {
          startTime: d.toISOString(),
          available: true,
          tableId: s.tableId,
        };
      });
    },
    enabled: !!id
  });

  if (isLoading) return <div className="p-8 text-center text-outline">Loading...</div>;
  if (!restaurant) return <div className="p-8 text-center text-error">Restaurant not found.</div>;

  const handleBook = () => {
    const slotData = availability?.find((s: any) => s.startTime === selectedSlotStr);
    if (slotData) {
      navigate('/checkout', { 
        state: { 
          restaurantId: id, 
          tableId: slotData.tableId,
          slotStart: slotData.startTime, 
          partySize: parseInt(partySize, 10), 
          date 
        } 
      });
    }
  };

  return (
    <div className="pb-28 min-h-screen bg-background">
      <div className="relative h-64 bg-gray-200">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full z-10 transition-colors hover:bg-black/70"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        {restaurant?.photos?.[0] ? (
          <img src={restaurant.photos[0]} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline bg-surface">No Image Available</div>
        )}
      </div>
      
      <div className="p-5 -mt-6 relative bg-surface rounded-t-3xl shadow-sm">
        <h1 className="font-serif text-3xl font-bold mb-1 text-on-surface">{restaurant.name}</h1>
        <p className="text-outline text-sm mb-4 font-medium">{restaurant.address?.street}, {restaurant.address?.city}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.cuisineTypes?.map((cuisine: string) => (
            <span key={cuisine} className="px-2.5 py-1 bg-secondary-container text-secondary text-xs rounded-full font-bold">
              {cuisine}
            </span>
          ))}
          {restaurant.ambiance?.map((amb: string) => (
            <span key={amb} className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full font-bold capitalize">
              {amb.replace('_', ' ')}
            </span>
          ))}
        </div>

        {restaurant.description && (
          <p className="text-on-surface/80 text-sm mb-6 leading-relaxed">
            {restaurant.description}
          </p>
        )}

        {restaurant.bookingFee > 0 && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-sm font-medium">
            <Info className="w-4 h-4 flex-shrink-0" />
            This restaurant requires a non-refundable booking fee of ${(restaurant.bookingFee / 100).toFixed(2)}.
          </div>
        )}
        
        <hr className="border-outline-variant mb-6" />

        <h2 className="font-serif text-xl font-bold mb-4 text-on-surface">Find a Table</h2>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Date
            </label>
            <input 
              type="date" 
              value={date}
              onChange={e => {
                setDate(e.target.value);
                setSelectedSlotStr(null);
              }}
              className="h-12 rounded-lg border border-outline bg-surface px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface flex items-center gap-1">
              <Users className="w-4 h-4" /> Party Size
            </label>
            <select 
              value={partySize}
              onChange={e => {
                setPartySize(e.target.value);
                setSelectedSlotStr(null);
              }}
              className="h-12 rounded-lg border border-outline bg-surface px-3 text-base focus:ring-2 focus:ring-primary outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="font-semibold text-on-surface mb-3">Available Times</h3>
        {isAvailabilityLoading ? (
          <div className="text-sm text-outline py-4">Checking availability...</div>
        ) : availability?.length > 0 ? (
          <SlotPicker 
            slots={availability} 
            selectedSlot={selectedSlotStr} 
            onSelect={setSelectedSlotStr} 
          />
        ) : (
          <div className="text-sm text-outline py-4 bg-gray-50 rounded-xl text-center border border-outline-variant">
            No tables available for {partySize} on this date.
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-outline-variant shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-20">
        <Button 
          fullWidth 
          size="lg"
          disabled={!selectedSlotStr}
          onClick={handleBook}
        >
          {selectedSlotStr 
            ? `Book for ${partySize} at ${new Date(selectedSlotStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
            : 'Select a time to book'
          }
        </Button>
      </div>
    </div>
  );
}
