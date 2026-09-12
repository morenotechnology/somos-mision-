import test from 'node:test';
import assert from 'node:assert/strict';
import { canPublish, isSuperadmin } from './permissions.js';

test('publishing requires an active editor or superadmin; role labels alone do not grant editing', () => {
  assert.equal(canPublish(null), false);
  assert.equal(canPublish({ role: 'pastor' }), false);
  assert.equal(canPublish({ role: 'multiplicador', canPublish: true }), true);
  assert.equal(canPublish({ role: 'admin', active: true }), true);
  assert.equal(canPublish({ role: 'admin', active: false }), false);
  assert.equal(canPublish({ role: 'pastor', canPublish: true, active: false }), false);
});

test('only active superadmins can enter administration', () => {
  assert.equal(isSuperadmin({ role: 'admin', active: true }), true);
  assert.equal(isSuperadmin({ role: 'admin', active: false }), false);
  assert.equal(isSuperadmin({ role: 'multiplicador', canPublish: true }), false);
});
