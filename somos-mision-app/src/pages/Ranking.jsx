import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Award, Medal, Trophy } from 'lucide-react';
import RankingCard from '../components/ranking/RankingCard';
import { users, regions } from '../data/mockData';

const tabs = ['Nacional', 'Por Región'];

const medalConfig = [
  { bg: 'linear-gradient(135deg,#F6CF4B,#D4AF37)', shadow: '0 4px 14px rgba(212,175,55,0.45)', Icon: Trophy,  color: '#D4AF37', label: '1' },
  { bg: 'linear-gradient(135deg,#C8D6DF,#9EB3BF)', shadow: '0 4px 14px rgba(158,179,191,0.4)', Icon: Award,   color: '#9EB3BF', label: '2' },
  { bg: 'linear-gradient(135deg,#D4956A,#B87333)', shadow: '0 4px 14px rgba(184,115,51,0.35)', Icon: Medal,   color: '#B87333', label: '3' },
];

function Podium({ top3 }) {
  // order: silver(1) gold(0) bronze(2)
  const order   = [top3[1], top3[0], top3[2]];
  const heights = ['h-24', 'h-32', 'h-20'];
  const medals  = [medalConfig[1], medalConfig[0], medalConfig[2]];

  return (
    <div className="flex items-end justify-center gap-4 mb-8">
      {order.map((u, i) => {
        const m = medals[i];
        const MIcon = m.Icon;
        return (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.2, type: 'spring', bounce: 0.35 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Medal icon */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: m.bg, boxShadow: m.shadow }}>
              <MIcon size={14} className="text-white" strokeWidth={2.5} />
            </div>

            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2"
              style={{ background: u.avatarColor, ringColor: m.color, boxShadow: `0 0 0 2px ${m.color}` }}
            >
              {u.avatar}
            </div>

            {/* Name + XP */}
            <div className="text-center">
              <p className="text-[#0F172A] text-xs font-bold">{u.name.split(' ')[0]}</p>
              <div className="flex items-center gap-0.5 justify-center mt-0.5">
                <Zap size={10} className="text-[#D4AF37]" fill="#D4AF37" />
                <span className="text-[10px] font-bold text-[#D4AF37]">{u.xp.toLocaleString()}</span>
              </div>
            </div>

            {/* Podium block */}
            <div
              className={`w-20 ${heights[i]} rounded-t-2xl flex items-center justify-center`}
              style={{ background: `${m.color}18`, border: `2px solid ${m.color}40` }}
            >
              <span className="text-2xl font-black" style={{ color: m.color }}>{m.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Ranking() {
  const [tab, setTab]               = useState('Nacional');
  const [regionFilter, setRegionFilter] = useState('');

  const sorted   = [...users].sort((a, b) => b.xp - a.xp);
  const filtered = tab === 'Por Región' && regionFilter
    ? sorted.filter((u) => u.region === regionFilter)
    : sorted;

  const top3 = filtered.slice(0, 3);
  const rest  = filtered.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={20} className="text-[#D4AF37]" />
          <h2 className="text-2xl font-black text-[#0F172A]">Hall de Honor</h2>
        </div>
        <p className="text-[#475569] text-sm">Los embajadores más activos de toda Colombia.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === t ? 'bg-[#1A237E] text-white' : 'bg-white text-[#475569] hover:bg-[#F5F7FA] border border-[#E2E8F0]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Region filter */}
      {tab === 'Por Región' && (
        <select
          className="input-base max-w-xs"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="">Todas las regiones</option>
          {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      )}

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="card p-6">
          <h3 className="text-center font-bold text-[#0F172A] mb-6">Podio de Honor</h3>
          <Podium top3={top3} />
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        <h3 className="font-bold text-[#0F172A] mb-3">Clasificación completa</h3>
        {filtered.map((u, i) => (
          <RankingCard key={u.id} user={u} position={i + 1} delay={i * 0.04} />
        ))}
      </div>
    </div>
  );
}
