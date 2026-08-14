import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const createAdmin = async () => {
  const name = process.env.ADMIN_NAME || 'Admin';
  const email = process.env.ADMIN_EMAIL || 'admin@evently.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`Admin already exists: ${email}`);
        await mongoose.disconnect();
        return;
      }

      existing.role = 'admin';
      await existing.save();
      console.log(`User promoted to admin: ${email}`);
      await mongoose.disconnect();
      return;
    }

    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin created: ${email} / ${password}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
