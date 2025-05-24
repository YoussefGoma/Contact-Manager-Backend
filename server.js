import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';

import { connectDatabase } from './src/config/database.js';
import { initializeSocket } from './src/config/socket.js';
import { initializeUsers } from './src/services/userService.js';

import authRoutes from './src/routes/auth.js';
import contactRoutes from './src/routes/contacts.js';
import userRoutes from './src/routes/user.js';

dotenv.config();

const app = express();
const server = createServer(app);

const io = initializeSocket(server);

app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();
    await initializeUsers();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log('👥 Default users available:');
      console.log('   Username: user1, Password: user1');
      console.log('   Username: user2, Password: user2');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

