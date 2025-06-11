import Event from '../Models/Event.js';
// If you are using 'express-async-handler', import it here as well
// import asyncHandler from 'express-async-handler';

// --- Helper for simplified error handling (if not using express-async-handler for every export)
const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// If you are using 'express-async-handler' middleware on your routes, you don't need catchAsync
// Instead, wrap each export function: `export const getEvents = asyncHandler(async (req, res) => { ... });`

// --- Existing Controllers (Modified or Reviewed) ---

// Create a new event
export const createEvent = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Destructure only the fields that are sent from your AdminCreateEventPage.jsx
        const { title, description, date, location, capacity, price } = req.body;

        // --- Basic Validation based on the fields received from the frontend ---
        if (!title || !description || !date || !location || !capacity || !price) {
            return res.status(400).json({ message: 'Please provide all required event details: title, description, date, location, capacity, and price.' });
        }

        // --- More Robust Type/Value Validation ---
        const numericCapacity = Number(capacity);
        const numericPrice = Number(price);

        if (isNaN(numericCapacity) || numericCapacity <= 0) {
            return res.status(400).json({ message: 'Capacity must be a positive number.' });
        }
        if (isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({ message: 'Price must be a non-negative number.' });
        }
        if (new Date(date).toString() === 'Invalid Date') {
            return res.status(400).json({ message: 'Please provide a valid date and time.' });
        }
        // Optional: Ensure the event date is in the future
        if (new Date(date) < new Date()) {
             return res.status(400).json({ message: 'Event date must be in the future.' });
        }


        // --- Construct 'ticketTypes' and handle 'category', 'image' for the Event Model ---
        // Your Event model likely expects `ticketTypes` as an array of objects.
        // We'll create one 'Standard' ticket type using the provided price and capacity.
        const ticketTypes = [{
            name: 'Standard', // Default ticket type name
            price: numericPrice,
            capacity: numericCapacity,
            available: numericCapacity // Initially all tickets are available
        }];

        // Assuming 'category' and 'image' are optional or will be handled later.
        // Provide defaults or make sure your Mongoose schema allows them to be missing/null.
        // If your Mongoose schema requires 'category' and 'image', you MUST add inputs for them in your frontend form.
        const category = req.body.category || 'General'; // Default category if not provided by frontend
        const image = req.body.image || null; // Default image to null if not provided by frontend


        const event = new Event({
            title,
            description,
            date: new Date(date), // Ensure it's a proper Date object
            location,
            category,        // Use the default or provided category
            ticketTypes,     // Use the constructed ticketTypes array
            image,           // Use the default or provided image
            createdBy: userId,
            status: req.user.role === 'admin' ? 'approved' : 'pending', // Admin can directly approve
        });

        await event.save();
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error('Create Event Error:', error);
        // Provide more detailed error messages for Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
};

// Admin: Approve event
export const approveEvent = async (req, res) => {
    try {
        // Role check is likely handled by isAdmin middleware on the route
        // if (req.user.role !== 'admin') {
        //   return res.status(403).json({ message: 'Only admin can approve events' });
        // }

        const { eventId } = req.params; // Use eventId as named in router
        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.status = 'approved';
        await event.save();

        res.status(200).json({ message: 'Event approved successfully', event });
    } catch (err) {
        res.status(500).json({ message: 'Failed to approve event', error: err.message });
    }
};

