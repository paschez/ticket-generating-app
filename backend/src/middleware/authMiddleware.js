import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import errorResponse from '../utils/errorResponse.js';

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(errorResponse('Not authorized, no token', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(errorResponse('User not found', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(errorResponse('Not authorized, token failed', 401));
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return next(errorResponse('Admin access required', 403));
};

export { protect, adminOnly };
