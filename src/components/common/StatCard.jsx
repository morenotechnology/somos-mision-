import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, color = '#1A237E', delay = 0 }) {
  const hex   = color;
  const light = `${hex}18`;
  const mid   = `${hex}30`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="stat-card-pro"
      style={{ '--stat-color': hex }}
    >
      <div className="stat-card-top">
        <div
          className="stat-card-icon"
          style={{ background: light, border: `1px solid ${mid}` }}
        >
          <Icon size={18} style={{ color: hex }} />
        </div>
        <div
          className="stat-card-accent"
          style={{ background: `linear-gradient(90deg, ${hex}40, ${hex})` }}
        />
      </div>

      <div>
        <p className="stat-card-value" style={{ color: hex }}>
          {value}
        </p>
        <p className="stat-card-label">{label}</p>
        {sub && <p className="stat-card-sub">{sub}</p>}
      </div>
    </motion.div>
  );
}
