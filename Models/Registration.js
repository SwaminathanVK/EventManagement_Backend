// Models/Registration.js
import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true }, // Changed from 'tickets' array
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true }); // Add timestamps for createdAt, updatedAt

const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
export default Registration;