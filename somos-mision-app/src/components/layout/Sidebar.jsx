import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Trophy, Target, User, Settings,
  Globe, ChevronLeft, Zap, LogOut
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getLevelTitle, xpProgress } from '../../utils/helpers';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio'    },
  { to: '/hub',       icon: BookOpen,        label: 'Contenido' },
  { to: '/ranking',   icon: Trophy,          label: 'Ranking'   },
  { to: '/missions',  icon: Target,          label: 'Misiones'  },
  { to: '/profile',   icon: User,            label: 'Perfil'    },
];

const adminItems = [
  { to: '/admin', icon: Settings, label: 'Admin' },
];

export default function Sidebar() {
  const { currentUser, sidebarOpen, toggleSidebar, logout } = useAppStore();
  const navigate = useNavigate();
  const collapsed = !sidebarOpen;
  const progress  = currentUser ? xpProgress(currentUser.xp, currentUser.level) : 0;

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
      className="hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRight: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center h-16 px-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1A237E,#283593)', boxShadow: '0 4px 12px rgba(26,35,126,0.3)' }}>
            <Globe size={15} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}
                className="min-w-0 overflow-hidden"
              >
                <p className="font-bold text-[0.8125rem] leading-tight whitespace-nowrap" style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}>
                  Somos Misión
                </p>
                <p className="text-[0.6875rem] font-medium whitespace-nowrap" style={{ color: '#6E6E73' }}>Colombia · IPUC</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="ml-auto p-1.5 rounded-lg transition"
              style={{ color: '#AEAEB2' }}
              whileHover={{ background: 'rgba(0,0,0,0.05)', color: '#1D1D1F' }}
            >
              <ChevronLeft size={16} />
            </motion.button>
          )}
        </AnimatePresence>
        {collapsed && (
          <button onClick={toggleSidebar}
            className="mx-auto p-1.5 rounded-lg"
            style={{ color: '#AEAEB2' }}>
            <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }, i) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isActive ? 'rgba(26,35,126,0.08)' : 'transparent',
                  color: isActive ? '#1A237E' : '#6E6E73',
                }}
                whileHover={{ background: isActive ? 'rgba(26,35,126,0.10)' : 'rgba(0,0,0,0.04)', color: '#1D1D1F' }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      style={{ fontWeight: isActive ? 600 : 500 }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1A237E' }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}

        {currentUser?.role === 'admin' && (
          <>
            <div className="mx-2 my-2" style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}>
                {({ isActive }) => (
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                    style={{ background: isActive ? 'rgba(26,35,126,0.08)' : 'transparent', color: isActive ? '#1A237E' : '#6E6E73' }}
                  >
                    <Icon size={17} strokeWidth={1.8} className="flex-shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-sm font-medium whitespace-nowrap">{label}</motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* ── User card ────────────────────────────────────────────────── */}
      {currentUser && (
        <div className="px-2 pb-4 flex-shrink-0">
          <div className="mx-0 my-1" style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-3 px-3 py-3 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.03)' }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
                    style={{ background: currentUser.avatarColor }}>
                    {currentUser.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1D1D1F' }}>
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <div className="flex items-center gap-1">
                      <Zap size={10} style={{ color: '#D4AF37' }} />
                      <span className="text-xs font-medium" style={{ color: '#D4AF37' }}>{currentUser.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="p-1.5 rounded-lg transition" style={{ color: '#AEAEB2' }}
                    title="Cerrar sesión"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
                <div className="track">
                  <motion.div className="fill-blue" initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.3 }} />
                </div>
                <p className="text-[0.6875rem] mt-1.5" style={{ color: '#AEAEB2' }}>
                  Nivel {currentUser.level} — {getLevelTitle(currentUser.level)}
                </p>
              </motion.div>
            ) : (
              <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-3 flex justify-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: currentUser.avatarColor }}>
                  {currentUser.avatar}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.aside>
  );
}
