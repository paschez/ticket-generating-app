import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePurchaseInput } from './ticketController.js';

test('validatePurchaseInput rejects fractional ticket quantities', () => {
  const result = validatePurchaseInput({ eventId: 'evt_123', quantity: '2.5' });

  assert.equal(result.ok, false);
  assert.equal(result.error.message, 'Please provide a valid event and quantity');
  assert.equal(result.error.statusCode, 400);
});

test('validatePurchaseInput rejects quantities greater than one', () => {
  const result = validatePurchaseInput({ eventId: 'evt_123', quantity: '2' });

  assert.equal(result.ok, false);
  assert.equal(result.error.message, 'Only one ticket can be purchased at a time');
  assert.equal(result.error.statusCode, 400);
});

test('validatePurchaseInput accepts a single ticket purchase', () => {
  const result = validatePurchaseInput({ eventId: 'evt_123', quantity: '1' });

  assert.equal(result.ok, true);
  assert.equal(result.quantity, 1);
});
