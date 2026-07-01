import { motion } from 'framer-motion';
import { Zap, CheckCircle, Lock, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../store/useAppStore';
import { LucideIcon } from '../common/LucideIcon';

const statusConfig = {
  completed:   { label: 'Completada',  tone: 'is-completed', Icon: CheckCircle },
  in_progress: { label: 'En progreso', tone: 'is-progress',  Icon: Clock },
  pending:     { label: 'Pendiente',   tone: 'is-pending',   Icon: Clock },
  locked:      { label: 'Bloqueada',   tone: 'is-locked',    Icon: Lock },
};

const typeLabels = { daily: 'Diaria', weekly: 'Semanal', special: 'Especial' };
const typeTone = { daily: 'is-daily', weekly: 'is-weekly', special: 'is-special' };
const typeAccent = { daily: '#1A237E', weekly: '#6A1B9A', special: '#D4AF37' };

export default function MissionCard({ mission, delay = 0 }) {
  const { completeMission, completedMissions } = useAppStore();
  const isDone = completedMissions.includes(mission.id) || mission.status === 'completed';
  const cfg = statusConfig[isDone ? 'completed' : mission.status] || statusConfig.pending;
  const StatusIcon = cfg.Icon;
  const progress = mission.progress != null ? mission.progress : (isDone ? mission.goal : 0);
  const pct = Math.min((progress / mission.goal) * 100, 100);
  const accent = typeAccent[mission.type] || '#1A237E';

  const handleComplete = async () => {
    try {
      await completeMission(mission.id, mission.xpReward);
    } catch (error) {
      toast.error(error.message || 'No se pudo completar la misión.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={mission.status !== 'locked' ? { y: -4, scale: 1.01 } : {}}
      className={`mission-card-pro ${cfg.tone} ${typeTone[mission.type] || ''}`}
      style={{ '--mission-tone': accent }}
    >
      <div className="mission-card-icon">
        <LucideIcon name={mission.icon} size={19} className="mission-card-symbol" />
      </div>

      <div className="mission-card-body">
        <div className="mission-card-meta">
          <span className={`mission-type-pill ${typeTone[mission.type]}`}>
            {typeLabels[mission.type]}
          </span>
          <span className={`mission-status-pill ${cfg.tone}`}>
            <StatusIcon size={11} /> {cfg.label}
          </span>
        </div>
        <h4>{mission.title}</h4>
        <p>{mission.description}</p>

        {mission.status !== 'locked' && (
          <div className="mission-progress">
            <div>
              <span>{progress}/{mission.goal} {mission.unit}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="mission-progress-track">
              <motion.div
                className="mission-progress-fill"
                style={{ background: isDone ? '#22c55e' : 'linear-gradient(90deg,#1A237E,#D4AF37)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <div className="mission-card-footer">
          <div>
            <Zap size={13} fill="currentColor" />
            <span>+{mission.xpReward} XP</span>
          </div>
          {!isDone && mission.status !== 'locked' && (
            <button
              onClick={handleComplete}
            >
              Completar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
