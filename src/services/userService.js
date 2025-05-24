import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const initializeUsers = async () => {
  try {
    const defaultUsers = [
      { username: 'user1', password: 'user1', role: 'user' },
      { username: 'user2', password: 'user2', role: 'admin' },
    ];

    for (const userData of defaultUsers) {
      const userExists = await User.findOne({ username: userData.username });
      
      if (!userExists) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ 
          username: userData.username, 
          password: hashedPassword,
          role: userData.role
        });
        console.log(`User ${userData.username} (${userData.role}) created`);
      }
    }
  } catch (error) {
    console.error('Error initializing users:', error);
    throw error;
  }
};

export const validateUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  return isValidPassword ? user : null;
};