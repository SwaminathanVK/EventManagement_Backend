import Event from '../Models/Event.js';

// Create a new event
export const createEvent = async (req, res) => {
  try {

    const userId = req.user?._id;
    if (!userId){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { title, description, date, location, category, ticketTypes, image } = req.body;

    // Basic validation
    if (!title || !description || !date || !location || !category || !ticketTypes || !Array.isArray(ticketTypes)) {
      return res.status(400).json({ message: 'Please provide all required event details' });
    }

    // Role check: only 'organizer' and 'admin' can create events
    if (!['organizer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only organizers or admins can create events' });
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      ticketTypes,
      image,
      createdBy: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
    });

    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

// Admin: Approve or reject event
export const approveEvent = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can approve events' });
      }
  
      const { eventId } = req.params;
      const event = await Event.findById(eventId);
  
      if (!event) return res.status(404).json({ message: 'Event not found' });
  
      event.status = 'approved';
      await event.save();
  
      res.status(200).json({ message: 'Event approved successfully', event });
    } catch (err) {
      res.status(500).json({ message: 'Failed to approve event', error: err.message });
    }
};



//get all events

export const getEvents = async (req, res) => {
  try {
    let {
      keyword, category, location, startDate, endDate,
      minPrice, maxPrice, sortBy, page, limit
    } = req.query;

    const query = { status: 'approved',isDeleted: { $ne: true } };
    if (keyword) query.title = { $regex: keyword, $options: 'i' };
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minPrice || maxPrice) {
      query['ticketTypes.price'] = {};
      if (minPrice) query['ticketTypes.price'].$gte = Number(minPrice);
      if (maxPrice) query['ticketTypes.price'].$lte = Number(maxPrice);
    }
   //pagination
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    let sort = {};
    if (sortBy === 'priceAsc') sort = { 'ticketTypes.price': 1 };
    else if (sortBy === 'priceDesc') sort = { 'ticketTypes.price': -1 };
    else if (sortBy === 'dateAsc') sort = { date: 1 };
    else if (sortBy === 'dateDesc') sort = { date: -1 };

    const events = await Event.find(query).sort(sort).skip(skip).limit(limit);
    const count = await Event.countDocuments(query);

    res.json({ events, count, page, pages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Get all events (Admin can see all, users see only approved)
export const getAllEvents = async (req, res) => {
  try {
    const role = req.user?.role;
    const userId = req.user?._id;
    let events =[];
      if(role === 'admin'){
        events = await Event.find().populate('createdBy', 'name email')
      }else if (role === 'organizer') {
        events = await Event.find({ createdBy: userId }).populate('createdBy', 'name email');
      }else{
        return res.status(403).json({ message: 'Access denied' });
      }
    res.status(200).json({ events });
  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// update a event
export const updateEvent = async(req,res) => {
    try {
      const eventID = req.params.id;
      const event = await Event.findById(eventID);
      if (!event) return res.status(404).json({ message: 'Event not found' });
  
      // Organizer can only update own pending event
      if (req.user.role === 'organizer'||req.user.role === 'admin') {
        if (!event.createdBy || event.createdBy.toString()  !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized to update this event' });
        }
        if (event.status !== 'pending') {
          return res.status(403).json({ message: 'Only pending events can be updated' });
        }
        req.body.status = 'pending'; 
      }
  
      // Allow updates
      const updatedEvent = await Event.findByIdAndUpdate(eventID, req.body, { new: true });
      res.status(200).json({ message: 'Event updated successfully', data: updatedEvent });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

//delete a event 

export const deleteEvent = async (req,res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check permission
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(eventId);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Public: Get all approved events
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isOwner = event.createdBy?._id?.toString() === req.user?._id?.toString();

    if (event.status !== 'approved' && req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.status(200).json({event});
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

// Admin rejects an event
export const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const event = await Event.findById(eventId).populate('createdBy', 'email name');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = 'rejected';
    event.rejectionReason = reason;
    await event.save();

    // Send rejection notification (pseudo-code)
    sendNotification(event.createdBy.email, {
      type: 'event-rejected',
      eventId: event._id,
      eventTitle: event.title,
      reason
    });

    res.status(200).json({ 
      message: 'Event rejected successfully',
      event 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to reject event', 
      error: error.message 
    });
  }
};


export const getOrganizerEvents = async(req,res)=>{
  try {
    const events = await Event.find({ 
      createdBy: req.user.id,
      status: { $ne: 'deleted' } // Exclude deleted events
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}

export const getPendingEvents = async (req,res) =>{
  try {
    const events = await Event.find({ 
      status: 'pending',
      isDeleted: false 
    })
    .populate('organizer', 'name email')
    .sort({ submittedAt: 1 }); // Oldest first

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}