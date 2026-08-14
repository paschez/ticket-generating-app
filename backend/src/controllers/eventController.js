import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import errorResponse from '../utils/errorResponse.js';

const getEvents = async (req, res, next) => {
  try {
    const { category, search, date } = req.query;
    const filter = { status: 'published' };

    if (category) filter.category = category;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() + 1);
      filter.date = { $gte: selectedDate, $lt: nextDate };
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name')
      .sort({ date: 1 });

    const formattedEvents = events.map((event) => ({
      ...event.toObject(),
      remainingTickets: Math.max(event.totalTickets - event.ticketsSold, 0),
    }));

    res.json(formattedEvents);
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name');

    if (!event) {
      return next(errorResponse('Event not found', 404));
    }

    res.json({
      ...event.toObject(),
      remainingTickets: Math.max(event.totalTickets - event.ticketsSold, 0),
    });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      venue,
      date,
      startTime,
      endTime,
      price,
      totalTickets,
      status,
    } = req.body;

    if (!title || !description || !category || !venue || !date || !startTime || !endTime || !price || !totalTickets) {
      return next(errorResponse('Please provide all required event fields', 400));
    }

    const event = await Event.create({
      title,
      description,
      category,
      venue,
      date,
      startTime,
      endTime,
      price,
      totalTickets,
      banner: req.file ? `/uploads/${req.file.filename}` : '',
      status: status || 'draft',
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(errorResponse('Event not found', 404));
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return next(errorResponse('Not authorized to update this event', 403));
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.banner = `/uploads/${req.file.filename}`;
    }

    Object.assign(event, updates);
    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(errorResponse('Event not found', 404));
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return next(errorResponse('Not authorized to delete this event', 403));
    }

    await Ticket.deleteMany({ event: event._id });
    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalEvents, publishedEvents, ticketsSold, revenue] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'published' }),
      Ticket.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
      Ticket.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);

    const salesCount = ticketsSold[0]?.total || 0;
    const totalRevenue = revenue[0]?.total || 0;

    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);
    const allEvents = await Event.find().sort({ date: 1 });
    const recentPurchases = await Ticket.find().populate('user', 'name').populate('event', 'title').sort({ purchasedAt: -1 }).limit(5);

    const now = new Date();
    const pastEvents = allEvents.filter((event) => new Date(event.date) < now);
    const upcomingEvents = allEvents.filter((event) => new Date(event.date) >= now);

    res.json({
      totalEvents,
      publishedEvents,
      ticketsSold: salesCount,
      revenue: totalRevenue,
      recentEvents,
      allEvents,
      pastEvents,
      upcomingEvents,
      recentPurchases,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getDashboardStats,
};
