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
  getApprovedEvents    // <--- Ensure this is imported! It was missing in your import list.
} from '../Controllers/eventController.js';
import { isAdmin, isAdminOrOrganizer, isOrganizer, protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES (Accessible to everyone) ---
// 1. Get all APPROVED events (specific filter)
router.get('/approved', getApprovedEvents);

// 2. Get all events (can be filtered by query params like /api/events?category=Music)
//    This might also serve as the public events listing.
router.get('/', getEvents); // GET /api/events/

// 3. Get a single event by its ID
//    This generic ID route MUST come AFTER specific static routes like '/approved' or '/pending'.
router.get('/:eventId', getEventById); // GET /api/events/:eventId


// --- PROTECTED ROUTES (Requiring authentication and specific roles) ---

// Organizer & Admin: Create Event
// You had two create event routes. Consolidating or keeping separate based on exact backend logic.
// Assuming 'createEvent' is the general controller for creating, accessed by specific roles.
router.post('/', protect, isAdminOrOrganizer, createEvent); // POST /api/events/ (can be /api/events/create)

// Organizer: Get Events created by the current Organizer
router.get('/organizer/my-events', protect, isOrganizer, getOrganizerEvents); // Path changed for clarity

// Organizer & Admin: Update Event
router.put('/:eventId', protect, isAdminOrOrganizer, updateEvent); // PUT /api/events/:eventId

// Organizer & Admin: Delete Event
router.delete('/:eventId', protect, isAdminOrOrganizer, deleteEvent); // DELETE /api/events/:eventId

// Admin: Get All Pending Events
router.get('/pending', protect, isAdmin, getPendingEvents); // GET /api/events/pending

// Admin: Approve/Reject Event
router.put('/:eventId/approve', protect, isAdmin, approveEvent); // PUT /api/events/:eventId/approve
router.put('/:eventId/reject', protect, isAdmin, rejectEvent);   // PUT /api/events/:eventId/reject

export default router;