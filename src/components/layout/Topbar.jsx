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
    <header className="app-topbar">
      <button
        className="app-icon-button lg:hidden"
        onClick={() => setMobileSidebar(true)}
        aria-label="Abrir navegación"
      >
        <Menu size={21} />
      </button>

      <h1 className="app-topbar-title">{title}</h1>

      <div className="app-topbar-actions">
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className={`app-icon-button is-notification ${notificationsOpen ? 'is-active' : ''}`}
            aria-label="Abrir notificaciones"
          >
            <Bell size={19} />
            <span />
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
            className="app-user-button"
            aria-label="Abrir perfil"
          >
            <div
              className="app-user-avatar"
              style={{ background: currentUser.avatarColor }}
            >
              {currentUser.avatar}
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p>
                {currentUser.name.split(' ')[0]}
              </p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleBadgeColors[currentUser.role]}`}>
                {roleLabels[currentUser.role]}
              </span>
            </div>
            <ChevronDown size={14} className="hidden md:block" />
          </button>
        )}

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="app-icon-button is-danger"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
