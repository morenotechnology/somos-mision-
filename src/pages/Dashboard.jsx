import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Share2, Zap, Target, BookOpen, Trophy, Flame, LayoutDashboard, Shield, Star, ArrowRight, MapPin, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { useAppStore } from '../store/useAppStore';
import StatCard from '../components/common/StatCard';
import MissionCard from '../components/missions/MissionCard';
import RankingCard from '../components/ranking/RankingCard';
import { getLevelTitle, xpProgress, formatNumber } from '../utils/helpers';
import { LucideIcon } from '../components/common/LucideIcon';

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

function MultiplicadorDash({ user, weeklyActivity = [], missions = [], topUsers = [], badges = [] }) {
  const navigate = useNavigate();
  const progress = xpProgress(user.xp, user.level);
  const dailyMissions = missions.filter((mission) => mission.type === 'daily').slice(0, 3);

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-hero-card">
        <div className="dashboard-hero-pattern" />
        <div className="dashboard-hero-content">
          <div>
            <p className="dashboard-hero-greeting">{greet()}, {user.name.split(' ')[0]}</p>
            <h2>Tu misión te espera</h2>
          </div>
          <div className="dashboard-hero-metrics">
            <div><strong className="is-gold">{user.xp.toLocaleString()}</strong><span>XP Total</span></div>
            <div><strong>Nv. {user.level}</strong><span>{getLevelTitle(user.level)}</span></div>
            <div><strong className="dashboard-streak">{user.streak}<Flame size={19} /></strong><span>días de racha</span></div>
          </div>
          <div className="dashboard-hero-progress">
            <div><span>Nivel {user.level}</span><span>{Math.round(progress)}% · Nivel {Math.min(user.level + 1, 10)}</span></div>
            <div className="dashboard-progress-track">
              <motion.div className="dashboard-progress-fill" style={{ background: 'linear-gradient(90deg, #D4AF37, #F5E27A)' }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.3 }} />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="dashboard-stat-grid">
        <StatCard icon={Share2} label="Compartidos" value={user.shared} color="#1A237E" delay={0.10} />
        <StatCard icon={Target} label="Misiones" value={user.missionsCompleted} color="#D4AF37" delay={0.15} />
        <StatCard icon={Trophy} label="Insignias" value={badges.length} color="#5C1800" delay={0.20} />
        <StatCard icon={Flame} label="Racha (días)" value={user.streak} color="#E65100" delay={0.25} />
      </div>

      <div className="dashboard-content-grid">
        <div>
          <div className="dashboard-section-header">
            <div><p>Acción diaria</p><h3>Misiones de hoy</h3></div>
            <button onClick={() => navigate('/missions')} className="dashboard-link-button">Ver todas <ArrowRight size={15} /></button>
          </div>
          <div className="dashboard-list">{dailyMissions.map((mission, index) => <MissionCard key={mission.id} mission={mission} delay={index * 0.08} />)}</div>
        </div>

        <div>
          <div className="dashboard-section-header">
            <div><p>Muro de honor</p><h3>Ranking nacional</h3></div>
            <button onClick={() => navigate('/ranking')} className="dashboard-link-button">Ver completo <ArrowRight size={15} /></button>
          </div>
          <div className="dashboard-list is-compact">{topUsers.map((rankingUser, index) => <RankingCard key={rankingUser.id} user={rankingUser} position={index + 1} delay={index * 0.06} />)}</div>
        </div>
      </div>

      <div className="dashboard-badges-card">
        <div className="dashboard-section-header is-tight"><div><p>Reconocimientos</p><h3>Mis insignias</h3></div><span>{badges.length} desbloqueadas</span></div>
        <div className="dashboard-badge-list">
          {badges.map((badge) => (
            <motion.div key={badge.id} whileHover={{ scale: 1.1, y: -2 }} className="dashboard-badge-item" title={badge.description}>
              <div style={{ background: `${badge.color}20` }}><LucideIcon name={badge.icon} size={16} style={{ color: badge.color }} /></div>
              <span>{badge.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-[#0F172A] mb-4">Impacto semanal</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyActivity}>
            <defs><linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A237E" stopOpacity={0.18} /><stop offset="95%" stopColor="#1A237E" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Area type="monotone" dataKey="shares" stroke="#1A237E" strokeWidth={2.5} fill="url(#dashGrad)" name="Compartidos" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PastorDash({ user, weeklyActivity = [], topUsers = [], regionalUsers = [], regionActivity = [] }) {
  const fallbackUsers = topUsers.filter((row) => row.region === user.region);
  const regionUsers = (regionalUsers.length ? regionalUsers : fallbackUsers).filter(Boolean);
  const displayUsers = regionUsers.length ? regionUsers : [user];
  const topRegion = [...displayUsers].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 4);
  const totalXp = displayUsers.reduce((sum, row) => sum + (row.xp || 0), 0);
  const totalShared = displayUsers.reduce((sum, row) => sum + (row.shared || 0), 0);
  const totalMissions = displayUsers.reduce((sum, row) => sum + (row.missionsCompleted || 0), 0);
  const regionName = user.regionName || 'tu región';
  const regionMetric = regionActivity.find((row) => row.name?.toLowerCase() === regionName.toLowerCase());
  const activeRegionUsers = regionMetric?.embajadores || displayUsers.length;
  const activeShares = regionMetric?.compartidos ?? totalShared;

  return (
    <div className="dashboard-page pastor-dashboard">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pastor-hero-card">
        <div className="pastor-hero-map" aria-hidden="true" />
        <div className="pastor-hero-copy">
          <span><Shield size={16} /> Pastor/Directivo</span>
          <h2>Panel regional de {regionName}</h2>
          <p>Monitorea multiplicadores, contenidos compartidos y avance misionero de tu territorio desde una vista clara.</p>
        </div>
        <div className="pastor-hero-region">
          <MapPin size={18} />
          <strong>{regionName}</strong>
          <small>{user.districtName || 'Distrito no asignado'} · {user.congregation || 'Congregación no asignada'}</small>
        </div>
      </motion.div>

      <div className="dashboard-stat-grid">
        <StatCard icon={Users} label="Multiplicadores" value={activeRegionUsers} color="#1A237E" delay={0.05} />
        <StatCard icon={Zap} label="XP Regional" value={formatNumber(totalXp)} color="#D4AF37" delay={0.10} />
        <StatCard icon={Share2} label="Compartidos" value={formatNumber(activeShares)} color="#5C1800" delay={0.15} />
        <StatCard icon={Target} label="Misiones" value={totalMissions} color="#2E7D32" delay={0.20} />
      </div>

      <div className="dashboard-content-grid">
        <div className="pastor-panel-card">
          <div className="dashboard-section-header">
            <div><p>Muro regional</p><h3>Top de {regionName}</h3></div>
          </div>
          <div className="dashboard-list is-compact">
            {topRegion.map((rankingUser, index) => <RankingCard key={rankingUser.id} user={rankingUser} position={index + 1} delay={index * 0.08} />)}
          </div>
          {!regionUsers.length && (
            <p className="pastor-empty-note">Cuando más multiplicadores de tu región se registren, este ranking se actualizará automáticamente.</p>
          )}
        </div>
        <div className="pastor-panel-card">
          <div className="dashboard-section-header">
            <div><p>Actividad</p><h3>Señal semanal</h3></div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyActivity}>
              <defs><linearGradient id="pshareGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A237E" stopOpacity={0.15} /><stop offset="95%" stopColor="#1A237E" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="shares" stroke="#1A237E" strokeWidth={2} fill="url(#pshareGrad)" name="Compartidos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AdminDash({ metrics = {}, weeklyActivity = [], regionActivity = [], topUsers = [] }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1"><LayoutDashboard size={20} className="text-[#1A237E]" /><h2 className="text-2xl font-black text-[#0F172A]">Dashboard Nacional</h2></div>
        <p className="text-[#475569] text-sm">Vista general de toda la red.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total usuarios" value={formatNumber(metrics.totalEmbajadores)} color="#1A237E" delay={0.05} />
        <StatCard icon={Share2} label="Compartidos" value={formatNumber(metrics.contenidosCompartidos)} color="#D4AF37" delay={0.10} />
        <StatCard icon={BookOpen} label="Contenidos" value={metrics.contenidosPublicados} color="#5C1800" delay={0.15} />
        <StatCard icon={Zap} label="XP generado" value={formatNumber(metrics.xpGenerado)} color="#2E7D32" delay={0.20} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold text-[#0F172A] mb-4">Actividad semanal — Compartidos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyActivity}>
              <defs><linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A237E" stopOpacity={0.2} /><stop offset="95%" stopColor="#1A237E" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="shares" stroke="#1A237E" strokeWidth={2.5} fill="url(#actGrad)" name="Compartidos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-[#0F172A] mb-4">Actividad por región</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionActivity} barSize={24}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(value) => formatNumber(value)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="compartidos" fill="#D4AF37" radius={[6, 6, 0, 0]} name="Compartidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-[#0F172A]">Top multiplicadores nacionales</h3><div className="flex items-center gap-1 text-[#D4AF37]"><Star size={13} fill="#D4AF37" /><span className="text-xs font-bold text-[#8B6914]">Muro de Honor</span></div></div>
        <div className="grid md:grid-cols-2 gap-2">{topUsers.map((rankingUser, index) => <RankingCard key={rankingUser.id} user={rankingUser} position={index + 1} delay={index * 0.04} />)}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, loginFromApi } = useAppStore();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    api.dashboard.get().then((data) => {
      if (!active) return;
      setPayload(data);
      loginFromApi({ user: data.user, sharedContentIds: data.sharedContentIds, completedMissionIds: data.completedMissionIds });
    }).catch((err) => {
      if (!active) return;
      setError(err?.message || 'No se pudo cargar el dashboard');
      setPayload(null);
    });
    return () => { active = false; };
  }, [loginFromApi, reloadKey]);

  if (!currentUser || !payload) {
    if (error) {
      return (
        <div className="dashboard-error-card">
          <div>
            <span><RefreshCw size={16} /> Dashboard</span>
            <h2>No pudimos cargar esta vista</h2>
            <p>{error}</p>
          </div>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
            Reintentar <RefreshCw size={15} />
          </button>
        </div>
      );
    }
    return <div className="card p-8 text-sm text-[#475569]">Cargando dashboard...</div>;
  }

  const dashboardUser = payload.user || currentUser;
  const role = String(dashboardUser.role || '').toLowerCase();

  if (role === 'multiplicador') return <MultiplicadorDash user={dashboardUser} weeklyActivity={payload.weeklyActivity} missions={payload.missions} topUsers={payload.topUsers} badges={payload.badges} />;
  if (role.includes('pastor') || role.includes('directivo')) {
    return (
      <PastorDash
        user={dashboardUser}
        weeklyActivity={payload.weeklyActivity}
        topUsers={payload.topUsers}
        regionalUsers={payload.regionalUsers}
        regionActivity={payload.regionActivity}
      />
    );
  }
  return <AdminDash metrics={payload.metrics} weeklyActivity={payload.weeklyActivity} regionActivity={payload.regionActivity} topUsers={payload.topUsers} />;
}
