import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contactmanager';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected to MongoDB');
    
    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log(' MongoDB disconnected');
    });
    
  } catch (error) {
    console.error(' Database connection failed:', error);
    throw error;
  }
};