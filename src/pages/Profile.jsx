import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Building, CalendarDays, Edit3, Flame, Lock, MapPin, ShieldCheck, Share2, Sparkles, Target, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api';
import { formatNumber, getLevelTitle, xpProgress, xpToNextLevel } from '../utils/helpers';
import { LucideIcon } from '../components/common/LucideIcon';

const roleLabel = { admin: 'Administrador', pastor: 'Pastor/Directivo', multiplicador: 'Multiplicador' };

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
  const earnedBadges = user.badges || [];
  const userBadges = badges.filter((badge) => earnedBadges.includes(badge.id));
  const nextLevel = Math.min(user.level + 1, 10);
  const joinedDate = user.joinedAt
    ? new Date(`${user.joinedAt}T00:00:00`).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
    : 'Beta';

  const activityLog = [
    { action: 'Compartiste contenido oficial', xp: 50, time: 'Reciente', iconName: 'Share2', color: '#1A237E' },
    { action: 'Completaste una misión', xp: 80, time: 'Esta semana', iconName: 'CheckCircle', color: '#22c55e' },
    { action: 'Ganaste una insignia', xp: 100, time: 'Último progreso', iconName: 'Medal', color: '#D4AF37' },
  ];

  return (
    <div className="profile-pro-page">
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="profile-hero-pro"
      >
        <div className="profile-cover-pro">
          <div className="profile-cover-map" />
          <div className="profile-cover-badge">
            <ShieldCheck size={15} />
            Perfil activo
          </div>
        </div>

        <div className="profile-identity-pro">
          <div className="profile-avatar-row">
            <div className="profile-avatar-pro" style={{ background: user.avatarColor }}>{user.avatar}</div>
            <button className="profile-edit-pro"><Edit3 size={14} /> Editar perfil</button>
          </div>

          <div className="profile-title-row">
            <div>
              <p><Sparkles size={13} /> Perfil de {(roleLabel[user.role] || 'Multiplicador').toLowerCase()}</p>
              <h1>{user.name}</h1>
            </div>
            <div className="profile-level-token">
              <strong>{user.level}</strong>
              <span>Nivel</span>
            </div>
          </div>

          <div className="profile-chip-row">
            <span className="profile-chip is-blue">{roleLabel[user.role]}</span>
            <span className="profile-chip is-gold"><Zap size={13} fill="currentColor" strokeWidth={0} />{getLevelTitle(user.level)}</span>
            <span className="profile-chip"><CalendarDays size={13} />Desde {joinedDate}</span>
          </div>

          <div className="profile-meta-grid">
            <span><MapPin size={14} />{user.regionName}</span>
            <span><Building size={14} />{user.congregation}</span>
          </div>

          <div className="profile-progress-pro">
            <div>
              <span>{formatNumber(user.xp)} XP</span>
              <small>Nivel {nextLevel} en {formatNumber(nextXP)} XP</small>
            </div>
            <div className="profile-progress-track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.25, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      <section className="profile-stat-grid">
        {[
          { icon: Share2, label: 'Compartidos', value: formatNumber(user.shared), color: '#1A237E' },
          { icon: Target, label: 'Misiones', value: formatNumber(user.missionsCompleted), color: '#D4AF37' },
          { icon: Flame, label: 'Racha', value: `${user.streak} días`, color: '#E65100' },
          { icon: Zap, label: 'Nivel', value: user.level, color: '#22c55e' },
        ].map((stat, index) => (
          <motion.article
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 + 0.1 }}
            className="profile-stat-pro"
            style={{ '--profile-stat-color': stat.color }}
          >
            <div><stat.icon size={18} /></div>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </motion.article>
        ))}
      </section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="profile-panel-pro profile-chart-panel">
        <div className="profile-panel-head">
          <div>
            <p><Sparkles size={13} /> Señal de actividad</p>
            <h3>Impacto semanal</h3>
          </div>
          <span>{formatNumber(user.shared)} compartidos</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyActivity}>
            <defs><linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} /><stop offset="95%" stopColor="#D4AF37" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid rgba(10,15,82,0.1)', fontSize: 12, boxShadow: '0 12px 28px rgba(10,15,82,0.12)' }} />
            <Area type="monotone" dataKey="shares" stroke="#D4AF37" strokeWidth={2.5} fill="url(#profGrad)" name="Compartidos" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="profile-panel-pro">
        <div className="profile-panel-head">
          <div>
            <p><Award size={13} /> Logros visibles</p>
            <h3>Mis insignias</h3>
          </div>
          <span>{userBadges.length}/{badges.length}</span>
        </div>
        <div className="profile-badges-grid">
          {badges.map((badge, index) => {
            const unlocked = earnedBadges.includes(badge.id);
            return (
              <motion.article
                key={badge.id}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.36 + index * 0.045 }}
                whileHover={unlocked ? { scale: 1.05, y: -2 } : { y: -1 }}
                className={`profile-badge-pro ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                style={{ '--badge-tone': badge.color }}
                title={badge.description}
              >
                <div>
                  {unlocked ? <LucideIcon name={badge.icon} size={17} /> : <Lock size={14} />}
                </div>
                <strong>{badge.name}</strong>
                <span>+{badge.xp} XP</span>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="profile-panel-pro">
        <div className="profile-panel-head">
          <div>
            <p><Zap size={13} /> Últimos movimientos</p>
            <h3>Actividad reciente</h3>
          </div>
        </div>
        <div className="profile-activity-list">
          {activityLog.map((item, index) => (
            <motion.article
              key={item.action}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.43 + index * 0.06 }}
              className="profile-activity-item"
              style={{ '--activity-tone': item.color }}
            >
              <div><LucideIcon name={item.iconName} size={15} /></div>
              <span><strong>{item.action}</strong><small>{item.time}</small></span>
              <em><Zap size={11} fill="currentColor" strokeWidth={0} />+{item.xp}</em>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
