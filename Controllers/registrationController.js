import Registration from '../Models/Registration.js';
import Event from '../Models/Event.js';
import User from '../Models/user.js';
import Tickets from '../Models/ticket.js';

// Get all registrations for the logged-in user
export const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Fetch registrations with pagination
    const registrations = await Registration.find({ user: userId })
      .populate('event', 'title date location')
      .populate('tickets')
      .populate('payment')
      .skip(skip)
      .limit(limit)
      .sort({ registeredAt: -1 })
      .exec();

    // Count total registrations for the user (to calculate total pages)
    const total = await Registration.countDocuments({ user: userId });

    res.status(200).json({ registrations, total });
  } catch (error) {
    console.error('Get User Registrations Error:', error);
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
};

// Get all registrations for a specific event (admin/organizer)
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'name email')
      .populate('tickets');

    res.status(200).json({ registrations });
  } catch (error) {
    console.error('Get Event Registrations Error:', error);
    res.status(500).json({ message: 'Failed to fetch event registrations', error: error.message });
  }
};

// Get registration details by ID
export const getRegistrationById = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId)
      .populate('user', 'name email')
      .populate('event', 'title date location')
      .populate('tickets');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.status(200).json({ registration });
  } catch (error) {
    console.error('Get Registration By ID Error:', error);
    res.status(500).json({ message: 'Failed to fetch registration details', error: error.message });
  }
};
