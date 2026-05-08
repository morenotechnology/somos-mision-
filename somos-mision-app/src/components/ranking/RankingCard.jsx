import React from 'react';
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card card-interactive flex items-center gap-3 px-4 py-3.5"
    >
      {/* Position */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        {medal ? (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: medal.bg, boxShadow: medal.shadow }}
          >
            <medal.Icon size={14} className="text-white" />
          </div>
        ) : (
          <span className="text-sm font-bold text-[#94A3B8]">#{position}</span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white"
        style={{ background: user.avatarColor }}
      >
        {user.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0F172A] truncate leading-tight">{user.name.split(' ').slice(0,2).join(' ')}</p>
        <p className="text-xs text-[#94A3B8] mt-0.5">{getLevelTitle(user.level)} · Nv. {user.level}</p>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1.5 flex-shrink-0 bg-[#FBF6E2] px-2.5 py-1 rounded-lg">
        <Zap size={12} className="text-[#D4AF37]" fill="#D4AF37" />
        <span className="text-sm font-black text-[#0F172A]">{user.xp.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}
