import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { purchaseTicket, getMyTickets, getTicketById, verifyTicket } from '../controllers/ticketController.js';

const router = express.Router();

router.post('/', protect, purchaseTicket);
router.post('/verify', protect, adminOnly, verifyTicket);
router.get('/my', protect, getMyTickets);
router.get('/:id', protect, getTicketById);

export default router;
