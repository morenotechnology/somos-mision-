import React from 'react';
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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-[#E2E8F0]">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all
               ${isActive ? 'text-[#1A237E]' : 'text-[#94A3B8]'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition ${isActive ? 'bg-[#1A237E]/10' : ''}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[9px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
