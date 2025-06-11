import User from '../Models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.JWT_SECRET) throw new Error('JWT secret not set in environment variables');

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;  
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name, 
      email,
      password: hashedPassword,
    });
    await newUser.save();
  
    return res.status(201).json({ message: 'User registered successfully' });
  }catch (error) {
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

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};