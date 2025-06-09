import express from 'express';
import { createEvent,  getEvents, getEventById, updateEvent, deleteEvent, approveEvent, rejectEvent, getPendingEvents, getOrganizerEvents, } from '../Controllers/eventController.js';
import { isAdmin, isAdminOrOrganizer, isOrganizer, protect,  } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Get all approved events with filters - public
router.get('/', getEvents);



//organizer
// Create event - 
router.post('/OrgcreateEvent', protect,isOrganizer , createEvent);

// Create event - 
router.post('/AdmcreateEvent', protect,isAdmin , createEvent);

// Update event - only organizers allowed
router.put('/updateEvent/:id', protect, isOrganizer,updateEvent);

// Delete event - only organizers allowed
router.delete('/deleteEvent/:id', protect, isAdminOrOrganizer, deleteEvent);

// Admin
router.put('/:id/approve', protect, isAdmin, approveEvent);
router.put('/:id/reject', protect, isAdmin, rejectEvent);

//Get only approved events (public)
router.get('/:id', getEventById);

router.get('/organizer/events', protect, isOrganizer, getOrganizerEvents);
router.get('/pending', protect, isAdmin, getPendingEvents);


export default router;
