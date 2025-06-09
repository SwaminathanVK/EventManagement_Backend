import express from 'express';
import {
  getMyEvents,
  getRegistrationsForMyEvent,
  getOrganizerStats,
  exportAttendeeList,
  getEventWiseStats,
  getOrganizerDashboard
} from '../Controllers/organizerController.js';

import { isAdmin, isAdminOrOrganizer, protect } from '../Middlewares/authMiddleware.js';
import { isOrganizer } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, isOrganizer, getOrganizerDashboard);



//  Get all events created by the organizer
router.get('/my-events', protect, isOrganizer, getMyEvents);

//  Get all registrations (attendees) for a specific event
router.get('/my-events/:eventId/registrations', protect, isOrganizer, getRegistrationsForMyEvent);

//  Get overall stats for the organizer (total events, revenue, tickets sold, attendees) and admin can view
router.get('/stats/overview', protect, isOrganizer, getOrganizerStats);
router.get('/stats/overview/toadmin',protect,isAdmin,getOrganizerStats)

//  Export attendee list for an event
router.get('/attendees/:eventId', protect, isOrganizer, exportAttendeeList);

//  Event-wise analytics (stats for a specific event)
router.get('/stats/event/:eventId', protect, isOrganizer, getEventWiseStats);
router.get('/stats/event/toadmin/:eventId', protect, isAdmin, getEventWiseStats);

export default router;
