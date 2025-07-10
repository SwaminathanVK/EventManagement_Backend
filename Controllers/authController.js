import User from '../Models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
// If you are using 'express-async-handler', import it here as well
// import asyncHandler from 'express-async-handler';

dotenv.config();
if (!process.env.JWT_SECRET) throw new Error('JWT secret not set in environment variables');

export const register = async (req, res) => {
  try {
    const { name, email, password , role} = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role:role||'user',
    });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2d' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id,
        name: user.name,
        email: user.email,
        role: user.role }
      });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Get authenticated user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  // The 'protect' middleware (from authMiddleware.js) should have
  // attached the authenticated user's data (decoded from the token) to `req.user`.
  // This `req.user` object is then available in this controller.

  // In your protect middleware, you should be doing something like:
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // req.user = await User.findById(decoded.id).select('-password');

  if (req.user) { // Check if req.user was set by the protect middleware
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      // You can add more user profile fields here that you want to return
      // e.g., avatar: req.user.avatar
    });
  } else {
    // This else block might technically be redundant if 'protect' middleware
    // already handles unauthorized access by sending a 401.
    // However, it's good for clarity or if 'protect' just sets req.user to null/undefined.
    res.status(401).json({ message: 'Not authorized, user data not found.' });
  }
};