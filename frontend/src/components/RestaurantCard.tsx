
import { MapPin, Star, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function RestaurantCard({ restaurant }: { restaurant: any }) {
  return (
    <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-200 w-full relative">
        {restaurant.photos?.[0] ? (
          <img src={restaurant.photos[0]} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">No Image</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-semibold text-on-surface">{restaurant.name}</h3>
          <div className="flex items-center text-sm font-semibold text-primary">
            <Star className="w-4 h-4 mr-1 fill-current" />
            4.8
          </div>
        </div>
        <div className="flex items-center text-sm text-outline mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {restaurant.address?.city} ({restaurant.distance || '1.2'} km)
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {restaurant.cuisineTypes?.slice(0, 3).map((cuisine: string) => (
            <span key={cuisine} className="px-2 py-1 bg-secondary-container text-secondary text-xs rounded font-medium">
              {cuisine}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
