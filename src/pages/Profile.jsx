import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Target, Flame, MapPin, Building, Edit3, Zap, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api';
import { getLevelTitle, xpProgress, xpToNextLevel } from '../utils/helpers';
import { LucideIcon } from '../components/common/LucideIcon';

const roleLabel = { admin: 'Administrador', pastor: 'Pastor', multiplicador: 'Multiplicador' };

export default function Profile() {
  const { currentUser, loginFromApi } = useAppStore();
  const [badges, setBadges] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([api.bootstrap(), api.dashboard.get()])
      .then(([boot, dashboard]) => {
        if (!active) return;
        setBadges(boot.badges || []);
        setWeeklyActivity(dashboard.weeklyActivity || []);
        loginFromApi({ user: dashboard.user, sharedContentIds: dashboard.sharedContentIds, completedMissionIds: dashboard.completedMissionIds });
      });
    return () => { active = false; };
  }, [loginFromApi]);

  if (!currentUser) return null;

  const user = currentUser;
  const progress = xpProgress(user.xp, user.level);
  const nextXP = xpToNextLevel(user.level);
  const userBadges = badges.filter((badge) => user.badges.includes(badge.id));

  const activityLog = [
    { action: 'Compartiste contenido oficial', xp: 50, time: 'Reciente', iconName: 'Share2', color: '#1A237E' },
    { action: 'Completaste una misión', xp: 80, time: 'Esta semana', iconName: 'CheckCircle', color: '#22c55e' },
    { action: 'Ganaste una insignia', xp: 100, time: 'Último progreso', iconName: 'Medal', color: '#D4AF37' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-28 relative" style={{ background: 'linear-gradient(135deg, #0D1257 0%, #1A237E 60%, #D4AF37 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black border-4 border-white shadow-lg" style={{ background: user.avatarColor }}>{user.avatar}</div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:border-[#1A237E] hover:text-[#1A237E] transition"><Edit3 size={12} /> Editar perfil</button>
          </div>

          <h1 className="text-xl font-black text-[#0F172A]">{user.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1A237E]/10 text-[#1A237E]">{roleLabel[user.role]}</span>
            <div className="flex items-center gap-1"><Zap size={12} className="text-[#D4AF37]" fill="#D4AF37" /><span className="text-xs font-bold text-[#D4AF37]">{getLevelTitle(user.level)}</span></div>
          </div>

          <div className="flex gap-4 mt-3 text-[#475569] text-xs">
            <span className="flex items-center gap-1.5"><MapPin size={11} />{user.regionName}</span>
            <span className="flex items-center gap-1.5"><Building size={11} />{user.congregation}</span>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs text-[#94A3B8] mb-1.5"><span className="font-bold text-[#0F172A]">{user.xp.toLocaleString()} XP</span><span>Nivel {Math.min(user.level + 1, 10)} en {nextXP.toLocaleString()} XP</span></div>
            <div className="h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #1A237E, #D4AF37)' }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.3 }} /></div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Share2, label: 'Compartidos', value: user.shared, color: '#1A237E' },
          { icon: Target, label: 'Misiones', value: user.missionsCompleted, color: '#D4AF37' },
          { icon: Flame, label: 'Racha', value: `${user.streak} días`, color: '#E65100' },
          { icon: Zap, label: 'Nivel', value: user.level, color: '#22c55e' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="card p-4 text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${stat.color}15` }}><stat.icon size={16} style={{ color: stat.color }} /></div>
            <p className="text-xl font-black text-[#0F172A]">{stat.value}</p>
            <p className="text-[#94A3B8] text-xs mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
        <h3 className="font-bold text-[#0F172A] mb-4">Impacto semanal</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyActivity}>
            <defs><linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} /><stop offset="95%" stopColor="#D4AF37" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Area type="monotone" dataKey="shares" stroke="#D4AF37" strokeWidth={2.5} fill="url(#profGrad)" name="Compartidos" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-5">
        <h3 className="font-bold text-[#0F172A] mb-4">Mis insignias ({userBadges.length})</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {badges.map((badge, index) => {
            const unlocked = user.badges.includes(badge.id);
            return (
              <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + index * 0.05 }} whileHover={unlocked ? { scale: 1.06, y: -2 } : {}} className={`p-3 rounded-2xl border text-center transition ${unlocked ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5 cursor-pointer' : 'border-[#E2E8F0] bg-[#F5F7FA] opacity-40'}`} title={badge.description}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1.5" style={{ background: `${badge.color}20` }}>
                  {unlocked ? <LucideIcon name={badge.icon} size={16} style={{ color: badge.color }} /> : <Lock size={14} className="text-[#94A3B8]" />}
                </div>
                <p className="text-[10px] font-bold text-[#0F172A] leading-tight">{badge.name}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1"><Zap size={9} className="text-[#D4AF37]" /><span className="text-[9px] font-bold text-[#D4AF37]">+{badge.xp}</span></div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-5">
        <h3 className="font-bold text-[#0F172A] mb-4">Actividad reciente</h3>
        <div className="space-y-2">
          {activityLog.map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + index * 0.06 }} className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7FA]">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}><LucideIcon name={item.iconName} size={14} style={{ color: item.color }} /></div>
              <div className="flex-1 min-w-0"><p className="text-xs font-medium text-[#0F172A] truncate">{item.action}</p><p className="text-[10px] text-[#94A3B8]">{item.time}</p></div>
              <div className="flex items-center gap-1 flex-shrink-0"><Zap size={11} className="text-[#D4AF37]" fill="#D4AF37" /><span className="text-xs font-bold text-[#D4AF37]">+{item.xp}</span></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
