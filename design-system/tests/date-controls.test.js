import test from 'node:test';
import assert from 'node:assert/strict';
import { isRangeReversed } from '../components/src/components/forms/dateValues.js';

test('calendar ranges compare boundaries without timezone conversion', () => {
  assert.equal(isRangeReversed({ from: '2026-10-19', to: '2026-10-18' }), true);
  assert.equal(isRangeReversed({ from: '2026-10-19', to: '2026-10-19' }), false);
  assert.equal(isRangeReversed({ from: '2024-02-29', to: '2024-03-01' }), false);
  assert.equal(isRangeReversed({ from: '', to: '2026-10-19' }), false);
  assert.equal(isRangeReversed({ from: '2026-10-19', to: '' }), false);
});

test('local date-time ranges handle seconds and extended years numerically', () => {
  assert.equal(isRangeReversed({ from: '2026-10-19T23:59', to: '2026-10-20T00:00' }), false);
  assert.equal(isRangeReversed({ from: '2026-10-19T09:30:01', to: '2026-10-19T09:30' }), true);
  assert.equal(isRangeReversed({ from: '2026-10-19T09:30:00', to: '2026-10-19T09:30' }), false);
  assert.equal(isRangeReversed({ from: '9999-12-31', to: '10000-01-01' }), false);
});
