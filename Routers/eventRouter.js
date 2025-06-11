// src/Routers/eventRouter.js

import express from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    approveEvent,
    rejectEvent,
    getPendingEvents,
    getOrganizerEvents,
    getApprovedEvents // <--- Ensure this is imported
} from '../Controllers/eventController.js';
import { isAdmin, isAdminOrOrganizer, isOrganizer, protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES (Accessible to everyone) ---
router.get('/approved', getApprovedEvents); // <--- This line must be present and not commented out
router.get('/', getEvents);
router.get('/:eventId', getEventById);

// --- PROTECTED ROUTES (Requiring authentication and specific roles) ---
router.post('/', protect, isAdminOrOrganizer, createEvent);
router.get('/organizer/my-events', protect, isOrganizer, getOrganizerEvents);
router.put('/:eventId', protect, isAdminOrOrganizer, updateEvent);
router.delete('/:eventId', protect, isAdminOrOrganizer, deleteEvent);
router.get('/pending', protect, isAdmin, getPendingEvents);
router.put('/:eventId/approve', protect, isAdmin, approveEvent);
router.put('/:eventId/reject', protect, isAdmin, rejectEvent);

export default router;