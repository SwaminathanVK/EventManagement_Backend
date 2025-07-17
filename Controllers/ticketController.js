import Ticket from '../Models/ticket.js';
import Event from '../Models/Event.js';
import Registration from '../Models/Registration.js';
import User from '../Models/user.js';
import { sendMail } from '../utils/sendEmail.js'; // Placeholder for email utility

// Book ticket(s) for an event
export const bookTicket = async (req, res) => {
  try {
      const { eventId, userId, quantity } = session.metadata;
    const ticketType = session.metadata.ticketType?.toLowerCase();
    const normalizedTicketType = ticketType.toLowerCase();

    

    // Validate input
    if (!eventId || !ticketType || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid booking details' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find ticket type details in event
    const ticketInfo = event.ticketTypes.find(ticket => ticket.type.toLowerCase() === normalizedTicketType);
    if (!ticketInfo) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    if (ticketInfo.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    const existingPending = await Ticket.find({
      user: userId,
      event: eventId,
      ticketType : ticketType,
      status: 'pending',
    });

    const existingQuantity = existingPending.reduce((sum,t)=> sum + t.quantity,0);
    if(existingQuantity > 0){
      return res.status(400).json({message: 'You already have a pending ticket. Complete or cancel it before booking again.'
        
      });
    }
   
    const totalamount = ticketInfo.price * quantity
    // Create ticket document with status 'booked'
    const ticket = new Ticket({
      event: eventId,
      user: userId,
      ticketType: ticketType,
      price: ticketInfo.price,
      quantity,
      totalamount,
      status: 'pending'
    });
    await ticket.save();
    res.status(201).json({
    message: 'Ticket created. Awaiting payment confirmation.', ticket,});

    // Reduce available quantity in event
    ticketInfo.quantity -= quantity;
    await event.save();

    // Link ticket to registration (create or update)
    let registration = await Registration.findOne({ user: userId, event: eventId });
    if (!registration) {
      registration = new Registration({
        user: userId,
        event: eventId,
        tickets: [ticket._id],
      });
    } else {
      registration.tickets.push(ticket._id);
    }
    await registration.save();
  } catch (error) {
    console.error('Book Ticket Error:', error);
    res.status(500).json({ message: 'Failed to book ticket', error: error.message });
  }
};

// Cancel a booked ticket
export const cancelTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId).populate('event');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this ticket' });
    }

    if (ticket.status !== 'booked') {
      return res.status(400).json({ message: 'Ticket is not booked or already cancelled' });
    }

    ticket.status = 'cancelled';
    await ticket.save();

    // Increase available quantity back in event
    const event = ticket.event;
    const ticketInfo = event.ticketTypes.find(t => t.type === ticket.ticketType);
    if (ticketInfo) {
      ticketInfo.quantity += ticket.quantity;
      await event.save();
    }

    // Remove ticket from registration
    const registration = await Registration.findOne({ user: userId, event: ticket.event._id });
    if (registration) {
      registration.tickets = registration.tickets.filter(tid => tid.toString() !== ticketId);
      await registration.save();
    }

    // Send email confirmation (placeholder)
    await sendMail({
      to: req.user.email,
      subject: 'Ticket Cancellation Confirmation',
      text: `Your ticket (${ticket.ticketType}) for event "${event.title}" has been cancelled successfully.`,
    });

    res.status(200).json({ message: 'Ticket cancelled successfully', ticket });
  } catch (error) {
    console.error('Cancel Ticket Error:', error);
    res.status(500).json({ message: 'Failed to cancel ticket', error: error.message });
  }
};

// Transfer ticket to another user
export const transferTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;
    const { newUserEmail } = req.body;

    if (!newUserEmail) {
      return res.status(400).json({ message: 'New user email is required for transfer' });
    }

    const ticket = await Ticket.findById(ticketId).populate('event');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to transfer this ticket' });
    }

    if (ticket.status !== 'booked') {
      return res.status(400).json({ message: 'Ticket is not booked or already cancelled/transferred' });
    }

    // Find new user by email
    const newUser = await User.findOne({ email: newUserEmail });
    if (!newUser) {
      return res.status(404).json({ message: 'New user not found' });
    }

    // Update ticket owner
    ticket.user = newUser._id;
    ticket.status = 'transferred';
    await ticket.save();

    // Update registration for old user
    const oldRegistration = await Registration.findOne({ user: userId, event: ticket.event._id });
    if (oldRegistration) {
      oldRegistration.tickets = oldRegistration.tickets.filter(tid => tid.toString() !== ticketId);
      await oldRegistration.save();
    }

    // Update registration for new user (create if none)
    let newRegistration = await Registration.findOne({ user: newUser._id, event: ticket.event._id });
    if (!newRegistration) {
      newRegistration = new Registration({
        user: newUser._id,
        event: ticket.event._id,
        tickets: [ticket._id],
      });
    } else {
      newRegistration.tickets.push(ticket._id);
    }
    await newRegistration.save();

    // Send email notifications to both users (placeholders)
    await sendMail({
      to: req.user.email,
      subject: 'Ticket Transfer Confirmation',
      text: `Your ticket (${ticket.ticketType}) for event "${ticket.event.title}" has been transferred to ${newUser.email}.`,
    });

    await sendMail({
      to: newUser.email,
      subject: 'Ticket Transfer Received',
      text: `You have received a ticket (${ticket.ticketType}) for event "${ticket.event.title}".`,
    });

    res.status(200).json({ message: 'Ticket transferred successfully', ticket });
  } catch (error) {
    console.error('Transfer Ticket Error:', error);
    res.status(500).json({ message: 'Failed to transfer ticket', error: error.message });
  }
};

// Get all tickets booked by the logged-in user
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find tickets associated with the user, populate event info if needed
    const tickets = await Ticket.find({ user: userId }).populate('event', 'title date location');

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Get User Tickets Error:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};