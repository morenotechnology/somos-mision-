import { motion } from 'framer-motion';
import { Zap, Award, Medal } from 'lucide-react';
import { getLevelTitle } from '../../utils/helpers';

const medals = [
  { bg: 'linear-gradient(135deg,#F6CF4B,#D4AF37)', shadow: '0 4px 12px rgba(212,175,55,0.4)', Icon: Award },
  { bg: 'linear-gradient(135deg,#C8D6DF,#9EB3BF)', shadow: '0 4px 12px rgba(158,179,191,0.4)', Icon: Medal },
  { bg: 'linear-gradient(135deg,#D4956A,#B87333)', shadow: '0 4px 12px rgba(184,115,51,0.35)', Icon: Medal },
];

export default function RankingCard({ user, position, delay = 0 }) {
  const medal = position <= 3 ? medals[position - 1] : null;
  const compactName = user.name.split(' ').slice(0, 2).join(' ');
  const levelTitle = getLevelTitle(user.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`ranking-row-pro ${position <= 3 ? 'is-podium' : ''}`}
    >
      <div className="ranking-row-position">
        {medal ? (
          <div
            className="ranking-row-medal"
            style={{ background: medal.bg, boxShadow: medal.shadow }}
          >
            <medal.Icon size={14} className="text-white" />
          </div>
        ) : (
          <span>#{position}</span>
        )}
      </div>

      <div
        className="ranking-row-avatar"
        style={{ background: user.avatarColor }}
      >
        {user.avatar}
      </div>

      <div className="ranking-row-info">
        <strong>{compactName}</strong>
        <span>{levelTitle} · Nivel {user.level}</span>
      </div>

      <div className="ranking-row-xp">
        <Zap size={14} fill="currentColor" strokeWidth={0} />
        <span>{user.xp.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}
