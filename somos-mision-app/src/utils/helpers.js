// Compute XP needed to reach next level
export const xpToNextLevel = (level) => level * 500;

// Get level title
export const getLevelTitle = (level) => {
  const titles = ['', 'Sembrador', 'Mensajero', 'Testigo', 'Heraldo', 'Misionero',
    'Embajador', 'Defensor', 'Apóstol', 'Pionero', 'Columna Nacional'];
  return titles[Math.min(level, 10)] || 'Sembrador';
};

// XP progress percentage within current level
export const xpProgress = (xp, level) => {
  const base = (level - 1) * 500;
  const next = level * 500;
  return Math.min(((xp - base) / (next - base)) * 100, 100);
};

// Format large numbers
export const formatNumber = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

// Medal color for ranking podium
export const medalColor = (pos) => {
  if (pos === 1) return '#D4AF37';
  if (pos === 2) return '#9E9E9E';
  if (pos === 3) return '#CD7F32';
  return '#E2E8F0';
};

// Truncate text
export const truncate = (str, max = 80) =>
  str.length > max ? str.slice(0, max) + '…' : str;

// Time ago
export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `${days} días`;
  if (days < 30) return `${Math.floor(days / 7)} sem.`;
  return `${Math.floor(days / 30)} mes.`;
};
