import crypto from 'crypto';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import errorResponse from '../utils/errorResponse.js';

const validatePurchaseInput = ({ eventId, quantity }) => {
  const parsedQuantity = Number(quantity);

  if (!eventId || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    return {
      ok: false,
      error: errorResponse('Please provide a valid event and quantity', 400),
    };
  }

  if (parsedQuantity !== 1) {
    return {
      ok: false,
      error: errorResponse('Only one ticket can be purchased at a time', 400),
    };
  }

  return {
    ok: true,
    quantity: parsedQuantity,
  };
};

const purchaseTicket = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(errorResponse('Admins are not allowed to purchase tickets', 403));
    }

    const { eventId, quantity } = req.body;
    const validation = validatePurchaseInput({ eventId, quantity });

    if (!validation.ok) {
      return next(validation.error);
    }

    // Atomically reserve one ticket to prevent overselling under concurrent purchases
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lt: ['$ticketsSold', '$totalTickets'] },
      },
      { $inc: { ticketsSold: 1 } },
      { new: true }
    );

    if (!event) {
      const exists = await Event.exists({ _id: eventId });
      if (!exists) {
        return next(errorResponse('Event not found', 404));
      }
      return next(errorResponse('Not enough tickets available', 400));
    }

    const totalAmount = Number(event.price);
    const ticketNumber = `TKT-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

    try {
      const ticket = await Ticket.create({
        ticketNumber,
        user: req.user._id,
        event: event._id,
        quantity: 1,
        totalAmount,
        status: 'Valid',
      });

      res.status(201).json({
        message: 'Ticket purchased successfully',
        ticket,
      });
    } catch (createError) {
      // Roll back the reserved seat if ticket creation fails
      await Event.findByIdAndUpdate(event._id, { $inc: { ticketsSold: -1 } });
      throw createError;
    }
  } catch (error) {
    next(error);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event', 'title venue date price banner startTime endTime')
      .sort({ purchasedAt: -1 });

    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event', 'title venue date price startTime endTime');

    if (!ticket) {
      return next(errorResponse('Ticket not found', 404));
    }

    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(errorResponse('Not authorized to view this ticket', 403));
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

const verifyTicket = async (req, res, next) => {
  try {
    const rawIdentifier = req.body.ticketNumber || req.body.ticketId || '';
    const ticketNumber = String(rawIdentifier).trim().toUpperCase();

    if (!ticketNumber) {
      return res.status(400).json({
        result: 'INVALID',
        message: 'INVALID TICKET',
      });
    }

    // Atomic claim: only one concurrent scan can transition Valid → Used
    const ticket = await Ticket.findOneAndUpdate(
      { ticketNumber, status: 'Valid' },
      { $set: { status: 'Used', usedAt: new Date() } },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('event', 'title venue date startTime endTime price');

    if (ticket) {
      return res.json({
        result: 'VALID',
        message: 'Ticket verified successfully',
        ticket,
      });
    }

    const existing = await Ticket.findOne({ ticketNumber })
      .populate('user', 'name email')
      .populate('event', 'title venue date startTime endTime price');

    if (!existing) {
      return res.status(404).json({
        result: 'INVALID',
        message: 'INVALID TICKET',
      });
    }

    if (existing.status === 'Used') {
      return res.status(409).json({
        result: 'USED',
        message: 'TICKET ALREADY USED',
        ticket: existing,
      });
    }

    return res.status(400).json({
      result: 'INVALID',
      message: 'INVALID TICKET',
      ticket: existing,
    });
  } catch (error) {
    next(error);
  }
};

export { purchaseTicket, getMyTickets, getTicketById, verifyTicket, validatePurchaseInput };
