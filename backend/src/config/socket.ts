import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './env.js';

let io: SocketIOServer;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join a restaurant's table-status room (used by staff/dashboard)
    socket.on('join:restaurant', (restaurantId: string) => {
      const room = `restaurant:${restaurantId}:tables`;
      socket.join(room);
      console.log(`  → ${socket.id} joined room: ${room}`);
    });

    // Leave a restaurant room
    socket.on('leave:restaurant', (restaurantId: string) => {
      const room = `restaurant:${restaurantId}:tables`;
      socket.leave(room);
      console.log(`  ← ${socket.id} left room: ${room}`);
    });

    // Join a user-specific room (for hold expiry warnings)
    socket.on('join:user', (userId: string) => {
      const room = `user:${userId}`;
      socket.join(room);
      console.log(`  → ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket(httpServer) first.');
  }
  return io;
}
