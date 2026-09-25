import './badge-emblem.css';

// Crisp, authored medal geometry. No raster generation or third-party artwork.
const marks = {
  Sprout: <><path d="M40 54V35M40 44C24 45 24 29 24 29S40 28 40 44ZM40 37C54 37 56 23 56 23S40 22 40 37Z" /><path d="M29 55h22" /></>,
  Zap: <path d="m43 20-19 25h14l-2 18 20-28H42z" />,
  Medal: <><path d="m29 23 11 14 11-14M32 21l8 10 8-10" /><circle cx="40" cy="46" r="13" /><path d="m40 37 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></>,
  Megaphone: <><path d="M23 35h10l21-9v28l-21-9H23zM30 46l5 13h7l-4-11M60 34l5-3M60 46l5 3M62 40h5" /></>,
  Globe: <><circle cx="40" cy="40" r="18" /><ellipse cx="40" cy="40" rx="8" ry="18" /><path d="M22 40h36M25 30h30M25 50h30M20 58l5 5M60 22l-5-5" /></>,
  Flame: <><path d="M41 20c2 12 15 15 15 28 0 10-8 15-16 15s-16-6-16-15c0-7 4-12 8-16 0 8 4 9 4 9s8-8 5-21Z" /><path d="M40 46c0 5 6 7 6 11a6 6 0 0 1-12 0c0-4 6-7 6-11Z" /></>,
  Sparkles: <><path d="m40 22 5 13 13 5-13 5-5 13-5-13-13-5 13-5ZM59 19v10M54 24h10M21 52v10M16 57h10" /><path d="M40 15v-4M40 69v-4M15 40h-4M69 40h-4" /></>,
  Crown: <><path d="m22 30 10 9 8-16 8 16 10-9-4 24H26zM28 60h24" /><circle cx="22" cy="26" r="2" /><circle cx="40" cy="19" r="2" /><circle cx="58" cy="26" r="2" /></>,
};

export default function BadgeEmblem({ icon = 'Medal', locked = false, name = '' }) {
  return <span className={`badge-emblem ${locked ? 'is-locked' : ''}`} role="img" aria-label={`${name}: ${locked ? 'bloqueada' : 'desbloqueada'}`}>
    <svg viewBox="0 0 80 90" aria-hidden="true">
      <path className="badge-ribbon" d="m24 59-6 26 13-6 9 8 9-8 13 6-6-26z" />
      <path className="badge-body" d="m40 3 30 13v28c0 19-14 28-30 35C24 72 10 63 10 44V16Z" />
      <path className="badge-rim" d="m40 9 24 10v25c0 15-10 23-24 29-14-6-24-14-24-29V19Z" />
      <g className="badge-mark" fill="none" strokeLinecap="round" strokeLinejoin="round">{marks[icon] || marks.Medal}</g>
      <path className="badge-pin" d="m40 66 3 3-3 3-3-3z" />
    </svg>
    {locked && <span className="badge-lock" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v7H4z" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="10" r="1" fill="currentColor" /></svg></span>}
  </span>;
}
