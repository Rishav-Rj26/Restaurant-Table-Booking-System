import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter } from 'lucide-react';
import { api } from '../../services/api';
import RestaurantCard from '../../components/RestaurantCard';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BottomNav from '../../components/BottomNav';
import FilterChipGroup from '../../components/FilterChipGroup';

const CUISINE_OPTIONS = [
  { label: 'Italian', value: 'Italian' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'American', value: 'American' },
  { label: 'French', value: 'French' },
];

const AMBIANCE_OPTIONS = [
  { label: 'Casual', value: 'casual' },
  { label: 'Fine Dining', value: 'fine_dining' },
  { label: 'Romantic', value: 'romantic' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState('2');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [ambiance, setAmbiance] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', location, date, time, partySize, cuisines, ambiance],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (location) params.append('city', location);
      params.append('date', date);
      params.append('time', time);
      params.append('partySize', partySize);
      cuisines.forEach(c => params.append('cuisine', c));
      ambiance.forEach(a => params.append('ambiance', a));
      
      const res = await api.get(`/search/restaurants?${params.toString()}`);
      return res.data.data;
    }
  });

  return (
    <div className="pb-20 min-h-screen bg-background">
      <div className="bg-primary text-white p-6 pb-8 rounded-b-[2rem] shadow-md">
        <h1 className="font-serif text-3xl font-bold mb-6">Find a Table</h1>
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col gap-4 text-on-surface">
          <Input 
            placeholder="City or neighborhood" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            fullWidth 
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="h-12 rounded-lg border border-outline bg-surface px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Time</label>
              <input 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                className="h-12 rounded-lg border border-outline bg-surface px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Party Size</label>
            <select 
              value={partySize}
              onChange={e => setPartySize(e.target.value)}
              className="h-12 rounded-lg border border-outline bg-surface px-3 text-base focus:ring-2 focus:ring-primary outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> 
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>

          {showFilters && (
            <div className="flex flex-col gap-4 pt-2 border-t border-outline-variant">
              <div>
                <label className="text-sm font-semibold mb-2 block">Cuisine</label>
                <FilterChipGroup 
                  options={CUISINE_OPTIONS} 
                  selectedValues={cuisines} 
                  onChange={setCuisines} 
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Ambiance</label>
                <FilterChipGroup 
                  options={AMBIANCE_OPTIONS} 
                  selectedValues={ambiance} 
                  onChange={setAmbiance} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 mt-6">
        <h2 className="font-serif text-xl font-bold mb-4">Available Restaurants</h2>
        {isLoading ? (
          <div className="text-center py-10 text-outline">Loading...</div>
        ) : data?.restaurants?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-outline-variant">
            <div className="text-outline mb-2">No restaurants found</div>
            <p className="text-sm text-outline-variant">Try adjusting your filters or search area</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data?.restaurants?.map((restaurant: any) => (
              <div key={restaurant.id || restaurant._id} onClick={() => navigate(`/restaurant/${restaurant.id || restaurant._id}?date=${date}&partySize=${partySize}`)} className="cursor-pointer">
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
