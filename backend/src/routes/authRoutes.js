import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile, createAdminUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/admin', createAdminUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getProfile);

export default router;
