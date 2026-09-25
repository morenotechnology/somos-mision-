import test from 'node:test';
import assert from 'node:assert/strict';
import { missionWeekStart, normalizeMission, weekLabel } from './missionWeek.js';

test('mission weeks reset Monday midnight in Colombia, not UTC or seven rolling days', () => {
  assert.equal(missionWeekStart(new Date('2026-09-28T04:59:59Z')).toISOString(), '2026-09-21T05:00:00.000Z');
  assert.equal(missionWeekStart(new Date('2026-09-28T05:00:00Z')).toISOString(), '2026-09-28T05:00:00.000Z');
  assert.equal(missionWeekStart(new Date('2027-01-01T10:00:00Z')).toISOString(), '2026-12-28T05:00:00.000Z');
  assert.match(weekLabel(new Date('2026-09-24T12:00:00Z')), /21.*27/);
});

test('historical completions cannot finish this week; only current server progress can', () => {
  const row = { id: 'one', type: 'weekly', goal: 1, coordination_id: 'c3', xp_reward: 140 };
  assert.equal(normalizeMission(row, ['one']).status, 'pending');
  assert.equal(normalizeMission(row, ['one'], new Map([['one', { status: 'pending', progress: 0 }]])).progress, 0);
  const current = normalizeMission(row, [], new Map([['one', { status: 'completed', progress: 1 }]]));
  assert.equal(current.status, 'completed');
  assert.equal(current.coordinationId, 'c3');
  assert.equal(current.progress, 1);
});
