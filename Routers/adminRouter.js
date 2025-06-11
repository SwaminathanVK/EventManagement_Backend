import express from 'express';
import {  updateEventApproval, getAllRegistrations, getAllUsers, getAdminDashboard, getAllOrganizers } from '../Controllers/adminController.js';
import { protect, isAdmin } from '../Middlewares/authMiddleware.js';
import { createEvent, getAllEvents, getPendingEvents } from '../Controllers/eventController.js';

const router = express.Router();

router.use(protect, isAdmin);


router.post('/events/create',protect, isAdmin,createEvent)
// router.get('/dashboard', protect, isAdmin, getAdminDashboard);
router.get('/organizers', protect, isAdmin, getAllOrganizers);

router.get('/users',getAllUsers)
router.get('/allEvents',getAllEvents)

router.put('/events/:eventId/status', updateEventApproval);
router.get('/registrations', getAllRegistrations);

router.get('/pending-events', getPendingEvents);
router.get('/dashboard', getAdminDashboard);

// router.put('/upgrade-role/:user:Id')

export default router;
