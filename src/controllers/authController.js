import jwt from 'jsonwebtoken';
import { validateUser } from '../services/userService.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password required' 
      });
    }

    const user = await validateUser(username, password);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({ 
      token, 
      username: user.username,
      userId: user._id,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};