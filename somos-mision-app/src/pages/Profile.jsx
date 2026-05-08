import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Target, Flame, MapPin, Building, Edit3, Zap, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { badges, regions, weeklyActivity } from '../data/mockData';
import { getLevelTitle, xpProgress, xpToNextLevel } from '../utils/helpers';
import { LucideIcon } from '../components/common/LucideIcon';

const regionName = (id) => regions.find((r) => r.id === id)?.name || 'Nacional';
const roleLabel  = { admin: 'Administrador', pastor: 'Pastor', multiplicador: 'Multiplicador' };

const activityLog = [
  { action: 'Compartiste "¡Colombia se está transformando!"', xp: 50,  time: 'Hace 2 horas', iconName: 'Share2',      color: '#1A237E' },
  { action: 'Completaste misión "Primera Misión del Día"',    xp: 80,  time: 'Hoy',           iconName: 'CheckCircle', color: '#22c55e' },
  { action: 'Ganaste insignia "Embajador Activo"',           xp: 500, time: 'Ayer',           iconName: 'Medal',       color: '#D4AF37' },
  { action: 'Compartiste "Grupos Étnicos: Amazonía"',        xp: 100, time: 'Hace 2 días',    iconName: 'Share2',      color: '#1A237E' },
];

export default function Profile() {
  const { currentUser } = useAppStore();
  if (!currentUser) return null;

  const user       = currentUser;
  const progress   = xpProgress(user.xp, user.level);
  const nextXP     = xpToNextLevel(user.level);
  const userBadges = badges.filter((b) => user.badges.includes(b.id));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        {/* Banner */}
        <div className="h-28 relative"
          style={{ background: 'linear-gradient(135deg, #0D1257 0%, #1A237E 60%, #D4AF37 100%)' }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black border-4 border-white shadow-lg"
              style={{ background: user.avatarColor }}>
              {user.avatar}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:border-[#1A237E] hover:text-[#1A237E] transition">
              <Edit3 size={12} /> Editar perfil
            </button>
          </div>

          <h1 className="text-xl font-black text-[#0F172A]">{user.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1A237E]/10 text-[#1A237E]">
              {roleLabel[user.role]}
            </span>
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-[#D4AF37]" fill="#D4AF37" />
              <span className="text-xs font-bold text-[#D4AF37]">{getLevelTitle(user.level)}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-3 text-[#475569] text-xs">
            <span className="flex items-center gap-1.5"><MapPin size={11} />{regionName(user.region)}</span>
            <span className="flex items-center gap-1.5"><Building size={11} />{user.congregation}</span>
          </div>

          {/* XP bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-[#94A3B8] mb-1.5">
              <span className="font-bold text-[#0F172A]">{user.xp.toLocaleString()} XP</span>
              <span>Nivel {user.level + 1} en {nextXP.toLocaleString()} XP</span>
            </div>
            <div className="h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #1A237E, #D4AF37)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Share2, label: 'Compartidos', value: user.shared,            color: '#1A237E' },
          { icon: Target, label: 'Misiones',    value: user.missionsCompleted, color: '#D4AF37' },
          { icon: Flame,  label: 'Racha',       value: `${user.streak} días`,  color: '#E65100' },
          { icon: Zap,    label: 'Nivel',       value: user.level,             color: '#22c55e' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="card p-4 text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: `${s.color}15` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-xl font-black text-[#0F172A]">{s.value}</p>
            <p className="text-[#94A3B8] text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Impact chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }} className="card p-5">
        <h3 className="font-bold text-[#0F172A] mb-4">Impacto semanal</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyActivity}>
            <defs>
              <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Area type="monotone" dataKey="shares" stroke="#D4AF37" strokeWidth={2.5} fill="url(#profGrad)" name="Compartidos" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }} className="card p-5">
        <h3 className="font-bold text-[#0F172A] mb-4">Mis insignias ({userBadges.length})</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {badges.map((b, i) => {
            const unlocked = user.badges.includes(b.id);
            return (
              <motion.div key={b.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={unlocked ? { scale: 1.06, y: -2 } : {}}
                className={`p-3 rounded-2xl border text-center transition ${
                  unlocked
                    ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5 cursor-pointer'
                    : 'border-[#E2E8F0] bg-[#F5F7FA] opacity-40'
                }`}
                title={b.description}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1.5"
                  style={{ background: `${b.color}20` }}>
                  {unlocked
                    ? <LucideIcon name={b.icon} size={16} style={{ color: b.color }} />
                    : <Lock size={14} className="text-[#94A3B8]" />
                  }
                </div>
                <p className="text-[10px] font-bold text-[#0F172A] leading-tight">{b.name}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Zap size={9} className="text-[#D4AF37]" />
                  <span className="text-[9px] font-bold text-[#D4AF37]">+{b.xp}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }} className="card p-5">
        <h3 className="font-bold text-[#0F172A] mb-4">Actividad reciente</h3>
        <div className="space-y-2">
          {activityLog.map((a, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7FA]"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${a.color}15` }}>
                <LucideIcon name={a.iconName} size={14} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#0F172A] truncate">{a.action}</p>
                <p className="text-[10px] text-[#94A3B8]">{a.time}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Zap size={11} className="text-[#D4AF37]" fill="#D4AF37" />
                <span className="text-xs font-bold text-[#D4AF37]">+{a.xp}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
