import express from 'express';
import { bookTicket, cancelTicket, getUserTickets, transferTicket, } from '../Controllers/ticketController.js';

import { isUser, protect } from '../Middlewares/authMiddleware.js'; // Auth middleware to secure routes

const router = express.Router();

// All routes protected - user must be logged in

// POST /api/tickets/book  --> book a ticket
router.post('/book', protect , isUser, bookTicket);

// PUT /api/tickets/cancel/:ticketId  --> cancel a ticket by ticketId
router.put('/cancel/:ticketId', protect, isUser ,cancelTicket);

// PUT /api/tickets/transfer/:ticketId  --> transfer ticket to another user
router.put('/transfer/:ticketId', protect, isUser ,transferTicket);

// GET /api/tickets/mytickets - get all tickets for logged-in user
router.get('/my-tickets', protect,isUser, getUserTickets);

export default router;
