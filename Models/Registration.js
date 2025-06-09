import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  registeredAt: { type: Date, default: Date.now }
});

const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
export default Registration;
