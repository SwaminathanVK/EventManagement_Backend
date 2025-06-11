import express from 'express';
import { protect, isUser } from '../Middlewares/authMiddleware.js';
import { createCheckoutSession, confirmPayment } from '../Controllers/PaymentController.js';

const router = express.Router();

// Route to create Stripe checkout session - accessible to authenticated users (user, organizer, admin maybe)
router.post('/checkout', protect, isUser, createCheckoutSession);

// Route to confirm payment after successful payment - accessible to authenticated users
router.post('/confirm/payment', protect, isUser, confirmPayment);

export default router;
