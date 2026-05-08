import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Lock, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { LucideIcon } from '../common/LucideIcon';

const statusConfig = {
  completed:   { label: 'Completada',  color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200', Icon: CheckCircle },
  in_progress: { label: 'En Progreso', color: 'text-[#1A237E]', bg: 'bg-blue-50',   border: 'border-blue-200',  Icon: Clock },
  pending:     { label: 'Pendiente',   color: 'text-[#475569]', bg: 'bg-gray-50',   border: 'border-gray-200',  Icon: Clock },
  locked:      { label: 'Bloqueada',   color: 'text-[#94A3B8]', bg: 'bg-gray-50',   border: 'border-gray-100',  Icon: Lock },
};

const typeLabels = { daily: 'Diaria', weekly: 'Semanal', special: 'Especial' };
const typeBg     = { daily: 'bg-blue-100 text-[#1A237E]', weekly: 'bg-purple-100 text-purple-700', special: 'bg-[#D4AF37]/20 text-[#8B6914]' };

export default function MissionCard({ mission, delay = 0 }) {
  const { completeMission, completedMissions } = useAppStore();
  const isDone = completedMissions.includes(mission.id) || mission.status === 'completed';
  const cfg = statusConfig[isDone ? 'completed' : mission.status];
  const StatusIcon = cfg.Icon;
  const progress = mission.progress != null ? mission.progress : (isDone ? mission.goal : 0);
  const pct = Math.min((progress / mission.goal) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`card p-4 border ${cfg.border} flex gap-4 items-start`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-[#F5F7FA]">
        <LucideIcon name={mission.icon} size={18} className="text-[#1A237E]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBg[mission.type]}`}>
            {typeLabels[mission.type]}
          </span>
          <span className={`text-[10px] font-semibold ${cfg.color} flex items-center gap-0.5`}>
            <StatusIcon size={9} /> {cfg.label}
          </span>
        </div>
        <h4 className="text-[#0F172A] font-semibold text-sm">{mission.title}</h4>
        <p className="text-[#475569] text-xs mt-0.5 mb-2">{mission.description}</p>

        {/* Progress bar */}
        {mission.status !== 'locked' && (
          <div className="mb-2">
            <div className="flex justify-between text-[10px] text-[#94A3B8] mb-1">
              <span>{progress}/{mission.goal} {mission.unit}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: isDone ? '#22c55e' : 'linear-gradient(90deg,#1A237E,#D4AF37)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#D4AF37]">
            <Zap size={12} fill="#D4AF37" />
            <span className="text-xs font-bold">+{mission.xpReward} XP</span>
          </div>
          {!isDone && mission.status !== 'locked' && (
            <button
              onClick={() => completeMission(mission.id, mission.xpReward)}
              className="text-[11px] font-semibold text-[#1A237E] hover:text-[#D4AF37] transition"
            >
              Completar →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
