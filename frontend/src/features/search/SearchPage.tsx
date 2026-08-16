import React, { useState, useEffect, forwardRef } from 'react';

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import RestaurantCard from '../../components/RestaurantCard';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BottomNav from '../../components/BottomNav';

export default function SearchPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await api.get('/search/restaurants');
      return res.data.data;
    }
  });

  return (
    <div className="pb-20">
      <div className="bg-primary text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="font-serif text-3xl font-bold mb-6">Find a Table</h1>
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col gap-4 text-on-surface">
          <Input 
            placeholder="City or neighborhood" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            fullWidth 
          />
          <Button fullWidth>Search</Button>
        </div>
      </div>
      
      <div className="p-4 mt-4">
        <h2 className="font-serif text-xl font-bold mb-4">Popular near you</h2>
        {isLoading ? (
          <div className="text-center py-10 text-outline">Loading...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {data?.restaurants?.map((restaurant: any) => (
              <div key={restaurant.id} onClick={() => navigate(`/restaurant/${restaurant.id}`)} className="cursor-pointer">
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
