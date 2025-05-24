import { User } from '../models/User.js';
import { Contact } from '../models/Contact.js';
import bcrypt from 'bcryptjs';
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        message: 'Username must be at least 3 characters long'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        message: 'Username already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username.trim(),
      password: hashedPassword,
      role: role
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Valid role (user or admin) is required'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.userId) {
      return res.status(403).json({
        message: 'Cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'User role updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    if (user._id.toString() === req.user.userId) {
      return res.status(403).json({
        message: 'Cannot delete your own account'
      });
    }
    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'Cannot delete an admin user'
      });
    }
    if( user.contacts && user.contacts.length > 0) {
      return res.status(400).json({
        message: 'User has contacts and cannot be deleted'
      });
    }
    
    user.destroy();
    return res.json({
      message: 'User deleted successfully'
    });
} catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  } }