import { useEffect } from 'react';
import { socketService } from '../services/socket';

export const useSocket = (restaurantId?: string) => {
  useEffect(() => {
    const socket = socketService.connect();

    if (restaurantId) {
      socketService.joinRestaurantRoom(restaurantId);
    }

    return () => {
      if (restaurantId) {
        socketService.leaveRestaurantRoom(restaurantId);
      }
      // We don't necessarily disconnect here, as other components might use it
      // socketService.disconnect();
    };
  }, [restaurantId]);

  return socketService.getSocket();
};
