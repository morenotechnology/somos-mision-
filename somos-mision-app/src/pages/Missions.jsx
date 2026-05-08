import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Award, CheckCircle, Lock } from 'lucide-react';
import MissionCard from '../components/missions/MissionCard';
import { missions, badges } from '../data/mockData';
import { useAppStore } from '../store/useAppStore';
import { LucideIcon } from '../components/common/LucideIcon';

const tabs    = ['Diarias', 'Semanales', 'Especiales'];
const typeMap = { 'Diarias': 'daily', 'Semanales': 'weekly', 'Especiales': 'special' };

export default function Missions() {
  const [tab, setTab] = useState('Diarias');
  const { currentUser, completedMissions } = useAppStore();
  const userBadges = badges.filter((b) => currentUser?.badges.includes(b.id));
  const filtered   = missions.filter((m) => m.type === typeMap[tab]);

  const totalDoneToday = (completedMissions.length + missions.filter(m => m.status === 'completed').length);
  const totalXPEarned  = completedMissions.length * 80 + 130; // approx

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Target size={20} className="text-[#1A237E]" />
          <h2 className="text-2xl font-black text-[#0F172A]">Misiones & Recompensas</h2>
        </div>
        <p className="text-[#475569] text-sm">Completa misiones, gana XP y desbloquea insignias.</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Completadas hoy', value: totalDoneToday,                              color: '#22c55e', Icon: CheckCircle },
          { label: 'XP de misiones',  value: `${totalXPEarned}`,                          color: '#D4AF37', Icon: Zap },
          { label: 'Insignias',       value: userBadges.length,                            color: '#1A237E', Icon: Award },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="card p-4 text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: `${s.color}15` }}>
              <s.Icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[#475569] text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === t ? 'bg-[#1A237E] text-white' : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F5F7FA]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Mission list */}
      <div className="space-y-3">
        {filtered.map((m, i) => <MissionCard key={m.id} mission={m} delay={i * 0.07} />)}
      </div>

      {/* Badges gallery */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Award size={18} className="text-[#D4AF37]" />
          <h3 className="font-bold text-[#0F172A]">Insignias disponibles</h3>
        </div>
        <p className="text-[#475569] text-xs mb-5">
          Desbloquea insignias completando misiones y subiendo de nivel.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map((b, i) => {
            const unlocked = currentUser?.badges.includes(b.id);
            return (
              <motion.div key={b.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={unlocked ? { scale: 1.04, y: -2 } : {}}
                className={`p-4 rounded-2xl border text-center transition ${
                  unlocked
                    ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5'
                    : 'border-[#E2E8F0] bg-[#F5F7FA] opacity-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${b.color}20`, opacity: unlocked ? 1 : 0.5 }}>
                  {unlocked
                    ? <LucideIcon name={b.icon} size={18} style={{ color: b.color }} />
                    : <Lock size={16} className="text-[#94A3B8]" />
                  }
                </div>
                <p className="text-xs font-bold text-[#0F172A] leading-tight">{b.name}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{b.description}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <Zap size={10} className="text-[#D4AF37]" />
                  <span className="text-[10px] font-bold text-[#D4AF37]">+{b.xp} XP</span>
                </div>
                {unlocked && (
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-green-600">
                    <CheckCircle size={10} />
                    <span className="text-[9px] font-bold">Desbloqueada</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
