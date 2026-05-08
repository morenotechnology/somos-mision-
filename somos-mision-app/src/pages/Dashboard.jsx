import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Share2, Zap, Target, BookOpen, Trophy,
  TrendingUp, Flame, LayoutDashboard, Shield, Star
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import StatCard from '../components/common/StatCard';
import MissionCard from '../components/missions/MissionCard';
import RankingCard from '../components/ranking/RankingCard';
import { globalMetrics, weeklyActivity, missions, users, badges } from '../data/mockData';
import { getLevelTitle, xpProgress, xpToNextLevel, formatNumber } from '../utils/helpers';
import { LucideIcon } from '../components/common/LucideIcon';

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

// ── Multiplicador Dashboard ────────────────────────────────────────────────
function MultiplicadorDash({ user }) {
  const navigate = useNavigate();
  const progress = xpProgress(user.xp, user.level);
  const dailyMissions = missions.filter((m) => m.type === 'daily').slice(0, 3);
  const top5 = [...users].sort((a, b) => b.xp - a.xp).slice(0, 5);
  const userBadges = badges.filter((b) => user.badges.includes(b.id));

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 md:p-8 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0D1257 0%, #1A237E 60%, #283593 100%)',
        }}
      >
        {/* Background pattern image */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/hero-pattern.png)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.35,
          }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(13,18,87,0.7) 0%, rgba(26,35,126,0.5) 100%)' }} />

        <div className="relative">
          <p className="text-white/60 text-sm mb-1">{greet()}, {user.name.split(' ')[0]}</p>
          <h2 className="text-2xl md:text-3xl font-black mb-4">Tu misión te espera</h2>

          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <p className="text-[#D4AF37] text-2xl font-black">{user.xp.toLocaleString()}</p>
              <p className="text-white/50 text-xs">XP Total</p>
            </div>
            <div>
              <p className="text-white text-2xl font-black">Nv. {user.level}</p>
              <p className="text-white/50 text-xs">{getLevelTitle(user.level)}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-white text-2xl font-black">{user.streak}</p>
              <Flame size={18} className="text-orange-400" />
              <p className="text-white/50 text-xs mt-2">días</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-white/50 mb-1.5">
              <span>Nivel {user.level}</span>
              <span>{Math.round(progress)}% → Nivel {user.level + 1}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #D4AF37, #F5E27A)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Share2} label="Compartidos"  value={user.shared}            color="#1A237E" delay={0.10} />
        <StatCard icon={Target} label="Misiones"     value={user.missionsCompleted} color="#D4AF37" delay={0.15} />
        <StatCard icon={Trophy} label="Insignias"    value={userBadges.length}       color="#5C1800" delay={0.20} />
        <StatCard icon={Flame}  label="Racha (días)" value={user.streak}             color="#E65100" delay={0.25} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily missions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0F172A]">Misiones de hoy</h3>
            <button onClick={() => navigate('/missions')}
              className="text-xs text-[#1A237E] font-medium hover:underline">
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            {dailyMissions.map((m, i) => <MissionCard key={m.id} mission={m} delay={i * 0.08} />)}
          </div>
        </div>

        {/* Ranking snapshot */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0F172A]">Ranking nacional</h3>
            <button onClick={() => navigate('/ranking')}
              className="text-xs text-[#1A237E] font-medium hover:underline">
              Ver completo →
            </button>
          </div>
          <div className="space-y-2">
            {top5.map((u, i) => <RankingCard key={u.id} user={u} position={i + 1} delay={i * 0.06} />)}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#0F172A]">Mis insignias</h3>
          <span className="text-xs text-[#94A3B8]">{userBadges.length} desbloqueadas</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {userBadges.map((b) => (
            <motion.div
              key={b.id}
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl border border-[#E2E8F0] hover:border-[#D4AF37] transition cursor-pointer"
              title={b.description}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${b.color}20` }}>
                <LucideIcon name={b.icon} size={16} style={{ color: b.color }} />
              </div>
              <span className="text-[10px] font-semibold text-[#475569] text-center">{b.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Pastor Dashboard ───────────────────────────────────────────────────────
function PastorDash({ user }) {
  const regionUsers = users.filter((u) => u.region === user.region && u.role === 'multiplicador');
  const topRegion   = [...regionUsers].sort((a, b) => b.xp - a.xp).slice(0, 3);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-[#1A237E]" />
          <h2 className="text-2xl font-black text-[#0F172A]">Panel Pastoral</h2>
        </div>
        <p className="text-[#475569] text-sm">Monitorea tu región y equipo.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}  label="Multiplicadores" value={regionUsers.length}                                             color="#1A237E" delay={0.05} />
        <StatCard icon={Zap}    label="XP Regional"     value={formatNumber(regionUsers.reduce((s, u) => s + u.xp, 0))}       color="#D4AF37" delay={0.10} />
        <StatCard icon={Share2} label="Compartidos"     value={regionUsers.reduce((s, u) => s + u.shared, 0)}                  color="#5C1800" delay={0.15} />
        <StatCard icon={Target} label="Misiones"        value={regionUsers.reduce((s, u) => s + u.missionsCompleted, 0)}       color="#2E7D32" delay={0.20} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold text-[#0F172A] mb-4">Top de tu región</h3>
          <div className="space-y-2">
            {topRegion.map((u, i) => <RankingCard key={u.id} user={u} position={i + 1} delay={i * 0.08} />)}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-[#0F172A] mb-4">Actividad semanal</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="pshareGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1A237E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A237E" stopOpacity={0} />
                </linearGradient>
              </defs>
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

// ── Admin Dashboard ────────────────────────────────────────────────────────
function AdminDash() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard size={20} className="text-[#1A237E]" />
          <h2 className="text-2xl font-black text-[#0F172A]">Dashboard Nacional</h2>
        </div>
        <p className="text-[#475569] text-sm">Vista general de toda la red.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}   label="Total usuarios"  value={formatNumber(globalMetrics.totalEmbajadores)}      color="#1A237E" delay={0.05} />
        <StatCard icon={Share2}  label="Compartidos"     value={formatNumber(globalMetrics.contenidosCompartidos)} color="#D4AF37" delay={0.10} />
        <StatCard icon={BookOpen}label="Contenidos"      value={globalMetrics.contenidosPublicados}                color="#5C1800" delay={0.15} />
        <StatCard icon={Zap}     label="XP generado"     value={formatNumber(globalMetrics.xpGenerado)}           color="#2E7D32" delay={0.20} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold text-[#0F172A] mb-4">Actividad semanal — Compartidos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1A237E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1A237E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="shares" stroke="#1A237E" strokeWidth={2.5} fill="url(#actGrad)" name="Compartidos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-[#0F172A] mb-4">XP generado por día</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivity} barSize={24}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatNumber(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="xp" fill="#D4AF37" radius={[6, 6, 0, 0]} name="XP" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#0F172A]">Top embajadores nacionales</h3>
          <div className="flex items-center gap-1 text-[#D4AF37]">
            <Star size={13} fill="#D4AF37" />
            <span className="text-xs font-bold text-[#8B6914]">Hall de Honor</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {[...users].sort((a, b) => b.xp - a.xp).slice(0, 6).map((u, i) => (
            <RankingCard key={u.id} user={u} position={i + 1} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useAppStore();
  if (!currentUser) return null;
  return (
    <div>
      {currentUser.role === 'multiplicador' && <MultiplicadorDash user={currentUser} />}
      {currentUser.role === 'pastor'        && <PastorDash        user={currentUser} />}
      {currentUser.role === 'admin'         && <AdminDash />}
    </div>
  );
}