// Public: Get all events (can be filtered by query params, default status: 'approved')
// This is your main public listing, already filters by status: 'approved'
export const getEvents = async (req, res) => {
    try {
        let {
            keyword, category, location, startDate, endDate,
            minPrice, maxPrice, sortBy, page, limit
        } = req.query;

        const query = { status: 'approved', isDeleted: { $ne: true } }; // Already filters for approved
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
        else sort = { createdAt: -1 }; // Default sort if none specified

        const events = await Event.find(query).sort(sort).skip(skip).limit(limit);
        const count = await Event.countDocuments(query);

        res.json({ events, count, page, pages: Math.ceil(count / limit) });
    } catch (error) {
        console.error('Get Events Error:', error); // Added console.error
        res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
};

// Public: Get all approved events (explicitly for the /api/events/approved route)
// This function can simply call your getEvents function with no query parameters,
// as getEvents already filters for 'approved' status.
export const getApprovedEvents = async (req, res) => {
    // You can technically just call getEvents here if its logic is suitable
    // Or write a simpler query specifically for approved events if getEvents is too complex
    try {
        const events = await Event.find({ status: 'approved', isDeleted: { $ne: true } })
                                 .populate('createdBy', 'name email'); // Populate if needed
        res.status(200).json({ events });
    } catch (error) {
        console.error('Get Approved Events Error:', error);
        res.status(500).json({ message: 'Failed to fetch approved events', error: error.message });
    }
};


// Admin/Organizer: Get All Events (Admin sees all, Organizer sees own)
export const getAllEvents = async (req, res) => {
    try {
        const role = req.user?.role;
        const userId = req.user?._id;
        let events = [];

        if (role === 'admin') {
            events = await Event.find().populate('createdBy', 'name email');
        } else if (role === 'organizer') {
            events = await Event.find({ createdBy: userId }).populate('createdBy', 'name email');
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.status(200).json({ events });
    } catch (error) {
        console.error('Get All Events (Admin/Organizer) Error:', error);
        res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
};

// Update an event
export const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId; // Use eventId as named in router
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // --- Refined Authorization and Status Update Logic ---
        if (req.user.role === 'admin') {
            // Admin can update any event and can change its status
            // The status can be changed if it's explicitly in req.body, otherwise keep current
            const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
            return res.status(200).json({ message: 'Event updated successfully (Admin)', data: updatedEvent });

        } else if (req.user.role === 'organizer') {
            // Organizer can only update their own events that are currently 'pending'
            if (!event.createdBy || event.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this event (not owner)' });
            }
            if (event.status !== 'pending') {
                return res.status(403).json({ message: 'Only pending events can be updated by organizers' });
            }

            // Organizer updates always reset status to 'pending' to require re-approval if needed
            const updates = { ...req.body, status: 'pending' };
            const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, { new: true });
            return res.status(200).json({ message: 'Event updated successfully (Organizer)', data: updatedEvent });

        } else {
            // Should be caught by middleware, but good as a fallback
            return res.status(403).json({ message: 'Access denied to update event' });
        }

    } catch (error) {
        console.error('Update Event Error:', error); // Added console.error
        res.status(500).json({ error: error.message });
    }
};

// Delete an event
export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId; // Use eventId as named in router
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check permission
        // Admin can delete any event. Organizer can only delete their own events.
        if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(eventId);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete Event Error:', error); // Added console.error
        res.status(500).json({ error: error.message });
    }
}


// Get a single event by ID (public access logic is robust)
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email'); // Use eventId
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Determine if the current user is an admin or the event owner
        const isAdmin = req.user?.role === 'admin';
        const isOwner = event.createdBy?._id?.toString() === req.user?._id?.toString();

        // Condition for allowing access:
        // 1. Event status is 'approved' (publicly viewable)
        // OR
        // 2. User is an admin (can see all events)
        // OR
        // 3. User is the owner of the event (can see their own events, regardless of status)
        if (event.status === 'approved' || isAdmin || isOwner) {
            return res.status(200).json({ event });
        } else {
            return res.status(403).json({ message: 'Unauthorized access to this event status.' });
        }

    } catch (error) {
        console.error('Get Event By ID Error:', error);
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

        // Send rejection notification (pseudo-code) - Assuming sendNotification is defined elsewhere
        // if (event.createdBy?.email) {
        //   sendNotification(event.createdBy.email, {
        //     type: 'event-rejected',
        //     eventId: event._id,
        //     eventTitle: event.title,
        //     reason
        //   });
        // }


        res.status(200).json({
            message: 'Event rejected successfully',
            event
        });
    } catch (error) {
        console.error('Reject Event Error:', error);
        res.status(500).json({
            message: 'Failed to reject event',
            error: error.message
        });
    }
};


export const getOrganizerEvents = async (req, res) => {
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
        console.error('Get Organizer Events Error:', err); // Added console.error
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

export const getPendingEvents = async (req, res) => {
    try {
        const events = await Event.find({
            status: 'pending',
            isDeleted: { $ne: true } // Assuming 'isDeleted' field, exclude soft-deleted events
        })
            .populate('createdBy', 'name email') // Populate 'createdBy' as it's the organizer
            .sort({ createdAt: 1 }); // Assuming a 'createdAt' field, sort by submission date

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        console.error('Get Pending Events Error:', err); // Added console.error
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}