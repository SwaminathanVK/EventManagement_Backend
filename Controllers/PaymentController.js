import Stripe from 'stripe';
import dotenv from 'dotenv';
import Ticket from '../Models/ticket.js';
import User from '../Models/user.js';
import Event from '../Models/Event.js';
import Registration from '../Models/Registration.js';
import { sendMail } from '../utils/sendEmail.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId, ticketType, quantity } = req.body;

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity value' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ticketTypeObj = event.ticketTypes.find(t => t.type === ticketType);
    if (!ticketTypeObj) return res.status(400).json({ message: 'Invalid ticket type' });

    if (ticketTypeObj.quantity < parsedQuantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    const amount = ticketTypeObj.price * parsedQuantity;
    const amountInCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${ticketType} - ${event.title}` },
          unit_amount: amountInCents,
        },
        quantity: parsedQuantity,
      }],
      success_url: `${process.env.CLIENT_URL}/user/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/user/payment-cancel`,
      metadata: {
        userId: userId.toString(),
        eventId: eventId.toString(),
        ticketType,
        quantity: parsedQuantity.toString(),
      },
      customer_email: req.user.email,
    });

    console.log('Stripe session created:', session.id);
    res.status(200).json({ url: session.url, sessionId: session.id });

  } catch (error) {
    console.error('Create Checkout Session Error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// Confirm Payment After Success
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'Session ID is required' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session:', session);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const { userId, eventId, ticketType, quantity } = session.metadata;
    const parsedQuantity = parseInt(quantity);

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ticketTypeObj = event.ticketTypes.find(t => t.type === ticketType);
    if (!ticketTypeObj) return res.status(400).json({ message: 'Invalid ticket type' });

    if (ticketTypeObj.quantity < parsedQuantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    // ✅ Create Tickets First
    const tickets = [];
    for (let i = 0; i < parsedQuantity; i++) {
      tickets.push(new Ticket({
        user: userId,
        event: eventId,
        ticketType,
        status: 'booked',
        price: ticketTypeObj.price,
        quantity: 1,
      }));
    }

    const createdTickets = await Ticket.insertMany(tickets);

    // ✅ Create Registration (After Tickets)
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      ticketType,
      quantity: parsedQuantity,
      paymentId: session.payment_intent,
      tickets: createdTickets.map(t => t._id), // Only if your schema supports this
    });

    // ✅ Reduce Quantity
    ticketTypeObj.quantity -= parsedQuantity;
    await event.save();

    // ✅ Send Email
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(400).json({ message: 'User email not found, cannot send confirmation email.' });
    }

    const subject = `🎟️ Ticket Booking Confirmation for ${event.title}`;
    const message = `
Hi ${user.name},

✅ Your booking for ${parsedQuantity} ticket(s) (${ticketType}) to the event "${event.title}" has been confirmed.

📅 Event Date: ${event.date.toDateString()}
📍 Location: ${event.location}

Thank you for your purchase!

Regards,
Eventify Team
`;

    await sendMail({ to: user.email, subject, text: message });

    res.status(200).json({ message: 'Payment confirmed, tickets booked, and email sent.' });

  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
  }
};