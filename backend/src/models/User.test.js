import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import User from './User.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-ticketing-app';

await mongoose.connect(mongoUri);

await User.deleteMany({});

test('User password is hashed before save', async () => {
  const user = await User.create({
    name: 'Hash Test',
    email: 'hash-test@example.com',
    password: 'secret123',
  });

  assert.notEqual(user.password, 'secret123');
  assert.equal(await user.comparePassword('secret123'), true);
});

test.after(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});
