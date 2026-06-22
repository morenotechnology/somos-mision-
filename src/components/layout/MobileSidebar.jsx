import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, LayoutDashboard, BookOpen, Trophy, Target, User, Settings, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import BrandLogo from '../common/BrandLogo';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hub',       icon: BookOpen,        label: 'Hub de Contenido' },
  { to: '/ranking',   icon: Trophy,          label: 'Ranking' },
  { to: '/missions',  icon: Target,          label: 'Misiones' },
  { to: '/profile',   icon: User,            label: 'Mi Perfil' },
];

export default function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebar, currentUser } = useAppStore();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebar(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-72 bg-[#0D1257] z-50 lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-9 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-lg">
                  <BrandLogo decorative />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Misiones Nacionales</p>
                  <p className="text-[#D4AF37] text-xs">Colombia</p>
                </div>
              </div>
              <button onClick={() => setMobileSidebar(false)} className="p-2 rounded-xl hover:bg-white/10 transition">
                <X size={18} className="text-white/60" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileSidebar(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                     ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-white/60 hover:text-white hover:bg-white/5'}`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
              {currentUser?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileSidebar(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                     ${isActive ? 'bg-red-900/40 text-red-300' : 'text-white/60 hover:text-white hover:bg-white/5'}`
                  }
                >
                  <Settings size={18} />
                  Admin
                </NavLink>
              )}
            </nav>

            {/* User card */}
            {currentUser && (
              <div className="px-4 pb-6 pt-3 border-t border-white/10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: currentUser.avatarColor }}>
                    {currentUser.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{currentUser.name.split(' ').slice(0, 2).join(' ')}</p>
                    <div className="flex items-center gap-1">
                      <Zap size={11} className="text-[#D4AF37]" />
                      <span className="text-[#D4AF37] text-xs font-bold">{currentUser.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
