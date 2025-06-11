// src/Routers/authRouter.js
import express from 'express';
import { register, login, getMe } from '../Controllers/authController.js'; // <--- Import getMe
import { protect } from '../Middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/register', register);
router.post('/login', login);


// It should be protected so only logged-in users can access it
router.get('/me', protect, getMe); 

export default router;