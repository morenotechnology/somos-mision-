// Colombia is UTC-5 throughout the year; the week begins Monday at 00:00 local.
export function missionWeekStart(now = new Date()) {
  const local = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  local.setUTCDate(local.getUTCDate() - (local.getUTCDay() + 6) % 7);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() + 5 * 60 * 60 * 1000);
}

export function weekLabel(now = new Date()) {
  const start = missionWeekStart(now);
  const end = new Date(start.getTime() + 6 * 86400000);
  const format = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' });
  return `${format.format(start)} – ${format.format(end)}`;
}

export function normalizeMission(row, completedIds = [], progressMap = new Map()) {
  const auto = progressMap.get(row.id);
  // Historical completion IDs must never mark a new week as completed.
  const done = auto?.status === 'completed' || (row.type !== 'weekly' && completedIds.includes(row.id));
  return {
    id: row.id, type: row.type, title: row.title, description: row.description,
    coordinationId: row.coordination_id, xpReward: row.xp_reward,
    goal: row.goal, unit: row.unit, icon: row.icon,
    status: done ? 'completed' : (auto?.status || 'pending'),
    progress: done ? row.goal : (auto?.progress || 0),
  };
}
