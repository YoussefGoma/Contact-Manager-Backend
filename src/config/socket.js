import { Server } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:4200",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`👤 User ${socket.id} joined room: ${room}`);
    });
  });

  return io;
};