// src/Routers/authRouter.js
import express from 'express';
import { register, login, getMe } from '../Controllers/authController.js'; // <--- Import getMe
import { protect } from '../Middlewares/authMiddleware.js'; // <--- Import your authentication middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Add this route to fetch the authenticated user's profile
// It should be protected so only logged-in users can access it
router.get('/me', protect, getMe); // <--- ADD THIS LINE

export default router;