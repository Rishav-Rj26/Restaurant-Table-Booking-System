import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinRestaurantRoom(restaurantId: string) {
    if (this.socket) {
      this.socket.emit('join:restaurant', restaurantId);
    }
  }

  leaveRestaurantRoom(restaurantId: string) {
    if (this.socket) {
      this.socket.emit('leave:restaurant', restaurantId);
    }
  }
}

export const socketService = new SocketService();
