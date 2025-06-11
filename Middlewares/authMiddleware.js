import jwt from 'jsonwebtoken';
import User from '../Models/user.js';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not defined in environment');
}

// Middleware to verify JWT token and attach user to request
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const token = authHeader.split(' ') [1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

export const isAdminOrOrganizer = (req, res, next) => {
  // Ensure req.user exists from the 'protect' middleware before accessing its properties
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required for role check.' });
  }

  if (req.user.role === 'admin' || req.user.role === 'organizer') {
    next(); // Only call next() if the condition is met
  } else {
    return res.status(403).json({ message: 'Access denied. Admins or Organizers only.' }); // Return here if condition is not met
  }
  
};

// Middleware to check admin role
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Middleware to check organizer role
export const isOrganizer = (req, res, next) => {
  if (req.user?.role !== 'organizer') {
    return res.status(403).json({ message: 'Access denied. Organizers only.' });
  };
  next();
}

// Middleware to check user role
export const isUser = (req, res, next) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ message: 'Access denied. Users only.' });
  }
  next();
};
