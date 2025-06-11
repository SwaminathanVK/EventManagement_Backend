import User from '../Models/user.js';
import Event from '../Models/Event.js';
import Ticket from '../Models/ticket.js';
import Registration from '../Models/Registration.js';


export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      newUsersThisMonth,
      totalEvents,
      pendingEvents,
      approvedEvents,
      totalRegistrations,
      revenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 
        createdAt: { $gte: new Date(new Date().setDate(1)) } 
      }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'approved' }),
      Registration.countDocuments(),
      Ticket.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.status(200).json({
      stats: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth
        },
        events: {
          total: totalEvents,
          pending: pendingEvents,
          approved: approvedEvents
        },
        registrations: totalRegistrations,
        revenue: revenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch dashboard data', 
      error: error.message 
    });
  }
};

export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' }).select('-password');
    res.status(200).json({ message: 'Organizers fetched successfully', organizers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch organizers', error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ events });
  } catch (error) {
    console.error('Get All Events Error:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Approve or Reject Event
export const updateEventApproval = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = status;
    await event.save();

    res.status(200).json({ message: `Event ${status} successfully`, event });
  } catch (error) {
    console.error('Update Event Approval Error:', error);
    res.status(500).json({ message: 'Failed to update event status', error: error.message });
  }
};

// View all registrations
export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'name  email')
      .populate('event', 'title')
      .populate('ticket');

    res.status(200).json({ registrations });
  } catch (error) {
    console.error('Get All Registrations Error:', error);
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
};

export const getPendingEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [events, count] = await Promise.all([
      Event.find({ status: 'pending' })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments({ status: 'pending' })
    ]);

    res.status(200).json({
      events,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch pending events', 
      error: error.message 
    });
  }
};
