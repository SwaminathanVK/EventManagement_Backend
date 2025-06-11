// routes/authRoutes.js
import express from 'express';
import { register, login, getCurrentUser } from '../Controllers/authController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register',register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser); 

export default router;
