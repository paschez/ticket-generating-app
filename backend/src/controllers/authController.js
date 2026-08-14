import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import errorResponse from '../utils/errorResponse.js';

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(errorResponse('Please provide name, email and password', 400));
    }

    const allowedRoles = ['user', 'admin'];
    const selectedRole = allowedRoles.includes(role) ? role : 'user';

    const exists = await User.findOne({ email });
    if (exists) {
      return next(errorResponse('User already exists', 400));
    }

    const user = await User.create({ name, email, password, role: selectedRole });
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(errorResponse('Email and password are required', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(errorResponse('Invalid email or password', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(errorResponse('Invalid email or password', 401));
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, setupKey } = req.body;

    if (!name || !email || !password) {
      return next(errorResponse('Please provide name, email and password', 400));
    }

    const adminSetupKey = process.env.ADMIN_SETUP_KEY || 'change-me';
    if (!setupKey || setupKey !== adminSetupKey) {
      return next(errorResponse('Invalid admin setup key', 403));
    }

    const exists = await User.findOne({ email });
    if (exists) {
      if (exists.role === 'admin') {
        return next(errorResponse('Admin account already exists for this email', 400));
      }

      exists.role = 'admin';
      await exists.save();
      return res.json({
        message: 'User promoted to admin',
        user: {
          id: exists._id,
          name: exists.name,
          email: exists.email,
          role: exists.role,
        },
      });
    }

    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({
      message: 'Admin account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

const getProfile = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

export { registerUser, loginUser, logoutUser, getProfile, createAdminUser };

