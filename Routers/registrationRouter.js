import express from 'express';
import {
  getUserRegistrations,
  getEventRegistrations,
  getRegistrationById,
} from '../Controllers/registrationController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/my-tickets', protect, getUserRegistrations); // GET /api/registration/user
router.get('/event/:eventId', protect, getEventRegistrations); // GET /api/registration/event/:eventId
router.get('/:registrationId', protect, getRegistrationById); // GET /api/registration/:registrationId

export default router;
