import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketTypes: [
    { type: String, required: true },
    {enum:["general","VIP"],
       default: "general"}
  ],
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, 
    enum: ['pending','booked', 'cancelled', 'transferred'], 
    default: 'pending' },
  paymentIntentId: String, // Stripe payment intent id
}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

export default Ticket;
