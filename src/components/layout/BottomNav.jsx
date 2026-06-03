import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Trophy, Target, User } from 'lucide-react';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/hub',       icon: BookOpen,        label: 'Contenido' },
  { to: '/ranking',   icon: Trophy,          label: 'Ranking' },
  { to: '/missions',  icon: Target,          label: 'Misiones' },
  { to: '/profile',   icon: User,            label: 'Perfil' },
];

export default function BottomNav() {
  return (
    <nav className="app-bottom-nav">
      <div className="app-bottom-nav-inner">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `app-bottom-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={isActive ? 'is-active' : ''}>
                  <Icon size={18} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
