import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import NotificationPanel from '../common/NotificationPanel';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/hub':       'Hub de Contenido',
  '/ranking':   'Ranking Nacional',
  '/missions':  'Misiones & Recompensas',
  '/profile':   'Mi Perfil',
  '/admin':     'Panel Admin',
};

const roleLabels = { admin: 'Administrador', pastor: 'Pastor', multiplicador: 'Multiplicador' };
const roleBadgeColors = {
  admin:         'bg-red-100 text-red-700',
  pastor:        'bg-purple-100 text-purple-700',
  multiplicador: 'bg-blue-100 text-[#1A237E]',
};

export default function Topbar() {
  const { currentUser, setMobileSidebar, logout, notificationsOpen, toggleNotifications } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Somos Misión';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden p-2 rounded-xl hover:bg-[#F5F7FA] transition"
        onClick={() => setMobileSidebar(true)}
      >
        <Menu size={20} className="text-[#475569]" />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-[15px] font-semibold text-[#0F172A]">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className={`relative p-2 rounded-xl transition ${notificationsOpen ? 'bg-[#F5F7FA]' : 'hover:bg-[#F5F7FA]'}`}
          >
            <Bell size={18} className="text-[#475569]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full" />
          </button>
          <NotificationPanel
            open={notificationsOpen}
            onClose={() => toggleNotifications()}
          />
        </div>

        {/* User pill */}
        {currentUser && (
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#F5F7FA] transition"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
              style={{ background: currentUser.avatarColor }}
            >
              {currentUser.avatar}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">
                {currentUser.name.split(' ')[0]}
              </p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleBadgeColors[currentUser.role]}`}>
                {roleLabels[currentUser.role]}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#94A3B8] hidden md:block" />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="p-2 rounded-xl hover:bg-red-50 transition group"
          title="Cerrar sesión"
        >
          <LogOut size={16} className="text-[#94A3B8] group-hover:text-red-500 transition" />
        </button>
      </div>
    </header>
  );
}
