import Event from '../Models/Event.js';
import Ticket from '../Models/ticket.js';
import Registration from '../Models/Registration.js';


export const getOrganizerDashboard = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const events = await Event.find({ organizer: organizerId });

    const stats = {
      totalEvents: events.length,
      pending: events.filter(e => e.status === 'pending').length,
      approved: events.filter(e => e.status === 'approved').length,
      rejected: events.filter(e => e.status === 'rejected').length
    };

    res.status(200).json({
      message: "Organizer dashboard data fetched successfully",
      stats,
      events
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch organizer dashboard', error: error.message });
  }
};

//   Get all events created by the organizer
export const getMyEvents = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const events = await Event.find({ organizer: organizerId });
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};


//  Get all registrations for a specific event created by the organizer
export const getRegistrationsForMyEvent = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizer: organizerId });
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'name','email')
      .populate('tickets');

    res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
};

//  Organizer stats: overall events, revenue, ticket sold, and attendees
export const getOrganizerStats = async (req, res) => {
  try {
    const organizerId = req.user._id;

    const events = await Event.find({ organizer: organizerId });
    const eventIds = events.map(event => event._id);

    const tickets = await Ticket.find({ event: { $in: eventIds }, status: 'booked' });
    const registrations = await Registration.find({ event: { $in: eventIds } });

    const totalEvents = events.length;
    const totalTicketsSold = tickets.length;
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    const totalAttendees = registrations.length;

    res.status(200).json({
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      totalAttendees
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

//  Export attendee list for a specific event
export const exportAttendeeList = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;


    const event = await Event.findById(eventId);
    // console.log("Event:", event);
    
    // console.log("OrganizerId from token:", organizerId);
    // console.log("Event.createdBy:", event?.createdBy);


    if (!event || !event.organizer || event.createdBy.toString() !== createdBy.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this event' });
    }

    const attendees = await Ticket.find({ event: eventId, status: 'booked' })
      .populate('user','name email');

      const list = attendees.map(att => {
        console.log("Attendee Entry:", att);
        return {
          name: att.user?.name || 'N/A',
          email: att.user?.email || 'N/A',
          ticketType: att.type
        };
      });

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export attendee list', error: error.message });
  }
};

// View stats of individual events (event-wise analytics)
export const getEventWiseStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;

    const event = await Event.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const tickets = await Ticket.find({ event: eventId, status: 'booked' });
    const registrations = await Registration.find({ event: eventId });

    const totalTicketsSold = tickets.length;
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    const totalAttendees = registrations.length;

    res.status(200).json({
      event: event.title,
      totalTicketsSold,
      totalRevenue,
      totalAttendees
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get event stats', error: error.message });
  }
};
