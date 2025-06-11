import express from 'express';
import { protect } from '../Middlewares/authMiddleware.js';
import { getUserProfile,  updateUserProfile } from '../Controllers/userController.js'

const router = express.Router();


router.get('/profile', protect, getUserProfile);
router.put('/putprofile',protect, updateUserProfile)

export default router;