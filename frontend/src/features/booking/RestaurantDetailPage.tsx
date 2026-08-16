
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import SlotPicker from '../../components/SlotPicker';
import Button from '../../components/Button';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${id}`);
      return res.data.data;
    }
  });

  const { data: availability } = useQuery({
    queryKey: ['availability', id],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${id}/availability?date=${new Date().toISOString().split('T')[0]}&partySize=2`);
      return res.data.data;
    },
    enabled: !!id
  });

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="pb-24">
      <div className="relative h-64 bg-gray-200">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        {restaurant?.photos?.[0] && (
          <img src={restaurant.photos[0]} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
      </div>
      
      <div className="p-4 -mt-6 relative bg-surface rounded-t-3xl">
        <h1 className="font-serif text-3xl font-bold mb-2">{restaurant?.name}</h1>
        <p className="text-outline text-sm mb-4">{restaurant?.address?.street}, {restaurant?.address?.city}</p>
        
        <h2 className="font-serif text-lg font-bold mt-6 mb-3">Available Times Today</h2>
        <SlotPicker 
          slots={availability?.slots || []} 
          selectedSlot={selectedSlot} 
          onSelect={setSelectedSlot} 
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button 
          fullWidth 
          disabled={!selectedSlot}
          onClick={() => navigate('/checkout', { state: { restaurantId: id, slot: selectedSlot, partySize: 2 } })}
        >
          Book for 2 pax
        </Button>
      </div>
    </div>
  );
}
