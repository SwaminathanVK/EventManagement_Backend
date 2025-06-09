import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  ticketTypes: [{
    type: { type: String, required: true ,
       enum: ['VIP','General'],
        default:'General'},  // e.g. General, VIP
    price: { type: Number, required: true },
    quantity: { type: Number, default: 400 }
  }],
  time: String,
  location: {type:String , required: true}, 
  category: String,
  images: [String],
  videos: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule: [{ // For Event Schedules
    sessionTitle: String,
    speaker: String,
    startTime: Date,
    endTime: Date,
    description: String,
  }],
  status: { type: String, 
  enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: String, 
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
  
{ timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;